"""add task attributes priority due_date category

Revision ID: df1e7b8409fc
Revises: 9c5d7e8f1g3b
Create Date: 2026-01-05 19:38:55.012168

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df1e7b8409fc'
down_revision: Union[str, Sequence[str], None] = '9c5d7e8f1g3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Add priority, due_date, and category columns to tasks table."""
    # Add new columns with appropriate defaults for backward compatibility
    op.add_column('tasks', sa.Column('priority', sa.String(length=10), server_default='medium', nullable=False))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('category', sa.String(length=100), nullable=True))

    # Create indexes for future sorting/filtering features
    op.create_index('ix_tasks_priority', 'tasks', ['priority'], unique=False)
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'], unique=False)
    op.create_index('ix_tasks_category', 'tasks', ['category'], unique=False)


def downgrade() -> None:
    """Downgrade schema: Remove priority, due_date, and category columns from tasks table."""
    # Drop indexes first
    op.drop_index('ix_tasks_category', table_name='tasks')
    op.drop_index('ix_tasks_due_date', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')

    # Drop columns
    op.drop_column('tasks', 'category')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
