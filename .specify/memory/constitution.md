<!--
Sync Impact Report:
- Version change: (initial) → 1.0.0
- Modified principles:
  * Added: Spec-First Development
  * Added: Monorepo Discipline
  * Added: Technology Stack Constraints
  * Added: Agentic Dev Stack Workflow
  * Added: Authentication Protocol
  * Added: Documentation & File Standards
  * Added: Error Handling Strategy
- Added sections:
  * Technology Stack Constraints
  * Agentic Dev Stack Workflow
  * Authentication Protocol
  * Documentation & File Standards
  * Error Handling Strategy
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns with new principles
  ✅ spec-template.md - User scenarios and requirements align with spec-first approach
  ✅ tasks-template.md - Task structure supports workflow and testing principles
- Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-First Development

Never write implementation code without an existing, referenced specification in `specs/`. If a spec is missing or vague, request its creation/update first.

**Rationale**: Specifications serve as the single source of truth for requirements. Implementation without specs leads to scope drift, misalignment with user intent, and untraceable decisions. This principle ensures all code is justified, testable, and aligned with documented requirements.

### II. Monorepo Discipline

Strict separation of concerns. Frontend code lives ONLY in `/frontend`. Backend code lives ONLY in `/backend`. Configuration lives in root or `.specify`.

**Rationale**: Clear boundaries prevent architectural coupling, enable independent testing and deployment, and allow different teams or agents to work in parallel without file conflicts. Violations of this principle create maintenance debt and deployment complexity.

### III. Technology Stack Constraints

**Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS.
- MUST use Server Components by default
- MUST use Client Components only for interactivity

**Backend**: Python FastAPI, SQLModel (ORM).
- MUST use async/await patterns
- MUST use Pydantic models for all schemas

**Database**: Neon Serverless PostgreSQL.

**Authentication**: Better Auth (Frontend) + JWT Verification (Backend).
- Backend MUST NOT manage sessions
- Backend MUST strictly verify JWT tokens passed in the `Authorization` header

**Rationale**: Standardization on proven technologies reduces cognitive load, ensures compatibility across the stack, and leverages team expertise. Constraints around async patterns, Server Components, and stateless backend authentication align with scalability and performance best practices.

### IV. Agentic Dev Stack Workflow

You MUST strictly follow this loop for every feature request:

1. **Read Spec**: Analyze the relevant file in `specs/features/`
2. **Plan**: Propose a high-level plan (Frontend changes → Backend changes → DB changes)
3. **Break Down**: Split the plan into atomic, testable steps
4. **Implement**: Execute code generation
5. **Verify**: Ask the user to run the specific test command for that layer

**Rationale**: This workflow enforces test-driven development, incremental progress, and clear verification gates. Each step produces a concrete artifact (spec, plan, task list, code, test result), creating an auditable trail and preventing "big bang" implementations that are hard to debug and rollback.

### V. Authentication Protocol (Strict)

**Source of Truth**: Better Auth (running in Next.js) is the identity provider.

**Handshake**:
1. User logs in via Frontend
2. Better Auth issues a JWT
3. Frontend attaches `Authorization: Bearer <token>` to ALL requests to `/api/*`
4. FastAPI middleware verifies the signature using `BETTER_AUTH_SECRET`
5. FastAPI extracts `user_id` from the token to filter data

**Data Isolation**: Every SQL query MUST include a `where(user_id == current_user)` clause. No global data access.

**Rationale**: Stateless authentication scales horizontally, simplifies backend logic, and enforces security at the data layer. Row-level filtering by `user_id` prevents data leakage and supports multi-tenancy. Violations of this principle create security vulnerabilities and compliance risks.

### VI. Documentation & File Standards

**Specs**: Maintain the hierarchy in `.specify/config.yaml`:
- `specs/features/`: Functional requirements
- `specs/api/`: Endpoint definitions
- `specs/database/`: SQLModel schemas

**Code Comments**: Do not over-comment. Code SHOULD be self-documenting. Use Docstrings for Python API endpoints.

**Rationale**: Organized specifications enable discoverability and prevent duplication. Self-documenting code reduces maintenance burden; docstrings at API boundaries provide external contract documentation. Over-commenting creates noise and maintenance debt when code changes.

### VII. Error Handling Strategy

**Frontend**: Use Error Boundaries for UI crashes. Toast notifications for API errors.

**Backend**: Return standard HTTP status codes:
- 401 for Authentication errors
- 404 for Not Found
- 422 for Validation errors
- NEVER return 500 for expected logic errors

**Rationale**: Consistent error handling improves user experience and debuggability. Standard HTTP status codes enable client-side error handling logic. Avoiding 500 for expected errors distinguishes true server failures from business logic violations, improving observability.

## Technology Stack Constraints

See Principle III for detailed stack requirements. All code MUST adhere to these constraints:

- **Language Versions**: TypeScript (latest stable), Python 3.11+
- **Framework Versions**: Next.js 16+, FastAPI (latest stable)
- **Database**: Neon Serverless PostgreSQL only (no local PostgreSQL)
- **Authentication**: Better Auth (no custom auth implementations)
- **Styling**: Tailwind CSS (no CSS-in-JS or other CSS frameworks)
- **ORM**: SQLModel only (no raw SQL except for complex queries documented in specs)

**Justification Process**: Any deviation from these constraints MUST be documented in an ADR (Architecture Decision Record) with:
- The specific constraint being violated
- Why the constraint is insufficient for the current need
- What simpler alternatives were considered and rejected
- Migration path if the deviation proves unnecessary

## Agentic Dev Stack Workflow

See Principle IV. This workflow is NON-NEGOTIABLE for all feature work.

**Inputs**:
- Feature request from user
- Existing specs in `specs/features/`

**Outputs**:
- Updated or new spec in `specs/features/[feature-name]/spec.md`
- Implementation plan in `specs/features/[feature-name]/plan.md`
- Task breakdown in `specs/features/[feature-name]/tasks.md`
- Implemented code in `/frontend` and/or `/backend`
- Test results (provided by user after running commands)

**Verification Gates**:
- [ ] Spec exists and is referenced
- [ ] Plan covers Frontend, Backend, and DB changes (if applicable)
- [ ] Tasks are atomic (each task touches < 3 files)
- [ ] Each task has a verification command
- [ ] User has confirmed test results

## Authentication Protocol

See Principle V. This protocol is STRICT and MUST be followed for all authenticated endpoints.

**Implementation Checklist**:
- [ ] Frontend login page uses Better Auth SDK
- [ ] Better Auth configuration includes `BETTER_AUTH_SECRET` in `.env`
- [ ] Backend middleware verifies JWT signature using same `BETTER_AUTH_SECRET`
- [ ] Backend extracts `user_id` from verified token
- [ ] All database queries include `where(user_id == current_user)` or equivalent
- [ ] No endpoints bypass authentication (except public landing pages)
- [ ] No endpoints return data from other users

**Security Audit**: Any PR touching authentication MUST be reviewed against this checklist before merge.

## Documentation & File Standards

See Principle VI.

**Spec Hierarchy** (maintained in `.specify/config.yaml`):
```
specs/
├── features/
│   └── [feature-name]/
│       ├── spec.md       # Requirements
│       ├── plan.md       # Architecture
│       └── tasks.md      # Implementation tasks
├── api/
│   └── [endpoint-group].md  # API contracts
└── database/
    └── [model-name].md      # Schema definitions
```

**Code Documentation Standards**:
- **Python**: Docstrings for all public API endpoints (FastAPI routes). Include: purpose, parameters, return type, error conditions.
- **TypeScript**: JSDoc for exported functions and components. Include: purpose, props/parameters, return type.
- **Inline Comments**: Use sparingly. Prefer refactoring unclear code over commenting. Use comments only for non-obvious business logic or algorithmic decisions.

## Error Handling Strategy

See Principle VII.

**Frontend Error Handling**:
- React Error Boundaries for component crashes
- Toast notifications (via Sonner or similar) for API errors
- Loading states for async operations
- Graceful degradation for non-critical features

**Backend Error Handling**:
- 401 Unauthorized: Missing or invalid JWT token
- 404 Not Found: Resource does not exist or user does not have access
- 422 Unprocessable Entity: Validation errors (use Pydantic validation)
- 500 Internal Server Error: Unexpected server failures ONLY (log stack trace)

**Error Response Format** (Backend):
```json
{
  "detail": "Human-readable error message",
  "field_errors": {  // Only for 422 validation errors
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

## Governance

This constitution supersedes all other development practices, coding standards, and architectural decisions. All PRs, code reviews, and architectural decisions MUST verify compliance with these principles.

**Amendment Process**:
1. Amendments require documentation in an ADR
2. ADR must include: rationale, alternatives considered, migration plan
3. Constitution version must be incremented following semantic versioning
4. All dependent templates and documentation must be updated
5. Team/stakeholder approval required (for multi-person projects)

**Versioning Policy**:
- **MAJOR**: Backward incompatible governance changes (principle removals, redefinitions)
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review**:
- Constitution compliance is a gate for all PR approvals
- Violations must be justified via Complexity Tracking table in `plan.md`
- Unjustified violations block merge

**Runtime Development Guidance**: For agent-specific execution details, see `CLAUDE.md` in the repository root.

**Version**: 1.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2025-12-31
