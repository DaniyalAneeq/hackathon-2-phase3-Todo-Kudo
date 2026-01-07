---
id: 0001
title: Create List Discovery Spec
stage: spec
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-list-discovery
branch: 005-list-discovery
user: developer
command: /sp.specify
labels: ["specification", "list-discovery", "search", "sort", "filter", "server-side"]
links:
  spec: specs/005-list-discovery/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-list-discovery/spec.md
  - specs/005-list-discovery/checklists/requirements.md
tests:
  - Validated specification against quality checklist
  - All checklist items passed validation
---

## Prompt

I want to create a new specification for **Feature: List Discovery (Search, Sort, Filter)**.

**Filename**: `specs/005-list-discovery.md`

**Context**:
We have tasks with rich attributes (Spec 004). Users now need to organize this list. We will implement **Server-Side** filtering/sorting to ensure scalability.

**Requirements**:

1.  **Backend API (Agent: backend-dev-agent)**
    * Update `GET /api/tasks` to accept optional query parameters:
        * `search` (str): Filters by title OR description (case-insensitive ILIKE).
        * `sort_by` (str): Options: `created_at` (default), `due_date`, `priority`.
        * `order` (str): `asc` or `desc`.
        * `priority` (str): Filter by exact match (e.g., "high").
        * `category` (str): Filter by exact match.
    * **Constraint**: Ensure proper indexing (Indexes were added in Spec 004, but verify usage).
    * **Logic**:
        * Sorting by `priority` is tricky because it's text ("high", "medium", "low"). Map these to values (3, 2, 1) or use a SQL CASE statement for correct ordering.
        * Sorting by `due_date` should put Nulls last (usually).

2.  **Frontend Logic (Agent: frontend-dev-agent)**
    * **URL State**: Use query parameters (e.g., `?q=work&sort=high`) to manage state. This allows bookmarking filtered views.
    * **Debounce**: The Search input must be debounced (300ms) to prevent API spam.

3.  **Frontend UI (Agent: frontend-dev-agent)**
    * **Toolbar**: Create a `TaskToolbar` component above the list.
        * **Search**: Simple Input with search icon.
        * **Sort**: A "Sort By" Dropdown (Shadcn Select). Options: "Newest", "Oldest", "Highest Priority", "Due Soon".
        * **Filter**: A "Filter" Popover or Chips for Priority/Category.
    * **Empty States**: If a search returns 0 results, show "No tasks found matching 'xyz'" (distinct from the "No tasks yet" empty state).

**Acceptance Criteria**:
* I can search for "milk" and see only relevant tasks.
* I can sort by "Highest Priority" and see Red badges at the top.
* I can filter by "Work" category.
* Reloading the page keeps my filters active (URL persistence).

## Response snapshot

Created comprehensive specification for Task List Discovery feature including:

1. **Feature Setup**: Generated branch `005-list-discovery` and initialized spec structure
2. **User Stories**: Defined 4 prioritized user stories (P1-P3):
   - P1: Search Tasks by Keywords (MVP for discovery)
   - P2: Sort Tasks by Priority or Due Date
   - P2: Filter Tasks by Priority or Category
   - P3: Persist Filters in URL (quality-of-life enhancement)
3. **Functional Requirements**: 15 detailed requirements covering:
   - Server-side query parameters (search, sort_by, order, priority, category)
   - Priority mapping logic (high=3, medium=2, low=1)
   - Null handling for due_date and priority sorting
   - 300ms debounce on search input
   - URL state management
   - Empty state handling
4. **Success Criteria**: 6 measurable, technology-agnostic outcomes:
   - Task location in under 5 seconds (50+ tasks)
   - Search results in under 1 second (1000 tasks)
   - 90% success rate within 3 interactions
   - 70% API call reduction via debouncing
5. **Quality Validation**: Created and validated checklist with all items passing
6. **Dependencies**: Documented reliance on Spec 004 attributes and database indexes

## Outcome

- ✅ Impact: Complete, validated specification ready for planning phase. Provides clear requirements for server-side filtering/sorting implementation.
- 🧪 Tests: Quality validation checklist created and passed all criteria (content quality, requirement completeness, feature readiness)
- 📁 Files: 2 files created (spec.md, requirements.md checklist)
- 🔁 Next prompts: `/sp.clarify` (if ambiguities remain) or `/sp.plan` (proceed to architecture design)
- 🧠 Reflection: Specification successfully avoided implementation details while providing clear, testable requirements. User stories properly prioritized as independent testable slices. All edge cases identified including null handling and debouncing.

## Evaluation notes (flywheel)

- Failure modes observed: None. All validation criteria passed on first iteration.
- Graders run and results (PASS/FAIL): Requirements checklist - PASS (14/14 items)
- Prompt variant (if applicable): Standard /sp.specify workflow
- Next experiment (smallest change to try): Consider adding visual mockups or wireframes for TaskToolbar component to clarify UI layout (optional enhancement for future specs)
