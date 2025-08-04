"""
User settings API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsCreate, UserSettingsUpdate, UserSettingsResponse
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings."""
    try:
        settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        if not settings:
            # Create default settings if none exist
            settings = UserSettings(
                user_id=current_user.id,
                currency="USD",
                date_format="MM/DD/YYYY",
                dark_mode=False
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        return settings
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
    """Create or update user settings."""
    try:
        # Check if settings already exist
        existing_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        if existing_settings:
            # Update existing settings
            for field, value in settings_data.dict(exclude_unset=True).items():
                setattr(existing_settings, field, value)
            db.commit()
            db.refresh(existing_settings)
            return existing_settings
        else:
            # Create new settings
            settings = UserSettings(
                user_id=current_user.id,
                **settings_data.dict(exclude_unset=True)
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
            return settings
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
    """Update user settings."""
    try:
        settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
        
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User settings not found"
            )
        
        # Update settings
        for field, value in settings_data.dict(exclude_unset=True).items():
            setattr(settings, field, value)
        
        db.commit()
        db.refresh(settings)
        return settings
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user settings"
        )
