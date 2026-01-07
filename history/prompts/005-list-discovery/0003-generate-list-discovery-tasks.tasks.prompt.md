---
id: 0003
title: Generate List Discovery Tasks
stage: tasks
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-list-discovery
branch: 005-list-discovery
user: developer
command: /sp.tasks
labels: ["task-generation", "implementation", "list-discovery", "incremental-delivery"]
links:
  spec: specs/005-list-discovery/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-list-discovery/tasks.md
tests:
  - Format validation: All 27 tasks follow checklist format
  - User story independence validated
  - Verification commands included for all tasks
---

## Prompt

The plan `specs/005-list-discovery/plan.md` is approved.

Now, perform the **TASKS** phase of the Spec-Kit workflow.

**Action**: Create `specs/005-list-discovery/tasks.md`.

**Task Breakdown Strategy**:

**Phase 1: Backend Implementation (Agent: backend-dev-agent)**
1.  **Update Routes**: Modify `backend/app/api/routes/tasks.py`.
    * Add optional query params: `search`, `sort_by`, `order`, `priority`, `category`.
    * Implement the SQLModel query logic using `.where()` and `case()` for priority sort.
2.  **Verification**: Run a `curl` command to test searching for a known task.

**Phase 2: Frontend Logic (Agent: frontend-dev-agent)**
3.  **Hooks**: Create `useDebounce.ts` and `useTaskFilters.ts`.
4.  **API Client**: Update `frontend/lib/api.ts` to accept the `TaskFilters` object and convert it to a query string.

**Phase 3: Frontend UI (Agent: frontend-dev-agent)**
5.  **Components**: Create `TaskToolbar.tsx` using Shadcn Select/Input.
6.  **Integration**: Update `DashboardClient.tsx` to use the new hooks and Toolbar.
7.  **Refetch**: Ensure `useQuery` includes the filter object in its key (e.g., `['tasks', filters]`).

**Output Requirement**:
For every task, include a specific **Verification Command** (e.g., `curl` check or file check).

## Response snapshot

Generated comprehensive task breakdown with 27 atomic, testable tasks organized by user story priority:

**Task Organization by User Story (P1-P3)**:
- **Phase 1 - Setup**: 3 tasks (verify prerequisites: Spec 004 indexes, ShadcnUI components)
- **Phase 2 - Foundational**: 2 tasks (TaskFilters types, useDebounced hook) - BLOCKS all user stories
- **Phase 3 - User Story 1 (P1)**: 6 tasks - **Search Tasks by Keywords** (MVP)
  - Backend: Add search param, implement ILIKE filter
  - Frontend: useTaskFilters, useTaskList, API client, TaskToolbar search, dashboard integration
  - Independent test: Type "milk" → only "Buy milk" appears
- **Phase 4 - User Story 2 (P2)**: 5 tasks - **Sort by Priority/Due Date**
  - Backend: Add sort params, implement SQL CASE for priority sorting
  - Frontend: Add sort select to toolbar, update hooks and API
  - Independent test: Select "Highest Priority" → high tasks first
- **Phase 5 - User Story 3 (P2)**: 4 tasks - **Filter by Priority/Category**
  - Backend: Add filter params, implement WHERE clauses
  - Frontend: Add filter popover to toolbar, update hooks and API
  - Independent test: Filter "Work" category → only Work tasks shown
- **Phase 6 - User Story 4 (P3)**: 3 tasks - **URL Persistence**
  - Frontend: Clear filters button, EmptyState component, dashboard empty states
  - Independent test: Copy URL → clear filters → paste URL → filters restored
- **Phase 7 - Polish**: 4 tasks (loading states, error handling, acceptance validation, quickstart verification)

**Key Features**:
1. **All tasks follow strict checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
2. **Verification commands**: Every task includes specific curl/grep/ls command to verify completion
3. **User story independence**: Each story (US1-US4) is independently testable and deployable
4. **Parallel opportunities**: Identified 7 tasks marked [P] that can run in parallel
5. **Sequential constraints**: Documented file conflicts (tasks.py, TaskToolbar.tsx) requiring coordination
6. **MVP scope defined**: 11 tasks (Setup + Foundational + US1) deliver search functionality
7. **Incremental delivery strategy**: Sprint 1 (US1) → Sprint 2 (US2) → Sprint 3 (US3) → Sprint 4 (US4)

**Dependencies Documented**:
- Foundational phase BLOCKS all user stories
- US1, US2, US3 are independent (can be developed in parallel after Foundation)
- US4 depends on US1-US3 for full functionality
- Backend tasks T006 → T012 → T013 → T017 are sequential (same file)
- Frontend toolbar tasks T010 → T014 → T018 → T021 are sequential (same file)

**Success Criteria Validation**:
- Included measurement commands for all 6 success criteria from spec
- Network tab analysis for debouncing (SC-006)
- Performance monitoring for search/sort latency (SC-002, SC-003)
- User testing approach for efficiency metrics (SC-001, SC-005)

**Implementation Strategies**:
1. **MVP First** (Recommended): Setup + Foundation + US1 = 11 tasks, 2-3 hours
2. **Incremental Delivery** (Recommended): 4 sprints, one story per sprint
3. **Parallel Team**: After Foundation, 3 developers can work US1/US2/US3 simultaneously

## Outcome

- ✅ Impact: Complete, executable task breakdown ready for implementation. Each task is atomic (< 3 files), has specific file paths, verification commands, and clear acceptance criteria. Tasks organized by user story enable independent testing and incremental delivery.
- 🧪 Tests: Test tasks NOT included (not requested in spec). Validation via verification commands after each task. Success criteria measurement commands documented for post-implementation validation.
- 📁 Files: 1 file created (tasks.md with 27 tasks)
- 🔁 Next prompts: `/sp.implement` (execute tasks) or manually implement tasks sequentially
- 🧠 Reflection: Successfully mapped 4 user stories to 27 atomic tasks. MVP scope (US1 Search) is 11 tasks total. Backend and frontend tasks properly sequenced to avoid file conflicts. URL persistence handled as final polish (US4) since it enhances but doesn't block other stories. Verification commands enable self-service validation.

## Evaluation notes (flywheel)

- Failure modes observed: None. All tasks follow required checklist format and include verification commands.
- Graders run and results (PASS/FAIL): Format validation - PASS (all 27 tasks use checkbox + ID + story label + file path). Independence check - PASS (US1, US2, US3 are independently testable).
- Prompt variant (if applicable): Standard /sp.tasks workflow with emphasis on user story independence and incremental delivery
- Next experiment (smallest change to try): Consider adding explicit "Merge Checkpoint" tasks after backend file conflicts (e.g., after T013, merge tasks.py changes before T017) to make coordination more explicit
