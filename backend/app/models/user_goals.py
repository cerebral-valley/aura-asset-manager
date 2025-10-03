"""
User Goals model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class UserGoal(Base):
    """User Goal model."""
    
    __tablename__ = "user_goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(String, nullable=False)  # 'net worth', 'asset', 'expense', 'income'
    title = Column(String, nullable=False)
    target_amount = Column(Numeric(18, 2), nullable=False)
    target_date = Column(Date, nullable=True)
    allocate_amount = Column(Numeric(18, 2), default=0)
    goal_completed = Column(Boolean, default=False)
    completed_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserGoal(id={self.id}, title={self.title}, type={self.goal_type}, completed={self.goal_completed})>"
