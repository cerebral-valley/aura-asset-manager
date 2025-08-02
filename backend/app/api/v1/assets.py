"""
Assets API endpoints for asset management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.asset import Asset
from app.schemas.asset import Asset as AssetSchema, AssetCreate, AssetUpdate, AssetSummary
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[AssetSummary])
async def get_assets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all assets for the current user."""
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    
    # Debug logging
    print(f"🔍 Found {len(assets)} assets for user {current_user.id}")
    for asset in assets:
        print(f"🔍 Asset: {asset.name}, type: {asset.asset_type}, status: {asset.status}")
    
    return assets

@router.post("/", response_model=AssetSchema)
async def create_asset(
    asset: AssetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new asset."""
    db_asset = Asset(**asset.dict(), user_id=current_user.id)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/{asset_id}", response_model=AssetSchema)
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

@router.put("/{asset_id}", response_model=AssetSchema)
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
    
    update_data = asset_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    db.commit()
    db.refresh(asset)
    return asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an asset."""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}

