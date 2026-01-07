"""
Task SQLModel for database schema and API responses
"""
from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from sqlmodel import Field, SQLModel

# Type alias for priority enum
PriorityLevel = Literal["low", "medium", "high"]


class TaskBase(SQLModel):
    """Base task fields shared across models"""
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    # NEW FIELDS: Task attributes (priority, due_date, category)
    priority: str = Field(default="medium", max_length=10)
    due_date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)


class Task(TaskBase, table=True):
    """Task database model"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(index=True)  # UUID type to match database column (altered in migration 8b4c6d7e0f2a)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    # Override priority type to use Literal for validation
    priority: Optional[PriorityLevel] = "medium"  # type: ignore
    due_date: Optional[datetime] = None
    category: Optional[str] = None


class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(default=None, max_length=255, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: Optional[bool] = Field(default=None)
    # NEW FIELDS: All optional for partial updates (backward compatibility)
    priority: Optional[PriorityLevel] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)


class TaskResponse(TaskBase):
    """Schema for task API responses"""
    id: int
    user_id: UUID  # UUID type to match database and Task model
    created_at: datetime
    updated_at: datetime
