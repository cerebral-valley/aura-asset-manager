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
    transaction_type = Column(Text, nullable=False)  # e.g., 'purchase', 'sale', 'value_update', 'transfer', 'adjustment'
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    amount = Column(Numeric(18, 2))  # Monetary amount involved
    quantity_change = Column(Numeric(18, 4))  # Change in quantity (positive for purchase, negative for sale)
    notes = Column(Text)
    transaction_metadata = Column(JSONB)  # Flexible JSON field for transaction-specific details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    asset = relationship("Asset", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.transaction_type}, amount={self.amount})>"

