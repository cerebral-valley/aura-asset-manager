"""
Dashboard API endpoints for overview data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.asset import Asset
from app.models.transaction import Transaction
from app.models.insurance import InsurancePolicy
from typing import Dict, List, Any
from decimal import Decimal

router = APIRouter()

def get_latest_market_value(db: Session, asset: Asset, user_id: int) -> float:
    """
    Get the latest market value for an asset using the same logic as Assets page.
    Priority: Latest market value transaction -> Latest current_value transaction -> Asset current_value -> Asset initial_value
    """
    # Get all transactions for this asset
    asset_transactions = db.query(Transaction).filter(
        Transaction.asset_id == asset.id,
        Transaction.user_id == user_id
    ).order_by(desc(Transaction.transaction_date)).all()
    
    if not asset_transactions:
        # Fallback to asset's static values
        return float(asset.current_value or asset.initial_value or 0)
    
    # Look for the latest market value update transaction
    for transaction in asset_transactions:
        if transaction.transaction_type == 'update_market_value' and transaction.amount is not None:
            return float(transaction.amount)
    
    # If no market value update, look for transactions with current_value
    for transaction in asset_transactions:
        if transaction.current_value is not None and transaction.current_value > 0:
            return float(transaction.current_value)
    
    # Final fallback to asset's static values
    return float(asset.current_value or asset.initial_value or 0)

@router.get("/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get dashboard summary data using Assets page calculation logic."""
    
    # Get all assets for the user
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    
    # Calculate total net worth using LATEST MARKET VALUE logic (matches Assets page)
    total_net_worth = 0
    asset_allocation_data = {}
    
    for asset in assets:
        latest_market_value = get_latest_market_value(db, asset, current_user.id)
        total_net_worth += latest_market_value
        
        # Group by asset type for allocation chart
        asset_type = asset.asset_type or 'Other'
        if asset_type not in asset_allocation_data:
            asset_allocation_data[asset_type] = 0
        asset_allocation_data[asset_type] += latest_market_value
    
    # Calculate total insurance coverage
    total_insurance = db.query(func.sum(InsurancePolicy.coverage_amount)).filter(
        InsurancePolicy.user_id == current_user.id
    ).scalar() or Decimal('0')
    
    # Format asset allocation for frontend (same as Assets page)
    allocation_data = [
        {
            "name": asset_type.replace('_', ' ').title(),
            "value": value
        }
        for asset_type, value in asset_allocation_data.items()
        if value > 0  # Only include asset types with positive values
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
        "net_worth": total_net_worth,  # Now matches Assets page "Latest Market Value" total exactly
        "total_insurance_coverage": float(total_insurance),
        "asset_allocation": allocation_data,  # Uses same calculation as Assets page pie chart
        "recent_transactions": transaction_data,
        "user_theme": current_user.theme
    }

