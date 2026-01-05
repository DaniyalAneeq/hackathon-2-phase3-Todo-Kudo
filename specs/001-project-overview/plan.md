# Implementation Plan: Agentic Todo Web App - Project Foundation

**Branch**: `001-project-overview` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-overview/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build the foundational infrastructure for a production-grade, multi-user Todo application using a monorepo architecture with Next.js 16+ frontend and Python FastAPI backend. This phase establishes the project structure, configures Neon PostgreSQL database, integrates Better Auth for authentication with JWT verification, and validates full-stack connectivity through a health check endpoint. The goal is to create a working scaffold where developers can immediately begin building features with hot reload, type safety, and secure user data isolation.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16+
- Backend: Python 3.11+ with FastAPI

**Primary Dependencies**:
- Frontend: Next.js 16+, React 19, Better Auth, Tailwind CSS, TypeScript
- Backend: FastAPI, SQLModel, Alembic, Pydantic, python-jose (JWT), asyncpg

**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling enabled)

**Testing**:
- Frontend: NEEDS CLARIFICATION (Jest/Vitest for unit, Playwright for e2e)
- Backend: NEEDS CLARIFICATION (pytest with async support, httpx for API tests)

**Target Platform**:
- Development: Linux/WSL (localhost)
- Production: Vercel for frontend, Render for backend

**Project Type**: Web application (monorepo with separate frontend/backend)

**Performance Goals**:
- API health endpoint: <100ms response time
- Database queries: <2s for initial test queries
- Frontend page load: <3s on standard broadband
- JWT verification: <50ms per request

**Constraints**:
- CORS configured for localhost during development
- Database connection pool: minimum 10 concurrent connections
- JWT token expiration: 24 hours (configurable)
- No shared code between frontend/backend in initial phase
- All configuration via environment variables

**Scale/Scope**:
- Initial: Single developer, local development
- Target: Multi-user support with user_id-based data isolation
- Database: Small scale (<10k users initially, horizontal scaling via Neon)
- Deployment: Separate frontend/backend deployments (not containerized initially)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-First Development
- [x] Feature spec exists at `/specs/001-project-overview/spec.md`
- [x] All functional requirements documented (FR-001 through FR-015)
- [x] User scenarios defined with acceptance criteria
- [x] Success criteria are measurable
- **STATUS**: ✅ PASS

### Principle II: Monorepo Discipline
- [x] Frontend code will live exclusively in `/frontend`
- [x] Backend code will live exclusively in `/backend`
- [x] No shared code between frontend/backend in this phase
- [x] Configuration in root `.env` files
- **STATUS**: ✅ PASS

### Principle III: Technology Stack Constraints
- [x] Frontend: Next.js 16+ with App Router, TypeScript, Tailwind CSS
- [x] Backend: Python FastAPI with SQLModel, async/await patterns
- [x] Database: Neon Serverless PostgreSQL
- [x] Authentication: Better Auth (frontend) + JWT verification (backend)
- [x] No deviations from stack constraints
- **STATUS**: ✅ PASS

### Principle IV: Agentic Dev Stack Workflow
- [x] Spec created and approved
- [ ] Plan created (this document, in progress)
- [ ] Task breakdown (will be created via `/sp.tasks`)
- [ ] Implementation (follows after tasks)
- [ ] Verification (user-driven test commands)
- **STATUS**: ⚠️ IN PROGRESS (current step)

### Principle V: Authentication Protocol
- [x] Better Auth as identity provider
- [x] JWT handshake documented in spec
- [x] Backend will verify tokens using `BETTER_AUTH_SECRET`
- [x] Data isolation via `user_id` filtering (to be implemented)
- [x] No global data access
- **STATUS**: ✅ PASS (design compliant, implementation pending)

### Principle VI: Documentation & File Standards
- [x] Specs organized per `.specify/config.yaml` hierarchy
- [x] Feature spec in `specs/features/001-project-overview/`
- [x] API specs will be created in Phase 1
- [x] Database schemas will be created in Phase 1
- **STATUS**: ✅ PASS

### Principle VII: Error Handling Strategy
- [x] Frontend will use Error Boundaries (Next.js default)
- [x] Backend will return standard HTTP codes (401, 404, 422, 500)
- [x] API error response format defined in constitution
- **STATUS**: ✅ PASS

### Overall Gate Status
**INITIAL CHECK**: ✅ **PASSED** - All gates satisfied for Phase 0 research

**NOTES**:
- No complexity tracking needed (no violations)
- Technology stack aligns perfectly with constitution
- Workflow is being followed (spec → plan → tasks → implementation)

## Project Structure

### Documentation (this feature)

```text
specs/001-project-overview/
├── spec.md              # Feature specification (created by /sp.specify)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── health.openapi.yaml
│   └── auth.openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

**Selected Structure**: Web Application (Option 2) - Monorepo with separate frontend and backend

```text
/mnt/d/GIAIC_HACKATHONS/phase-2-todo-project/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── api/                # API routes (Better Auth endpoints)
│   │   │   └── auth/           # Better Auth callback routes
│   │   └── (auth)/             # Auth-related pages
│   │       ├── login/
│   │       └── signup/
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn UI components (added progressively)
│   │   └── auth/               # Auth-specific components
│   ├── lib/                    # Utility functions
│   │   ├── auth.ts             # Better Auth client configuration
│   │   └── api-client.ts       # Backend API client with JWT handling
│   ├── public/                 # Static assets
│   ├── .env.local              # Frontend environment variables (not committed)
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json            # Frontend dependencies
│
├── backend/
│   ├── app/                    # FastAPI application
│   │   ├── main.py             # FastAPI entry point
│   │   ├── models/             # SQLModel database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py         # User model (synced with Better Auth)
│   │   │   └── todo.py         # Todo model (future)
│   │   ├── api/                # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── health.py       # Health check endpoint
│   │   │   └── dependencies.py # JWT verification dependency
│   │   ├── core/               # Core functionality
│   │   │   ├── __init__.py
│   │   │   ├── config.py       # Settings (Pydantic BaseSettings)
│   │   │   ├── database.py     # Database connection
│   │   │   └── auth.py         # JWT verification logic
│   │   └── middleware/         # Middleware
│   │       ├── __init__.py
│   │       └── cors.py         # CORS configuration
│   ├── alembic/                # Database migrations
│   │   ├── versions/           # Migration files
│   │   ├── env.py              # Alembic environment
│   │   └── alembic.ini         # Alembic configuration
│   ├── tests/                  # Backend tests (future)
│   │   ├── __init__.py
│   │   ├── test_health.py
│   │   └── test_auth.py
│   ├── .env                    # Backend environment variables (not committed)
│   ├── requirements.txt        # Backend dependencies
│   └── pyproject.toml          # Python project configuration (optional)
│
├── .specify/                   # Spec-Kit Plus framework
│   ├── memory/
│   │   └── constitution.md     # Project governance
│   ├── templates/              # Templates for specs, plans, tasks
│   └── scripts/                # Helper scripts
│
├── specs/                      # Feature specifications
│   ├── overview.md
│   ├── features/               # Feature-specific specs
│   │   └── 001-project-overview/
│   ├── api/                    # API endpoint specs (future)
│   ├── database/               # Database schema specs (future)
│   └── ui/                     # UI component specs (future)
│
├── history/                    # Prompt History Records
│   ├── prompts/
│   │   ├── constitution/
│   │   ├── 001-project-overview/
│   │   └── general/
│   └── adr/                    # Architecture Decision Records
│
├── .gitignore                  # Git ignore (includes .env files)
├── docker-compose.yml          # Future: orchestrate frontend + backend
├── CLAUDE.md                   # Claude Code agent instructions
└── README.md                   # Project documentation
```

**Structure Decision**:
- **Monorepo Pattern**: Chosen to keep all code in one repository while maintaining strict separation
- **Rationale**: Aligns with Constitution Principle II (Monorepo Discipline), enables atomic commits across frontend/backend changes, simplifies dependency management during development
- **Frontend**: Next.js App Router structure (app/ directory) for modern SSR/SSG patterns
- **Backend**: Layered architecture (api → core → models) for separation of concerns
- **Configuration**: Environment-based config (.env files) never committed to version control
- **Migration Path**: Currently no shared packages; if needed in future, create `/shared` with explicit import rules

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**STATUS**: No violations detected. Table not needed.

All architectural decisions align with constitution principles. No deviations requiring justification.

---

## Phase 0: Research - Complete ✅

**Document**: [research.md](./research.md)

**Findings Summary**:
- **Testing Frameworks Resolved**:
  - Frontend: Vitest + React Testing Library + Playwright
  - Backend: pytest + pytest-asyncio + httpx
- **Deployment Platform Resolved**: Vercel (frontend) + Railway (backend)
- **Best Practices Documented**:
  - Next.js 16 Server Components patterns
  - FastAPI async/await and connection pooling
  - Better Auth JWT verification flow
  - Neon PostgreSQL serverless optimization

**All NEEDS CLARIFICATION items resolved** → Proceed to Phase 1

---

## Phase 1: Design & Contracts - Complete ✅

### 1. Data Model

**Document**: [data-model.md](./data-model.md)

**Entities Defined**:
- **User Model**: Database representation synced with Better Auth
  - Fields: id (UUID), email, email_verified, name, image, timestamps
  - Indexes: Primary key on `id`, Unique index on `email`
  - Relationships: One-to-many with Todo (future)
  - Data isolation: All queries filter by `user_id`

**Migration Strategy**:
- Tool: Alembic with auto-generation
- Initial migration: `001_create_users_table.py`
- Connection pooling configured via async SQLAlchemy engine

### 2. API Contracts

**Directory**: [contracts/](./contracts/)

**Endpoints Defined**:

#### Health Check API (`contracts/health.openapi.yaml`)
- **GET /api/health**: Public endpoint for service health status
- Response: `{ status: "healthy", message: "...", timestamp: "..." }`
- Use cases: Frontend connectivity check, load balancer health, monitoring

#### Authentication API (`contracts/auth.openapi.yaml`)
- **GET /api/auth/me**: Protected endpoint returning current user
- Security: Bearer JWT token required
- Response: User object with id, email, name, email_verified, image
- Error codes: 401 (Unauthorized - invalid/missing token)

**Contract Format**: OpenAPI 3.1.0 (Swagger-compatible)

### 3. Developer Quickstart

**Document**: [quickstart.md](./quickstart.md)

**Contents**:
- Prerequisites and environment setup
- Neon database configuration
- Backend setup (Python virtual environment, Alembic migrations)
- Frontend setup (Node.js dependencies, Next.js configuration)
- Full-stack integration verification
- Troubleshooting guide for common issues
- Development workflow and useful commands

---

## Constitution Check - Post-Design Re-evaluation ✅

### Principle I: Spec-First Development
- [x] Implementation will follow spec.md requirements
- [x] All functional requirements (FR-001 to FR-015) documented
- **STATUS**: ✅ PASS

### Principle II: Monorepo Discipline
- [x] Frontend structure defined in `frontend/` only
- [x] Backend structure defined in `backend/` only
- [x] No shared code between layers (clean separation)
- **STATUS**: ✅ PASS

### Principle III: Technology Stack Constraints
- [x] Frontend: Next.js 16+ App Router, TypeScript, Tailwind CSS
- [x] Backend: Python FastAPI, SQLModel (async), Pydantic
- [x] Database: Neon Serverless PostgreSQL
- [x] Authentication: Better Auth + JWT verification
- **STATUS**: ✅ PASS

### Principle IV: Agentic Dev Stack Workflow
- [x] Spec created (spec.md)
- [x] Plan created (plan.md - this document)
- [ ] Tasks created (via `/sp.tasks` - next command)
- [ ] Implementation (follows tasks)
- [ ] Verification (user-driven tests)
- **STATUS**: ⚠️ IN PROGRESS (plan phase complete, ready for tasks)

### Principle V: Authentication Protocol
- [x] Better Auth as identity provider
- [x] JWT verification logic documented
- [x] Backend extracts `user_id` from verified tokens
- [x] Data isolation strategy defined (filter by `user_id`)
- [x] No global data access patterns
- **STATUS**: ✅ PASS (implementation pending)

### Principle VI: Documentation & File Standards
- [x] Specs in `specs/001-project-overview/`
- [x] API contracts in `contracts/` (OpenAPI format)
- [x] Data model documented in `data-model.md`
- [x] Developer guide in `quickstart.md`
- **STATUS**: ✅ PASS

### Principle VII: Error Handling Strategy
- [x] Frontend: Error Boundaries (Next.js default)
- [x] Backend: Standard HTTP codes (401, 404, 422, 500)
- [x] Error response format defined in contracts
- **STATUS**: ✅ PASS

### Overall Gate Status - Final
**POST-DESIGN CHECK**: ✅ **PASSED** - All gates satisfied, ready for task breakdown

**NOTES**:
- No violations introduced during design phase
- Technology stack fully documented in research.md
- API contracts align with constitution error handling principles
- Data isolation strategy enforces security at data layer

---

## Next Steps

**Phase 2: Task Breakdown** (via `/sp.tasks` command)

The planning phase is complete. The next command to run is:

```bash
/sp.tasks
```

This will:
1. Read this plan.md, spec.md, data-model.md, and contracts/
2. Generate atomic, testable tasks in `tasks.md`
3. Order tasks by dependency (database → backend → frontend)
4. Include verification commands for each task
5. Follow Agentic Dev Stack Workflow (Principle IV)

**Deliverables from Planning Phase**:
- ✅ plan.md (this file)
- ✅ research.md (technology decisions)
- ✅ data-model.md (database schema)
- ✅ contracts/health.openapi.yaml (health check API)
- ✅ contracts/auth.openapi.yaml (authentication API)
- ✅ quickstart.md (developer setup guide)
- ✅ CLAUDE.md updated with technology stack

**Branch**: `001-project-overview`
**Ready for**: Task generation and implementation

---

## Architectural Decision Summary

**Key Decisions Made**:

1. **Monorepo Structure**: Chosen for atomic commits across frontend/backend
2. **Testing Strategy**: Vitest (frontend), pytest (backend), both with async support
3. **Deployment**: Vercel (frontend) + Railway (backend) for simplicity
4. **Database**: Neon serverless with connection pooling for FastAPI
5. **Authentication**: Better Auth (frontend) → JWT verification (backend) → user_id extraction
6. **Data Isolation**: All queries filter by `user_id` from verified JWT
7. **Migration Strategy**: Alembic with auto-generation from SQLModel models
8. **API Design**: OpenAPI 3.1.0 contracts, standard HTTP error codes

**No ADR Required**: All decisions align with constitution, no deviations needing justification.

---

**Planning Phase Complete** ✅

**Date**: 2025-12-31
**Next Command**: `/sp.tasks`
