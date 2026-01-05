"""Truncate demo tasks

Revision ID: 7a3b5c8d9e1f
Revises: 6cfdd4125f8d
Create Date: 2026-01-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a3b5c8d9e1f'
down_revision: Union[str, Sequence[str], None] = '6cfdd4125f8d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Truncate all existing demo tasks."""
    # Delete all tasks with demo user IDs
    op.execute("TRUNCATE TABLE tasks;")


def downgrade() -> None:
    """Downgrade: Cannot restore deleted data."""
    # Cannot restore data once truncated
    pass
