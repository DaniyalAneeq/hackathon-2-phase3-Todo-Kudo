# Tasks: Basic Task CRUD Operations

**Input**: Design documents from `/specs/002-task-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tasks-api.yaml

**Tests**: Tests are NOT requested in the spec - focusing on implementation only. Testing strategy is documented but test tasks are deferred.

**Organization**: Tasks are grouped by user story priority (P1-P5) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for source code
- **Frontend**: `frontend/src/` for source code
- Web application structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [ ] T001 Verify backend Python environment (3.11+) and create virtual environment in `backend/`
  - **Verification**: `python --version` shows 3.11+ and `backend/venv/` directory exists

- [ ] T002 Verify frontend Node.js environment (18+) and npm installation
  - **Verification**: `node --version` shows 18+ and `npm --version` succeeds

- [ ] T003 [P] Install backend dependencies in `backend/requirements.txt` or `backend/pyproject.toml`
  - **Verification**: `pip list` shows fastapi, sqlmodel, alembic, psycopg2-binary installed

- [ ] T004 [P] Install frontend dependencies in `frontend/package.json`
  - **Verification**: `npm list` shows @tanstack/react-query, zod, react-hook-form installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T005 [MCP Context] Use Neon MCP `list_projects` to verify active database and get connection string
  - **Verification**: MCP returns project list with valid connection string for phase-2-todo-project

- [ ] T006 Create backend directory structure: `backend/app/{models,api/routes,core,utils}`
  - **Verification**: All directories exist under `backend/app/`

- [ ] T007 [P] Configure database connection in `backend/app/core/database.py` using Neon connection string from T005
  - **Verification**: File exists with SQLModel engine and get_session dependency

- [ ] T008 [P] Create constants file `backend/app/utils/constants.py` with DEMO_USER_ID
  - **Verification**: File exists and exports `DEMO_USER_ID = "demo-user-123"`

- [ ] T009 Initialize Alembic in `backend/` and configure `alembic.ini` with Neon database URL
  - **Verification**: `backend/alembic/` directory exists and `alembic.ini` has correct sqlalchemy.url

- [ ] T010 Create FastAPI application entry point in `backend/app/main.py` with CORS middleware
  - **Verification**: File exists with FastAPI app initialization and CORS configured for localhost:3000

### Frontend Foundation

- [ ] T011 [MCP Context] Use Shadcn MCP `search_items_in_registries` to find card, checkbox, button, input, form, toast, skeleton components
  - **Verification**: MCP returns component details for all 7 components from @shadcn registry

- [ ] T012 Initialize Shadcn UI in `frontend/` using `npx shadcn@latest init`
  - **Verification**: `frontend/components.json` exists with configuration

- [ ] T013 [P] Install Shadcn components: card, checkbox, button, input, form, toast (sonner), skeleton
  - **Verification**: `frontend/src/components/ui/` contains all 7 component files

- [ ] T014 [P] Create constants file `frontend/src/lib/constants.ts` with DEMO_USER_ID
  - **Verification**: File exists and exports `export const DEMO_USER_ID = "demo-user-123"`

- [ ] T015 [P] Setup React Query provider in `frontend/src/app/layout.tsx`
  - **Verification**: Layout wraps children with QueryClientProvider

- [ ] T016 [P] Setup Toaster component in `frontend/src/app/layout.tsx` for global notifications
  - **Verification**: Toaster component from sonner is rendered in layout

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Existing Tasks (Priority: P1) 🎯 MVP

**Goal**: Display all tasks for the demo user on the homepage, showing empty state when no tasks exist

**Independent Test**: Seed database with 5 tasks via SQL, load homepage, verify all 5 tasks display; then clear database and verify empty state message appears

### Backend Implementation for US1

- [ ] T017 [P] [US1] Create Task SQLModel in `backend/app/models/task.py` with all fields (id, title, description, is_completed, created_at, user_id)
  - **Verification**: File exists with Task, TaskCreate, TaskUpdate, TaskResponse classes

- [ ] T018 [US1] Generate Alembic migration for tasks table using `alembic revision --autogenerate -m "Create tasks table"`
  - **Verification**: New migration file in `backend/alembic/versions/` with CREATE TABLE tasks

- [ ] T019 [US1] Apply migration using `alembic upgrade head` via Neon MCP
  - **Verification**: Neon MCP `describe_branch` shows tasks table with all columns and indexes

- [ ] T020 [US1] Implement GET /api/tasks endpoint in `backend/app/api/routes/tasks.py` to list all tasks for demo user
  - **Verification**: `curl http://localhost:8000/api/tasks` returns `{"tasks": [], "total": 0}`

- [ ] T021 [US1] Register tasks router in `backend/app/main.py`
  - **Verification**: FastAPI docs at `http://localhost:8000/docs` shows /api/tasks endpoint

### Frontend Implementation for US1

- [ ] T022 [P] [US1] Create TypeScript types in `frontend/src/types/task.ts` (Task, TaskCreate, TaskUpdate interfaces)
  - **Verification**: File exists with all 3 interfaces matching backend schema

- [ ] T023 [P] [US1] Create API client functions in `frontend/src/lib/api-client.ts` (fetchTasks, createTask, updateTask, deleteTask)
  - **Verification**: File exists with all 4 functions using fetch with proper typing

- [ ] T024 [US1] Implement useTasks hook in `frontend/src/hooks/useTasks.ts` using useQuery
  - **Verification**: File exists with useQuery configured for ['tasks'] key

- [ ] T025 [P] [US1] Create EmptyState component in `frontend/src/components/EmptyState.tsx`
  - **Verification**: Component renders message "No tasks yet. Create one to get started!"

- [ ] T026 [US1] Create TaskList component in `frontend/src/components/TaskList.tsx` with grid layout
  - **Verification**: Component exists and accepts tasks prop, shows EmptyState when empty

- [ ] T027 [US1] Update homepage in `frontend/src/app/page.tsx` to use useTasks and TaskList
  - **Verification**: Homepage renders TaskList with loading skeleton initially

**Checkpoint**: User can view task list (empty state) - US1 functional ✅

---

## Phase 4: User Story 2 - Create New Tasks (Priority: P2)

**Goal**: Enable users to add new tasks via a form with title and optional description

**Independent Test**: Type "Buy groceries" in input field, press Enter, verify task appears in list and persists after page refresh

### Backend Implementation for US2

- [ ] T028 [US2] Implement POST /api/tasks endpoint in `backend/app/api/routes/tasks.py` to create tasks
  - **Verification**: `curl -X POST http://localhost:8000/api/tasks -H "Content-Type: application/json" -d '{"title":"Test"}'` returns 201 with created task

### Frontend Implementation for US2

- [ ] T029 [P] [US2] Create Zod validation schema in `frontend/src/schemas/task.ts` (taskCreateSchema, taskUpdateSchema)
  - **Verification**: File exists with zod schemas for title (max 255) and description (max 2000)

- [ ] T030 [US2] Implement useCreateTask hook in `frontend/src/hooks/useCreateTask.ts` using useMutation
  - **Verification**: Hook exists with mutation that invalidates ['tasks'] query on success

- [ ] T031 [US2] Create CreateTaskForm component in `frontend/src/components/CreateTaskForm.tsx` with React Hook Form
  - **Verification**: Form renders with title input, description input, submit button, uses Zod validation

- [ ] T032 [US2] Integrate CreateTaskForm into homepage `frontend/src/app/page.tsx` above TaskList
  - **Verification**: Homepage shows form, submitting creates task visible in list immediately

**Checkpoint**: User can create tasks that appear in list - US2 functional ✅

---

## Phase 5: User Story 3 - Mark Tasks as Complete (Priority: P3)

**Goal**: Toggle task completion status with visual feedback (strikethrough) and persist changes

**Independent Test**: Create a task, click checkbox, verify strikethrough appears; refresh page, verify task still shows as completed

### Backend Implementation for US3

- [ ] T033 [US3] Implement PATCH /api/tasks/{id} endpoint in `backend/app/api/routes/tasks.py` for partial updates
  - **Verification**: `curl -X PATCH http://localhost:8000/api/tasks/1 -H "Content-Type: application/json" -d '{"is_completed":true}'` returns updated task

### Frontend Implementation for US3

- [ ] T034 [US3] Implement useUpdateTask hook in `frontend/src/hooks/useUpdateTask.ts` with optimistic updates for is_completed
  - **Verification**: Hook exists with onMutate for optimistic UI, onError for rollback

- [ ] T035 [MCP Context] Use Shadcn MCP `get_item_examples_from_registries` to find checkbox examples for completion toggle
  - **Verification**: MCP returns example code for checkbox usage patterns

- [ ] T036 [US3] Create TaskCard component in `frontend/src/components/TaskCard.tsx` with checkbox and strikethrough styling
  - **Verification**: Card renders task title, description, checkbox; completed tasks show strikethrough

- [ ] T037 [US3] Update TaskList component to use TaskCard instead of plain rendering
  - **Verification**: TaskList maps tasks to TaskCard components with proper grid layout

**Checkpoint**: User can toggle task completion with instant visual feedback - US3 functional ✅

---

## Phase 6: User Story 4 - Update Task Details (Priority: P4)

**Goal**: Edit task title and description after creation

**Independent Test**: Create task "Buy milk", edit title to "Buy organic milk", verify change persists after refresh

### Frontend Implementation for US4

- [ ] T038 [P] [US4] Add edit mode state to TaskCard component with inline editing
  - **Verification**: TaskCard shows edit button, clicking enables inline title/description editing

- [ ] T039 [US4] Integrate useUpdateTask hook for title/description changes in TaskCard
  - **Verification**: Editing title or description and saving triggers mutation and shows success toast

**Checkpoint**: User can edit task details - US4 functional ✅

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P5)

**Goal**: Permanently remove tasks from the list

**Independent Test**: Create 3 tasks, delete the second one, verify only 2 remain; refresh page, verify deleted task doesn't reappear

### Backend Implementation for US5

- [ ] T040 [US5] Implement DELETE /api/tasks/{id} endpoint in `backend/app/api/routes/tasks.py`
  - **Verification**: `curl -X DELETE http://localhost:8000/api/tasks/1` returns 204 No Content

### Frontend Implementation for US5

- [ ] T041 [US5] Implement useDeleteTask hook in `frontend/src/hooks/useDeleteTask.ts` using useMutation
  - **Verification**: Hook exists with mutation that invalidates ['tasks'] query on success

- [ ] T042 [US5] Add delete button to TaskCard component with confirmation
  - **Verification**: TaskCard shows delete button, clicking shows confirmation, confirming deletes task

**Checkpoint**: User can delete tasks - US5 functional ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] Add loading skeletons using Shadcn skeleton component in TaskList
  - **Verification**: While fetching, TaskList shows 3-5 skeleton placeholders

- [ ] T044 [P] Add error handling with toast notifications for all mutations (create, update, delete)
  - **Verification**: Network failures show error toasts with retry option

- [ ] T045 [P] Add character counters to CreateTaskForm for title (255) and description (2000)
  - **Verification**: Form shows "X/255 characters" below title input

- [ ] T046 Add timestamp formatting using date-fns in TaskCard to show "Jan 1, 2026 3:45 PM"
  - **Verification**: TaskCard displays created_at in absolute local time format

- [ ] T047 [P] Add responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop) to TaskList
  - **Verification**: TaskList uses `grid gap-4 md:grid-cols-2 lg:grid-cols-3`

- [ ] T048 Add empty title validation (disable submit button when title is empty)
  - **Verification**: Submit button is disabled when title field is empty

- [ ] T049 Run quickstart.md validation checklist (all success criteria SC-001 through SC-009)
  - **Verification**: All 9 success criteria pass per quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories should proceed in priority order (US1 → US2 → US3 → US4 → US5)
  - Each story builds on previous: US2 needs US1 (display), US3 needs US2 (create), etc.
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (View Tasks)**: Can start after Foundational - No dependencies on other stories
- **US2 (Create Tasks)**: Requires US1 (TaskList component exists)
- **US3 (Complete Tasks)**: Requires US2 (TaskCard component exists)
- **US4 (Update Tasks)**: Requires US3 (TaskCard component exists)
- **US5 (Delete Tasks)**: Requires US3 (TaskCard component exists)

### Within Each User Story

- Backend tasks before frontend (API must exist for client to call)
- Models before migrations (Alembic needs SQLModel classes)
- Migrations before endpoints (endpoints query database)
- Types before hooks (hooks use types)
- Hooks before components (components use hooks)
- Components before page integration (page assembles components)

### Parallel Opportunities

**Phase 1 (Setup)**: T003 and T004 can run in parallel

**Phase 2 (Foundational)**:
- T007, T008, T010 (backend) can run in parallel after T006
- T013, T014, T015, T016 (frontend) can run in parallel after T012
- All backend tasks independent of all frontend tasks

**Phase 3 (US1)**:
- T017 creates models needed by T018 (sequential)
- T022, T023, T025 can run in parallel (different files)
- Backend (T017-T021) independent of frontend (T022-T027)

**Phase 4 (US2)**:
- T029, T030 can run in parallel
- Backend (T028) independent of frontend (T029-T032)

**Phase 5 (US3)**:
- Backend (T033) independent of frontend (T034-T037)

**Phase 8 (Polish)**:
- T043, T044, T045, T047 can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase

```bash
# Backend foundation (after T006):
Task T007: "Configure database connection in backend/app/core/database.py"
Task T008: "Create constants file backend/app/utils/constants.py"
Task T010: "Create FastAPI app in backend/app/main.py"

# Frontend foundation (after T012):
Task T013: "Install Shadcn components"
Task T014: "Create constants file frontend/src/lib/constants.ts"
Task T015: "Setup React Query provider"
Task T016: "Setup Toaster component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T016) - CRITICAL PATH
3. Complete Phase 3: US1 (T017-T027)
4. **STOP and VALIDATE**: Seed database, verify task list displays
5. Deploy/demo if ready (read-only task viewer works)

### Incremental Delivery

1. **Setup + Foundational** → Foundation ready (T001-T016)
2. **Add US1** → View tasks (T017-T027) → Test → Deploy (MVP: Read-only viewer!)
3. **Add US2** → Create tasks (T028-T032) → Test → Deploy (Can add tasks)
4. **Add US3** → Complete tasks (T033-T037) → Test → Deploy (Can toggle completion)
5. **Add US4** → Edit tasks (T038-T039) → Test → Deploy (Can edit details)
6. **Add US5** → Delete tasks (T040-T042) → Test → Deploy (Full CRUD)
7. **Polish** → Refinements (T043-T049) → Test → Deploy (Production-ready)

Each increment adds value without breaking previous functionality.

### Sequential Execution (Recommended)

Due to user story dependencies (each builds on previous):

1. Complete Setup (Phase 1)
2. Complete Foundational (Phase 2) - BLOCKS everything else
3. Complete US1 (Phase 3) - Establishes TaskList
4. Complete US2 (Phase 4) - Adds CreateTaskForm
5. Complete US3 (Phase 5) - Enhances TaskCard
6. Complete US4 (Phase 6) - Extends TaskCard
7. Complete US5 (Phase 7) - Extends TaskCard
8. Complete Polish (Phase 8) - Refinements across all stories

---

## MCP Tool Usage Strategy

**Neon MCP** (Database Operations):
- T005: `list_projects` to verify database connection
- T019: `run_sql` or MCP migration tools to apply schema changes
- Throughout: `describe_branch` to verify table structure

**Shadcn MCP** (UI Components):
- T011: `search_items_in_registries` to find components
- T035: `get_item_examples_from_registries` for checkbox patterns
- As needed: `view_items_in_registries` for component details

**Better Auth MCP** (Future - Not Used This Phase):
- Deferred until authentication phase

**Context7 MCP** (Documentation):
- As needed: Query TanStack Query, React Hook Form, Zod documentation

---

## Task Count Summary

- **Setup**: 4 tasks
- **Foundational**: 12 tasks
- **US1 (View)**: 11 tasks
- **US2 (Create)**: 5 tasks
- **US3 (Complete)**: 5 tasks
- **US4 (Update)**: 2 tasks
- **US5 (Delete)**: 3 tasks
- **Polish**: 7 tasks

**Total**: 49 tasks

**Parallelizable**: 16 tasks marked [P]

**MVP Scope** (Recommended): Phases 1-3 (27 tasks) = Read-only task viewer

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story builds incrementally on previous stories
- MCP Context tasks ensure we verify infrastructure before writing code
- Verification commands provided for every task
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Backend must complete before frontend for same feature (API must exist)
