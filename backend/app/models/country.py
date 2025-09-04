"""
Country model for user location information.
"""
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base


class Country(Base):
    __tablename__ = "countries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(2), unique=True, nullable=False)  # ISO country code
    name = Column(String(255), nullable=False)
