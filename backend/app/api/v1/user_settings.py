"""
User settings API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate, UserSettingsResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings from the user record."""
    try:
        # Return the current user with settings fields
        return UserSettingsResponse(
            id=str(current_user.id),
            user_id=str(current_user.id),
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            recovery_email=current_user.recovery_email,
            country=current_user.country,
            currency=current_user.currency or "USD",
            date_format=current_user.date_format or "MM/DD/YYYY",
            dark_mode=current_user.dark_mode or False,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
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
        # Update the current user record with the settings
        for field, value in settings_data.dict(exclude_unset=True).items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        return UserSettingsResponse(
            id=str(current_user.id),
            user_id=str(current_user.id),
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            recovery_email=current_user.recovery_email,
            country=current_user.country,
            currency=current_user.currency or "USD",
            date_format=current_user.date_format or "MM/DD/YYYY",
            dark_mode=current_user.dark_mode or False,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
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
        # Update the current user record with the settings
        for field, value in settings_data.dict(exclude_unset=True).items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        return UserSettingsResponse(
            id=str(current_user.id),
            user_id=str(current_user.id),
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            recovery_email=current_user.recovery_email,
            country=current_user.country,
            currency=current_user.currency or "USD",
            date_format=current_user.date_format or "MM/DD/YYYY",
            dark_mode=current_user.dark_mode or False,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
    except Exception as e:
        logger.error(f"Error updating user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user settings"
        )
