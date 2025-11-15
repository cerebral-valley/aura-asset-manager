"""
User settings API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.referral_code import ReferralCode
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate, UserSettingsResponse
from app.services.user_code_service import UserCodeService
from pydantic import BaseModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _process_referral_code(referral_code_value, current_user: User, db: Session):
    """Validate and assign a referral code to the current user."""
    if referral_code_value is None:
        return

    normalized = referral_code_value.strip().upper()
    if not normalized:
        return

    if len(normalized) != 10 or not normalized.isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral code must be a 10 character alphanumeric code."
        )

    # If the user already has a code, ensure it's the same one
    if current_user.referral_code:
        if current_user.referral_code == normalized:
            return
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral code already set for this account."
        )

    referral_entry = db.query(ReferralCode).filter(ReferralCode.code == normalized).first()
    if not referral_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid referral code."
        )

    if referral_entry.assigned_user_id and referral_entry.assigned_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral code already used. Please enter a different code."
        )

    referral_entry.assigned_user_id = current_user.id
    referral_entry.assigned_email = current_user.email
    referral_entry.claimed_at = datetime.utcnow()
    current_user.referral_code = normalized
    db.add(referral_entry)

@router.get("", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings from the user record."""
    try:
        # Return the current user with settings fields using Pydantic from_attributes
        user_dict = {
            "id": str(current_user.id),
            "user_id": str(current_user.id),  # Map id to user_id for schema compatibility
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "recovery_email": current_user.recovery_email,
            "country": current_user.country,
            "currency": current_user.currency or "USD",
            "date_format": current_user.date_format or "MM/DD/YYYY",
            "dark_mode": current_user.dark_mode or False,
            "theme": current_user.theme or "default",
            "font_preference": current_user.font_preference or "guardian_mono",
            "referral_code": current_user.referral_code,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
        }
        return UserSettingsResponse(**user_dict)
    except Exception as e:
        logger.error(f"Error fetching user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user settings"
        )

@router.post("", response_model=UserSettingsResponse)
async def create_user_settings(
    settings_data: UserSettingsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user settings in the user record."""
    try:
        update_data = settings_data.dict(exclude_unset=True)
        referral_code_value = update_data.pop('referral_code', None)
        _process_referral_code(referral_code_value, current_user, db)

        # Update the current user record with the settings
        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        user_dict = {
            "id": str(current_user.id),
            "user_id": str(current_user.id),  # Map id to user_id for schema compatibility
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "recovery_email": current_user.recovery_email,
            "country": current_user.country,
            "currency": current_user.currency or "USD",
            "date_format": current_user.date_format or "MM/DD/YYYY",
            "dark_mode": current_user.dark_mode or False,
            "theme": current_user.theme or "default",
            "font_preference": current_user.font_preference or "guardian_mono",
            "referral_code": current_user.referral_code,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
        }
        return UserSettingsResponse(**user_dict)
    except Exception as e:
        logger.error(f"Error creating user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user settings"
        )

@router.put("", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user settings in the user record."""
    try:
        update_data = settings_data.dict(exclude_unset=True)
        referral_code_value = update_data.pop('referral_code', None)
        _process_referral_code(referral_code_value, current_user, db)

        # Update the current user record with the settings
        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        user_dict = {
            "id": str(current_user.id),
            "user_id": str(current_user.id),  # Map id to user_id for schema compatibility
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "recovery_email": current_user.recovery_email,
            "country": current_user.country,
            "currency": current_user.currency or "USD",
            "date_format": current_user.date_format or "MM/DD/YYYY",
            "dark_mode": current_user.dark_mode or False,
            "theme": current_user.theme or "default",
            "font_preference": current_user.font_preference or "guardian_mono",
            "referral_code": current_user.referral_code,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
        }
        return UserSettingsResponse(**user_dict)
    except Exception as e:
        logger.error(f"Error updating user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user settings"
        )


class UserCodeResponse(BaseModel):
    user_code: str
    
    class Config:
        json_encoders = {
            # Add any custom encoders if needed
        }


@router.get("/user-code", response_model=UserCodeResponse)
async def get_user_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's unique user code, generating one if needed."""
    try:
        # Ensure the user has a user code using static method
        user_code = UserCodeService.ensure_user_has_code(db, str(current_user.id))
        
        return UserCodeResponse(user_code=user_code)
    except Exception as e:
        logger.error(f"Error fetching user code for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user code"
        )
