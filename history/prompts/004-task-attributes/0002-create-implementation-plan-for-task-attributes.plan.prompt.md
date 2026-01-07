---
id: 0002
title: Create Implementation Plan for Task Attributes
stage: plan
date: 2026-01-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: 004-task-attributes
branch: 004-task-attributes
user: Gemini
command: /sp.plan
labels: ["implementation-plan", "task-attributes", "database-migration", "api-design", "frontend-components"]
links:
  spec: specs/004-task-attributes/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-task-attributes/plan.md
  - specs/004-task-attributes/research.md
  - specs/004-task-attributes/data-model.md
  - specs/004-task-attributes/contracts/task-api.md
  - specs/004-task-attributes/quickstart.md
tests:
  - Constitution Check: All 7 principles PASSED
  - Backward compatibility validation: PASSED
  - Agent context updated successfully
---

## Prompt

User requested creation of implementation plan for approved specification `specs/004-task-attributes.md`.

**Requirements for the Plan**:

1. **Database Migration**:
   - Define exact SQLModel changes for `Task`
   - Plan Alembic migration adding `due_date`, `priority`, `category` as Nullable columns

2. **API Compatibility**:
   - Define updated `TaskCreate` and `TaskUpdate` models with `Optional[]` fields
   - Explicitly state `get_current_user` will NOT be touched

3. **Frontend Components**:
   - List exact Shadcn installation commands: `calendar`, `popover`, `select`, `badge`
   - Plan updates for `CreateTaskForm` (add fields) and `TaskCard` (add badges)

**Output**: Complete `plan.md` content with technical architecture.

## Response snapshot

Successfully created comprehensive implementation plan with:

**Phase 0: Research** (research.md)
- 7 technical decisions documented (database schema, priority enum, date handling, category storage, UI components, API compatibility, indexes)
- All alternatives considered and rationale provided
- Risks identified with mitigation strategies

**Phase 1: Design** (data-model.md, contracts/, quickstart.md)
- SQLModel schema design: 3 new fields (priority, due_date, category) with validation rules
- Alembic migration script (upgrade/downgrade)
- API contract updates for all 5 task endpoints (POST, GET, GET by ID, PUT, DELETE)
- Complete backward compatibility guarantees documented
- Quickstart guide with step-by-step implementation instructions

**Technical Decisions Summary**:
- Database: Nullable columns with `server_default='medium'` for priority
- Priority: Application-level validation (Pydantic `Literal`) vs. database ENUM
- Date: UTC storage, client-side timezone conversion
- Category: Free text (no predefined list)
- UI: Shadcn components (Calendar+Popover, Select, Badge)
- Indexes: Created on priority, due_date, category for future sorting (FR-014)

**Constitution Check**: All 7 principles PASSED
- Spec-first development ✓
- Monorepo discipline ✓
- Technology stack constraints ✓
- Agentic workflow ✓
- Authentication protocol unchanged ✓
- Documentation standards ✓
- Error handling strategy ✓

**File Change Summary**:
- Backend: 2 files modified, 1 migration script
- Frontend: 4 Shadcn components, 5 files modified, 1 utility added
- Total: ~12 file changes (atomic task limits satisfied)

## Outcome

- ✅ Impact: Comprehensive implementation plan ready for `/sp.tasks` command. All technical unknowns resolved. Architecture fully documented.
- 🧪 Tests: Constitution Check passed (7/7 principles). Backward compatibility validated. No violations detected.
- 📁 Files: Created plan.md, research.md, data-model.md, contracts/task-api.md, quickstart.md
- 🔁 Next prompts: `/sp.tasks` to generate atomic implementation tasks, then delegate to agents (database-dev-agent, backend-dev-agent, frontend-dev-agent)
- 🧠 Reflection: Plan maintains strict additive-only constraint. All new fields optional/nullable. Zero modifications to auth logic (FR-011, FR-012). Research phase identified optimal patterns (Pydantic Literal, UTC storage, client formatting).

## Evaluation notes (flywheel)

- Failure modes observed: None - all research questions answered without ambiguity
- Graders run and results (PASS/FAIL): Constitution Check PASSED (7/7 principles), Backward compatibility PASSED
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 (research) and Phase 1 (design)
- Next experiment (smallest change to try): Proceed to `/sp.tasks` for atomic task breakdown, then implement database layer first (migration → backend → frontend)
