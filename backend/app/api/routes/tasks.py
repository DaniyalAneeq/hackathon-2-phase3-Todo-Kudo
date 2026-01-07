"""
Task routes for CRUD operations
"""
from typing import List, Literal, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import case

from app.core.database import get_session
from app.models.task import Task, TaskCreate, TaskUpdate, TaskResponse
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=dict)
async def list_tasks(
    search: Optional[str] = Query(None, max_length=255),
    sort_by: Literal["created_at", "due_date", "priority"] = Query("created_at"),
    order: Literal["asc", "desc"] = Query("desc"),
    priority: Optional[Literal["low", "medium", "high"]] = Query(None),
    category: Optional[str] = Query(None, max_length=100),
    session: Session = Depends(get_session),
    user_id_str: str = Depends(get_current_user)
):
    """
    List all tasks for the authenticated user with optional filtering and sorting

    Query Parameters:
        search: Filter by title OR description (case-insensitive)
        sort_by: Sort field (created_at, due_date, priority)
        order: Sort order (asc, desc)
        priority: Filter by exact priority (low, medium, high)
        category: Filter by exact category

    Returns:
        dict with tasks array and total count
    """
    user_id = UUID(user_id_str)  # Convert string user_id from JWT to UUID for database query

    # Start with base query (user isolation)
    statement = select(Task).where(Task.user_id == user_id)

    # Apply search filter (title OR description)
    if search:
        search_pattern = f"%{search}%"
        statement = statement.where(
            (Task.title.ilike(search_pattern)) |
            (Task.description.ilike(search_pattern))
        )

    # Apply priority filter
    if priority:
        statement = statement.where(Task.priority == priority)

    # Apply category filter
    if category:
        statement = statement.where(Task.category == category)

    # Apply sorting
    if sort_by == "priority":
        # Map text priorities to numeric for sorting
        priority_order = case(
            (Task.priority == "high", 3),
            (Task.priority == "medium", 2),
            (Task.priority == "low", 1),
            else_=0
        )
        order_expr = priority_order.desc() if order == "desc" else priority_order.asc()
    elif sort_by == "due_date":
        # Nulls always last per spec
        order_expr = Task.due_date.asc().nullslast() if order == "asc" else Task.due_date.desc().nullslast()
    else:  # created_at (default)
        order_expr = Task.created_at.desc() if order == "desc" else Task.created_at.asc()

    statement = statement.order_by(order_expr)

    # Execute query
    tasks = session.exec(statement).all()

    return {
        "tasks": tasks,
        "total": len(tasks)
    }


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    user_id_str: str = Depends(get_current_user)
):
    """
    Create a new task for the authenticated user

    Args:
        task_data: Task creation data

    Returns:
        Created task
    """
    user_id = UUID(user_id_str)  # Convert string user_id from JWT to UUID for database
    task = Task(**task_data.model_dump(), user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    user_id_str: str = Depends(get_current_user)
):
    """
    Update a task (partial update)

    Args:
        task_id: ID of task to update
        task_data: Fields to update

    Returns:
        Updated task
    """
    user_id = UUID(user_id_str)  # Convert string user_id from JWT to UUID
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    from datetime import datetime
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    user_id_str: str = Depends(get_current_user)
):
    """
    Delete a task

    Args:
        task_id: ID of task to delete
    """
    user_id = UUID(user_id_str)  # Convert string user_id from JWT to UUID
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    session.delete(task)
    session.commit()
