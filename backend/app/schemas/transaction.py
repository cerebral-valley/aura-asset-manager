"""
Transaction Pydantic schemas for API serialization.
"""

from pydantic import BaseModel, field_validator
from datetime import datetime, date
from typing import Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

class TransactionBase(BaseModel):
    """Base transaction schema."""
    asset_id: Optional[UUID] = None  # Optional for 'create' transactions
    transaction_type: str
    transaction_date: date  # Changed from datetime to date for YYYY-MM-DD format
    amount: Optional[Decimal] = None
    quantity_change: Optional[Decimal] = None
    notes: Optional[str] = None
    transaction_metadata: Optional[Dict[str, Any]] = None
    
    # NEW FIELDS - Added to match Supabase structure and frontend requirements
    asset_name: Optional[str] = None
    asset_type: Optional[str] = None
    acquisition_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    quantity: Optional[Decimal] = None
    unit_of_measure: Optional[str] = None
    custom_properties: Optional[str] = None
    asset_description: Optional[str] = None
    
    @field_validator('transaction_metadata', mode='before')
    @classmethod
    def validate_transaction_metadata(cls, v):
        """Handle NULL transaction_metadata from database."""
        if v is None:
            return {}
        return v

class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass

class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    transaction_type: Optional[str] = None
    transaction_date: Optional[date] = None
    amount: Optional[Decimal] = None
    quantity_change: Optional[Decimal] = None
    notes: Optional[str] = None
    transaction_metadata: Optional[Dict[str, Any]] = None
    
    # NEW FIELDS - Updated schema
    asset_name: Optional[str] = None
    asset_type: Optional[str] = None
    acquisition_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    quantity: Optional[Decimal] = None
    unit_of_measure: Optional[str] = None
    custom_properties: Optional[str] = None
    asset_description: Optional[str] = None
    
    @field_validator('transaction_metadata', mode='before')
    @classmethod
    def validate_transaction_metadata(cls, v):
        """Handle NULL transaction_metadata from database."""
        if v is None:
            return {}
        return v

class TransactionInDB(TransactionBase):
    """Schema for transaction in database."""
    id: UUID
    user_id: UUID
    created_at: datetime
        modified_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Transaction(TransactionInDB):
    """Public transaction schema."""
    pass

class TransactionWithAsset(Transaction):
    """Transaction schema with asset information."""
    asset_name: str
    asset_type: str
    
    class Config:
        from_attributes = True

