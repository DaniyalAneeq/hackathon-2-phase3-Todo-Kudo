# Database Model Generator

Generates SQLModel ORM models and Alembic migrations from database specifications for PostgreSQL/Neon databases.

## Purpose

This skill transforms database schema specifications into production-ready SQLModel classes and Alembic migration scripts. It ensures proper field types, constraints, relationships, indexes, and referential integrity for PostgreSQL databases, with focus on the Neon serverless PostgreSQL platform.

## Core Capabilities

- **SQLModel Class Generation**: Create ORM models with proper types, constraints, and validation
- **Relationship Mapping**: Define foreign keys, one-to-many, many-to-many relationships
- **Alembic Migration Scripts**: Auto-generate database migration files
- **Index Management**: Create indexes for performance optimization
- **Constraint Definition**: Unique constraints, check constraints, default values
- **Timestamp Tracking**: Automatic created_at and updated_at fields
- **Type Safety**: Full type hints for IDE support and runtime validation
- **PostgreSQL Features**: Leverage PostgreSQL-specific types and features

## When to Use This Skill

Use this skill when:
- Creating new database tables from specifications
- Adding or modifying columns in existing tables
- Establishing relationships between tables
- Creating database indexes for query optimization
- Generating Alembic migration scripts
- Converting ERD diagrams to code
- Implementing schema changes from feature specs
- Setting up initial database structure

Do NOT use this skill for:
- API endpoint implementation (use API Endpoint Generator)
- Frontend components (use Frontend Component Generator)
- Data migration or seeding (requires separate scripts)
- Database query optimization (requires query analysis)
- Running migrations (use Alembic commands directly)

## Execution Workflow

### Step 1: Specification Analysis

**Input Sources**:
- Database Spec: `@specs/database/schema.md`
- Feature Spec: `@specs/features/<feature>/spec.md` (for data requirements)
- ERD Diagrams: `@specs/database/erd.md` or images

**Extract**:
1. Table names and purposes
2. Column definitions (name, type, constraints)
3. Relationships (foreign keys, many-to-many)
4. Indexes (single-column, composite)
5. Constraints (unique, check, default values)
6. Timestamps and soft deletes

### Step 2: Model Design

**For each table**:
1. Determine primary key strategy (auto-increment int vs UUID)
2. Map field types (str, int, datetime, enum, etc.)
3. Define nullable vs required fields
4. Add constraints (max_length, ge, le, regex)
5. Establish relationships (ForeignKey, Relationship)
6. Add indexes for frequently queried fields
7. Include audit fields (created_at, updated_at)

### Step 3: Generate SQLModel Classes

**File Organization**:
- Individual models: `Backend/app/models/<model_name>.py`
- Or single file: `Backend/app/models/models.py`

**Class Structure**:
```python
class ModelName(SQLModel, table=True):
    # Table configuration
    # Primary key
    # Fields with types and constraints
    # Relationships
    # Indexes
```

### Step 4: Create Alembic Migration

**Migration Process**:
1. Generate migration: `alembic revision --autogenerate -m "description"`
2. Review migration file
3. Apply migration: `alembic upgrade head`

**Migration File Location**: `Backend/alembic/versions/XXXX_description.py`

### Step 5: Validation

**Verify**:
- [ ] All fields have correct types
- [ ] Foreign keys reference correct tables
- [ ] Indexes are defined for performance
- [ ] Constraints prevent invalid data
- [ ] Relationships are bidirectional where needed
- [ ] Migration script is correct

## Model Generation Templates

### Template 1: Basic Model with Timestamps

```python
# Backend/app/models/{{model_name}}.py

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class {{ModelName}}(SQLModel, table=True):
    """
    {{Description of the model}}

    Attributes:
        id: Primary key
        {{field1}}: {{Description}}
        {{field2}}: {{Description}}
        created_at: Timestamp when record was created
        updated_at: Timestamp when record was last updated
    """
    __tablename__ = "{{table_name}}"

    # Primary Key
    id: int = Field(default=None, primary_key=True)

    # Fields
    {{field1}}: str = Field(max_length={{length}}, nullable=False, index=True)
    {{field2}}: Optional[str] = Field(default=None, max_length={{length}})
    {{status_field}}: str = Field(default="{{default_status}}", max_length=50)

    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    class Config:
        """Pydantic configuration"""
        json_schema_extra = {
            "example": {
                "id": 1,
                "{{field1}}": "Example value",
                "{{field2}}": "Optional value",
                "{{status_field}}": "{{default_status}}",
                "created_at": "2025-01-15T12:00:00Z",
                "updated_at": "2025-01-15T12:00:00Z"
            }
        }
```

### Template 2: Model with Foreign Key

```python
# Backend/app/models/{{model_name}}.py

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .{{parent_model}} import {{ParentModel}}

class {{ModelName}}(SQLModel, table=True):
    """
    {{Description}}

    Relationships:
        {{parent}}: Many-to-one relationship with {{ParentModel}}
    """
    __tablename__ = "{{table_name}}"

    # Primary Key
    id: int = Field(default=None, primary_key=True)

    # Foreign Key
    {{parent_id}}: int = Field(foreign_key="{{parent_table}}.id", nullable=False, index=True)

    # Fields
    {{field1}}: str = Field(max_length={{length}}, nullable=False)
    {{field2}}: Optional[str] = Field(default=None, max_length={{length}})

    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # Relationships
    {{parent}}: Optional["{{ParentModel}}"] = Relationship(back_populates="{{children}}")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "{{parent_id}}": 1,
                "{{field1}}": "Example",
                "{{field2}}": "Optional"
            }
        }
```

### Template 3: User Model with Authentication

```python
# Backend/app/models/user.py

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .todo import Todo

class User(SQLModel, table=True):
    """
    User model for authentication and user management.

    Attributes:
        id: Primary key
        email: Unique email address for login
        hashed_password: Bcrypt hashed password
        name: Optional display name
        is_active: Whether the user account is active
        is_superuser: Whether the user has admin privileges
        created_at: Account creation timestamp
        updated_at: Last update timestamp

    Relationships:
        todos: One-to-many relationship with Todo model
    """
    __tablename__ = "users"

    # Primary Key
    id: int = Field(default=None, primary_key=True)

    # Authentication fields
    email: str = Field(max_length=255, nullable=False, unique=True, index=True)
    hashed_password: str = Field(max_length=255, nullable=False)

    # Profile fields
    name: Optional[str] = Field(default=None, max_length=255)

    # Status fields
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)

    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # Relationships
    todos: List["Todo"] = Relationship(back_populates="user")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "name": "John Doe",
                "is_active": True,
                "is_superuser": False
            }
        }
```

### Template 4: Todo Model (Complete Example)

```python
# Backend/app/models/todo.py

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, String
from enum import Enum

if TYPE_CHECKING:
    from .user import User

class TodoStatus(str, Enum):
    """Todo status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Todo(SQLModel, table=True):
    """
    Todo item model.

    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        title: Todo title (required)
        description: Optional detailed description
        status: Current status (pending, in_progress, completed)
        due_date: Optional due date
        completed_at: Timestamp when marked as completed
        created_at: Creation timestamp
        updated_at: Last update timestamp

    Relationships:
        user: Many-to-one relationship with User model
    """
    __tablename__ = "todos"

    # Primary Key
    id: int = Field(default=None, primary_key=True)

    # Foreign Key
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    # Core fields
    title: str = Field(max_length=255, nullable=False, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)

    # Status fields
    status: str = Field(
        default=TodoStatus.PENDING.value,
        max_length=50,
        sa_column=Column(String(50), nullable=False, index=True)
    )

    # Date fields
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)

    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="todos")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Complete project",
                "description": "Finish the todo app",
                "status": "in_progress",
                "due_date": "2025-01-20T23:59:59Z",
                "completed_at": None,
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T12:00:00Z"
            }
        }
```

### Template 5: Many-to-Many Relationship

```python
# Backend/app/models/tag.py

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .todo import Todo

# Association table for many-to-many relationship
class TodoTag(SQLModel, table=True):
    """Association table linking todos and tags"""
    __tablename__ = "todo_tags"

    todo_id: int = Field(foreign_key="todos.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Tag(SQLModel, table=True):
    """
    Tag model for categorizing todos.

    Attributes:
        id: Primary key
        name: Tag name (unique)
        color: Optional color code for UI
        created_at: Creation timestamp

    Relationships:
        todos: Many-to-many relationship with Todo model
    """
    __tablename__ = "tags"

    # Primary Key
    id: int = Field(default=None, primary_key=True)

    # Fields
    name: str = Field(max_length=50, nullable=False, unique=True, index=True)
    color: Optional[str] = Field(default=None, max_length=7)  # Hex color code

    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships (requires link_model in Todo model as well)
    todos: List["Todo"] = Relationship(back_populates="tags", link_model=TodoTag)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "urgent",
                "color": "#FF0000"
            }
        }

# Update Todo model to include:
# tags: List["Tag"] = Relationship(back_populates="todos", link_model=TodoTag)
```

### Template 6: Model with Composite Index

```python
# Backend/app/models/{{model_name}}.py

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Index

class {{ModelName}}(SQLModel, table=True):
    """{{Description}}"""
    __tablename__ = "{{table_name}}"

    # Primary Key
    id: int = Field(default=None, primary_key=True)

    # Foreign Keys (for composite index)
    {{fk1_id}}: int = Field(foreign_key="{{fk1_table}}.id", nullable=False)
    {{fk2_id}}: int = Field(foreign_key="{{fk2_table}}.id", nullable=False)

    # Fields
    {{field1}}: str = Field(max_length={{length}}, nullable=False)

    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # Composite index for faster queries
    __table_args__ = (
        Index('idx_{{index_name}}', '{{fk1_id}}', '{{fk2_id}}'),
    )
```

### Template 7: Alembic Migration Script

```python
# Backend/alembic/versions/XXXX_{{description}}.py

"""{{description}}

Revision ID: {{revision_id}}
Revises: {{previous_revision}}
Create Date: {{date}}

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '{{revision_id}}'
down_revision = '{{previous_revision}}'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade database schema"""
    # Create table
    op.create_table(
        '{{table_name}}',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('{{field1}}', sa.String(length={{length}}), nullable=False),
        sa.Column('{{field2}}', sa.String(length={{length}}), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(
        'ix_{{table_name}}_{{field1}}',
        '{{table_name}}',
        ['{{field1}}'],
        unique=False
    )

    # Add foreign key (if applicable)
    # op.create_foreign_key(
    #     'fk_{{table_name}}_{{parent_table}}',
    #     '{{table_name}}', '{{parent_table}}',
    #     ['{{parent_id}}'], ['id'],
    #     ondelete='CASCADE'
    # )


def downgrade() -> None:
    """Rollback database schema"""
    # Drop indexes
    op.drop_index('ix_{{table_name}}_{{field1}}', table_name='{{table_name}}')

    # Drop table
    op.drop_table('{{table_name}}')
```

## Field Type Mapping

### Python to PostgreSQL Types

| Python Type | SQLModel Field | PostgreSQL Type | Use Case |
|-------------|----------------|-----------------|----------|
| `int` | `Field()` | `INTEGER` | IDs, counters |
| `str` | `Field(max_length=N)` | `VARCHAR(N)` | Text with limit |
| `str` | `Field()` (no max_length) | `TEXT` | Long text |
| `bool` | `Field()` | `BOOLEAN` | True/False flags |
| `datetime` | `Field()` | `TIMESTAMP` | Dates and times |
| `date` | `Field()` | `DATE` | Dates only |
| `float` | `Field()` | `DOUBLE PRECISION` | Decimals |
| `Decimal` | `Field()` | `NUMERIC` | Money, precise decimals |
| `UUID` | `Field(default_factory=uuid4)` | `UUID` | Unique identifiers |
| `Optional[T]` | `Field(default=None)` | `T NULL` | Nullable fields |
| `List[T]` | N/A (relationship) | N/A | One-to-many |
| `Enum` | `Field()` with enum | `VARCHAR` or `ENUM` | Fixed choices |

### Common Field Constraints

```python
# Required field
field: str = Field(nullable=False)

# Optional field
field: Optional[str] = Field(default=None)

# Unique field
email: str = Field(unique=True)

# Indexed field (for faster queries)
username: str = Field(index=True)

# Max length
title: str = Field(max_length=255)

# Numeric constraints
age: int = Field(ge=0, le=150)  # Greater/equal, less/equal
price: float = Field(gt=0)  # Greater than

# Default value
status: str = Field(default="pending")

# Auto-generated UUID
id: UUID = Field(default_factory=uuid4, primary_key=True)

# Timestamp with auto-update
updated_at: datetime = Field(
    default_factory=datetime.utcnow,
    sa_column_kwargs={"onupdate": datetime.utcnow}
)
```

## Tool Usage

### Required Tools

**Read**: Load database specifications
- `Read(@specs/database/schema.md)` - Schema specifications
- `Read(@specs/features/<feature>/spec.md)` - Feature data requirements
- `Read(Backend/app/models/*.py)` - Existing models

**Glob**: Discover existing models
- `Glob(Backend/app/models/*.py)` - Find all model files
- `Glob(Backend/alembic/versions/*.py)` - Find migrations

**Grep**: Search for patterns
- `Grep("class.*SQLModel")` - Find existing models
- `Grep("__tablename__.*todos")` - Check if table exists

**Write**: Create new models
- `Write(Backend/app/models/<model>.py)` - New model file

**Edit**: Update existing models
- `Edit(Backend/app/models/<model>.py)` - Modify model

**Bash**: Generate migrations
- `Bash("cd Backend && alembic revision --autogenerate -m 'description'")` - Create migration
- `Bash("cd Backend && alembic upgrade head")` - Apply migration

### Tool Workflow

**Create New Model**:
```
1. Read(@specs/database/schema.md) - Get specification
2. Glob(Backend/app/models/*.py) - Check existing models
3. Write(Backend/app/models/<model>.py) - Generate model
4. Bash("alembic revision --autogenerate -m 'Add <model> table'") - Create migration
```

**Update Existing Model**:
```
1. Read(Backend/app/models/<model>.py) - Get current model
2. Read(@specs/database/schema.md) - Get updated spec
3. Edit(Backend/app/models/<model>.py) - Update model
4. Bash("alembic revision --autogenerate -m 'Update <model> table'") - Create migration
```

## Decision Points

### Primary Key Strategy

**Auto-increment Integer** (Recommended for most cases):
```python
id: int = Field(default=None, primary_key=True)
```
- Simple, fast, space-efficient
- Sequential IDs
- Use when: Standard CRUD operations

**UUID** (Use for distributed systems):
```python
from uuid import UUID, uuid4
id: UUID = Field(default_factory=uuid4, primary_key=True)
```
- Globally unique
- No sequence issues in distributed systems
- Use when: Multi-database sync, security (non-sequential)

### Timestamp Strategy

**UTC Timestamps** (Recommended):
```python
from datetime import datetime

created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
updated_at: datetime = Field(
    default_factory=datetime.utcnow,
    sa_column_kwargs={"onupdate": datetime.utcnow}
)
```
- Always use UTC for consistency
- Convert to user timezone in frontend
- Auto-update on record modification

### Soft Delete vs Hard Delete

**Hard Delete** (Default):
- Permanently remove records
- Use when: Data can be safely deleted

**Soft Delete** (Add deleted_at field):
```python
deleted_at: Optional[datetime] = Field(default=None)
```
- Mark as deleted instead of removing
- Use when: Audit trail needed, undo delete functionality
- Filter out deleted records in queries: `WHERE deleted_at IS NULL`

### Relationship Strategy

**One-to-Many** (Most common):
```python
# Parent model
children: List["Child"] = Relationship(back_populates="parent")

# Child model
parent_id: int = Field(foreign_key="parents.id")
parent: Optional["Parent"] = Relationship(back_populates="children")
```

**Many-to-Many** (Requires association table):
```python
# Association table
class ItemTag(SQLModel, table=True):
    item_id: int = Field(foreign_key="items.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

# Both models
tags: List["Tag"] = Relationship(back_populates="items", link_model=ItemTag)
```

### Index Strategy

**Single-column index**:
```python
email: str = Field(index=True, unique=True)
```
- Use for: Frequently queried columns, foreign keys

**Composite index**:
```python
__table_args__ = (
    Index('idx_user_status_date', 'user_id', 'status', 'created_at'),
)
```
- Use for: Multi-column WHERE clauses, common query patterns

## Acceptance Criteria

Every generated model must:
- [ ] Have a primary key (id)
- [ ] Include created_at and updated_at timestamps
- [ ] Use proper field types (str, int, datetime, etc.)
- [ ] Define max_length for string fields
- [ ] Specify nullable=False for required fields
- [ ] Include foreign keys for relationships
- [ ] Define Relationship() for both sides of FK
- [ ] Add indexes for frequently queried fields
- [ ] Use TYPE_CHECKING for circular imports
- [ ] Include docstrings explaining the model
- [ ] Have a Config.json_schema_extra example
- [ ] Follow SQLModel best practices

## Validation Checklist

Before finalizing model code, verify:

### 1. Field Definitions
- [ ] All fields have correct types
- [ ] String fields have max_length
- [ ] Required fields have nullable=False
- [ ] Optional fields use Optional[T]
- [ ] Default values are appropriate

### 2. Relationships
- [ ] Foreign keys reference correct tables
- [ ] Relationship() defined on both sides
- [ ] back_populates matches field names
- [ ] CASCADE behavior considered for deletes
- [ ] TYPE_CHECKING used to avoid circular imports

### 3. Constraints
- [ ] Primary key defined
- [ ] Unique constraints where needed
- [ ] Check constraints for validation
- [ ] Default values set appropriately

### 4. Indexes
- [ ] Foreign keys indexed
- [ ] Frequently queried fields indexed
- [ ] Composite indexes for multi-column queries
- [ ] Unique indexes for uniqueness constraints

### 5. Timestamps
- [ ] created_at with default_factory
- [ ] updated_at with onupdate
- [ ] Both use datetime.utcnow
- [ ] Both are nullable=False

### 6. Documentation
- [ ] Model docstring explains purpose
- [ ] Attributes documented
- [ ] Relationships documented
- [ ] Example in Config.json_schema_extra

### 7. Migration
- [ ] Alembic migration generated
- [ ] Migration reviewed for correctness
- [ ] Both upgrade() and downgrade() defined
- [ ] Indexes included in migration

## Examples

### Example 1: User and Todo Models

**Input Spec**:
```markdown
# Database Schema: User Management

## Users Table
- id (primary key)
- email (unique, required)
- hashed_password (required)
- name (optional)
- is_active (default: true)
- created_at, updated_at

## Todos Table
- id (primary key)
- user_id (foreign key to users)
- title (required, max 255)
- description (optional, max 1000)
- status (pending/in_progress/completed)
- due_date (optional)
- completed_at (optional)
- created_at, updated_at

Relationships:
- One user has many todos
- Each todo belongs to one user
```

**Generated Models**: (See Templates 3 and 4 above)

### Example 2: Many-to-Many Tags

**Input Spec**:
```markdown
# Database Schema: Tags

## Tags Table
- id (primary key)
- name (unique, required)
- color (optional, hex code)

## Todo_Tags Association
- todo_id (FK to todos)
- tag_id (FK to tags)
- Primary key: (todo_id, tag_id)

Relationships:
- Todos can have many tags
- Tags can be applied to many todos
```

**Generated Model**: (See Template 5 above)

## Advanced Patterns

### Pattern 1: Enum Fields

```python
from enum import Enum

class TodoPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Todo(SQLModel, table=True):
    priority: str = Field(
        default=TodoPriority.MEDIUM.value,
        max_length=20
    )
```

### Pattern 2: JSON Fields (PostgreSQL)

```python
from typing import Dict, Any
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSON

class Todo(SQLModel, table=True):
    metadata_json: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
```

### Pattern 3: Computed Fields

```python
from sqlmodel import computed_field

class Todo(SQLModel, table=True):
    title: str
    description: Optional[str]

    @computed_field
    @property
    def is_overdue(self) -> bool:
        """Check if todo is past due date"""
        if self.due_date and self.status != "completed":
            return datetime.utcnow() > self.due_date
        return False
```

### Pattern 4: Cascade Delete

```python
class User(SQLModel, table=True):
    todos: List["Todo"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class Todo(SQLModel, table=True):
    user_id: int = Field(
        foreign_key="users.id",
        sa_column_kwargs={"ondelete": "CASCADE"}
    )
```

### Pattern 5: Unique Constraint (Composite)

```python
from sqlalchemy import UniqueConstraint

class TodoTag(SQLModel, table=True):
    todo_id: int = Field(foreign_key="todos.id")
    tag_id: int = Field(foreign_key="tags.id")

    __table_args__ = (
        UniqueConstraint('todo_id', 'tag_id', name='uq_todo_tag'),
    )
```

## Integration Points

**Works with**:
- API Endpoint Generator → Uses these models in endpoints
- Backend Dev Agent → Imports models for business logic
- Auth Integration Agent → Uses User model for authentication
- Frontend Component Generator → Matches model fields in forms

**Workflow**:
1. **This skill generates models**
2. Create migration with Alembic
3. Apply migration to database
4. Backend uses models in API endpoints
5. Frontend consumes data from APIs

## Best Practices

### Model Design
1. **Always include timestamps**: created_at, updated_at
2. **Use foreign keys with indexes**: Faster joins
3. **Define both sides of relationships**: Easier navigation
4. **Use TYPE_CHECKING**: Avoid circular imports
5. **Add docstrings**: Explain model purpose
6. **Include examples**: Config.json_schema_extra

### Field Types
1. **Use max_length for strings**: Prevent unbounded growth
2. **Use Optional[T] for nullable**: Clear intent
3. **Use Enum for fixed choices**: Type safety
4. **Use datetime for timestamps**: Not strings
5. **Use Decimal for money**: Precision matters

### Indexes
1. **Index foreign keys**: Always
2. **Index frequently queried fields**: email, username, status
3. **Composite indexes for common queries**: user_id + created_at
4. **Don't over-index**: Slows writes

### Relationships
1. **back_populates both sides**: Consistency
2. **Consider cascade behavior**: What happens on delete?
3. **Use lazy loading wisely**: Performance implications
4. **Many-to-many needs link model**: Association table

### Migrations
1. **Review auto-generated migrations**: Check accuracy
2. **Add data migrations if needed**: Populate new fields
3. **Test rollback**: downgrade() should work
4. **Version control migrations**: Commit to git

## Common Pitfalls

### ❌ Missing max_length
```python
# Bad: Unbounded string
title: str
```
```python
# Good: Limited string
title: str = Field(max_length=255)
```

### ❌ Circular Import
```python
# Bad: Direct import
from .user import User

class Todo(SQLModel, table=True):
    user: User
```
```python
# Good: TYPE_CHECKING
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .user import User

class Todo(SQLModel, table=True):
    user: Optional["User"] = Relationship(...)
```

### ❌ Missing Indexes
```python
# Bad: No index on FK
user_id: int = Field(foreign_key="users.id")
```
```python
# Good: Indexed FK
user_id: int = Field(foreign_key="users.id", index=True)
```

### ❌ Inconsistent Timestamps
```python
# Bad: Using datetime.now()
created_at: datetime = Field(default=datetime.now())
```
```python
# Good: Using default_factory
created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- SQLModel class templates
- Alembic migration patterns
- Relationship examples (one-to-many, many-to-many)
- Field type mapping
- Index and constraint patterns
- User and Todo model examples
- Best practices and common pitfalls
