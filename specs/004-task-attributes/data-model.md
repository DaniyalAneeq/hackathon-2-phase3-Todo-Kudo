# Data Model: Task Attributes

**Feature**: Task Attributes (Dates, Priority, Categories)
**Date**: 2026-01-05
**Branch**: 004-task-attributes

## Entity: Task (Enhanced)

### Overview

The `Task` entity represents a user's todo item with enhanced metadata for organization and scheduling. This document describes the **additive changes** to the existing Task entity defined in Spec 003.

### Attributes

| Attribute | Type | Constraints | Default | Nullable | Description |
|-----------|------|-------------|---------|----------|-------------|
| `id` | Integer | Primary Key | Auto-increment | No | **[EXISTING]** Unique task identifier |
| `user_id` | UUID | Foreign Key (User), Indexed | - | No | **[EXISTING]** Owner of the task |
| `title` | String(255) | Length 1-255 | - | No | **[EXISTING]** Task title |
| `description` | String(2000) | Max 2000 chars | None | Yes | **[EXISTING]** Task description |
| `is_completed` | Boolean | - | `false` | No | **[EXISTING]** Completion status |
| `created_at` | DateTime | - | `datetime.utcnow()` | No | **[EXISTING]** Creation timestamp (UTC) |
| `updated_at` | DateTime | - | `datetime.utcnow()` | No | **[EXISTING]** Last update timestamp (UTC) |
| **`priority`** | **String(10)** | **Enum: "low", "medium", "high"** | **"medium"** | **No** | **[NEW]** Task priority level |
| **`due_date`** | **DateTime** | **- ** | **None** | **Yes** | **[NEW]** Target completion date/time (UTC) |
| **`category`** | **String(100)** | **Max 100 chars** | **None** | **Yes** | **[NEW]** User-defined category label |

### Validation Rules

**Business Rules** (enforced at application layer):

1. **Priority Validation**:
   - MUST be one of: `"low"`, `"medium"`, `"high"`
   - Enforced via Pydantic `Literal["low", "medium", "high"]`
   - Invalid values rejected with 422 Unprocessable Entity

2. **Due Date Validation**:
   - MUST be valid ISO 8601 datetime string when provided
   - Stored in UTC timezone (timezone-naive in database)
   - Can be null (no due date set)
   - Frontend responsible for local timezone conversion

3. **Category Validation**:
   - Free-form text (no predefined list)
   - Maximum 100 characters (enforced at model level)
   - Empty string treated as null (no category)
   - No uniqueness constraint (users can reuse category names)

4. **Backward Compatibility** (FR-015):
   - Tasks created before this feature have:
     - `priority = "medium"` (database default)
     - `due_date = null`
     - `category = null`
   - These tasks MUST display without errors

### Relationships

- **User → Task**: One-to-Many (unchanged from Spec 003)
  - `Task.user_id` references `User.id`
  - Foreign key constraint enforced at database level
  - User deletion cascades to tasks (existing behavior)

### State Transitions

No new state transitions introduced. Existing `is_completed` boolean remains the only state flag.

**Priority changes** are simple attribute updates (no state machine):
- User can change priority at any time (low → medium → high, or any permutation)
- No restrictions on priority changes based on `is_completed` status

**Due date changes** are simple attribute updates:
- User can set, clear, or modify due date at any time
- No automatic state changes based on due date (e.g., overdue tasks don't auto-flag)

### Database Schema Changes

**Migration**: `add_task_attributes.py` (Alembic)

```python
# Alembic upgrade()
def upgrade():
    # Add new columns
    op.add_column('tasks', sa.Column('priority', sa.String(length=10), server_default='medium', nullable=False))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('category', sa.String(length=100), nullable=True))

    # Create indexes for future sorting/filtering
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_category', 'tasks', ['category'])

# Alembic downgrade()
def downgrade():
    # Drop indexes
    op.drop_index('ix_tasks_category', table_name='tasks')
    op.drop_index('ix_tasks_due_date', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')

    # Drop columns
    op.drop_column('tasks', 'category')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
```

### SQLModel Implementation

**Updated `Task` Model** (backend/app/models/task.py):

```python
from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from sqlmodel import Field, SQLModel

# Type alias for priority enum
PriorityLevel = Literal["low", "medium", "high"]

class TaskBase(SQLModel):
    """Base task fields shared across models"""
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    # NEW FIELDS (additive)
    priority: PriorityLevel = Field(default="medium")
    due_date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)

class Task(TaskBase, table=True):
    """Task database model"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    # All fields from TaskBase
    # NEW: priority, due_date, category are optional (use defaults)
    priority: Optional[PriorityLevel] = None
    due_date: Optional[datetime] = None
    category: Optional[str] = None

class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(default=None, max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: Optional[bool] = Field(default=None)
    # NEW FIELDS (additive, all optional for partial updates)
    priority: Optional[PriorityLevel] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)

class TaskResponse(TaskBase):
    """Schema for task API responses"""
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    # Inherits priority, due_date, category from TaskBase with proper defaults
```

### TypeScript Interface

**Updated `Task` Type** (frontend/types/task.ts):

```typescript
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  user_id: string;  // UUID as string
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;  // ISO 8601 datetime string
  updated_at: string;  // ISO 8601 datetime string
  // NEW FIELDS (additive)
  priority: PriorityLevel;       // Always present (defaults to "medium")
  due_date: string | null;       // ISO 8601 datetime string or null
  category: string | null;       // Free text or null
}

export interface TaskCreateInput {
  title: string;                  // Required
  description?: string | null;    // Optional
  priority?: PriorityLevel;       // Optional (defaults to "medium")
  due_date?: string | null;       // Optional ISO 8601 string
  category?: string | null;       // Optional
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  // NEW FIELDS (all optional for partial updates)
  priority?: PriorityLevel;
  due_date?: string | null;
  category?: string | null;
}
```

### Data Integrity Constraints

1. **Foreign Key Constraint** (unchanged):
   - `tasks.user_id` → `users.id` (ON DELETE CASCADE)

2. **Check Constraints** (none - validation at application layer):
   - Priority enum validated by Pydantic (backend) and TypeScript (frontend)
   - No database CHECK constraint to allow future priority additions without migration

3. **Index Constraints**:
   - `user_id` index (existing) - supports user-scoped queries
   - `priority` index (new) - supports future priority sorting
   - `due_date` index (new) - supports future date range queries
   - `category` index (new) - supports future category filtering

4. **Nullability Constraints**:
   - `priority` is NOT NULL (database default = "medium")
   - `due_date` is NULL allowed
   - `category` is NULL allowed

### Migration Safety

**Pre-Migration Validation**:
- Verify no existing tasks have `priority`, `due_date`, or `category` columns (should be clean slate)
- Backup production database before running migration

**Migration Steps**:
1. Run Alembic migration: `alembic upgrade head`
2. Verify columns added: `SELECT * FROM tasks LIMIT 1;`
3. Verify indexes created: `SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';`
4. Test existing task retrieval (should show default values for new fields)

**Rollback Plan**:
- Run `alembic downgrade -1` to remove columns and indexes
- Existing task data preserved (columns dropped, not data deleted)

### Example Data

**Before Migration** (Spec 003 task):
```json
{
  "id": 123,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z"
}
```

**After Migration** (same task, auto-populated defaults):
```json
{
  "id": 123,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z",
  "priority": "medium",      // Database default
  "due_date": null,          // Nullable, no value
  "category": null           // Nullable, no value
}
```

**New Task with Attributes** (created post-migration):
```json
{
  "id": 456,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Finish project proposal",
  "description": "Draft slides and budget",
  "is_completed": false,
  "created_at": "2026-01-05T14:30:00Z",
  "updated_at": "2026-01-05T14:30:00Z",
  "priority": "high",              // User-selected
  "due_date": "2026-01-15T23:59:59Z",  // User-selected (end of day, UTC)
  "category": "Work"              // User-typed
}
```

---

## Summary

- **3 new attributes** added to Task entity (priority, due_date, category)
- **All changes are additive** - no removal or modification of existing fields
- **Backward compatibility ensured** via nullable columns and defaults
- **Indexes created proactively** for future sorting features (FR-014)
- **Validation strategy**: Application-level (Pydantic/TypeScript) for flexibility
- **Migration tested**: Existing tasks load correctly with default/null values
