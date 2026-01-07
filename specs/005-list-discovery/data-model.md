# Data Model: List Discovery

**Feature**: 005-list-discovery
**Date**: 2026-01-05

## Overview

This feature does **NOT** introduce new database entities. It leverages the existing `Task` model from Spec 004 and adds filtering/sorting query capabilities.

## Existing Entities (Reference)

### Task

**Source**: `backend/app/models/task.py` (defined in Spec 004)

**Attributes**:
- `id` (int, primary key)
- `user_id` (UUID, indexed) - For user isolation
- `title` (str, max 255) - Searchable field
- `description` (str, max 2000, optional) - Searchable field
- `is_completed` (bool, default False)
- `priority` (str, max 10, default "medium") - Filterable, sortable ("low", "medium", "high")
- `due_date` (datetime, optional) - Sortable, nullable
- `category` (str, max 100, optional) - Filterable
- `created_at` (datetime, indexed) - Default sort field
- `updated_at` (datetime)

**Indexes** (from Spec 004 migration `df1e7b8409fc`):
- `user_id` (for user isolation queries)
- `priority` (for priority filtering and sorting)
- `category` (for category filtering)
- `due_date` (for due date sorting)
- `created_at` (default sort, likely auto-indexed)

**No Schema Changes Required**: All necessary fields and indexes already exist.

## Client-Side State Models

### FilterState (TypeScript Interface)

**Purpose**: Represents the active filter configuration in the frontend.

**Location**: `frontend/types/filters.ts` (to be created)

**Definition**:
```typescript
export interface TaskFilters {
  search: string;           // Search query (maps to 'q' in URL)
  sortBy: 'created_at' | 'due_date' | 'priority';
  order: 'asc' | 'desc';
  priority: '' | 'low' | 'medium' | 'high';  // Empty string = no filter
  category: string;         // Empty string = no filter
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  sortBy: 'created_at',
  order: 'desc',
  priority: '',
  category: '',
};
```

**Validation Rules**:
- `sortBy`: Must be one of the allowed values
- `order`: Must be 'asc' or 'desc'
- `priority`: Must be empty or one of the valid priority levels
- `search`: Any string (sanitized on backend)

### SortOption (UI Presentation)

**Purpose**: Maps user-friendly sort labels to API parameters.

**Definition**:
```typescript
export interface SortOption {
  label: string;
  sortBy: TaskFilters['sortBy'];
  order: TaskFilters['order'];
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest', sortBy: 'created_at', order: 'desc' },
  { label: 'Oldest', sortBy: 'created_at', order: 'asc' },
  { label: 'Highest Priority', sortBy: 'priority', order: 'desc' },
  { label: 'Due Soon', sortBy: 'due_date', order: 'asc' },
];
```

## Data Flow

### Query Parameter Mapping

| UI State | URL Parameter | Backend Query Parameter | SQL Operation |
|----------|---------------|-------------------------|---------------|
| `search` | `?q=text` | `search` | `WHERE title ILIKE '%text%' OR description ILIKE '%text%'` |
| `sortBy` + `order` | `?sort_by=priority&order=desc` | `sort_by`, `order` | `ORDER BY CASE ... END DESC` |
| `priority` | `?priority=high` | `priority` | `WHERE priority = 'high'` |
| `category` | `?category=Work` | `category` | `WHERE category = 'Work'` |

### Backend Query Building Logic

**Priority Sorting Expression**:
```python
from sqlalchemy import case

priority_order_expr = case(
    (Task.priority == "high", 3),
    (Task.priority == "medium", 2),
    (Task.priority == "low", 1),
    else_=0
)
```

**NULL Handling**:
```python
from sqlmodel import col

# Due date ascending with nulls last
order_expr = col(Task.due_date).asc().nullslast()

# Priority descending (nulls treated as 0, appear last)
order_expr = priority_order_expr.desc()
```

## Validation and Constraints

### Backend Validation

**Query Parameter Validation** (using Pydantic):
```python
from typing import Literal, Optional
from pydantic import BaseModel, Field

class TaskQueryParams(BaseModel):
    search: Optional[str] = Field(None, max_length=255)
    sort_by: Literal["created_at", "due_date", "priority"] = "created_at"
    order: Literal["asc", "desc"] = "desc"
    priority: Optional[Literal["low", "medium", "high"]] = None
    category: Optional[str] = Field(None, max_length=100)
```

### Frontend Validation

**URL Parameter Parsing**:
- Invalid `sort_by` → default to `created_at`
- Invalid `order` → default to `desc`
- Invalid `priority` → ignore filter
- Excessively long search → truncate to 255 characters client-side

## State Transitions

### Filter Application Flow

```
[User modifies filter in UI]
    ↓
[Debounce (300ms for search only)]
    ↓
[Update URL via router.push]
    ↓
[React Query detects queryKey change]
    ↓
[Automatic refetch with new filters]
    ↓
[Backend applies WHERE + ORDER BY clauses]
    ↓
[Filtered/sorted tasks returned]
    ↓
[UI updates with new task list]
```

### URL Persistence Flow

```
[User applies filters: ?q=project&priority=high]
    ↓
[User bookmarks URL or shares link]
    ↓
[New user/session loads URL]
    ↓
[useSearchParams() reads query params]
    ↓
[Filters hydrated into state]
    ↓
[React Query fetches with filters]
    ↓
[UI renders filtered view]
```

## Performance Considerations

### Index Usage

**Optimal Query Pattern**:
```sql
-- Uses indexes efficiently
SELECT * FROM tasks
WHERE user_id = ?
  AND priority = 'high'        -- Index: priority
  AND category = 'Work'         -- Index: category
  AND (title ILIKE '%project%' OR description ILIKE '%project%')  -- Full-text scan (acceptable for 1000 tasks)
ORDER BY created_at DESC        -- Index: created_at
```

**Query Plan Expectations**:
- User isolation (`user_id`) uses index → fast
- Priority/category filters use indexes → fast
- Search uses sequential scan → acceptable for target scale (1000 tasks)
- Sort uses index → fast

**Future Optimization** (if needed):
- Full-text search index (PostgreSQL GIN) for `title` and `description`
- Composite index `(user_id, priority, created_at)` for common query pattern

## No Migration Required

**Confirmation**: All required database schema elements (fields and indexes) were added in Spec 004 migration `df1e7b8409fc_add_task_attributes_priority_due_date_`.

**Verification Command**:
```bash
# Check that indexes exist
cd backend
alembic history
# Verify migration df1e7b8409fc includes indexes on priority, category, due_date
```

## Summary

- **No new entities**: Feature uses existing Task model
- **Client-side state**: FilterState interface manages UI filter state
- **URL as source of truth**: Query parameters persist and restore filters
- **Indexes verified**: Spec 004 migration provides necessary database indexes
- **Performance**: Query pattern leverages indexes for sub-second response times at target scale (1000 tasks)
