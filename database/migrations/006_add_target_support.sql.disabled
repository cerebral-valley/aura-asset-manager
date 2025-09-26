"""Add target tracking tables

Revision ID: 006_add_target_support
Revises: 005_add_user_code
Create Date: 2025-09-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '006_add_target_support'
down_revision = '005_add_user_code'
branch_labels = None
depends_on = None

def upgrade():
    # Create targets table
    op.create_table('targets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('target_amount', sa.Numeric(precision=18, scale=2), nullable=False),
        sa.Column('target_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('target_type', sa.String(length=50), nullable=False, server_default='custom'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('total_allocated_amount', sa.Numeric(precision=18, scale=2), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create target_allocations table
    op.create_table('target_allocations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('target_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('allocation_amount', sa.Numeric(precision=18, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['target_id'], ['targets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('target_id', 'asset_id', name='uq_target_asset_allocation')
    )
    
    # Create user_asset_selections table
    op.create_table('user_asset_selections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('asset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_selected', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'asset_id', name='uq_user_asset_selection')
    )
    
    # Create indexes for better performance
    op.create_index('ix_targets_user_id', 'targets', ['user_id'])
    op.create_index('ix_targets_status', 'targets', ['status'])
    op.create_index('ix_targets_target_type', 'targets', ['target_type'])
    op.create_index('ix_target_allocations_target_id', 'target_allocations', ['target_id'])
    op.create_index('ix_target_allocations_asset_id', 'target_allocations', ['asset_id'])
    op.create_index('ix_user_asset_selections_user_id', 'user_asset_selections', ['user_id'])
    op.create_index('ix_user_asset_selections_asset_id', 'user_asset_selections', ['asset_id'])

def downgrade():
    # Drop indexes
    op.drop_index('ix_user_asset_selections_asset_id', table_name='user_asset_selections')
    op.drop_index('ix_user_asset_selections_user_id', table_name='user_asset_selections')
    op.drop_index('ix_target_allocations_asset_id', table_name='target_allocations')
    op.drop_index('ix_target_allocations_target_id', table_name='target_allocations')
    op.drop_index('ix_targets_target_type', table_name='targets')
    op.drop_index('ix_targets_status', table_name='targets')
    op.drop_index('ix_targets_user_id', table_name='targets')
    
    # Drop tables
    op.drop_table('user_asset_selections')
    op.drop_table('target_allocations')
    op.drop_table('targets')