# Task Breakdown: Agentic Todo Web App - Project Foundation

**Feature**: 001-project-overview
**Branch**: `001-project-overview`
**Date**: 2025-12-31
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Overview

This document breaks down the implementation of the project foundation into atomic, testable tasks organized by user story. Each phase represents a complete, independently testable increment of functionality.

**Total Tasks**: 42
**Estimated Phases**: 6 (Setup + Foundational + 4 User Stories)

---

## User Story Mapping

| User Story | Priority | Phase | Tasks | Independent Test Criteria |
|-----------|----------|-------|-------|---------------------------|
| US1: Initialize Project Structure | P1 | Phase 3 | 8 | Directory structure exists with framework configs |
| US2: Setup Database Infrastructure | P2 | Phase 4 | 7 | Database connection succeeds, tables exist, data persists |
| US3: Configure Authentication Flow | P3 | Phase 5 | 11 | Login flow completes, JWT issued, backend verifies token |
| US4: Establish Frontend-Backend Connection | P4 | Phase 6 | 6 | Frontend calls backend health endpoint, displays response |

---

## Phase 1: Environment Setup

**Goal**: Prepare development environment with required accounts and tools

**Independent Test**: Developer can access Neon dashboard and has local development tools installed

### Tasks

- [ ] T001 Create Neon PostgreSQL project via Neon console
  - **Action**: Navigate to https://console.neon.tech/, create new project named "evolutionary_todo_db"
  - **Output**: Project ID and connection string
  - **User Verification**: `echo $NEON_DATABASE_URL` shows valid connection string

- [ ] T002 Generate secure secrets for Better Auth
  - **Action**: Run `openssl rand -base64 32` to generate 32-character secret
  - **Output**: Two identical secrets (one for frontend, one for backend)
  - **User Verification**: Secrets are at least 32 characters long

- [ ] T003 Create backend/.env file with database and auth configuration
  - **Action**: Create `backend/.env` with DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS, DB_POOL settings
  - **File**: `backend/.env`
  - **User Verification**: `cat backend/.env` shows all required variables (no actual values displayed for security)

- [ ] T004 Create frontend/.env.local file with auth and API configuration
  - **Action**: Create `frontend/.env.local` with BETTER_AUTH_SECRET (same as backend), BETTER_AUTH_URL, NEXT_PUBLIC_API_URL, DATABASE_URL
  - **File**: `frontend/.env.local`
  - **User Verification**: `cat frontend/.env.local` shows all required variables

---

## Phase 2: Foundational Setup

**Goal**: Initialize monorepo structure and install core dependencies

**Independent Test**: Both frontend and backend directories exist with package managers configured

**Dependencies**: Phase 1 complete (environment files exist)

### Tasks

- [ ] T005 [P] Create backend directory structure per plan.md
  - **Action**: Create `backend/app/`, `backend/app/models/`, `backend/app/api/`, `backend/app/core/`, `backend/app/middleware/`, `backend/alembic/`
  - **Files**: Multiple directories in `backend/`
  - **User Verification**: `ls -la backend/app/` shows models, api, core, middleware subdirectories

- [ ] T006 [P] Create frontend directory structure per plan.md
  - **Action**: Initialize Next.js 16+ app with `npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir`
  - **Files**: `frontend/` directory with Next.js structure
  - **User Verification**: `ls -la frontend/app/` shows Next.js App Router structure

- [ ] T007 Create backend requirements.txt with FastAPI dependencies
  - **Action**: Add fastapi[standard], sqlmodel, alembic, asyncpg, pydantic, pydantic-settings, python-jose[cryptography], passlib[bcrypt]
  - **File**: `backend/requirements.txt`
  - **User Verification**: `cat backend/requirements.txt | wc -l` returns at least 8 lines

- [ ] T008 Create backend Python virtual environment and install dependencies
  - **Action**: `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
  - **Output**: Virtual environment in `backend/venv/`
  - **User Verification**: `source backend/venv/bin/activate && python -c "import fastapi; print(fastapi.__version__)"`succeeds

- [ ] T009 Install frontend dependencies for Next.js and Better Auth
  - **Action**: `cd frontend && npm install better-auth@latest`
  - **Output**: node_modules with Better Auth installed
  - **User Verification**: `cd frontend && npm list better-auth` shows installed version

---

## Phase 3: User Story 1 - Initialize Project Structure (P1)

**User Story**: As a developer, I need a properly structured monorepo with separate frontend and backend directories so that I can begin building features in an organized, maintainable way.

**Independent Test Criteria**:
- `/frontend` and `/backend` directories exist
- Each contains framework-specific configuration files
- `/specs` directory exists with proper organization
- Can run `npm run dev` in frontend (starts server)
- Can activate Python venv in backend

**Dependencies**: Phase 2 complete

### Tasks

- [ ] T010 [US1] Create backend/app/__init__.py to make app a Python package
  - **Action**: Create empty `__init__.py` files in `backend/app/`, `backend/app/models/`, `backend/app/api/`, `backend/app/core/`, `backend/app/middleware/`
  - **Files**: `backend/app/__init__.py`, `backend/app/models/__init__.py`, `backend/app/api/__init__.py`, `backend/app/core/__init__.py`, `backend/app/middleware/__init__.py`
  - **User Verification**: `find backend/app -name "__init__.py" | wc -l` returns 5

- [ ] T011 [US1] Create backend/pyproject.toml for Python project metadata
  - **Action**: Create `backend/pyproject.toml` with project name, version, description, Python version requirement
  - **File**: `backend/pyproject.toml`
  - **User Verification**: `cat backend/pyproject.toml` shows [project] section

- [ ] T012 [US1] Create frontend/next.config.js with basic configuration
  - **Action**: Ensure `frontend/next.config.js` exists with minimal config (created by create-next-app)
  - **File**: `frontend/next.config.js`
  - **User Verification**: `cat frontend/next.config.js` shows Next.js config

- [ ] T013 [US1] Create frontend/tsconfig.json with strict TypeScript settings
  - **Action**: Ensure `frontend/tsconfig.json` exists with strict mode enabled (created by create-next-app)
  - **File**: `frontend/tsconfig.json`
  - **User Verification**: `cat frontend/tsconfig.json | grep strict` returns "strict": true

- [ ] T014 [US1] Update root .gitignore to exclude .env files and build artifacts
  - **Action**: Add `**/.env`, `**/.env.local`, `**/venv/`, `**/node_modules/`, `**/.next/`, `**/__pycache__/` to `.gitignore`
  - **File**: `.gitignore`
  - **User Verification**: `cat .gitignore | grep .env` shows .env patterns

- [ ] T015 [US1] Create README.md with project overview and setup instructions
  - **Action**: Create `README.md` with project description, prerequisites, quickstart commands
  - **File**: `README.md`
  - **User Verification**: `cat README.md` shows project title and setup section

- [ ] T016 [US1] Verify frontend starts successfully
  - **Action**: Run `cd frontend && npm run dev` and check for "Ready in" message
  - **User Verification**: Access http://localhost:3000 in browser, see Next.js default page

- [ ] T017 [US1] Verify backend Python environment is functional
  - **Action**: Run `cd backend && source venv/bin/activate && python --version`
  - **User Verification**: Python 3.11+ version is displayed

**Phase 3 Verification**:
```bash
# Test US1 acceptance criteria
ls -la frontend/ backend/ specs/  # Directories exist
cd frontend && npm run dev &      # Frontend starts
cd backend && source venv/bin/activate && python --version  # Backend environment ready
```

---

## Phase 4: User Story 2 - Setup Database Infrastructure (P2)

**User Story**: As a developer, I need a working Neon PostgreSQL database with initial tables so that I can store and retrieve todo data for multiple users.

**Independent Test Criteria**:
- Database connection succeeds with valid credentials
- Core tables (users) exist with proper schema
- Data persists and can be retrieved
- Alembic migrations can be applied successfully

**Dependencies**: Phase 2 complete (environment files with DATABASE_URL exist)

### Tasks

- [ ] T018 [US2] Create backend/app/core/config.py with Pydantic settings
  - **Action**: Create `backend/app/core/config.py` with Settings class using pydantic-settings, load DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS, DB_POOL_SIZE, etc.
  - **File**: `backend/app/core/config.py`
  - **User Verification**: `cd backend && source venv/bin/activate && python -c "from app.core.config import Settings; s=Settings(); print(s.DATABASE_URL[:10])"` shows "postgresql"

- [ ] T019 [US2] Create backend/app/core/database.py with async SQLAlchemy engine
  - **Action**: Create `backend/app/core/database.py` with create_async_engine, async_session, get_session dependency
  - **File**: `backend/app/core/database.py`
  - **User Verification**: `cd backend && source venv/bin/activate && python -c "from app.core.database import engine; print(engine.url.drivername)"` shows "postgresql+asyncpg"

- [ ] T020 [US2] Create backend/app/models/user.py with SQLModel User model
  - **Action**: Create `backend/app/models/user.py` with User class per data-model.md (id, email, email_verified, name, image, created_at, updated_at)
  - **File**: `backend/app/models/user.py`
  - **User Verification**: `cd backend && source venv/bin/activate && python -c "from app.models.user import User; print(User.__tablename__)"` shows "users"

- [ ] T021 [US2] Initialize Alembic for database migrations
  - **Action**: Run `cd backend && source venv/bin/activate && alembic init alembic`
  - **Output**: `backend/alembic/` directory with env.py, alembic.ini
  - **User Verification**: `ls backend/alembic/env.py` file exists

- [ ] T022 [US2] Configure Alembic env.py to use async engine and SQLModel metadata
  - **Action**: Edit `backend/alembic/env.py` to import SQLModel.metadata and use async engine from app.core.database
  - **File**: `backend/alembic/env.py`
  - **User Verification**: `cat backend/alembic/env.py | grep "SQLModel"` finds import

- [ ] T023 [US2] Generate initial Alembic migration for User table
  - **Action**: Run `cd backend && source venv/bin/activate && alembic revision --autogenerate -m "Create users table"`
  - **Output**: Migration file in `backend/alembic/versions/`
  - **User Verification**: `ls backend/alembic/versions/*.py | wc -l` returns 1

- [ ] T024 [US2] Apply Alembic migration to Neon database
  - **Action**: Run `cd backend && source venv/bin/activate && alembic upgrade head`
  - **Output**: "users" table created in Neon database
  - **User Verification**: Connect to Neon via psql or Neon console, run `\dt` to see "users" table

**Phase 4 Verification**:
```bash
# Test US2 acceptance criteria
cd backend && source venv/bin/activate
alembic current              # Shows current migration
python -c "from app.core.database import engine; import asyncio; asyncio.run(engine.connect())"  # Connection succeeds
```

---

## Phase 5: User Story 3 - Configure Authentication Flow (P3)

**User Story**: As a developer, I need Better Auth configured in the frontend with JWT verification in the backend so that users can securely log in and access their own data.

**Independent Test Criteria**:
- Better Auth issues valid JWT tokens
- Backend successfully verifies JWT tokens
- Backend extracts user_id from verified tokens
- Invalid/missing tokens return 401 Unauthorized

**Dependencies**: Phase 4 complete (database with users table exists)

### Tasks

- [ ] T025 [P] [US3] Create backend/app/core/auth.py with JWT verification logic
  - **Action**: Create `backend/app/core/auth.py` with verify_jwt_token function using python-jose, verify signature with BETTER_AUTH_SECRET, extract "sub" claim as user_id
  - **File**: `backend/app/core/auth.py`
  - **User Verification**: `cd backend && source venv/bin/activate && python -c "from app.core.auth import verify_jwt_token; print(verify_jwt_token.__name__)"` shows function

- [ ] T026 [P] [US3] Create backend/app/api/dependencies.py with get_current_user dependency
  - **Action**: Create `backend/app/api/dependencies.py` with async def get_current_user(authorization: str = Header()) that calls verify_jwt_token, returns user_id or raises HTTPException(401)
  - **File**: `backend/app/api/dependencies.py`
  - **User Verification**: `cd backend && source venv/bin/activate && python -c "from app.api.dependencies import get_current_user; print('OK')"` succeeds

- [ ] T027 [P] [US3] Create backend/app/middleware/cors.py with CORS configuration
  - **Action**: Create `backend/app/middleware/cors.py` with CORSMiddleware setup, allow_origins from config.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
  - **File**: `backend/app/middleware/cors.py`
  - **User Verification**: `cat backend/app/middleware/cors.py | grep CORSMiddleware` finds import

- [ ] T028 [US3] Create frontend/lib/auth.ts with Better Auth client configuration
  - **Action**: Create `frontend/lib/auth.ts`, import Better Auth, configure with BETTER_AUTH_SECRET and BETTER_AUTH_URL from env
  - **File**: `frontend/lib/auth.ts`
  - **User Verification**: `cat frontend/lib/auth.ts | grep "BETTER_AUTH_SECRET"` finds env variable usage

- [ ] T029 [US3] Create frontend/lib/api-client.ts with backend API client
  - **Action**: Create `frontend/lib/api-client.ts` with fetch wrapper that adds Authorization header with JWT token from Better Auth
  - **File**: `frontend/lib/api-client.ts`
  - **User Verification**: `cat frontend/lib/api-client.ts | grep "Authorization"` finds header setting

- [ ] T030 [US3] Create frontend/app/api/auth/[...all]/route.ts for Better Auth callbacks
  - **Action**: Create `frontend/app/api/auth/[...all]/route.ts` to handle Better Auth routes (login, signup, callbacks)
  - **File**: `frontend/app/api/auth/[...all]/route.ts`
  - **User Verification**: `ls frontend/app/api/auth/[...all]/route.ts` file exists

- [ ] T031 [US3] Create backend/app/api/auth.py with /api/auth/me endpoint
  - **Action**: Create `backend/app/api/auth.py` with GET /api/auth/me endpoint, uses Depends(get_current_user), queries User model by user_id, returns user data
  - **File**: `backend/app/api/auth.py`
  - **User Verification**: `cat backend/app/api/auth.py | grep "get_current_user"` finds dependency

- [ ] T032 [US3] Create frontend/app/(auth)/login/page.tsx for login UI
  - **Action**: Create `frontend/app/(auth)/login/page.tsx` with login form using Better Auth, handle success/error states
  - **File**: `frontend/app/(auth)/login/page.tsx`
  - **User Verification**: `ls frontend/app/(auth)/login/page.tsx` file exists

- [ ] T033 [US3] Create frontend/app/(auth)/signup/page.tsx for registration UI
  - **Action**: Create `frontend/app/(auth)/signup/page.tsx` with signup form using Better Auth, handle success/error states
  - **File**: `frontend/app/(auth)/signup/page.tsx`
  - **User Verification**: `ls frontend/app/(auth)/signup/page.tsx` file exists

- [ ] T034 [US3] Test Better Auth JWT token generation via frontend signup
  - **Action**: Start frontend (`npm run dev`), navigate to /signup, create test user, capture JWT token from browser DevTools
  - **User Verification**: Browser console shows JWT token after signup (format: eyJ...)

- [ ] T035 [US3] Test backend JWT verification with manual token
  - **Action**: Start backend, send curl request to /api/auth/me with Authorization header containing JWT token from T034
  - **User Verification**: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me` returns user data (200) or 401 for invalid token

**Phase 5 Verification**:
```bash
# Test US3 acceptance criteria
cd frontend && npm run dev &         # Start frontend
cd backend && fastapi dev app/main.py &  # Start backend
# 1. Navigate to http://localhost:3000/signup, create user
# 2. Copy JWT token from browser
# 3. curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me
# Expect: 200 OK with user data
```

---

## Phase 6: User Story 4 - Establish Frontend-Backend Connection (P4)

**User Story**: As a developer, I need a working "Hello World" API endpoint that the frontend can successfully call so that I can validate the full stack integration.

**Independent Test Criteria**:
- Backend health endpoint responds with 200 OK and JSON
- Frontend successfully calls backend health endpoint
- Response displays in frontend UI
- No CORS errors in browser console

**Dependencies**: Phase 2 complete (backend/frontend initialized), Phase 5 complete (CORS middleware configured)

### Tasks

- [ ] T036 [P] [US4] Create backend/app/api/health.py with health check endpoint
  - **Action**: Create `backend/app/api/health.py` with GET /api/health endpoint per contracts/health.openapi.yaml, return { status: "healthy", message: "Todo API is running", timestamp: datetime.utcnow().isoformat() }
  - **File**: `backend/app/api/health.py`
  - **User Verification**: `cat backend/app/api/health.py | grep "healthy"` finds status value

- [ ] T037 [US4] Create backend/app/main.py FastAPI application entry point
  - **Action**: Create `backend/app/main.py`, initialize FastAPI app, add CORS middleware from middleware.cors, include routers from api.health and api.auth
  - **File**: `backend/app/main.py`
  - **User Verification**: `cd backend && source venv/bin/activate && python -c "from app.main import app; print(app.title)"`shows app name

- [ ] T038 [US4] Test backend health endpoint independently
  - **Action**: Start backend with `cd backend && fastapi dev app/main.py`, send curl request to /api/health
  - **User Verification**: `curl http://localhost:8000/api/health` returns { "status": "healthy", "message": "Todo API is running", "timestamp": "..." }

- [ ] T039 [US4] Create frontend/app/page.tsx with health check UI
  - **Action**: Edit `frontend/app/page.tsx`, fetch from `${process.env.NEXT_PUBLIC_API_URL}/api/health` using api-client.ts, display response in UI
  - **File**: `frontend/app/page.tsx`
  - **User Verification**: `cat frontend/app/page.tsx | grep "health"` finds fetch call

- [ ] T040 [US4] Test frontend-backend connection end-to-end
  - **Action**: Start both servers (frontend on 3000, backend on 8000), navigate to http://localhost:3000, verify health status displays
  - **User Verification**: Browser shows "Todo API is running" message fetched from backend

- [ ] T041 [US4] Verify CORS configuration allows frontend requests
  - **Action**: Open browser DevTools Network tab, trigger health check from frontend, verify no CORS errors
  - **User Verification**: Network tab shows 200 OK for /api/health request, no CORS errors in Console tab

**Phase 6 Verification**:
```bash
# Test US4 acceptance criteria
cd backend && fastapi dev app/main.py &   # Terminal 1
cd frontend && npm run dev &               # Terminal 2
# Navigate to http://localhost:3000
# Expect: "Todo API is running" displayed on page
# DevTools Network tab: 200 OK for /api/health
# DevTools Console: No CORS errors
```

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final improvements and documentation

**Dependencies**: All user stories (Phase 3-6) complete

### Tasks

- [ ] T042 Create comprehensive .env.example files for backend and frontend
  - **Action**: Create `backend/.env.example` and `frontend/.env.example` with placeholder values for all required environment variables
  - **Files**: `backend/.env.example`, `frontend/.env.example`
  - **User Verification**: `diff backend/.env backend/.env.example` shows only values differ (same keys)

---

## Task Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
    ├─→ Phase 3: US1 (Project Structure) ────┐
    ├─→ Phase 4: US2 (Database) ─────────────┤
    └─→ Phase 5: US3 (Authentication) ───────┼─→ Phase 6: US4 (Integration)
                                              │         ↓
                                              └─→ Phase 7 (Polish)
```

**Notes**:
- Phases 3, 4, 5 can be started in parallel after Phase 2 completes
- Phase 6 requires CORS from Phase 5 but can use health endpoint without auth
- Phase 5 requires User model from Phase 4
- Phase 7 must be last (requires all features complete)

---

## Parallel Execution Opportunities

### After Phase 2 Completes:

**Parallel Group 1** (no dependencies between them):
- T010-T017 (US1: Project Structure)
- T018-T024 (US2: Database Setup)

**Parallel Group 2** (after Group 1):
- T025, T026, T027 (US3: Backend Auth - independent files)
- T028, T029 (US3: Frontend Auth Utils - independent files)

**Sequential Group 3** (dependencies exist):
- T030 → T031 → T032 → T033 → T034 → T035 (US3: Auth Flow - must be sequential)
- T036 → T037 → T038 (US4: Backend Health - must be sequential)
- T039 → T040 → T041 (US4: Frontend Integration - must be sequential)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Recommended MVP**: User Story 1 + User Story 4 only
- **Rationale**: Proves full-stack integration without auth complexity
- **Deliverable**: Working health endpoint with frontend displaying backend response
- **Time Estimate**: ~4 hours (Phase 1 → Phase 2 → Phase 3 → Phase 6)

### Incremental Delivery Order

1. **Iteration 1** (MVP): Phase 1 → 2 → 3 → 6 (Health check only)
2. **Iteration 2**: Add Phase 4 (Database + migrations)
3. **Iteration 3**: Add Phase 5 (Authentication + protected endpoints)
4. **Iteration 4**: Add Phase 7 (Polish + documentation)

---

## Verification Checklist

After completing all tasks, verify each user story's acceptance criteria:

### US1: Initialize Project Structure ✓
- [ ] `/frontend` and `/backend` directories exist
- [ ] `package.json` exists in frontend
- [ ] `requirements.txt` exists in backend
- [ ] `/specs` directory exists
- [ ] `npm run dev` starts Next.js on localhost:3000
- [ ] Python virtual environment activates successfully

### US2: Setup Database Infrastructure ✓
- [ ] Neon connection succeeds (no errors when connecting)
- [ ] `users` table exists in database
- [ ] Can insert and retrieve a test record
- [ ] `alembic upgrade head` runs without errors

### US3: Configure Authentication Flow ✓
- [ ] User can sign up via frontend /signup page
- [ ] Better Auth issues JWT token (visible in browser)
- [ ] Backend verifies JWT token (returns 200 for /api/auth/me)
- [ ] Invalid token returns 401 Unauthorized
- [ ] Backend extracts user_id from token

### US4: Establish Frontend-Backend Connection ✓
- [ ] Backend /api/health returns 200 OK
- [ ] Frontend successfully fetches health data
- [ ] Health status displays in frontend UI
- [ ] No CORS errors in browser console

---

## Success Criteria Mapping

| Success Criteria | Verified By Task |
|------------------|------------------|
| SC-001: Frontend starts in 30s | T016 |
| SC-002: Backend starts in 15s | T038 |
| SC-003: DB query in <2s | T024 |
| SC-004: Health endpoint in <1s | T040 |
| SC-005: Login flow in <5s | T034 |
| SC-006: JWT validation 100% | T035 |
| SC-007: TypeScript compiles | T013 |
| SC-008: Pydantic validates | T018 |
| SC-009: Migrations apply | T024 |
| SC-010: Parallel dev | T016, T017 |

---

## Notes

- **Testing**: This phase does NOT include automated tests (out of scope per spec.md). Tests will be added in future feature spec.
- **Parallelization**: Tasks marked with `[P]` can be executed in parallel with other `[P]` tasks in the same phase.
- **User Story Labels**: Tasks marked with `[US#]` map to specific user stories for traceability.
- **Dependencies**: Each phase has explicit dependencies listed; do not start a phase until its dependencies are complete.
- **Verification**: Every task includes a "User Verification" command to confirm successful completion.

---

**Task Generation Complete** ✅

**Next Steps**: Begin implementation starting with Phase 1 (Environment Setup). Follow the Agentic Dev Stack Workflow: execute task → verify → proceed to next task.
