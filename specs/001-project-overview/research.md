# Phase 0: Research - Project Foundation

**Feature**: 001-project-overview
**Date**: 2025-12-31
**Phase**: Research & Technology Decision

## Purpose

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context in `plan.md` and establishes the technology decisions for the foundational infrastructure.

---

## Research Tasks

### 1. Testing Framework Selection

**Unknown**: Testing frameworks for frontend and backend

#### Frontend Testing (Next.js + TypeScript)

**Decision**: Vitest + React Testing Library for unit/integration, Playwright for e2e

**Rationale**:
- **Vitest**: Native ESM support, faster than Jest, better TypeScript integration, built-in coverage
- **React Testing Library**: Testing Library is the industry standard for React component testing, focuses on user behavior over implementation details
- **Playwright**: Official Next.js recommendation for e2e testing, cross-browser support, automatic waiting, excellent debugging

**Alternatives Considered**:
- Jest + React Testing Library: Mature but slower, requires additional ESM configuration
- Cypress: Good e2e but less performant than Playwright, limited multi-browser support
- Testing Library alone: Insufficient for e2e scenarios

**Implementation Notes**:
- Configure Vitest in `frontend/vitest.config.ts`
- Playwright config in `frontend/playwright.config.ts`
- Out of scope for initial phase (will be added in testing feature spec)

#### Backend Testing (Python + FastAPI)

**Decision**: pytest + pytest-asyncio + httpx

**Rationale**:
- **pytest**: De facto standard for Python testing, rich plugin ecosystem, excellent async support
- **pytest-asyncio**: Official async test support for pytest, required for FastAPI async endpoints
- **httpx**: Async HTTP client recommended by FastAPI docs for testing endpoints, drop-in replacement for requests

**Alternatives Considered**:
- unittest: Built-in but less ergonomic, lacks async support without workarounds
- TestClient from Starlette: Good for sync tests but httpx better for async patterns
- requests: No async support

**Implementation Notes**:
- Configure pytest in `backend/pytest.ini` or `backend/pyproject.toml`
- Out of scope for initial phase (will be added in testing feature spec)

---

### 2. Production Deployment Platform

**Unknown**: Target platform for production deployment

**Decision**: Vercel (frontend) + Railway (backend)

**Rationale**:

**Vercel (Frontend)**:
- Zero-config Next.js deployment (Vercel is the creator of Next.js)
- Automatic preview deployments for PRs
- Built-in CDN and edge network
- Native support for App Router and Server Components
- Free tier sufficient for development/demo

**Railway (Backend)**:
- Native Python + FastAPI support
- PostgreSQL integration (can provision or connect to Neon)
- Environment variable management
- Automatic deployments from GitHub
- Generous free tier ($5 credit/month)

**Alternatives Considered**:
- Render: Similar to Railway but slower cold starts
- Fly.io: More complex config, requires Dockerfile
- AWS/GCP: Over-engineered for initial MVP, complex billing
- Heroku: Expensive after free tier removal

**Implementation Notes**:
- Deployment configuration out of scope for this phase
- Will be addressed in dedicated deployment feature spec
- Both platforms support environment variable injection (required for secrets)

---

### 3. Best Practices for Technology Stack

#### 3.1 Next.js 16 App Router Best Practices

**Research Focus**: Server Components vs Client Components, caching, data fetching

**Key Findings**:

1. **Server Components by Default**:
   - All components are Server Components unless marked with `"use client"`
   - Server Components can fetch data directly, reducing client bundle size
   - Use Client Components only for interactivity (event handlers, state, hooks)

2. **Data Fetching Patterns**:
   - Use `async/await` in Server Components for data fetching
   - No need for `useEffect` for initial data loading
   - Parallel data fetching via `Promise.all()` when possible

3. **Caching Strategy**:
   - Next.js 16 uses aggressive caching by default (fetch cache, router cache)
   - Use `revalidate` option in fetch for dynamic data
   - Auth-dependent pages should use `no-store` cache option

4. **Routing**:
   - File-system based routing via `app/` directory
   - Use route groups `(auth)` for organizational structure without URL impact
   - Parallel routes for simultaneous rendering

**Sources**:
- Official Next.js 16 docs (via MCP Next.js server)
- Vercel best practices guide
- React 19 documentation for Server Components

**Application to Project**:
- Health check page: Server Component fetching backend API
- Login/Signup pages: Client Components for form interactivity
- Dashboard (future): Server Component with `no-store` cache for user-specific data

#### 3.2 FastAPI + SQLModel Best Practices

**Research Focus**: Async patterns, database connection pooling, JWT verification

**Key Findings**:

1. **Async Patterns**:
   - Use `async def` for all route handlers
   - Use `asyncpg` driver for PostgreSQL (faster than psycopg2)
   - Use `AsyncSession` from SQLModel for database queries
   - Avoid blocking I/O in async routes (use `run_in_executor` if needed)

2. **Database Connection Pooling**:
   - Use `create_async_engine` with connection pool settings
   - Configure `pool_size`, `max_overflow`, `pool_recycle`
   - Use dependency injection for session management (`Depends(get_db)`)
   - Close sessions properly (use `async with` context manager)

3. **JWT Verification**:
   - Use `python-jose[cryptography]` for JWT operations
   - Verify signature using `BETTER_AUTH_SECRET` from environment
   - Extract `user_id` claim from verified token
   - Create dependency `get_current_user` for protected routes
   - Return 401 for invalid/expired tokens

4. **Error Handling**:
   - Use `HTTPException` for expected errors (401, 404, 422)
   - Use Pydantic validation for automatic 422 errors
   - Log stack traces for unexpected 500 errors
   - Return consistent error response format per constitution

**Sources**:
- FastAPI official documentation (async patterns)
- SQLModel documentation (async sessions)
- python-jose library docs (JWT verification)
- Neon serverless best practices (connection pooling)

**Application to Project**:
- Health endpoint: Simple async route returning JSON
- JWT middleware: Dependency injection pattern for token verification
- Database models: SQLModel with async sessions
- All routes use async/await (no sync blocking)

#### 3.3 Better Auth Integration Patterns

**Research Focus**: JWT structure, token validation, user_id extraction

**Key Findings**:

1. **Better Auth JWT Structure**:
   - Better Auth issues JWT tokens with standard claims: `sub` (user_id), `iat`, `exp`
   - Token signed with `BETTER_AUTH_SECRET` using HS256 algorithm
   - Token sent in `Authorization: Bearer <token>` header

2. **Validation Flow**:
   - Backend receives token from Authorization header
   - Verify signature using same `BETTER_AUTH_SECRET` as frontend
   - Check expiration (`exp` claim)
   - Extract `sub` claim as `user_id`
   - Attach `user_id` to request context for downstream use

3. **Security Considerations**:
   - Store `BETTER_AUTH_SECRET` in environment variables only
   - Use HTTPS in production to prevent token interception
   - Implement token refresh logic (Better Auth handles this on frontend)
   - Backend should never create tokens, only verify

4. **User Model Sync**:
   - Better Auth creates its own user table in frontend database
   - Backend can optionally sync user data to its own database
   - Use `user_id` as foreign key for data isolation
   - No password storage in backend (Better Auth handles authentication)

**Sources**:
- Better Auth official documentation (via MCP Better Auth server)
- JWT specification (RFC 7519)
- OAuth 2.0 best practices

**Application to Project**:
- Frontend: Better Auth SDK configured with `BETTER_AUTH_SECRET`
- Backend: JWT verification middleware extracting `user_id`
- No user creation in backend (Better Auth is source of truth)
- All protected routes depend on `get_current_user` dependency

#### 3.4 Neon PostgreSQL Connection Best Practices

**Research Focus**: Serverless connection handling, connection pooling, migrations

**Key Findings**:

1. **Serverless Connection Pooling**:
   - Neon provides built-in connection pooling via connection URL
   - Use pooled connection string for serverless/ephemeral environments
   - Use direct connection string for persistent applications
   - Set `pool_size=10` in SQLAlchemy engine for FastAPI

2. **Connection String Format**:
   - Format: `postgresql+asyncpg://user:pass@host/dbname?sslmode=require`
   - Use `asyncpg` driver for async FastAPI
   - Always use SSL in production (`sslmode=require`)

3. **Migration Strategy**:
   - Use Alembic for schema migrations
   - Auto-generate migrations from SQLModel models: `alembic revision --autogenerate`
   - Apply migrations: `alembic upgrade head`
   - Version control all migration files in `alembic/versions/`

4. **Performance Optimization**:
   - Use Neon's read replicas for read-heavy workloads (out of scope for MVP)
   - Leverage Neon's instant branching for dev/staging environments
   - Monitor connection usage via Neon dashboard
   - Set `pool_recycle=3600` to avoid stale connections

**Sources**:
- Neon documentation (via MCP Neon server)
- SQLModel async patterns documentation
- Alembic documentation

**Application to Project**:
- Use Neon pooled connection string in `backend/.env`
- Configure async engine with proper pool settings
- Set up Alembic with `alembic init alembic`
- Initial migration for User model (synced from Better Auth structure)

---

## Summary of Resolved Clarifications

| Technical Context Item | Original Status | Resolution |
|------------------------|-----------------|------------|
| Testing - Frontend | NEEDS CLARIFICATION | Vitest + React Testing Library + Playwright |
| Testing - Backend | NEEDS CLARIFICATION | pytest + pytest-asyncio + httpx |
| Target Platform | NEEDS CLARIFICATION | Vercel (frontend) + Railway (backend) |

---

## Technology Stack - Final

**Frontend**:
- Runtime: Node.js 20+
- Framework: Next.js 16+ (App Router)
- Language: TypeScript 5.x
- Styling: Tailwind CSS 3.x
- Authentication: Better Auth
- HTTP Client: Fetch API (built-in)
- Testing: Vitest, React Testing Library, Playwright (future)

**Backend**:
- Runtime: Python 3.11+
- Framework: FastAPI
- ORM: SQLModel (async)
- Database Driver: asyncpg
- Migrations: Alembic
- JWT Library: python-jose[cryptography]
- Testing: pytest, pytest-asyncio, httpx (future)

**Database**:
- Provider: Neon Serverless PostgreSQL
- Connection: Pooled connection string
- SSL: Required

**Deployment** (future):
- Frontend: Vercel
- Backend: Railway
- Database: Neon (already cloud-hosted)

---

## Next Steps

With all clarifications resolved, proceed to **Phase 1: Design & Contracts**:

1. Create `data-model.md` (database schema)
2. Create API contracts in `contracts/` (OpenAPI specs)
3. Create `quickstart.md` (developer setup guide)
4. Update agent context with finalized technology stack

**Phase 0 Complete** ✅
