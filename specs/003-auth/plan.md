# Implementation Plan: Authentication & Route Protection

**Branch**: `003-auth` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-auth/spec.md`

## Summary

Convert the existing single-user Task CRUD application into a secure, multi-user system with authentication and route protection. The implementation will use Better Auth for frontend authentication, JWT token verification in the FastAPI backend, and Neon PostgreSQL for user data storage. The current root page task interface will move to a protected `/dashboard` route, with a new public landing page at `/`. All existing demo tasks will be deleted during migration due to incompatible user ID formats.

## Technical Context

**Language/Version**:
- Frontend: TypeScript (latest stable) with Next.js 16+
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+ (App Router), Better Auth SDK, Tailwind CSS, React Query
- Backend: FastAPI, SQLModel, PyJWT, python-jose
- Database: Neon Serverless PostgreSQL

**Storage**: Neon Serverless PostgreSQL with connection pooling

**Testing**:
- Frontend: Jest + React Testing Library
- Backend: pytest with FastAPI TestClient
- E2E: Manual verification via browser (automated E2E out of scope)

**Target Platform**: Web application (Linux server backend, modern browsers frontend)

**Project Type**: Web (monorepo with separate frontend/backend)

**Performance Goals**:
- API response time < 200ms p95
- Support 100+ concurrent authenticated users
- Session persistence across browser refreshes

**Constraints**:
- JWT tokens stored in HTTP-only cookies (Better Auth default)
- Stateless backend (no session storage)
- All database queries MUST filter by authenticated user_id

**Scale/Scope**:
- Initial target: 100 concurrent users
- Database: User, Session, Account, Task tables (~4 entities)
- Frontend: 5 pages (Landing, Login, Signup, Dashboard, potential Logout)
- Backend: 1 new auth dependency + updates to 4 existing task endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-First Development ✅
- [x] Specification exists at `specs/003-auth/spec.md`
- [x] Specification is approved and complete
- [x] All requirements are traceable to spec sections

### Principle II: Monorepo Discipline ✅
- [x] Frontend changes confined to `/frontend` directory
- [x] Backend changes confined to `/backend` directory
- [x] No cross-contamination of concerns

### Principle III: Technology Stack Constraints ✅
- [x] Frontend: Next.js 16+ (App Router) ✅
- [x] Frontend: TypeScript ✅
- [x] Frontend: Tailwind CSS ✅
- [x] Backend: Python FastAPI ✅
- [x] Backend: SQLModel (ORM) ✅
- [x] Database: Neon Serverless PostgreSQL ✅
- [x] Authentication: Better Auth (Frontend) ✅
- [x] Authentication: JWT Verification (Backend) ✅

### Principle IV: Agentic Dev Stack Workflow ✅
- [x] Spec analyzed and approved
- [x] Plan being created (this document)
- [x] Tasks will follow in Phase 2
- [x] Implementation will be incremental with verification gates

### Principle V: Authentication Protocol (Strict) ✅
- [x] Better Auth as identity provider (Frontend)
- [x] JWT tokens issued on login/signup
- [x] Backend verifies JWT signature using `BETTER_AUTH_SECRET`
- [x] Backend extracts `user_id` from verified tokens
- [x] All task queries will include `where(user_id == current_user)`
- [x] No global data access

### Principle VI: Documentation & File Standards ✅
- [x] Spec hierarchy followed (`specs/003-auth/spec.md`, `plan.md`)
- [x] API contracts will be documented in Phase 1
- [x] Code will use docstrings at API boundaries

### Principle VII: Error Handling Strategy ✅
- [x] Frontend: Error boundaries for crashes, toast notifications for API errors
- [x] Backend: 401 for auth errors, 404 for not found, 422 for validation
- [x] No 500 for expected logic errors

**Constitution Compliance**: ✅ PASS - All principles satisfied, no violations

## Project Structure

### Documentation (this feature)

```text
specs/003-auth/
├── plan.md              # This file (architecture and design)
├── research.md          # Phase 0: Better Auth integration patterns, JWT verification
├── data-model.md        # Phase 1: User, Session, Account, Task entity relationships
├── quickstart.md        # Phase 1: Developer setup for auth (env vars, DB setup)
├── contracts/           # Phase 1: API contract updates for authenticated endpoints
│   ├── auth-endpoints.yaml      # Better Auth endpoints (reference only)
│   └── tasks-endpoints.yaml     # Updated task endpoints with auth
└── tasks.md             # Phase 2: Implementation task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
# Web application structure (monorepo)

backend/
├── app/
│   ├── api/
│   │   ├── dependencies.py          # NEW: get_current_user dependency
│   │   └── routes/
│   │       └── tasks.py             # MODIFIED: Remove DEMO_USER_ID, add auth
│   ├── core/
│   │   ├── auth.py                  # NEW: JWT verification logic
│   │   └── config.py                # MODIFIED: Add BETTER_AUTH_SECRET
│   ├── models/
│   │   └── task.py                  # EXISTING: No changes needed
│   └── utils/
│       └── constants.py             # MODIFIED: Remove DEMO_USER_ID
├── alembic/
│   └── versions/
│       └── xxx_add_user_tables.py   # NEW: Better Auth schema migration
│       └── xxx_update_task_user_id.py # NEW: Change user_id format
│       └── xxx_truncate_demo_tasks.py # NEW: Delete demo tasks
└── tests/
    └── api/
        └── test_auth_tasks.py       # NEW: Auth integration tests

frontend/
├── app/
│   ├── page.tsx                     # MODIFIED: New landing page
│   ├── login/
│   │   └── page.tsx                 # NEW: Login page
│   ├── signup/
│   │   └── page.tsx                 # NEW: Signup page
│   ├── dashboard/
│   │   └── page.tsx                 # NEW: Moved from app/page.tsx
│   └── layout.tsx                   # MODIFIED: Add auth provider
├── lib/
│   ├── auth.ts                      # NEW: Better Auth configuration
│   └── api.ts                       # MODIFIED: Add JWT token to requests
├── components/
│   ├── TaskList.tsx                 # EXISTING: No changes
│   ├── CreateTaskForm.tsx           # EXISTING: No changes
│   └── auth/
│       ├── LoginForm.tsx            # NEW: Login form component
│       └── SignupForm.tsx           # NEW: Signup form component
├── hooks/
│   ├── useTasks.ts                  # EXISTING: No changes (api.ts handles auth)
│   └── useAuth.ts                   # NEW: Better Auth hooks wrapper
├── middleware.ts                    # NEW: Route protection
└── .env.local                       # MODIFIED: Add BETTER_AUTH_SECRET
```

**Structure Decision**: This is a web application using the monorepo pattern with strict separation between `frontend/` and `backend/`. The structure follows Next.js 16 App Router conventions (frontend) and FastAPI best practices (backend). No new top-level directories are needed; all changes fit within existing structure.

## Complexity Tracking

> **No violations - Constitution compliance verified**

This feature introduces no architectural complexity violations. All changes align with established principles:
- Authentication follows prescribed Better Auth (frontend) + JWT verification (backend) pattern
- Monorepo discipline maintained (no cross-directory contamination)
- Technology stack unchanged (Next.js 16+, FastAPI, Neon PostgreSQL)
- Stateless backend design preserved (no session storage)

---

## Phase 0: Research & Investigation

### Research Tasks

1. **Better Auth Integration Patterns**
   - **Question**: How to configure Better Auth in Next.js 16 App Router with email/password authentication?
   - **Investigation**: Review Better Auth documentation for:
     - Installation and setup (`better-auth` npm package)
     - Configuration file structure (`lib/auth.ts`)
     - Client-side hooks (`useSession`, `signIn`, `signUp`, `signOut`)
     - Server-side session verification
     - JWT token format and claims structure
   - **Decision Target**: Specific Better Auth configuration code

2. **JWT Verification in FastAPI**
   - **Question**: How to verify Better Auth JWT tokens in Python FastAPI?
   - **Investigation**: Research:
     - JWT token structure from Better Auth
     - Python libraries for JWT verification (`python-jose`, `pyjwt`)
     - Token signature verification using `BETTER_AUTH_SECRET`
     - Extracting `user_id` claim from decoded token
     - Handling token expiration and invalid signatures
   - **Decision Target**: FastAPI dependency function implementation pattern

3. **Neon Database Schema for Better Auth**
   - **Question**: What database schema does Better Auth require?
   - **Investigation**: Use Better Auth MCP to:
     - Generate User, Session, and Account table schemas
     - Understand column types and constraints
     - Identify foreign key relationships
     - Determine compatible `user_id` format (UUID vs string)
   - **Decision Target**: Alembic migration scripts for schema

4. **User ID Migration Strategy**
   - **Question**: How to migrate from `DEMO_USER_ID` (string "demo-user-123") to Better Auth UUIDs?
   - **Investigation**:
     - Better Auth user ID format (likely UUID or custom string)
     - Database column type changes needed in `tasks.user_id`
     - Impact on existing demo task data (confirmed: delete all via `TRUNCATE`)
   - **Decision Target**: Migration sequence and SQL commands

5. **Next.js Middleware for Route Protection**
   - **Question**: How to implement middleware that redirects unauthenticated users?
   - **Investigation**: Review Next.js 16 middleware patterns:
     - Middleware file structure and exports
     - Checking authentication status server-side
     - Redirecting to `/login` from `/dashboard`
     - Allowing public routes (`/`, `/login`, `/signup`)
   - **Decision Target**: `middleware.ts` implementation pattern

### Research Output: `research.md`

Document findings for each task above in the format:
```markdown
## [Task Name]

**Decision**: [What was chosen]

**Rationale**: [Why this approach]

**Alternatives Considered**: [What else was evaluated and why rejected]

**Implementation Notes**: [Key details for Phase 1]
```

---

## Phase 1: Design & Contracts

### Data Model Design (`data-model.md`)

#### Entity: User
- **Managed By**: Better Auth
- **Attributes**:
  - `id` (string/UUID): Primary key, unique identifier
  - `name` (string): User's display name
  - `email` (string, unique): User's email address (used for login)
  - `password` (string, hashed): Bcrypt/Argon2 hashed password
  - `created_at` (timestamp): Account creation time
  - `updated_at` (timestamp): Last account modification time
  - `email_verified` (boolean, optional): Future email verification support

**Relationships**:
- One User → Many Tasks (via `tasks.user_id` foreign key)
- One User → Many Sessions (via `session.user_id` foreign key)
- One User → Many Accounts (via `account.user_id` foreign key)

**Validation Rules**:
- Email must be valid format and unique
- Password must meet minimum strength requirements (length, complexity)
- Name is required and non-empty

#### Entity: Session
- **Managed By**: Better Auth
- **Attributes**:
  - `id` (string/UUID): Primary key
  - `user_id` (string/UUID): Foreign key to User
  - `token` (string): Session token (JWT)
  - `expires_at` (timestamp): Session expiration time
  - `created_at` (timestamp): Session creation time
  - `ip_address` (string, optional): Client IP for security audit
  - `user_agent` (string, optional): Client browser/device info

**Relationships**:
- Many Sessions → One User

**State Transitions**:
- `created` → `active` (on successful login)
- `active` → `expired` (when `expires_at` is reached)
- `active` → `revoked` (on logout or manual revocation)

#### Entity: Account
- **Managed By**: Better Auth
- **Attributes**:
  - `id` (string/UUID): Primary key
  - `user_id` (string/UUID): Foreign key to User
  - `provider` (string): Authentication provider (email for this phase)
  - `provider_account_id` (string): Provider-specific account ID
  - `created_at` (timestamp): Account link creation time

**Relationships**:
- Many Accounts → One User

**Note**: In this phase, only email/password provider is used. Future phases may add OAuth providers (Google, GitHub).

#### Entity: Task (Modified)
- **Managed By**: Application
- **Attributes**:
  - `id` (integer): Primary key (existing)
  - `user_id` (string/UUID): Foreign key to User (MODIFIED from string)
  - `title` (string): Task title (existing)
  - `description` (text, optional): Task description (existing)
  - `status` (string): Task status (existing)
  - `created_at` (timestamp): Task creation time (existing)
  - `updated_at` (timestamp): Last task modification time (existing)

**Relationships**:
- Many Tasks → One User

**Validation Rules** (existing):
- Title is required and non-empty
- Status must be valid enum value
- User ID must reference existing user (foreign key constraint)

**Migration Impact**:
- Column type change: `user_id` from `VARCHAR` to match User `id` type (UUID/string)
- Data deletion: All existing tasks with `user_id = "demo-user-123"` will be truncated
- Foreign key: Add constraint `tasks.user_id` → `users.id`

### API Contracts (`contracts/`)

#### File: `contracts/tasks-endpoints.yaml`

```yaml
openapi: 3.0.0
info:
  title: Tasks API (Authenticated)
  version: 2.0.0
  description: Task CRUD operations with user authentication

paths:
  /api/tasks:
    get:
      summary: List all tasks for authenticated user
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  tasks:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'
                  total:
                    type: integer
        '401':
          description: Unauthorized (missing or invalid token)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    post:
      summary: Create a new task for authenticated user
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskCreate'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '401':
          description: Unauthorized
        '422':
          description: Validation error

  /api/tasks/{task_id}:
    patch:
      summary: Update a task (user must own the task)
      security:
        - BearerAuth: []
      parameters:
        - name: task_id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskUpdate'
      responses:
        '200':
          description: Task updated
        '401':
          description: Unauthorized
        '403':
          description: Forbidden (user does not own task)
        '404':
          description: Task not found

    delete:
      summary: Delete a task (user must own the task)
      security:
        - BearerAuth: []
      parameters:
        - name: task_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '204':
          description: Task deleted
        '401':
          description: Unauthorized
        '403':
          description: Forbidden (user does not own task)
        '404':
          description: Task not found

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token from Better Auth

  schemas:
    Task:
      type: object
      properties:
        id:
          type: integer
        user_id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        status:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    TaskCreate:
      type: object
      required:
        - title
      properties:
        title:
          type: string
        description:
          type: string
        status:
          type: string

    TaskUpdate:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        status:
          type: string

    Error:
      type: object
      properties:
        detail:
          type: string
```

#### File: `contracts/auth-endpoints.yaml`

```yaml
# Reference only - Better Auth provides these endpoints automatically
# Frontend uses Better Auth SDK to interact with these endpoints

openapi: 3.0.0
info:
  title: Better Auth API (Reference)
  version: 1.0.0
  description: Authentication endpoints provided by Better Auth (read-only reference)

paths:
  /api/auth/signin:
    post:
      summary: Sign in with email and password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  session:
                    $ref: '#/components/schemas/Session'
        '401':
          description: Invalid credentials

  /api/auth/signup:
    post:
      summary: Create new user account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
                - password
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '201':
          description: Account created
        '400':
          description: Email already exists or validation error

  /api/auth/signout:
    post:
      summary: Sign out current user
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Signed out successfully

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
        created_at:
          type: string
          format: date-time

    Session:
      type: object
      properties:
        id:
          type: string
        token:
          type: string
        expires_at:
          type: string
          format: date-time
```

### Developer Quickstart (`quickstart.md`)

```markdown
# Authentication Setup Quickstart

## Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Neon PostgreSQL database with connection string

## Environment Variables

### Frontend (`.env.local`)
```bash
BETTER_AUTH_SECRET=<generate-strong-secret>  # Use: openssl rand -base64 32
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=<neon-connection-string>
```

### Backend (`.env`)
```bash
BETTER_AUTH_SECRET=<same-secret-as-frontend>
DATABASE_URL=<neon-connection-string>
```

**CRITICAL**: `BETTER_AUTH_SECRET` must be identical in both frontend and backend.

## Database Setup

1. Apply Better Auth schema using Better Auth MCP:
   ```bash
   # Use Better Auth MCP to generate User, Session, Account tables
   ```

2. Run Alembic migrations to update tasks table:
   ```bash
   cd backend
   alembic upgrade head
   ```

3. Truncate demo tasks (one-time migration):
   ```sql
   TRUNCATE TABLE tasks;
   ```

## Frontend Setup

1. Install Better Auth:
   ```bash
   cd frontend
   npm install better-auth
   ```

2. Configure Better Auth in `lib/auth.ts` (see research.md for code)

3. Add auth provider to `app/layout.tsx`

4. Start dev server:
   ```bash
   npm run dev
   ```

## Backend Setup

1. Install JWT dependencies:
   ```bash
   cd backend
   pip install python-jose[cryptography] passlib[bcrypt]
   ```

2. Implement JWT verification in `app/core/auth.py` (see research.md)

3. Add `get_current_user` dependency to `app/api/dependencies.py`

4. Update task routes to use authentication

5. Start dev server:
   ```bash
   fastapi dev main.py
   ```

## Testing Authentication Flow

1. Visit `http://localhost:3000` (landing page)
2. Click "Sign Up" and create account
3. After signup, verify redirect to `/dashboard`
4. Try accessing `/dashboard` in incognito (should redirect to `/login`)
5. Create a task and verify it appears only for your user
6. Sign out and sign in again to verify session persistence

## Troubleshooting

- **401 errors**: Check `BETTER_AUTH_SECRET` matches in both .env files
- **JWT verification fails**: Ensure `python-jose` is installed and secret is correct
- **Session not persisting**: Clear browser cookies and restart frontend
- **Database errors**: Verify Neon connection string and run migrations
```

---

## Phase 2: Task Breakdown

**Note**: Detailed task breakdown will be generated by the `/sp.tasks` command in Phase 2. This plan provides the architectural foundation for task creation.

### High-Level Implementation Sequence

1. **Database Migration** (database-dev-agent)
   - Generate Better Auth schema using Better Auth MCP
   - Create Alembic migration to modify `tasks.user_id` column
   - Create Alembic migration to truncate demo tasks
   - Apply migrations to Neon database

2. **Backend Authentication** (backend-dev-agent)
   - Implement `app/core/auth.py` with JWT verification logic
   - Implement `app/api/dependencies.py` with `get_current_user` dependency
   - Update `app/api/routes/tasks.py` to use `get_current_user`
   - Remove `DEMO_USER_ID` from `app/utils/constants.py`
   - Update `app/core/config.py` to load `BETTER_AUTH_SECRET`

3. **Frontend Authentication** (frontend-dev-agent)
   - Install and configure Better Auth in `lib/auth.ts`
   - Create `hooks/useAuth.ts` wrapper for Better Auth hooks
   - Create `components/auth/LoginForm.tsx`
   - Create `components/auth/SignupForm.tsx`
   - Create `app/login/page.tsx`
   - Create `app/signup/page.tsx`
   - Move existing `app/page.tsx` content to `app/dashboard/page.tsx`
   - Create new landing page at `app/page.tsx`
   - Implement `middleware.ts` for route protection
   - Update `lib/api.ts` to include JWT token in requests
   - Update `app/layout.tsx` to add auth provider

4. **Integration Testing** (qa-spec-validator)
   - Test user registration flow
   - Test login flow
   - Test route protection (dashboard access)
   - Test task CRUD with authenticated user
   - Test data isolation (multi-user scenario)
   - Verify 401 responses for unauthenticated requests

---

## Architecture Decisions

### AD-001: Better Auth for Frontend Authentication

**Decision**: Use Better Auth framework for all frontend authentication logic.

**Rationale**:
- Mature, well-documented framework for Next.js
- Handles session management, token generation, and secure storage automatically
- Supports email/password out of the box with extensibility for OAuth later
- Provides React hooks for seamless UI integration
- Reduces custom authentication code and security vulnerabilities

**Alternatives Considered**:
- NextAuth.js: More complex setup, heavier framework
- Custom JWT implementation: High security risk, reinventing the wheel
- Clerk: Third-party service, introduces cost and external dependency

**Trade-offs**:
- Better Auth requires frontend dependency (acceptable)
- Must coordinate `BETTER_AUTH_SECRET` between frontend and backend (documented in quickstart)

---

### AD-002: Stateless JWT Verification in Backend

**Decision**: Backend verifies JWT tokens but does NOT manage sessions. All session logic remains in Better Auth (frontend).

**Rationale**:
- Aligns with constitution principle V (stateless backend)
- Scales horizontally without session storage infrastructure
- Simplifies backend logic (no session CRUD operations)
- JWT signature verification provides sufficient authentication

**Alternatives Considered**:
- Backend session storage (Redis/database): Violates stateless principle, adds complexity
- Opaque tokens with session lookup: Requires backend session management, slower

**Trade-offs**:
- Cannot revoke tokens server-side without token blacklist (acceptable for Phase 1)
- Token expiration relies on client-side Better Auth refresh logic (standard practice)

---

### AD-003: Truncate Demo Tasks During Migration

**Decision**: Delete all existing demo tasks (`TRUNCATE TABLE tasks`) instead of migrating them to a default user account.

**Rationale**:
- Demo tasks have incompatible `user_id` format ("demo-user-123" vs UUID)
- No production value in preserving demo data
- Clean slate ensures data integrity post-migration
- Simplifies migration script (no user account creation needed)

**Alternatives Considered**:
- Migrate to "admin" user account: Requires creating default user, adds complexity
- Leave orphaned: Violates foreign key constraints, breaks referential integrity
- Export then delete: No use case for exported demo data

**Trade-offs**:
- Irreversible data loss (acceptable for demo data)
- Must communicate to users before migration (documented in spec)

---

### AD-004: User ID Type as UUID String

**Decision**: Use UUID format (string) for User IDs to match Better Auth default.

**Rationale**:
- Better Auth generates UUIDs by default for user IDs
- UUIDs prevent ID enumeration attacks (security benefit)
- Globally unique across distributed systems (future-proof)
- Standard practice for user identity in modern web apps

**Alternatives Considered**:
- Auto-incrementing integer: Predictable, enables enumeration attacks, not Better Auth default
- Custom string format: Incompatible with Better Auth, requires customization

**Trade-offs**:
- Larger column size (36 bytes vs 4 bytes integer) - negligible for user table
- Requires foreign key update in tasks table (planned migration)

---

## Implementation Checklist

### Pre-Implementation
- [x] Specification approved (`specs/003-auth/spec.md`)
- [x] Constitution check passed (all principles compliant)
- [ ] Research completed (`research.md` created)
- [ ] Data model documented (`data-model.md` created)
- [ ] API contracts defined (`contracts/*.yaml` created)
- [ ] Quickstart guide written (`quickstart.md` created)

### Implementation Readiness
- [ ] Environment variables documented and generated (`BETTER_AUTH_SECRET`)
- [ ] Neon database accessible and connection string available
- [ ] Better Auth MCP available for schema generation
- [ ] Alembic configured in backend for migrations
- [ ] Frontend and backend dev servers running locally

### Post-Implementation
- [ ] All tasks completed (see `tasks.md` from `/sp.tasks`)
- [ ] Integration tests passing
- [ ] Manual QA verification complete (see User Stories acceptance criteria)
- [ ] Demo data truncated and migration verified
- [ ] Documentation updated (if needed)

---

## Risk Analysis

### Risk 1: JWT Secret Mismatch Between Frontend and Backend
**Probability**: Medium
**Impact**: High (authentication completely broken)
**Mitigation**:
- Document secret sharing requirement prominently in quickstart
- Use same `.env` template for both environments
- Add verification step in testing checklist (401 error check)

### Risk 2: Session Persistence Issues in Browser
**Probability**: Low
**Impact**: Medium (user experience degradation, frequent re-login)
**Mitigation**:
- Better Auth handles cookie persistence by default (HTTP-only, secure)
- Test session persistence in acceptance criteria
- Document cookie clearing in troubleshooting guide

### Risk 3: Data Loss During Migration (Demo Tasks)
**Probability**: Low (intentional)
**Impact**: None (demo data only)
**Mitigation**:
- Explicitly documented in spec and plan
- User confirmation obtained in spec clarification (Q1: A)
- No production data exists yet (pre-launch)

### Risk 4: Route Protection Middleware Conflicts with Next.js
**Probability**: Low
**Impact**: Medium (routes may not be protected correctly)
**Mitigation**:
- Use Next.js 16 standard middleware patterns (well-documented)
- Test middleware with manual QA (acceptance criteria US3)
- Research phase includes middleware implementation patterns

---

## Next Steps

1. **Run Research Phase**: Execute research tasks and create `research.md` with findings
2. **Generate Artifacts**: Create `data-model.md`, `contracts/*.yaml`, and `quickstart.md` based on research
3. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh claude` to add new technologies
4. **Re-verify Constitution**: Confirm no new violations introduced during design
5. **Create Tasks**: Run `/sp.tasks` to generate detailed implementation task breakdown in `tasks.md`
6. **Begin Implementation**: Execute tasks sequentially with agent delegation (database → backend → frontend → QA)
