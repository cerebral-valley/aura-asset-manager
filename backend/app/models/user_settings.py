"""
User settings model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class UserSettings(Base):
    """User settings model."""
    
    __tablename__ = "user_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Personal information
    first_name = Column(String(100))
    last_name = Column(String(100))
    username = Column(String(100))
    recovery_email = Column(String(255))
    country = Column(String(100))
    
    # Preferences
    currency = Column(String(10), default="USD")
    date_format = Column(String(20), default="MM/DD/YYYY")
    dark_mode = Column(Boolean, default=False)
    theme = Column(String(20), default="default")
    font_preference = Column(String(30), default="guardian_mono")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserSettings(user_id={self.user_id}, currency={self.currency})>"
