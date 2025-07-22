"""
Dashboard API endpoints for overview data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.asset import Asset
from app.models.transaction import Transaction
from app.models.insurance import InsurancePolicy
from typing import Dict, List, Any
from decimal import Decimal

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get dashboard summary data."""
    
    # Calculate total net worth
    total_assets = db.query(func.sum(Asset.current_value)).filter(
        Asset.user_id == current_user.id
    ).scalar() or Decimal('0')
    
    # Calculate total insurance coverage
    total_insurance = db.query(func.sum(InsurancePolicy.coverage_amount)).filter(
        InsurancePolicy.user_id == current_user.id
    ).scalar() or Decimal('0')
    
    # Get asset allocation data
    asset_allocation = db.query(
        Asset.asset_type,
        func.sum(Asset.current_value).label('total_value')
    ).filter(
        Asset.user_id == current_user.id
    ).group_by(Asset.asset_type).all()
    
    # Format asset allocation for frontend
    allocation_data = [
        {
            "name": allocation.asset_type.replace('_', ' ').title(),
            "value": float(allocation.total_value) if allocation.total_value else 0
        }
        for allocation in asset_allocation
    ]
    
    # Get recent transactions (last 5)
    recent_transactions = db.query(Transaction).join(Asset).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).limit(5).all()
    
    # Format recent transactions
    transaction_data = [
        {
            "id": str(transaction.id),
            "asset_name": transaction.asset.name,
            "transaction_type": transaction.transaction_type,
            "amount": float(transaction.amount) if transaction.amount else None,
            "date": transaction.transaction_date.isoformat()
        }
        for transaction in recent_transactions
    ]
    
    return {
        "net_worth": float(total_assets),
        "total_insurance_coverage": float(total_insurance),
        "asset_allocation": allocation_data,
        "recent_transactions": transaction_data,
        "user_theme": current_user.theme
    }

