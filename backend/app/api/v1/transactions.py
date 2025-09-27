"""
Transactions API endpoints for transaction management.
"""

from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
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
        transaction_dict = TransactionSchema.model_validate(transaction).model_dump()
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
    
    print(f"🚀 TRANSACTION_CREATE_START: {transaction.transaction_type} for user {current_user.id}")
    print(f"📋 Transaction data: {transaction.model_dump()}")
    
    # Initialize asset variable
    asset = None
    
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
        
        # Add asset_purpose if provided
        if hasattr(transaction, 'asset_purpose') and transaction.asset_purpose:
            asset_data["asset_purpose"] = transaction.asset_purpose
            
        # Add liquid_assets if provided  
        if hasattr(transaction, 'liquid_assets') and transaction.liquid_assets:
            asset_data["liquid_assets"] = transaction.liquid_assets == 'YES'
            
        # Add time_horizon if provided
        if hasattr(transaction, 'time_horizon') and transaction.time_horizon:
            asset_data["time_horizon"] = transaction.time_horizon
        
        # Handle custom_properties if provided
        if hasattr(transaction, 'custom_properties') and transaction.custom_properties:
            asset_data["asset_metadata"] = {"custom_properties": transaction.custom_properties}
        else:
            asset_data["asset_metadata"] = {}
        
        db_asset = Asset(**asset_data)
        db.add(db_asset)
        db.flush()  # Get the asset ID without committing
        
        # Set asset reference for later use
        asset = db_asset
        
        # Now create the transaction with the new asset_id
        transaction_data = transaction.model_dump()
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
        
        db_transaction = Transaction(**transaction.model_dump(), user_id=current_user.id)
    
    # 🗑️ HANDLE DELETE TRANSACTION TYPE - IMMEDIATE ASSET DELETION
    if transaction.transaction_type == "delete":
        print(f"🗑️ DELETE_ASSET: Processing delete transaction for asset {asset.name}")
        
        # Get count of all transactions for this asset before deletion
        total_transactions = db.query(Transaction).filter(
            Transaction.asset_id == asset.id,
            Transaction.user_id == current_user.id
        ).count()
        
        # Delete all existing transactions for this asset
        db.query(Transaction).filter(
            Transaction.asset_id == asset.id,
            Transaction.user_id == current_user.id
        ).delete()
        
        # Delete the asset itself
        asset_name = asset.name
        db.delete(asset)
        db.commit()
        
        print(f"🗑️ DELETE_COMPLETE: Deleted asset '{asset_name}' and {total_transactions} related transactions")
        
        # Create a response without creating the delete transaction since asset is gone
        return {
            "id": None,  # No transaction created since asset was deleted
            "message": f"Asset '{asset_name}' and all {total_transactions} related transactions have been permanently deleted",
            "asset_deleted": True,
            "asset_name": asset_name,
            "total_transactions_deleted": total_transactions,
            "transaction_type": "delete",
            "user_id": current_user.id,
            "created_at": None,
            "updated_at": None
        }

    db.add(db_transaction)

    # Update asset values based on transaction type
    # Skip updates for create transactions as asset is already properly initialized
    if transaction.transaction_type != "create" and asset:
        if transaction.transaction_type == "purchase" and transaction.quantity_change:
            current_quantity = asset.quantity or 0
            asset.quantity = current_quantity + transaction.quantity_change  # type: ignore
            print(f"🔄 PURCHASE: Updated asset {asset.name} quantity: {current_quantity} + {transaction.quantity_change} = {asset.quantity}")
        elif transaction.transaction_type == "sale":
            # For sale transactions, mark the asset as sold by setting quantity to 0
            # This effectively removes it from the active assets list
            print(f"🔥 SALE: Marking asset {asset.name} as sold (was quantity: {asset.quantity}, value: {asset.current_value})")
            asset.quantity = 0  # type: ignore
            asset.current_value = 0  # type: ignore # Set value to 0 when sold
            print(f"🔥 SALE: Asset {asset.name} now has quantity: {asset.quantity}, value: {asset.current_value}")
        elif transaction.transaction_type == "value_update" and transaction.amount:
            asset.current_value = transaction.amount  # type: ignore
        elif transaction.transaction_type == "update_market_value" and transaction.amount:
            asset.current_value = transaction.amount  # type: ignore
        elif transaction.transaction_type == "cash_deposit" and transaction.amount:
            # For cash deposits, ADD to the current value instead of replacing it
            current_value = asset.current_value or 0
            new_value = current_value + transaction.amount
            asset.current_value = new_value  # type: ignore
            print(f"💰 CASH_DEPOSIT: Added ${transaction.amount} to asset {asset.name} - old: ${current_value}, new: ${new_value}")
        elif transaction.transaction_type == "update_acquisition_value" and transaction.amount:
            asset.initial_value = transaction.amount  # type: ignore
        elif transaction.transaction_type == "update_name" and transaction.asset_name:
            asset.name = transaction.asset_name  # type: ignore
        elif transaction.transaction_type == "update_type" and transaction.asset_type:
            asset.asset_type = transaction.asset_type  # type: ignore
        elif transaction.transaction_type == "update_liquid_status" and hasattr(transaction, 'liquid_assets'):
            # Convert string to boolean for asset table
            asset.liquid_assets = transaction.liquid_assets == 'YES'  # type: ignore
        elif transaction.transaction_type == "update_time_horizon" and hasattr(transaction, 'time_horizon'):
            asset.time_horizon = transaction.time_horizon  # type: ignore
        elif transaction.transaction_type == "update_quantity_units" and hasattr(transaction, 'update_quantity_units'):
            # Parse quantity and unit from update_quantity_units field 
            # Expected format: "quantity:unit" e.g., "100.5:shares"
            if transaction.update_quantity_units:
                try:
                    parts = transaction.update_quantity_units.split(':')
                    if len(parts) == 2:
                        asset.quantity = float(parts[0])  # type: ignore
                        asset.unit_of_measure = parts[1]  # type: ignore
                        print(f"🔢 UPDATE_QUANTITY_UNITS: Updated {asset.name} - quantity: {asset.quantity}, unit: {asset.unit_of_measure}")
                except (ValueError, IndexError):
                    print(f"⚠️ Invalid quantity_units format: {transaction.update_quantity_units}")
        elif transaction.transaction_type == "update_description_properties":
            # Update description and properties from update_description_properties field
            if hasattr(transaction, 'update_description_properties') and transaction.update_description_properties:
                # Parse JSON or structured format for description and properties updates
                try:
                    import json
                    updates = json.loads(transaction.update_description_properties)
                    if 'description' in updates:
                        asset.description = updates['description']  # type: ignore
                    if 'custom_properties' in updates:
                        # Update metadata with custom properties
                        current_metadata = asset.asset_metadata or {}
                        current_metadata.update(updates['custom_properties'])
                        asset.asset_metadata = current_metadata  # type: ignore
                    print(f"📝 UPDATE_DESCRIPTION_PROPERTIES: Updated {asset.name} description and properties")
                except Exception:
                    # Fallback: treat as simple description update
                    asset.description = transaction.update_description_properties  # type: ignore
                    print(f"📝 UPDATE_DESCRIPTION_PROPERTIES: Updated {asset.name} description (simple)")
        
        # Handle asset_purpose updates for both create and update transactions
        if hasattr(transaction, 'asset_purpose') and transaction.asset_purpose:
            asset.asset_purpose = transaction.asset_purpose  # type: ignore
            print(f"🎯 ASSET_PURPOSE: Updated {asset.name} purpose to {transaction.asset_purpose}")

    db.commit()
    db.refresh(db_transaction)
    
    print(f"✅ TRANSACTION_CREATE_SUCCESS: {transaction.transaction_type} transaction created with ID {db_transaction.id}")
    if asset:
        print(f"✅ Asset {asset.name} updated - quantity: {asset.quantity}, current_value: {asset.current_value}")
    
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
    
    update_data = transaction_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction

# DELETE endpoint removed as part of Actions column removal
# Transactions are now managed through asset lifecycle only

