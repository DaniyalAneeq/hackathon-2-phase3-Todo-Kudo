---
id: 0003
title: Auth Implementation Tasks
stage: tasks
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-auth
branch: 003-auth
user: user
command: /sp.tasks
labels: ["authentication", "task-breakdown", "implementation", "agents", "mcp-integration"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth/tasks.md
tests:
  - Manual verification per user story acceptance criteria
---

## Prompt

/sp.tasks

The plan `specs/003-auth/plan.md` is approved.

Now, perform the **TASKS** phase of the Spec-Kit workflow.

**Action**: Create `specs/003-auth/tasks.md`.

**Constraint**: Every major phase must start with an **MCP Context** check.
**Constraint**: Assign each task group to the relevant **Sub-Agent**.

**Task Breakdown Strategy:**

**Phase 1: Database & Configuration (Agent: database-dev-agent)**
1. **[MCP Context]**: Use **Neon MCP** (`list_branches`) to confirm the active branch state.
2. **Schema Generation**: Use **Better Auth MCP** to generate the SQL/Schema for User, Session, and Account tables.
3. **Migration Script**: Create a new Alembic migration file that:
   * Creates the auth tables.
   * Truncates the `tasks` table (to clear demo data).
   * Alters `tasks.user_id` column type (String/UUID) to match the new User table.
4. **Apply Migration**: Run the migration using Alembic/Neon MCP.
5. **Secrets**: Generate a `BETTER_AUTH_SECRET` and update `.env` (Backend) and `.env.local` (Frontend).

**Phase 2: Backend Security Logic (Agent: backend-dev-agent)**
6. **Dependency**: Install `python-jose` and implement `get_current_user` in `backend/app/api/dependencies.py`.
   * *Logic*: Decode JWT using `BETTER_AUTH_SECRET` and return `user_id`.
7. **Refactor Routes**: Update `backend/app/api/routes/tasks.py`.
   * Remove `DEMO_USER_ID`.
   * Inject `user_id: str = Depends(get_current_user)` into all endpoints.
8. **Security Verification**: Run a `curl` command against `/api/tasks` *without* a header to confirm it returns **401 Unauthorized**.

**Phase 3: Frontend Implementation (Agent: frontend-dev-agent)**
9. **[MCP Context]**: Use **Shadcn MCP** to search for "login-form" or "authentication" patterns.
10. **Install**: Install `@better-auth/cli` and the client library.
11. **Refactor Architecture**:
    * Move `app/page.tsx` (Todo List) -> `app/dashboard/page.tsx`.
    * Create new `app/page.tsx` (Landing Page) with "Login/Signup" buttons.
12. **Auth Components**: Create `components/auth/LoginForm.tsx` and `SignupForm.tsx` using Shadcn UI.
13. **Auth Pages**: Create `app/login/page.tsx` and `app/signup/page.tsx` that render the forms.
14. **Middleware**: Implement `middleware.ts or proxy.ts (in latest next.js 16+ (check Next.js MCP for help))` to protect the `/dashboard` route.

**Phase 4: Integration Verification (Agent: qa-runner)**
15. **Manual Smoke Test**:
    * Visit `/` (Landing) -> Click Signup -> Create Account -> Redirect to `/dashboard`.
    * Create a Task.
    * Logout.
    * Try accessing `/dashboard` directly (should redirect to Login).

**Output Requirement**:
For every task, include a specific **Verification Command** (e.g., `curl` check, file existence check, or DB table check).

## Response snapshot

Created comprehensive task breakdown for Authentication & Route Protection (003-auth):

**Task Structure**:
- 41 total tasks organized across 8 phases
- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description`
- Tasks organized by user story for independent implementation and testing
- Agent delegation specified per phase (database-dev-agent, backend-dev-agent, frontend-dev-agent, qa-spec-validator)

**Phase Breakdown**:

**Phase 1: Setup & Configuration** (5 tasks)
- MCP context checks (Neon MCP project verification)
- Secret generation (`BETTER_AUTH_SECRET`)
- Dependency installation (Better Auth, python-jose)

**Phase 2: Database Schema & Migration - Foundational** (6 tasks) ⚠️ CRITICAL BLOCKER
- Better Auth MCP integration for schema generation
- Neon MCP `provision_neon_auth` for User/Session/Account tables
- 3 Alembic migrations: auth tables, truncate demo tasks, update tasks.user_id
- Migration application and verification

**Phase 3: User Story 1 - Registration** (8 tasks) 🎯 MVP
- MCP context (Better Auth patterns, Shadcn forms)
- Better Auth configuration
- Signup form component and page
- Session provider integration

**Phase 4: User Story 2 - Login** (3 tasks)
- Login form component and page
- Manual verification flow

**Phase 5: User Story 3 - Route Protection** (5 tasks)
- Next.js MCP middleware patterns
- Move dashboard, create landing page
- Middleware implementation
- Route protection verification

**Phase 6: User Story 4 - Data Isolation** (9 tasks)
- JWT verification in FastAPI
- `get_current_user` dependency
- Remove `DEMO_USER_ID`
- Update all task endpoints with auth
- API client token injection
- Multi-user data isolation testing

**Phase 7: User Story 5 - Landing Page** (2 tasks)
- Enhanced landing page
- Optional logged-in redirect

**Phase 8: Integration & QA** (3 tasks)
- Full journey smoke test
- Cross-browser verification
- Security attack verification

**Key Features**:
- Every task has specific verification command (curl, file check, MCP call, manual test)
- MCP Context tasks at start of major phases (Neon, Better Auth, Shadcn, Next.js)
- Parallel opportunities marked with [P] (13 parallel tasks)
- User story labels [US1]-[US5] for traceability
- Agent assignments per phase
- Dependencies and execution order documented
- MVP strategy (US1-3 only)
- Parallel team strategy included

**Verification Commands Examples**:
- `mcp__neon__list_projects` - verify Neon connection
- `mcp__neon__provision_neon_auth` - generate auth schema
- `grep BETTER_AUTH_SECRET backend/.env` - verify env config
- `curl -X GET http://localhost:8000/api/tasks` - verify 401 response
- Manual browser tests for UI flows

**File Created**:
`specs/003-auth/tasks.md` - 450 lines, complete task breakdown

## Outcome

- ✅ Impact: Complete implementation task breakdown ready for execution; 41 tasks across 8 phases with agent delegation
- 🧪 Tests: Manual verification per user story (no automated tests requested); includes specific verification commands for all tasks
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: Begin implementation starting with Phase 1 (Setup), delegate to appropriate agents (database-dev-agent, backend-dev-agent, frontend-dev-agent, qa-spec-validator)
- 🧠 Reflection: Tasks follow strict format with IDs, parallel markers, story labels, and file paths; organized by user story for independent testing; MCP integration emphasized throughout; includes MVP strategy and parallel execution opportunities

## Evaluation notes (flywheel)

- Failure modes observed: None - task breakdown completed successfully with all required sections
- Graders run and results (PASS/FAIL): Format validation - PASS (all 41 tasks follow checklist format), User story mapping - PASS (all tasks mapped to stories), Agent delegation - PASS (specified per phase), MCP integration - PASS (context checks included)
- Prompt variant (if applicable): Standard /sp.tasks workflow with explicit MCP integration requirements and agent delegation
- Next experiment (smallest change to try): Execute Phase 1 setup tasks and validate before proceeding to foundational database work
