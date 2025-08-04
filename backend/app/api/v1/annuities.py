from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import date, datetime
from decimal import Decimal

from app.api.deps import get_current_user, get_db
from app.models.annuity import Annuity as AnnuityModel, AnnuityContribution, AnnuityValuation
from app.schemas.annuity import (
    Annuity, AnnuityCreate, AnnuityUpdate, AnnuitySummary, AnnuityPortfolioSummary,
    AnnuityContribution as AnnuityContributionSchema, AnnuityContributionCreate,
    AnnuityValuation as AnnuityValuationSchema, AnnuityValuationCreate
)
from app.schemas.user import User

router = APIRouter()

@router.get("/", response_model=List[Annuity])
async def get_annuities(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by contract status"),
    annuity_type: Optional[str] = Query(None, description="Filter by annuity type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all annuities for the current user with optional filtering"""
    query = db.query(AnnuityModel).filter(AnnuityModel.user_id == current_user.id)
    
    if status:
        query = query.filter(AnnuityModel.contract_status == status)
    
    if annuity_type:
        query = query.filter(AnnuityModel.annuity_type == annuity_type)
    
    annuities = query.order_by(desc(AnnuityModel.created_at)).offset(skip).limit(limit).all()
    return annuities

@router.get("/summary", response_model=AnnuityPortfolioSummary)
async def get_annuity_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get portfolio summary for all user's annuities"""
    annuities = db.query(AnnuityModel).filter(AnnuityModel.user_id == current_user.id).all()
    
    if not annuities:
        return AnnuityPortfolioSummary(
            total_annuities=0,
            total_premiums_paid=0,
            total_current_value=0,
            total_gain_loss=0,
            annuities_by_type={},
            annuities_by_status={}
        )
    
    total_premiums = sum(
        float(annuity.initial_premium) + 
        sum(float(contrib.amount) for contrib in annuity.contributions)
        for annuity in annuities
    )
    
    total_current_value = sum(
        float(annuity.accumulation_value or annuity.initial_premium)
        for annuity in annuities
    )
    
    # Group by type and status
    by_type = {}
    by_status = {}
    for annuity in annuities:
        by_type[annuity.annuity_type] = by_type.get(annuity.annuity_type, 0) + 1
        by_status[annuity.contract_status] = by_status.get(annuity.contract_status, 0) + 1
    
    return AnnuityPortfolioSummary(
        total_annuities=len(annuities),
        total_premiums_paid=Decimal(str(total_premiums)),
        total_current_value=Decimal(str(total_current_value)),
        total_gain_loss=Decimal(str(total_current_value - total_premiums)),
        annuities_by_type=by_type,
        annuities_by_status=by_status
    )

@router.get("/{annuity_id}", response_model=Annuity)
async def get_annuity(
    annuity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific annuity by ID"""
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    return annuity

@router.post("/", response_model=Annuity)
async def create_annuity(
    annuity_data: AnnuityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new annuity"""
    annuity = AnnuityModel(
        user_id=current_user.id,
        **annuity_data.dict()
    )
    
    db.add(annuity)
    db.commit()
    db.refresh(annuity)
    return annuity

@router.put("/{annuity_id}", response_model=Annuity)
async def update_annuity(
    annuity_id: str,
    annuity_data: AnnuityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing annuity"""
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    update_data = annuity_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(annuity, field, value)
    
    db.commit()
    db.refresh(annuity)
    return annuity

@router.delete("/{annuity_id}")
async def delete_annuity(
    annuity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an annuity"""
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    db.delete(annuity)
    db.commit()
    return {"message": "Annuity deleted successfully"}

# Contribution endpoints
@router.post("/{annuity_id}/contributions", response_model=AnnuityContributionSchema)
async def add_contribution(
    annuity_id: str,
    contribution_data: AnnuityContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a contribution to an annuity"""
    # Verify annuity exists and belongs to user
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    if not annuity.additional_premiums_allowed:
        raise HTTPException(status_code=400, detail="Additional premiums not allowed for this annuity")
    
    contribution = AnnuityContribution(
        annuity_id=annuity_id,
        user_id=current_user.id,
        **contribution_data.dict(exclude={'annuity_id'})
    )
    
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    return contribution

@router.get("/{annuity_id}/contributions", response_model=List[AnnuityContributionSchema])
async def get_contributions(
    annuity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contributions for an annuity"""
    # Verify annuity exists and belongs to user
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    contributions = db.query(AnnuityContribution).filter(
        AnnuityContribution.annuity_id == annuity_id
    ).order_by(desc(AnnuityContribution.contribution_date)).all()
    
    return contributions

# Valuation endpoints
@router.post("/{annuity_id}/valuations", response_model=AnnuityValuationSchema)
async def add_valuation(
    annuity_id: str,
    valuation_data: AnnuityValuationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a valuation record for an annuity"""
    # Verify annuity exists and belongs to user
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    # Check if valuation already exists for this date
    existing = db.query(AnnuityValuation).filter(
        AnnuityValuation.annuity_id == annuity_id,
        AnnuityValuation.valuation_date == valuation_data.valuation_date
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Valuation already exists for this date")
    
    valuation = AnnuityValuation(
        annuity_id=annuity_id,
        user_id=current_user.id,
        **valuation_data.dict(exclude={'annuity_id'})
    )
    
    # Update the annuity's current accumulation value
    annuity.accumulation_value = valuation_data.accumulation_value
    annuity.cash_surrender_value = valuation_data.cash_surrender_value
    
    db.add(valuation)
    db.commit()
    db.refresh(valuation)
    return valuation

@router.get("/{annuity_id}/valuations", response_model=List[AnnuityValuationSchema])
async def get_valuations(
    annuity_id: str,
    limit: int = Query(50, description="Number of valuations to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get valuation history for an annuity"""
    # Verify annuity exists and belongs to user
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    valuations = db.query(AnnuityValuation).filter(
        AnnuityValuation.annuity_id == annuity_id
    ).order_by(desc(AnnuityValuation.valuation_date)).limit(limit).all()
    
    return valuations

# Utility endpoints
@router.get("/{annuity_id}/performance")
async def get_annuity_performance(
    annuity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate performance metrics for an annuity"""
    annuity = db.query(AnnuityModel).filter(
        AnnuityModel.id == annuity_id,
        AnnuityModel.user_id == current_user.id
    ).first()
    
    if not annuity:
        raise HTTPException(status_code=404, detail="Annuity not found")
    
    # Calculate total contributions
    total_contributions = float(annuity.initial_premium)
    contributions = db.query(AnnuityContribution).filter(
        AnnuityContribution.annuity_id == annuity_id
    ).all()
    total_contributions += sum(float(contrib.amount) for contrib in contributions)
    
    # Current value
    current_value = float(annuity.accumulation_value or annuity.initial_premium)
    
    # Calculate returns
    total_return = current_value - total_contributions
    return_percentage = (total_return / total_contributions * 100) if total_contributions > 0 else 0
    
    # Calculate days since purchase
    days_held = (date.today() - annuity.purchase_date).days
    years_held = days_held / 365.25
    
    # Annualized return
    annualized_return = 0
    if years_held > 0 and total_contributions > 0:
        annualized_return = ((current_value / total_contributions) ** (1 / years_held) - 1) * 100
    
    return {
        "total_contributions": total_contributions,
        "current_value": current_value,
        "total_return": total_return,
        "return_percentage": round(return_percentage, 2),
        "annualized_return": round(annualized_return, 2),
        "days_held": days_held,
        "years_held": round(years_held, 2)
    }
