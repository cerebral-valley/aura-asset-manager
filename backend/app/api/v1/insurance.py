"""
Insurance API endpoints for insurance policy management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.insurance import InsurancePolicy
from app.schemas.insurance import InsurancePolicy as InsurancePolicySchema, InsurancePolicyCreate, InsurancePolicyUpdate, InsurancePolicySummary
from typing import List
from uuid import UUID
import httpx
from app.core.config import settings
from datetime import datetime
import uuid as uuid_lib
import os
import secrets

router = APIRouter()

@router.get("/", response_model=List[InsurancePolicySchema])
async def get_insurance_policies(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all insurance policies for the current user."""
    policies = db.query(InsurancePolicy).filter(InsurancePolicy.user_id == current_user.id).all()
    return policies

@router.post("/", response_model=InsurancePolicySchema)
async def create_insurance_policy(
    policy: InsurancePolicyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new insurance policy."""
    try:
        print(f"🔍 [DEBUG] Raw policy data received: {policy.dict()}")
        print(f"🔍 [DEBUG] Policy data types: {[(k, type(v)) for k, v in policy.dict().items()]}")
        print(f"🔍 [DEBUG] CREATE POLICY - Date fields: start_date={policy.start_date}, end_date={policy.end_date}, renewal_date={policy.renewal_date}")

        # Convert Pydantic model to dict and handle the metadata field mapping
        policy_data = policy.dict()

        print(f"🔍 [DEBUG] Policy data after dict conversion: {policy_data}")
        print(f"🔍 [DEBUG] About to create InsurancePolicy with user_id: {current_user.id}")
        print(f"🔍 [DEBUG] Policy data to DB: start_date={policy_data.get('start_date')}, end_date={policy_data.get('end_date')}, renewal_date={policy_data.get('renewal_date')}")

        db_policy = InsurancePolicy(**policy_data, user_id=current_user.id)
        print(f"🔍 [DEBUG] CREATE POLICY - DB object dates before save: start={db_policy.start_date}, end={db_policy.end_date}, renewal={db_policy.renewal_date}")
        db.add(db_policy)
        db.commit()
        db.refresh(db_policy)

        print(f"🔍 [DEBUG] CREATE POLICY - After save: start={db_policy.start_date}, end={db_policy.end_date}, renewal={db_policy.renewal_date}")
        print(f"🔍 [DEBUG] Policy saved successfully with ID: {db_policy.id}")
        return db_policy
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating insurance policy: {e}")
        print(f"❌ Error type: {type(e)}")
        print(f"❌ Policy data received: {policy.dict()}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=422, detail=f"Failed to create policy: {str(e)}")

@router.get("/{policy_id}", response_model=InsurancePolicySchema)
async def get_insurance_policy(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific insurance policy by ID."""
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    return policy

@router.put("/{policy_id}", response_model=InsurancePolicySchema)
async def update_insurance_policy(
    policy_id: UUID,
    policy_update: InsurancePolicyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing insurance policy."""
    try:
        print(f"🔍 [DEBUG] UPDATE POLICY - Policy ID: {policy_id}")
        print(f"🔍 [DEBUG] UPDATE POLICY - Raw update data: {policy_update.dict()}")
        print(f"🔍 [DEBUG] UPDATE POLICY - Date fields: start_date={policy_update.start_date}, end_date={policy_update.end_date}, renewal_date={policy_update.renewal_date}")

        policy = db.query(InsurancePolicy).filter(
            InsurancePolicy.id == policy_id,
            InsurancePolicy.user_id == current_user.id
        ).first()

        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Insurance policy not found"
            )

        print(f"🔍 [DEBUG] UPDATE POLICY - Found policy: {policy.policy_name}")
        print(f"🔍 [DEBUG] UPDATE POLICY - Current dates: start={policy.start_date}, end={policy.end_date}, renewal={policy.renewal_date}")

        update_data = policy_update.dict(exclude_unset=True)
        print(f"🔍 [DEBUG] UPDATE POLICY - Update data after exclude_unset: {update_data}")
        print(f"🔍 [DEBUG] Update data to DB: start_date={update_data.get('start_date')}, end_date={update_data.get('end_date')}, renewal_date={update_data.get('renewal_date')}")

        for field, value in update_data.items():
            print(f"🔍 [DEBUG] UPDATE POLICY - Setting {field} = {value} (type: {type(value)})")
            setattr(policy, field, value)

        db.commit()
        db.refresh(policy)

        print(f"🔍 [DEBUG] UPDATE POLICY - After update: start={policy.start_date}, end={policy.end_date}, renewal={policy.renewal_date}")
        return policy
    except Exception as e:
        db.rollback()
        print(f"❌ UPDATE POLICY ERROR: {e}")
        print(f"❌ UPDATE POLICY ERROR type: {type(e)}")
        import traceback
        print(f"❌ UPDATE POLICY Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=422, detail=f"Failed to update policy: {str(e)}")

@router.delete("/{policy_id}")
async def delete_insurance_policy(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an insurance policy."""
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    db.delete(policy)
    db.commit()
    return {"message": "Insurance policy deleted successfully"}


# Insurance Document Management Functions
async def ensure_storage_bucket_exists(bucket_name: str = "asset-documents") -> bool:
    """
    Ensure the Supabase storage bucket exists for insurance documents.
    Uses the same bucket as assets for consistent storage structure.
    """
    try:
        print(f"🔍 Checking if bucket '{bucket_name}' exists...")
        
        async with httpx.AsyncClient() as client:
            # First, try to get bucket info
            response = await client.get(
                f"{settings.SUPABASE_URL}/storage/v1/bucket/{bucket_name}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                print(f"✅ Bucket '{bucket_name}' already exists")
                return True
            
            # Bucket doesn't exist, create it
            print(f"📦 Creating bucket '{bucket_name}'...")
            create_response = await client.post(
                f"{settings.SUPABASE_URL}/storage/v1/bucket",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "id": bucket_name,
                    "name": bucket_name,
                    "public": False,  # Private bucket for user documents
                    "file_size_limit": 52428800,  # 50MB per file (same as assets)
                    "allowed_mime_types": ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
                }
            )
            
            if create_response.status_code in [200, 201]:
                print(f"✅ Bucket '{bucket_name}' created successfully")
                return True
            else:
                print(f"❌ Failed to create bucket: {create_response.status_code} - {create_response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error ensuring bucket exists: {str(e)}")
        return False


async def ensure_user_folder_exists(user_id: UUID, bucket_name: str = "asset-documents") -> bool:
    """
    Ensure the user-specific folder exists in the asset-documents bucket.
    Creates a placeholder file to establish the folder structure for insurance docs.
    """
    try:
        user_id_str = str(user_id)
        print(f"🔍 Checking if user folder '{user_id_str}/' exists in bucket '{bucket_name}'...")
        
        # Create a placeholder file to ensure the folder exists
        placeholder_filename = f"{user_id_str}/.folder_placeholder"
        placeholder_content = f"User folder created for {user_id_str}"
        
        async with httpx.AsyncClient() as client:
            # Check if folder already has files (indicating it exists)
            list_response = await client.post(
                f"{settings.SUPABASE_URL}/storage/v1/object/list/{bucket_name}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prefix": user_id_str,
                    "limit": 1
                }
            )
            
            if list_response.status_code == 200:
                files = list_response.json()
                if files and len(files) > 0:
                    print(f"✅ User folder '{user_id_str}/' already exists with {len(files)} files")
                    return True
            
            # Folder doesn't exist or is empty, create placeholder
            print(f"📁 Creating user folder '{user_id_str}/' with placeholder...")
            upload_response = await client.post(
                f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{placeholder_filename}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "text/plain"
                },
                content=placeholder_content.encode('utf-8')
            )
            
            if upload_response.status_code in [200, 201]:
                print(f"✅ User folder '{user_id_str}/' created successfully")
                return True
            else:
                print(f"❌ Failed to create user folder: {upload_response.status_code} - {upload_response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error ensuring user folder exists: {str(e)}")
        return False


# Document Upload Endpoints (copied exactly from Assets)

@router.get("/{policy_id}/documents/")
async def get_insurance_documents(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get documents for an insurance policy."""
    
    # Validate policy exists and belongs to user
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    # Return document information if exists
    documents = []
    if policy.document_path is not None and policy.document_name is not None:
        documents.append({
            "name": policy.document_name,
            "size": policy.document_size,
            "type": policy.document_type,
            "uploaded_at": policy.document_uploaded_at,
            "path": policy.document_path
        })
    
    return {
        "documents": documents,
        "policy_id": str(policy_id),
        "policy_name": policy.policy_name
    }

@router.post("/{policy_id}/upload-document/")
async def upload_insurance_document(
    policy_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a document for an insurance policy."""
    
    print(f"🔄 Document upload started:")
    print(f"   Policy ID: {policy_id}")
    print(f"   User ID: {current_user.id}")
    print(f"   File: {file.filename}")
    print(f"   Content Type: {file.content_type}")
    print(f"   Supabase URL: {settings.SUPABASE_URL}")
    
    # Validate policy exists and belongs to user
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id
    ).first()
    
    if not policy:
        print(f"❌ Policy not found: {policy_id} for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy not found"
        )
    
    print(f"✅ Policy found: {policy.policy_name} (type: {policy.policy_type})")
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/jpg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        print(f"❌ Invalid file type: {file.content_type}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: PDF, JPEG, DOCX"
        )
    
    print(f"✅ File type validated: {file.content_type}")
    
    # Validate file size (3MB limit)
    content = await file.read()
    print(f"📄 File size: {len(content)} bytes ({len(content) / (1024*1024):.2f} MB)")
    
    if len(content) > 3 * 1024 * 1024:  # 3MB
        print(f"❌ File too large: {len(content)} bytes")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 3MB limit"
        )
    
    # Check user's total storage usage (25MB limit)
    total_usage = db.query(InsurancePolicy).filter(
        InsurancePolicy.user_id == current_user.id,
        InsurancePolicy.document_size.isnot(None)
    ).with_entities(func.sum(InsurancePolicy.document_size)).scalar() or 0
    
    if total_usage + len(content) > 25 * 1024 * 1024:  # 25MB total
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total storage limit (25MB) would be exceeded"
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'bin'
    unique_filename = f"{current_user.id}/{policy_id}_{secrets.token_hex(8)}.{file_extension}"
    
    print(f"📁 Generated filename: {unique_filename}")
    
    try:
        # Ensure the storage bucket exists
        print(f"🚃 Checking/creating storage bucket...")
        bucket_exists = await ensure_storage_bucket_exists("asset-documents")
        if not bucket_exists:
            print(f"❌ Failed to create/access storage bucket")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Storage service configuration error"
            )
        print(f"✅ Storage bucket ready")
        
        # Ensure the user-specific folder exists
        print(f"👤 Checking/creating user folder...")
        user_folder_exists = await ensure_user_folder_exists(UUID(str(current_user.id)), "asset-documents")
        if not user_folder_exists:
            print(f"❌ Failed to create/access user folder")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User storage folder configuration error"
            )
        print(f"✅ User folder ready")
        
        # Upload to Supabase Storage using REST API
        print(f"📤 Uploading to Supabase Storage...")
        async with httpx.AsyncClient() as client:
            upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/asset-documents/{unique_filename}"
            print(f"   Upload URL: {upload_url}")
            
            response = await client.post(
                upload_url,
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": file.content_type or "application/octet-stream"
                },
                content=content
            )
            
            print(f"📡 Upload response: {response.status_code}")
            print(f"   Response text: {response.text}")
            
            if response.status_code not in [200, 201]:
                print(f"❌ Storage upload failed: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to upload file to storage"
                )
        
        print(f"✅ File uploaded to storage successfully")
        
        # Update policy with document information
        print(f"💾 Updating policy with document metadata...")
        update_data = {
            "document_path": unique_filename,
            "document_name": file.filename,
            "document_size": len(content),
            "document_type": file_extension.lower(),
            "document_uploaded_at": datetime.utcnow()
        }
        
        print(f"   Document data: {update_data}")
        
        for field, value in update_data.items():
            setattr(policy, field, value)
        
        db.commit()
        db.refresh(policy)
        
        print(f"✅ Document upload completed successfully!")
        print(f"   Policy ID: {policy.id}")
        print(f"   Document path: {policy.document_path}")
        print(f"   Document name: {policy.document_name}")
        
        return {
            "message": "Document uploaded successfully",
            "document_name": file.filename,
            "document_size": len(content),
            "document_type": file_extension.lower()
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like bucket creation failure)
        raise
    except Exception as e:
        print(f"🚨 Document upload error: {str(e)}")
        print(f"   File: {file.filename if file and file.filename else 'unknown'}")
        print(f"   Content type: {file.content_type if file else 'unknown'}")
        print(f"   Policy ID: {policy_id}")
        print(f"   User ID: {current_user.id}")
        
        # Check if it's a storage-related error
        if "storage" in str(e).lower() or "supabase" in str(e).lower():
            detail = "Storage service error - please try again"
        else:
            detail = f"Failed to upload document: {str(e)}"
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.get("/{policy_id}/download-document/")
async def download_insurance_document(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download a document for an insurance policy."""
    
    # Validate policy exists, belongs to user, and has a document
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id,
        InsurancePolicy.document_path.isnot(None)
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy or document not found"
        )
    
    try:
        # Get download URL from Supabase Storage
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/storage/v1/object/sign/asset-documents/{policy.document_path}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                },
                json={"expiresIn": 3600}  # 1 hour expiry
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate download URL"
                )
            
            signed_url_data = response.json()
            download_url = f"{settings.SUPABASE_URL}/storage/v1{signed_url_data['signedURL']}"
            
            return {
                "download_url": download_url,
                "document_name": policy.document_name,
                "document_size": policy.document_size,
                "document_type": policy.document_type,
                "expires_in": 3600
            }
            
    except Exception as e:
        print(f"Document download error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )


@router.delete("/{policy_id}/delete-document/")
async def delete_insurance_document(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a document for an insurance policy."""
    
    # Validate policy exists, belongs to user, and has a document
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id,
        InsurancePolicy.user_id == current_user.id,
        InsurancePolicy.document_path.isnot(None)
    ).first()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance policy or document not found"
        )
    
    document_path = policy.document_path
    document_name = policy.document_name
    
    try:
        # Delete from Supabase Storage
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.SUPABASE_URL}/storage/v1/object/asset-documents/{document_path}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"
                }
            )
            
            # Note: Supabase may return 404 if file doesn't exist, which is acceptable
            if response.status_code not in [200, 204, 404]:
                print(f"Storage deletion warning: {response.status_code} - {response.text}")
        
        # Clear document fields from policy
        clear_data = {
            "document_path": None,
            "document_name": None,
            "document_size": None,
            "document_type": None,
            "document_uploaded_at": None
        }
        
        for field, value in clear_data.items():
            setattr(policy, field, value)
        
        db.commit()
        
        return {
            "message": "Document deleted successfully",
            "document_name": document_name
        }
        
    except Exception as e:
        print(f"Document deletion error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )


@router.get("/hierarchy/")
async def get_insurance_hierarchy(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get insurance policies organized hierarchically by type.
    Returns a structure suitable for visualization in a mind map.
    
    Structure:
    {
        "root": {
            "total_coverage": float,
            "total_annual_premium": float,
            "policy_count": int
        },
        "types": [
            {
                "type": "life",
                "type_label": "Life Insurance",
                "total_coverage": float,
                "total_annual_premium": float,
                "policy_count": int,
                "policies": [
                    {
                        "id": "uuid",
                        "name": "Policy Name",
                        "coverage": float,
                        "annual_premium": float,
                        "provider": "Provider Name",
                        "status": "active"
                    }
                ]
            }
        ]
    }
    """
    try:
        # Fetch only active policies for the current user
        policies = db.query(InsurancePolicy).filter(
            InsurancePolicy.user_id == current_user.id,
            InsurancePolicy.status == 'active'
        ).all()
        
        if not policies:
            return {
                "root": {
                    "total_coverage": 0,
                    "total_annual_premium": 0,
                    "policy_count": 0
                },
                "types": []
            }
        
        # Helper function to annualize premiums
        def annualize_premium(premium_amount, premium_frequency):
            if not premium_amount:
                return 0
            
            freq_map = {
                'monthly': 12,
                'quarterly': 4,
                'annually': 1,
                'annual': 1
            }
            
            multiplier = freq_map.get(premium_frequency.lower() if premium_frequency else 'annually', 1)
            return float(premium_amount) * multiplier
        
        # Type labels mapping
        type_labels = {
            'life': 'Life Insurance',
            'health': 'Health Insurance',
            'auto': 'Auto Insurance',
            'home': 'Home Insurance',
            'loan': 'Loan Insurance',
            'travel': 'Travel Insurance',
            'asset': 'Asset Insurance',
            'factory': 'Factory Insurance',
            'fire': 'Fire Insurance'
        }
        
        # Group policies by type
        types_data = {}
        total_coverage = 0
        total_annual_premium = 0
        
        for policy in policies:
            policy_type = policy.policy_type or 'other'
            
            # Calculate annualized premium for this policy
            annual_premium = annualize_premium(policy.premium_amount, policy.premium_frequency)
            coverage = float(policy.coverage_amount) if policy.coverage_amount else 0
            
            # Add to totals
            total_coverage += coverage
            total_annual_premium += annual_premium
            
            # Initialize type group if not exists
            if policy_type not in types_data:
                types_data[policy_type] = {
                    'type': policy_type,
                    'type_label': type_labels.get(policy_type, policy_type.capitalize() + ' Insurance'),
                    'total_coverage': 0,
                    'total_annual_premium': 0,
                    'policy_count': 0,
                    'policies': []
                }
            
            # Add to type totals
            types_data[policy_type]['total_coverage'] += coverage
            types_data[policy_type]['total_annual_premium'] += annual_premium
            types_data[policy_type]['policy_count'] += 1
            
            # Add individual policy data
            types_data[policy_type]['policies'].append({
                'id': str(policy.id),
                'name': policy.policy_name or 'Unnamed Policy',
                'coverage': coverage,
                'annual_premium': annual_premium,
                'provider': policy.provider or 'Unknown Provider',
                'status': policy.status or 'active',
                'policy_number': policy.policy_number
            })
        
        # Convert dict to sorted list
        types_list = sorted(
            types_data.values(),
            key=lambda x: x['total_coverage'],
            reverse=True
        )
        
        return {
            'root': {
                'total_coverage': total_coverage,
                'total_annual_premium': total_annual_premium,
                'policy_count': len(policies)
            },
            'types': types_list
        }
        
    except Exception as e:
        print(f"Error generating insurance hierarchy: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insurance hierarchy: {str(e)}"
        )

