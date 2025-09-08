"""
Profile API endpoints for user profile management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import ProfileUpdate, UserProfile

router = APIRouter()


@router.get("/countries")
async def get_countries():
    """Get all available countries - TEST VERSION."""
    # Return static list of countries for testing
    return [
        {"code": "US", "name": "United States"},
        {"code": "IN", "name": "India"},
        {"code": "CA", "name": "Canada"},
        {"code": "AU", "name": "Australia"},
        {"code": "GB", "name": "United Kingdom"},
        {"code": "DE", "name": "Germany"},
        {"code": "FR", "name": "France"},
        {"code": "JP", "name": "Japan"},
        {"code": "CN", "name": "China"},
        {"code": "BR", "name": "Brazil"},
        {"code": "RU", "name": "Russia"},
        {"code": "KR", "name": "South Korea"},
        {"code": "IT", "name": "Italy"},
        {"code": "ES", "name": "Spain"},
        {"code": "NL", "name": "Netherlands"},
        {"code": "SE", "name": "Sweden"},
        {"code": "NO", "name": "Norway"},
        {"code": "DK", "name": "Denmark"},
        {"code": "CH", "name": "Switzerland"},
        {"code": "AT", "name": "Austria"},
    ]


@router.get("/options")
async def get_profile_options():
    """Get available options for profile dropdowns."""
    return {
        "marital_status_options": [
            {"value": "single", "label": "Single"},
            {"value": "married", "label": "Married"},
            {"value": "divorced", "label": "Divorced"},
            {"value": "widowed", "label": "Widowed"},
            {"value": "separated", "label": "Separated"}
        ],
        "gender_options": [
            {"value": "male", "label": "Male"},
            {"value": "female", "label": "Female"},
            {"value": "other", "label": "Other"},
            {"value": "prefer_not_to_say", "label": "Prefer not to say"}
        ],
        "occupation_options": [
            {"value": "employed", "label": "Employed"},
            {"value": "self_employed", "label": "Self Employed"},
            {"value": "unemployed", "label": "Unemployed"},
            {"value": "retired", "label": "Retired"},
            {"value": "student", "label": "Student"},
            {"value": "homemaker", "label": "Homemaker"},
            {"value": "other", "label": "Other"}
        ],
        "risk_appetite_options": [
            {
                "value": "Low", 
                "label": "Low", 
                "description": "Conservative approach, prioritizing capital preservation over growth"
            },
            {
                "value": "Moderate", 
                "label": "Moderate", 
                "description": "Balanced approach between growth potential and risk management"
            },
            {
                "value": "High", 
                "label": "High", 
                "description": "Aggressive approach, accepting higher risk for potential greater returns"
            }
        ]
    }


@router.get("", response_model=UserProfile)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    return current_user


@router.put("", response_model=UserProfile)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    try:
        # Update profile fields
        update_data = profile_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        return current_user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/test")
async def test_endpoint():
    """Simple test endpoint."""
    return {"message": "Profile API is working!", "timestamp": "2025-01-04"}
