# Implementation Plan: Basic Task CRUD Operations

**Branch**: `002-task-crud` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-task-crud/spec.md`

## Summary

Implement a full-stack task management system enabling users to create, read, update, and delete todo tasks. The system uses a hardcoded demo user (`demo-user-123`) to bypass authentication in this phase, with a Neon PostgreSQL database for persistence, FastAPI for the backend API, and Next.js 16.1.1 with React Query for the frontend.

**Primary Requirement**: Enable users to manage a personal todo list with instant UI feedback, persistent storage, and graceful error handling.

**Technical Approach** (from research.md):
- Backend: FastAPI + SQLModel + Neon PostgreSQL with RESTful API design
- Frontend: Next.js 16 (App Router) + TanStack Query + Shadcn UI + Zod validation
- Integration: Hardcoded user ID constant, fetch-based API client, optimistic UI updates
- Before implementing, get the context from relevant MCP server connected.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend), Node.js 18+
**Primary Dependencies**: FastAPI, SQLModel, Alembic, psycopg2 (backend); Next.js 16, TanStack Query v5, Zod, Shadcn UI (frontend)
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling)
**Testing**: pytest + httpx (backend), Vitest + Testing Library (frontend)
**Target Platform**: Linux server (backend), modern browsers (frontend - Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (monorepo: separate frontend and backend)
**Performance Goals**:
  - API response time: < 200ms p95 for single task operations
  - List endpoint: < 500ms for up to 100 tasks
  - UI responsiveness: < 200ms visual feedback for completion toggle
**Constraints**:
  - No pagination required (SC-007: responsive with up to 100 tasks)
  - No authentication in this phase (hardcoded demo user)
  - No offline support or PWA features
  - No real-time updates (polling or WebSocket)
**Scale/Scope**:
  - Single demo user
  - Expected load: < 100 tasks per user
  - Development phase (not production-ready yet)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Validation (Phase 0)

**I. Spec-First Development**
- ✅ **PASS**: Specification exists at `specs/002-task-crud/spec.md`
- ✅ **PASS**: All functional requirements documented (FR-001 through FR-014)
- ✅ **PASS**: Success criteria defined and measurable (SC-001 through SC-009)

**II. Monorepo Discipline**
- ✅ **PASS**: Frontend code will be in `/frontend` directory only
- ✅ **PASS**: Backend code will be in `/backend` directory only
- ✅ **PASS**: No cross-contamination planned

**III. Technology Stack Constraints**
- ✅ **PASS**: Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- ✅ **PASS**: Backend: Python FastAPI, SQLModel (ORM)
- ✅ **PASS**: Database: Neon Serverless PostgreSQL
- ✅ **PASS**: Authentication: Deferred to future phase (using hardcoded user for now)

**IV. Agentic Dev Stack Workflow**
- ✅ **PASS**: Spec read and analyzed
- ✅ **PASS**: High-level plan documented in this file
- ✅ **PASS**: Tasks will be broken down in `tasks.md` (Phase 2)
- ✅ **PASS**: Verification commands will be provided for each layer

**V. Authentication Protocol**
- ⚠️ **DEFERRED**: Using hardcoded `demo-user-123` for this phase
- ✅ **PASS**: Backend will filter all queries by `user_id` (data isolation enforced)
- ✅ **PASS**: No global data access (every query includes `WHERE user_id = ?`)

**VI. Documentation & File Standards**
- ✅ **PASS**: Spec hierarchy maintained (`specs/002-task-crud/`)
- ✅ **PASS**: API contracts defined (`contracts/tasks-api.yaml`)
- ✅ **PASS**: Data model documented (`data-model.md`)

**VII. Error Handling Strategy**
- ✅ **PASS**: Frontend: Error Boundaries + Toast notifications planned
- ✅ **PASS**: Backend: Standard HTTP status codes (401, 404, 422, 500)
- ✅ **PASS**: Validation errors return 422 with field details

**🟢 ALL GATES PASSED** - Proceed to Phase 0 (Research)

### Post-Design Validation (Phase 1)

**Re-check after completing research.md, data-model.md, and contracts/**

**I. Spec-First Development**
- ✅ **PASS**: Implementation matches spec requirements
- ✅ **PASS**: All FR requirements mapped to API endpoints
- ✅ **PASS**: All SC requirements mapped to performance targets

**II. Monorepo Discipline**
- ✅ **PASS**: Source structure maintains separation:
  - Backend: `/backend/app/models/task.py`, `/backend/app/api/routes/tasks.py`
  - Frontend: `/frontend/src/components/`, `/frontend/src/hooks/`, `/frontend/src/lib/`

**III. Technology Stack Constraints**
- ✅ **PASS**: SQLModel schema defined (`data-model.md`)
- ✅ **PASS**: FastAPI async patterns confirmed
- ✅ **PASS**: Next.js Server Components + Client Components strategy defined
- ✅ **PASS**: React Query for client state management

**IV. Agentic Dev Stack Workflow**
- ✅ **PASS**: Research complete (`research.md`)
- ✅ **PASS**: Data model complete (`data-model.md`)
- ✅ **PASS**: API contracts complete (`contracts/tasks-api.yaml`)
- ✅ **PASS**: Quickstart guide complete (`quickstart.md`)

**V. Authentication Protocol**
- ✅ **PASS**: All database queries include `WHERE user_id = 'demo-user-123'`
- ✅ **PASS**: No endpoints bypass user filtering
- ✅ **PASS**: Frontend uses `DEMO_USER_ID` constant (easy to replace later)

**VI. Documentation & File Standards**
- ✅ **PASS**: Docstrings planned for all FastAPI routes
- ✅ **PASS**: JSDoc planned for React components
- ✅ **PASS**: Self-documenting code prioritized over comments

**VII. Error Handling Strategy**
- ✅ **PASS**: API error format defined (JSON with `detail` and `field_errors`)
- ✅ **PASS**: Frontend error handling strategy defined (toasts + loading states)
- ✅ **PASS**: Edge cases identified and handled (empty title, network failures)

**🟢 ALL GATES PASSED** - Proceed to Phase 2 (Tasks)

## Project Structure

### Documentation (this feature)

```text
specs/002-task-crud/
├── spec.md              # Feature specification (completed by /sp.specify)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (SQLModel + TypeScript types)
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── tasks-api.yaml   # OpenAPI 3.1 specification
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Backend (FastAPI + SQLModel + PostgreSQL)
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── models/
│   │   └── task.py             # Task, TaskCreate, TaskUpdate, TaskResponse models
│   ├── api/
│   │   └── routes/
│   │       └── tasks.py        # Task CRUD endpoints router
│   ├── core/
│   │   ├── config.py           # Environment configuration
│   │   └── database.py         # SQLModel engine + session
│   └── utils/
│       └── constants.py        # DEMO_USER_ID constant
├── alembic/
│   └── versions/
│       └── 001_create_tasks_table.py  # Database migration
├── tests/
│   ├── unit/
│   │   └── test_task_model.py  # Model validation tests
│   ├── integration/
│   │   └── test_task_api.py    # API endpoint tests
│   └── conftest.py             # Pytest fixtures
├── alembic.ini                 # Alembic configuration
├── pyproject.toml              # Python dependencies (Poetry/pip)
└── .env                        # Environment variables (gitignored)

# Frontend (Next.js 16 + React Query + Shadcn UI)
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (React Query provider)
│   │   ├── page.tsx            # Homepage (task list + create form)
│   │   └── globals.css         # Tailwind CSS imports
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components (auto-generated)
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   └── skeleton.tsx
│   │   ├── CreateTaskForm.tsx  # Task creation form
│   │   ├── TaskCard.tsx        # Individual task display
│   │   ├── TaskList.tsx        # Task list container
│   │   └── EmptyState.tsx      # No tasks message
│   ├── hooks/
│   │   ├── useTasks.ts         # useQuery for task listing
│   │   ├── useCreateTask.ts    # useMutation for creation
│   │   ├── useUpdateTask.ts    # useMutation for updates
│   │   └── useDeleteTask.ts    # useMutation for deletion
│   ├── lib/
│   │   ├── api-client.ts       # Fetch wrapper + API methods
│   │   ├── constants.ts        # DEMO_USER_ID constant
│   │   └── utils.ts            # Helper functions (cn, formatDate)
│   ├── types/
│   │   └── task.ts             # TypeScript interfaces
│   └── schemas/
│       └── task.ts             # Zod validation schemas
├── tests/
│   ├── unit/
│   │   └── components/         # Component unit tests
│   └── integration/
│       └── api/                # API integration tests
├── public/                     # Static assets
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── .env.local                  # Environment variables (gitignored)
```

**Structure Decision**:
This is a **web application** (Option 2) with separate frontend and backend codebases. The monorepo structure enforces strict separation of concerns as required by Constitution Principle II. Backend handles data persistence and business logic; frontend handles UI and user interactions. Communication occurs exclusively via the RESTful API defined in `contracts/tasks-api.yaml`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution checks passed. No complexity justification required.

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js 16 App (Port 3000)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │  Homepage  │  │   React    │  │  Shadcn UI │     │  │
│  │  │ (page.tsx) │──│   Query    │──│ Components │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  │         │              │                               │  │
│  │         └──────────────┴───── API Client ─────────────┼──┼───┐
│  └──────────────────────────────────────────────────────┘  │   │
└─────────────────────────────────────────────────────────────┘   │
                                                                   │ HTTP/JSON
                                                                   │ (REST API)
┌──────────────────────────────────────────────────────────────┐  │
│                  FastAPI Backend (Port 8000)                  │◄─┘
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Router: /api/tasks                                │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │  │
│  │  │ GET  │  │ POST │  │ GET  │  │PATCH │  │DELETE│   │  │
│  │  │ /    │  │ /    │  │ /{id}│  │/{id} │  │/{id} │   │  │
│  │  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘   │  │
│  │      └─────────┴─────────┴─────────┴─────────┘       │  │
│  │                       │                                │  │
│  │                 SQLModel ORM                           │  │
│  │                       │                                │  │
│  └───────────────────────┼────────────────────────────────┘  │
└───────────────────────────┼───────────────────────────────────┘
                            │ SQL
                            │ (PostgreSQL wire protocol)
┌───────────────────────────▼───────────────────────────────────┐
│              Neon Serverless PostgreSQL                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Table: tasks                                         │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ id │ title │ description │ is_completed │... │    │    │
│  │  ├────┼───────┼─────────────┼──────────────┼────┤    │    │
│  │  │ 1  │ Buy..│ Milk, eggs..│ false        │... │    │    │
│  │  │ 2  │ Call.│ null        │ true         │... │    │    │
│  │  └────┴───────┴─────────────┴──────────────┴────┘    │    │
│  │  Indexes: user_id, (user_id, created_at DESC)        │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow: Create Task

```
1. User types title + description → CreateTaskForm (Client Component)
2. Form validates with Zod schema (client-side)
3. useCreateTask mutation triggered
4. API client: POST /api/tasks with { title, description }
5. FastAPI endpoint validates with Pydantic
6. FastAPI injects user_id = "demo-user-123"
7. SQLModel creates Task record in PostgreSQL
8. PostgreSQL returns created task
9. FastAPI returns 201 + TaskResponse JSON
10. React Query updates cache
11. TaskList re-renders with new task
12. Toast notification: "Task created successfully"
```

### Data Flow: Toggle Completion

```
1. User clicks checkbox → TaskCard (Client Component)
2. useUpdateTask mutation triggered with optimistic update
3. UI immediately shows strikethrough (optimistic)
4. API client: PATCH /api/tasks/{id} with { is_completed: true }
5. FastAPI endpoint validates ownership (user_id match)
6. SQLModel updates is_completed in PostgreSQL
7. PostgreSQL returns updated task
8. FastAPI returns 200 + TaskResponse JSON
9. React Query confirms optimistic update (or rolls back on error)
10. UI remains updated
```

## Database Design

**See `data-model.md` for complete details.**

### Tasks Table Schema

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id VARCHAR(255) NOT NULL
);

CREATE INDEX ix_tasks_user_id ON tasks(user_id);
CREATE INDEX ix_tasks_user_id_created_at ON tasks(user_id, created_at DESC);
```

### Indexes Rationale

- **`ix_tasks_user_id`**: Enables O(log n) filtering for `WHERE user_id = ?` queries
- **`ix_tasks_user_id_created_at`**: Composite index for sorted listing without additional sort operation

## Backend API Design

**See `contracts/tasks-api.yaml` for complete OpenAPI specification.**

### Endpoints

| Method | Path | Purpose | Request Body | Response |
|--------|------|---------|--------------|----------|
| GET | `/api/tasks` | List all tasks for demo user | None | `{ tasks: Task[], total: number }` |
| POST | `/api/tasks` | Create new task | `TaskCreate` | `Task` (201) |
| GET | `/api/tasks/{id}` | Get single task | None | `Task` (200) |
| PATCH | `/api/tasks/{id}` | Update task | `TaskUpdate` | `Task` (200) |
| DELETE | `/api/tasks/{id}` | Delete task | None | 204 No Content |

### Router Structure (`backend/app/api/routes/tasks.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.task import Task, TaskCreate, TaskUpdate, TaskResponse
from app.utils.constants import DEMO_USER_ID

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=dict)
async def list_tasks(session: Session = Depends(get_session)):
    """List all tasks for demo user, ordered by creation date (newest first)."""
    statement = (
        select(Task)
        .where(Task.user_id == DEMO_USER_ID)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()
    return {"tasks": tasks, "total": len(tasks)}

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, session: Session = Depends(get_session)):
    """Create a new task for demo user."""
    task = Task(**task_data.model_dump(), user_id=DEMO_USER_ID)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.get("/{id}", response_model=TaskResponse)
async def get_task(id: int, session: Session = Depends(get_session)):
    """Get a single task by ID (only if owned by demo user)."""
    task = session.get(Task, id)
    if not task or task.user_id != DEMO_USER_ID:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{id}", response_model=TaskResponse)
async def update_task(id: int, task_data: TaskUpdate, session: Session = Depends(get_session)):
    """Update a task (only if owned by demo user)."""
    task = session.get(Task, id)
    if not task or task.user_id != DEMO_USER_ID:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: int, session: Session = Depends(get_session)):
    """Delete a task (only if owned by demo user)."""
    task = session.get(Task, id)
    if not task or task.user_id != DEMO_USER_ID:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
```

## Frontend Architecture

### Component Hierarchy

```
page.tsx (Server Component)
└── QueryProvider (Client Component wrapper)
    └── TasksPage (Client Component)
        ├── CreateTaskForm (Client Component)
        │   └── Form (Shadcn UI)
        │       ├── Input (title)
        │       ├── Input (description)
        │       └── Button (submit)
        └── TaskList (Client Component)
            ├── TaskCard[] (Client Component)
            │   ├── Card (Shadcn UI)
            │   ├── Checkbox (completion toggle)
            │   ├── Text (title + description)
            │   └── Button (delete)
            └── EmptyState (Client Component)
```

### State Management Strategy

**Server State** (managed by TanStack Query):
- Task list data
- Individual task data
- Loading states
- Error states

**Client State** (managed by React useState):
- Form input values (via React Hook Form)
- UI-only states (dialog open/closed, etc.)

**No Global State Store Needed**: React Query handles server state, local state is scoped to components.

### React Query Hooks

**`useTasks.ts`** (List):
```typescript
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
    staleTime: 1000 * 60, // 1 minute
  });
}
```

**`useCreateTask.ts`** (Create):
```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreateInput) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}
```

**`useUpdateTask.ts`** (Update with Optimistic Update):
```typescript
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateInput }) =>
      updateTask(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update for completion toggle only
      if ('is_completed' in data) {
        await queryClient.cancelQueries({ queryKey: ['tasks'] });
        const previous = queryClient.getQueryData(['tasks']);

        queryClient.setQueryData(['tasks'], (old: any) => ({
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === id ? { ...task, is_completed: data.is_completed } : task
          ),
        }));

        return { previous };
      }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
      toast.error('Failed to update task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

**`useDeleteTask.ts`** (Delete):
```typescript
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });
}
```

### Shadcn UI Components

**Components to Install**:
```bash
npx shadcn@latest add card      # Task container
npx shadcn@latest add checkbox  # Completion toggle
npx shadcn@latest add button    # Actions
npx shadcn@latest add input     # Form inputs
npx shadcn@latest add form      # Form wrapper (React Hook Form integration)
npx shadcn@latest add toast     # Notifications (sonner)
npx shadcn@latest add skeleton  # Loading states
```

**Styling Strategy**:
- Use Shadcn UI components for consistent design
- Customize with Tailwind CSS utility classes
- Strikethrough completed tasks: `className={cn({ "line-through text-muted-foreground": task.is_completed })}`
- Responsive grid for task list: `className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"`

## Integration Strategy

### Hardcoded User ID Implementation

**Backend Constant** (`backend/app/utils/constants.py`):
```python
import os

DEMO_USER_ID = os.getenv("DEMO_USER_ID", "demo-user-123")
```

**Frontend Constant** (`frontend/src/lib/constants.ts`):
```typescript
export const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user-123';
```

**Usage**:
- Backend: Inject `DEMO_USER_ID` in all database queries
- Frontend: Include in API client context (not in URL or request body for this phase)
- Future migration: Replace constant with JWT token extraction

### API Client Implementation

**`frontend/src/lib/api-client.ts`**:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const fetchTasks = () => apiRequest<TaskListResponse>('/tasks');

export const createTask = (data: TaskCreate) =>
  apiRequest<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTask = (id: number, data: TaskUpdate) =>
  apiRequest<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteTask = (id: number) =>
  apiRequest<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
```

## Error Handling & Edge Cases

### Form Validation (Zod + React Hook Form)

**Empty Title**:
- Client-side: Zod schema requires `minLength: 1`
- Submit button disabled when title is empty
- Inline error message: "Title is required"
- Server-side: Pydantic validates and returns 422

**Title Too Long**:
- Client-side: Zod schema enforces `maxLength: 255`
- Character counter shows remaining characters
- Inline error message: "Title must be 255 characters or less"
- Server-side: Pydantic validates and returns 422

**Description Too Long**:
- Client-side: Zod schema enforces `maxLength: 2000`
- Character counter shows remaining characters
- Inline error message: "Description must be 2000 characters or less"
- Server-side: Pydantic validates and returns 422

### Network Error Handling

**API Request Fails**:
- React Query automatically retries (default: 3 retries with exponential backoff)
- Show error toast: "Failed to [action]. Please try again."
- Provide manual retry button in toast

**Database Connection Fails**:
- Backend returns 500 Internal Server Error
- Frontend shows error toast: "Service unavailable. Please try again later."
- React Query keeps previous data visible (stale-while-revalidate)

**Task Not Found (404)**:
- Backend verifies `task.user_id == DEMO_USER_ID` before operations
- Returns 404 if not found or unauthorized
- Frontend shows error toast: "Task not found"

### Loading States

**Initial Load**:
- Show skeleton placeholders (3-5 TaskCard skeletons)
- Loading indicator in header

**Mutation Loading**:
- Disable form during submission
- Show loading spinner on submit button
- Optimistic update for completion toggle (instant visual feedback)

## Performance Optimization

### Database Queries

- Use composite index `(user_id, created_at DESC)` for sorted listing
- Single query for task list (no N+1 problem)
- Connection pooling via Neon Serverless

### Frontend Rendering

- React Query caching prevents redundant API calls
- Optimistic updates for instant UI feedback (completion toggle)
- Skeleton loading reduces perceived latency
- Lazy load components if needed (defer to future phase)

### Network Optimization

- Debounce search/filter inputs (if added in future)
- Batch mutations if needed (defer to future phase)
- Gzip compression on API responses (FastAPI default)

## Testing Strategy

### Backend Tests

**Unit Tests** (`tests/unit/test_task_model.py`):
- Test Pydantic validation (min/max lengths)
- Test default values (is_completed = False)
- Test timestamp auto-generation

**Integration Tests** (`tests/integration/test_task_api.py`):
- Test CRUD endpoints with httpx async client
- Test user filtering (only demo user's tasks returned)
- Test error responses (404, 422, 500)
- Test edge cases (empty title, long description)

### Frontend Tests

**Component Tests** (Vitest + Testing Library):
- Test CreateTaskForm renders and validates
- Test TaskCard displays task data correctly
- Test completion toggle triggers mutation
- Test delete button triggers mutation

**Integration Tests**:
- Test full workflow (create → view → complete → delete)
- Test error handling (network failures, validation errors)
- Mock API responses with MSW (Mock Service Worker)

## Deployment Considerations

**Out of Scope for This Phase**:
- Production deployment (still in development)
- CI/CD pipeline
- Monitoring and logging
- Rate limiting
- Caching layer (Redis)

**Future Considerations**:
- Replace hardcoded `DEMO_USER_ID` with JWT extraction
- Add Alembic migration rollback procedures
- Add database backup strategy
- Add API rate limiting with Redis
- Add Sentry for error tracking

## Migration Path to Authentication

**Current Phase (Hardcoded User)**:
```python
# Backend
user_id = DEMO_USER_ID  # "demo-user-123"
```

```typescript
// Frontend
const userId = DEMO_USER_ID;  // "demo-user-123"
```

**Future Phase (Better Auth + JWT)**:
```python
# Backend
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    # Verify JWT signature with BETTER_AUTH_SECRET
    payload = verify_jwt(token)
    return payload["user_id"]

@router.get("/")
async def list_tasks(user_id: str = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    ...
```

```typescript
// Frontend
const { data: session } = useSession();  // Better Auth hook
const token = session?.access_token;

fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

**Migration Steps**:
1. Replace `DEMO_USER_ID` constant with `get_current_user()` dependency
2. Add JWT verification middleware
3. Update frontend to use Better Auth session
4. Add `Authorization` header to all API requests
5. No database schema changes needed (user_id column already exists)

## Next Steps

After completing this plan:

1. **Run** `/sp.tasks` to generate atomic, testable tasks
2. **Implement** tasks incrementally (smallest viable change)
3. **Verify** each task with provided test commands
4. **Document** any deviations in ADRs
5. **Prepare** for QA validation phase

## References

- Feature Specification: [spec.md](./spec.md)
- Research Decisions: [research.md](./research.md)
- Data Model: [data-model.md](./data-model.md)
- API Contracts: [contracts/tasks-api.yaml](./contracts/tasks-api.yaml)
- Quick Start Guide: [quickstart.md](./quickstart.md)
- Constitution: [/.specify/memory/constitution.md](/.specify/memory/constitution.md)
