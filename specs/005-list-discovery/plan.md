# Implementation Plan: Task List Discovery (Search, Sort, Filter)

**Branch**: `005-list-discovery` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-list-discovery/spec.md`

## Summary

Implement server-side search, filtering, and sorting for the task list to enable users to efficiently discover and organize tasks. This feature extends the existing `GET /api/tasks` endpoint with optional query parameters (`search`, `sort_by`, `order`, `priority`, `category`) and adds a `TaskToolbar` component in the frontend that syncs filter state with URL query parameters. URL persistence enables bookmarking filtered views. All filtering/sorting happens at the database level using SQLModel/SQLAlchemy to ensure scalability.

**Key Technical Decisions** (from research.md):
- **Priority Sorting**: SQL CASE statement mapping text values to numeric (high=3, medium=2, low=1) for database-level sorting
- **NULL Handling**: SQLAlchemy `nullslast()` for due_date and priority sorts
- **URL State**: Next.js `useSearchParams` + React Query with filters in `queryKey` for automatic refetching
- **Debouncing**: Custom hook with 300ms delay on search input
- **Filter Logic**: AND combination of multiple filters (search + priority + category)

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript/ES2022 (Frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, SQLAlchemy, Neon PostgreSQL
- Frontend: Next.js 16+ (App Router), React Query (TanStack Query), ShadcnUI
**Storage**: Neon Serverless PostgreSQL (no schema changes; uses existing indexes from Spec 004)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (Linux server for backend, browser for frontend)
**Project Type**: Web (monorepo: `/backend` and `/frontend`)
**Performance Goals**:
- Search returns results in < 1 second for lists up to 1000 tasks (SC-002)
- Sort operations complete in < 1 second (SC-003)
- 70% reduction in API calls via debouncing (SC-006)
**Constraints**:
- Server-side filtering/sorting (no client-side filtering)
- Backward compatible (existing API behavior preserved)
- URL as single source of truth for filter state
**Scale/Scope**:
- Target: 1000 tasks per user
- 5 query parameters (search, sort_by, order, priority, category)
- 4 UI components (TaskToolbar, SearchInput, SortSelect, FilterPopover)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Spec-First Development** | ✅ PASS | Spec `specs/005-list-discovery/spec.md` exists with 15 functional requirements |
| **II. Monorepo Discipline** | ✅ PASS | Backend changes in `/backend/app/api/routes/tasks.py`, frontend in `/frontend` |
| **III. Technology Stack Constraints** | ✅ PASS | Uses FastAPI (async), SQLModel, Next.js 16+ Server/Client Components, Neon PostgreSQL |
| **IV. Agentic Dev Stack Workflow** | ✅ PASS | Following spec → plan → tasks workflow |
| **V. Authentication Protocol** | ✅ PASS | All queries scoped by `user_id` (JWT verification via `get_current_user` dependency) |
| **VI. Documentation & File Standards** | ✅ PASS | Contracts in `contracts/api.md`, data model in `data-model.md`, quickstart in `quickstart.md` |
| **VII. Error Handling Strategy** | ✅ PASS | Backend returns 401 (auth), 422 (validation). Frontend uses React Query error handling |

**Verdict**: All gates PASS. No violations. Proceed to implementation.

### Post-Design Check (After Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Spec-First Development** | ✅ PASS | All implementation references spec requirements (FR-001 through FR-015) |
| **II. Monorepo Discipline** | ✅ PASS | No cross-contamination; frontend and backend clearly separated |
| **III. Technology Stack Constraints** | ✅ PASS | SQL CASE via SQLAlchemy, React Query for state management, ShadcnUI for UI |
| **IV. Agentic Dev Stack Workflow** | ✅ PASS | Research complete, data model defined, contracts specified |
| **V. Authentication Protocol** | ✅ PASS | Query builder starts with `.where(Task.user_id == user_id)` |
| **VI. Documentation & File Standards** | ✅ PASS | Comprehensive documentation in research.md, data-model.md, contracts/api.md, quickstart.md |
| **VII. Error Handling Strategy** | ✅ PASS | FastAPI validation via Query params, frontend handles empty states and errors |

**Verdict**: All gates PASS. No violations introduced during design. Ready for task breakdown.

## Project Structure

### Documentation (this feature)

```text
specs/005-list-discovery/
├── spec.md              # Feature requirements (from /sp.specify)
├── plan.md              # This file (from /sp.plan)
├── research.md          # Phase 0 output: technical decisions
├── data-model.md        # Phase 1 output: data entities (no new entities; references Task)
├── quickstart.md        # Phase 1 output: implementation guide
├── contracts/
│   └── api.md           # API contract for GET /api/tasks with query params
└── checklists/
    └── requirements.md  # Quality validation checklist (from /sp.specify)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   └── tasks.py          # MODIFY: Extend list_tasks with query params
│   │   └── dependencies.py       # EXISTING: get_current_user (no changes)
│   ├── models/
│   │   └── task.py               # EXISTING: Task model (no changes)
│   └── core/
│       └── database.py           # EXISTING: DB session (no changes)
├── alembic/
│   └── versions/
│       └── df1e7b8409fc_*.py     # EXISTING: Indexes from Spec 004 (verify only)
└── tests/
    └── test_tasks.py             # CREATE: Unit tests for filtering/sorting

frontend/
├── app/
│   └── dashboard/
│       ├── page.tsx              # EXISTING: Server component (no changes)
│       └── DashboardClient.tsx   # MODIFY: Integrate TaskToolbar, handle empty states
├── components/
│   ├── TaskToolbar.tsx           # CREATE: Search, sort, filter controls
│   ├── TaskCard.tsx              # EXISTING: Display individual task (no changes)
│   ├── CreateTaskForm.tsx        # EXISTING: (no changes)
│   ├── EmptyState.tsx            # CREATE: Conditional empty state component
│   └── ui/
│       ├── input.tsx             # EXISTING: Shadcn Input (already installed)
│       ├── select.tsx            # CREATE/VERIFY: Shadcn Select component
│       ├── popover.tsx           # CREATE/VERIFY: Shadcn Popover component
│       └── button.tsx            # EXISTING: Shadcn Button (already installed)
├── hooks/
│   ├── useTaskFilters.ts         # CREATE: URL state management hook
│   ├── useTaskList.ts            # CREATE: React Query hook for fetching tasks
│   └── useDebounced.ts           # CREATE: Debounce utility hook
├── types/
│   ├── filters.ts                # CREATE: TaskFilters interface, SORT_OPTIONS
│   └── task.ts                   # EXISTING: Task type (verify includes new fields)
├── lib/
│   └── api.ts                    # MODIFY: Update getTasks to accept filter params
└── tests/
    └── components/
        └── TaskToolbar.test.tsx  # CREATE: Component tests
```

**Structure Decision**: Web application structure (Option 2) selected. Backend and frontend are separate directories in a monorepo. Frontend uses Next.js App Router with Server Components (page.tsx) and Client Components (DashboardClient.tsx, TaskToolbar.tsx). Backend uses FastAPI with routes, models, and core modules.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

**No violations detected.** All implementation choices align with constitution principles.

## Architecture Decisions

### 1. Server-Side Filtering and Sorting

**Decision**: All filtering and sorting logic implemented in the backend using SQL queries.

**Rationale**:
- Spec requirement FR-006: "System MUST perform all filtering and sorting operations on the server side to ensure scalability with large datasets"
- Enables pagination in future specs without re-architecture
- Leverages database indexes for performance (existing indexes from Spec 004)
- Reduces client-side memory consumption and processing

**Alternatives Considered**:
- **Client-side filtering**: Rejected due to scalability concerns (requires loading all tasks into browser memory)
- **Hybrid approach**: Rejected for complexity; clear separation is simpler

**Implementation Approach**:
- Backend: Use SQLModel `select()` with dynamic `.where()` and `.order_by()` clauses
- Frontend: Pass filter parameters as URL query params, backend interprets them

---

### 2. Priority Sorting via SQL CASE Statement

**Decision**: Map text priorities ("high", "medium", "low") to numeric values using SQL CASE expressions for sorting.

**Rationale**:
- Database-level sorting is required for future pagination support
- SQL CASE expressions provide inline transformation without additional columns
- SQLAlchemy `case()` function provides clean abstraction

**Alternatives Considered**:
1. **Numeric priority column**: Rejected due to data redundancy and synchronization overhead
2. **Python-level sorting**: Rejected because it requires loading all tasks into memory
3. **Database ENUM with custom sort**: Rejected due to inflexibility (requires migration to change values)

**Implementation**:
```python
from sqlalchemy import case

priority_order = case(
    (Task.priority == "high", 3),
    (Task.priority == "medium", 2),
    (Task.priority == "low", 1),
    else_=0
)
statement = statement.order_by(priority_order.desc())
```

**Tradeoffs**:
- Pro: No schema changes required
- Pro: Compatible with existing data
- Con: CASE expression repeated in every query (mitigated by encapsulation in helper function)

---

### 3. URL as Single Source of Truth for Filter State

**Decision**: Store filter state in URL query parameters; use Next.js `useSearchParams` to read and `router.push` to update.

**Rationale**:
- Spec requirement FR-011: "System MUST encode all active filters in URL query parameters"
- Enables bookmarking and sharing filtered views (FR-012, User Story 4)
- Browser back/forward buttons work naturally
- State persists across page reloads

**Alternatives Considered**:
1. **Local state (useState)**: Rejected because state is lost on page reload
2. **Global state (Zustand/Redux)**: Rejected for unnecessary complexity; URL already provides persistence
3. **Server Components with searchParams prop**: Rejected because it requires full page reloads for every filter change (poor UX)

**Implementation**:
- Custom hook `useTaskFilters()` reads `useSearchParams()` and exposes `setFilters()` function
- `setFilters()` uses `router.push()` with query params (no page reload)
- React Query hook uses `filters` object in `queryKey`, triggering automatic refetch on URL changes

**Tradeoffs**:
- Pro: Declarative, testable, shareable
- Con: Requires client component for interactivity (acceptable per constitution)

---

### 4. Debouncing Search Input (300ms)

**Decision**: Debounce search input changes for 300ms before updating URL and triggering API call.

**Rationale**:
- Spec requirement FR-010: "Search input in the user interface MUST be debounced with a 300ms delay"
- Success criteria SC-006: Reduce API calls by 70% compared to querying on every keystroke
- 300ms is industry standard (balances responsiveness and efficiency)

**Implementation**:
- Custom `useDebounced<T>` hook wraps search input value
- Debounced value triggers `useEffect` that calls `setFilters({ search: debouncedValue })`
- URL update happens only after debounce period elapses

**Alternatives Considered**:
1. **Lodash debounce**: Rejected to avoid adding dependency for simple use case
2. **AbortController for each keystroke**: Rejected because debouncing is simpler and reduces request volume
3. **Server-side throttling**: Not applicable; debouncing is a UX concern

---

### 5. React Query for State Management and Caching

**Decision**: Use React Query (TanStack Query) with filters in `queryKey` for automatic cache invalidation and refetching.

**Rationale**:
- React Query automatically refetches when `queryKey` changes
- Built-in caching reduces redundant API calls (30-second stale time)
- Error handling and loading states provided out-of-box
- Already used in the project (per project dependencies)

**Implementation**:
```typescript
useQuery({
  queryKey: ['tasks', filters],  // Refetch when filters change
  queryFn: () => api.getTasks(filters),
  staleTime: 30000,
});
```

**Alternatives Considered**:
1. **Manual fetch in useEffect**: Rejected due to complexity (cache management, race conditions, error handling)
2. **SWR**: Rejected because React Query is already in use

---

### 6. Conditional Empty State Component

**Decision**: Create a single `EmptyState` component that displays different messages based on whether filters are active.

**Rationale**:
- Spec requirement FR-013: Distinguish "No tasks found matching '[query]'" from "No tasks yet"
- Improves UX by providing context-aware messaging
- Encourages appropriate user actions (clear filters vs create first task)

**Implementation**:
```typescript
if (tasks.length === 0) {
  const hasActiveFilters = !!(filters.search || filters.priority || filters.category);
  return hasActiveFilters
    ? <EmptyState message="No tasks found..." action={<ClearFiltersButton />} />
    : <EmptyState message="No tasks yet" action={<CreateTaskButton />} />;
}
```

**Alternatives Considered**:
1. **Two separate components**: Rejected for duplication; single component with props is cleaner
2. **No differentiation**: Rejected because user intent differs based on context

---

### 7. TaskToolbar Component Architecture

**Decision**: Create a stateless `TaskToolbar` component that receives filter state from parent via `useTaskFilters()` hook.

**Rationale**:
- Separation of concerns: toolbar handles UI, parent handles state
- Testable in isolation
- Follows React best practices (controlled components)

**Component Structure**:
```
DashboardClient (client component, state owner)
├── TaskToolbar (client component, controlled)
│   ├── SearchInput (debounced)
│   ├── SortSelect (Shadcn Select)
│   └── FilterPopover (Shadcn Popover)
└── TaskList
    ├── TaskCard (one per task)
    └── EmptyState (conditional)
```

**Implementation**:
- `TaskToolbar` accepts no props; calls `useTaskFilters()` internally
- `useTaskFilters()` hook exposes `{ filters, setFilters, clearFilters }`
- Each control in toolbar calls `setFilters()` with partial filter object

**Alternatives Considered**:
1. **Monolithic dashboard component**: Rejected for poor separation of concerns
2. **Props drilling**: Rejected; context hook is cleaner

---

### 8. ShadcnUI for UI Components

**Decision**: Use ShadcnUI components (Input, Select, Popover, Button) for the toolbar.

**Rationale**:
- Already in use in the project (per constitution and CLAUDE.md)
- Provides accessible, customizable components
- Consistent with existing UI patterns

**Components Required**:
- `Input` (search field) - already installed
- `Select` (sort and priority filter dropdowns) - verify installation or add
- `Popover` (filter panel) - verify installation or add
- `Button` (clear filters) - already installed

**Installation Check**:
```bash
# Verify components exist in frontend/components/ui/
ls frontend/components/ui/select.tsx  # If missing: npx shadcn@latest add select
ls frontend/components/ui/popover.tsx # If missing: npx shadcn@latest add popover
```

---

## Implementation Phases

### Phase 0: Research (Complete)

**Output**: `research.md` documenting all technical decisions.

**Key Findings**:
- Priority sorting: SQL CASE statement
- NULL handling: SQLAlchemy `nullslast()`
- URL state: `useSearchParams` + React Query
- Debouncing: Custom hook, 300ms
- Filter logic: AND combination
- Empty states: Conditional component

**Status**: ✅ Complete (see [research.md](./research.md))

---

### Phase 1: Design (Complete)

**Outputs**:
- `data-model.md`: Documents existing Task entity; no new entities required
- `contracts/api.md`: API contract for GET /api/tasks with query parameters
- `quickstart.md`: Step-by-step implementation guide

**Key Artifacts**:
1. **TaskFilters Interface** (TypeScript):
   ```typescript
   interface TaskFilters {
     search: string;
     sortBy: 'created_at' | 'due_date' | 'priority';
     order: 'asc' | 'desc';
     priority: '' | 'low' | 'medium' | 'high';
     category: string;
   }
   ```

2. **Query Parameter Validation** (Python Pydantic):
   ```python
   class TaskQueryParams(BaseModel):
       search: Optional[str] = Field(None, max_length=255)
       sort_by: Literal["created_at", "due_date", "priority"] = "created_at"
       order: Literal["asc", "desc"] = "desc"
       priority: Optional[Literal["low", "medium", "high"]] = None
       category: Optional[str] = Field(None, max_length=100)
   ```

3. **Component Hierarchy**:
   ```
   DashboardClient
   ├── TaskToolbar
   │   ├── SearchInput
   │   ├── SortSelect
   │   └── FilterPopover
   └── TaskList/EmptyState
   ```

**Status**: ✅ Complete (see [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md))

---

### Phase 2: Task Breakdown (Next Step)

**Command**: `/sp.tasks`

**Input**: This plan.md file

**Expected Output**: `specs/005-list-discovery/tasks.md` with atomic, testable tasks.

**Task Structure** (preview):
1. **Backend Tasks**:
   - Extend GET /api/tasks endpoint with query parameters
   - Implement search filter (title OR description)
   - Implement priority filter
   - Implement category filter
   - Implement sorting by created_at
   - Implement sorting by due_date with nullslast
   - Implement sorting by priority with SQL CASE
   - Write backend unit tests

2. **Frontend Tasks**:
   - Create TaskFilters TypeScript types
   - Create useTaskFilters hook (URL state management)
   - Create useDebounced hook
   - Create useTaskList hook (React Query)
   - Install/verify ShadcnUI Select and Popover components
   - Create TaskToolbar component
   - Create EmptyState component
   - Integrate toolbar into DashboardClient
   - Update api.ts getTasks function
   - Write frontend component tests

**Validation**:
- Each task touches < 3 files (per constitution workflow)
- Each task has verification command
- Tasks ordered by dependency (backend → types → hooks → components → integration)

---

## Testing Strategy

### Backend Tests (`backend/tests/test_tasks.py`)

**Test Cases**:
1. **Search**:
   - Search by title (case-insensitive)
   - Search by description
   - Search returns tasks matching title OR description
   - Empty search string ignored

2. **Filters**:
   - Filter by priority (low, medium, high)
   - Filter by category
   - Combine search + priority + category (AND logic)

3. **Sorting**:
   - Sort by created_at (asc, desc)
   - Sort by due_date (asc, desc, nulls last)
   - Sort by priority (desc: high>medium>low, nulls last)

4. **Validation**:
   - Invalid sort_by returns 422
   - Invalid priority returns 422
   - Missing auth token returns 401

5. **User Isolation**:
   - Filter results scoped by authenticated user_id

**Test Framework**: pytest with FastAPI TestClient

---

### Frontend Tests

**Component Tests** (`frontend/tests/components/TaskToolbar.test.tsx`):
- Search input triggers debounced update
- Sort select updates URL and filters
- Filter popover applies priority and category filters
- Clear button removes all filters

**Hook Tests** (`frontend/tests/hooks/useTaskFilters.test.ts`):
- useTaskFilters reads URL params correctly
- setFilters updates URL without page reload
- clearFilters removes all query params

**Integration Tests**:
- URL change triggers React Query refetch
- Empty state differentiates "no tasks" vs "no results"

**Test Framework**: Jest + React Testing Library + Mock Service Worker (for API mocking)

---

## Performance Considerations

### Database Query Optimization

**Index Usage** (from Spec 004):
- `user_id`: Index for user isolation
- `priority`: Index for priority filtering
- `category`: Index for category filtering
- `due_date`: Index for due date sorting
- `created_at`: Index for default sorting

**Query Pattern**:
```sql
SELECT * FROM tasks
WHERE user_id = ?
  AND priority = ?          -- Uses priority index
  AND category = ?          -- Uses category index
  AND (title ILIKE ? OR description ILIKE ?)  -- Sequential scan (acceptable at 1000 tasks)
ORDER BY created_at DESC    -- Uses created_at index
```

**Expected Performance** (per success criteria):
- SC-002: Search returns results in < 1 second for 1000 tasks
- SC-003: Sort operations complete in < 1 second

**Monitoring**:
- Use PostgreSQL EXPLAIN ANALYZE to verify index usage
- Monitor p95 latency in production
- If performance degrades, consider composite index: `(user_id, priority, created_at)`

---

### Frontend Performance

**Optimizations**:
- **Debouncing**: 300ms delay on search input reduces API calls by 70% (SC-006)
- **React Query Caching**: 30-second stale time prevents redundant fetches
- **URL State**: No global state management overhead; browser handles serialization

**Potential Improvements** (future):
- Virtual scrolling if task list exceeds 100 items (not needed for current scope)
- Intersection Observer for lazy-loading task cards (not needed for current scope)

---

## Migration and Deployment

### Database Migration

**Required**: ❌ None

**Verification**: Ensure Spec 004 migration `df1e7b8409fc_add_task_attributes_priority_due_date_` includes indexes on:
- `priority`
- `category`
- `due_date`

**Command**:
```bash
cd backend
alembic history
alembic show df1e7b8409fc
```

---

### Deployment Steps

1. **Backend Deployment**:
   - Deploy updated `backend/app/api/routes/tasks.py`
   - No migration needed (all fields and indexes exist)
   - Backward compatible (query params are optional)

2. **Frontend Deployment**:
   - Deploy new components (TaskToolbar, EmptyState)
   - Deploy updated DashboardClient
   - Deploy new hooks (useTaskFilters, useTaskList, useDebounced)

3. **Verification**:
   - Test search, filter, sort in production
   - Verify URL persistence (reload page with filters active)
   - Check performance (response times < 1 second)

4. **Rollback Plan** (if needed):
   - Backend: Revert tasks.py (no breaking change; params are optional)
   - Frontend: Revert dashboard changes, remove toolbar

---

## Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Search performance degrades with large datasets** | High | Low | Monitor query plans; add full-text search index (GIN) if needed |
| **Priority sorting logic confusing to users** | Medium | Low | Clear UI labels ("Highest Priority" vs "Lowest Priority") |
| **URL query params conflict with other features** | Low | Low | Use unique param names (`q` for search, `sort_by`, not generic `sort`) |
| **Debounce delay feels laggy** | Low | Medium | 300ms is standard; user testing can adjust if needed |
| **Browser back button breaks filter state** | Medium | Low | Next.js router.push with query params handles this automatically |

---

## Success Metrics (Post-Implementation)

Per spec success criteria:

- **SC-001**: Users can locate a specific task using search in under 5 seconds (50+ tasks)
  - **Measurement**: User testing with stopwatch; 90% success rate
- **SC-002**: Search returns results in under 1 second (1000 tasks)
  - **Measurement**: Backend logs; p95 latency < 1000ms
- **SC-003**: Sort operations complete in under 1 second
  - **Measurement**: Backend logs; p95 latency < 1000ms
- **SC-004**: Filters persist across page reload
  - **Measurement**: Manual testing; URL contains query params, filters applied on load
- **SC-005**: 90% of users locate desired task within 3 interactions
  - **Measurement**: User testing; count search/filter/sort actions until success
- **SC-006**: Debouncing reduces API calls by 70% vs every keystroke
  - **Measurement**: Network tab; count requests during typing vs debounced requests

---

## Next Steps

1. **Generate Tasks** (`/sp.tasks`):
   - Break down this plan into atomic, testable tasks
   - Order tasks by dependency (backend → frontend → integration)
   - Include verification commands for each task

2. **Implementation** (`/sp.implement`):
   - Execute tasks sequentially
   - Run tests after each task
   - Commit incrementally

3. **QA** (Manual or automated):
   - Run full test suite
   - Test user scenarios from spec
   - Verify success criteria

4. **Deploy**:
   - Backend first (backward compatible)
   - Frontend second
   - Monitor performance in production

---

## Appendix: File Change Summary

### Files to CREATE

**Backend**:
- `backend/tests/test_tasks.py` - Unit tests for filtering/sorting

**Frontend**:
- `frontend/types/filters.ts` - TaskFilters interface, SORT_OPTIONS
- `frontend/hooks/useTaskFilters.ts` - URL state management
- `frontend/hooks/useDebounced.ts` - Debounce utility
- `frontend/hooks/useTaskList.ts` - React Query hook
- `frontend/components/TaskToolbar.tsx` - Toolbar component
- `frontend/components/EmptyState.tsx` - Conditional empty state
- `frontend/components/ui/select.tsx` - ShadcnUI Select (if not exists)
- `frontend/components/ui/popover.tsx` - ShadcnUI Popover (if not exists)
- `frontend/tests/components/TaskToolbar.test.tsx` - Component tests

### Files to MODIFY

**Backend**:
- `backend/app/api/routes/tasks.py` - Extend list_tasks function with query params

**Frontend**:
- `frontend/app/dashboard/DashboardClient.tsx` - Integrate TaskToolbar, handle empty states
- `frontend/lib/api.ts` - Update getTasks function to accept filters

### Files to VERIFY (No Changes)

**Backend**:
- `backend/alembic/versions/df1e7b8409fc_*.py` - Verify indexes exist
- `backend/app/models/task.py` - Task model (already has needed fields)
- `backend/app/api/dependencies.py` - get_current_user (auth already implemented)

**Frontend**:
- `frontend/types/task.ts` - Task type (verify includes priority, category, due_date)
- `frontend/components/ui/input.tsx` - ShadcnUI Input (already exists)
- `frontend/components/ui/button.tsx` - ShadcnUI Button (already exists)

---

## Conclusion

This plan provides a comprehensive blueprint for implementing server-side task list discovery (search, sort, filter) with URL persistence. All technical decisions are grounded in spec requirements and documented in research.md. The implementation follows the constitution's principles: spec-first, monorepo discipline, tech stack constraints, authentication protocol, and error handling standards. No database migration is required; all infrastructure exists from Spec 004.

**Ready for**: `/sp.tasks` to generate atomic task breakdown.
