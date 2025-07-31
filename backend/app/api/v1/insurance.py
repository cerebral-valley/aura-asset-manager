"""
Insurance API endpoints for insurance policy management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.insurance import InsurancePolicy
from app.schemas.insurance import InsurancePolicy as InsurancePolicySchema, InsurancePolicyCreate, InsurancePolicyUpdate, InsurancePolicySummary
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[InsurancePolicySummary])
async def get_insurance_policies(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all insurance policies for the current user."""
    policies = db.query(InsurancePolicy).filter(InsurancePolicy.user_id == current_user.id).all()
    return policies

@router.post("/", response_model=InsurancePolicySchema)
async def create_insurance_policy(
    policy: InsurancePolicyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new insurance policy."""
    try:
        print(f"🔍 Raw policy data received: {policy.dict()}")
        print(f"🔍 Policy data types: {[(k, type(v)) for k, v in policy.dict().items()]}")
        
        # Convert Pydantic model to dict and handle the metadata field mapping
        policy_data = policy.dict()
        
        print(f"🔍 Policy data after dict conversion: {policy_data}")
        
        # Map policy_metadata to the database column name if it exists
        if 'policy_metadata' in policy_data:
            # The SQLAlchemy model expects this field as policy_metadata but maps to 'metadata' column
            pass  # Keep as is since our model handles the mapping
        
        print(f"🔍 About to create InsurancePolicy with user_id: {current_user.id}")
        
        db_policy = InsurancePolicy(**policy_data, user_id=current_user.id)
        print(f"🔍 InsurancePolicy object created successfully")
        
        db.add(db_policy)
        db.commit()
        db.refresh(db_policy)
        
        print(f"🔍 Policy saved successfully with ID: {db_policy.id}")
        return db_policy
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating insurance policy: {e}")
        print(f"❌ Error type: {type(e)}")
        print(f"❌ Policy data received: {policy.dict()}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=422, detail=f"Failed to create policy: {str(e)}")

@router.get("/{policy_id}", response_model=InsurancePolicySchema)
async def get_insurance_policy(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific insurance policy by ID."""
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    return policy

@router.put("/{policy_id}", response_model=InsurancePolicySchema)
async def update_insurance_policy(
    policy_id: UUID,
    policy_update: InsurancePolicyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing insurance policy."""
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    update_data = policy_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(policy, field, value)
    
    db.commit()
    db.refresh(policy)
    return policy

@router.delete("/{policy_id}")
async def delete_insurance_policy(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an insurance policy."""
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    db.delete(policy)
    db.commit()
    return {"message": "Insurance policy deleted successfully"}

