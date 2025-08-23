from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Feedback(Base):
    __tablename__ = "feedback"
    feedback_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    feedback_text = Column(String(2500), nullable=False)
    feedback_date = Column(DateTime(timezone=True), server_default=func.now())
