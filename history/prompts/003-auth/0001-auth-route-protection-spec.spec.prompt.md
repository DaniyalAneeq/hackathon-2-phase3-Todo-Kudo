---
id: 0001
title: Auth Route Protection Spec
stage: spec
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-auth
branch: 003-auth
user: user
command: /sp.specify
labels: ["authentication", "route-protection", "better-auth", "multi-user", "security"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth/spec.md
  - specs/003-auth/checklists/requirements.md
tests:
  - Spec validation checklist (all items pass)
---

## Prompt

/sp.specify

I want to create a new specification for **Feature: Authentication & Route Protection**.

**Filename**: `specs/features/003-authentication/spec.md`

**Context**:
We currently have a working Task CRUD app at the root URL using a hardcoded `DEMO_USER_ID`. We need to convert this into a secure, multi-user application.

**Architecture Decisions**:
1. **Route Structure**:
   * `/`: Public Landing Page (New).
   * `/dashboard`: Protected Todo Application (Moved from current `/`).
   * `/auth/*`: Authentication pages (Login/Signup).
2. **Auth Provider**: Better Auth (Email/Password only for this phase).
3. **Database**: Better Auth will manage its own tables (User, Session, Account).

**Requirements**:

1. **Frontend Refactor (Agent: frontend-dev-agent)**
   * **Move**: Move the existing Todo List logic from `app/page.tsx` to `app/dashboard/page.tsx`.
   * **Landing Page**: Create a new `app/page.tsx` with a "Welcome" message and "Get Started" buttons.
   * **Auth Pages**: Create `app/login/page.tsx` and `app/signup/page.tsx`.
       * *Fields*: Name, Email, Password.
       * *Action*: On success, redirect to `/dashboard`.
   * **Middleware**: Create `middleware.ts or proxy.ts` to block access to `/dashboard` if not logged in.

2. **Backend Security (Agent: backend-dev-agent)**
   * **Remove**: Delete the `DEMO_USER_ID` constant.
   * **New Dependency**: Implement a `get_current_user` dependency in FastAPI.
       * *Logic*: Verify the JWT token sent in the `Authorization` header using the `BETTER_AUTH_SECRET`.
       * *Output*: Return the `user_id` string.
   * **Update Routes**: Modify `routes/tasks.py` to use `user_id = Depends(get_current_user)` instead of the hardcoded constant.

3. **Database & Config (Agent: database-dev-agent)**
   * Use the **Better Auth MCP** to generate the required tables (User, Session, Account) in Neon.
   * Ensure the `tasks` table's `user_id` column is compatible with the new User IDs (likely UUIDs or strings).

**Acceptance Criteria**:
* Visiting `/dashboard` while logged out redirects to `/login`.
* Signing up creates a new user in the DB and immediately logs them in.
* Tasks created by User A are **never** visible to User B.
* The API returns `401 Unauthorized` if a request is made without a valid token.

**User Clarification**:
Q1: Demo tasks migration strategy - Answer: A (Delete all demo tasks during migration)

## Response snapshot

Created comprehensive specification for Authentication & Route Protection feature (003-auth):

**Branch Created**: `003-auth`

**Specification Contents**:
- 5 prioritized user stories (P1-P3) with independent test criteria
- 30 functional requirements across Frontend, Backend, Database, and Security
- 8 measurable success criteria (all technology-agnostic)
- 4 key entities (User, Session, Account, Task)
- Comprehensive edge cases and assumptions
- Clear scope boundaries and dependencies

**Validation Results**:
- All quality checklist items passed
- No implementation details in spec (business/user focused)
- All requirements testable and unambiguous
- Success criteria measurable and technology-agnostic
- 1 clarification resolved (demo tasks deletion strategy)

**Key Decisions**:
- Better Auth for authentication (email/password only)
- JWT tokens for API authorization
- Route protection at `/dashboard`
- Demo tasks will be deleted during migration
- Out of scope: OAuth, MFA, password reset, email verification

**Files Created**:
1. `specs/003-auth/spec.md` - Complete feature specification
2. `specs/003-auth/checklists/requirements.md` - Quality validation checklist

## Outcome

- ✅ Impact: Feature specification complete and validated; ready for `/sp.plan` phase
- 🧪 Tests: Specification quality checklist validates all requirements are testable and unambiguous
- 📁 Files: 2 files created (spec.md, requirements.md checklist)
- 🔁 Next prompts: `/sp.plan` to create implementation architecture, or `/sp.clarify` for additional requirement refinement
- 🧠 Reflection: Specification follows template structure; single clarification needed and resolved; all 30 functional requirements are clear and actionable

## Evaluation notes (flywheel)

- Failure modes observed: None - specification completed successfully with minimal clarification
- Graders run and results (PASS/FAIL): Spec quality checklist - PASS (all 14 validation items)
- Prompt variant (if applicable): Standard /sp.specify workflow with clarification resolution
- Next experiment (smallest change to try): Proceed to planning phase to design implementation architecture
