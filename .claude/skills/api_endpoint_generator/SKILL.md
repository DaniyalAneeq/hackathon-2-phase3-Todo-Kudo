# API Endpoint Generator

Generates production-ready FastAPI endpoints with SQLModel integration, JWT authentication, validation, and error handling.

## Purpose

This skill creates complete FastAPI endpoint implementations following the Todo App's backend architecture. It ensures all endpoints include proper authentication, user-scoped data access, input validation, error handling, and database integration using SQLModel ORM with Neon PostgreSQL.

## Core Capabilities

- **FastAPI Endpoint Creation**: Generate route handlers with proper HTTP methods and paths
- **SQLModel Integration**: Database operations using SQLModel ORM with async support
- **JWT Authentication**: Better Auth integration with token verification and user context
- **Request/Response Models**: Pydantic schemas for validation and serialization
- **User Scoping**: Ensure users can only access their own data
- **Error Handling**: Comprehensive HTTPException handling with proper status codes
- **CRUD Operations**: Complete Create, Read, Update, Delete implementations
- **Query Support**: Filtering, pagination, sorting capabilities
- **Async/Await**: Proper async database operations

## When to Use This Skill

Use this skill when:
- Implementing new API endpoints from specifications
- Creating CRUD operations for a resource
- Adding authenticated endpoints with user scoping
- Generating route handlers that need database access
- Building RESTful API endpoints
- Converting API specs to FastAPI code
- Ensuring consistent endpoint patterns across the backend

Do NOT use this skill for:
- Frontend API client code (use Frontend_Dev_Agent)
- Database schema design (use Database_Dev_Agent first)
- Authentication configuration (use Auth_Integration_Agent for Better Auth setup)
- WebSocket or SSE implementations (requires custom approach)
- Background task endpoints (requires additional worker setup)

## Execution Workflow

### Phase 1: Specification Analysis

1. **Read API Specification**
   - Use Read tool: `@specs/api/<endpoint-name>.md`
   - Extract: HTTP method, path, request/response schemas, authentication requirements
   - Note: Query parameters, path parameters, request body structure

2. **Identify Dependencies**
   - Database models required (from `@specs/database/` or `Backend/app/models/`)
   - Authentication requirements (public vs protected)
   - Related endpoints or services

3. **Determine Endpoint Type**
   - **CRUD**: Standard Create, Read, Update, Delete
   - **Custom**: Business logic, aggregations, complex queries
   - **List**: Collection endpoints with filtering/pagination
   - **Action**: State transitions (e.g., mark complete, archive)

### Phase 2: Model Preparation

1. **Verify Database Models Exist**
   - Use Glob: `Backend/app/models/*.py`
   - Use Grep: Search for model class definitions
   - If missing, flag for Database_Dev_Agent

2. **Define Request/Response Schemas**
   - **Request Schema**: Pydantic model for input validation
   - **Response Schema**: Pydantic model for API response
   - **Update Schema**: Partial model for PATCH operations
   - Follow naming convention: `{Resource}Create`, `{Resource}Response`, `{Resource}Update`

### Phase 3: Endpoint Generation

1. **Generate Route Handler**
   - Import required dependencies
   - Define async function with FastAPI decorators
   - Add JWT authentication dependency if protected
   - Implement business logic
   - Handle database operations
   - Return proper response

2. **Implement Authentication**
   - Add `Depends(get_current_user)` for protected endpoints
   - Extract user_id from JWT token
   - Apply user scoping to database queries

3. **Add Validation and Error Handling**
   - Validate input using Pydantic schemas
   - Check resource ownership
   - Handle not found scenarios (404)
   - Handle validation errors (422)
   - Handle authorization errors (403)
   - Handle server errors (500)

4. **Database Integration**
   - Use async database session
   - Write SQLModel queries
   - Handle transactions properly
   - Commit and refresh as needed

### Phase 4: Code Organization

1. **File Placement**
   - Routes: `Backend/app/routes/<resource>.py`
   - Schemas: `Backend/app/schemas/<resource>.py` (if separate from models)
   - Dependencies: `Backend/app/dependencies.py` (for auth)

2. **Router Registration**
   - Include router in main app
   - Set prefix: `/api/<resource>`
   - Add tags for OpenAPI docs

### Phase 5: Documentation and Testing

1. **Add OpenAPI Documentation**
   - Docstrings for each endpoint
   - Summary and description
   - Example request/response

2. **Generate Test Cases** (for QA_Spec_Validator)
   - Happy path scenarios
   - Error cases (401, 403, 404, 422)
   - Edge cases (empty lists, invalid data)

## Templates

### Template 1: Protected CRUD Endpoints (Complete Resource)

```python
# Backend/app/routes/<resource>.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.<resource> import <Resource>
from app.schemas.<resource> import (
    <Resource>Create,
    <Resource>Response,
    <Resource>Update
)
from app.dependencies import get_current_user, get_db_session
from app.models.user import User

router = APIRouter(prefix="/api/<resources>", tags=["<resources>"])


@router.post(
    "/",
    response_model=<Resource>Response,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new <resource>"
)
async def create_<resource>(
    <resource>_data: <Resource>Create,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> <Resource>Response:
    """
    Create a new <resource> for the authenticated user.

    - **<field>**: <description>
    - Returns the created <resource> with generated ID
    """
    # Create <resource> instance with user_id from JWT
    <resource> = <Resource>(
        **<resource>_data.model_dump(),
        user_id=current_user.id
    )

    session.add(<resource>)
    await session.commit()
    await session.refresh(<resource>)

    return <resource>


@router.get(
    "/",
    response_model=List[<Resource>Response],
    summary="List all <resources> for current user"
)
async def list_<resources>(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Max records to return"),
    status: Optional[str] = Query(None, description="Filter by status")
) -> List[<Resource>Response]:
    """
    Retrieve all <resources> belonging to the authenticated user.

    Supports pagination and filtering:
    - **skip**: Offset for pagination
    - **limit**: Maximum number of results
    - **status**: Filter by status (optional)
    """
    # Build query with user scoping
    query = select(<Resource>).where(<Resource>.user_id == current_user.id)

    # Apply filters
    if status:
        query = query.where(<Resource>.status == status)

    # Apply pagination
    query = query.offset(skip).limit(limit)

    result = await session.execute(query)
    <resources> = result.scalars().all()

    return <resources>


@router.get(
    "/{<resource>_id}",
    response_model=<Resource>Response,
    summary="Get a specific <resource>"
)
async def get_<resource>(
    <resource>_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> <Resource>Response:
    """
    Retrieve a specific <resource> by ID.

    - Must belong to the authenticated user
    - Returns 404 if not found or not owned by user
    """
    # Query with user scoping
    query = select(<Resource>).where(
        <Resource>.id == <resource>_id,
        <Resource>.user_id == current_user.id
    )

    result = await session.execute(query)
    <resource> = result.scalar_one_or_none()

    if not <resource>:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="<Resource> not found"
        )

    return <resource>


@router.patch(
    "/{<resource>_id}",
    response_model=<Resource>Response,
    summary="Update a <resource>"
)
async def update_<resource>(
    <resource>_id: int,
    <resource>_data: <Resource>Update,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> <Resource>Response:
    """
    Update a <resource> by ID.

    - Only updates provided fields (partial update)
    - Must belong to the authenticated user
    - Returns 404 if not found or not owned by user
    """
    # Fetch existing <resource> with user scoping
    query = select(<Resource>).where(
        <Resource>.id == <resource>_id,
        <Resource>.user_id == current_user.id
    )

    result = await session.execute(query)
    <resource> = result.scalar_one_or_none()

    if not <resource>:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="<Resource> not found"
        )

    # Update only provided fields
    update_data = <resource>_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(<resource>, key, value)

    session.add(<resource>)
    await session.commit()
    await session.refresh(<resource>)

    return <resource>


@router.delete(
    "/{<resource>_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a <resource>"
)
async def delete_<resource>(
    <resource>_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> None:
    """
    Delete a <resource> by ID.

    - Must belong to the authenticated user
    - Returns 404 if not found or not owned by user
    - Returns 204 No Content on success
    """
    # Fetch existing <resource> with user scoping
    query = select(<Resource>).where(
        <Resource>.id == <resource>_id,
        <Resource>.user_id == current_user.id
    )

    result = await session.execute(query)
    <resource> = result.scalar_one_or_none()

    if not <resource>:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="<Resource> not found"
        )

    await session.delete(<resource>)
    await session.commit()
```

### Template 2: Public Endpoint (No Auth)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db_session

router = APIRouter(prefix="/api/<resource>", tags=["<resource>"])


@router.get(
    "/",
    summary="Public endpoint - no auth required"
)
async def public_endpoint(
    session: AsyncSession = Depends(get_db_session)
):
    """
    Public endpoint accessible without authentication.

    Use for: health checks, public data, etc.
    """
    # Implementation
    return {"status": "ok"}
```

### Template 3: Custom Action Endpoint

```python
@router.post(
    "/{<resource>_id}/complete",
    response_model=<Resource>Response,
    summary="Mark <resource> as complete"
)
async def complete_<resource>(
    <resource>_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> <Resource>Response:
    """
    Custom action: Mark a <resource> as complete.

    - Updates status to 'completed'
    - Sets completed_at timestamp
    - Must belong to authenticated user
    """
    # Fetch with user scoping
    query = select(<Resource>).where(
        <Resource>.id == <resource>_id,
        <Resource>.user_id == current_user.id
    )

    result = await session.execute(query)
    <resource> = result.scalar_one_or_none()

    if not <resource>:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="<Resource> not found"
        )

    # Business logic
    if <resource>.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="<Resource> is already completed"
        )

    <resource>.status = "completed"
    <resource>.completed_at = datetime.utcnow()

    session.add(<resource>)
    await session.commit()
    await session.refresh(<resource>)

    return <resource>
```

### Template 4: Bulk Operation Endpoint

```python
from typing import List
from app.schemas.<resource> import BulkDeleteRequest, BulkDeleteResponse


@router.post(
    "/bulk-delete",
    response_model=BulkDeleteResponse,
    summary="Delete multiple <resources>"
)
async def bulk_delete_<resources>(
    request: BulkDeleteRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> BulkDeleteResponse:
    """
    Delete multiple <resources> by IDs.

    - All <resources> must belong to authenticated user
    - Returns count of deleted items
    """
    # Fetch all requested <resources> with user scoping
    query = select(<Resource>).where(
        <Resource>.id.in_(request.ids),
        <Resource>.user_id == current_user.id
    )

    result = await session.execute(query)
    <resources> = result.scalars().all()

    deleted_count = len(<resources>)

    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No <resources> found for deletion"
        )

    for <resource> in <resources>:
        await session.delete(<resource>)

    await session.commit()

    return BulkDeleteResponse(deleted_count=deleted_count)
```

### Template 5: Schema Definitions

```python
# Backend/app/schemas/<resource>.py

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class <Resource>Base(BaseModel):
    """Base schema with common fields"""
    title: str = Field(..., min_length=1, max_length=255, description="<Resource> title")
    description: Optional[str] = Field(None, max_length=1000, description="<Resource> description")


class <Resource>Create(<Resource>Base):
    """Schema for creating a new <resource>"""
    status: str = Field(default="pending", pattern="^(pending|in_progress|completed)$")
    due_date: Optional[datetime] = None

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v):
        if v and v < datetime.utcnow():
            raise ValueError('Due date must be in the future')
        return v


class <Resource>Update(BaseModel):
    """Schema for updating a <resource> (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed)$")
    due_date: Optional[datetime] = None


class <Resource>Response(<Resource>Base):
    """Schema for <resource> response"""
    id: int
    user_id: int
    status: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel


class BulkDeleteRequest(BaseModel):
    """Schema for bulk delete request"""
    ids: list[int] = Field(..., min_length=1, description="List of <resource> IDs to delete")


class BulkDeleteResponse(BaseModel):
    """Schema for bulk delete response"""
    deleted_count: int = Field(..., description="Number of <resources> deleted")
```

### Template 6: Dependencies (Auth)

```python
# Backend/app/dependencies.py

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.user import User
from app.auth import verify_jwt_token  # Better Auth integration


security = HTTPBearer()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Database session dependency"""
    async with get_session() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db_session)
) -> User:
    """
    Verify JWT token and return current user.

    Raises:
        401: Invalid or expired token
        404: User not found
    """
    token = credentials.credentials

    try:
        # Verify JWT token using Better Auth
        payload = verify_jwt_token(token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Fetch user from database
    query = select(User).where(User.id == user_id)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
```

## Tool Usage

### Required Tools

**Read**: Read API specifications and existing code
- `Read(@specs/api/<endpoint>.md)` - Load endpoint specs
- `Read(Backend/app/models/<model>.py)` - Check existing models
- `Read(Backend/app/routes/<resource>.py)` - Check existing routes

**Glob**: Discover existing implementations
- `Glob(Backend/app/models/*.py)` - Find all models
- `Glob(Backend/app/routes/*.py)` - Find all route files

**Grep**: Search for specific patterns
- `Grep("class.*Router")` - Find router definitions
- `Grep("def get_current_user")` - Check if auth dependency exists

**Write**: Create new endpoint files
- `Write(Backend/app/routes/<resource>.py)` - Generate route file

**Edit**: Update existing files
- `Edit(Backend/app/main.py)` - Register new router

### Tool Patterns

**Pattern 1: New CRUD Endpoint**
```
1. Read(@specs/api/<resource>.md) - Get specification
2. Glob(Backend/app/models/*.py) - Verify model exists
3. Read(Backend/app/dependencies.py) - Check auth setup
4. Write(Backend/app/routes/<resource>.py) - Generate endpoints
5. Edit(Backend/app/main.py) - Register router
```

**Pattern 2: Update Existing Endpoint**
```
1. Read(Backend/app/routes/<resource>.py) - Load existing code
2. Edit(Backend/app/routes/<resource>.py) - Modify endpoint
3. Read(@specs/api/<resource>.md) - Verify spec compliance
```

**Pattern 3: Add Custom Action**
```
1. Read(Backend/app/routes/<resource>.py) - Check existing endpoints
2. Edit(Backend/app/routes/<resource>.py) - Add new action endpoint
```

## Decision Points

### When to use authentication:
- **Protected Endpoint**: User-specific data → Use `Depends(get_current_user)`
- **Public Endpoint**: No auth needed → No auth dependency
- **Admin Endpoint**: Role-based → Add role check after auth

### When choosing HTTP method:
- **POST**: Create new resource or trigger action
- **GET**: Retrieve resource(s), read-only
- **PATCH**: Partial update, only provided fields
- **PUT**: Full replacement (rare, prefer PATCH)
- **DELETE**: Remove resource

### When to apply user scoping:
- **Always**: For user-owned resources (todos, notes, etc.)
- **Never**: For public data or admin operations
- **Conditional**: Based on user role or permissions

### When to use query parameters vs path parameters:
- **Path Parameters**: Resource identifiers (`/todos/{todo_id}`)
- **Query Parameters**: Filters, pagination, sorting (`?status=completed&skip=0&limit=10`)

### Error handling strategy:
- **404**: Resource not found or not owned by user
- **401**: Missing or invalid authentication
- **403**: Forbidden (authenticated but not authorized)
- **422**: Validation error (Pydantic handles automatically)
- **400**: Business logic error (e.g., already completed)
- **500**: Server error (database issues, etc.)

## Acceptance Criteria

Every generated endpoint must:
- [ ] Include proper HTTP method and path
- [ ] Use async/await for database operations
- [ ] Include authentication for protected endpoints
- [ ] Apply user scoping to queries
- [ ] Validate input using Pydantic schemas
- [ ] Handle errors with appropriate status codes
- [ ] Return proper response models
- [ ] Include OpenAPI documentation (docstrings)
- [ ] Follow FastAPI best practices
- [ ] Use SQLModel for database operations
- [ ] Commit and refresh database changes
- [ ] Include type hints for all parameters

## Validation Checklist

Before finalizing endpoint code, verify:

1. **Authentication**
   - [ ] Protected endpoints have `Depends(get_current_user)`
   - [ ] User ID is extracted from JWT token
   - [ ] Public endpoints explicitly documented as such

2. **User Scoping**
   - [ ] All queries filter by `user_id == current_user.id`
   - [ ] Users cannot access other users' data
   - [ ] Ownership verified before updates/deletes

3. **Validation**
   - [ ] Request schemas validate all input
   - [ ] Field constraints are enforced (min_length, max_length, patterns)
   - [ ] Custom validators for business rules

4. **Error Handling**
   - [ ] 404 returned when resource not found
   - [ ] 401 returned for invalid auth
   - [ ] 403 returned for unauthorized access
   - [ ] Meaningful error messages

5. **Database Operations**
   - [ ] Uses async database session
   - [ ] Commits changes properly
   - [ ] Refreshes objects after commit
   - [ ] Handles database exceptions

6. **Documentation**
   - [ ] Docstring describes endpoint purpose
   - [ ] Parameters documented
   - [ ] Response format described
   - [ ] Tags set for OpenAPI grouping

7. **Code Quality**
   - [ ] Follows naming conventions
   - [ ] Type hints on all functions
   - [ ] No hardcoded values
   - [ ] DRY principle followed

## Examples

### Example 1: Todo CRUD Endpoints

**Input Spec**:
```markdown
# API: Todo Management

## Endpoints

### POST /api/todos
Create a new todo item
- Auth: Required
- Body: { title, description, due_date }
- Response: Todo object with id

### GET /api/todos
List all todos for current user
- Auth: Required
- Query params: status, skip, limit
- Response: Array of todos

### PATCH /api/todos/{id}
Update a todo
- Auth: Required
- Body: Partial todo fields
- Response: Updated todo

### DELETE /api/todos/{id}
Delete a todo
- Auth: Required
- Response: 204 No Content
```

**Generated Output**:
```python
# Backend/app/routes/todos.py

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate
from app.dependencies import get_current_user, get_db_session
from app.models.user import User

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.post(
    "/",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo"
)
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """Create a new todo item for the authenticated user."""
    todo = Todo(
        **todo_data.model_dump(),
        user_id=current_user.id
    )

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return todo


@router.get(
    "/",
    response_model=List[TodoResponse],
    summary="List all todos"
)
async def list_todos(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None)
) -> List[TodoResponse]:
    """Retrieve all todos for the authenticated user."""
    query = select(Todo).where(Todo.user_id == current_user.id)

    if status:
        query = query.where(Todo.status == status)

    query = query.offset(skip).limit(limit)

    result = await session.execute(query)
    todos = result.scalars().all()

    return todos


@router.get(
    "/{todo_id}",
    response_model=TodoResponse,
    summary="Get a todo"
)
async def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """Retrieve a specific todo by ID."""
    query = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    )

    result = await session.execute(query)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return todo


@router.patch(
    "/{todo_id}",
    response_model=TodoResponse,
    summary="Update a todo"
)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """Update a todo by ID."""
    query = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    )

    result = await session.execute(query)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    update_data = todo_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return todo


@router.delete(
    "/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a todo"
)
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> None:
    """Delete a todo by ID."""
    query = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    )

    result = await session.execute(query)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    await session.delete(todo)
    await session.commit()
```

**Explanation**: Complete CRUD implementation with auth, user scoping, validation, and error handling.

### Example 2: Custom Action Endpoint

**Input Spec**:
```markdown
# API: Mark Todo as Complete

## POST /api/todos/{id}/complete
Mark a todo as completed
- Auth: Required
- Sets status to 'completed'
- Sets completed_at timestamp
- Returns updated todo
```

**Generated Output**:
```python
from datetime import datetime


@router.post(
    "/{todo_id}/complete",
    response_model=TodoResponse,
    summary="Mark todo as complete"
)
async def complete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """Mark a todo as completed."""
    query = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    )

    result = await session.execute(query)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Todo is already completed"
        )

    todo.status = "completed"
    todo.completed_at = datetime.utcnow()

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return todo
```

**Explanation**: Custom action with business logic validation (preventing duplicate completion).

## Advanced Patterns

### Pattern 1: Complex Filtering

```python
from sqlmodel import or_, and_


@router.get("/search", response_model=List[TodoResponse])
async def search_todos(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
    q: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = None,
    due_before: Optional[datetime] = None
) -> List[TodoResponse]:
    """Advanced search with multiple filters."""
    query = select(Todo).where(Todo.user_id == current_user.id)

    # Text search
    if q:
        query = query.where(
            or_(
                Todo.title.ilike(f"%{q}%"),
                Todo.description.ilike(f"%{q}%")
            )
        )

    # Status filter
    if status:
        query = query.where(Todo.status == status)

    # Due date filter
    if due_before:
        query = query.where(Todo.due_date <= due_before)

    result = await session.execute(query)
    return result.scalars().all()
```

### Pattern 2: Aggregation Endpoint

```python
from sqlalchemy import func


@router.get("/stats", response_model=TodoStatsResponse)
async def get_todo_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoStatsResponse:
    """Get statistics about user's todos."""
    # Count by status
    query = select(
        Todo.status,
        func.count(Todo.id).label("count")
    ).where(
        Todo.user_id == current_user.id
    ).group_by(Todo.status)

    result = await session.execute(query)
    stats_by_status = {row.status: row.count for row in result}

    return TodoStatsResponse(
        total=sum(stats_by_status.values()),
        pending=stats_by_status.get("pending", 0),
        in_progress=stats_by_status.get("in_progress", 0),
        completed=stats_by_status.get("completed", 0)
    )
```

### Pattern 3: Relationship Loading

```python
from sqlmodel import selectinload


@router.get("/{todo_id}/full", response_model=TodoFullResponse)
async def get_todo_with_relations(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoFullResponse:
    """Get todo with related data (e.g., comments, tags)."""
    query = (
        select(Todo)
        .where(Todo.id == todo_id, Todo.user_id == current_user.id)
        .options(
            selectinload(Todo.comments),
            selectinload(Todo.tags)
        )
    )

    result = await session.execute(query)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return todo
```

### Pattern 4: Transaction with Multiple Operations

```python
@router.post("/{todo_id}/archive")
async def archive_todo_with_notification(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """Archive todo and create notification (transaction)."""
    async with session.begin():
        # Fetch todo
        query = select(Todo).where(
            Todo.id == todo_id,
            Todo.user_id == current_user.id
        )
        result = await session.execute(query)
        todo = result.scalar_one_or_none()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found"
            )

        # Archive todo
        todo.archived = True
        todo.archived_at = datetime.utcnow()
        session.add(todo)

        # Create notification
        notification = Notification(
            user_id=current_user.id,
            message=f"Todo '{todo.title}' has been archived"
        )
        session.add(notification)

    await session.refresh(todo)
    return todo
```

## Integration with Backend_Dev_Agent

This skill provides the foundational code that Backend_Dev_Agent uses:

**Workflow Integration**:
1. Database_Dev_Agent creates models
2. Auth_Integration_Agent sets up Better Auth
3. **This skill generates endpoint code**
4. Backend_Dev_Agent reviews and integrates
5. Frontend_Dev_Agent consumes the API
6. QA_Spec_Validator tests endpoints

## Best Practices

### Security
- Always apply user scoping to prevent data leaks
- Verify ownership before updates/deletes
- Use JWT authentication for protected routes
- Validate all input with Pydantic
- Never trust client-provided IDs without verification

### Performance
- Use `select()` with specific columns when possible
- Apply pagination to list endpoints
- Use indexes on frequently queried fields
- Avoid N+1 queries with `selectinload`

### Code Organization
- One router per resource
- Group related endpoints
- Use consistent naming conventions
- Separate schemas from models
- Keep dependencies in dedicated file

### Error Handling
- Use appropriate HTTP status codes
- Provide meaningful error messages
- Don't leak sensitive information in errors
- Log errors for debugging

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- CRUD endpoint templates
- FastAPI + SQLModel integration
- Better Auth JWT authentication
- Async database operations
- User scoping patterns
- Comprehensive validation examples
