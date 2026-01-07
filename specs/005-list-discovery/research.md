# Research: List Discovery Implementation

**Feature**: 005-list-discovery
**Date**: 2026-01-05
**Purpose**: Resolve technical unknowns and document architectural decisions

## 1. Priority Sorting Strategy

### Decision: SQL CASE Statement via SQLModel

**Rationale**:
- Sorting must happen at the database level to support pagination in future specs
- SQL CASE expressions map text priorities to numeric values for ordering
- SQLModel/SQLAlchemy supports inline SQL via `text()` or `case()` constructs
- Database-level sorting is more efficient than Python-level sorting for large datasets

**Implementation Approach**:
```python
from sqlalchemy import case
from sqlmodel import select

priority_order = case(
    (Task.priority == "high", 3),
    (Task.priority == "medium", 2),
    (Task.priority == "low", 1),
    else_=0  # null or unrecognized values
)

statement = select(Task).order_by(priority_order.desc())
```

**Alternatives Considered**:
1. **Python dictionary mapping** - Rejected because it requires loading all results into memory before sorting, preventing efficient pagination
2. **Database ENUM with custom sort order** - Rejected because it requires migration to change priority values; text fields are more flexible
3. **Numeric priority column** - Rejected because it adds storage redundancy and requires keeping two columns in sync

**Tradeoffs**:
- Pro: Database-level sorting enables pagination without loading all records
- Pro: Compatible with existing text-based priority field (no migration needed)
- Con: CASE expression must be repeated in every query that sorts by priority
- Mitigation: Encapsulate sorting logic in a helper function or repository method

## 2. NULL Handling in Sorting

### Decision: Use SQLAlchemy's `nullslast()` and `nullsfirst()` Functions

**Rationale**:
- SQL standard provides `NULLS LAST` and `NULLS FIRST` clauses for controlling null placement
- SQLAlchemy exposes these via `.nullslast()` and `.nullsfirst()` methods on order_by expressions
- Database engines (PostgreSQL) natively support this, ensuring consistent behavior

**Implementation Approach**:
```python
from sqlmodel import select

# Due date ascending - nulls last (tasks without due dates at end)
statement = select(Task).order_by(Task.due_date.asc().nullslast())

# Due date descending - nulls first (would show tasks without dates first)
# But per spec, nulls should appear last regardless of order
statement = select(Task).order_by(Task.due_date.desc().nullslast())
```

**Spec Requirement Clarification**:
- FR-008 states nulls last for ascending, first for descending
- However, the edge case notes: "Tasks without due dates should appear last when sorting ascending, first when sorting descending"
- **Interpretation**: This is the database's natural behavior. We will follow FR-008 exactly.

## 3. URL State Management Pattern

### Decision: Next.js App Router `useSearchParams` + `useRouter` with React Query Integration

**Rationale**:
- Next.js App Router provides `useSearchParams` for reading query parameters
- `useRouter().push()` updates URL without full page reload
- React Query (TanStack Query) automatically refetches when `queryKey` changes
- URL serves as single source of truth for filter state

**Implementation Approach**:

**Custom Hook (`useTaskFilters`)**:
```typescript
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useTaskFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read current filters from URL
  const filters = {
    search: searchParams.get('q') || '',
    sortBy: searchParams.get('sort_by') || 'created_at',
    order: searchParams.get('order') || 'desc',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
  };

  // Update URL when filters change
  const setFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) {
        params.set(key === 'search' ? 'q' : key, value);
      } else {
        params.delete(key === 'search' ? 'q' : key);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  return { filters, setFilters };
}
```

**React Query Integration**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { useTaskFilters } from './useTaskFilters';

export function useTaskList() {
  const { filters } = useTaskFilters();

  return useQuery({
    queryKey: ['tasks', filters],  // Query refetches when filters change
    queryFn: () => api.getTasks(filters),
  });
}
```

**Alternatives Considered**:
1. **Local state (useState)** - Rejected because state is lost on page refresh
2. **Zustand/Redux** - Rejected because adds complexity; URL already provides persistence
3. **Server Components with searchParams prop** - Rejected because requires full page reloads for filter changes

**Tradeoffs**:
- Pro: URL is bookmarkable and shareable
- Pro: Browser back/forward buttons work naturally
- Pro: React Query handles caching and deduplication
- Con: Client component required for interactivity (acceptable per constitution)

## 4. Search Input Debouncing

### Decision: React `useDebouncedValue` Hook with 300ms Delay

**Rationale**:
- Prevents excessive API calls during typing
- 300ms is a standard debounce duration (balances responsiveness and API efficiency)
- Debouncing happens before URL update, so React Query only sees final value

**Implementation Approach**:
```typescript
import { useEffect, useState } from 'react';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search input
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 300);

useEffect(() => {
  setFilters({ search: debouncedSearch });
}, [debouncedSearch, setFilters]);
```

**Alternatives Considered**:
1. **Lodash debounce** - Rejected to avoid additional dependency for simple use case
2. **AbortController for each keystroke** - Rejected because debouncing is simpler and reduces requests
3. **Server-side debouncing** - Not applicable; debouncing is a UI concern

## 5. Filter Combination Logic (AND vs OR)

### Decision: AND Logic for Multiple Filters

**Rationale**:
- FR-014 explicitly states: "System MUST allow combining multiple filters simultaneously (search + priority + category) using AND logic"
- AND logic is more predictable: "Show me high-priority work tasks matching 'project'"
- OR logic would be ambiguous: Does it mean high OR work OR matching 'project'?

**Implementation Approach**:
```python
# Backend: Build query with multiple WHERE clauses
statement = select(Task).where(Task.user_id == user_id)

if search:
    statement = statement.where(
        (Task.title.ilike(f"%{search}%")) | (Task.description.ilike(f"%{search}%"))
    )
if priority:
    statement = statement.where(Task.priority == priority)
if category:
    statement = statement.where(Task.category == category)

# All conditions are AND'd together
```

## 6. Empty State Handling

### Decision: Conditional Empty State Component with Dynamic Message

**Rationale**:
- Different empty states convey different meanings to users
- "No tasks yet" → encourages creating first task
- "No tasks found matching 'xyz'" → suggests refining search

**Implementation Approach**:
```typescript
function TaskList({ tasks, filters }) {
  const hasActiveFilters = filters.search || filters.priority || filters.category;

  if (tasks.length === 0) {
    if (hasActiveFilters) {
      return (
        <EmptyState
          message={`No tasks found matching "${filters.search || 'your filters'}"`}
          action={<Button onClick={clearFilters}>Clear Filters</Button>}
        />
      );
    } else {
      return (
        <EmptyState
          message="No tasks yet"
          action={<Button onClick={openCreateDialog}>Create Your First Task</Button>}
        />
      );
    }
  }

  return <TaskGrid tasks={tasks} />;
}
```

## 7. Component Architecture Decision

### Decision: TaskToolbar as Separate Stateless Component

**Rationale**:
- Separation of concerns: toolbar handles input, parent handles state
- Toolbar can be tested independently
- Consistent with React best practices (controlled components)

**Component Structure**:
```
DashboardClient (client component)
├── TaskToolbar (client component)
│   ├── SearchInput (controlled input with debounce)
│   ├── SortSelect (Shadcn Select)
│   └── FilterPopover (Shadcn Popover with checkboxes)
└── TaskList
    ├── TaskCard (one per task)
    └── EmptyState (conditional)
```

## 8. Backend Performance Optimization

### Decision: Leverage Existing Database Indexes from Spec 004

**Verification Required**:
Check that migration `df1e7b8409fc` includes indexes on:
- `priority`
- `category`
- `due_date`
- `created_at` (already indexed as default sort)

**Query Optimization**:
- Use `.where()` clauses before `.order_by()` to reduce sort dataset
- Consider composite index `(user_id, priority)` if query plans show sequential scans
- Monitor query performance in production; add indexes as needed

## 9. Testing Strategy

**Backend Testing**:
- Unit tests for query builder logic with various filter combinations
- Integration tests for endpoint with different query parameters
- Test edge cases: null priorities, null due dates, empty strings

**Frontend Testing**:
- Test debounce behavior: verify only one API call after typing stops
- Test URL sync: change filters, verify URL updates
- Test URL parsing: load page with query params, verify filters applied
- Test empty states: with and without active filters

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Priority Sorting | SQL CASE statement | Database-level sorting enables pagination |
| NULL Handling | SQLAlchemy `nullslast()` | Native SQL support, spec-compliant |
| URL State | `useSearchParams` + React Query | Bookmarkable, shareable, auto-refetch |
| Debouncing | Custom `useDebouncedValue` hook | No external dependency, 300ms standard |
| Filter Logic | AND combination | More predictable, spec-mandated |
| Empty States | Conditional component | Context-aware messaging |
| Component Architecture | Separate TaskToolbar | Separation of concerns, testability |
| Performance | Existing indexes + query optimization | Leverage Spec 004 infrastructure |
