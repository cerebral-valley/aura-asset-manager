from sqlalchemy import Column, String, Numeric, Date, Boolean, Integer, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class PaymentSchedule(Base):
    __tablename__ = "payment_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    related_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    related_type = Column(String, nullable=False)  # 'asset' or 'insurance_policy'
    schedule_type = Column(String, nullable=False)  # 'payment_out', 'payment_in', 'premium'
    amount = Column(Numeric(18, 2), nullable=False)
    frequency = Column(String, nullable=False)  # 'monthly', 'quarterly', 'semi-annually', 'annually'
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # NULL for lifetime annuities
    next_payment_date = Column(Date, nullable=True)
    total_payments_made = Column(Integer, default=0)
    total_amount_paid = Column(Numeric(18, 2), default=0)
    is_active = Column(Boolean, default=True)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
