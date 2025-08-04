from typing import Optional, Dict, Any
from pydantic import BaseModel, validator
from datetime import date, datetime
from decimal import Decimal

class PaymentScheduleBase(BaseModel):
    related_id: str
    related_type: str
    schedule_type: str
    amount: Decimal
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    schedule_metadata: Optional[Dict[str, Any]] = {}

    @validator('related_type')
    def validate_related_type(cls, v):
        if v not in ['asset', 'insurance_policy']:
            raise ValueError('related_type must be either "asset" or "insurance_policy"')
        return v

    @validator('schedule_type')
    def validate_schedule_type(cls, v):
        if v not in ['payment_out', 'payment_in', 'premium']:
            raise ValueError('schedule_type must be one of: payment_out, payment_in, premium')
        return v

    @validator('frequency')
    def validate_frequency(cls, v):
        if v not in ['monthly', 'quarterly', 'semi-annually', 'annually']:
            raise ValueError('frequency must be one of: monthly, quarterly, semi-annually, annually')
        return v

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('amount must be greater than 0')
        return v

class PaymentScheduleCreate(PaymentScheduleBase):
    next_payment_date: Optional[date] = None

class PaymentScheduleUpdate(BaseModel):
    amount: Optional[Decimal] = None
    frequency: Optional[str] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    schedule_metadata: Optional[Dict[str, Any]] = None

    @validator('frequency')
    def validate_frequency(cls, v):
        if v is not None and v not in ['monthly', 'quarterly', 'semi-annually', 'annually']:
            raise ValueError('frequency must be one of: monthly, quarterly, semi-annually, annually')
        return v

    @validator('amount')
    def validate_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError('amount must be greater than 0')
        return v

class PaymentSchedule(PaymentScheduleBase):
    id: str
    user_id: str
    next_payment_date: Optional[date] = None
    total_payments_made: int = 0
    total_amount_paid: Decimal = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaymentProjection(BaseModel):
    date: date
    amount: Decimal
    period: int

    class Config:
        from_attributes = True
