"""
Transaction Create API - Dedicated endpoint for creating assets via transactions.
This handles the pure transaction-centric architecture where all asset data comes through transactions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.asset import Asset
from app.schemas.transaction import TransactionCreate
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from uuid import UUID
from datetime import date

router = APIRouter()

class TransactionCreateRequest(BaseModel):
    """Schema specifically for create transactions with all asset data."""
    # Transaction fields
    transaction_type: str = "create"
    transaction_date: date
    amount: Optional[Decimal] = 0
    quantity_change: Optional[Decimal] = 1
    notes: Optional[str] = ""
    
    # Asset fields (all from frontend)
    asset_name: str
    asset_type: str
    acquisition_value: Optional[Decimal] = 0
    current_value: Optional[Decimal] = 0
    quantity: Optional[Decimal] = 1
    unit_of_measure: Optional[str] = ""
    custom_properties: Optional[str] = ""
    asset_description: Optional[str] = ""
    
    # Liquidity and time horizon fields
    liquid_assets: Optional[bool] = False
    time_horizon: Optional[str] = None

class TransactionCreateResponse(BaseModel):
    """Response for transaction creation."""
    id: UUID
    asset_id: UUID
    transaction_type: str
    transaction_date: date
    amount: Optional[Decimal]
    asset_name: str
    asset_type: str
    message: str

@router.post("/", response_model=TransactionCreateResponse)
async def create_asset_via_transaction(
    request: TransactionCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create an asset and corresponding transaction in one operation.
    This is the pure transaction-centric approach.
    """
    try:
        # 1. Create the asset first
        asset_data = {
            "name": request.asset_name,
            "asset_type": request.asset_type,
            "description": request.asset_description or "",
            "purchase_date": request.transaction_date,
            "initial_value": request.acquisition_value or 0,
            "current_value": request.current_value or request.acquisition_value or 0,
            "quantity": request.quantity or 1,
            "unit_of_measure": request.unit_of_measure or "",
            "user_id": current_user.id,
            "asset_metadata": {"custom_properties": request.custom_properties or ""},
            # New liquidity and time horizon fields
            "liquid_assets": request.liquid_assets or False,
            "time_horizon": request.time_horizon
        }
        
        db_asset = Asset(**asset_data)
        db.add(db_asset)
        db.flush()  # Get asset ID without committing
        
        # 2. Create the transaction
        transaction_data = {
            "asset_id": db_asset.id,
            "transaction_type": request.transaction_type,
            "transaction_date": request.transaction_date,
            "amount": request.amount or request.acquisition_value or 0,
            "quantity_change": request.quantity_change or request.quantity or 1,
            "notes": request.notes or "",
            "user_id": current_user.id,
            "transaction_metadata": {
                "liquid_assets": request.liquid_assets or False,
                "time_horizon": request.time_horizon
            },
            # Store all asset fields in transaction for complete audit trail
            "asset_name": request.asset_name,
            "asset_type": request.asset_type,
            "acquisition_value": request.acquisition_value or 0,
            "current_value": request.current_value or request.acquisition_value or 0,
            "quantity": request.quantity or 1,
            "unit_of_measure": request.unit_of_measure or "",
            "custom_properties": request.custom_properties or "",
            "asset_description": request.asset_description or ""
        }
        
        db_transaction = Transaction(**transaction_data)
        db.add(db_transaction)
        
        # 3. Commit both asset and transaction
        db.commit()
        db.refresh(db_transaction)
        
        return TransactionCreateResponse(
            id=db_transaction.id,
            asset_id=db_asset.id,
            transaction_type=db_transaction.transaction_type,
            transaction_date=db_transaction.transaction_date,
            amount=db_transaction.amount,
            asset_name=request.asset_name,
            asset_type=request.asset_type,
            message=f"Asset '{request.asset_name}' created successfully with transaction record"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset and transaction: {str(e)}"
        )
