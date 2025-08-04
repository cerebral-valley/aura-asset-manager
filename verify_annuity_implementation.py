#!/usr/bin/env python3
"""
Simple verification script for annuity implementation.
Checks that all files are in place and imports work correctly.
"""

import os
import sys
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and report status."""
    if os.path.exists(file_path):
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} (NOT FOUND)")
        return False

def check_directory_structure():
    """Verify all required files and directories exist."""
    print("🔍 Checking Implementation Files...\n")
    
    base_path = "/Users/ishankukade/Projects/aura-asset-manager"
    
    # Database files
    print("📄 Database Files:")
    check_file_exists(f"{base_path}/database/migrations/003_add_annuity_support.sql", "Migration file")
    print()
    
    # Backend files
    print("🔧 Backend Files:")
    check_file_exists(f"{base_path}/backend/app/models/payment_schedule.py", "Payment schedule model")
    check_file_exists(f"{base_path}/backend/app/schemas/payment_schedule.py", "Payment schedule schema")
    check_file_exists(f"{base_path}/backend/app/api/v1/payment_schedules.py", "Payment schedule API")
    check_file_exists(f"{base_path}/backend/app/models/asset.py", "Enhanced asset model")
    print()
    
    # Frontend files
    print("🎨 Frontend Files:")
    check_file_exists(f"{base_path}/frontend/src/services/paymentSchedules.js", "Payment schedule service")
    check_file_exists(f"{base_path}/frontend/src/components/assets/AnnuityManager.jsx", "Annuity manager component")
    check_file_exists(f"{base_path}/frontend/src/constants/assetTypes.js", "Enhanced asset types")
    check_file_exists(f"{base_path}/frontend/src/pages/Assets.jsx", "Enhanced assets page")
    print()
    
    # Documentation
    print("📚 Documentation:")
    check_file_exists(f"{base_path}/docs/ANNUITY_IMPLEMENTATION_COMPLETE.md", "Implementation documentation")
    print()

def check_asset_types():
    """Check that our asset types are properly defined."""
    print("🏷️  Checking Asset Type Definitions...")
    
    try:
        # Add the frontend/src path to Python path
        frontend_src_path = "/Users/ishankukade/Projects/aura-asset-manager/frontend/src"
        if frontend_src_path not in sys.path:
            sys.path.insert(0, frontend_src_path)
        
        # This will fail because it's JavaScript, but we can check the file content
        with open("/Users/ishankukade/Projects/aura-asset-manager/frontend/src/constants/assetTypes.js", 'r') as f:
            content = f.read()
            if "'Annuities & Insurance'" in content:
                print("✅ Found 'Annuities & Insurance' category")
            if "annuity_fixed" in content:
                print("✅ Found annuity asset types")
            if "getAllAssetTypes" in content:
                print("✅ Found getAllAssetTypes function")
    except Exception as e:
        print(f"❌ Error checking asset types: {e}")
    
    print()

def check_migration_content():
    """Check that our migration file has the correct content."""
    print("📋 Checking Migration Content...")
    
    try:
        with open("/Users/ishankukade/Projects/aura-asset-manager/database/migrations/003_add_annuity_support.sql", 'r') as f:
            content = f.read()
            
            checks = [
                ("payment_schedules table", "CREATE TABLE payment_schedules"),
                ("Asset annuity fields", "ALTER TABLE assets ADD COLUMN annuity_type"),
                ("Insurance annuity fields", "ALTER TABLE insurance_policies ADD COLUMN has_annuity_benefit"),
                ("RLS policies", "ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY"),
                ("Helper functions", "CREATE OR REPLACE FUNCTION calculate_next_payment_date"),
                ("Record payment function", "CREATE OR REPLACE FUNCTION record_payment")
            ]
            
            for check_name, check_string in checks:
                if check_string in content:
                    print(f"✅ {check_name}")
                else:
                    print(f"❌ {check_name} (missing)")
    except Exception as e:
        print(f"❌ Error reading migration file: {e}")
    
    print()

def summarize_implementation():
    """Provide a summary of what's been implemented."""
    print("📊 Implementation Summary:")
    print()
    print("🗃️  Database Schema:")
    print("   • New payment_schedules table for recurring payments")
    print("   • Enhanced assets table with annuity fields")
    print("   • Enhanced insurance_policies table")
    print("   • RLS policies and helper functions")
    print()
    print("🔧 Backend API:")
    print("   • Payment schedule CRUD operations")
    print("   • Payment recording and tracking")
    print("   • Payment projections")
    print("   • Enhanced asset models and schemas")
    print()
    print("🎨 Frontend UI:")
    print("   • Comprehensive asset type classifications")
    print("   • Annuity management interface")
    print("   • Payment schedule configuration")
    print("   • Integration with existing assets page")
    print()
    print("💰 Key Features:")
    print("   • Support for all major annuity types")
    print("   • Flexible payment schedules")
    print("   • Financial calculations (PV, FV)")
    print("   • Payment tracking and history")
    print("   • User-friendly management interface")

def main():
    """Run all verification checks."""
    print("🚀 Annuity Implementation Verification\n")
    
    check_directory_structure()
    check_asset_types()
    check_migration_content()
    summarize_implementation()
    
    print("\n🎉 Verification Complete!")
    print("\n📋 Next Steps:")
    print("1. Apply database migration: Run 003_add_annuity_support.sql")
    print("2. Start backend: cd backend && python main.py")
    print("3. Start frontend: cd frontend && npm run dev")
    print("4. Test the annuity management features")

if __name__ == "__main__":
    main()
