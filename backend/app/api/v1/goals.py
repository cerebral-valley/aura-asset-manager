"""
User Goals API endpoints for financial goal management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.user_goal import UserGoal
from app.schemas.user_goal import UserGoal as UserGoalSchema, UserGoalCreate, UserGoalUpdate
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[UserGoalSchema])
async def get_goals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    include_completed: bool = False
):
    """Get all goals for the current user."""
    query = db.query(UserGoal).filter(UserGoal.user_id == current_user.id)
    
    if not include_completed:
        query = query.filter(UserGoal.goal_completed == False)
    
    goals = query.all()
    
    print(f"🎯 Found {len(goals)} goals for user {current_user.id}")
    for goal in goals:
        print(f"🎯 Goal: {goal.title}, type: {goal.goal_type}, target: {goal.target_amount}, completed: {goal.goal_completed}")
    
    return goals

@router.post("/", response_model=UserGoalSchema)
async def create_goal(
    goal_data: UserGoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new goal for the current user."""
    
    # Validate goal type
    if goal_data.goal_type not in ['net_worth', 'custom']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal type must be 'net_worth' or 'custom'"
        )
    
    # Check if user already has a net worth goal (only one allowed)
    if goal_data.goal_type == 'net_worth':
        existing_net_worth_goal = db.query(UserGoal).filter(
            and_(
                UserGoal.user_id == current_user.id,
                UserGoal.goal_type == 'net_worth',
                UserGoal.goal_completed == False
            )
        ).first()
        
        if existing_net_worth_goal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active net worth goal"
            )
    
    # Check custom goal limit (maximum 5 active custom goals)
    if goal_data.goal_type == 'custom':
        active_custom_goals = db.query(UserGoal).filter(
            and_(
                UserGoal.user_id == current_user.id,
                UserGoal.goal_type == 'custom',
                UserGoal.goal_completed == False
            )
        ).count()
        
        if active_custom_goals >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum of 5 active custom goals allowed"
            )
    
    # Create the goal
    new_goal = UserGoal(
        user_id=current_user.id,
        **goal_data.model_dump()
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    
    print(f"🎯 Created new goal: {new_goal.title} for user {current_user.id}")
    
    return new_goal

@router.get("/{goal_id}", response_model=UserGoalSchema)
async def get_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific goal by ID."""
    goal = db.query(UserGoal).filter(
        UserGoal.id == goal_id,
        UserGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal

@router.put("/{goal_id}", response_model=UserGoalSchema)
async def update_goal(
    goal_id: UUID,
    goal_update: UserGoalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing goal."""
    goal = db.query(UserGoal).filter(
        UserGoal.id == goal_id,
        UserGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    update_data = goal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    
    print(f"🎯 Updated goal: {goal.title} for user {current_user.id}")
    
    return goal

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a goal."""
    goal = db.query(UserGoal).filter(
        UserGoal.id == goal_id,
        UserGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    
    print(f"🎯 Deleted goal: {goal.title} for user {current_user.id}")
    
    return {"message": "Goal deleted successfully"}

@router.patch("/{goal_id}/complete", response_model=UserGoalSchema)
async def complete_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a goal as completed."""
    goal = db.query(UserGoal).filter(
        UserGoal.id == goal_id,
        UserGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    if goal.goal_completed:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal is already completed"
        )
    
    from datetime import date
    goal.goal_completed = True  # type: ignore
    goal.completed_date = date.today()  # type: ignore
    
    db.commit()
    db.refresh(goal)
    
    print(f"🎯 Completed goal: {goal.title} for user {current_user.id}")
    
    return goal