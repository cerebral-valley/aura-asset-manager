"""
Insurance Pydantic schemas for API serialization.
"""

from pydantic import BaseModel
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
    insurance_metadata: Optional[Dict[str, Any]] = None

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
    insurance_metadata: Optional[Dict[str, Any]] = None

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

