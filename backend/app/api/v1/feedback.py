from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/feedback", response_model=FeedbackOut)
def submit_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if len(feedback.feedback_text) > 2500:
        raise HTTPException(status_code=400, detail="Feedback too long (max 500 words)")
    new_feedback = Feedback(
        user_id=current_user.id,
        feedback_text=feedback.feedback_text
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback
