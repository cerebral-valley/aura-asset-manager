"""
Target model for financial goal tracking.
"""

from sqlalchemy import Column, String, DateTime, Text, Date, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Target(Base):
    """Target/Goal model for tracking financial aspirations."""
    
    __tablename__ = "targets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    target_amount = Column(Numeric(18, 2), nullable=False)
    target_date = Column(Date)
    status = Column(String(50), default="active")  # 'active', 'completed', 'paused', 'archived'
    target_type = Column(String(50), default="custom")  # 'net_worth', 'custom'
    description = Column(Text)
    
    # Allocation metadata
    total_allocated_amount = Column(Numeric(18, 2), default=0)  # Cached for performance
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    allocations = relationship("TargetAllocation", back_populates="target", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Target(id={self.id}, name={self.name}, type={self.target_type})>"


class TargetAllocation(Base):
    """Allocation of specific liquid assets to targets."""
    
    __tablename__ = "target_allocations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_id = Column(UUID(as_uuid=True), ForeignKey("targets.id", ondelete="CASCADE"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    allocation_amount = Column(Numeric(18, 2), nullable=False)  # Absolute dollar amount allocated
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    target = relationship("Target", back_populates="allocations")
    asset = relationship("Asset")
    
    def __repr__(self):
        return f"<TargetAllocation(target_id={self.target_id}, asset_id={self.asset_id}, amount={self.allocation_amount})>"

# Note: UserAssetSelection model removed - asset selection now handled via assets.is_selected column