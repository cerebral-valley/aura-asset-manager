"""
Goal Pydantic schemas for API serialization.
"""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from uuid import UUID
from decimal import Decimal

class GoalBase(BaseModel):
    """Base goal schema."""
    goal_type: str  # 'net worth', 'asset', 'expense', 'income'
    title: str
    target_amount: Decimal
    target_date: Optional[date] = None
    allocate_amount: Decimal = Decimal('0')

class GoalCreate(GoalBase):
    """Schema for creating a goal."""
    pass

class GoalUpdate(BaseModel):
    """Schema for updating a goal."""
    goal_type: Optional[str] = None
    title: Optional[str] = None
    target_amount: Optional[Decimal] = None
    target_date: Optional[date] = None
    allocate_amount: Optional[Decimal] = None
    goal_completed: Optional[bool] = None
    completed_date: Optional[date] = None

class GoalResponse(GoalBase):
    """Schema for goal response."""
    id: UUID
    user_id: UUID
    goal_completed: bool
    completed_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
