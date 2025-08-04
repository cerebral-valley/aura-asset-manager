"""Add user settings fields to users table

Revision ID: 004_add_user_settings_to_users
Revises: 003_user_settings
Create Date: 2025-08-04 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_add_user_settings_to_users'
down_revision = '003_user_settings'
branch_labels = None
depends_on = None

def upgrade():
    """Add user settings columns to the users table."""
    # Add the new columns to the users table
    op.add_column('users', sa.Column('first_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('recovery_email', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('currency', sa.String(length=10), nullable=True, default='USD'))
    op.add_column('users', sa.Column('date_format', sa.String(length=20), nullable=True, default='MM/DD/YYYY'))
    op.add_column('users', sa.Column('dark_mode', sa.Boolean(), nullable=True, default=False))

def downgrade():
    """Remove user settings columns from the users table."""
    op.drop_column('users', 'dark_mode')
    op.drop_column('users', 'date_format')
    op.drop_column('users', 'currency')
    op.drop_column('users', 'country')
    op.drop_column('users', 'recovery_email')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
