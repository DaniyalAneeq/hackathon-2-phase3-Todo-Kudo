# Tasks: Task List Discovery (Search, Sort, Filter)

**Input**: Design documents from `/specs/005-list-discovery/`
**Prerequisites**: plan.md (architecture), spec.md (user stories), research.md (decisions), data-model.md (entities), contracts/api.md (API contract)

**Tests**: Test tasks are NOT included in this implementation as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story (P1-P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for FastAPI, `frontend/` for Next.js
- Backend: `backend/app/api/routes/`, `backend/app/models/`
- Frontend: `frontend/hooks/`, `frontend/components/`, `frontend/types/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify prerequisites and prepare development environment

- [x] T001 Verify Spec 004 indexes exist (priority, category, due_date) in backend/alembic/versions/df1e7b8409fc_*.py
  - **Verification**: `cd backend && alembic history && grep -E "(priority|category|due_date)" alembic/versions/df1e7b8409fc_*.py`

- [x] T002 [P] Verify ShadcnUI Select component exists in frontend/components/ui/select.tsx
  - **Verification**: `ls frontend/components/ui/select.tsx || echo "Need to run: npx shadcn@latest add select"`

- [x] T003 [P] Verify ShadcnUI Popover component exists in frontend/components/ui/popover.tsx
  - **Verification**: `ls frontend/components/ui/popover.tsx || echo "Need to run: npx shadcn@latest add popover"`

**Checkpoint**: Prerequisites verified - implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and contracts that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create TaskFilters TypeScript interface in frontend/types/filters.ts
  - **Verification**: `grep -q "interface TaskFilters" frontend/types/filters.ts && grep -q "SORT_OPTIONS" frontend/types/filters.ts`

- [x] T005 [P] Create useDebounced hook in frontend/hooks/useDebounced.ts
  - **Verification**: `grep -q "export function useDebounced" frontend/hooks/useDebounced.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search Tasks by Keywords (Priority: P1) 🎯 MVP

**Goal**: Enable users to search tasks by title or description with case-insensitive matching

**Independent Test**: Create tasks with distinct keywords, search for one keyword, verify only matching tasks appear

### Backend Implementation for User Story 1

- [x] T006 [US1] Add search query parameter to GET /api/tasks in backend/app/api/routes/tasks.py
  - Modify `list_tasks` function signature: add `search: Optional[str] = Query(None, max_length=255)`
  - Implement search filter: `if search: statement = statement.where((Task.title.ilike(f"%{search}%")) | (Task.description.ilike(f"%{search}%")))`
  - **Verification**: `cd backend && fastapi dev main.py` then `curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?search=test"`

### Frontend Implementation for User Story 1

- [x] T007 [US1] Create useTaskFilters hook in frontend/hooks/useTaskFilters.ts
  - Implement URL state management with `useSearchParams()` and `router.push()`
  - Expose `{ filters, setFilters, clearFilters }`
  - Map `search` → `q` URL param
  - **Verification**: `grep -q "useSearchParams" frontend/hooks/useTaskFilters.ts && grep -q "setFilters" frontend/hooks/useTaskFilters.ts`

- [x] T008 [US1] Create useTaskList React Query hook in frontend/hooks/useTaskList.ts
  - Use `queryKey: ['tasks', filters]` to trigger refetch on filter changes
  - Call `api.getTasks(filters)`
  - **Verification**: `grep -q "useQuery" frontend/hooks/useTaskList.ts && grep -q "'tasks', filters" frontend/hooks/useTaskList.ts`

- [x] T009 [US1] Update getTasks function in frontend/lib/api.ts to accept TaskFilters
  - Build URLSearchParams from filters object
  - Map `filters.search` → `search` query param
  - **Verification**: `grep -q "TaskFilters" frontend/lib/api.ts && grep -q "URLSearchParams" frontend/lib/api.ts`

- [x] T010 [US1] Create search input section of TaskToolbar in frontend/components/TaskToolbar.tsx
  - Create TaskToolbar component with search input only
  - Implement debounced search: `const debouncedSearch = useDebounced(searchInput, 300)`
  - Use `useEffect` to call `setFilters({ search: debouncedSearch })`
  - Use Shadcn Input with Search icon
  - **Verification**: `grep -q "useDebounced" frontend/components/TaskToolbar.tsx && grep -q "Search" frontend/components/TaskToolbar.tsx`

- [x] T011 [US1] Integrate TaskToolbar (search only) into DashboardClient in frontend/app/dashboard/DashboardClient.tsx
  - Import and render `<TaskToolbar />` above task list
  - Use `useTaskList()` hook to fetch filtered tasks
  - **Verification**: `grep -q "TaskToolbar" frontend/app/dashboard/DashboardClient.tsx && grep -q "useTaskList" frontend/app/dashboard/DashboardClient.tsx`

**Checkpoint**: At this point, search functionality should work end-to-end (type in search box → see filtered tasks)

**User Story 1 Verification Command**:
```bash
# 1. Start backend: cd backend && fastapi dev main.py
# 2. Start frontend: cd frontend && npm run dev
# 3. Navigate to http://localhost:3000/dashboard
# 4. Create tasks: "Buy milk", "Buy groceries", "Work on project"
# 5. Type "milk" in search box
# 6. Verify: Only "Buy milk" task appears
# 7. Clear search → verify all tasks reappear
```

---

## Phase 4: User Story 2 - Sort Tasks by Priority or Due Date (Priority: P2)

**Goal**: Enable users to sort task list by priority (high > medium > low) or due date (earliest first)

**Independent Test**: Create tasks with various priorities and due dates, change sort option, verify list reorders correctly

### Backend Implementation for User Story 2

- [x] T012 [P] [US2] Add sort_by and order query parameters to GET /api/tasks in backend/app/api/routes/tasks.py
  - Add parameters: `sort_by: Literal["created_at", "due_date", "priority"] = Query("created_at")`, `order: Literal["asc", "desc"] = Query("desc")`
  - **Verification**: `grep -q "sort_by:" backend/app/api/routes/tasks.py && grep -q 'Literal\["created_at", "due_date", "priority"\]' backend/app/api/routes/tasks.py`

- [x] T013 [US2] Implement sorting logic with SQL CASE for priority in backend/app/api/routes/tasks.py
  - Import: `from sqlalchemy import case`
  - For `sort_by == "priority"`: Create `priority_order = case((Task.priority == "high", 3), (Task.priority == "medium", 2), (Task.priority == "low", 1), else_=0)`
  - For `sort_by == "due_date"`: Use `Task.due_date.asc().nullslast()` or `Task.due_date.desc().nullslast()`
  - For `sort_by == "created_at"`: Use `Task.created_at.asc()` or `.desc()`
  - Apply: `statement = statement.order_by(order_expr)`
  - **Verification**: `curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?sort_by=priority&order=desc"` (high priority tasks first)

### Frontend Implementation for User Story 2

- [x] T014 [US2] Add sort select to TaskToolbar in frontend/components/TaskToolbar.tsx
  - Use Shadcn Select with SORT_OPTIONS: "Newest", "Oldest", "Highest Priority", "Due Soon"
  - On change, call `setFilters({ sortBy, order })` based on selected option
  - **Verification**: `grep -q "Select" frontend/components/TaskToolbar.tsx && grep -q "SORT_OPTIONS" frontend/components/TaskToolbar.tsx`

- [x] T015 [US2] Update useTaskFilters to handle sortBy and order in frontend/hooks/useTaskFilters.ts
  - Map `filters.sortBy` → `sort_by` URL param
  - Map `filters.order` → `order` URL param
  - **Verification**: `grep -q "sort_by" frontend/hooks/useTaskFilters.ts && grep -q "order" frontend/hooks/useTaskFilters.ts`

- [x] T016 [US2] Update getTasks API client to include sort params in frontend/lib/api.ts
  - Add `sortBy` and `order` to URLSearchParams building logic
  - **Verification**: `grep -q "sort_by" frontend/lib/api.ts && grep -q "order" frontend/lib/api.ts`

**Checkpoint**: At this point, sorting by created_at, due_date, and priority should all work

**User Story 2 Verification Command**:
```bash
# 1. Ensure backend and frontend running
# 2. Navigate to http://localhost:3000/dashboard
# 3. Create tasks with different priorities: high, medium, low
# 4. Select "Highest Priority" from sort dropdown
# 5. Verify: High-priority tasks appear first, then medium, then low
# 6. Select "Due Soon"
# 7. Verify: Tasks ordered by due_date, tasks without due dates at end
```

---

## Phase 5: User Story 3 - Filter Tasks by Priority or Category (Priority: P2)

**Goal**: Enable users to filter tasks by priority level or category to create focused views

**Independent Test**: Create tasks in different categories with different priorities, apply filter, verify only matching tasks display

### Backend Implementation for User Story 3

- [x] T017 [P] [US3] Add priority and category filter parameters to GET /api/tasks in backend/app/api/routes/tasks.py
  - Add parameters: `priority: Optional[Literal["low", "medium", "high"]] = Query(None)`, `category: Optional[str] = Query(None, max_length=100)`
  - Implement filters: `if priority: statement = statement.where(Task.priority == priority)`, `if category: statement = statement.where(Task.category == category)`
  - **Verification**: `curl -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?priority=high"` (only high priority tasks)

### Frontend Implementation for User Story 3

- [x] T018 [US3] Add filter popover to TaskToolbar in frontend/components/TaskToolbar.tsx
  - Use Shadcn Popover with Button trigger labeled "Filter"
  - Inside popover: Priority Select (All/High/Medium/Low) and Category Input
  - On change, call `setFilters({ priority, category })`
  - Show active filter count badge on button if filters active
  - **Verification**: `grep -q "Popover" frontend/components/TaskToolbar.tsx && grep -q "priority" frontend/components/TaskToolbar.tsx && grep -q "category" frontend/components/TaskToolbar.tsx`

- [x] T019 [US3] Update useTaskFilters to handle priority and category in frontend/hooks/useTaskFilters.ts
  - Map `filters.priority` → `priority` URL param
  - Map `filters.category` → `category` URL param
  - **Verification**: `grep -q "priority" frontend/hooks/useTaskFilters.ts && grep -q "category" frontend/hooks/useTaskFilters.ts`

- [x] T020 [US3] Update getTasks API client to include filter params in frontend/lib/api.ts
  - Add `priority` and `category` to URLSearchParams building logic
  - **Verification**: `grep -q "priority" frontend/lib/api.ts && grep -q "category" frontend/lib/api.ts`

**Checkpoint**: At this point, filtering by priority and category should both work, combinable with search and sort

**User Story 3 Verification Command**:
```bash
# 1. Ensure backend and frontend running
# 2. Navigate to http://localhost:3000/dashboard
# 3. Create tasks: "Work project" (category: Work, priority: high), "Buy milk" (category: Personal, priority: low)
# 4. Click Filter button, select priority "high"
# 5. Verify: Only high-priority tasks appear
# 6. Clear priority, enter category "Work"
# 7. Verify: Only Work tasks appear
# 8. Combine: search "project" + priority "high" + category "Work"
# 9. Verify: Only tasks matching ALL criteria appear
```

---

## Phase 6: User Story 4 - Persist Filters in URL (Priority: P3)

**Goal**: Save filter settings in URL query parameters so users can bookmark and share filtered views

**Independent Test**: Apply filters, copy URL, clear filters, paste URL, verify filters are restored

### Frontend Implementation for User Story 4

- [x] T021 [US4] Add Clear Filters button to TaskToolbar in frontend/components/TaskToolbar.tsx
  - Show button with X icon only when `hasActiveFilters` is true
  - On click, call `clearFilters()` function
  - **Verification**: `grep -q "clearFilters" frontend/components/TaskToolbar.tsx && grep -q "hasActiveFilters" frontend/components/TaskToolbar.tsx`

- [x] T022 [US4] Create EmptyState component in frontend/components/EmptyState.tsx
  - Accept `message` and optional `action` props
  - Display centered message with optional action button
  - **Verification**: `grep -q "EmptyState" frontend/components/EmptyState.tsx && grep -q "message" frontend/components/EmptyState.tsx`

- [x] T023 [US4] Update DashboardClient to handle empty states in frontend/app/dashboard/DashboardClient.tsx
  - Check if `tasks.length === 0`
  - If `hasActiveFilters`: Show `<EmptyState message="No tasks found matching..." action={<ClearFiltersButton />} />`
  - If no filters: Show `<EmptyState message="No tasks yet" action={<CreateTaskButton />} />`
  - **Verification**: `grep -q "EmptyState" frontend/app/dashboard/DashboardClient.tsx && grep -q "hasActiveFilters" frontend/app/dashboard/DashboardClient.tsx`

**Checkpoint**: At this point, all filter state persists in URL, empty states work correctly

**User Story 4 Verification Command**:
```bash
# 1. Ensure backend and frontend running
# 2. Navigate to http://localhost:3000/dashboard
# 3. Apply filters: search "project", priority "high", sort "Due Soon"
# 4. Copy URL from address bar (should contain: ?q=project&priority=high&sort_by=due_date&order=asc)
# 5. Click Clear Filters button → all tasks show
# 6. Paste copied URL into address bar and press Enter
# 7. Verify: Filters are restored (search, priority, sort all active)
# 8. Bookmark URL, close tab, reopen bookmark
# 9. Verify: Filtered view is preserved
```

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T024 [P] Add loading states to DashboardClient in frontend/app/dashboard/DashboardClient.tsx
  - Check `isLoading` from `useTaskList()` hook
  - Display loading spinner or skeleton while fetching
  - **Verification**: `grep -q "isLoading" frontend/app/dashboard/DashboardClient.tsx`

- [x] T025 [P] Add error handling to DashboardClient in frontend/app/dashboard/DashboardClient.tsx
  - Check `error` from `useTaskList()` hook
  - Display error toast or message if fetch fails
  - **Verification**: `grep -q "error" frontend/app/dashboard/DashboardClient.tsx`

- [x] T026 Verify all acceptance scenarios from spec.md
  - Run through each user story's acceptance scenarios manually
  - Document any failing scenarios in issue tracker
  - **Verification**: Manual testing checklist completion

- [x] T027 Run quickstart.md validation steps
  - Follow quickstart.md implementation guide
  - Verify all curl commands work as documented
  - **Verification**: `cd specs/005-list-discovery && cat quickstart.md` (follow testing checklist)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Search**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ INDEPENDENT
- **User Story 2 (P2) - Sort**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ INDEPENDENT
- **User Story 3 (P2) - Filter**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ INDEPENDENT
- **User Story 4 (P3) - URL Persistence**: Depends on US1, US2, US3 for full functionality - Adds UI polish

### Within Each User Story

- Backend query parameter changes before frontend hook updates
- Frontend types/hooks before components
- Components before integration into dashboard
- Each story should be testable independently before moving to next

### Parallel Opportunities

**Setup Phase**:
- T002 and T003 can run in parallel (different files)

**Foundational Phase**:
- T004 and T005 can run in parallel (different files)

**User Story Backend**:
- T006 (US1 backend), T012 (US2 backend), T017 (US3 backend) touch same file → MUST be sequential
- Order: T006 → T012 → T013 → T017

**User Story Frontend Hooks**:
- T007 (useTaskFilters), T008 (useTaskList), T005 (useDebounced) - different files but dependencies
- Order: T005 (useDebounced) first, then T007 and T008 can run parallel

**User Story Frontend Components**:
- T010 (TaskToolbar search), T014 (add sort to TaskToolbar), T018 (add filter to TaskToolbar) touch same file → MUST be sequential
- T022 (EmptyState) can run in parallel with T010
- Order: T010 → T014 → T018 → T021 (sequential for TaskToolbar)

**Across User Stories** (if multiple developers):
- Once Foundational complete, User Story 1, 2, and 3 backend tasks can be worked by different people
- Merge conflicts in tasks.py require coordination or sequential commits

---

## Parallel Example: After Foundational Phase

### Scenario: Single Developer (Sequential)
```bash
# MVP Path (User Story 1 only):
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 Search) → Deploy MVP

# Full Feature (Sequential by priority):
Phase 1 → Phase 2 → US1 (Search) → US2 (Sort) → US3 (Filter) → US4 (URL) → Polish
```

### Scenario: Two Developers (Parallel)
```bash
# After Phase 1 + 2 complete:
Developer A: US1 (Search) + US2 (Sort)
Developer B: US3 (Filter) + US4 (URL Persistence)

# Note: Backend tasks.py will have merge conflicts - coordinate commits
```

### Scenario: Three Developers (Maximum Parallelism)
```bash
# After Phase 1 + 2 complete:
Developer A: US1 (Search) - T006→T007→T008→T009→T010→T011
Developer B: US2 (Sort) - Wait for T006, then T012→T013→T014→T015→T016
Developer C: US3 (Filter) - Wait for T013, then T017→T018→T019→T020

# Then all developers converge for US4 and Polish
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

**Goal**: Ship search functionality as quickly as possible

1. ✅ Complete Phase 1: Setup (verify prerequisites)
2. ✅ Complete Phase 2: Foundational (types and hooks)
3. ✅ Complete Phase 3: User Story 1 (search only)
4. **STOP and VALIDATE**: Test search independently
5. **Deploy MVP**: Users can now search tasks!
6. Gather feedback before building sort/filter

**Time Estimate**: 2-3 hours for MVP (based on quickstart.md)

### Incremental Delivery (Recommended)

**Goal**: Add features incrementally without breaking existing functionality

1. **Sprint 1**: Setup + Foundational + US1 (Search) → Deploy
   - Users can search tasks
2. **Sprint 2**: US2 (Sort) → Deploy
   - Users can search AND sort tasks
3. **Sprint 3**: US3 (Filter) → Deploy
   - Users can search, sort, AND filter tasks
4. **Sprint 4**: US4 (URL Persistence) + Polish → Deploy
   - Full feature with bookmarkable URLs

### All-at-Once (Not Recommended)

**Goal**: Build complete feature before deploying

1. Complete all phases (Setup → Foundational → US1 → US2 → US3 → US4 → Polish)
2. Test everything together
3. Deploy complete feature

**Risk**: Longer time to value, harder to validate each feature independently

---

## Task Count Summary

- **Setup**: 3 tasks
- **Foundational**: 2 tasks
- **User Story 1 (Search)**: 6 tasks
- **User Story 2 (Sort)**: 5 tasks
- **User Story 3 (Filter)**: 4 tasks
- **User Story 4 (URL Persistence)**: 3 tasks
- **Polish**: 4 tasks

**Total**: 27 tasks

**MVP Scope** (US1 only): 11 tasks (Setup + Foundational + US1)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story is independently testable**: Can validate search without sort/filter, sort without filter, etc.
- **No test tasks included**: Tests were not explicitly requested in specification
- **Verification commands**: Each task includes a specific command to verify completion
- **Commit strategy**: Commit after each user story phase completion (T011, T016, T020, T023, T027)
- **Backend note**: Tasks T006, T012, T017 all modify `backend/app/api/routes/tasks.py` - merge conflicts possible if worked in parallel
- **Frontend note**: Tasks T010, T014, T018, T021 all modify `frontend/components/TaskToolbar.tsx` - must be sequential

---

## Success Criteria Validation

After completing all tasks, validate against spec success criteria:

- **SC-001**: Users locate task via search in < 5 seconds (50+ tasks) → Manual user testing
- **SC-002**: Search returns results in < 1 second (1000 tasks) → Backend performance monitoring
- **SC-003**: Sort operations complete in < 1 second → Backend performance monitoring
- **SC-004**: Filters persist across page reload → Verify URL contains query params, reload works
- **SC-005**: 90% of users locate task within 3 interactions → User testing with task tracking
- **SC-006**: Debouncing reduces API calls by 70% → Network tab analysis during typing

**Measurement Commands**:
```bash
# Backend performance (requires 1000 test tasks):
curl -w "\nTime: %{time_total}s\n" -H "Authorization: Bearer <TOKEN>" "http://localhost:8000/api/tasks?search=test"

# Frontend debouncing (open browser dev tools network tab):
# Type "project" quickly in search box
# Count: Should see 1 request (after 300ms), not 7 requests (one per keystroke)

# URL persistence:
curl "http://localhost:3000/dashboard?q=project&priority=high"
# Verify: Search box shows "project", filter shows "high"
```
