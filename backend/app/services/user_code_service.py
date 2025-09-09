"""
User code generation service.
"""

import secrets
import string
from sqlalchemy.orm import Session
from app.models.user import User

class UserCodeService:
    """Service for generating and managing user codes."""
    
    @staticmethod
    def generate_user_code() -> str:
        """Generate a random 8-character alphanumeric user code."""
        characters = string.ascii_letters + string.digits  # A-Z, a-z, 0-9
        return ''.join(secrets.choice(characters) for _ in range(8))
    
    @staticmethod
    def generate_unique_user_code(db: Session, max_attempts: int = 3) -> str:
        """
        Generate a unique user code, checking for collisions.
        
        Args:
            db: Database session
            max_attempts: Maximum attempts to generate unique code
            
        Returns:
            Unique user code
            
        Raises:
            ValueError: If unable to generate unique code after max_attempts
        """
        for attempt in range(max_attempts):
            code = UserCodeService.generate_user_code()
            
            # Check if code already exists
            existing_user = db.query(User).filter(User.user_code == code).first()
            if not existing_user:
                return code
        
        raise ValueError(f"Failed to generate unique user code after {max_attempts} attempts")
    
    @staticmethod
    def ensure_user_has_code(db: Session, user_id: str) -> str:
        """
        Ensure user has a user_code, generating one if needed.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User code (existing or newly generated)
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        if user.user_code is not None:
            return str(user.user_code)
        
        # Generate new code for user
        new_code = UserCodeService.generate_unique_user_code(db)
        user.user_code = new_code
        db.commit()
        
        return new_code
