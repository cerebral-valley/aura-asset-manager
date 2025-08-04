"""
Transactions API endpoints for transaction management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.asset import Asset
from app.schemas.transaction import Transaction as TransactionSchema, TransactionCreate, TransactionUpdate, TransactionWithAsset
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[TransactionWithAsset])
async def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all transactions for the current user."""
    transactions = db.query(Transaction).join(Asset).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).all()
    
    # Add asset information to transactions
    result = []
    for transaction in transactions:
        transaction_dict = TransactionSchema.from_orm(transaction).dict()
        transaction_dict['asset_name'] = transaction.asset.name
        transaction_dict['asset_type'] = transaction.asset.asset_type
        result.append(transaction_dict)
    
    return result

@router.post("/", response_model=TransactionSchema)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction. For 'create' type, also creates the asset."""
    
    # 🎯 HANDLE ASSET CREATION FOR 'CREATE' TRANSACTION TYPE
    if transaction.transaction_type == "create":
        # Create new asset from transaction data
        if not transaction.asset_name or not transaction.asset_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="asset_name and asset_type are required for create transactions"
            )
        
        # Create the asset first
        asset_data = {
            "name": transaction.asset_name,
            "asset_type": transaction.asset_type,
            "description": transaction.asset_description or "",
            "purchase_date": transaction.transaction_date,
            "initial_value": transaction.acquisition_value or 0,
            "current_value": transaction.current_value or transaction.acquisition_value or 0,
            "quantity": transaction.quantity or 1,
            "unit_of_measure": transaction.unit_of_measure or "",
            "user_id": current_user.id
        }
        
        # Handle custom_properties if provided
        if hasattr(transaction, 'custom_properties') and transaction.custom_properties:
            asset_data["asset_metadata"] = {"custom_properties": transaction.custom_properties}
        else:
            asset_data["asset_metadata"] = {}
        
        db_asset = Asset(**asset_data)
        db.add(db_asset)
        db.flush()  # Get the asset ID without committing
        
        # Now create the transaction with the new asset_id
        transaction_data = transaction.dict()
        transaction_data["asset_id"] = db_asset.id
        db_transaction = Transaction(**transaction_data, user_id=current_user.id)
        
    else:
        # For other transaction types, verify that the asset exists
        if not transaction.asset_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="asset_id is required for non-create transactions"
            )
            
        asset = db.query(Asset).filter(
            Asset.id == transaction.asset_id,
            Asset.user_id == current_user.id
        ).first()
        
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found"
            )
        
        db_transaction = Transaction(**transaction.dict(), user_id=current_user.id)
    
    db.add(db_transaction)
    
    # Update asset values based on transaction type
    # For 'create' transactions, the asset is already properly initialized
    if transaction.transaction_type == "create":
        # Asset values are already set during creation, no additional updates needed
        pass
    elif transaction.transaction_type == "purchase" and transaction.quantity_change:
        if asset.quantity:
            asset.quantity += transaction.quantity_change
        else:
            asset.quantity = transaction.quantity_change
    elif transaction.transaction_type == "sale" and transaction.quantity_change:
        if asset.quantity:
            asset.quantity += transaction.quantity_change  # quantity_change should be negative for sales
        else:
            asset.quantity = 0
    elif transaction.transaction_type == "value_update" and transaction.amount:
        asset.current_value = transaction.amount
    elif transaction.transaction_type == "update_market_value" and transaction.amount:
        # Update the asset's current market value
        asset.current_value = transaction.amount
    elif transaction.transaction_type == "update_acquisition_value" and transaction.amount:
        # Update the asset's initial/acquisition value
        asset.initial_value = transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/{transaction_id}", response_model=TransactionSchema)
async def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction by ID."""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction

@router.get("/asset/{asset_id}", response_model=List[TransactionSchema])
async def get_asset_transactions(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all transactions for a specific asset."""
    # Verify that the asset belongs to the current user
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    transactions = db.query(Transaction).filter(
        Transaction.asset_id == asset_id,
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).all()
    
    return transactions

@router.put("/{transaction_id}", response_model=TransactionSchema)
async def update_transaction(
    transaction_id: UUID,
    transaction_update: TransactionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing transaction."""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    update_data = transaction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a transaction with enhanced logic:
    - If deleting a 'create' transaction: Delete all transactions for that asset + the asset itself
    - If deleting any other transaction: Delete only that specific transaction
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.transaction_type == "create":
        # For "create" transactions, delete all related transactions and the asset
        asset_id = transaction.asset_id
        
        # Get the asset for response info
        asset = db.query(Asset).filter(
            Asset.id == asset_id,
            Asset.user_id == current_user.id
        ).first()
        
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated asset not found"
            )
        
        # Get count of all transactions for this asset
        total_transactions = db.query(Transaction).filter(
            Transaction.asset_id == asset_id,
            Transaction.user_id == current_user.id
        ).count()
        
        # Delete all transactions for this asset
        db.query(Transaction).filter(
            Transaction.asset_id == asset_id,
            Transaction.user_id == current_user.id
        ).delete()
        
        # Delete the asset itself
        db.delete(asset)
        db.commit()
        
        return {
            "message": f"Create Asset transaction deleted - removed asset '{asset.name}' and all {total_transactions} related transactions",
            "transaction_type": "create",
            "asset_deleted": True,
            "asset_name": asset.name,
            "total_transactions_deleted": total_transactions
        }
    else:
        # For other transaction types, delete only the specific transaction
        transaction_type = transaction.transaction_type
        asset_name = transaction.asset.name if transaction.asset else "Unknown"
        
        db.delete(transaction)
        db.commit()
        
        return {
            "message": f"Transaction '{transaction_type}' for asset '{asset_name}' deleted successfully",
            "transaction_type": transaction_type,
            "asset_deleted": False,
            "transactions_deleted": 1
        }

