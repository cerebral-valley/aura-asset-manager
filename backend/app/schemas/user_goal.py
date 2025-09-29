"""
Pydantic schemas for UserGoal model.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
import uuid

class UserGoalBase(BaseModel):
    """Base schema for UserGoal."""
    goal_type: str = Field(..., description="Type of goal: 'net_worth' or 'custom'")
    title: str = Field(..., max_length=255, description="Goal title")
    target_amount: Decimal = Field(..., description="Target amount for the goal")
    target_date: Optional[date] = Field(None, description="Target date for achieving the goal")

class UserGoalCreate(UserGoalBase):
    """Schema for creating a new goal."""
    pass

class UserGoalUpdate(BaseModel):
    """Schema for updating an existing goal."""
    title: Optional[str] = Field(None, max_length=255, description="Goal title")
    target_amount: Optional[Decimal] = Field(None, description="Target amount for the goal")
    target_date: Optional[date] = Field(None, description="Target date for achieving the goal")
    goal_completed: Optional[bool] = Field(None, description="Whether the goal is completed")
    completed_date: Optional[date] = Field(None, description="Date when the goal was completed")

class UserGoalInDB(UserGoalBase):
    """Schema for goal as stored in database."""
    id: uuid.UUID
    user_id: uuid.UUID
    goal_completed: bool
    completed_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserGoal(UserGoalInDB):
    """Schema for goal with full details."""
    pass