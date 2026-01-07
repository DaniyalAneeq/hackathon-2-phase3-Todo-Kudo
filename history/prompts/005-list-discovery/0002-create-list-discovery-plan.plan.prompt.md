---
id: 0002
title: Create List Discovery Plan
stage: plan
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-list-discovery
branch: 005-list-discovery
user: developer
command: /sp.plan
labels: ["architecture", "planning", "list-discovery", "filtering", "sorting", "search"]
links:
  spec: specs/005-list-discovery/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-list-discovery/plan.md
  - specs/005-list-discovery/research.md
  - specs/005-list-discovery/data-model.md
  - specs/005-list-discovery/contracts/api.md
  - specs/005-list-discovery/quickstart.md
tests:
  - Constitution check passed (all 7 principles)
  - Verified no database migration needed
  - Validated backward compatibility
---

## Prompt

The specification `specs/005-list-discovery.md` is approved.

Now, perform the **PLAN** phase of the Spec-Kit workflow.

**Action**: Create `specs/005-list-discovery/plan.md`.

**Requirements for the Plan**:
1.  **Backend Logic**:
    * Explain how to modify `GET /api/tasks` to handle optional params.
    * **Crucial**: Detail the "Priority Sort" logic. Will we use a SQL `CASE` statement or a Python dictionary map? (Recommendation: SQL `CASE` via SQLAlchemy/SQLModel is better for pagination later).
2.  **Frontend Logic**:
    * Explain the "URL Sync" pattern. We need a hook (e.g., `useTaskFilters`) that reads `useSearchParams` and pushes to `router.push`.
    * Explain how React Query will react to the URL change (it should auto-refetch when the `queryKey` changes).
3.  **Components**:
    * Define the `TaskToolbar` component structure.

Output the content for `plan.md`.

## Response snapshot

Created comprehensive implementation plan for List Discovery feature including:

**Phase 0: Research** (Complete)
- Resolved 9 technical unknowns with detailed decision documentation
- **Priority Sorting**: SQL CASE statement chosen (high=3, medium=2, low=1) for database-level sorting to support future pagination
- **NULL Handling**: SQLAlchemy `nullslast()` for due_date and priority sorts
- **URL State**: Next.js `useSearchParams` + `router.push` with React Query integration
- **Debouncing**: Custom `useDebounced<T>` hook with 300ms delay
- **Filter Logic**: AND combination (spec requirement)
- **Empty States**: Conditional component with context-aware messaging

**Phase 1: Design** (Complete)
- **Data Model**: No new entities; leverages existing Task model from Spec 004
- **API Contract**: Extended `GET /api/tasks` with 5 query parameters (search, sort_by, order, priority, category)
- **Query Parameter Validation**: Pydantic models for backend, TypeScript interfaces for frontend
- **Component Hierarchy**: DashboardClient → TaskToolbar → (SearchInput, SortSelect, FilterPopover)
- **Quickstart Guide**: 5-phase implementation plan with time estimates

**8 Architecture Decisions Documented**:
1. Server-side filtering/sorting (FR-006 requirement)
2. Priority sorting via SQL CASE (enables pagination)
3. URL as single source of truth (FR-011, FR-012)
4. 300ms debouncing (FR-010, SC-006)
5. React Query for state management (automatic refetch)
6. Conditional EmptyState component (FR-013)
7. TaskToolbar component architecture (separation of concerns)
8. ShadcnUI components (project standard)

**Constitution Check**: All 7 principles PASS (no violations)

**Performance Targets**:
- Search < 1 second (1000 tasks) - SC-002
- Sort < 1 second - SC-003
- 70% API call reduction via debouncing - SC-006

**Files Created**:
1. `plan.md` - Complete architecture and implementation strategy
2. `research.md` - Technical decisions with rationale and alternatives
3. `data-model.md` - Entity documentation (references existing Task model)
4. `contracts/api.md` - API contract with request/response schemas
5. `quickstart.md` - Step-by-step implementation guide (4-6 hour estimate)

## Outcome

- ✅ Impact: Complete architectural plan ready for task breakdown. Provides clear technical decisions for server-side filtering/sorting implementation with URL persistence. No database migration required (leverages Spec 004 infrastructure).
- 🧪 Tests: Constitution check validated 7 principles (all PASS). Verified backward compatibility (query params optional). Testing strategy documented for backend (pytest) and frontend (Jest/RTL).
- 📁 Files: 5 planning artifacts created (plan.md, research.md, data-model.md, contracts/api.md, quickstart.md)
- 🔁 Next prompts: `/sp.tasks` (generate atomic task breakdown from plan.md)
- 🧠 Reflection: Successfully resolved all technical unknowns via research phase. SQL CASE statement for priority sorting is key architectural decision enabling future pagination. URL state pattern with React Query provides elegant solution for filter persistence. No constitution violations detected; implementation aligns with all 7 principles.

## Evaluation notes (flywheel)

- Failure modes observed: None. All planning phases completed successfully with comprehensive documentation.
- Graders run and results (PASS/FAIL): Constitution check - PASS (7/7 principles). Backward compatibility - PASS. Performance targets - DEFINED (will be validated post-implementation).
- Prompt variant (if applicable): Standard /sp.plan workflow with emphasis on SQL CASE vs Python mapping decision
- Next experiment (smallest change to try): Consider adding ADR for priority sorting decision (SQL CASE vs alternatives) if deemed architecturally significant during task implementation
