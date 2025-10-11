"""Add document fields to assets table

Revision ID: 007_add_asset_document_fields
Revises: 006_add_family_information_fields
Create Date: 2025-01-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007_add_asset_document_fields'
down_revision = '006_add_family_information_fields'
branch_labels = None
depends_on = None


def upgrade():
    """Add document columns to assets table if they don't exist."""
    
    # Use batch_alter_table for better compatibility
    with op.batch_alter_table('assets') as batch_op:
        # Add document columns only if they don't exist
        try:
            batch_op.add_column(sa.Column('document_path', sa.String(500), nullable=True, comment='Path to uploaded document in storage'))
        except Exception:
            # Column might already exist
            pass
            
        try:
            batch_op.add_column(sa.Column('document_name', sa.String(255), nullable=True, comment='Original filename of uploaded document'))
        except Exception:
            pass
            
        try:
            batch_op.add_column(sa.Column('document_size', sa.Integer(), nullable=True, comment='Document size in bytes'))
        except Exception:
            pass
            
        try:
            batch_op.add_column(sa.Column('document_type', sa.String(10), nullable=True, comment='Document file extension (pdf, jpg, docx, etc.)'))
        except Exception:
            pass
            
        try:
            batch_op.add_column(sa.Column('document_uploaded_at', sa.DateTime(), nullable=True, comment='Timestamp when document was uploaded'))
        except Exception:
            pass
    
    # Create indexes for better query performance
    try:
        op.create_index('idx_assets_document_path', 'assets', ['document_path'])
    except Exception:
        # Index might already exist
        pass
        
    try:
        op.create_index('idx_assets_document_uploaded_at', 'assets', ['document_uploaded_at'])
    except Exception:
        pass


def downgrade():
    """Remove document columns from assets table."""
    
    # Drop indexes first
    try:
        op.drop_index('idx_assets_document_uploaded_at', table_name='assets')
    except Exception:
        pass
        
    try:
        op.drop_index('idx_assets_document_path', table_name='assets')
    except Exception:
        pass
    
    # Remove columns
    with op.batch_alter_table('assets') as batch_op:
        try:
            batch_op.drop_column('document_uploaded_at')
        except Exception:
            pass
            
        try:
            batch_op.drop_column('document_type')
        except Exception:
            pass
            
        try:
            batch_op.drop_column('document_size')
        except Exception:
            pass
            
        try:
            batch_op.drop_column('document_name')
        except Exception:
            pass
            
        try:
            batch_op.drop_column('document_path')
        except Exception:
            pass