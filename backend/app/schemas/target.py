"""
Pydantic schemas for Target API endpoints.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import date, datetime
from uuid import UUID

# Base schemas
class TargetBase(BaseModel):
    """Base target schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    target_amount: Decimal = Field(..., gt=0)
    target_date: Optional[date] = None
    description: Optional[str] = None
    target_type: str = Field(default="custom", pattern="^(custom|net_worth)$")

class TargetCreate(TargetBase):
    """Schema for creating a new target."""
    pass

class TargetUpdate(BaseModel):
    """Schema for updating a target."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    target_amount: Optional[Decimal] = Field(None, gt=0)
    target_date: Optional[date] = None
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|completed|paused|archived)$")

class Target(TargetBase):
    """Schema for target response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    status: str
    total_allocated_amount: Decimal
    created_at: datetime
    updated_at: datetime

# Allocation schemas
class AllocationBase(BaseModel):
    """Base allocation schema."""
    allocation_amount: Decimal = Field(..., ge=0)

class AllocationCreate(AllocationBase):
    """Schema for creating allocations."""
    asset_id: UUID

class AllocationUpdate(AllocationBase):
    """Schema for updating allocations."""
    pass

class Allocation(AllocationBase):
    """Schema for allocation response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    target_id: UUID
    asset_id: UUID
    created_at: datetime
    updated_at: datetime

# Asset selection schemas
class AssetSelectionBase(BaseModel):
    """Base asset selection schema."""
    is_selected: bool = True

class AssetSelectionUpdate(AssetSelectionBase):
    """Schema for updating asset selection."""
    pass

class AssetSelection(AssetSelectionBase):
    """Schema for asset selection response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    asset_id: UUID
    created_at: datetime
    updated_at: datetime

# Liquid asset schemas
class LiquidAsset(BaseModel):
    """Schema for liquid asset with selection status."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    asset_type: str
    current_value: Decimal
    description: Optional[str] = None
    is_selected: bool = False

class LiquidAssetsResponse(BaseModel):
    """Response schema for liquid assets."""
    assets: List[LiquidAsset]
    total_selected_value: Decimal
    total_available_value: Decimal

# Batch update schemas
class AssetSelectionBatch(BaseModel):
    """Schema for batch updating asset selections."""
    asset_selections: Dict[str, bool]  # asset_id -> is_selected

class AllocationBatch(BaseModel):
    """Schema for batch updating target allocations."""
    allocations: Dict[str, Decimal]  # asset_id -> allocation_amount

# Progress calculation schemas
class TargetProgress(BaseModel):
    """Schema for target progress calculation."""
    target_id: UUID
    target_name: str
    target_amount: Decimal
    current_progress: Decimal
    progress_percentage: float
    allocated_amount: Decimal
    monthly_savings_needed: Optional[Decimal] = None
    months_remaining: Optional[int] = None
    status: str
    is_on_track: bool
    warning_message: Optional[str] = None

class NetWorthProgress(BaseModel):
    """Schema for net worth milestone progress."""
    current_net_worth: Decimal
    target_net_worth: Decimal
    progress_percentage: float
    monthly_growth_needed: Optional[Decimal] = None
    months_remaining: Optional[int] = None

class AllocationSummary(BaseModel):
    """Schema for allocation overview."""
    total_selected_assets: Decimal
    total_allocated: Decimal
    allocation_percentage: float
    available_for_allocation: Decimal
    warnings: List[str]
    recommendations: List[str]

class TargetCalculationsResponse(BaseModel):
    """Response schema for target calculations."""
    net_worth_progress: NetWorthProgress
    target_progress: List[TargetProgress]
    allocation_summary: AllocationSummary
    last_updated: datetime

# Complete target with allocations
class TargetWithAllocations(Target):
    """Target schema with allocation details."""
    allocations: List[Allocation]
    progress: Optional[TargetProgress] = None

class TargetsResponse(BaseModel):
    """Response schema for targets list."""
    targets: List[TargetWithAllocations]
    net_worth_target: Optional[TargetWithAllocations] = None
    calculations: TargetCalculationsResponse