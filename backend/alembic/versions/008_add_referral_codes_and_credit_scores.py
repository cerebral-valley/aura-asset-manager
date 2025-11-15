"""Add referral code table and credit score fields

Revision ID: 008_add_referral_codes_and_credit_scores
Revises: 007_add_asset_document_fields
Create Date: 2025-11-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime
import random
import string


# revision identifiers, used by Alembic.
revision = '008_add_referral_codes_and_credit_scores'
down_revision = '007_add_asset_document_fields'
branch_labels = None
depends_on = None


def _add_column(batch_op, column):
    """Safely add a column if it doesn't already exist."""
    try:
        batch_op.add_column(column)
    except Exception:
        # Column already exists
        pass


def upgrade():
    """Add referral fields, credit score metadata, and seed codes."""
    with op.batch_alter_table('users') as batch_op:
        _add_column(batch_op, sa.Column('font_preference', sa.String(length=30), nullable=True, server_default=sa.text("'guardian_mono'")))
        _add_column(batch_op, sa.Column('credit_score_provider', sa.String(length=50), nullable=True))
        _add_column(batch_op, sa.Column('credit_score_value', sa.Integer(), nullable=True))
        _add_column(batch_op, sa.Column('credit_score_last_checked', sa.Date(), nullable=True))
        _add_column(batch_op, sa.Column('referral_code', sa.String(length=10), nullable=True))
        try:
            batch_op.create_unique_constraint('uq_users_referral_code', ['referral_code'])
        except Exception:
            pass

    op.create_table(
        'referral_codes',
        sa.Column('code', sa.String(length=10), primary_key=True),
        sa.Column('assigned_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), unique=True, nullable=True),
        sa.Column('assigned_email', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('claimed_at', sa.DateTime(timezone=True), nullable=True),
    )

    try:
        op.create_index('ix_referral_codes_assigned_email', 'referral_codes', ['assigned_email'])
    except Exception:
        pass

    # Seed 100 unique referral codes for onboarding
    conn = op.get_bind()
    existing = conn.execute(sa.text("SELECT COUNT(*) FROM referral_codes")).scalar()
    if existing == 0:
        rng = random.SystemRandom()
        alphabet = string.ascii_uppercase + string.digits
        codes = set()
        while len(codes) < 100:
            code = ''.join(rng.choice(alphabet) for _ in range(10))
            codes.add(code)

        referral_table = sa.table(
            'referral_codes',
            sa.column('code', sa.String(length=10)),
            sa.column('created_at', sa.DateTime(timezone=True)),
        )

        now = datetime.utcnow()
        op.bulk_insert(
            referral_table,
            [{'code': code, 'created_at': now} for code in sorted(codes)]
        )


def downgrade():
    """Revert referral code and credit score additions."""
    try:
        op.drop_index('ix_referral_codes_assigned_email', table_name='referral_codes')
    except Exception:
        pass

    op.drop_table('referral_codes')

    with op.batch_alter_table('users') as batch_op:
        try:
            batch_op.drop_constraint('uq_users_referral_code', type_='unique')
        except Exception:
            pass

        for column_name in ['referral_code', 'credit_score_last_checked', 'credit_score_value', 'credit_score_provider', 'font_preference']:
            try:
                batch_op.drop_column(column_name)
            except Exception:
                pass
