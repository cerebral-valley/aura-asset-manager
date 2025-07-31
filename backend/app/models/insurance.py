"""
Insurance model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class InsurancePolicy(Base):
    """Insurance Policy model."""
    
    __tablename__ = "insurance_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_name = Column(Text, nullable=False)
    policy_type = Column(Text, nullable=False)  # e.g., 'life', 'health', 'auto', 'home', 'loan'
    provider = Column(Text)
    policy_number = Column(Text)
    coverage_amount = Column(Numeric(18, 2), nullable=False)
    premium_amount = Column(Numeric(18, 2))
    premium_frequency = Column(Text)  # e.g., 'monthly', 'annually'
    start_date = Column(Date)
    end_date = Column(Date)
    renewal_date = Column(Date)
    notes = Column(Text)
    policy_metadata = Column('metadata', JSONB)  # Map to 'metadata' column in DB but use different attribute name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status = Column(Text, default='active')  # e.g., 'active', 'expired', 'cancelled'
    
    def __repr__(self):
        return f"<InsurancePolicy(id={self.id}, name={self.policy_name}, type={self.policy_type})>"

