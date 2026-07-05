"""remove venue flat pricing and add to timeslots

Revision ID: 7b701ac14929
Revises: 0643468ea00c
Create Date: 2026-07-04 11:32:23.097544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b701ac14929'
down_revision: Union[str, Sequence[str], None] = '0643468ea00c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop columns from venues table
    op.drop_column('venues', 'price_per_day')
    op.drop_column('venues', 'price_per_hour')

    # Add columns to time_slots table
    op.add_column('time_slots', sa.Column('price_per_day', sa.Float(), nullable=True))
    op.add_column('time_slots', sa.Column('price_per_hour', sa.Float(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove columns from time_slots table
    op.drop_column('time_slots', 'price_per_day')
    op.drop_column('time_slots', 'price_per_hour')

    # Add columns back to venues table
    op.add_column('venues', sa.Column('price_per_day', sa.Float(), nullable=True))
    op.add_column('venues', sa.Column('price_per_hour', sa.Float(), nullable=True))
