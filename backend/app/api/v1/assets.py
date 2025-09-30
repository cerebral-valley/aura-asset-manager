"""
Assets API endpoints for asset management.
"""

from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import and_, or_  # type: ignore
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.asset import Asset
from app.schemas.asset import Asset as AssetSchema, AssetCreate, AssetUpdate, AssetSummary
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[AssetSchema])
async def get_assets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all assets for the current user."""
    # Filter out sold assets (quantity = 0 or NULL indicates sold/inactive assets)
    # Use explicit NULL handling to ensure proper filtering
    assets = db.query(Asset).filter(
        Asset.user_id == current_user.id,
        and_(
            Asset.quantity.isnot(None),  # Not NULL
            Asset.quantity > 0  # Greater than 0
        )
    ).all()
    
    # Debug logging to track asset filtering
    all_assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    print(f"🔍 ASSETS_FILTER: Total assets for user: {len(all_assets)}")
    print(f"🔍 ASSETS_FILTER: Active assets (quantity > 0): {len(assets)}")
    
    for asset in all_assets:
        status = "ACTIVE" if asset.quantity and asset.quantity > 0 else "SOLD/INACTIVE"  # type: ignore
        print(f"🔍 Asset: {asset.name}, quantity: {asset.quantity}, value: {asset.current_value}, status: {status}")
    
    # Debug logging
    print(f"🔍 Found {len(assets)} active assets for user {current_user.id}")
    for asset in assets:
        print(f"🔍 Active Asset: {asset.name}, type: {asset.asset_type}, current_value: {asset.current_value}, initial_value: {asset.initial_value}, quantity: {asset.quantity}")
        if asset.asset_metadata:  # type: ignore
            print(f"🔍   Metadata: {asset.asset_metadata}")
    
    return assets

@router.post("/", response_model=AssetSchema)
async def create_asset(
    asset: AssetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new asset."""
    db_asset = Asset(**asset.model_dump(), user_id=current_user.id)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/{asset_id}/", response_model=AssetSchema)
async def get_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific asset by ID."""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    return asset

@router.put("/{asset_id}/", response_model=AssetSchema)
async def update_asset(
    asset_id: UUID,
    asset_update: AssetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing asset."""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    update_data = asset_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    db.commit()
    db.refresh(asset)
    return asset

@router.delete("/{asset_id}/")
async def delete_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an asset and all its associated transactions."""
    from app.models.transaction import Transaction
    
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    # Get count of transactions for this asset
    transaction_count = db.query(Transaction).filter(
        Transaction.asset_id == asset_id,
        Transaction.user_id == current_user.id
    ).count()
    
    # Delete all transactions for this asset first (explicit deletion for clarity)
    db.query(Transaction).filter(
        Transaction.asset_id == asset_id,
        Transaction.user_id == current_user.id
    ).delete()
    
    # Delete the asset
    db.delete(asset)
    db.commit()
    
    return {
        "message": f"Asset '{asset.name}' deleted successfully",
        "transactions_deleted": transaction_count,
        "asset_name": asset.name
    }

