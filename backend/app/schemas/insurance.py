"""
Insurance Pydantic schemas for API serialization.
"""

from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, Dict, Any
from uuid import UUID
from decimal import Decimal

class InsurancePolicyBase(BaseModel):
    """Base insurance policy schema."""
    policy_name: str
    policy_type: str
    provider: Optional[str] = None
    policy_number: Optional[str] = None
    coverage_amount: Decimal
    premium_amount: Optional[Decimal] = None
    premium_frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    renewal_date: Optional[date] = None
    notes: Optional[str] = None
    policy_metadata: Optional[Dict[str, Any]] = None
    status: Optional[str] = "active"

    @validator('premium_amount', pre=True)
    def validate_premium_amount(cls, v):
        """Handle empty strings for optional Decimal fields."""
        if v == "" or v is None:
            return None
        return v

    @validator('coverage_amount', pre=True)
    def validate_coverage_amount(cls, v):
        """Handle empty strings for required Decimal fields."""
        if v == "" or v is None:
            raise ValueError("Coverage amount is required")
        return v

    @validator('provider', 'policy_number', 'notes', pre=True)
    def validate_optional_strings(cls, v):
        """Handle empty strings for optional string fields."""
        if v == "":
            return None
        return v

    @validator('start_date', 'end_date', 'renewal_date', pre=True)
    def validate_optional_dates(cls, v):
        """Handle empty strings for optional date fields."""
        if v == "" or v is None:
            return None
        return v

class InsurancePolicyCreate(InsurancePolicyBase):
    """Schema for creating an insurance policy."""
    pass

class InsurancePolicyUpdate(BaseModel):
    """Schema for updating an insurance policy."""
    policy_name: Optional[str] = None
    policy_type: Optional[str] = None
    provider: Optional[str] = None
    policy_number: Optional[str] = None
    coverage_amount: Optional[Decimal] = None
    premium_amount: Optional[Decimal] = None
    premium_frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    renewal_date: Optional[date] = None
    notes: Optional[str] = None
    policy_metadata: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

    @validator('premium_amount', 'coverage_amount', pre=True)
    def validate_optional_decimal_fields(cls, v):
        """Handle empty strings for optional Decimal fields in updates."""
        if v == "" or v is None:
            return None
        return v

    @validator('provider', 'policy_number', 'notes', 'policy_name', 'policy_type', pre=True)
    def validate_optional_string_fields(cls, v):
        """Handle empty strings for optional string fields in updates."""
        if v == "":
            return None
        return v

    @validator('start_date', 'end_date', 'renewal_date', pre=True)
    def validate_optional_date_fields(cls, v):
        """Handle empty strings for optional date fields in updates."""
        if v == "" or v is None:
            return None
        return v

class InsurancePolicyInDB(InsurancePolicyBase):
    """Schema for insurance policy in database."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class InsurancePolicy(InsurancePolicyInDB):
    """Public insurance policy schema."""
    pass

class InsurancePolicySummary(BaseModel):
    """Summary schema for insurance policy list views."""
    id: UUID
    policy_name: str
    policy_type: str
    coverage_amount: Decimal
    renewal_date: Optional[date] = None
    
    class Config:
        from_attributes = True

