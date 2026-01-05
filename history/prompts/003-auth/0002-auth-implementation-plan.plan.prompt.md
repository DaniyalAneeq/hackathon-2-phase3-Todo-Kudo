---
id: 0002
title: Auth Implementation Plan
stage: plan
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-auth
branch: 003-auth
user: user
command: /sp.plan
labels: ["authentication", "architecture", "design", "better-auth", "jwt", "planning"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth/plan.md
tests:
  - Constitution check (all 7 principles validated)
---

## Prompt

/sp.plan

The specification `specs/003-auth/spec.md` is approved.

Now, perform the **PLAN** phase of the Spec-Kit workflow.

**Action**: Create `specs/003-auth/plan.md`.

**Requirements for the Plan**:
1. **Frontend Architecture**:
   * Detail the move of `app/page.tsx` -> `app/dashboard/page.tsx`.
   * Define the structure for the new Marketing Landing Page (`app/page.tsx`).
   * List the specific Better Auth client-side hooks we will use (`signIn`, `signUp`, `useSession`).
2. **Backend Architecture**:
   * Define the new `get_current_user` dependency in `backend/app/api/dependencies.py`.
   * Explain how we will replace `DEMO_USER_ID` in `backend/app/api/routes/tasks.py`.
3. **Database**:
   * Confirm we will use the **Better Auth MCP** to apply the schema.
   * **Critical:** We need to delete the old "demo" tasks because the `user_id` format will change from "demo-user-123" to a UUID. Plan for a `TRUNCATE tasks` command.

Output the content for `plan.md`.

## Response snapshot

Created comprehensive implementation plan for Authentication & Route Protection (003-auth):

**Plan Structure**:
- Technical Context: TypeScript/Next.js 16+, Python 3.11+/FastAPI, Neon PostgreSQL
- Constitution Check: All 7 principles validated ✅
- Project Structure: Detailed file changes across frontend, backend, database
- Phase 0 Research: 5 research tasks (Better Auth patterns, JWT verification, DB schema, migration, middleware)
- Phase 1 Design: Complete data models (User, Session, Account, Task), API contracts (OpenAPI), quickstart guide
- Phase 2 Task Breakdown: High-level sequence (database → backend → frontend → QA)
- Architecture Decisions: 4 ADRs documented (Better Auth, stateless JWT, truncate demo tasks, UUID user IDs)
- Implementation Checklist: Pre/during/post gates
- Risk Analysis: 4 risks identified with mitigations

**Key Architecture Decisions**:
1. **AD-001**: Better Auth for frontend authentication (vs NextAuth, custom, Clerk)
2. **AD-002**: Stateless JWT verification in backend (no session storage)
3. **AD-003**: Truncate demo tasks during migration (vs migrate or orphan)
4. **AD-004**: UUID strings for user IDs (vs integers)

**Data Model Changes**:
- New entities: User, Session, Account (Better Auth managed)
- Modified entity: Task (user_id VARCHAR → UUID, foreign key to User)
- Migration: TRUNCATE tasks, ALTER user_id type, ADD foreign key constraint

**API Contract Updates**:
- All `/api/tasks/*` endpoints require `Authorization: Bearer <JWT>` header
- New 401 Unauthorized responses for missing/invalid tokens
- New 403 Forbidden for cross-user access attempts

**Frontend Changes** (12 files):
- NEW: `app/login/page.tsx`, `app/signup/page.tsx`, `app/dashboard/page.tsx` (moved from `/`)
- NEW: `lib/auth.ts`, `hooks/useAuth.ts`, `middleware.ts`
- NEW: `components/auth/LoginForm.tsx`, `components/auth/SignupForm.tsx`
- MODIFIED: `app/page.tsx` (landing), `app/layout.tsx` (provider), `lib/api.ts` (JWT), `.env.local`

**Backend Changes** (7 files):
- NEW: `app/core/auth.py`, `app/api/dependencies.py`
- NEW: `alembic/versions/xxx_add_user_tables.py`, `xxx_update_task_user_id.py`, `xxx_truncate_demo_tasks.py`
- MODIFIED: `app/api/routes/tasks.py`, `app/core/config.py`, `app/utils/constants.py` (remove DEMO_USER_ID)

**File Created**:
`specs/003-auth/plan.md` - 904 lines, comprehensive implementation plan

## Outcome

- ✅ Impact: Complete architectural plan ready for Phase 0 research and Phase 1 design
- 🧪 Tests: Constitution compliance validated (7/7 principles pass)
- 📁 Files: 1 file created (plan.md)
- 🔁 Next prompts: Execute Phase 0 research tasks, create data-model.md/contracts/quickstart.md, run /sp.tasks
- 🧠 Reflection: Plan follows spec-kit structure; includes detailed research tasks, data models, API contracts, ADRs, risks, and implementation sequence; ready for task breakdown phase

## Evaluation notes (flywheel)

- Failure modes observed: None - plan completed successfully with all required sections
- Graders run and results (PASS/FAIL): Constitution check - PASS (7/7 principles), Plan structure - PASS (all sections complete)
- Prompt variant (if applicable): Standard /sp.plan workflow with explicit user requirements
- Next experiment (smallest change to try): Proceed to Phase 0 research or directly to /sp.tasks if research artifacts not needed
