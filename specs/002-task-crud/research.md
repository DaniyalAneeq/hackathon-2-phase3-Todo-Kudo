# Research: Task CRUD Operations

**Feature**: Basic Task CRUD Operations
**Phase**: 0 - Outline & Research
**Date**: 2026-01-01

## Research Questions

### 1. Database Schema Design for Task Model

**Question**: What is the optimal SQLModel schema for the Task entity with Neon PostgreSQL?

**Decision**: Use SQLModel with PostgreSQL-specific features for optimal performance:
- Primary key: Auto-incrementing integer `id`
- Indexed `user_id` for efficient user-scoped queries
- Timestamp with timezone for `created_at`
- `VARCHAR(255)` for title, `TEXT` for description

**Rationale**:
- SQLModel provides type-safe ORM with Pydantic validation
- Integer primary keys are faster than UUIDs for small-medium datasets
- Indexed `user_id` enables O(log n) lookups for user-scoped data
- Timezone-aware timestamps ensure correct time display across regions

**Alternatives Considered**:
- UUID primary keys: Rejected due to performance overhead for this scale
- Separate `updated_at` field: Deferred to future phase (not in current requirements)
- JSONB for metadata: Deferred to future phase (no custom fields required)

### 2. FastAPI Router Structure

**Question**: What is the standard REST API pattern for CRUD operations in FastAPI?

**Decision**: Implement resource-based routing with standard HTTP methods:
- `GET /api/tasks` - List all tasks (filtered by user)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get single task (for future use)
- `PATCH /api/tasks/{id}` - Update task (partial update)
- `DELETE /api/tasks/{id}` - Delete task

**Rationale**:
- RESTful patterns are industry-standard and well-understood
- PATCH for partial updates aligns with toggle completion use case
- Resource-based URLs provide clear, predictable API structure
- User filtering handled via hardcoded `demo-user-123` for this phase

**Alternatives Considered**:
- PUT for updates: Rejected (PATCH is more appropriate for partial updates)
- Separate `/api/tasks/{id}/complete` endpoint: Rejected (PATCH is more flexible)
- GraphQL: Out of scope for this phase

### 3. Frontend State Management

**Question**: What is the optimal state management pattern for task CRUD with Next.js 16?

**Decision**: Use TanStack Query (React Query) for server state management:
- `useQuery` for fetching task list
- `useMutation` for create/update/delete operations
- Automatic cache invalidation after mutations
- Optimistic updates for immediate UI feedback

**Rationale**:
- React Query is the industry standard for server state management
- Built-in caching reduces unnecessary API calls
- Optimistic updates meet SC-003 requirement (visual change under 200ms)
- Automatic refetching ensures data consistency

**Alternatives Considered**:
- Redux/Zustand: Rejected (overkill for simple CRUD, server state better handled by React Query)
- Native React state with useEffect: Rejected (reinventing the wheel, no caching)
- Server Components only: Rejected (need client interactivity for mutations)

### 4. Form Validation Strategy

**Question**: What validation approach balances user experience and data integrity?

**Decision**: Dual validation with Zod (frontend) + Pydantic (backend):
- Zod schema in frontend for immediate validation feedback
- Pydantic models in backend for security and data integrity
- Client-side validation prevents unnecessary API calls
- Server-side validation prevents malformed data

**Rationale**:
- Defense in depth: client validation for UX, server validation for security
- Zod integrates seamlessly with React Hook Form
- Pydantic is built into FastAPI and SQLModel
- Shared validation rules (255 chars title, 2000 chars description)

**Alternatives Considered**:
- Frontend-only validation: Rejected (security risk, can be bypassed)
- Backend-only validation: Rejected (poor UX, network round-trip for validation errors)
- Custom validators: Rejected (reinventing the wheel)

### 5. Shadcn UI Component Strategy

**Question**: Which Shadcn UI components are required for the task CRUD interface?

**Decision**: Install and use these Shadcn components:
- `card`: Container for individual tasks
- `checkbox`: Toggle completion status
- `button`: Actions (create, delete, edit)
- `input`: Task title/description input
- `form`: React Hook Form integration
- `toast` (sonner): Success/error notifications
- `skeleton`: Loading states

**Rationale**:
- Pre-built, accessible components reduce development time
- Consistent design system across application
- Built-in accessibility (ARIA attributes, keyboard navigation)
- Customizable with Tailwind CSS

**Alternatives Considered**:
- Custom components: Rejected (time-consuming, accessibility challenges)
- Headless UI: Rejected (Shadcn provides better defaults)
- Material UI: Rejected (conflicts with Tailwind CSS, heavier bundle)

### 6. Hardcoded User ID Strategy

**Question**: How should the frontend handle the temporary hardcoded `demo-user-123`?

**Decision**: Create a constants file with environment-aware user ID:
- `frontend/src/lib/constants.ts` exports `DEMO_USER_ID`
- All API calls include user_id in request context (not URL)
- Backend validates and filters by user_id
- Easy to replace with real auth in future phase

**Rationale**:
- Centralized constant ensures consistency
- Environment variable allows different values for dev/prod
- Backend filtering prevents data leakage
- Minimal changes needed when switching to real auth

**Alternatives Considered**:
- URL parameter: Rejected (security risk, easy to tamper)
- Local storage: Rejected (unnecessary complexity for hardcoded value)
- Omit user_id: Rejected (backend needs filtering logic)

### 7. Database Migration Strategy

**Question**: How should database schema changes be managed with Neon?

**Decision**: Use Alembic for database migrations:
- Create initial migration for tasks table
- Version control migration files
- Alembic auto-generates migrations from SQLModel changes
- Neon MCP validates migrations before applying

**Rationale**:
- Alembic is the standard for SQLAlchemy/SQLModel migrations
- Version-controlled migrations enable rollback and auditing
- Auto-generation from models reduces manual SQL writing
- Neon MCP provides migration validation and safety checks

**Alternatives Considered**:
- Manual SQL scripts: Rejected (error-prone, no version control)
- SQLModel's `create_all()`: Rejected (no migration history, can't rollback)
- Database-first approach: Rejected (ORM-first is more maintainable)

## Technology Stack Summary

### Backend Stack
- **Framework**: FastAPI (async ASGI)
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Validation**: Pydantic V2
- **Migrations**: Alembic
- **Testing**: pytest, httpx (async client)

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **UI Components**: Shadcn UI + Tailwind CSS
- **Notifications**: Sonner (toast)
- **Testing**: Vitest, Testing Library

### Integration
- **API Client**: Fetch API with TanStack Query
- **Error Handling**: HTTP status codes + toast notifications
- **User Context**: Hardcoded `demo-user-123` constant

## Open Questions for Implementation

1. **Pagination**: Current spec assumes <100 tasks. Should we add pagination now or defer?
   - **Recommendation**: Defer. SC-007 states UI must be responsive with up to 100 tasks. Add pagination in future phase if needed.

2. **Task Ordering**: Spec assumes "newest first". Should this be configurable?
   - **Recommendation**: Hardcode DESC order by `created_at`. Add sorting in future phase.

3. **Empty Title Validation**: Should we prevent submission or show inline error?
   - **Recommendation**: Disable submit button when title is empty (better UX than error message).

4. **Network Error Retry**: Should failed mutations auto-retry?
   - **Recommendation**: Show error toast with manual retry button. Auto-retry can confuse users.

5. **Optimistic Updates**: Should we optimistically update the UI before server confirms?
   - **Recommendation**: Yes for completion toggle (instant feedback per SC-003). No for create/delete (wait for server confirmation to avoid rollback confusion).

## Research Completion

All technical uncertainties have been resolved. Ready to proceed to Phase 1 (Design & Contracts).

**Dependencies Validated**:
- ✅ Neon Serverless PostgreSQL available
- ✅ Next.js 16 supports required features
- ✅ FastAPI async patterns documented
- ✅ Shadcn UI components available
- ✅ TanStack Query v5 compatible with Next.js 16

**Best Practices Confirmed**:
- ✅ RESTful API design patterns
- ✅ SQLModel schema design
- ✅ React Query mutation patterns
- ✅ Form validation strategies
- ✅ Error handling approaches
