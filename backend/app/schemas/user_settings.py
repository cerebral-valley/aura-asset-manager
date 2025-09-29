"""
User settings schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSettingsBase(BaseModel):
    """Base user settings schema."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    recovery_email: Optional[EmailStr] = None
    country: Optional[str] = None
    currency: str = "USD"
    date_format: str = "MM/DD/YYYY"
    dark_mode: bool = False
    theme: str = "default"

class UserSettingsCreate(UserSettingsBase):
    """Schema for creating user settings."""
    pass

class UserSettingsUpdate(UserSettingsBase):
    """Schema for updating user settings."""
    pass

class UserSettingsResponse(UserSettingsBase):
    """Schema for user settings response."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
