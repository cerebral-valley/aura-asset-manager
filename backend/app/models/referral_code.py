"""
Referral code model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class ReferralCode(Base):
    """Referral codes that can be claimed by users."""

    __tablename__ = "referral_codes"

    code = Column(String(10), primary_key=True)
    assigned_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=True)
    assigned_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    claimed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<ReferralCode(code={self.code}, assigned_user_id={self.assigned_user_id})>"
