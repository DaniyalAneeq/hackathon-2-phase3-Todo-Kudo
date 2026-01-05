"""Add jwks table for Better Auth JWT plugin

Revision ID: 9c5d7e8f1g3b
Revises: 8b4c6d7e0f2a
Create Date: 2026-01-03 05:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c5d7e8f1g3b'
down_revision: Union[str, Sequence[str], None] = '8b4c6d7e0f2a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create jwks table in neon_auth schema for Better Auth JWT plugin.

    This table stores JSON Web Key Sets for JWT token signing and verification.
    Using RS256 (RSA with SHA-256) for compatibility with python-jose on the backend.
    """
    op.execute("""
        CREATE TABLE IF NOT EXISTS neon_auth.jwks (
            id TEXT PRIMARY KEY,
            "publicKey" TEXT NOT NULL,
            "privateKey" TEXT NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
            "expiresAt" TIMESTAMP
        );
    """)


def downgrade() -> None:
    """Drop jwks table from neon_auth schema."""
    op.execute("DROP TABLE IF EXISTS neon_auth.jwks;")
