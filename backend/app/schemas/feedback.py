from pydantic import BaseModel, constr
from uuid import UUID
from datetime import datetime

class FeedbackCreate(BaseModel):
    feedback_text: str

class FeedbackOut(BaseModel):
    feedback_id: UUID
    user_id: UUID
    feedback_text: str
    feedback_date: datetime

    class Config:
        orm_mode = True
