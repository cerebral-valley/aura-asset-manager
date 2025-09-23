"""
Targets API endpoints for financial goal tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.target import Target, TargetAllocation, UserAssetSelection
from app.schemas.target import (
    Target as TargetSchema,
    TargetCreate,
    TargetUpdate
)
from typing import List
from uuid import UUID
from decimal import Decimal
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[TargetSchema])
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

@router.post("/", response_model=TargetSchema)
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