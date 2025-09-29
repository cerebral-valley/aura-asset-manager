"""
UserGoal model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, Date, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class UserGoal(Base):
    """User financial goal model."""
    
    __tablename__ = "user_goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_type = Column(String(50), nullable=False)  # 'net_worth' or 'custom'
    title = Column(String(255), nullable=False)
    target_amount = Column(Numeric(15, 2), nullable=False)
    target_date = Column(Date, nullable=True)
    goal_completed = Column(Boolean, default=False)
    completed_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="goals")
    
    def __repr__(self):
        return f"<UserGoal(id={self.id}, title={self.title}, type={self.goal_type})>"