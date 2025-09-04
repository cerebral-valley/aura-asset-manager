"""
Profile API endpoints for user profile management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


@router.get("/countries")
async def get_countries():
    """Get all available countries - TEST VERSION."""
    # Return static list of countries for testing
    return [
        {"code": "US", "name": "United States"},
        {"code": "IN", "name": "India"},
        {"code": "CA", "name": "Canada"},
        {"code": "AU", "name": "Australia"},
        {"code": "GB", "name": "United Kingdom"}
    ]


@router.get("/options")
async def get_profile_options():
    """Get available options for profile dropdowns."""
    return {
        "marital_status_options": [
            {"value": "single", "label": "Single"},
            {"value": "married", "label": "Married"},
            {"value": "divorced", "label": "Divorced"},
            {"value": "widowed", "label": "Widowed"},
            {"value": "separated", "label": "Separated"}
        ],
        "gender_options": [
            {"value": "male", "label": "Male"},
            {"value": "female", "label": "Female"},
            {"value": "other", "label": "Other"},
            {"value": "prefer_not_to_say", "label": "Prefer not to say"}
        ],
        "occupation_options": [
            {"value": "employed", "label": "Employed"},
            {"value": "self_employed", "label": "Self Employed"},
            {"value": "unemployed", "label": "Unemployed"},
            {"value": "retired", "label": "Retired"},
            {"value": "student", "label": "Student"},
            {"value": "homemaker", "label": "Homemaker"},
            {"value": "other", "label": "Other"}
        ]
    }


@router.get("/test")
async def test_endpoint():
    """Simple test endpoint."""
    return {"message": "Profile API is working!", "timestamp": "2025-01-04"}
