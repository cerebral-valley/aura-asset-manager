"""
Transaction Pydantic schemas for API serialization.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

class TransactionBase(BaseModel):
    """Base transaction schema."""
    asset_id: UUID
    transaction_type: str
    transaction_date: datetime
    amount: Optional[Decimal] = None
    quantity_change: Optional[Decimal] = None
    notes: Optional[str] = None
    transaction_metadata: Optional[Dict[str, Any]] = None

class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass

class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    transaction_type: Optional[str] = None
    transaction_date: Optional[datetime] = None
    amount: Optional[Decimal] = None
    quantity_change: Optional[Decimal] = None
    notes: Optional[str] = None
    transaction_metadata: Optional[Dict[str, Any]] = None

class TransactionInDB(TransactionBase):
    """Schema for transaction in database."""
    id: UUID
    user_id: UUID
    created_at: datetime
    
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

