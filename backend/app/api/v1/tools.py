"""
Tools API endpoints for advanced asset visualization and analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from uuid import UUID
import logging

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.asset import Asset
from pydantic import BaseModel, Field
from decimal import Decimal

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Schemas
class HierarchyRequest(BaseModel):
    """Request schema for asset hierarchy configuration."""
    hierarchy: List[str] = Field(
        default=["liquidity", "time_horizon", "purpose", "type"],
        description="Order of hierarchy levels"
    )
    depth: int = Field(
        default=5,
        ge=1,
        le=5,
        description="Number of levels to display (1-5)"
    )


class HierarchyNode(BaseModel):
    """Node in the asset hierarchy tree."""
    id: str
    label: str
    value: float
    percentage: float
    level: int
    category: str
    children: List[str] = []
    asset_count: int = 0


class HierarchyEdge(BaseModel):
    """Edge connecting nodes in the hierarchy."""
    source: str
    target: str


class HierarchyResponse(BaseModel):
    """Response schema for asset hierarchy."""
    total_value: float
    currency: str
    nodes: List[HierarchyNode]
    edges: List[HierarchyEdge]
    asset_count: int


def normalize_liquidity_status(asset: Asset) -> str:
    """Normalize liquidity status from various formats."""
    if asset.liquid_assets is True:
        return "liquid"
    elif asset.liquid_assets is False:
        return "illiquid"
    else:
        # Fallback for null/undefined - assume illiquid
        return "illiquid"


def get_category_label(category: str, value: str) -> str:
    """Get human-readable label for category values."""
    labels = {
        "liquidity": {
            "liquid": "Liquid Assets",
            "moderately_liquid": "Moderately Liquid",
            "illiquid": "Illiquid Assets"
        },
        "time_horizon": {
            "short_term": "Short Term (< 1 year)",
            "medium_term": "Medium Term (1-3 years)",
            "long_term": "Long Term (> 3 years)",
            "unspecified": "Unspecified Time Horizon"
        },
        "purpose": {
            "hyper_growth": "Hyper Growth",
            "growth": "Growth",
            "financial_security": "Financial Security",
            "emergency_fund": "Emergency Fund",
            "childrens_education": "Children's Education",
            "retirement_fund": "Retirement Fund",
            "speculation": "Speculation",
            "unspecified": "Unspecified Purpose"
        },
        "type": {
            "unspecified": "Other Assets"
        }
    }
    
    if category in labels and value in labels[category]:
        return labels[category][value]
    
    # For asset types, use the raw value with capitalization
    if category == "type":
        return value.replace("_", " ").title()
    
    return value.replace("_", " ").title()


def get_asset_category_value(asset: Asset, category: str) -> str:
    """Extract category value from asset."""
    if category == "liquidity":
        return normalize_liquidity_status(asset)
    elif category == "time_horizon":
        return str(asset.time_horizon) if asset.time_horizon is not None else "unspecified"  # type: ignore
    elif category == "purpose":
        return str(asset.asset_purpose) if asset.asset_purpose is not None else "unspecified"  # type: ignore
    elif category == "type":
        return str(asset.asset_type) if asset.asset_type is not None else "unspecified"  # type: ignore
    else:
        return "unspecified"


def build_hierarchy_tree(
    assets: List[Asset],
    hierarchy_order: List[str],
    depth: int,
    currency: str = "GBP"
) -> Dict[str, Any]:
    """Build hierarchical tree structure from assets."""
    
    total_value = sum(float(asset.current_value or 0) for asset in assets)  # type: ignore
    
    nodes: List[HierarchyNode] = []
    edges: List[HierarchyEdge] = []
    node_counter = 0
    
    # Root node
    root_id = "root"
    nodes.append(HierarchyNode(
        id=root_id,
        label="My Assets",
        value=total_value,
        percentage=100.0,
        level=0,
        category="root",
        children=[],
        asset_count=len(assets)
    ))
    
    # Build tree level by level
    # Group assets by category at each level
    def build_level(
        parent_id: str,
        parent_assets: List[Asset],
        current_level: int,
        path_prefix: str = ""
    ):
        nonlocal node_counter
        
        if current_level >= depth or current_level >= len(hierarchy_order):
            return
        
        category = hierarchy_order[current_level]
        
        # Group assets by this category
        groups: Dict[str, List[Asset]] = {}
        for asset in parent_assets:
            value = get_asset_category_value(asset, category)
            if value not in groups:
                groups[value] = []
            groups[value].append(asset)
        
        # Create nodes for each group
        for group_value, group_assets in groups.items():
            node_counter += 1
            node_id = f"node-{current_level}-{node_counter}"
            
            group_total = sum(float(a.current_value or 0) for a in group_assets)  # type: ignore
            group_percentage = (group_total / total_value * 100) if total_value > 0 else 0
            
            label = get_category_label(category, group_value)
            
            node = HierarchyNode(
                id=node_id,
                label=label,
                value=group_total,
                percentage=group_percentage,
                level=current_level + 1,
                category=category,
                children=[],
                asset_count=len(group_assets)
            )
            nodes.append(node)
            
            # Add edge from parent to this node
            edges.append(HierarchyEdge(
                source=parent_id,
                target=node_id
            ))
            
            # Add to parent's children
            parent_node = next((n for n in nodes if n.id == parent_id), None)
            if parent_node:
                parent_node.children.append(node_id)
            
            # Recursively build next level
            if current_level + 1 < depth and current_level + 1 < len(hierarchy_order):
                build_level(node_id, group_assets, current_level + 1, f"{path_prefix}/{group_value}")
            elif current_level + 1 == len(hierarchy_order):
                # Last level - add individual assets
                for asset in group_assets:
                    node_counter += 1
                    asset_id = f"asset-{asset.id}"
                    asset_value = float(asset.current_value or 0)  # type: ignore
                    asset_percentage = (asset_value / total_value * 100) if total_value > 0 else 0
                    
                    asset_node = HierarchyNode(
                        id=asset_id,
                        label=str(asset.name),  # type: ignore
                        value=asset_value,
                        percentage=asset_percentage,
                        level=current_level + 2,
                        category="asset",
                        children=[],
                        asset_count=1
                    )
                    nodes.append(asset_node)
                    
                    edges.append(HierarchyEdge(
                        source=node_id,
                        target=asset_id
                    ))
                    
                    node.children.append(asset_id)
    
    # Start building from root
    build_level(root_id, assets, 0)
    
    return {
        "total_value": total_value,
        "currency": currency,
        "nodes": nodes,
        "edges": edges,
        "asset_count": len(assets)
    }


@router.post("/asset-hierarchy", response_model=HierarchyResponse)
async def get_asset_hierarchy(
    request: HierarchyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate hierarchical asset visualization data.
    
    Creates a tree structure of assets based on user-specified hierarchy order.
    Default hierarchy: Liquidity → Time Horizon → Purpose → Type → Assets
    
    Args:
        request: Hierarchy configuration (order and depth)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Hierarchical tree with nodes and edges for visualization
    """
    try:
        logger.info(f"Generating asset hierarchy for user {current_user.id}")
        logger.info(f"Hierarchy order: {request.hierarchy}, Depth: {request.depth}")
        
        # Fetch all active assets for user
        assets = db.query(Asset).filter(
            Asset.user_id == current_user.id,
            Asset.current_value.isnot(None),
            Asset.current_value > 0,
            Asset.quantity.isnot(None),
            Asset.quantity > 0
        ).all()
        
        if not assets:
            # Return empty hierarchy
            return HierarchyResponse(
                total_value=0.0,
                currency="GBP",
                nodes=[HierarchyNode(
                    id="root",
                    label="My Assets",
                    value=0.0,
                    percentage=100.0,
                    level=0,
                    category="root",
                    children=[],
                    asset_count=0
                )],
                edges=[],
                asset_count=0
            )
        
        # Build hierarchy tree
        hierarchy_data = build_hierarchy_tree(
            assets=assets,
            hierarchy_order=request.hierarchy,
            depth=request.depth,
            currency="GBP"  # TODO: Get from user settings
        )
        
        logger.info(f"Successfully generated hierarchy with {len(hierarchy_data['nodes'])} nodes")
        
        return HierarchyResponse(**hierarchy_data)
        
    except Exception as e:
        logger.error(f"Error generating asset hierarchy: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate asset hierarchy: {str(e)}")
