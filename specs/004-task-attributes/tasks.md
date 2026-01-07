# Tasks: Task Attributes (Dates, Priority, Categories)

**Input**: Design documents from `/specs/004-task-attributes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/task-api.md

**Tests**: Not explicitly requested in spec - focusing on manual verification per acceptance criteria

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (monorepo)**: `backend/app/`, `frontend/components/`, `frontend/lib/`
- All paths are relative to repository root

---

## Phase 1: Setup (Database Foundation)

**Purpose**: Verify database connection and prepare for schema changes

**Verification**: Database connection confirmed, current schema documented

- [X] T001 Use Neon MCP to list current `tasks` table columns and verify connection
  - **Command**: `mcp__neon__describe_table_schema` for `tasks` table
  - **Expected**: Columns include id, user_id, title, description, is_completed, created_at, updated_at (NO priority, due_date, category yet)

---

## Phase 2: Foundational (Database Migration)

**Purpose**: Add new columns to database - BLOCKS all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create Alembic migration script `add_task_attributes` in `backend/alembic/versions/`
  - **Command**: `cd backend && alembic revision -m "add task attributes priority due_date category"`
  - **File**: `backend/alembic/versions/XXXX_add_task_attributes.py`
  - **Content**: Add columns priority (String(10), default='medium'), due_date (DateTime, nullable), category (String(100), nullable)
  - **Content**: Add indexes ix_tasks_priority, ix_tasks_due_date, ix_tasks_category

- [X] T003 Apply Alembic migration to Neon database
  - **Command**: `cd backend && alembic upgrade head`
  - **Verification**: `mcp__neon__describe_table_schema` shows priority, due_date, category columns + indexes

- [X] T004 [P] Update `Task` SQLModel in `backend/app/models/task.py`
  - **File**: `backend/app/models/task.py`
  - **Changes**:
    - Add import: `from typing import Literal`
    - Add type alias: `PriorityLevel = Literal["low", "medium", "high"]`
    - Add to `TaskBase`: `priority: PriorityLevel = Field(default="medium")`
    - Add to `TaskBase`: `due_date: Optional[datetime] = Field(default=None)`
    - Add to `TaskBase`: `category: Optional[str] = Field(default=None, max_length=100)`
  - **Verification**: Python imports work, no syntax errors

- [X] T005 [P] Update `TaskCreate` schema in `backend/app/models/task.py`
  - **File**: `backend/app/models/task.py` (same file as T004, but different class)
  - **Changes**:
    - Add: `priority: Optional[PriorityLevel] = None`
    - Add: `due_date: Optional[datetime] = None`
    - Add: `category: Optional[str] = None`
  - **Verification**: Class definition valid

- [X] T006 [P] Update `TaskUpdate` schema in `backend/app/models/task.py`
  - **File**: `backend/app/models/task.py` (same file as T004, T005)
  - **Changes**:
    - Add: `priority: Optional[PriorityLevel] = Field(default=None)`
    - Add: `due_date: Optional[datetime] = Field(default=None)`
    - Add: `category: Optional[str] = Field(default=None, max_length=100)`
  - **Verification**: Class definition valid, all fields Optional

- [X] T007 Verify backend API endpoints automatically handle new fields
  - **File**: `backend/app/api/tasks.py` (READ ONLY - verify no changes needed)
  - **Verification**: FastAPI Pydantic models auto-accept new fields in POST/PUT requests
  - **Test Command**: `curl -X POST http://localhost:8000/api/tasks -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Test Task", "priority": "high", "due_date": "2026-01-15T23:59:59Z", "category": "Work"}'`
  - **Expected**: 201 Created with task object including new fields

**Checkpoint**: Foundation ready - database schema updated, backend models support new fields, user story implementation can now begin

---

## Phase 3: User Story 1 - Set Task Priority (Priority: P1) 🎯 MVP

**Goal**: Users can assign priority levels (low/medium/high) to tasks and see colored badges

**Independent Test**: Create task with "High" priority → red badge displays on task card

### Implementation for User Story 1

- [X] T008 [P] [US1] Install Shadcn `select` component for priority dropdown
  - **Command**: `cd frontend && npx shadcn@latest add select`
  - **File**: `frontend/components/ui/select.tsx` (created by command)
  - **Verification**: Component file exists, imports work

- [X] T009 [P] [US1] Install Shadcn `badge` component for priority display
  - **Command**: `cd frontend && npx shadcn@latest add badge`
  - **File**: `frontend/components/ui/badge.tsx` (created by command)
  - **Verification**: Component file exists, imports work

- [X] T010 [P] [US1] Update `Task` TypeScript interface in `frontend/types/task.ts`
  - **File**: `frontend/types/task.ts`
  - **Changes**:
    - Add type: `export type PriorityLevel = 'low' | 'medium' | 'high';`
    - Add to `Task` interface: `priority: PriorityLevel;`
    - Add to `TaskCreateInput`: `priority?: PriorityLevel;`
    - Add to `TaskUpdateInput`: `priority?: PriorityLevel;`
  - **Verification**: TypeScript compiles without errors

- [X] T011 [US1] Add priority utility function in `frontend/lib/utils.ts`
  - **File**: `frontend/lib/utils.ts`
  - **Content**: Add function `getPriorityVariant(priority: PriorityLevel)` that returns 'destructive' (high), 'default' (medium), or 'secondary' (low)
  - **Verification**: Function exports correctly

- [X] T012 [US1] Add priority selector to `CreateTaskForm` component
  - **File**: `frontend/components/CreateTaskForm.tsx`
  - **Changes**:
    - Import: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
    - Add state: `const [priority, setPriority] = useState<PriorityLevel>('medium');`
    - Add UI: `<Select>` with options low/medium/high after description input
    - Update mutation: Include `priority` in `createTask.mutate()` data
  - **Verification**: Form renders with priority dropdown

- [X] T013 [US1] Add priority badge display to `TaskCard` component (view mode)
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Import: `Badge`, `getPriorityVariant`
    - Add to card content (around line 180): `<Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>`
  - **Verification**: Task card shows colored badge (High=Red, Medium=Yellow, Low=Blue/Gray)

- [X] T014 [US1] Add priority selector to `TaskCard` edit mode
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Add state: `const [editedPriority, setEditedPriority] = useState(task.priority);`
    - Add UI: `<Select>` in edit mode with priority options
    - Update mutation: Include `priority: editedPriority` in `updateTask.mutate()` data
  - **Verification**: Edit mode allows changing priority

**Checkpoint US1**: At this point, User Story 1 should be fully functional
- **Test**: Create task with "High" priority → red badge displays ✅
- **Test**: Edit task to change "High" → "Low" → blue/gray badge displays ✅
- **Test**: Create task without selecting priority → defaults to "Medium" yellow badge ✅

---

## Phase 4: User Story 2 - Set Task Due Date (Priority: P2)

**Goal**: Users can set due dates on tasks using calendar picker and see formatted dates

**Independent Test**: Create task with due date "January 15, 2026" → displays "Jan 15" on task card

### Implementation for User Story 2

- [X] T015 [P] [US2] Install Shadcn `calendar` component for date picker
  - **Command**: `cd frontend && npx shadcn@latest add calendar`
  - **File**: `frontend/components/ui/calendar.tsx` (created by command)
  - **Verification**: Component file exists

- [X] T016 [P] [US2] Install Shadcn `popover` component for calendar wrapper
  - **Command**: `cd frontend && npx shadcn@latest add popover`
  - **File**: `frontend/components/ui/popover.tsx` (created by command)
  - **Verification**: Component file exists

- [X] T017 [P] [US2] Update `Task` TypeScript interface for due_date in `frontend/types/task.ts`
  - **File**: `frontend/types/task.ts`
  - **Changes**:
    - Add to `Task` interface: `due_date: string | null;` (ISO 8601 datetime string)
    - Add to `TaskCreateInput`: `due_date?: string | null;`
    - Add to `TaskUpdateInput`: `due_date?: string | null;`
  - **Verification**: TypeScript compiles without errors

- [X] T018 [US2] Add date formatting utility in `frontend/lib/utils.ts`
  - **File**: `frontend/lib/utils.ts`
  - **Content**: Add function `formatDueDate(isoString: string | null)` using date-fns (isToday → "Today", isTomorrow → "Tomorrow", else → "MMM d")
  - **Imports**: `import { format, isToday, isTomorrow } from 'date-fns';`
  - **Verification**: Function exports correctly, date-fns installed

- [X] T019 [US2] Add due date picker to `CreateTaskForm` component
  - **File**: `frontend/components/CreateTaskForm.tsx`
  - **Changes**:
    - Import: `Popover`, `PopoverTrigger`, `PopoverContent`, `Calendar`, `format` from date-fns
    - Add state: `const [dueDate, setDueDate] = useState<Date | undefined>();`
    - Add UI: `<Popover>` with `<Calendar mode="single" selected={dueDate} onSelect={setDueDate} />`
    - Update mutation: Include `due_date: dueDate ? dueDate.toISOString() : null` in data
  - **Verification**: Form renders with calendar picker

- [X] T020 [US2] Add due date display to `TaskCard` component (view mode)
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Import: `formatDueDate`
    - Add to card content: `{task.due_date && <span>📅 {formatDueDate(task.due_date)}</span>}`
  - **Verification**: Task card shows formatted due date ("Jan 15", "Tomorrow", "Today")

- [X] T021 [US2] Add due date picker to `TaskCard` edit mode
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Add state: `const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(task.due_date ? new Date(task.due_date) : undefined);`
    - Add UI: `<Popover>` + `<Calendar>` in edit mode
    - Add clear button: Allow setting dueDate to undefined
    - Update mutation: Include `due_date: editedDueDate ? editedDueDate.toISOString() : null` in data
  - **Verification**: Edit mode allows changing/clearing due date

**Checkpoint US2**: At this point, User Stories 1 AND 2 should both work independently
- **Test**: Create task with due date "Jan 15, 2026" → displays "Jan 15" ✅
- **Test**: Create task with due date tomorrow → displays "Tomorrow" ✅
- **Test**: Edit task to clear due date → no date shown ✅
- **Test**: Reopen edit form → due date persists in picker ✅

---

## Phase 5: User Story 3 - Categorize Tasks (Priority: P3)

**Goal**: Users can assign categories (free text) to tasks and see them as tags

**Independent Test**: Create task with category "Work" → tag displays on task card

### Implementation for User Story 3

- [X] T022 [P] [US3] Update `Task` TypeScript interface for category in `frontend/types/task.ts`
  - **File**: `frontend/types/task.ts`
  - **Changes**:
    - Add to `Task` interface: `category: string | null;`
    - Add to `TaskCreateInput`: `category?: string | null;`
    - Add to `TaskUpdateInput`: `category?: string | null;`
  - **Verification**: TypeScript compiles without errors

- [X] T023 [US3] Add category input to `CreateTaskForm` component
  - **File**: `frontend/components/CreateTaskForm.tsx`
  - **Changes**:
    - Import: `Input` (already exists)
    - Add state: `const [category, setCategory] = useState('');`
    - Add UI: `<Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional, e.g. Work)" maxLength={100} />`
    - Update mutation: Include `category: category || null` in data
  - **Verification**: Form renders with category text input

- [X] T024 [US3] Add category tag display to `TaskCard` component (view mode)
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Add to card content: `{task.category && <span className="text-xs px-2 py-1 bg-secondary rounded">{task.category}</span>}`
  - **Verification**: Task card shows category as small tag

- [X] T025 [US3] Add category input to `TaskCard` edit mode
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Add state: `const [editedCategory, setEditedCategory] = useState(task.category || '');`
    - Add UI: `<Input>` in edit mode for category
    - Update mutation: Include `category: editedCategory || null` in data
  - **Verification**: Edit mode allows changing/clearing category

**Checkpoint US3**: At this point, User Stories 1, 2, AND 3 should all work independently
- **Test**: Create task with category "Work" → tag displays ✅
- **Test**: Edit task to add category "Personal" → tag displays ✅
- **Test**: Create task without category → no tag displays ✅
- **Test**: Type new category name → stored as plain text ✅

---

## Phase 6: User Story 4 - View Enhanced Task Cards (Priority: P1)

**Goal**: Task cards display all attributes (priority badge, due date, category tag) clearly

**Independent Test**: Create task with all attributes → see red badge + "Jan 15" + "Work" tag on card

### Implementation for User Story 4

- [X] T026 [US4] Verify and refine layout of all attributes in `TaskCard` view mode
  - **File**: `frontend/components/TaskCard.tsx` (review existing changes from US1, US2, US3)
  - **Changes**:
    - Ensure attributes display in logical order: Priority badge → Due date → Category tag
    - Ensure proper spacing/alignment (flex gap-2)
    - Ensure attributes only show when present (conditional rendering)
  - **Verification**: Task card with all attributes looks clean and organized

- [X] T027 [US4] Handle edge cases in `TaskCard` display
  - **File**: `frontend/components/TaskCard.tsx`
  - **Changes**:
    - Long category names (100 chars): Add `className="truncate max-w-[200px]"` to category span
    - Task with only some attributes: Verify no empty placeholders
    - Multiple tasks with different priorities: Verify distinguishable colors
  - **Verification**: Edge cases handled gracefully

**Checkpoint US4**: At this point, all user stories should be fully functional
- **Test**: Task with all attributes (high priority + Jan 15 + "Work") → all visible ✅
- **Test**: Task with only priority → only badge visible ✅
- **Test**: Multiple tasks with different priorities → distinguishable by color ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ensure backward compatibility, performance, and final verification

- [X] T028 Verify backward compatibility: existing tasks load correctly
  - **Verification**: Login → Dashboard → Old tasks (created before migration) show default values (priority="medium", due_date=null, category=null) without errors
  - **Test Command**: `mcp__neon__run_sql` to query tasks created before migration
  - **Expected**: All old tasks have priority='medium', due_date=NULL, category=NULL

- [X] T029 Run full regression test suite
  - **Tests**:
    - Login/logout still works ✅
    - Create task with title only (no new fields) → defaults applied ✅
    - Update task without touching new fields → unchanged ✅
    - JWT authentication unchanged ✅
  - **Verification**: All existing functionality works

- [X] T030 Run new feature end-to-end test
  - **Test Workflow** (SC-008: <60 seconds):
    1. Create task with priority="high", due_date="2026-01-15T23:59:59Z", category="Work"
    2. View task card → see red badge + "Jan 15" + "Work" tag
    3. Edit task → change priority to "low", clear due date, change category to "Personal"
    4. Save → verify changes persist
    5. Reload page → verify persistence
  - **Verification**: Full workflow completes in <60 seconds

- [X] T031 Performance verification
  - **Tests**:
    - Task creation with all attributes completes in <2s (SC-007) ✅
    - Attribute display after save in <5s (SC-001, SC-002) ✅
  - **Verification**: Performance targets met

- [X] T032 Run quickstart.md validation
  - **File**: `specs/004-task-attributes/quickstart.md`
  - **Action**: Follow step-by-step guide and verify all commands work
  - **Verification**: Quickstart guide is accurate and complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify database connection immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Priority): Can start after Foundational - No dependencies on other stories
  - US2 (Due Date): Can start after Foundational - No dependencies on other stories
  - US3 (Category): Can start after Foundational - No dependencies on other stories
  - US4 (Enhanced Display): Depends on US1, US2, US3 completion (integrates all attributes)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (Priority - P1)**: Independent - Can start after Foundational
- **User Story 2 (Due Date - P2)**: Independent - Can start after Foundational (parallel with US1)
- **User Story 3 (Category - P3)**: Independent - Can start after Foundational (parallel with US1, US2)
- **User Story 4 (Enhanced Display - P1)**: Integrative - Depends on US1 + US2 + US3 (verifies all attributes display correctly)

### Within Each User Story

- US1: Install components (T008, T009) → Update types (T010) → Add utility (T011) → Update form (T012) → Update card view (T013) → Update card edit (T014)
- US2: Install components (T015, T016) → Update types (T017) → Add utility (T018) → Update form (T019) → Update card view (T020) → Update card edit (T021)
- US3: Update types (T022) → Update form (T023) → Update card view (T024) → Update card edit (T025)
- US4: Verify layout (T026) → Handle edge cases (T027)

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T004, T005, T006 can run in parallel (different classes in same file - coordinate via comments)

**Across User Stories (after Foundational complete)**:
- US1 (Priority) and US2 (Due Date) can be developed in parallel
- US1 (Priority) and US3 (Category) can be developed in parallel
- US2 (Due Date) and US3 (Category) can be developed in parallel

**Within User Story 1**:
- T008 (select component) and T009 (badge component) can install in parallel
- T010 (types) can run in parallel with T011 (utility)

**Within User Story 2**:
- T015 (calendar) and T016 (popover) can install in parallel
- T017 (types) and T018 (utility) can run in parallel

---

## Parallel Example: User Story 1 (Priority)

```bash
# Install Shadcn components together:
Task: "Install Shadcn select component" (T008)
Task: "Install Shadcn badge component" (T009)

# Update types and utilities together:
Task: "Update Task TypeScript interface for priority" (T010)
Task: "Add priority utility function" (T011)
```

---

## Parallel Example: User Story 2 (Due Date)

```bash
# Install Shadcn components together:
Task: "Install Shadcn calendar component" (T015)
Task: "Install Shadcn popover component" (T016)

# Update types and utilities together:
Task: "Update Task TypeScript interface for due_date" (T017)
Task: "Add date formatting utility" (T018)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 4 Only)

**Minimum Viable Product**: Priority management with enhanced display

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T007) - CRITICAL
3. Complete Phase 3: User Story 1 - Priority (T008-T014)
4. Complete Phase 6: User Story 4 - Enhanced Display (T026-T027) - verifies priority displays correctly
5. **STOP and VALIDATE**: Test US1 + US4 independently
6. Deploy/demo if ready

**MVP Delivers**: Users can set priority on tasks and see colored badges (P1 complete)

### Incremental Delivery (Full Feature)

1. Complete Setup + Foundational (Phase 1-2) → Foundation ready
2. Add User Story 1 (Priority) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Due Date) → Test independently → Deploy/Demo
4. Add User Story 3 (Category) → Test independently → Deploy/Demo
5. Verify User Story 4 (Enhanced Display) → All attributes work together → Deploy/Demo
6. Add Polish (Phase 7) → Final validation → Production deployment
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Priority) - T008-T014
   - **Developer B**: User Story 2 (Due Date) - T015-T021
   - **Developer C**: User Story 3 (Category) - T022-T025
3. Team reconvenes for User Story 4 (Enhanced Display) - T026-T027
4. Team completes Polish together - T028-T032

---

## Notes

- [P] tasks = different files or different classes, can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story delivers independent value and is testable on its own
- User Story 4 integrates all attributes but each attribute (US1-US3) works independently
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All changes are additive - no modification of existing features (FR-011, FR-012)
- Backward compatibility is critical - old tasks must load without errors (SC-004, SC-006)

---

## Task Summary

**Total Tasks**: 32

**Tasks by Phase**:
- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 6 tasks (BLOCKING)
- Phase 3 (US1 - Priority): 7 tasks
- Phase 4 (US2 - Due Date): 7 tasks
- Phase 5 (US3 - Category): 4 tasks
- Phase 6 (US4 - Enhanced Display): 2 tasks
- Phase 7 (Polish): 5 tasks

**Tasks by User Story**:
- US1 (Priority): 7 tasks
- US2 (Due Date): 7 tasks
- US3 (Category): 4 tasks
- US4 (Enhanced Display): 2 tasks

**Parallel Opportunities**:
- Within Foundational: 3 tasks (T004, T005, T006)
- Within US1: 4 tasks (T008+T009, T010+T011)
- Within US2: 4 tasks (T015+T016, T017+T018)
- Across stories: US1, US2, US3 can run fully in parallel (20 tasks total)

**MVP Scope**: Phase 1-2 + US1 + US4 = 16 tasks (50% of total)

**Independent Test Criteria**:
- US1: Create task with high priority → red badge displays
- US2: Create task with due date → formatted date displays
- US3: Create task with category → tag displays
- US4: Create task with all attributes → all display correctly
