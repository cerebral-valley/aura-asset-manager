from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import uuid

from app.api.deps import get_current_user, get_db
from app.schemas.payment_schedule import (
    PaymentSchedule, 
    PaymentScheduleCreate, 
    PaymentScheduleUpdate,
    PaymentProjection
)
from app.models.payment_schedule import PaymentSchedule as PaymentScheduleModel
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[PaymentSchedule])
def get_payment_schedules(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    related_id: Optional[str] = None,
    related_type: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get payment schedules for the current user"""
    query = db.query(PaymentScheduleModel).filter(PaymentScheduleModel.user_id == current_user.id)
    
    if related_id:
        query = query.filter(PaymentScheduleModel.related_id == related_id)
    if related_type:
        query = query.filter(PaymentScheduleModel.related_type == related_type)
    if is_active is not None:
        query = query.filter(PaymentScheduleModel.is_active == is_active)
    
    schedules = query.offset(skip).limit(limit).all()
    return schedules

@router.get("/upcoming", response_model=List[PaymentSchedule])
def get_upcoming_payments(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days_ahead: int = 90
):
    """Get upcoming payments for the next N days"""
    end_date = date.today() + timedelta(days=days_ahead)
    
    schedules = db.query(PaymentScheduleModel).filter(
        PaymentScheduleModel.user_id == current_user.id,
        PaymentScheduleModel.is_active == True,
        PaymentScheduleModel.next_payment_date <= end_date,
        PaymentScheduleModel.next_payment_date.isnot(None)
    ).order_by(PaymentScheduleModel.next_payment_date).all()
    
    return schedules

@router.get("/{schedule_id}", response_model=PaymentSchedule)
def get_payment_schedule(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    schedule_id: str
):
    """Get a specific payment schedule"""
    schedule = db.query(PaymentScheduleModel).filter(
        PaymentScheduleModel.id == schedule_id,
        PaymentScheduleModel.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment schedule not found"
        )
    
    return schedule

@router.post("/", response_model=PaymentSchedule)
def create_payment_schedule(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    schedule_in: PaymentScheduleCreate
):
    """Create a new payment schedule"""
    schedule_data = schedule_in.dict()
    schedule_data["user_id"] = current_user.id
    schedule_data["id"] = str(uuid.uuid4())
    
    # Calculate next payment date if not provided
    if not schedule_data.get("next_payment_date"):
        schedule_data["next_payment_date"] = schedule_data["start_date"]
    
    schedule = PaymentScheduleModel(**schedule_data)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    
    return schedule

@router.put("/{schedule_id}", response_model=PaymentSchedule)
def update_payment_schedule(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    schedule_id: str,
    schedule_in: PaymentScheduleUpdate
):
    """Update a payment schedule"""
    schedule = db.query(PaymentScheduleModel).filter(
        PaymentScheduleModel.id == schedule_id,
        PaymentScheduleModel.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment schedule not found"
        )
    
    update_data = schedule_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(schedule, field, value)
    
    schedule.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(schedule)
    
    return schedule

@router.post("/{schedule_id}/record-payment")
def record_payment(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    schedule_id: str,
    payment_amount: float,
    payment_date: Optional[date] = None
):
    """Record a payment and update the schedule"""
    schedule = db.query(PaymentScheduleModel).filter(
        PaymentScheduleModel.id == schedule_id,
        PaymentScheduleModel.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment schedule not found"
        )
    
    if payment_date is None:
        payment_date = date.today()
    
    # Update payment tracking
    schedule.total_payments_made += 1
    schedule.total_amount_paid += payment_amount
    
    # Calculate next payment date
    next_date = calculate_next_payment_date(payment_date, schedule.frequency)
    
    # Check if we've reached the end date
    if schedule.end_date and next_date > schedule.end_date:
        schedule.is_active = False
        schedule.next_payment_date = None
    else:
        schedule.next_payment_date = next_date
    
    schedule.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(schedule)
    
    return {"message": "Payment recorded successfully", "schedule": schedule}

@router.get("/{schedule_id}/projection", response_model=List[PaymentProjection])
def get_payment_projection(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    schedule_id: str,
    periods: int = 12
):
    """Get payment projection for the next N periods"""
    schedule = db.query(PaymentScheduleModel).filter(
        PaymentScheduleModel.id == schedule_id,
        PaymentScheduleModel.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment schedule not found"
        )
    
    if not schedule.next_payment_date:
        return []
    
    projection = []
    current_date = schedule.next_payment_date
    
    for i in range(periods):
        # Check if we've reached the end date
        if schedule.end_date and current_date > schedule.end_date:
            break
        
        projection.append(PaymentProjection(
            date=current_date,
            amount=schedule.amount,
            period=i + 1
        ))
        
        # Calculate next payment date
        current_date = calculate_next_payment_date(current_date, schedule.frequency)
    
    return projection

@router.delete("/{schedule_id}")
def delete_payment_schedule(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    schedule_id: str
):
    """Delete a payment schedule"""
    schedule = db.query(PaymentScheduleModel).filter(
        PaymentScheduleModel.id == schedule_id,
        PaymentScheduleModel.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment schedule not found"
        )
    
    db.delete(schedule)
    db.commit()
    
    return {"message": "Payment schedule deleted successfully"}

def calculate_next_payment_date(current_date: date, frequency: str) -> date:
    """Calculate the next payment date based on frequency"""
    if frequency == "monthly":
        if current_date.month == 12:
            return current_date.replace(year=current_date.year + 1, month=1)
        else:
            return current_date.replace(month=current_date.month + 1)
    elif frequency == "quarterly":
        new_month = current_date.month + 3
        if new_month > 12:
            return current_date.replace(year=current_date.year + 1, month=new_month - 12)
        else:
            return current_date.replace(month=new_month)
    elif frequency == "semi-annually":
        new_month = current_date.month + 6
        if new_month > 12:
            return current_date.replace(year=current_date.year + 1, month=new_month - 12)
        else:
            return current_date.replace(month=new_month)
    elif frequency == "annually":
        return current_date.replace(year=current_date.year + 1)
    else:
        return current_date
