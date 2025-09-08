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


# Profile schemas
from decimal import Decimal
from datetime import date

class ProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    marital_status: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    children: Optional[int] = None
    dependents: Optional[int] = None
    city: Optional[str] = None
    pin_code: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    nationality: Optional[str] = None
    phone_number: Optional[str] = None
    annual_income: Optional[Decimal] = None
    occupation: Optional[str] = None
    risk_appetite: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfile(UserInDB):
    """Schema for complete user profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    marital_status: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    children: Optional[int] = None
    dependents: Optional[int] = None
    city: Optional[str] = None
    pin_code: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    nationality: Optional[str] = None
    phone_number: Optional[str] = None
    annual_income: Optional[Decimal] = None
    occupation: Optional[str] = None
    risk_appetite: Optional[str] = None
    
    class Config:
        from_attributes = True
