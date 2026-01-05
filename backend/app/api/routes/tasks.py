"""
Task routes for CRUD operations
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.task import Task, TaskCreate, TaskUpdate, TaskResponse
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=dict)
async def list_tasks(
    session: Session = Depends(get_session),
    user_id_str: str = Depends(get_current_user)
):
    """
    List all tasks for the authenticated user

    Returns:
        dict with tasks array and total count
    """
    user_id = UUID(user_id_str)  # Convert string user_id from JWT to UUID for database query
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
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
