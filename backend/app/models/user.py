"""
User model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, Boolean, Date, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class User(Base):
    """User model."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    theme = Column(Text, default="sanctuary_builder")
    
    # User settings fields
    first_name = Column(String(100))
    last_name = Column(String(100))
    recovery_email = Column(String(255))
    country = Column(String(100))
    currency = Column(String(10), default="USD")
    date_format = Column(String(20), default="MM/DD/YYYY")
    dark_mode = Column(Boolean, default=False)
    
    # Profile fields
    full_name = Column(String(200))
    marital_status = Column(String(50))
    gender = Column(String(50))
    date_of_birth = Column(Date)
    children = Column(Integer)
    dependents = Column(Integer)
    city = Column(String(100))
    pin_code = Column(String(20))
    state = Column(String(100))
    nationality = Column(String(100))
    phone = Column(String(50))
    annual_income = Column(Text)  # Using Text to store Decimal as string
    occupation = Column(String(100))
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"

