"""
Transaction model for SQLAlchemy.
"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Transaction(Base):
    """Transaction model."""
    
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(Text, nullable=False)  # e.g., 'create', 'sale', 'update_market_value', etc.
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    amount = Column(Numeric(18, 2))  # Monetary amount involved
    quantity_change = Column(Numeric(18, 4))  # Change in quantity (positive for purchase, negative for sale)
    notes = Column(Text)
    transaction_metadata = Column(JSONB)  # Flexible JSON field for transaction-specific details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    modified_at = Column(DateTime(timezone=True), nullable=True)
    
    # NEW FIELDS - Added to match Supabase structure and frontend requirements
    asset_name = Column(Text)  # Asset name at time of transaction
    asset_type = Column(Text)  # Asset type at time of transaction  
    acquisition_value = Column(Numeric(18, 2))  # Original purchase value
    current_value = Column(Numeric(18, 2))  # Current/updated value
    quantity = Column(Numeric(18, 4))  # Absolute quantity (not change)
    unit_of_measure = Column(Text)  # Units (shares, oz, sqft, etc.)
    custom_properties = Column(Text)  # Free-form custom properties
    asset_description = Column(Text)  # Asset description
    
    # Relationships
    asset = relationship("Asset", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.transaction_type}, asset_name={self.asset_name})>"

