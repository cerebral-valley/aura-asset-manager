"""
Goals API endpoints for goal management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.user_goals import UserGoal
from app.schemas.goals import GoalCreate, GoalUpdate, GoalResponse
from typing import List
from uuid import UUID
from datetime import datetime, date

router = APIRouter()

@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all goals for the current user."""
    goals = db.query(UserGoal).filter(
        UserGoal.user_id == current_user.id
    ).all()
    
    print(f"🎯 Found {len(goals)} goals for user {current_user.id}")
    for goal in goals:
        print(f"🎯 Goal: {goal.title}, type: {goal.goal_type}, target: {goal.target_amount}, completed: {goal.goal_completed}")
    
    return goals

@router.post("/", response_model=GoalResponse)
async def create_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new goal."""
    db_goal = UserGoal(**goal.model_dump(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    print(f"🎯 Created goal: {db_goal.title} (id: {db_goal.id})")
    
    return db_goal

@router.get("/{goal_id}/", response_model=GoalResponse)
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

@router.put("/{goal_id}/", response_model=GoalResponse)
async def update_goal(
    goal_id: UUID,
    goal_update: GoalUpdate,
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
    
    # Update only provided fields
    update_data = goal_update.model_dump(exclude_unset=True)
    
    # Special handling for goal completion
    if 'goal_completed' in update_data:
        if update_data['goal_completed']:
            # Only set completion date if not already set (preserve original)
            if goal.completed_date is None:
                update_data['completed_date'] = date.today()
            # If goal.completed_date already exists, preserve it
        else:
            # Un-complete the goal - clear completion date
            update_data['completed_date'] = None
    
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.commit()
    db.refresh(goal)
    
    print(f"🎯 Updated goal: {goal.title} (id: {goal.id})")
    
    return goal

@router.delete("/{goal_id}/")
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
    
    goal_title = goal.title
    db.delete(goal)
    db.commit()
    
    print(f"🎯 Deleted goal: {goal_title} (id: {goal_id})")
    
    return {"message": "Goal deleted successfully", "goal_id": str(goal_id)}
