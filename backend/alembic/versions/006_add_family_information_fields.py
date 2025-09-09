"""Add family information fields to users table

Revision ID: 006_add_family_information_fields
Revises: 005_add_profile_fields
Create Date: 2025-01-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '006_add_family_information_fields'
down_revision = '005_add_profile_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add enhanced family information fields to users table
    op.add_column('users', sa.Column('partner', sa.Boolean(), default=False, nullable=True))
    op.add_column('users', sa.Column('partner_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('elderly_dependents', sa.Integer(), default=0, nullable=True))
    op.add_column('users', sa.Column('children_age_groups', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('emergency_contact_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('emergency_contact_phone', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('risk_appetite', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('phone_number', sa.String(50), nullable=True))


def downgrade():
    # Remove enhanced family information fields from users table
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'risk_appetite') 
    op.drop_column('users', 'emergency_contact_phone')
    op.drop_column('users', 'emergency_contact_name')
    op.drop_column('users', 'children_age_groups')
    op.drop_column('users', 'elderly_dependents')
    op.drop_column('users', 'partner_name')
    op.drop_column('users', 'partner')
