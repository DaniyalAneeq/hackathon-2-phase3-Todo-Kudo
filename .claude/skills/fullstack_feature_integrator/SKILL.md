# Full-Stack Feature Integrator

Orchestrates multi-agent coordination to deliver complete, tested features across frontend, backend, database, and authentication layers.

## Purpose

This skill acts as the master orchestrator for feature implementation, coordinating specialized agents (Database, Backend, Auth, Frontend, QA, Refactor) to deliver fully integrated, spec-compliant features. It ensures proper sequencing, validates cross-layer integration, runs comprehensive QA, and reports integration status with actionable fixes.

## Core Capabilities

- **Multi-Agent Coordination**: Delegate tasks to specialized agents in correct order
- **Feature Specification Analysis**: Parse specs and create layer-specific requirements
- **Implementation Tracking**: Monitor progress across all layers
- **Integration Validation**: Verify frontend-backend-database communication
- **End-to-End Testing**: Coordinate QA across all layers
- **Spec Compliance**: Ensure implementation matches specification
- **Issue Detection**: Identify integration problems early
- **Status Reporting**: Generate comprehensive integration reports
- **Rollback Management**: Handle failed integrations gracefully

## When to Use This Skill

Use this skill when:
- Implementing new features that span multiple layers
- Coordinating work across Database, Backend, Auth, Frontend, QA agents
- Ensuring feature is complete and tested end-to-end
- Delivering production-ready features
- Integrating separately developed components
- Validating cross-layer communication
- Running comprehensive feature acceptance tests

Do NOT use this skill for:
- Single-layer changes (use specialized agent directly)
- Bug fixes (unless multi-layer)
- Exploratory coding
- Prototyping
- Refactoring existing code (use refactor_code skill)

## Execution Workflow

### Step 1: Feature Specification Analysis

**Read Feature Specification**:
- Location: `@specs/features/<feature-name>/spec.md`
- Extract:
  - User stories and acceptance criteria
  - Data model requirements
  - API endpoints needed
  - UI components required
  - Authentication requirements
  - Performance requirements

**Parse Specification**:
```python
feature_requirements = {
    "name": "Todo Management",
    "database": {
        "models": ["Todo", "Tag", "TodoTag"],
        "relationships": ["User has many Todos", "Todos have many Tags"],
        "migrations": True
    },
    "backend": {
        "endpoints": [
            "POST /api/todos",
            "GET /api/todos",
            "GET /api/todos/{id}",
            "PATCH /api/todos/{id}",
            "DELETE /api/todos/{id}"
        ],
        "authentication": "JWT required for all endpoints",
        "validation": "Title required, max 255 chars"
    },
    "frontend": {
        "pages": ["/dashboard/todos"],
        "components": ["TodoList", "TodoCard", "TodoForm"],
        "api_integration": True
    },
    "acceptance_criteria": [
        "Users can create todos",
        "Users only see their own todos",
        "Todos can be marked complete",
        "Validation errors shown inline"
    ]
}
```

### Step 2: Create Integration Plan

**Dependency Graph**:
```
Database Models
    ↓
Authentication Setup (if needed)
    ↓
Backend API Endpoints
    ↓
Frontend Components
    ↓
Integration Testing
    ↓
QA Validation
    ↓
Code Cleanup
```

**Agent Assignment**:
1. **Database_Dev_Agent**: Create models and migrations
2. **Auth_Integration_Agent**: Setup JWT protection (if new)
3. **Backend_Dev_Agent**: Implement API endpoints
4. **Frontend_Dev_Agent**: Build UI components
5. **QA_Spec_Validator**: Test end-to-end
6. **Refactor_CleanCode_Agent**: Clean up and optimize

### Step 3: Layer-by-Layer Implementation

#### Layer 1: Database (Database_Dev_Agent)

**Task**:
- Create SQLModel classes
- Define relationships
- Generate Alembic migrations
- Apply migrations

**Validation**:
```bash
# Check models exist
ls Backend/app/models/*.py

# Check migration
alembic history

# Apply migration
alembic upgrade head

# Verify schema
psql -d database -c "\dt"
```

**Checklist**:
- [ ] Models created with all fields
- [ ] Relationships defined (both sides)
- [ ] Indexes on foreign keys
- [ ] Migration generated and applied
- [ ] Constraints enforced (unique, not null)

#### Layer 2: Authentication (Auth_Integration_Agent)

**Task** (if needed):
- Configure Better Auth
- Setup JWT token generation/verification
- Create `get_current_user` dependency
- Implement login/register endpoints

**Validation**:
```bash
# Test registration
curl -X POST /api/auth/register \
  -d '{"email":"test@example.com","password":"Test123"}'

# Test login
curl -X POST /api/auth/login \
  -d '{"email":"test@example.com","password":"Test123"}'

# Test protected endpoint
curl /api/todos -H "Authorization: Bearer <token>"
```

**Checklist**:
- [ ] JWT tokens generated on login
- [ ] Token verification middleware works
- [ ] Protected endpoints require auth
- [ ] User scoping enforced

#### Layer 3: Backend API (Backend_Dev_Agent)

**Task**:
- Implement API endpoints
- Add request/response schemas
- Include JWT authentication
- Add user scoping
- Implement validation
- Handle errors

**Validation**:
```bash
# Test CRUD operations
pytest Backend/tests/test_todos_api.py -v

# Check coverage
pytest --cov=app
```

**Checklist**:
- [ ] All endpoints implemented
- [ ] Schemas validate input
- [ ] JWT auth on protected routes
- [ ] User scoping on queries
- [ ] Proper error handling (401, 403, 404, 422)
- [ ] Tests pass
- [ ] OpenAPI docs updated

#### Layer 4: Frontend UI (Frontend_Dev_Agent)

**Task**:
- Create pages and components
- Integrate with backend API
- Add form validation
- Handle loading/error states
- Implement responsive design

**Validation**:
```bash
# Run component tests
npm test

# Run E2E tests
npm run test:e2e

# Build check
npm run build
```

**Checklist**:
- [ ] Pages render correctly
- [ ] API integration works
- [ ] Forms validate input
- [ ] Loading states shown
- [ ] Error handling implemented
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility validated

#### Layer 5: Integration Testing (QA_Spec_Validator)

**Task**:
- Run backend API tests
- Run frontend component tests
- Run E2E tests
- Validate spec compliance
- Generate test report

**Validation**:
```bash
# Backend tests
cd Backend && pytest tests/ -v --cov=app

# Frontend tests
cd Frontend && npm test -- --coverage

# E2E tests
cd Frontend && npm run test:e2e

# Generate report
python tests/generate_report.py
```

**Checklist**:
- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] E2E workflows complete
- [ ] Code coverage >= 80%
- [ ] No spec violations
- [ ] Performance acceptable

#### Layer 6: Code Cleanup (Refactor_CleanCode_Agent)

**Task**:
- Remove duplication
- Improve naming
- Add missing types
- Optimize queries
- Clean up imports

**Checklist**:
- [ ] No duplicated code
- [ ] Consistent naming
- [ ] Type hints complete
- [ ] Linter passes
- [ ] No unused imports

### Step 4: Cross-Layer Integration Validation

**Verify End-to-End Flow**:

1. **User Registration/Login**:
   - Frontend form → Backend API → Database
   - JWT token returned → Stored in frontend
   - ✅ Validate: User can log in and receive token

2. **Create Todo**:
   - Frontend form → Backend API (with JWT) → Database
   - User ID from token → Todo created with user_id
   - ✅ Validate: Todo appears in database with correct user_id

3. **List Todos**:
   - Frontend page → Backend API (with JWT) → Database query
   - Filter by user_id → Return todos
   - ✅ Validate: Only current user's todos shown

4. **Update Todo**:
   - Frontend action → Backend API → Ownership check → Database update
   - ✅ Validate: Cannot update other user's todos

5. **Delete Todo**:
   - Frontend action → Backend API → Ownership check → Database delete
   - ✅ Validate: Todo removed from database

**Integration Tests**:
```typescript
// E2E test for full workflow
test('complete todo workflow', async ({ page }) => {
  // 1. Login
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'Test123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')

  // 2. Create todo
  await page.goto('/dashboard/todos')
  await page.click('text=Add New')
  await page.fill('input[id="title"]', 'Integration Test Todo')
  await page.click('button[type="submit"]')

  // 3. Verify appears in list
  await expect(page.locator('text=Integration Test Todo')).toBeVisible()

  // 4. Mark complete
  await page.click('button:has-text("Complete")')
  await expect(page.locator('.bg-green-100:has-text("Completed")')).toBeVisible()

  // 5. Delete
  await page.click('[aria-label*="Delete"]')
  await page.click('text=OK')
  await expect(page.locator('text=Integration Test Todo')).not.toBeVisible()
})
```

### Step 5: Generate Integration Report

**Report Structure**:
```markdown
# Feature Integration Report: Todo Management

**Date**: 2025-01-15
**Status**: ✅ Integrated Successfully

## Summary
- **Feature**: Todo CRUD operations
- **Spec**: @specs/features/todo-management/spec.md
- **Agents Used**: Database, Backend, Auth, Frontend, QA
- **Integration Time**: 2 hours

## Layer Status

### Database Layer ✅
- Models created: Todo, Tag, TodoTag
- Migrations applied: `001_create_todos_table.py`
- Relationships verified: User → Todos (one-to-many)

### Authentication Layer ✅
- JWT protection added to all todo endpoints
- User scoping implemented
- Ownership verification working

### Backend Layer ✅
- Endpoints implemented: 5/5
  - POST /api/todos ✅
  - GET /api/todos ✅
  - GET /api/todos/{id} ✅
  - PATCH /api/todos/{id} ✅
  - DELETE /api/todos/{id} ✅
- Tests passed: 15/15
- Coverage: 92%

### Frontend Layer ✅
- Pages created: /dashboard/todos
- Components: TodoList, TodoCard, TodoForm
- API integration: Working
- Responsive: Mobile, Tablet, Desktop tested

## Integration Validation

### End-to-End Tests ✅
- User can register/login: ✅
- User can create todos: ✅
- User only sees own todos: ✅
- User can update todos: ✅
- User can delete todos: ✅
- User cannot access others' todos: ✅

### Spec Compliance ✅
- All acceptance criteria met: 8/8
- No spec violations

### Performance ✅
- API response time: < 100ms
- Page load time: < 1s
- Bundle size: +15KB (acceptable)

## Issues Found

None

## Next Steps

1. ✅ Deploy to staging
2. ⏳ User acceptance testing
3. ⏳ Deploy to production

## Artifacts

- Database migration: `Backend/alembic/versions/001_create_todos_table.py`
- API routes: `Backend/app/routes/todos.py`
- Frontend page: `Frontend/app/dashboard/todos/page.tsx`
- Test report: `Backend/tests/reports/todo_integration_report.json`
```

## Integration Patterns

### Pattern 1: CRUD Feature Integration

**Spec**: Todo Management
**Layers**: Database + Backend + Frontend + Auth

**Steps**:
1. Database_Dev_Agent creates Todo model
2. Auth_Integration_Agent protects endpoints
3. Backend_Dev_Agent implements CRUD API
4. Frontend_Dev_Agent builds UI
5. QA_Spec_Validator tests end-to-end

**Validation**:
- Database has Todo table with correct schema
- API endpoints require JWT and enforce user scoping
- Frontend can create, read, update, delete todos
- E2E tests pass

### Pattern 2: Authentication Feature Integration

**Spec**: User Authentication
**Layers**: Database + Auth + Backend + Frontend

**Steps**:
1. Database_Dev_Agent creates User model
2. Auth_Integration_Agent implements JWT flows
3. Backend_Dev_Agent creates login/register endpoints
4. Frontend_Dev_Agent builds login/signup pages
5. QA_Spec_Validator tests auth flows

**Validation**:
- Users can register with validation
- Users can log in and receive JWT
- Protected routes redirect to login
- Invalid tokens return 401

### Pattern 3: Multi-Resource Feature Integration

**Spec**: Todo Tags (Many-to-Many)
**Layers**: Database + Backend + Frontend

**Steps**:
1. Database_Dev_Agent creates Tag and TodoTag models
2. Backend_Dev_Agent implements tag endpoints
3. Frontend_Dev_Agent builds tag UI
4. QA_Spec_Validator tests tag assignment

**Validation**:
- Many-to-many relationship works
- Can assign/remove tags from todos
- Tags displayed in UI

## Issue Resolution Strategies

### Issue: Frontend Can't Fetch Data

**Symptoms**:
- CORS errors
- 401 Unauthorized
- Empty responses

**Diagnosis**:
```bash
# Check backend is running
curl http://localhost:8000/api/todos

# Check CORS configuration
# Backend/app/main.py should have CORS middleware

# Check JWT token is sent
# Frontend should include Authorization header
```

**Fix**:
1. Ensure backend CORS allows frontend origin
2. Verify JWT token is stored and sent
3. Check API URL is correct (localhost vs production)

### Issue: User Scoping Not Working

**Symptoms**:
- Users see other users' todos
- Can update/delete others' todos

**Diagnosis**:
```python
# Check query in backend
query = select(Todo).where(Todo.user_id == current_user.id)  # Should filter by user
```

**Fix**:
1. Add `user_id` filter to all queries
2. Verify ownership before updates/deletes
3. Add test for user scoping

### Issue: Database Migration Failed

**Symptoms**:
- Alembic error
- Table not found
- Constraint violations

**Diagnosis**:
```bash
# Check migration history
alembic history

# Check current version
alembic current

# Check database schema
psql -d database -c "\d todos"
```

**Fix**:
1. Rollback migration: `alembic downgrade -1`
2. Fix migration file
3. Re-apply: `alembic upgrade head`

### Issue: E2E Tests Failing

**Symptoms**:
- Elements not found
- Timeouts
- Assertion errors

**Diagnosis**:
```bash
# Run with UI to see what's happening
npm run test:e2e -- --ui

# Check test logs
```

**Fix**:
1. Update selectors (class names, IDs, text)
2. Add wait for elements to load
3. Check if backend is running during tests

## Acceptance Criteria

Feature integration is complete when:
- [ ] All database models created and migrations applied
- [ ] All backend endpoints implemented with tests
- [ ] All frontend pages/components created
- [ ] Authentication properly integrated (if required)
- [ ] User scoping enforced on all queries
- [ ] All layer tests pass (database, backend, frontend)
- [ ] E2E tests pass for all workflows
- [ ] Spec compliance verified (all acceptance criteria met)
- [ ] Code coverage >= 80%
- [ ] No security vulnerabilities
- [ ] Performance meets requirements
- [ ] Code reviewed and cleaned up
- [ ] Integration report generated

## Validation Checklist

### Pre-Integration
- [ ] Feature spec is complete and approved
- [ ] All dependencies identified
- [ ] Agent assignment planned
- [ ] Test strategy defined

### Database Layer
- [ ] Models created
- [ ] Migrations generated and applied
- [ ] Relationships work
- [ ] Constraints enforced
- [ ] Seeds/fixtures created (if needed)

### Backend Layer
- [ ] All endpoints implemented
- [ ] Request/response schemas defined
- [ ] Authentication integrated
- [ ] User scoping enforced
- [ ] Validation works
- [ ] Error handling complete
- [ ] Tests pass
- [ ] Coverage >= 80%

### Frontend Layer
- [ ] Pages/components created
- [ ] API integration works
- [ ] Forms validate
- [ ] Loading/error states shown
- [ ] Responsive design
- [ ] Accessibility validated
- [ ] Tests pass

### Integration Layer
- [ ] Cross-layer communication works
- [ ] E2E workflows pass
- [ ] No CORS issues
- [ ] JWT tokens work end-to-end
- [ ] User scoping verified
- [ ] Performance acceptable

### Quality
- [ ] All tests pass
- [ ] No spec violations
- [ ] Code reviewed
- [ ] Linter passes
- [ ] No security issues
- [ ] Documentation updated

## Tool Usage

### Required Tools

**Read**: Load feature specification
- `Read(@specs/features/<feature>/spec.md)` - Feature requirements
- `Read(@specs/api/<endpoint>.md)` - API specifications
- `Read(@specs/ui/<component>.md)` - UI specifications
- `Read(@specs/database/schema.md)` - Database schema

**Task**: Delegate to specialized agents
- `Task(subagent_type='database-dev-agent', ...)` - Database work
- `Task(subagent_type='backend-dev-agent', ...)` - Backend work
- `Task(subagent_type='frontend-dev-agent', ...)` - Frontend work
- `Task(subagent_type='auth-integration-agent', ...)` - Auth work
- `Task(subagent_type='qa-spec-validator', ...)` - QA work

**Bash**: Run tests and validations
- `Bash("cd Backend && pytest tests/ -v")` - Backend tests
- `Bash("cd Frontend && npm test")` - Frontend tests
- `Bash("cd Frontend && npm run test:e2e")` - E2E tests
- `Bash("alembic upgrade head")` - Apply migrations

**Write**: Generate integration report
- `Write(integration_report.md)` - Integration status

### Tool Workflow

**Complete Feature Integration**:
```
1. Read(@specs/features/todo-management/spec.md)
2. Task(subagent_type='database-dev-agent', prompt='Create Todo model')
3. Task(subagent_type='backend-dev-agent', prompt='Implement CRUD endpoints')
4. Task(subagent_type='frontend-dev-agent', prompt='Build todo UI')
5. Task(subagent_type='qa-spec-validator', prompt='Test todo feature')
6. Bash("cd Backend && pytest tests/test_todos_api.py -v")
7. Bash("cd Frontend && npm run test:e2e -- todo-flow.spec.ts")
8. Write(integration_report.md)
```

## Best Practices

### 1. Sequential Layer Implementation

**Correct Order**:
```
Database → Authentication → Backend → Frontend → QA → Cleanup
```

**Why**:
- Backend needs database models
- Frontend needs backend API
- QA needs complete feature
- Each layer builds on previous

### 2. Incremental Integration

**Don't**:
- Implement all layers then integrate
- Wait until end to test

**Do**:
- Integrate and test after each layer
- Verify database before starting backend
- Test backend endpoints before building frontend
- Catch issues early

### 3. Communication Validation

**Verify at Each Step**:
```
Database ↔ Backend:
  - Can backend query database?
  - Do relationships work?

Backend ↔ Frontend:
  - Can frontend call API?
  - Does CORS work?
  - Are tokens sent correctly?

Frontend ↔ User:
  - Does UI match spec?
  - Are errors shown clearly?
```

### 4. Rollback Strategy

**If Integration Fails**:
1. Identify failing layer
2. Rollback changes to that layer
3. Fix issue
4. Re-integrate
5. Re-test

**Git Strategy**:
```bash
# Commit after each layer
git commit -m "feat: database layer - todo model"
git commit -m "feat: backend layer - todo API"
git commit -m "feat: frontend layer - todo UI"

# If frontend fails, rollback
git revert HEAD
```

### 5. Parallel Development (Advanced)

**When Safe**:
- Database and Auth can be developed in parallel
- Backend endpoints can be implemented in parallel (different resources)
- Frontend components can be built in parallel

**When Not Safe**:
- Don't build frontend before backend is ready (unless mocking)
- Don't start backend before database models exist

## Agent Coordination Templates

### Template 1: Simple CRUD Feature

```yaml
feature: Todo Management
agents:
  - Database_Dev_Agent:
      task: Create Todo model
      deliverables:
        - Backend/app/models/todo.py
        - Backend/alembic/versions/001_create_todos.py

  - Backend_Dev_Agent:
      task: Implement CRUD endpoints
      dependencies: [Database_Dev_Agent]
      deliverables:
        - Backend/app/routes/todos.py
        - Backend/app/schemas/todo.py
        - Backend/tests/test_todos_api.py

  - Frontend_Dev_Agent:
      task: Build todo UI
      dependencies: [Backend_Dev_Agent]
      deliverables:
        - Frontend/app/dashboard/todos/page.tsx
        - Frontend/components/TodoCard.tsx
        - Frontend/components/TodoForm.tsx

  - QA_Spec_Validator:
      task: Test end-to-end
      dependencies: [Frontend_Dev_Agent]
      deliverables:
        - Frontend/tests/e2e/todo-flow.spec.ts
        - test_report.md
```

### Template 2: Feature with Auth

```yaml
feature: User Registration
agents:
  - Database_Dev_Agent:
      task: Create User model
      deliverables:
        - Backend/app/models/user.py

  - Auth_Integration_Agent:
      task: Setup JWT authentication
      dependencies: [Database_Dev_Agent]
      deliverables:
        - Backend/app/auth.py
        - Backend/app/routes/auth.py
        - Backend/app/dependencies.py

  - Frontend_Dev_Agent:
      task: Build login/signup UI
      dependencies: [Auth_Integration_Agent]
      deliverables:
        - Frontend/app/login/page.tsx
        - Frontend/app/register/page.tsx
        - Frontend/lib/auth-context.tsx

  - QA_Spec_Validator:
      task: Test authentication flows
      dependencies: [Frontend_Dev_Agent]
      deliverables:
        - Backend/tests/test_auth.py
        - Frontend/tests/e2e/auth-flow.spec.ts
```

## Integration Report Template

```markdown
# Feature Integration Report

**Feature**: {feature_name}
**Date**: {date}
**Status**: {✅ Success | ⚠️ Partial | ❌ Failed}
**Spec**: @specs/features/{feature_name}/spec.md

## Summary
- **Agents Used**: {list of agents}
- **Integration Time**: {time}
- **Test Coverage**: {percentage}%

## Layer Status

### Database Layer {✅|❌}
- Models: {list}
- Migrations: {list}
- Status: {details}

### Backend Layer {✅|❌}
- Endpoints: {count} implemented
- Tests: {passed}/{total}
- Coverage: {percentage}%

### Frontend Layer {✅|❌}
- Pages: {list}
- Components: {list}
- Tests: {passed}/{total}

### Integration Layer {✅|❌}
- E2E Tests: {passed}/{total}
- Spec Compliance: {violations count}

## Issues Found
{list of issues with severity and status}

## Performance
- API Response Time: {ms}
- Page Load Time: {s}
- Bundle Size: {KB}

## Next Steps
{action items}

## Artifacts
{list of created files}
```

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Multi-agent coordination framework
- Layer-by-layer integration workflow
- Cross-layer validation patterns
- Issue resolution strategies
- Integration reporting
- CRUD and Auth integration templates
- Best practices for sequential and parallel development
