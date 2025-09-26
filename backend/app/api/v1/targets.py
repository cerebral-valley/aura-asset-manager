"""
Targets API endpoints for financial goal tracking.
"""

from uuid import UUID  # Critical for string->UUID conversion in asset selection endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
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
    """Get all liquid assets for the current user with selection status from assets.is_selected column."""
    try:
        print("🔧 DEBUG: get_liquid_assets called - using assets.is_selected column")

        # Canonical list of liquid asset types (lowercase)
        liquid_asset_types = [
            'cash', 'bank', 'checking', 'savings', 'stocks', 'stock', 'etf',
            'mutual_funds', 'mutual funds', 'money_market', 'bonds', 'bond',
            'treasury', 'crypto', 'cryptocurrency'
        ]

        # Fetch assets that are either explicitly marked as liquid or whose
        # type matches the list above (case-insensitive)
        liquid_assets = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            or_(
                Asset.liquid_assets.is_(True),
                func.lower(Asset.asset_type).in_(liquid_asset_types)
            )
        ).all()

        print(f"🔧 DEBUG: Found {len(liquid_assets)} candidate liquid assets")

        result = []
        for asset in liquid_assets:
            result.append(LiquidAsset(
                id=asset.id,  # Keep as UUID
                name=asset.name,
                current_value=asset.current_value or Decimal('0'),
                asset_type=asset.asset_type,
                is_selected=bool(asset.is_selected or False)  # Use is_selected from assets table
            ))

        print(f"🔧 DEBUG: Returning {len(result)} liquid assets with selection states")
        for asset in result:
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


from fastapi.responses import JSONResponse

@router.put("/liquid-assets", response_model=dict)
async def update_asset_selections(
    selections: AssetSelectionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's liquid asset selections using user_asset_selections table AND sync with assets.is_selected."""
    print(f"🔧 DEBUG: Received asset selections update for user {current_user.id}")
    print(f"🔧 DEBUG: Selections data: {selections.selections}")
    
    # Debug request details
    print(f"🔐 Auth: User authenticated as {current_user.email}")
    print(f"🔧 DEBUG: Processing PUT /liquid-assets endpoint")

    for asset_id, is_selected in selections.selections.items():
        print(f"🔧 DEBUG: Processing asset {asset_id} -> {is_selected}")
        try:
            # Parse UUID safely
            asset_uuid = UUID(asset_id)
        except ValueError:
            print(f"🔧 ERROR: Invalid UUID format for asset_id {asset_id}")
            continue

        # Check if asset exists and belongs to user
        existing_asset = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.id == asset_uuid
        ).first()

        if not existing_asset:
            print(f"🔧 ERROR: No asset found with id {asset_id} for user {current_user.id}")
            continue

        print(f"🔧 DEBUG: Found asset {existing_asset.name}")

        # CRITICAL FIX: Update is_selected in the assets table directly
        # This ensures selection state is consistent between tables
        setattr(existing_asset, 'is_selected', bool(is_selected))
        print(f"🔧 DEBUG: Updated is_selected={is_selected} in assets table for {existing_asset.name}")

        # Also maintain user_asset_selections table for historical/audit purposes
        existing_selection = db.query(UserAssetSelection).filter(
            UserAssetSelection.user_id == current_user.id,
            UserAssetSelection.asset_id == asset_uuid
        ).first()

        if existing_selection:
            # Update existing selection
            setattr(existing_selection, 'is_selected', bool(is_selected))
            print(f"🔧 DEBUG: Updated existing selection in user_asset_selections for {existing_asset.name}")
        else:
            # Create new selection record
            new_selection = UserAssetSelection(
                user_id=current_user.id,
                asset_id=asset_uuid,
                is_selected=is_selected
            )
            db.add(new_selection)
            print(f"🔧 DEBUG: Created new selection record in user_asset_selections for {existing_asset.name}")

    try:
        db.commit()
        print(f"🔧 DEBUG: Successfully committed asset selections to database")
    except Exception as e:
        print(f"🔧 ERROR: Failed to commit asset selections: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update asset selections: {str(e)}"
        )

    # Return with explicit headers for CORS debugging
    response = JSONResponse(content={"message": "Asset selections updated successfully"})
    # Ensure CORS headers are explicitly set
    print(f"🔧 DEBUG: Returning successful response with CORS headers")
    return response


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
