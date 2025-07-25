#!/usr/bin/env python3
"""
Test script to verify CORS configuration parsing works correctly.
"""

import os
import sys

# Add the backend directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_cors_parsing():
    """Test various CORS origin formats."""
    from app.core.config import Settings
    
    # Test cases
    test_cases = [
        # JSON array format (Railway style)
        ('["https://aura-asset-manager.vercel.app"]', ["https://aura-asset-manager.vercel.app"]),
        ('["https://aura-asset-manager.vercel.app","http://localhost:5173"]', 
         ["https://aura-asset-manager.vercel.app", "http://localhost:5173"]),
        
        # Comma-separated format
        ('https://aura-asset-manager.vercel.app,http://localhost:5173', 
         ["https://aura-asset-manager.vercel.app", "http://localhost:5173"]),
        
        # Single URL
        ('https://aura-asset-manager.vercel.app', ["https://aura-asset-manager.vercel.app"]),
        
        # Already a list
        (["https://aura-asset-manager.vercel.app"], ["https://aura-asset-manager.vercel.app"]),
        
        # With extra whitespace
        (' ["https://aura-asset-manager.vercel.app"] ', ["https://aura-asset-manager.vercel.app"]),
    ]
    
    print("🧪 Testing CORS origin parsing...")
    
    for i, (input_val, expected) in enumerate(test_cases, 1):
        try:
            # Use the validator directly
            result = Settings.parse_cors_origins(input_val)
            
            if result == expected:
                print(f"✅ Test {i}: PASS")
                print(f"   Input: {repr(input_val)}")
                print(f"   Output: {result}")
            else:
                print(f"❌ Test {i}: FAIL")
                print(f"   Input: {repr(input_val)}")
                print(f"   Expected: {expected}")
                print(f"   Got: {result}")
        except Exception as e:
            print(f"💥 Test {i}: ERROR - {e}")
            print(f"   Input: {repr(input_val)}")
        
        print()

if __name__ == "__main__":
    # Set required environment variables with dummy values for testing
    os.environ.setdefault("SUPABASE_URL", "https://dummy.supabase.co")
    os.environ.setdefault("SUPABASE_KEY", "dummy-key")
    os.environ.setdefault("SUPABASE_SERVICE_KEY", "dummy-service-key")
    os.environ.setdefault("DATABASE_URL", "postgresql://dummy:dummy@localhost/dummy")
    os.environ.setdefault("SECRET_KEY", "dummy-secret-key")
    
    test_cors_parsing()
    
    # Also test creating a full Settings instance
    print("🏗️  Testing full Settings creation...")
    try:
        from app.core.config import settings
        print(f"✅ Settings created successfully")
        print(f"   ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")
        print(f"   Type: {type(settings.ALLOWED_ORIGINS)}")
    except Exception as e:
        print(f"❌ Settings creation failed: {e}")
