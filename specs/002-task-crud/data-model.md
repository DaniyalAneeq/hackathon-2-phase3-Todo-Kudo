# Data Model: Task CRUD Operations

**Feature**: Basic Task CRUD Operations
**Phase**: 1 - Design & Contracts
**Date**: 2026-01-01

## Entity Model

### Task (Todo Item)

**Purpose**: Represents a single todo item with title, optional description, completion status, and metadata.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier for the task |
| `title` | String | Required, Max 255 chars | Task title (main text) |
| `description` | String | Optional, Max 2000 chars | Additional task details |
| `is_completed` | Boolean | Required, Default False | Completion status |
| `created_at` | DateTime (TZ) | Required, Auto-set | Timestamp when task was created |
| `user_id` | String | Required, Indexed | Owner of the task (demo-user-123 for this phase) |

**Indexes**:
- Primary: `id` (automatic)
- Index: `user_id` (for efficient user-scoped queries)
- Composite: `(user_id, created_at DESC)` (for ordered listing)

**Validation Rules** (from FR-011, FR-013, FR-014):
- `title`: NOT NULL, length 1-255 characters
- `description`: NULLABLE, max length 2000 characters
- `is_completed`: NOT NULL, boolean
- `user_id`: NOT NULL, string (will be VARCHAR(255))

**State Transitions**:

```
[New Task]
    ↓ (create)
[Incomplete Task] ←→ (toggle) [Completed Task]
    ↓ (delete)      ↓ (delete)
[Deleted]         [Deleted]
```

**Relationships**:
- User (1:N) → Task: One user owns many tasks
  - Current phase: Hardcoded to `demo-user-123`
  - Future phase: Foreign key to `users` table

## SQLModel Implementation

### Backend Model (`backend/app/models/task.py`)

```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Task model representing a todo item.

    Attributes:
        id: Unique identifier (auto-increment)
        title: Task title (required, max 255 chars)
        description: Optional task description (max 2000 chars)
        is_completed: Completion status (default: False)
        created_at: Creation timestamp (auto-set, timezone-aware)
        user_id: Owner identifier (indexed for fast lookups)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = Field(index=True, max_length=255)


class TaskCreate(SQLModel):
    """Schema for creating a new task."""
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    # user_id will be injected from auth context


class TaskUpdate(SQLModel):
    """Schema for updating a task (partial updates)."""
    title: Optional[str] = Field(default=None, max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: Optional[bool] = Field(default=None)


class TaskResponse(SQLModel):
    """Schema for task responses to client."""
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    user_id: str
```

### Database Migration (Alembic)

**Migration File**: `backend/alembic/versions/001_create_tasks_table.py`

```python
"""Create tasks table

Revision ID: 001
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Index on user_id for fast user-scoped queries
    op.create_index(
        'ix_tasks_user_id',
        'tasks',
        ['user_id']
    )

    # Composite index for ordered listing by user
    op.create_index(
        'ix_tasks_user_id_created_at',
        'tasks',
        ['user_id', sa.text('created_at DESC')]
    )


def downgrade() -> None:
    op.drop_index('ix_tasks_user_id_created_at', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
```

## Frontend Type Definitions

### TypeScript Types (`frontend/src/types/task.ts`)

```typescript
/**
 * Task entity as returned from the API
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string; // ISO 8601 string
  user_id: string;
}

/**
 * Payload for creating a new task
 */
export interface TaskCreate {
  title: string;
  description?: string;
}

/**
 * Payload for updating a task (partial)
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

/**
 * API response for task list
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

/**
 * API error response
 */
export interface ApiError {
  detail: string;
  field_errors?: Record<string, string[]>;
}
```

### Zod Validation Schema (`frontend/src/schemas/task.ts`)

```typescript
import { z } from "zod";

/**
 * Validation schema for task creation form
 */
export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
});

/**
 * Validation schema for task update form
 */
export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
  is_completed: z.boolean().optional(),
});

/**
 * Inferred TypeScript types from Zod schemas
 */
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
```

## Data Flow

### Create Task Flow

```
User Input (Frontend)
    ↓ (validate with Zod)
TaskCreate payload
    ↓ (POST /api/tasks)
FastAPI endpoint
    ↓ (validate with Pydantic)
    ↓ (inject user_id = "demo-user-123")
TaskCreate model → Task model
    ↓ (SQLModel insert)
PostgreSQL (Neon)
    ↓ (return created task)
TaskResponse
    ↓ (JSON response)
Frontend (React Query cache update)
    ↓ (render)
UI update
```

### Read Tasks Flow

```
Page Load (Frontend)
    ↓ (GET /api/tasks)
FastAPI endpoint
    ↓ (filter by user_id = "demo-user-123")
SQLModel query: SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC
    ↓
PostgreSQL (Neon)
    ↓ (return task list)
List[TaskResponse]
    ↓ (JSON response)
Frontend (React Query cache)
    ↓ (render)
TaskList component
```

### Update Task Flow

```
User Action (Frontend)
    ↓ (validate with Zod)
TaskUpdate payload
    ↓ (PATCH /api/tasks/{id})
FastAPI endpoint
    ↓ (verify task.user_id == "demo-user-123")
    ↓ (validate with Pydantic)
TaskUpdate model → UPDATE query
    ↓ (SQLModel update)
PostgreSQL (Neon)
    ↓ (return updated task)
TaskResponse
    ↓ (JSON response)
Frontend (React Query cache update)
    ↓ (optimistic UI update for is_completed only)
UI update
```

### Delete Task Flow

```
User Action (Frontend)
    ↓ (DELETE /api/tasks/{id})
FastAPI endpoint
    ↓ (verify task.user_id == "demo-user-123")
SQLModel query: DELETE FROM tasks WHERE id = ? AND user_id = ?
    ↓
PostgreSQL (Neon)
    ↓ (return 204 No Content)
Frontend (React Query cache update)
    ↓ (remove from cache)
UI update (task removed)
```

## Edge Cases & Error Handling

### Validation Errors

| Scenario | Frontend Behavior | Backend Response |
|----------|------------------|------------------|
| Empty title | Disable submit button | 422 with field error |
| Title > 255 chars | Show inline error | 422 with field error |
| Description > 2000 chars | Show inline error | 422 with field error |
| Missing required field | Show inline error | 422 with field error |

### Authorization Errors

| Scenario | Frontend Behavior | Backend Response |
|----------|------------------|------------------|
| Update task from different user | N/A (all tasks owned by demo user) | 404 Not Found |
| Delete task from different user | N/A (all tasks owned by demo user) | 404 Not Found |

### Database Errors

| Scenario | Frontend Behavior | Backend Response |
|----------|------------------|------------------|
| Database connection failure | Show error toast "Service unavailable" | 500 Internal Server Error |
| Task not found | Show error toast "Task not found" | 404 Not Found |
| Constraint violation | Show error toast "Invalid data" | 422 Unprocessable Entity |

## Performance Considerations

### Database Indexes

- `user_id` index enables O(log n) filtering by user
- Composite `(user_id, created_at DESC)` index optimizes sorted listing
- Primary key index (`id`) enables O(1) single-task lookups

### Query Optimization

- All queries include `WHERE user_id = ?` to leverage index
- `ORDER BY created_at DESC` uses composite index (no additional sort)
- Limit result set to 100 tasks (per SC-007) to prevent performance degradation

### Frontend Caching

- React Query caches task list to prevent redundant API calls
- Cache invalidation after mutations ensures data consistency
- Stale-while-revalidate pattern balances freshness and performance

## Future Enhancements (Out of Scope)

- Add `updated_at` timestamp for audit trail
- Add soft delete with `deleted_at` timestamp
- Add task categories/tags (many-to-many relationship)
- Add task priority/ordering fields
- Add foreign key constraint to `users` table when auth is implemented
- Add full-text search index on `title` and `description`
