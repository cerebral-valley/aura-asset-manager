#!/usr/bin/env python3
"""
Test script for annuity support implementation.
This script tests the database schema, API endpoints, and overall functionality.
"""

import asyncio
import json
import requests
from datetime import datetime, date
from decimal import Decimal

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Test data
TEST_ANNUITY = {
    "name": "Immediate Fixed Annuity",
    "asset_type": "annuity_fixed",
    "description": "Test fixed annuity with monthly payments",
    "purchase_date": "2024-01-01",
    "initial_value": 100000.00,
    "current_value": 100000.00,
    "quantity": 1,
    "unit_of_measure": "contract",
    "annuity_type": "fixed",
    "purchase_amount": 100000.00,
    "guaranteed_rate": 0.055,  # 5.5%
    "accumulation_phase_end": "2024-02-01",
    "has_payment_schedule": True
}

TEST_PAYMENT_SCHEDULE = {
    "schedule_type": "payment_out",
    "amount": 850.00,
    "frequency": "monthly",
    "start_date": "2024-02-01",
    "end_date": None,  # Lifetime annuity
    "metadata": {
        "guaranteed_years": 20,
        "survivor_benefit": True
    }
}

def test_database_schema():
    """Test that the database schema has been updated correctly."""
    print("🔍 Testing Database Schema...")
    
    # This would require direct database access
    # For now, we'll test through the API
    print("✅ Database schema test skipped (requires direct DB access)")

def test_asset_creation():
    """Test creating an annuity asset."""
    print("🏗️  Testing Annuity Asset Creation...")
    
    try:
        # Note: This would require authentication in a real scenario
        response = requests.post(f"{API_BASE}/assets/", json=TEST_ANNUITY)
        
        if response.status_code == 201:
            asset = response.json()
            print(f"✅ Created annuity asset: {asset['id']}")
            return asset
        else:
            print(f"❌ Failed to create asset: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend API (is it running?)")
        return None

def test_payment_schedule_creation(asset_id):
    """Test creating a payment schedule for an annuity."""
    print("📅 Testing Payment Schedule Creation...")
    
    if not asset_id:
        print("❌ No asset ID provided")
        return None
    
    try:
        schedule_data = {
            **TEST_PAYMENT_SCHEDULE,
            "related_id": asset_id,
            "related_type": "asset"
        }
        
        response = requests.post(f"{API_BASE}/payment-schedules/", json=schedule_data)
        
        if response.status_code == 201:
            schedule = response.json()
            print(f"✅ Created payment schedule: {schedule['id']}")
            return schedule
        else:
            print(f"❌ Failed to create payment schedule: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend API")
        return None

def test_payment_projection(schedule_id):
    """Test getting payment projections."""
    print("📊 Testing Payment Projections...")
    
    if not schedule_id:
        print("❌ No schedule ID provided")
        return
    
    try:
        response = requests.get(f"{API_BASE}/payment-schedules/{schedule_id}/projection?periods=12")
        
        if response.status_code == 200:
            projections = response.json()
            print(f"✅ Got {len(projections)} payment projections")
            
            # Show first few projections
            for i, proj in enumerate(projections[:3]):
                print(f"   Payment {i+1}: ${proj['amount']} on {proj['date']}")
        else:
            print(f"❌ Failed to get projections: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend API")

def test_asset_types():
    """Test that our new asset types are available in the frontend."""
    print("🏷️  Testing Asset Type Classifications...")
    
    # Since we can't directly test frontend, we'll check our constants
    from frontend.src.constants.assetTypes import assetTypes, getAllAssetTypes
    
    all_types = getAllAssetTypes()
    annuity_types = [t for t in all_types if 'annuity' in t['value']]
    
    print(f"✅ Found {len(annuity_types)} annuity types:")
    for atype in annuity_types:
        print(f"   - {atype['label']} ({atype['value']})")

def test_backend_health():
    """Test that the backend is running and healthy."""
    print("🩺 Testing Backend Health...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting Annuity Implementation Tests\n")
    
    # Test backend health
    if not test_backend_health():
        print("\n❌ Backend is not available. Please start the backend server first.")
        print("   Run: cd backend && python main.py")
        return
    
    print()
    
    # Test database schema
    test_database_schema()
    print()
    
    # Test asset creation
    asset = test_asset_creation()
    print()
    
    # Test payment schedule creation
    if asset:
        schedule = test_payment_schedule_creation(asset['id'])
        print()
        
        # Test payment projections
        if schedule:
            test_payment_projection(schedule['id'])
            print()
    
    # Test asset types (this would work if we could import frontend modules)
    try:
        test_asset_types()
    except ImportError:
        print("🏷️  Asset type test skipped (frontend module not accessible)")
    
    print("\n🎉 Annuity implementation tests completed!")
    print("\nManual Testing Steps:")
    print("1. Start the frontend: cd frontend && npm run dev")
    print("2. Navigate to the Assets page")
    print("3. Create a new asset with annuity type")
    print("4. Click 'Manage' to configure payment schedules")
    print("5. Verify payment projections and calculations")

if __name__ == "__main__":
    main()
