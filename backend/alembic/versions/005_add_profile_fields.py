"""Add profile fields to users table

Revision ID: 005_add_profile_fields
Revises: 004_add_user_settings_to_users
Create Date: 2025-09-05

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005_add_profile_fields'
down_revision = '004_add_user_settings_to_users'
branch_labels = None
depends_on = None


def upgrade():
    # Add profile fields to users table
    op.add_column('users', sa.Column('full_name', sa.String(200), nullable=True))
    op.add_column('users', sa.Column('marital_status', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('gender', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('date_of_birth', sa.Date(), nullable=True))
    op.add_column('users', sa.Column('children', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('dependents', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('pin_code', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('nationality', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('annual_income', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('occupation', sa.String(100), nullable=True))


def downgrade():
    # Remove profile fields from users table
    op.drop_column('users', 'occupation')
    op.drop_column('users', 'annual_income')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'nationality')
    op.drop_column('users', 'state')
    op.drop_column('users', 'pin_code')
    op.drop_column('users', 'city')
    op.drop_column('users', 'dependents')
    op.drop_column('users', 'children')
    op.drop_column('users', 'date_of_birth')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'marital_status')
    op.drop_column('users', 'full_name')
