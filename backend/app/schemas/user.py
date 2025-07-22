"""
User Pydantic schemas for API serialization.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    theme: Optional[str] = "sanctuary_builder"

class UserCreate(UserBase):
    """Schema for creating a user."""
    pass

class UserUpdate(BaseModel):
    """Schema for updating a user."""
    theme: Optional[str] = None

class UserInDB(UserBase):
    """Schema for user in database."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDB):
    """Public user schema."""
    pass

