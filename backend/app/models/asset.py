"""
Asset model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, Date, ForeignKey, Numeric, Boolean
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
    
    # Annuity-specific fields
    annuity_type = Column(Text)  # 'fixed', 'variable', 'indexed', 'immediate', 'deferred'
    purchase_amount = Column(Numeric(18, 2))  # Initial lump sum paid for annuity
    guaranteed_rate = Column(Numeric(5, 4))  # For fixed annuities (stored as decimal, e.g., 0.0525 for 5.25%)
    accumulation_phase_end = Column(Date)  # When annuity payments start
    has_payment_schedule = Column(Boolean, default=False)
    
    # Asset selection fields for targets functionality
    liquid_assets = Column(Boolean, default=False)  # Whether this asset can be used in liquid calculations
    is_selected = Column(Boolean, default=False)  # Whether this asset is currently selected for targets
    
    asset_metadata = Column("metadata", JSONB)  # Flexible JSON field for asset-specific characteristics
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    modified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="asset", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Asset(id={self.id}, name={self.name}, type={self.asset_type})>"

