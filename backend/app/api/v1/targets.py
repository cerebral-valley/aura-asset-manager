"""
Targets API endpoints for financial goal tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.target import Target, TargetAllocation, UserAssetSelection
from app.models.asset import Asset
from app.schemas.target import (
    Target as TargetSchema,
    TargetCreate,
    TargetUpdate,
    AssetSelectionUpdate,
    LiquidAsset
)
from app.schemas.asset import Asset as AssetSchema
from typing import List
from uuid import UUID
from decimal import Decimal
from datetime import datetime

router = APIRouter()

@router.get("", response_model=List[TargetSchema])
async def get_targets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all targets for the current user."""
    targets = db.query(Target).filter(
        Target.user_id == current_user.id,
        Target.status != 'archived'
    ).order_by(Target.created_at).all()
    
    return targets

@router.post("", response_model=TargetSchema)
async def create_target(
    target_data: TargetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new target."""
    # Check if user already has max targets (4 custom + 1 net worth)
    current_targets_count = db.query(Target).filter(
        Target.user_id == current_user.id,
        Target.status == 'active',
        Target.target_type == 'custom'
    ).count()
    
    if target_data.target_type == 'custom' and current_targets_count >= 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 4 custom targets allowed"
        )
    
    # Check if net worth target already exists
    if target_data.target_type == 'net_worth':
        existing_net_worth = db.query(Target).filter(
            Target.user_id == current_user.id,
            Target.target_type == 'net_worth',
            Target.status == 'active'
        ).first()
        if existing_net_worth:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Net worth target already exists"
            )
    
    # Create target
    target = Target(
        user_id=current_user.id,
        **target_data.model_dump()
    )
    
    db.add(target)
    db.commit()
    db.refresh(target)
    
    return target

@router.put("/{target_id}", response_model=TargetSchema)
async def update_target(
    target_id: UUID,
    target_data: TargetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a target."""
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    # Update fields
    update_data = target_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(target, field, value)
    
    db.commit()
    db.refresh(target)
    
    return target

@router.delete("/{target_id}")
async def delete_target(
    target_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a target and free its allocations."""
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    # Delete target (allocations will cascade delete)
    db.delete(target)
    db.commit()
    
    return {"message": "Target deleted successfully"}


@router.get("/liquid-assets", response_model=List[LiquidAsset])
def get_liquid_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all liquid assets for the current user using new asset-based selection model"""
    try:
        print("🔧 DEBUG: get_liquid_assets called - NEW REFACTORED VERSION v0.156")
        
        # Get all assets marked as liquid for the user
        liquid_assets = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.liquid_assets == True  # Use the new liquid_assets column
        ).all()
        
        print(f"🔧 DEBUG: Found {len(liquid_assets)} liquid assets using liquid_assets column")
        
        # Debug: Print raw database values before conversion
        for asset in liquid_assets:
            print(f"🔧 DEBUG: Raw asset data - ID: {asset.id}, Name: {asset.name}, is_selected: {asset.is_selected} (type: {type(asset.is_selected)})")
        
        # Convert to LiquidAsset schema with selection status from asset.is_selected
        result = [
            LiquidAsset(
                id=asset.id,  # type: ignore
                name=asset.name,  # type: ignore
                current_value=asset.current_value or 0,  # type: ignore
                asset_type=asset.asset_type,  # type: ignore
                is_selected=bool(asset.is_selected) if asset.is_selected is not None else False  # Use the asset's is_selected column directly
            )
            for asset in liquid_assets
        ]
        
        print(f"🔧 DEBUG: Returning {len(result)} liquid assets with selection states")
        for asset in result:
            print(f"🔧 DEBUG: Final result - Asset {asset.name} (ID: {asset.id}) - selected: {asset.is_selected}")
            print(f"🔧 DEBUG: Asset {asset.name} (ID: {asset.id}) - selected: {asset.is_selected}")
        return result
    except Exception as e:
        print(f"Error in get_liquid_assets: {e}")
        print(f"🔧 DEBUG: Exception type: {type(e)}")
        import traceback
        print(f"🔧 DEBUG: Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/liquid-assets", response_model=dict)
async def update_asset_selections(
    selections: AssetSelectionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's liquid asset selections using new asset-based model."""
    print(f"🔧 DEBUG: Received asset selections update for user {current_user.id} - REFACTORED VERSION")
    print(f"🔧 DEBUG: Selections data: {selections.selections}")
    
    for asset_id, is_selected in selections.selections.items():
        print(f"🔧 DEBUG: Processing asset {asset_id} -> {is_selected}")
        
        # First, check if asset exists and get current value
        existing_asset = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.id == UUID(asset_id)
        ).first()
        
        if not existing_asset:
            print(f"🔧 ERROR: No asset found with id {asset_id} for user {current_user.id}")
            continue
            
        print(f"🔧 DEBUG: Found asset {existing_asset.name}, current is_selected: {existing_asset.is_selected}")
        
        # Update the is_selected column directly in the assets table
        result = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.id == UUID(asset_id)
        ).update({"is_selected": is_selected})
        
        print(f"🔧 DEBUG: Update query affected {result} row(s)")
        
        # Verify the update by re-querying
        updated_asset = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.id == UUID(asset_id)
        ).first()
        
        if updated_asset:
            print(f"🔧 DEBUG: After update, asset {updated_asset.name} is_selected: {updated_asset.is_selected}")
        else:
            print(f"🔧 ERROR: Could not re-query asset {asset_id} after update")
    
    try:
        db.commit()
        print(f"🔧 DEBUG: Successfully committed asset selections to database")
    except Exception as e:
        print(f"🔧 ERROR: Failed to commit asset selections: {e}")
        db.rollback()
        raise
    
    return {"message": "Asset selections updated successfully"}


@router.post("/{target_id}/complete", response_model=TargetSchema)
async def complete_target(
    target_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a target as completed and move to logs."""
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    # Mark as completed
    db.query(Target).filter(Target.id == target_id).update({
        "status": "completed",
        "updated_at": datetime.utcnow()
    })
    
    db.commit()
    db.refresh(target)
    
    return target


@router.get("/completed", response_model=List[TargetSchema])
async def get_completed_targets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all completed targets for target logs."""
    completed_targets = db.query(Target).filter(
        Target.user_id == current_user.id,
        Target.status == 'completed'
    ).order_by(Target.updated_at.desc()).all()
    
    return completed_targets


@router.post("/{target_id}/restore", response_model=TargetSchema)
async def restore_target(
    target_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Restore a completed or archived target back to active status."""
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id,
        Target.status.in_(['completed', 'archived'])
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found or not in completed/archived status"
        )
    
    # Check if user already has max active targets (4 custom + 1 net worth)
    if str(target.target_type) == 'custom':
        current_targets_count = db.query(Target).filter(
            Target.user_id == current_user.id,
            Target.status == 'active',
            Target.target_type == 'custom'
        ).count()
        
        if current_targets_count >= 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum of 4 custom targets allowed. Please complete or delete an existing target first."
            )
    
    # Restore target to active status
    result = db.query(Target).filter(Target.id == target_id).update({
        "status": "active",
        "updated_at": datetime.utcnow()
    })
    
    db.commit()
    
    # Fetch updated target
    updated_target = db.query(Target).filter(Target.id == target_id).first()
    return updated_target


@router.post("/{target_id}/allocations")
async def update_target_allocations(
    target_id: UUID,
    allocations: List[dict],  # [{"asset_id": "uuid", "amount": 1000.00}]
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update allocations for a specific target."""
    target = db.query(Target).filter(
        Target.id == target_id,
        Target.user_id == current_user.id
    ).first()
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    # Delete existing allocations
    db.query(TargetAllocation).filter(
        TargetAllocation.target_id == target_id
    ).delete()
    
    # Add new allocations
    total_allocated = Decimal('0')
    for allocation in allocations:
        if allocation['amount'] > 0:
            target_allocation = TargetAllocation(
                target_id=target_id,
                asset_id=UUID(allocation['asset_id']),
                allocation_amount=Decimal(str(allocation['amount']))
            )
            db.add(target_allocation)
            total_allocated += Decimal(str(allocation['amount']))
    
    # Update target's total allocated amount
    db.query(Target).filter(Target.id == target_id).update({
        "total_allocated_amount": total_allocated
    })
    
    db.commit()
    return {"message": "Allocations updated successfully"}