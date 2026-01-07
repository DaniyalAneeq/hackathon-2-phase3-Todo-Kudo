# Research: Task Attributes Implementation

**Feature**: Task Attributes (Dates, Priority, Categories)
**Date**: 2026-01-05
**Branch**: 004-task-attributes

## Purpose

This research document resolves all technical unknowns before implementation, ensuring informed decisions about database schema, API design, UI components, and date handling patterns.

## Research Questions & Decisions

### 1. Database Schema Design for Nullable Columns

**Question**: How to add nullable columns to an existing table with data while maintaining backward compatibility?

**Decision**: Use Alembic migration with nullable columns and default values

**Rationale**:
- Existing tasks in the database must continue to work without errors
- SQLModel supports nullable fields via `Optional[...]` typing
- Alembic can add columns with `nullable=True` without requiring data backfill
- Default value for `priority` can be set at the database level (`server_default="medium"`) OR at the application level (SQLModel `default="medium"`)

**Alternatives Considered**:
- **Required columns with backfill**: Rejected - requires complex data migration and risks downtime
- **Separate attributes table**: Rejected - over-engineering for simple scalar values, creates unnecessary joins

**Implementation**:
```python
# Alembic migration (simplified):
op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
op.add_column('tasks', sa.Column('priority', sa.String(length=10), server_default='medium', nullable=False))
op.add_column('tasks', sa.Column('category', sa.String(length=100), nullable=True))

# Create indexes for future sorting:
op.create_index('ix_tasks_priority', 'tasks', ['priority'])
op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
op.create_index('ix_tasks_category', 'tasks', ['category'])
```

---

### 2. Priority Enum: Database vs. Application Layer

**Question**: Should priority validation be enforced at the database level (ENUM type) or application level (Pydantic)?

**Decision**: Application-level validation using Pydantic Literal type

**Rationale**:
- PostgreSQL ENUMs are rigid and require complex migrations to add new values
- Application-level validation with Python `Literal["low", "medium", "high"]` is flexible
- Pydantic FastAPI integration provides automatic API documentation and validation
- Easier to extend in the future (e.g., adding "urgent" priority without schema migration)

**Alternatives Considered**:
- **Database ENUM type**: Rejected - harder to evolve, requires `ALTER TYPE` migrations
- **CHECK constraint**: Rejected - similar rigidity to ENUM, no advantage over application validation
- **No validation**: Rejected - allows invalid data, violates data integrity

**Implementation**:
```python
from typing import Literal

PriorityLevel = Literal["low", "medium", "high"]

class TaskBase(SQLModel):
    priority: PriorityLevel = "medium"  # Default at model level
```

---

### 3. Date Handling: DateTime vs. Date, Timezone Awareness

**Question**: Should `due_date` be `DateTime` (with time) or `Date` (day only)? Should it be timezone-aware?

**Decision**: Use `DateTime` type, store in UTC, display in user's local timezone (frontend responsibility)

**Rationale**:
- SQLModel's `datetime` type maps to PostgreSQL `TIMESTAMP WITHOUT TIME ZONE`
- Storing UTC is standard practice for multi-timezone applications
- Users typically think of due dates as "end of day" (23:59:59), not a specific time
- Frontend can format as "Jan 15" or "Tomorrow" using `date-fns` library
- Allows future extension to specific times (e.g., "Due at 3pm") without schema change

**Alternatives Considered**:
- **DATE column (no time)**: Rejected - less flexible, cannot add time-of-day later
- **TIMESTAMP WITH TIME ZONE**: Rejected - Neon PostgreSQL default is WITHOUT, unnecessary complexity for "day" granularity
- **Store as string**: Rejected - loses database-level date arithmetic and sorting capabilities

**Implementation**:
```python
from datetime import datetime
from typing import Optional

class Task(TaskBase, table=True):
    due_date: Optional[datetime] = None  # UTC datetime, nullable
```

Frontend formatting:
```typescript
import { format, isToday, isTomorrow } from 'date-fns';

function formatDueDate(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');  // "Jan 15"
}
```

---

### 4. Category Storage: Free Text vs. Predefined List

**Question**: Should categories be predefined (dropdown) or user-defined (free text)?

**Decision**: Free text with frontend input field (no autocomplete at this stage)

**Rationale**:
- Spec explicitly states "simple text strings" - user types category name
- No requirement for category management or uniqueness
- Allows maximum flexibility without additional database tables
- Simpler implementation aligns with "additive-only" constraint
- Future enhancement: autocomplete from user's previous categories (not in this spec)

**Alternatives Considered**:
- **Separate categories table**: Rejected - over-engineering, not in scope
- **Predefined dropdown**: Rejected - contradicts spec's "user types a name like 'Work'"
- **JSON array of categories**: Rejected - spec indicates single category per task

**Implementation**:
```python
class Task(TaskBase, table=True):
    category: Optional[str] = Field(default=None, max_length=100)  # Free text, nullable
```

---

### 5. UI Component Selection (Shadcn)

**Question**: Which Shadcn components are needed and how should they be composed?

**Decision**: Install and use the following components:
- **Calendar + Popover**: Date picker for `due_date`
- **Select**: Priority dropdown
- **Badge**: Display priority and category on task cards
- **Input**: Category text field (existing component)

**Rationale**:
- Shadcn provides accessible, composable components following Radix UI patterns
- Calendar + Popover is the standard pattern for date selection in web apps
- Badge component supports color variants (destructive=red, warning=yellow, secondary=gray)
- Components are already available in the project (Shadcn installed per Spec 003)

**Installation Commands**:
```bash
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add select
npx shadcn@latest add badge
```

**Component Composition**:
```tsx
// Date Picker (Calendar + Popover)
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={dueDate}
      onSelect={setDueDate}
    />
  </PopoverContent>
</Popover>

// Priority Badge
<Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'secondary'}>
  {priority}
</Badge>
```

---

### 6. API Backward Compatibility Strategy

**Question**: How to ensure existing API clients continue working after adding optional fields?

**Decision**: Make all new fields `Optional` in Pydantic models, preserve existing field validation

**Rationale**:
- `TaskCreate` and `TaskUpdate` models use `Optional[PriorityLevel]` for priority, `Optional[datetime]` for due_date
- SQLModel `Task` table model has defaults: `priority` defaults to "medium", `due_date` and `category` are nullable
- Existing API calls without new fields will succeed (fields auto-populate with defaults/null)
- Frontend can send partial updates without breaking

**Alternatives Considered**:
- **API versioning (v2)**: Rejected - overkill for additive changes, increases maintenance burden
- **Required fields**: Rejected - breaks backward compatibility, violates spec constraint

**Implementation**:
```python
class TaskCreate(TaskBase):
    title: str  # Required (existing)
    description: Optional[str] = None  # Optional (existing)
    priority: Optional[PriorityLevel] = None  # Optional (new) - will default to "medium" in DB
    due_date: Optional[datetime] = None  # Optional (new)
    category: Optional[str] = None  # Optional (new)

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[PriorityLevel] = None  # Optional (new)
    due_date: Optional[datetime] = None  # Optional (new)
    category: Optional[str] = None  # Optional (new)
```

---

### 7. Index Strategy for Future Sorting

**Question**: Which columns should be indexed to support future filtering/sorting features?

**Decision**: Add indexes on `priority`, `due_date`, and `category`

**Rationale**:
- Spec requires "Ensure proper indexing for these new columns to support future sorting features" (FR-014)
- Future features likely include:
  - Sort by priority (high → medium → low)
  - Sort by due date (soonest → farthest)
  - Filter by category
- Composite index `(user_id, priority)` and `(user_id, due_date)` will be needed for user-scoped queries
- Category index supports case-insensitive filtering (if added later)

**Alternatives Considered**:
- **No indexes**: Rejected - violates FR-014, poor query performance on large datasets
- **Composite indexes only**: Considered but deferred - single-column indexes sufficient for initial implementation
- **Full-text search on category**: Rejected - not in scope, simple equality matching sufficient

**Implementation** (Alembic migration):
```python
op.create_index('ix_tasks_priority', 'tasks', ['priority'])
op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
op.create_index('ix_tasks_category', 'tasks', ['category'])
```

---

## Best Practices Applied

### FastAPI + SQLModel Patterns
- Use `TaskBase` for shared fields, inherit for `Task`, `TaskCreate`, `TaskUpdate`, `TaskResponse`
- Leverage Pydantic Field constraints (`max_length`, `default`, `Literal`)
- Separate database model (`Task`) from API schemas (prevents exposing internal fields)

### Next.js 16 + App Router Patterns
- Use Client Components for forms (interactivity)
- Server Components for static task lists (SSR)
- API client (`@/lib/api`) handles authentication headers
- Date formatting in UTC → local conversion client-side

### Better Auth Integration
- No changes to authentication flow (per spec constraint)
- JWT verification remains unchanged in `get_current_user` dependency
- All task queries maintain `where(user_id == current_user)` filtering

### Neon PostgreSQL Optimization
- Use native `TIMESTAMP` type (no custom serialization)
- Indexes aligned with Neon's query planner (B-tree indexes on scalar columns)
- Connection pooling handled by existing database setup (no changes)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing tasks fail to load with new schema | **HIGH** - breaks backward compatibility | Add default values in migration; test with existing data before deployment |
| Date timezone confusion (user expects local, sees UTC) | **MEDIUM** - user experience degradation | Document frontend's responsibility for timezone conversion; use `date-fns` consistently |
| Category string length overflow (user enters very long text) | **LOW** - database error on save | Enforce `max_length=100` at model level; frontend input has `maxLength` attribute |
| Priority enum expansion requires code changes | **LOW** - minor maintenance debt | Document that adding priorities requires updating `Literal` type and redeployment (acceptable trade-off vs. database ENUM rigidity) |
| Performance degradation on large task lists (sorting by date/priority) | **LOW** - unlikely at current scale | Indexes created proactively (FR-014); pagination can be added later if needed |

---

## Dependencies Confirmed

- **Shadcn UI Components**: `calendar`, `popover`, `select`, `badge` - all available in Shadcn registry
- **date-fns**: Already installed in frontend (used in `TaskCard.tsx:16`)
- **Alembic**: Existing migration setup in `backend/alembic/`
- **SQLModel**: Version supports `Optional` and `Literal` types (Python 3.11+)
- **Better Auth**: No changes required (JWT verification remains unchanged)

---

## Summary

All technical unknowns resolved. Implementation ready to proceed with:
1. **Database**: Alembic migration adding 3 nullable columns + indexes
2. **Backend**: Pydantic models with `Optional` fields, application-level enum validation
3. **Frontend**: Shadcn components for date picker (Calendar+Popover), priority dropdown (Select), and badges (Badge)
4. **Data Flow**: UTC storage → API JSON → client-side local formatting

No architectural deviations from constitution. No complexity tracking violations.
