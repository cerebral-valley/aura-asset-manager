#!/usr/bin/env python3
"""
Test script to verify insurance document upload functionality
Tests the corrected bucket configuration
"""

import requests
import tempfile
import os
import json

# API endpoints
BASE_URL = "https://aura-asset-manager-production.up.railway.app"
LOGIN_URL = f"{BASE_URL}/auth/login"

def test_insurance_upload():
    """Test insurance document upload with corrected bucket configuration"""
    
    print("🧪 Testing Insurance Document Upload Fix...")
    
    # Test credentials (you'll need to replace with actual test credentials)
    test_email = "test@example.com"  # Replace with actual test account
    test_password = "testpassword"   # Replace with actual test password
    
    print(f"1. Attempting login...")
    
    # Login to get auth token
    login_response = requests.post(LOGIN_URL, json={
        "email": test_email,
        "password": test_password
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        return False
    
    # Extract token from response
    token = login_response.json().get("access_token")
    if not token:
        print("❌ No access token in login response")
        return False
        
    print(f"✅ Login successful")
    
    # Set up headers
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Get insurance policies to find one to test with
    print("2. Fetching insurance policies...")
    policies_response = requests.get(f"{BASE_URL}/insurance/", headers=headers)
    
    if policies_response.status_code != 200:
        print(f"❌ Failed to fetch policies: {policies_response.status_code}")
        return False
    
    policies = policies_response.json()
    if not policies:
        print("❌ No insurance policies found for testing")
        return False
    
    test_policy_id = policies[0]["id"]
    print(f"✅ Found test policy: {test_policy_id}")
    
    # Create a test PDF file
    print("3. Creating test document...")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
        # Write some PDF content (minimal valid PDF)
        pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
301
%%EOF"""
        temp_file.write(pdf_content)
        temp_pdf_path = temp_file.name
    
    print(f"✅ Created test PDF: {temp_pdf_path}")
    
    # Test upload
    print("4. Testing document upload...")
    upload_url = f"{BASE_URL}/insurance/{test_policy_id}/upload-document/"
    
    try:
        with open(temp_pdf_path, 'rb') as pdf_file:
            files = {
                'file': ('test_insurance_doc.pdf', pdf_file, 'application/pdf')
            }
            
            upload_response = requests.post(
                upload_url,
                headers=headers,
                files=files
            )
            
        print(f"   Upload response status: {upload_response.status_code}")
        print(f"   Upload response: {upload_response.text}")
        
        if upload_response.status_code == 200:
            print("✅ Insurance document upload SUCCESSFUL!")
            print("✅ Bucket configuration fix verified!")
            return True
        else:
            print(f"❌ Upload failed with status {upload_response.status_code}")
            return False
            
    finally:
        # Clean up temp file
        os.unlink(temp_pdf_path)
        print("🧹 Cleaned up test file")

if __name__ == "__main__":
    try:
        success = test_insurance_upload()
        if success:
            print("\n🎉 SUCCESS: Insurance document upload is working correctly!")
            print("   The asset-documents bucket fix resolved the 500 error.")
        else:
            print("\n❌ FAILED: Insurance document upload still has issues.")
    except Exception as e:
        print(f"\n💥 ERROR: {str(e)}")