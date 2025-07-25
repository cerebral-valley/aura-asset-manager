"""
Asset Pydantic schemas for API serialization.
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from typing import Optional, Dict, Any, Union
from uuid import UUID
from decimal import Decimal

class AssetBase(BaseModel):
    """Base asset schema."""
    name: str
    asset_type: str
    description: Optional[str] = None
    purchase_date: Optional[date] = None
    initial_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    quantity: Optional[Decimal] = None
    unit_of_measure: Optional[str] = None
    asset_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @field_validator('asset_metadata', mode='before')
    @classmethod
    def validate_asset_metadata(cls, v):
        """Handle NULL asset_metadata from database."""
        if v is None:
            return {}
        return v

class AssetCreate(AssetBase):
    """Schema for creating an asset."""
    pass

class AssetUpdate(BaseModel):
    """Schema for updating an asset."""
    name: Optional[str] = None
    asset_type: Optional[str] = None
    description: Optional[str] = None
    purchase_date: Optional[date] = None
    initial_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    quantity: Optional[Decimal] = None
    unit_of_measure: Optional[str] = None
    asset_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @field_validator('asset_metadata', mode='before')
    @classmethod
    def validate_asset_metadata(cls, v):
        """Handle NULL asset_metadata from database."""
        if v is None:
            return {}
        return v

class AssetInDB(AssetBase):
    """Schema for asset in database."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Asset(AssetInDB):
    """Public asset schema."""
    pass

class AssetSummary(BaseModel):
    """Summary schema for asset list views."""
    id: UUID
    name: str
    asset_type: str
    current_value: Optional[Decimal] = None
    quantity: Optional[Decimal] = None
    unit_of_measure: Optional[str] = None
    
    class Config:
        from_attributes = True

