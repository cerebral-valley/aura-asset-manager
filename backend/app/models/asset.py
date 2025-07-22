"""
Asset model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Asset(Base):
    """Asset model."""
    
    __tablename__ = "assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    asset_type = Column(Text, nullable=False)  # e.g., 'real_estate', 'stock', 'gold', 'cash', 'other'
    description = Column(Text)
    purchase_date = Column(Date)
    initial_value = Column(Numeric(18, 2))
    current_value = Column(Numeric(18, 2))
    quantity = Column(Numeric(18, 4))
    unit_of_measure = Column(Text)  # e.g., 'shares', 'oz', 'sqft', 'units'
    metadata = Column(JSONB)  # Flexible JSON field for asset-specific characteristics
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    transactions = relationship("Transaction", back_populates="asset", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Asset(id={self.id}, name={self.name}, type={self.asset_type})>"

