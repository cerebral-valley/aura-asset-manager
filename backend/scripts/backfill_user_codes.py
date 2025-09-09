#!/usr/bin/env python3
"""
Backfill script to generate user codes for existing users.
Run this script after applying the 005_add_user_code migration.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.services.user_code_service import UserCodeService

def backfill_user_codes():
    """Generate user codes for all existing users who don't have one."""
    db: Session = SessionLocal()
    
    try:
        # Get all users without user_code
        users_without_code = db.query(User).filter(User.user_code.is_(None)).all()
        
        print(f"Found {len(users_without_code)} users without user codes")
        
        for user in users_without_code:
            try:
                # Generate unique user code
                user_code = UserCodeService.generate_unique_user_code(db)
                user.user_code = user_code
                print(f"Generated code '{user_code}' for user {user.email} (ID: {user.id})")
            except Exception as e:
                print(f"Failed to generate code for user {user.email} (ID: {user.id}): {e}")
                continue
        
        # Commit all changes
        db.commit()
        print(f"Successfully backfilled user codes for {len(users_without_code)} users")
        
    except Exception as e:
        print(f"Error during backfill: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting user code backfill...")
    backfill_user_codes()
    print("Backfill completed successfully!")
