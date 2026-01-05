# QA Runner

Automated quality assurance and testing across frontend, backend, database, and authentication layers with spec compliance validation.

## Purpose

This skill executes comprehensive automated tests across the entire application stack, validates implementation against specifications, and generates detailed reports with actionable fixes. It ensures CRUD operations, authentication flows, UI behavior, and database integrity all meet specification requirements before deployment.

## Core Capabilities

- **Frontend Testing**: UI component testing, page rendering, user interactions, responsive design
- **Backend API Testing**: Endpoint testing, request/response validation, error handling
- **Database Testing**: Schema validation, data integrity, migrations, relationships
- **Authentication Testing**: JWT flows, login/signup, protected routes, user scoping
- **Integration Testing**: Full-stack workflows, end-to-end scenarios
- **Spec Compliance Validation**: Compare implementation against specifications
- **Test Reporting**: Structured reports with pass/fail status and fix suggestions
- **Performance Testing**: Response times, query efficiency, bundle sizes

## When to Use This Skill

Use this skill when:
- Feature implementation is complete
- Before creating pull requests
- Before deployment to production
- After database migrations
- When debugging cross-layer issues
- Validating spec compliance
- Running CI/CD pipeline checks
- After refactoring code
- Investigating reported bugs

Do NOT use this skill for:
- Writing implementation code (use specialized dev agents)
- Designing test cases (use spec clarification)
- Performance profiling (requires specialized tools)
- Load testing (requires dedicated infrastructure)

## Execution Workflow

### Step 1: Test Preparation

**Read Specifications**:
- Feature Spec: `@specs/features/<feature>/spec.md`
- API Spec: `@specs/api/<endpoint>.md`
- UI Spec: `@specs/ui/<component>.md`
- Database Spec: `@specs/database/schema.md`

**Identify Test Scope**:
1. Feature name and components
2. API endpoints to test
3. Database models involved
4. Authentication requirements
5. Frontend pages/components
6. Expected behaviors and edge cases

### Step 2: Layer-by-Layer Testing

**Test Execution Order**:
1. **Database Layer** - Schema, migrations, data integrity
2. **Backend Layer** - API endpoints, business logic, auth
3. **Frontend Layer** - UI components, pages, interactions
4. **Integration Layer** - Full-stack workflows, E2E scenarios

### Step 3: Run Tests

**Backend Tests** (pytest):
```bash
cd Backend
pytest tests/ -v --cov=app
```

**Frontend Tests** (Jest/Vitest):
```bash
cd Frontend
npm test
```

**E2E Tests** (Playwright/Cypress):
```bash
cd Frontend
npm run test:e2e
```

### Step 4: Spec Compliance Validation

**For each specification**:
1. Extract acceptance criteria
2. Map to test cases
3. Verify implementation matches spec
4. Report mismatches

### Step 5: Generate Report

**Report Structure**:
- Summary (passed/failed/total)
- Layer-by-layer results
- Failed test details
- Spec compliance issues
- Suggested fixes
- Action items for agents

## Test Templates

### Template 1: Backend API Endpoint Test (pytest)

```python
# Backend/tests/test_todos_api.py

import pytest
from httpx import AsyncClient
from sqlmodel import select
from app.models.todo import Todo
from app.models.user import User

pytestmark = pytest.mark.asyncio


class TestTodosAPI:
    """Test suite for Todos API endpoints"""

    async def test_create_todo_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User
    ):
        """
        Test: POST /api/todos - Create todo successfully
        Spec: @specs/api/todos.md - Create Todo endpoint
        """
        # Arrange
        todo_data = {
            "title": "Test Todo",
            "description": "Test description"
        }

        # Act
        response = await client.post(
            "/api/todos",
            json=todo_data,
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 201, "Should return 201 Created"

        data = response.json()
        assert data["title"] == todo_data["title"], "Title should match"
        assert data["description"] == todo_data["description"], "Description should match"
        assert data["user_id"] == test_user.id, "Should be created for authenticated user"
        assert "id" in data, "Should return todo ID"
        assert "created_at" in data, "Should have created_at timestamp"

    async def test_create_todo_requires_auth(self, client: AsyncClient):
        """
        Test: POST /api/todos - Requires authentication
        Spec: All todo endpoints require JWT authentication
        """
        # Arrange
        todo_data = {"title": "Test Todo"}

        # Act
        response = await client.post("/api/todos", json=todo_data)

        # Assert
        assert response.status_code == 401, "Should return 401 Unauthorized"
        assert "detail" in response.json(), "Should return error detail"

    async def test_create_todo_validation(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """
        Test: POST /api/todos - Validate required fields
        Spec: Title is required, max 255 characters
        """
        # Test 1: Missing title
        response = await client.post(
            "/api/todos",
            json={"description": "No title"},
            headers=auth_headers
        )
        assert response.status_code == 422, "Should return 422 for missing title"

        # Test 2: Title too long
        response = await client.post(
            "/api/todos",
            json={"title": "x" * 256},
            headers=auth_headers
        )
        assert response.status_code == 422, "Should return 422 for long title"

    async def test_list_todos_user_scoped(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
        session
    ):
        """
        Test: GET /api/todos - Returns only current user's todos
        Spec: User scoping - users only see their own todos
        """
        # Arrange: Create todos for test user
        todo1 = Todo(title="User Todo 1", user_id=test_user.id)
        todo2 = Todo(title="User Todo 2", user_id=test_user.id)
        session.add_all([todo1, todo2])
        await session.commit()

        # Create todo for different user
        other_user = User(email="other@example.com", hashed_password="hash")
        session.add(other_user)
        await session.commit()

        other_todo = Todo(title="Other User Todo", user_id=other_user.id)
        session.add(other_todo)
        await session.commit()

        # Act
        response = await client.get("/api/todos", headers=auth_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2, "Should return only current user's todos"
        assert all(t["user_id"] == test_user.id for t in data), "All todos should belong to user"

    async def test_update_todo_ownership(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
        session
    ):
        """
        Test: PATCH /api/todos/{id} - Cannot update other user's todo
        Spec: Ownership verification - users can only update their own todos
        """
        # Arrange: Create todo for different user
        other_user = User(email="other@example.com", hashed_password="hash")
        session.add(other_user)
        await session.commit()

        other_todo = Todo(title="Other Todo", user_id=other_user.id)
        session.add(other_todo)
        await session.commit()

        # Act: Try to update other user's todo
        response = await client.patch(
            f"/api/todos/{other_todo.id}",
            json={"title": "Hacked!"},
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 404, "Should return 404 for access denied"

    async def test_delete_todo_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_user: User,
        session
    ):
        """
        Test: DELETE /api/todos/{id} - Delete todo successfully
        Spec: Delete endpoint returns 204 No Content
        """
        # Arrange
        todo = Todo(title="To Delete", user_id=test_user.id)
        session.add(todo)
        await session.commit()
        todo_id = todo.id

        # Act
        response = await client.delete(
            f"/api/todos/{todo_id}",
            headers=auth_headers
        )

        # Assert
        assert response.status_code == 204, "Should return 204 No Content"

        # Verify deletion
        result = await session.execute(select(Todo).where(Todo.id == todo_id))
        deleted_todo = result.scalar_one_or_none()
        assert deleted_todo is None, "Todo should be deleted from database"
```

### Template 2: Authentication Flow Test

```python
# Backend/tests/test_auth.py

import pytest
from httpx import AsyncClient
from app.models.user import User

pytestmark = pytest.mark.asyncio


class TestAuthentication:
    """Test suite for authentication flows"""

    async def test_register_success(self, client: AsyncClient, session):
        """
        Test: POST /api/auth/register - Register new user
        Spec: @specs/features/authentication.md - Registration flow
        """
        # Arrange
        user_data = {
            "email": "newuser@example.com",
            "password": "SecurePass123",
            "name": "New User"
        }

        # Act
        response = await client.post("/api/auth/register", json=user_data)

        # Assert
        assert response.status_code == 201, "Should return 201 Created"

        data = response.json()
        assert "access_token" in data, "Should return access token"
        assert "refresh_token" in data, "Should return refresh token"
        assert data["token_type"] == "bearer", "Should be bearer token"
        assert data["user"]["email"] == user_data["email"], "Should return user info"

        # Verify user in database
        from sqlmodel import select
        result = await session.execute(
            select(User).where(User.email == user_data["email"])
        )
        user = result.scalar_one_or_none()
        assert user is not None, "User should be created in database"
        assert user.hashed_password != user_data["password"], "Password should be hashed"

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: User):
        """
        Test: POST /api/auth/register - Reject duplicate email
        Spec: Email must be unique
        """
        # Arrange
        user_data = {
            "email": test_user.email,  # Duplicate email
            "password": "Password123"
        }

        # Act
        response = await client.post("/api/auth/register", json=user_data)

        # Assert
        assert response.status_code == 400, "Should return 400 Bad Request"
        assert "email already registered" in response.json()["detail"].lower()

    async def test_register_password_validation(self, client: AsyncClient):
        """
        Test: POST /api/auth/register - Validate password strength
        Spec: Password must be 8+ chars with uppercase, lowercase, digit
        """
        test_cases = [
            ("short", 422, "Too short"),
            ("nouppercase123", 422, "No uppercase"),
            ("NOLOWERCASE123", 422, "No lowercase"),
            ("NoDigits", 422, "No digits"),
            ("ValidPass123", 201, "Valid password")
        ]

        for password, expected_status, description in test_cases:
            response = await client.post(
                "/api/auth/register",
                json={
                    "email": f"test_{password}@example.com",
                    "password": password
                }
            )
            assert response.status_code == expected_status, f"Failed: {description}"

    async def test_login_success(self, client: AsyncClient, test_user: User):
        """
        Test: POST /api/auth/login - Login with valid credentials
        Spec: Returns JWT tokens on successful login
        """
        # Arrange
        login_data = {
            "email": test_user.email,
            "password": "testpassword"  # From fixture
        }

        # Act
        response = await client.post("/api/auth/login", json=login_data)

        # Assert
        assert response.status_code == 200, "Should return 200 OK"

        data = response.json()
        assert "access_token" in data, "Should return access token"
        assert "refresh_token" in data, "Should return refresh token"
        assert data["user"]["id"] == test_user.id, "Should return correct user"

    async def test_login_invalid_credentials(self, client: AsyncClient, test_user: User):
        """
        Test: POST /api/auth/login - Reject invalid credentials
        Spec: Return 401 for incorrect password
        """
        # Test wrong password
        response = await client.post(
            "/api/auth/login",
            json={"email": test_user.email, "password": "wrongpassword"}
        )
        assert response.status_code == 401, "Should return 401 for wrong password"

        # Test non-existent email
        response = await client.post(
            "/api/auth/login",
            json={"email": "notexist@example.com", "password": "password"}
        )
        assert response.status_code == 401, "Should return 401 for non-existent email"

    async def test_jwt_token_verification(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """
        Test: JWT token verification on protected endpoints
        Spec: All protected endpoints verify JWT token
        """
        # Test valid token
        response = await client.get("/api/todos", headers=auth_headers)
        assert response.status_code == 200, "Valid token should allow access"

        # Test invalid token
        response = await client.get(
            "/api/todos",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401, "Invalid token should return 401"

        # Test missing token
        response = await client.get("/api/todos")
        assert response.status_code == 401, "Missing token should return 401"

    async def test_token_refresh(
        self,
        client: AsyncClient,
        test_user: User
    ):
        """
        Test: POST /api/auth/refresh - Refresh access token
        Spec: Refresh token generates new access token
        """
        # Arrange: Login to get refresh token
        login_response = await client.post(
            "/api/auth/login",
            json={"email": test_user.email, "password": "testpassword"}
        )
        refresh_token = login_response.json()["refresh_token"]

        # Act
        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )

        # Assert
        assert response.status_code == 200, "Should return 200 OK"
        data = response.json()
        assert "access_token" in data, "Should return new access token"
        assert data["access_token"] != login_response.json()["access_token"], \
            "Should be a new token"
```

### Template 3: Database Schema Test

```python
# Backend/tests/test_database.py

import pytest
from sqlmodel import select
from app.models.user import User
from app.models.todo import Todo

pytestmark = pytest.mark.asyncio


class TestDatabaseSchema:
    """Test suite for database schema and integrity"""

    async def test_user_model_fields(self, session):
        """
        Test: User model has all required fields
        Spec: @specs/database/schema.md - Users table
        """
        # Create user
        user = User(
            email="test@example.com",
            hashed_password="hashed",
            name="Test User"
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Assert required fields
        assert user.id is not None, "Should have auto-generated ID"
        assert user.email == "test@example.com", "Should have email"
        assert user.hashed_password == "hashed", "Should have hashed_password"
        assert user.name == "Test User", "Should have name"
        assert user.is_active is True, "Should default to active"
        assert user.is_superuser is False, "Should default to non-superuser"
        assert user.created_at is not None, "Should have created_at"
        assert user.updated_at is not None, "Should have updated_at"

    async def test_todo_model_relationships(self, session):
        """
        Test: Todo model relationships with User
        Spec: One user has many todos, each todo belongs to one user
        """
        # Create user
        user = User(email="user@example.com", hashed_password="hash")
        session.add(user)
        await session.commit()

        # Create todos
        todo1 = Todo(title="Todo 1", user_id=user.id)
        todo2 = Todo(title="Todo 2", user_id=user.id)
        session.add_all([todo1, todo2])
        await session.commit()

        # Refresh user to load relationships
        await session.refresh(user)

        # Assert relationships
        assert len(user.todos) == 2, "User should have 2 todos"
        assert todo1.user_id == user.id, "Todo should reference user"
        assert todo2.user_id == user.id, "Todo should reference user"

    async def test_email_uniqueness_constraint(self, session):
        """
        Test: Email uniqueness constraint
        Spec: Email must be unique across users
        """
        # Create first user
        user1 = User(email="unique@example.com", hashed_password="hash")
        session.add(user1)
        await session.commit()

        # Try to create second user with same email
        user2 = User(email="unique@example.com", hashed_password="hash2")
        session.add(user2)

        # Assert: Should raise integrity error
        with pytest.raises(Exception):  # IntegrityError
            await session.commit()

    async def test_cascade_delete(self, session):
        """
        Test: Deleting user cascades to todos
        Spec: When user is deleted, their todos should also be deleted
        """
        # Create user with todos
        user = User(email="delete@example.com", hashed_password="hash")
        session.add(user)
        await session.commit()

        todo = Todo(title="Todo", user_id=user.id)
        session.add(todo)
        await session.commit()
        todo_id = todo.id

        # Delete user
        await session.delete(user)
        await session.commit()

        # Assert todos are also deleted
        result = await session.execute(select(Todo).where(Todo.id == todo_id))
        deleted_todo = result.scalar_one_or_none()
        assert deleted_todo is None, "Todo should be deleted when user is deleted"

    async def test_timestamp_auto_update(self, session):
        """
        Test: updated_at timestamp auto-updates on modification
        Spec: updated_at should change when record is modified
        """
        # Create user
        user = User(email="timestamp@example.com", hashed_password="hash")
        session.add(user)
        await session.commit()
        await session.refresh(user)

        original_updated_at = user.updated_at

        # Wait a moment (in real test, might need time.sleep)
        import asyncio
        await asyncio.sleep(0.1)

        # Update user
        user.name = "Updated Name"
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Assert updated_at changed
        assert user.updated_at > original_updated_at, \
            "updated_at should change on modification"
```

### Template 4: Frontend Component Test (Jest/Vitest)

```typescript
// Frontend/tests/components/TodoCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoCard from '@/components/TodoCard'

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test description',
    status: 'pending' as const,
    created_at: '2025-01-15T12:00:00Z',
  }

  it('renders todo information correctly', () => {
    /**
     * Test: TodoCard displays todo title and description
     * Spec: @specs/ui/todo-card.md - Display todo information
     */
    render(<TodoCard todo={mockTodo} />)

    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    /**
     * Test: Status badge shows current status
     * Spec: Display status with appropriate color coding
     */
    render(<TodoCard todo={mockTodo} />)

    const statusBadge = screen.getByText('Pending')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('calls onComplete when complete button clicked', () => {
    /**
     * Test: Complete button triggers callback
     * Spec: User can mark todo as complete
     */
    const handleComplete = vi.fn()

    render(
      <TodoCard
        todo={mockTodo}
        onComplete={handleComplete}
      />
    )

    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    expect(handleComplete).toHaveBeenCalledWith(mockTodo.id)
  })

  it('calls onDelete with confirmation', () => {
    /**
     * Test: Delete button shows confirmation and triggers callback
     * Spec: Confirm before deleting todo
     */
    const handleDelete = vi.fn()
    window.confirm = vi.fn(() => true)

    render(
      <TodoCard
        todo={mockTodo}
        onDelete={handleDelete}
      />
    )

    const deleteButton = screen.getByLabelText(/delete/i)
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(handleDelete).toHaveBeenCalledWith(mockTodo.id)
  })

  it('does not show action buttons when showActions is false', () => {
    /**
     * Test: Actions can be hidden
     * Spec: TodoCard supports read-only mode
     */
    render(
      <TodoCard
        todo={mockTodo}
        showActions={false}
      />
    )

    expect(screen.queryByText('Complete')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument()
  })

  it('handles long titles with line clamping', () => {
    /**
     * Test: Long titles are truncated
     * Spec: Limit title to 2 lines with ellipsis
     */
    const longTodo = {
      ...mockTodo,
      title: 'A'.repeat(200),
    }

    const { container } = render(<TodoCard todo={longTodo} />)

    const titleElement = container.querySelector('.line-clamp-2')
    expect(titleElement).toBeInTheDocument()
  })
})
```

### Template 5: E2E Test (Playwright)

```typescript
// Frontend/tests/e2e/todo-flow.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Todo Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('create, complete, and delete todo', async ({ page }) => {
    /**
     * Test: Full CRUD workflow
     * Spec: @specs/features/todo-management.md - Complete user flow
     */

    // Navigate to todos page
    await page.goto('/dashboard/todos')

    // Create new todo
    await page.click('text=Add New')
    await page.fill('input[id="title"]', 'E2E Test Todo')
    await page.fill('textarea[id="description"]', 'Created by E2E test')
    await page.click('button[type="submit"]')

    // Verify todo appears in list
    await expect(page.locator('text=E2E Test Todo')).toBeVisible()

    // Mark as complete
    await page.click('button:has-text("Complete")')
    await expect(page.locator('.bg-green-100:has-text("Completed")')).toBeVisible()

    // Delete todo
    await page.click('[aria-label*="Delete"]')
    await page.click('text=OK')  // Confirm dialog

    // Verify todo is removed
    await expect(page.locator('text=E2E Test Todo')).not.toBeVisible()
  })

  test('user scoping - cannot see other users todos', async ({ page }) => {
    /**
     * Test: User scoping verification
     * Spec: Users only see their own todos
     */

    await page.goto('/dashboard/todos')

    // Get current user's todos
    const todoCount = await page.locator('[data-testid="todo-card"]').count()

    // Verify all todos belong to current user (check no unauthorized access)
    // This is more of a backend test, but we can verify the count is consistent
    await page.reload()
    const todoCountAfterReload = await page.locator('[data-testid="todo-card"]').count()

    expect(todoCount).toBe(todoCountAfterReload)
  })

  test('authentication required for todo access', async ({ page }) => {
    /**
     * Test: Protected route requires authentication
     * Spec: Cannot access todos without login
     */

    // Logout
    await page.click('text=Logout')

    // Try to access todos directly
    await page.goto('/dashboard/todos')

    // Should redirect to login
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('form validation on todo creation', async ({ page }) => {
    /**
     * Test: Client-side validation
     * Spec: Title is required, max 255 characters
     */

    await page.goto('/dashboard/todos')
    await page.click('text=Add New')

    // Try to submit without title
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=Title is required')).toBeVisible()

    // Try with too-long title
    await page.fill('input[id="title"]', 'x'.repeat(256))
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=less than 255')).toBeVisible()
  })
})
```

### Template 6: Test Report Generator

```python
# Backend/tests/generate_report.py

import json
from datetime import datetime
from typing import List, Dict, Any


class TestReport:
    """Generate structured test report"""

    def __init__(self):
        self.results = {
            "timestamp": datetime.utcnow().isoformat(),
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0,
                "pass_rate": 0.0
            },
            "layers": {
                "database": [],
                "backend": [],
                "frontend": [],
                "integration": []
            },
            "spec_compliance": [],
            "failures": [],
            "suggestions": []
        }

    def add_test_result(
        self,
        layer: str,
        test_name: str,
        status: str,
        spec_reference: str = None,
        error_message: str = None,
        duration: float = None
    ):
        """Add a test result to the report"""
        result = {
            "name": test_name,
            "status": status,
            "spec": spec_reference,
            "duration": duration,
        }

        if error_message:
            result["error"] = error_message

        self.results["layers"][layer].append(result)
        self.results["summary"]["total"] += 1

        if status == "passed":
            self.results["summary"]["passed"] += 1
        elif status == "failed":
            self.results["summary"]["failed"] += 1
            self.results["failures"].append({
                "layer": layer,
                "test": test_name,
                "spec": spec_reference,
                "error": error_message
            })
        elif status == "skipped":
            self.results["summary"]["skipped"] += 1

    def add_spec_violation(
        self,
        spec_file: str,
        requirement: str,
        implementation: str,
        mismatch: str
    ):
        """Add spec compliance violation"""
        self.results["spec_compliance"].append({
            "spec": spec_file,
            "requirement": requirement,
            "implementation": implementation,
            "mismatch": mismatch
        })

    def add_suggestion(
        self,
        agent: str,
        issue: str,
        suggestion: str,
        priority: str = "medium"
    ):
        """Add fix suggestion for specific agent"""
        self.results["suggestions"].append({
            "agent": agent,
            "issue": issue,
            "suggestion": suggestion,
            "priority": priority
        })

    def calculate_pass_rate(self):
        """Calculate pass rate percentage"""
        total = self.results["summary"]["total"]
        passed = self.results["summary"]["passed"]

        if total > 0:
            self.results["summary"]["pass_rate"] = (passed / total) * 100

    def generate_markdown(self) -> str:
        """Generate markdown formatted report"""
        self.calculate_pass_rate()

        report = f"""# QA Test Report

**Generated**: {self.results["timestamp"]}

## Summary

- **Total Tests**: {self.results["summary"]["total"]}
- **Passed**: {self.results["summary"]["passed"]} ✅
- **Failed**: {self.results["summary"]["failed"]} ❌
- **Skipped**: {self.results["summary"]["skipped"]} ⏭️
- **Pass Rate**: {self.results["summary"]["pass_rate"]:.2f}%

## Layer Results

### Database Layer
"""
        for test in self.results["layers"]["database"]:
            status_icon = "✅" if test["status"] == "passed" else "❌"
            report += f"- {status_icon} {test['name']}\n"

        report += "\n### Backend API Layer\n"
        for test in self.results["layers"]["backend"]:
            status_icon = "✅" if test["status"] == "passed" else "❌"
            report += f"- {status_icon} {test['name']}\n"

        report += "\n### Frontend Layer\n"
        for test in self.results["layers"]["frontend"]:
            status_icon = "✅" if test["status"] == "passed" else "❌"
            report += f"- {status_icon} {test['name']}\n"

        report += "\n### Integration Tests\n"
        for test in self.results["layers"]["integration"]:
            status_icon = "✅" if test["status"] == "passed" else "❌"
            report += f"- {status_icon} {test['name']}\n"

        if self.results["failures"]:
            report += "\n## Failed Tests\n\n"
            for failure in self.results["failures"]:
                report += f"### {failure['test']}\n"
                report += f"- **Layer**: {failure['layer']}\n"
                report += f"- **Spec**: {failure['spec']}\n"
                report += f"- **Error**: {failure['error']}\n\n"

        if self.results["spec_compliance"]:
            report += "\n## Spec Compliance Issues\n\n"
            for violation in self.results["spec_compliance"]:
                report += f"### {violation['spec']}\n"
                report += f"- **Requirement**: {violation['requirement']}\n"
                report += f"- **Implementation**: {violation['implementation']}\n"
                report += f"- **Mismatch**: {violation['mismatch']}\n\n"

        if self.results["suggestions"]:
            report += "\n## Suggested Fixes\n\n"
            for suggestion in self.results["suggestions"]:
                priority_emoji = {
                    "high": "🔴",
                    "medium": "🟡",
                    "low": "🟢"
                }.get(suggestion["priority"], "🟡")

                report += f"### {priority_emoji} {suggestion['agent']}\n"
                report += f"- **Issue**: {suggestion['issue']}\n"
                report += f"- **Suggestion**: {suggestion['suggestion']}\n\n"

        return report

    def save_report(self, filename: str = "test_report.md"):
        """Save report to markdown file"""
        report_md = self.generate_markdown()
        with open(filename, 'w') as f:
            f.write(report_md)

        # Also save JSON version
        with open(filename.replace('.md', '.json'), 'w') as f:
            json.dump(self.results, f, indent=2)


# Usage example
if __name__ == "__main__":
    report = TestReport()

    # Add test results
    report.add_test_result(
        layer="backend",
        test_name="test_create_todo_success",
        status="passed",
        spec_reference="@specs/api/todos.md",
        duration=0.15
    )

    report.add_test_result(
        layer="backend",
        test_name="test_update_todo_ownership",
        status="failed",
        spec_reference="@specs/api/todos.md",
        error_message="AssertionError: Should return 404, got 200",
        duration=0.08
    )

    # Add spec violation
    report.add_spec_violation(
        spec_file="@specs/api/todos.md",
        requirement="Title max length 255 characters",
        implementation="No validation implemented",
        mismatch="Titles can exceed 255 characters"
    )

    # Add suggestion
    report.add_suggestion(
        agent="Backend_Dev_Agent",
        issue="Missing title length validation",
        suggestion="Add Field(max_length=255) to TodoCreate schema",
        priority="high"
    )

    # Generate and save
    report.save_report("qa_report.md")
    print("Report generated: qa_report.md")
```

## Test Execution Commands

### Backend (pytest)
```bash
# Run all tests
cd Backend
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_todos_api.py -v

# Run specific test
pytest tests/test_todos_api.py::TestTodosAPI::test_create_todo_success -v

# Run tests matching pattern
pytest tests/ -k "auth" -v
```

### Frontend (Jest/Vitest)
```bash
# Run all tests
cd Frontend
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test TodoCard.test.tsx

# Run in watch mode
npm test -- --watch
```

### E2E (Playwright)
```bash
# Run E2E tests
cd Frontend
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific test
npm run test:e2e -- todo-flow.spec.ts
```

## Spec Compliance Validation

### Process
1. Read specification file
2. Extract acceptance criteria
3. Map to test cases
4. Run tests
5. Compare results with criteria
6. Report mismatches

### Example Validation
```python
def validate_spec_compliance(spec_file: str, test_results: dict) -> list:
    """
    Validate implementation against specification

    Args:
        spec_file: Path to specification file
        test_results: Dictionary of test results

    Returns:
        List of compliance violations
    """
    violations = []

    # Parse spec to extract acceptance criteria
    criteria = parse_acceptance_criteria(spec_file)

    # Check each criterion
    for criterion in criteria:
        # Find corresponding test
        test = find_test_for_criterion(criterion, test_results)

        if not test:
            violations.append({
                "criterion": criterion,
                "issue": "No test found for this criterion",
                "severity": "high"
            })
        elif test["status"] == "failed":
            violations.append({
                "criterion": criterion,
                "issue": f"Test failed: {test['error']}",
                "severity": "high"
            })

    return violations
```

## Tool Usage

### Required Tools

**Read**: Load specifications for validation
- `Read(@specs/features/<feature>/spec.md)`
- `Read(@specs/api/<endpoint>.md)`
- `Read(@specs/ui/<component>.md)`
- `Read(@specs/database/schema.md)`

**Bash**: Run test commands
- `Bash("cd Backend && pytest tests/ -v --cov=app")`
- `Bash("cd Frontend && npm test")`
- `Bash("cd Frontend && npm run test:e2e")`

**Write**: Generate test report
- `Write(qa_report.md)` - Test results and suggestions
- `Write(coverage_report.html)` - Coverage report

## Best Practices

### Test Organization
```
Backend/tests/
├── conftest.py          # Fixtures
├── test_auth.py         # Auth tests
├── test_todos_api.py    # Todos API tests
├── test_database.py     # Schema tests
└── test_integration.py  # Integration tests

Frontend/tests/
├── components/          # Component tests
│   ├── TodoCard.test.tsx
│   └── TodoForm.test.tsx
├── pages/              # Page tests
│   └── login.test.tsx
└── e2e/                # E2E tests
    └── todo-flow.spec.ts
```

### Fixtures (pytest)
```python
# Backend/tests/conftest.py

import pytest
from httpx import AsyncClient
from app.main import app
from app.models.user import User
from app.auth import hash_password, create_access_token


@pytest.fixture
async def client():
    """HTTP client for API testing"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
async def test_user(session):
    """Create test user"""
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword"),
        name="Test User"
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    """Generate auth headers with JWT token"""
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}
```

## Acceptance Criteria

QA process must:
- [ ] Test all CRUD operations for each resource
- [ ] Verify JWT authentication on protected endpoints
- [ ] Validate user scoping (users only access their own data)
- [ ] Test form validation (frontend and backend)
- [ ] Verify database schema and relationships
- [ ] Test error handling (401, 403, 404, 422, 500)
- [ ] Check spec compliance for all features
- [ ] Generate structured test report
- [ ] Provide actionable fix suggestions
- [ ] Achieve minimum 80% code coverage
- [ ] Pass all E2E workflows
- [ ] Verify responsive design (mobile, tablet, desktop)

## Validation Checklist

Before approving implementation:

### Backend
- [ ] All API endpoints tested
- [ ] Authentication flows verified
- [ ] User scoping enforced
- [ ] Input validation working
- [ ] Error handling correct
- [ ] Database operations tested
- [ ] Code coverage >= 80%

### Frontend
- [ ] Components render correctly
- [ ] Forms validate input
- [ ] API integration works
- [ ] Protected routes redirect
- [ ] Loading/error states shown
- [ ] Responsive on all devices
- [ ] Accessibility validated

### Database
- [ ] Schema matches spec
- [ ] Relationships defined
- [ ] Constraints enforced
- [ ] Migrations successful
- [ ] Cascades work correctly
- [ ] Timestamps auto-update

### Integration
- [ ] End-to-end workflows pass
- [ ] Cross-layer communication works
- [ ] Authentication integrated
- [ ] Data flows correctly
- [ ] No spec violations

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Backend API testing with pytest
- Frontend component testing with Vitest
- E2E testing with Playwright
- Database schema testing
- Authentication flow testing
- Spec compliance validation
- Structured test reporting
- Fix suggestions for agents
