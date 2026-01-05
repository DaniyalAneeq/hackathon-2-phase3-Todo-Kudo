# Spec to Requirements Converter

Transforms feature and API specifications into structured, implementation-ready requirements mapped to specialized development agents.

## Purpose

This skill converts high-level specifications into detailed, actionable development requirements that can be delegated to specialized agents (Frontend, Backend, Database, Auth, QA). It ensures specifications are broken down into concrete tasks with clear acceptance criteria, dependencies, and agent assignments.

## Core Capabilities

- **Specification Analysis**: Parse feature specs, API specs, and UI specs to extract requirements
- **Agent Mapping**: Assign requirements to appropriate agents (Frontend_Dev_Agent, Backend_Dev_Agent, Database_Dev_Agent, Auth_Integration_Agent, QA_Spec_Validator)
- **Dependency Detection**: Identify cross-layer dependencies and execution order
- **Acceptance Criteria Generation**: Create testable acceptance criteria for each requirement
- **Task Breakdown**: Decompose complex features into atomic, implementable tasks

## When to Use This Skill

Use this skill when:
- A new feature specification is added to `/specs/features/`
- An API specification is created or updated in `/specs/api/`
- Breaking down a large feature into implementation tasks
- Preparing requirements for multi-agent delegation
- Converting user stories into technical requirements
- Planning incremental implementation across the stack

Do NOT use this skill for:
- Reading or exploring existing code
- Debugging or troubleshooting
- Direct implementation (use specialized agents instead)
- Generating specs from scratch (use `/sp.specify` instead)

## Execution Workflow

### Phase 1: Specification Discovery
1. Identify the specification file(s) to process
   - Feature specs: `@specs/features/<feature-name>/spec.md`
   - API specs: `@specs/api/<endpoint-name>.md`
   - UI specs: `@specs/ui/<component-name>.md`
   - Database specs: `@specs/database/<schema-name>.md`

2. Read the specification using the Read tool
   - Capture user stories, functional requirements, and constraints
   - Note any existing architecture decisions or patterns
   - Identify referenced dependencies or related specs

### Phase 2: Requirement Extraction

For each specification, extract:

1. **User Stories**: What users need to accomplish
2. **Functional Requirements**: Specific capabilities the system must provide
3. **Non-Functional Requirements**: Performance, security, accessibility needs
4. **API Contracts**: Request/response formats, endpoints, methods
5. **Data Models**: Entities, relationships, constraints
6. **UI Components**: Pages, forms, interactions, layouts
7. **Authentication Requirements**: Protected routes, permissions, user context
8. **Validation Rules**: Input validation, business rules, error handling

### Phase 3: Agent Assignment

Map requirements to specialized agents:

**Frontend_Dev_Agent**:
- UI components and pages
- Client-side routing
- Form handling and validation
- State management
- API integration (client-side)
- Authentication flows (UI)

**Backend_Dev_Agent**:
- API endpoints (FastAPI)
- Business logic
- Request/response handling
- Server-side validation
- Authentication middleware
- Error handling

**Database_Dev_Agent**:
- Schema design (SQLModel/Alembic)
- Database migrations
- Query optimization
- Indexes and constraints
- Data relationships

**Auth_Integration_Agent**:
- Better Auth configuration
- JWT token management
- Protected route setup
- User session handling
- Role-based access control

**QA_Spec_Validator**:
- Test scenarios from acceptance criteria
- End-to-end test flows
- Integration test cases
- Spec compliance validation

### Phase 4: Dependency Analysis

1. Identify cross-layer dependencies:
   - Database schema must exist before backend endpoints
   - Backend endpoints must exist before frontend integration
   - Auth setup required before protected routes

2. Create dependency graph:
   ```
   Database Schema → Backend API → Frontend Integration
                  → Auth Setup ↗
   ```

3. Determine execution order:
   - Level 0: Database models and migrations
   - Level 1: Authentication setup, Backend API endpoints
   - Level 2: Frontend components and pages
   - Level 3: Integration and QA validation

### Phase 5: Requirements Documentation

Generate structured requirements document with:

1. **Overview**: Feature summary and goals
2. **Agent Requirements**: Detailed tasks per agent
3. **Acceptance Criteria**: Testable conditions for completion
4. **Dependencies**: Execution order and prerequisites
5. **Edge Cases**: Error scenarios and boundary conditions
6. **Testing Strategy**: Unit, integration, and E2E test requirements

## Templates

### Requirements Document Template

```markdown
# Requirements: [Feature Name]

## Overview
**Source Spec**: `@specs/features/[feature-name]/spec.md`
**Feature Summary**: [1-2 sentence description]
**Affected Layers**: [Frontend | Backend | Database | Auth]

## User Stories
1. As a [user type], I want [capability] so that [benefit]
2. ...

## Functional Requirements

### FR-001: [Requirement Title]
- **Description**: [Detailed description]
- **Assigned To**: [Agent Name]
- **Priority**: [High | Medium | Low]
- **Dependencies**: [List of prerequisite requirements]

## Agent Requirements

### Frontend Requirements
**Agent**: Frontend_Dev_Agent
**MCP Tools**: Next.js MCP, ShadcnUI MCP

#### Tasks
1. **Create [Component/Page Name]**
   - Location: `Frontend/app/[path]/page.tsx` or `Frontend/components/[name].tsx`
   - Description: [What to build]
   - Acceptance Criteria:
     - [ ] [Criterion 1]
     - [ ] [Criterion 2]
   - Dependencies: [Backend API endpoints needed]

2. ...

### Backend Requirements
**Agent**: Backend_Dev_Agent
**MCP Tools**: FastAPI, SQLModel

#### Tasks
1. **Implement [Endpoint Name]**
   - Endpoint: `POST /api/[resource]`
   - Location: `Backend/app/routes/[resource].py`
   - Description: [What to build]
   - Request Schema: [Schema details]
   - Response Schema: [Schema details]
   - Acceptance Criteria:
     - [ ] [Criterion 1]
     - [ ] [Criterion 2]
   - Dependencies: [Database models needed]

2. ...

### Database Requirements
**Agent**: Database_Dev_Agent
**MCP Tools**: Neon PostgreSQL MCP

#### Tasks
1. **Create [Model Name] Schema**
   - Location: `Backend/app/models/[model].py`
   - Description: [Model purpose]
   - Fields:
     - `field_name`: [type] - [description]
   - Relationships: [Related models]
   - Constraints: [Unique, indexes, etc.]
   - Acceptance Criteria:
     - [ ] [Criterion 1]
     - [ ] [Criterion 2]

2. **Generate Migration**
   - Command: `alembic revision --autogenerate -m "[migration name]"`
   - Verify: Schema matches specification
   - Dependencies: Model definitions complete

### Authentication Requirements
**Agent**: Auth_Integration_Agent
**MCP Tools**: Better Auth MCP

#### Tasks
1. **Secure [Endpoint/Route Name]**
   - Description: [Auth requirement]
   - Implementation:
     - [ ] Add JWT verification middleware
     - [ ] Implement user-scoped queries
     - [ ] Handle auth errors
   - Acceptance Criteria:
     - [ ] Unauthenticated requests return 401
     - [ ] Invalid tokens return 403
     - [ ] Users can only access their own data

### QA Requirements
**Agent**: QA_Spec_Validator

#### Test Scenarios
1. **Happy Path: [Scenario Name]**
   - Given: [Initial state]
   - When: [Action]
   - Then: [Expected outcome]

2. **Error Case: [Scenario Name]**
   - Given: [Initial state]
   - When: [Invalid action]
   - Then: [Error handling]

## Dependency Graph

```
[Database Model] → [Backend Endpoint] → [Frontend Component]
                → [Auth Middleware] ↗
```

## Execution Order
1. Database_Dev_Agent: Create schemas and migrations
2. Auth_Integration_Agent: Configure auth for protected routes
3. Backend_Dev_Agent: Implement API endpoints
4. Frontend_Dev_Agent: Build UI components
5. QA_Spec_Validator: Validate implementation against spec

## Edge Cases and Error Handling
1. [Edge case 1]: [How to handle]
2. [Edge case 2]: [How to handle]

## Acceptance Criteria (Overall)
- [ ] All user stories are implemented
- [ ] All functional requirements are met
- [ ] Authentication is properly enforced
- [ ] Error cases are handled gracefully
- [ ] Tests pass and spec is validated
- [ ] No regressions in existing features
```

### Quick Requirements Template (Minimal)

```markdown
# Requirements: [Feature Name]

**Source**: `@specs/features/[name]/spec.md`

## Frontend Tasks (Frontend_Dev_Agent)
1. Create [component] - AC: [criteria]
2. Integrate [API] - AC: [criteria]

## Backend Tasks (Backend_Dev_Agent)
1. POST /api/[resource] - AC: [criteria]
2. GET /api/[resource] - AC: [criteria]

## Database Tasks (Database_Dev_Agent)
1. Create [Model] schema - Fields: [list]
2. Generate migration

## Auth Tasks (Auth_Integration_Agent)
1. Protect [route/endpoint] - AC: JWT required

## QA Tasks (QA_Spec_Validator)
1. Test: [scenario] → [expected outcome]

## Order
Database → Auth → Backend → Frontend → QA
```

## Tool Usage

### Required Tools

**Read**: Load specification files from `@specs/` directories
- Pattern: `Read(@specs/features/[name]/spec.md)`
- Extract: User stories, requirements, constraints

**Glob**: Discover related specs
- Pattern: `Glob(@specs/**/*.md)`
- Purpose: Find dependencies, related features

**Grep**: Search for existing implementations
- Pattern: `Grep("model [ModelName]")`
- Purpose: Check if models/endpoints already exist

### Tool Patterns

**Pattern 1: Spec Analysis**
```
1. Read(@specs/features/[feature]/spec.md)
2. Read(@specs/api/[related-api].md) if referenced
3. Grep for existing implementations to avoid duplication
```

**Pattern 2: Dependency Discovery**
```
1. Glob(@specs/database/*.md) to find data models
2. Glob(@specs/api/*.md) to find API contracts
3. Map dependencies between layers
```

**Pattern 3: Requirements Generation**
```
1. Extract requirements from spec
2. Categorize by agent (Frontend, Backend, Database, Auth, QA)
3. Generate structured markdown output
4. Include acceptance criteria and dependencies
```

## Decision Points

### When spec mentions "user authentication":
- **Assign to Auth_Integration_Agent**: Setup Better Auth, JWT tokens
- **Assign to Backend_Dev_Agent**: Protected endpoints with auth middleware
- **Assign to Frontend_Dev_Agent**: Login/signup UI, protected routes
- **Assign to Database_Dev_Agent**: User model if not exists

### When spec includes "data persistence":
- **First**: Database_Dev_Agent creates schema
- **Then**: Backend_Dev_Agent implements CRUD endpoints
- **Finally**: Frontend_Dev_Agent integrates API

### When spec has "real-time" or "interactive UI":
- **Frontend_Dev_Agent**: Client-side state management, optimistic updates
- **Backend_Dev_Agent**: WebSocket or SSE if needed
- **QA_Spec_Validator**: Test interaction flows

### When spec is ambiguous:
- **Option A**: Ask clarifying questions using AskUserQuestion tool
- **Option B**: Document assumptions in requirements and flag for review

## Acceptance Criteria

Every requirements document must:
- [ ] Reference the source specification file
- [ ] Map all functional requirements to specific agents
- [ ] Include testable acceptance criteria for each task
- [ ] Identify cross-layer dependencies
- [ ] Define execution order
- [ ] Include error cases and edge cases
- [ ] Specify MCP tools to be used by each agent
- [ ] Provide file paths for implementations

## Validation Checklist

Before finalizing requirements, verify:
1. **Completeness**: All spec requirements are captured
2. **Agent Assignment**: Every requirement has a designated agent
3. **Dependencies**: Execution order is clear and correct
4. **Testability**: Acceptance criteria are measurable
5. **Consistency**: Requirements align with project architecture
6. **Clarity**: Tasks are atomic and actionable
7. **Context**: File paths and locations are specified

## Examples

### Example 1: Todo CRUD Feature

**Input Spec**:
```markdown
# Feature: Todo CRUD Operations

## User Stories
- As a user, I want to create a new todo item
- As a user, I want to view all my todos
- As a user, I want to mark todos as complete
- As a user, I want to delete todos

## Requirements
- Todos have: title, description, status, due_date
- Only authenticated users can manage todos
- Users can only see their own todos
```

**Expected Requirements Output**:
```markdown
# Requirements: Todo CRUD Operations

## Database Requirements (Database_Dev_Agent)
1. Create Todo model
   - Fields: id, user_id, title, description, status, due_date, created_at
   - Relationships: belongs_to User
   - Constraints: user_id indexed, status enum

## Backend Requirements (Backend_Dev_Agent)
1. POST /api/todos - Create todo (requires auth)
2. GET /api/todos - List user's todos (requires auth, paginated)
3. PATCH /api/todos/:id - Update todo (requires auth + ownership)
4. DELETE /api/todos/:id - Delete todo (requires auth + ownership)

## Frontend Requirements (Frontend_Dev_Agent)
1. TodoList component - Display todos with status
2. TodoForm component - Create/edit todo
3. Integrate with backend API
4. Handle loading/error states

## Auth Requirements (Auth_Integration_Agent)
1. Protect all /api/todos/* endpoints
2. Verify user ownership on update/delete
3. Inject user_id from JWT token

## QA Requirements (QA_Spec_Validator)
1. Test: Create todo → appears in list
2. Test: Complete todo → status updates
3. Test: User A cannot access User B's todos
4. Test: Unauthenticated request → 401 error

## Order
Database → Auth → Backend → Frontend → QA
```

**Explanation**: The spec was decomposed into clear agent assignments with dependencies respected (database first, then auth setup, then API, then UI).

### Example 2: User Registration

**Input Spec**:
```markdown
# Feature: User Registration

## User Story
As a new user, I want to register an account with email and password

## Requirements
- Email must be unique and valid format
- Password must be at least 8 characters
- Send welcome email after registration
- Auto-login after successful registration
```

**Expected Requirements Output**:
```markdown
# Requirements: User Registration

## Database Requirements (Database_Dev_Agent)
1. Verify User model exists with email, hashed_password fields
2. Add unique constraint on email

## Auth Requirements (Auth_Integration_Agent)
1. Configure Better Auth registration endpoint
2. Setup JWT token generation
3. Implement password hashing

## Backend Requirements (Backend_Dev_Agent)
1. POST /api/auth/register
   - Validate email format and uniqueness
   - Validate password strength
   - Hash password
   - Create user record
   - Send welcome email (async)
   - Return JWT token

## Frontend Requirements (Frontend_Dev_Agent)
1. Create /register page
2. Registration form with email, password, confirm password
3. Client-side validation
4. Handle success → redirect to dashboard
5. Handle errors → show inline messages

## QA Requirements
1. Test: Valid registration → user created + JWT returned
2. Test: Duplicate email → 400 error
3. Test: Weak password → validation error
4. Test: Auto-login works after registration
```

## Advanced Patterns

### Multi-Spec Analysis

When a feature references multiple specs:

```markdown
## Specification Sources
- Feature Spec: `@specs/features/todo-filtering/spec.md`
- API Spec: `@specs/api/todos.md`
- UI Spec: `@specs/ui/todo-list.md`

## Cross-Spec Requirements
[Synthesized requirements from all sources]
```

### Incremental Implementation

For large features, break into phases:

```markdown
## Phase 1: Core CRUD (MVP)
- Database schema
- Basic API endpoints
- Simple UI

## Phase 2: Advanced Features
- Filtering and sorting
- Bulk operations
- UI enhancements

## Phase 3: Polish
- Performance optimization
- Accessibility improvements
- Edge case handling
```

### Context-Aware Requirements

Detect project patterns and adapt:

```markdown
## Context Detection
- Framework: Next.js 16+ (App Router detected)
- Database: PostgreSQL with SQLModel ORM
- Auth: Better Auth with JWT
- UI Library: ShadcnUI components

## Pattern Alignment
Requirements follow project conventions:
- API routes: `/Backend/app/routes/`
- Frontend pages: `/Frontend/app/[feature]/page.tsx`
- Models: `/Backend/app/models/`
```

## Integration with Project Workflow

This skill integrates with the Spec-Driven Development workflow:

1. **User creates spec** → `/sp.specify`
2. **Spec to Requirements** → Use this skill
3. **Requirements to Tasks** → `/sp.tasks`
4. **Implementation** → Delegate to specialized agents
5. **Validation** → QA_Spec_Validator
6. **Documentation** → Create PHR with `/sp.phr`

## Skill Composition

**Works well with**:
- `/sp.specify`: Creates specs that this skill consumes
- `/sp.plan`: Architectural planning before requirements extraction
- `/sp.tasks`: Converts requirements into tasks.md format
- `/sp.clarify`: Resolves ambiguities in specs before requirement generation

**Workflow Integration**:
1. Run `/sp.specify` to create feature spec
2. Use this skill to generate requirements
3. Run `/sp.tasks` to create tasks.md
4. Delegate to agents for implementation

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Support for Frontend, Backend, Database, Auth, and QA agents
- Template for comprehensive and minimal requirements
- Dependency detection and execution ordering
- Integration with Todo App MCP servers
