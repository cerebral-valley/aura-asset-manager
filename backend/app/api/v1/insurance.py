"""
Insurance API endpoints for insurance policy management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
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
async def ensure_storage_bucket_exists(bucket_name: str = "insurance-documents") -> bool:
    """
    Ensure the storage bucket exists for insurance documents.
    Creates the bucket if it doesn't exist.
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
                    "file_size_limit": 5242880,  # 5MB for insurance docs
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


async def ensure_user_folder_exists(user_id: UUID, bucket_name: str = "insurance-documents") -> bool:
    """
    Ensure the user-specific folder exists in the storage bucket.
    Creates a placeholder file to establish the folder structure.
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


# Insurance Document API Endpoints
@router.post("/{policy_id}/upload-document/")
async def upload_insurance_document(
    policy_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a document for an insurance policy."""
    
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

    # Validate file type - PDF and DOCX only for insurance
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed for insurance documents"
        )

    # Validate file size (5MB limit for insurance)
    file_content = await file.read()
    file_size = len(file_content)
    max_size = 5 * 1024 * 1024  # 5MB
    
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size} bytes) exceeds maximum allowed size ({max_size} bytes)"
        )

    try:
        # Ensure bucket and user folder exist
        bucket_exists = await ensure_storage_bucket_exists("insurance-documents")
        if not bucket_exists:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize storage"
            )

        user_folder_exists = await ensure_user_folder_exists(UUID(str(current_user.id)), "insurance-documents")
        if not user_folder_exists:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to ensure user folder"
            )

        # Generate unique filename with policy prefix for easy identification
        user_id_str = str(current_user.id)
        file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else ''
        unique_filename = f"{user_id_str}/policy_{str(policy_id)[:8]}_{uuid_lib.uuid4().hex[:8]}.{file_extension}"
        
        # Upload to Supabase Storage
        async with httpx.AsyncClient() as client:
            upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/insurance-documents/{unique_filename}"
            upload_response = await client.post(
                upload_url,
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": file.content_type
                },
                content=file_content
            )

            if upload_response.status_code not in [200, 201]:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file: {upload_response.text}"
                )

        # Update policy metadata with document information
        # Get current metadata as a dictionary
        current_metadata = getattr(policy, 'policy_metadata') or {}
        
        # Store document info in metadata
        document_info = {
            "document_path": unique_filename,
            "document_name": file.filename,
            "document_size": file_size,
            "document_type": file.content_type,
            "document_uploaded_at": datetime.utcnow().isoformat()
        }
        
        # Add to documents array in metadata
        if "documents" not in current_metadata:
            current_metadata["documents"] = []
        
        current_metadata["documents"].append(document_info)
        
        # Update the policy metadata
        setattr(policy, 'policy_metadata', current_metadata)
        
        # Mark the metadata as modified to trigger SQLAlchemy update
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(policy, "policy_metadata")
        
        db.commit()
        db.refresh(policy)

        return {
            "message": "Document uploaded successfully",
            "document_name": file.filename,
            "document_size": file_size,
            "document_path": unique_filename,
            "policy_id": str(policy_id)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Document upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.get("/{policy_id}/documents/")
async def get_insurance_documents(
    policy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all documents for an insurance policy."""
    
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
    
    # Extract documents from metadata
    documents = []
    metadata = getattr(policy, 'policy_metadata') or {}
    if metadata and "documents" in metadata:
        documents = metadata["documents"]
    
    return {
        "policy_id": str(policy_id),
        "policy_name": policy.policy_name,
        "documents": documents
    }


@router.get("/{policy_id}/download-document/{document_index}/")
async def download_insurance_document(
    policy_id: UUID,
    document_index: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download a specific document for an insurance policy."""
    
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
    
    # Check if document exists
    metadata = getattr(policy, 'policy_metadata') or {}
    if (not metadata or 
        "documents" not in metadata or 
        document_index >= len(metadata["documents"]) or
        document_index < 0):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document_info = metadata["documents"][document_index]
    document_path = document_info["document_path"]

    try:
        # Get download URL from Supabase Storage
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/storage/v1/object/sign/insurance-documents/{document_path}",
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
                "document_name": document_info["document_name"],
                "document_size": document_info["document_size"],
                "document_type": document_info["document_type"],
                "expires_in": 3600
            }
            
    except Exception as e:
        print(f"Document download error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )


@router.delete("/{policy_id}/delete-document/{document_index}/")
async def delete_insurance_document(
    policy_id: UUID,
    document_index: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a specific document for an insurance policy."""
    
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
    
    # Check if document exists
    metadata = getattr(policy, 'policy_metadata') or {}
    if (not metadata or 
        "documents" not in metadata or 
        document_index >= len(metadata["documents"]) or
        document_index < 0):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document_info = metadata["documents"][document_index]
    document_path = document_info["document_path"]
    document_name = document_info["document_name"]

    try:
        # Delete from Supabase Storage
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.SUPABASE_URL}/storage/v1/object/insurance-documents/{document_path}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"
                }
            )
            
            # Note: Supabase may return 404 if file doesn't exist, which is acceptable
            if response.status_code not in [200, 204, 404]:
                print(f"Storage deletion warning: {response.status_code} - {response.text}")
        
        # Remove document from metadata
        updated_metadata = getattr(policy, 'policy_metadata') or {}
        if "documents" in updated_metadata:
            updated_metadata["documents"].pop(document_index)
            setattr(policy, 'policy_metadata', updated_metadata)
        
        # Mark the metadata as modified to trigger SQLAlchemy update
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(policy, "policy_metadata")
        
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

