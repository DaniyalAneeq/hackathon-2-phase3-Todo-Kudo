"""Update tasks user_id for Better Auth integration

Revision ID: 8b4c6d7e0f2a
Revises: 7a3b5c8d9e1f
Create Date: 2026-01-02 12:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8b4c6d7e0f2a'
down_revision: Union[str, Sequence[str], None] = '7a3b5c8d9e1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Update tasks.user_id to reference Better Auth user table."""
    # Change user_id column type from VARCHAR(255) to UUID to match neon_auth.user.id
    op.execute("ALTER TABLE tasks ALTER COLUMN user_id TYPE UUID USING user_id::uuid;")

    # Add the foreign key constraint to reference neon_auth.user(id)
    op.create_foreign_key(
        'fk_tasks_user_id',  # constraint name
        'tasks',              # source table
        'user',               # target table
        ['user_id'],          # source columns
        ['id'],               # target columns
        source_schema='public',
        referent_schema='neon_auth'
    )


def downgrade() -> None:
    """Remove foreign key constraint and revert column type."""
    # Drop foreign key constraint
    op.drop_constraint('fk_tasks_user_id', 'tasks', type_='foreignkey')

    # Revert user_id column type back to VARCHAR(255)
    op.execute("ALTER TABLE tasks ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;")
