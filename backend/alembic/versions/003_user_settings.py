"""Create user_settings table

Revision ID: 003_user_settings
Revises: 
Create Date: 2025-08-04

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_user_settings'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create user_settings table
    op.create_table('user_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('last_name', sa.String(length=100), nullable=True),
        sa.Column('username', sa.String(length=100), nullable=True),
        sa.Column('recovery_email', sa.String(length=255), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('currency', sa.String(length=10), nullable=True),
        sa.Column('date_format', sa.String(length=20), nullable=True),
        sa.Column('dark_mode', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

def downgrade():
    op.drop_table('user_settings')
