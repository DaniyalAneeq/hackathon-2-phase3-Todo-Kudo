---
id: 0001
title: Create Todo App Constitution
stage: constitution
date: 2025-12-31
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: developer
command: /sp.constitution
labels: ["constitution", "governance", "principles", "todo-app"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

# Project Constitution: Todo Full-Stack Web Application

## 1. Prime Directives
1.  **Spec-First Development:** Never write implementation code without an existing, referenced specification in `specs/`. If a spec is missing or vague, request its creation/update first.
2.  **Monorepo Discipline:** strict separation of concerns. Frontend code lives ONLY in `/frontend`. Backend code lives ONLY in `/backend`. Configuration lives in root or `.spec-kit`.

## 2. Technology Stack Constraints
* **Frontend:** Next.js 16+ (App Router), TypeScript, Tailwind CSS.
    * *Constraint:* Use Server Components by default. Use Client Components only for interactivity.
* **Backend:** Python FastAPI, SQLModel (ORM).
    * *Constraint:* Async/Await patterns required. Pydantic models for all schemas.
* **Database:** Neon Serverless PostgreSQL.
* **Authentication:** Better Auth (Frontend) + JWT Verification (Backend).
    * *Constraint:* The backend MUST NOT manage sessions. It strictly verifies JWT tokens passed in the `Authorization` header.

## 3. The "Agentic Dev Stack" Workflow
You must strictly follow this loop for every feature request:
1.  **Read Spec:** Analyze the relevant file in `specs/features/`.
2.  **Plan:** Propose a high-level plan (Frontend changes -> Backend changes -> DB changes).
3.  **Break Down:** Split the plan into atomic, testable steps.
4.  **Implement:** Execute code generation.
5.  **Verify:** Ask the user to run the specific test command for that layer.

## 4. Authentication Protocol (Strict)
* **Source of Truth:** Better Auth (running in Next.js) is the identity provider.
* **Handshake:** 1. User logs in via Frontend.
    2. Better Auth issues a JWT.
    3. Frontend attaches `Authorization: Bearer <token>` to ALL requests to `/api/*`.
    4. FastAPI middleware verifies the signature using `BETTER_AUTH_SECRET`.
    5. FastAPI extracts `user_id` from the token to filter data.
* **Data Isolation:** Every SQL query MUST include a `where(user_id == current_user)` clause. No global data access.

## 5. Documentation & File Standards
* **Specs:** Maintain the hierarchy in `.spec-kit/config.yaml`.
    * `specs/features/`: Functional requirements.
    * `specs/api/`: Endpoint definitions.
    * `specs/database/`: SQLModel schemas.
* **Code Comments:** Do not over-comment. Code should be self-documenting. Use Docstrings for Python API endpoints.

## 6. Error Handling Strategy
* **Frontend:** Use Error Boundaries for UI crashes. Toast notifications for API errors.
* **Backend:** Return standard HTTP status codes (401 for Auth, 404 for Not Found, 422 for Validation). Never return 500 for expected logic errors.

## Response snapshot

Created the Todo Full-Stack Web Application Constitution (v1.0.0) at `.specify/memory/constitution.md`.

The constitution defines 7 core principles:
1. Spec-First Development (no code without specs)
2. Monorepo Discipline (strict frontend/backend separation)
3. Technology Stack Constraints (Next.js 16+, FastAPI, Neon, Better Auth)
4. Agentic Dev Stack Workflow (Read Spec → Plan → Break Down → Implement → Verify)
5. Authentication Protocol (Better Auth + JWT, row-level security)
6. Documentation & File Standards (organized specs, minimal comments)
7. Error Handling Strategy (Error Boundaries, standard HTTP codes)

Added expanded sections for:
- Technology Stack Constraints (with justification process for deviations)
- Agentic Dev Stack Workflow (with verification gates)
- Authentication Protocol (with implementation checklist)
- Documentation & File Standards (with spec hierarchy)
- Error Handling Strategy (with response format standards)
- Governance (amendment process, versioning policy, compliance review)

Validated consistency with existing templates (plan-template.md, spec-template.md, tasks-template.md) - all aligned with new principles.

## Outcome

- ✅ Impact: Established foundational governance for the Todo Full-Stack Web Application project with 7 core principles and comprehensive implementation guidance
- 🧪 Tests: No tests required for constitution document
- 📁 Files: Created/updated `.specify/memory/constitution.md` (v1.0.0)
- 🔁 Next prompts: Ready to proceed with feature specification and implementation following the Agentic Dev Stack Workflow
- 🧠 Reflection: Constitution provides clear constraints (spec-first, monorepo discipline, tech stack) and enforceable workflows (5-step agentic loop) that will guide all future development

## Evaluation notes (flywheel)

- Failure modes observed: None - initial constitution creation
- Graders run and results (PASS/FAIL): PASS - all placeholders filled, no template tokens remaining, templates validated for consistency
- Prompt variant (if applicable): N/A - standard constitution creation
- Next experiment (smallest change to try): Apply the Agentic Dev Stack Workflow to first feature implementation to validate workflow clarity
