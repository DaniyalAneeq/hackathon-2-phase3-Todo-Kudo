# Phase 1: Data Model - Project Foundation

**Feature**: 001-project-overview
**Date**: 2025-12-31
**Phase**: Data Model Design

## Purpose

This document defines the database schema for the foundational infrastructure. This phase only includes the User model synced from Better Auth. Todo models will be added in subsequent feature specifications.

---

## Database Configuration

**Provider**: Neon Serverless PostgreSQL
**Connection**: Pooled connection string for async FastAPI
**ORM**: SQLModel (combines SQLAlchemy + Pydantic)
**Migration Tool**: Alembic
**Driver**: asyncpg

---

## Entity Definitions

### Entity 1: User

**Purpose**: Represents an authenticated user in the system. This model syncs with Better Auth's user structure for data consistency.

**Source of Truth**: Better Auth (frontend authentication)
**Backend Role**: Read-only reference for data isolation via `user_id` foreign keys

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `str` (UUID) | Primary Key | Unique user identifier (from Better Auth) |
| `email` | `str` | Unique, Not Null, Indexed | User email address |
| `email_verified` | `bool` | Default: False | Whether email has been verified |
| `name` | `str` (optional) | Nullable | User display name |
| `image` | `str` (optional) | Nullable | Profile image URL |
| `created_at` | `datetime` | Not Null, Default: now() | Timestamp of user creation |
| `updated_at` | `datetime` | Not Null, Default: now(), Auto-update | Timestamp of last update |

**Validation Rules**:
- Email must be valid email format (Pydantic validator)
- `id` must be valid UUID format
- `created_at` cannot be in the future
- `updated_at` must be >= `created_at`

**Relationships** (future):
- One-to-Many with `Todo` (not in this phase)

**State Transitions**: None (stateless entity)

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `email` (for lookup and constraint enforcement)

**SQLModel Definition** (`backend/app/models/user.py`):

```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from pydantic import EmailStr
import uuid

class User(SQLModel, table=True):
    """
    User model synced with Better Auth.
    Backend does NOT create users; this is read-only for data isolation.
    """
    __tablename__ = "users"

    # Primary key (UUID from Better Auth)
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Unique user identifier from Better Auth"
    )

    # Core fields
    email: EmailStr = Field(
        unique=True,
        index=True,
        description="User email address"
    )
    email_verified: bool = Field(
        default=False,
        description="Email verification status"
    )
    name: Optional[str] = Field(
        default=None,
        description="User display name"
    )
    image: Optional[str] = Field(
        default=None,
        description="Profile image URL"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="User creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "email_verified": True,
                "name": "John Doe",
                "image": "https://example.com/avatar.jpg",
                "created_at": "2025-12-31T00:00:00Z",
                "updated_at": "2025-12-31T00:00:00Z"
            }
        }
```

**Alembic Migration** (generated via `alembic revision --autogenerate`):

```python
# File: alembic/versions/001_create_users_table.py

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('email_verified', sa.Boolean(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
```

---

## Future Entities (Not in This Phase)

### Todo (Future Feature)

**Attributes** (preliminary):
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → User.id)
- `title` (str, Not Null)
- `description` (str, Nullable)
- `status` (enum: "pending", "in_progress", "completed")
- `priority` (enum: "low", "medium", "high")
- `due_date` (datetime, Nullable)
- `created_at` (datetime, Not Null)
- `updated_at` (datetime, Not Null)

**Validation Rules**:
- All queries MUST filter by `user_id == current_user`
- `title` max length: 200 characters
- `description` max length: 2000 characters

**Relationships**:
- Many-to-One with User (via `user_id`)

**Note**: Full Todo entity definition will be created in dedicated feature spec after foundation is complete.

---

## Database Schema Diagram

```
┌─────────────────────────────────────┐
│            users                     │
├─────────────────────────────────────┤
│ id (PK, UUID, str)                  │
│ email (UNIQUE, str)                 │
│ email_verified (bool)               │
│ name (str, nullable)                │
│ image (str, nullable)               │
│ created_at (datetime)               │
│ updated_at (datetime)               │
└─────────────────────────────────────┘
           │
           │ (future: one-to-many)
           │
           ▼
┌─────────────────────────────────────┐
│           todos (future)             │
├─────────────────────────────────────┤
│ id (PK, UUID)                       │
│ user_id (FK → users.id)             │
│ title (str)                         │
│ description (str, nullable)         │
│ status (enum)                       │
│ priority (enum)                     │
│ due_date (datetime, nullable)       │
│ created_at (datetime)               │
│ updated_at (datetime)               │
└─────────────────────────────────────┘
```

---

## Data Isolation Strategy

**Principle**: Every database query MUST filter by `user_id` to enforce data isolation.

**Implementation**:

1. **JWT Verification Dependency**:
   - Extract `user_id` from verified JWT token
   - Inject `user_id` into route handlers via FastAPI dependency

2. **Query Pattern**:
   ```python
   # Example for future Todo queries
   async def get_user_todos(user_id: str, session: AsyncSession):
       statement = select(Todo).where(Todo.user_id == user_id)
       result = await session.execute(statement)
       return result.scalars().all()
   ```

3. **Security Gate**:
   - All protected routes MUST use `Depends(get_current_user)` dependency
   - No endpoint should return data without `user_id` filtering
   - No global queries (e.g., `select(Todo)` without `where` clause)

**Enforcement**:
- Code review checklist includes data isolation verification
- Integration tests must verify users cannot access other users' data

---

## Migration Strategy

**Initial Setup**:
1. Initialize Alembic: `alembic init alembic`
2. Configure `alembic/env.py` with async engine and SQLModel metadata
3. Generate initial migration: `alembic revision --autogenerate -m "Create users table"`
4. Apply migration: `alembic upgrade head`

**Ongoing Process**:
1. Modify SQLModel models in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "Description"`
3. Review generated migration file
4. Apply migration: `alembic upgrade head`
5. Commit migration file to version control

**Rollback**:
- Rollback last migration: `alembic downgrade -1`
- Rollback to specific version: `alembic downgrade <revision>`

**Best Practices**:
- Always review auto-generated migrations before applying
- Never edit applied migrations (create new migration instead)
- Test migrations in development environment first
- Include migration in deployment pipeline

---

## Connection Configuration

**Environment Variables** (`backend/.env`):

```env
# Neon PostgreSQL Connection
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname?sslmode=require

# Connection Pool Settings
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=3600
```

**SQLAlchemy Engine Configuration** (`backend/app/core/database.py`):

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from .config import settings

# Create async engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Dependency for route handlers
async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
```

---

## Testing Strategy (Future)

**Unit Tests**:
- Test model validation (Pydantic validators)
- Test field constraints (unique, not null)
- Test default values

**Integration Tests**:
- Test database CRUD operations
- Test data isolation (users cannot access other users' data)
- Test migration up/down cycles

**Performance Tests**:
- Test connection pool under load
- Test query performance with indexes

**Test Framework**: pytest + pytest-asyncio + httpx (from research.md)

---

## Summary

**Entities Defined**: 1 (User)
**Tables Created**: 1 (`users`)
**Migrations**: 1 (`001_create_users_table.py`)
**Indexes**: 2 (Primary key on `id`, Unique on `email`)
**Relationships**: 0 (future: one-to-many with Todo)

**Data Isolation**: Enforced via `user_id` filtering in all queries
**Migration Tool**: Alembic with auto-generation
**ORM**: SQLModel (async)

**Phase 1 (Data Model) Complete** ✅

**Next**: Create API contracts in `contracts/` directory
