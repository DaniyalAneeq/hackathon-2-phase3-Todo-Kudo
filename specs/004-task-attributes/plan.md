# Implementation Plan: Task Attributes (Dates, Priority, Categories)

**Branch**: `004-task-attributes` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-task-attributes/spec.md`

## Summary

Add three new optional attributes to tasks: **priority** (low/medium/high), **due date** (DateTime), and **category** (free text). This feature enriches task metadata for organization and scheduling while maintaining strict backward compatibility - all existing authentication, CRUD operations, and tasks must continue working without modification.

**Technical Approach** (from research.md):
- Database: Alembic migration adds 3 nullable columns + indexes
- Backend: Pydantic models with `Optional` fields for backward compatibility
- Frontend: Shadcn components (Calendar+Popover, Select, Badge) for UI
- Data Flow: UTC storage → API JSON → client-side local timezone formatting

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript/ES2022 (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Alembic (Backend); Next.js 16+, React 19, Shadcn UI (Frontend)
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling)
**Testing**: pytest (Backend unit tests), Jest/React Testing Library (Frontend), manual E2E testing
**Target Platform**: Web application (Linux server backend, modern browsers frontend)
**Project Type**: Web (monorepo: `/backend` and `/frontend`)
**Performance Goals**: <2s task creation/update (SC-007), <5s attribute display after save (SC-001, SC-002)
**Constraints**:
- MUST NOT modify existing `user_id` or authentication logic (FR-011, FR-012)
- All new fields MUST be optional/nullable (backward compatibility)
- Purely additive changes only (no removal or modification of existing features)
**Scale/Scope**:
- Single-user tasks (multi-user via user_id isolation)
- Expected ~100-1000 tasks per user
- No pagination required at this scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

**I. Spec-First Development** ✅ PASS
- Specification exists at `specs/004-task-attributes/spec.md`
- All implementation references spec requirements (FR-001 through FR-015)
- No code written before spec approval

**II. Monorepo Discipline** ✅ PASS
- Frontend changes isolated to `/frontend` directory
- Backend changes isolated to `/backend` directory
- No cross-contamination between layers

**III. Technology Stack Constraints** ✅ PASS
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS ✓
- Backend: Python FastAPI, SQLModel, Alembic ✓
- Database: Neon Serverless PostgreSQL ✓
- Authentication: Better Auth + JWT (NO CHANGES per FR-011) ✓
- UI Components: Shadcn (calendar, popover, select, badge) ✓

**IV. Agentic Dev Stack Workflow** ✅ PASS
- Spec completed (`spec.md`)
- Plan in progress (`plan.md`)
- Task breakdown pending (`/sp.tasks` command after plan approval)
- Implementation delegated to agents: database-dev-agent, backend-dev-agent, frontend-dev-agent, qa-spec-validator
- Verification gates defined in tasks.md (to be created)

**V. Authentication Protocol (Strict)** ✅ PASS
- NO modifications to Better Auth flow (FR-011 explicit constraint)
- NO changes to `get_current_user` dependency (spec requirement)
- All task queries maintain `where(user_id == current_user)` filtering (existing pattern preserved)
- JWT verification logic unchanged (constitution V.4)

**VI. Documentation & File Standards** ✅ PASS
- Spec hierarchy maintained:
  - `specs/004-task-attributes/spec.md` (functional requirements)
  - `specs/004-task-attributes/plan.md` (this file - architecture)
  - `specs/004-task-attributes/data-model.md` (SQLModel schemas)
  - `specs/004-task-attributes/contracts/task-api.md` (API endpoints)
- Code comments policy: Docstrings for FastAPI endpoints (per constitution VI)

**VII. Error Handling Strategy** ✅ PASS
- Backend: Standard HTTP status codes (401, 404, 422) per constitution VII
- Frontend: Error boundaries + toast notifications (existing pattern)
- No 500 errors for expected validation errors (422 for invalid priority, etc.)

### Verification Gates
- [x] Spec exists and is referenced
- [x] Plan covers Frontend, Backend, and DB changes
- [x] All changes are additive (no removal/modification of existing features)
- [x] Authentication flow unchanged (FR-011, FR-012)
- [x] Tasks will be atomic (each task < 3 files) - to be verified in tasks.md
- [ ] User confirmation pending (plan approval)

### Re-check After Phase 1 Design

**Constitution Compliance: ✅ ALL PRINCIPLES SATISFIED**

No violations. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/004-task-attributes/
├── spec.md                       # Feature requirements (completed)
├── plan.md                       # This file - implementation plan
├── research.md                   # Phase 0: Technical decisions
├── data-model.md                 # Phase 1: SQLModel schema design
├── contracts/                    # Phase 1: API contracts
│   └── task-api.md              # Updated task endpoints
├── checklists/                   # Quality validation
│   └── requirements.md          # Spec quality checklist (passed)
└── tasks.md                      # Phase 2: Implementation tasks (pending /sp.tasks)
```

### Source Code (repository root)

**Structure Decision**: Web application (monorepo) - Frontend + Backend separate directories

```text
backend/
├── app/
│   ├── models/
│   │   └── task.py              # 🔧 UPDATE: Add priority, due_date, category fields
│   ├── api/
│   │   └── tasks.py             # 🔧 UPDATE: Handle new fields in CRUD endpoints
│   ├── core/
│   │   ├── config.py            # No changes
│   │   └── database.py          # No changes
│   ├── middleware/
│   │   └── auth.py              # ⛔ NO CHANGES (FR-011)
│   └── utils/                   # No changes
├── alembic/
│   ├── versions/
│   │   └── XXXX_add_task_attributes.py  # ✨ NEW: Migration script
│   ├── env.py                   # No changes
│   └── alembic.ini              # No changes
├── tests/
│   └── test_tasks.py            # 🔧 UPDATE: Add tests for new fields
├── main.py                      # No changes
└── requirements.txt             # No new dependencies

frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx             # 🔧 UPDATE: Display new task attributes
│   ├── login/                   # No changes
│   ├── signup/                  # No changes
│   └── page.tsx                 # No changes
├── components/
│   ├── ui/                      # Shadcn components
│   │   ├── calendar.tsx         # ✨ NEW: Install via npx shadcn@latest add
│   │   ├── popover.tsx          # ✨ NEW: Install via npx shadcn@latest add
│   │   ├── select.tsx           # ✨ NEW: Install via npx shadcn@latest add
│   │   └── badge.tsx            # ✨ NEW: Install via npx shadcn@latest add
│   ├── CreateTaskForm.tsx       # 🔧 UPDATE: Add priority, due_date, category inputs
│   ├── TaskCard.tsx             # 🔧 UPDATE: Display priority badge, due date, category tag
│   └── auth/                    # No changes
├── lib/
│   ├── api.ts                   # 🔧 UPDATE: Add new fields to Task type
│   └── utils.ts                 # ✨ NEW: Date formatting helpers (formatDueDate)
├── types/
│   └── task.ts                  # 🔧 UPDATE: Add priority, due_date, category to Task interface
├── hooks/
│   ├── useCreateTask.ts         # 🔧 UPDATE: Accept new fields in mutation
│   └── useUpdateTask.ts         # 🔧 UPDATE: Accept new fields in mutation
└── package.json                 # 🔧 UPDATE: Add date-fns if not present
```

**Legend**:
- ✨ NEW: File or component to be created
- 🔧 UPDATE: Existing file to be modified
- ⛔ NO CHANGES: Existing file explicitly NOT modified (constraint)

**File Change Summary**:
- **Backend**: 2 files modified (`task.py`, `tasks.py`), 1 new migration script
- **Frontend**: 4 Shadcn components installed, 5 files modified (`CreateTaskForm.tsx`, `TaskCard.tsx`, `api.ts`, `task.ts`, date utils), 1 hook updated
- **Total**: ~12 file changes (well within atomic task limits)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected.

All changes comply with constitution principles. No complexity tracking required.
