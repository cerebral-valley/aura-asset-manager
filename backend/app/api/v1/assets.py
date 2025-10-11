"""
Assets API endpoints for asset management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import and_, or_, func  # type: ignore
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.asset import Asset
from app.schemas.asset import Asset as AssetSchema, AssetCreate, AssetUpdate, AssetSummary
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import os
import secrets
import httpx
from app.core.config import settings

router = APIRouter()

async def ensure_storage_bucket_exists(bucket_name: str = "asset-documents") -> bool:
    """
    Ensure the Supabase storage bucket exists, create it if it doesn't.
    """
    try:
        print(f"🔍 Checking if storage bucket '{bucket_name}' exists...")
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/storage/v1/bucket/{bucket_name}",
                headers={
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                print(f"✅ Storage bucket '{bucket_name}' already exists")
                return True
            elif response.status_code == 404:
                # Bucket doesn't exist, create it
                print(f"📁 Creating storage bucket '{bucket_name}'...")
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
                        "file_size_limit": 52428800,  # 50MB per file
                        "allowed_mime_types": [
                            "application/pdf",
                            "image/jpeg",
                            "image/jpg",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        ]
                    }
                )
                
                if create_response.status_code in [200, 201]:
                    print(f"✅ Storage bucket '{bucket_name}' created successfully")
                    return True
                else:
                    print(f"❌ Failed to create storage bucket: {create_response.status_code} - {create_response.text}")
                    return False
            else:
                print(f"❌ Unexpected response checking bucket: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error ensuring storage bucket exists: {str(e)}")
        return False


async def ensure_user_folder_exists(user_id: UUID, bucket_name: str = "asset-documents") -> bool:
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

@router.get("/", response_model=List[AssetSchema])
async def get_assets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all assets for the current user."""
    # Filter out sold assets (quantity = 0 or NULL indicates sold/inactive assets)
    # Use explicit NULL handling to ensure proper filtering
    assets = db.query(Asset).filter(
        Asset.user_id == current_user.id,
        and_(
            Asset.quantity.isnot(None),  # Not NULL
            Asset.quantity > 0  # Greater than 0
        )
    ).all()
    
    # Debug logging to track asset filtering
    all_assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    print(f"🔍 ASSETS_FILTER: Total assets for user: {len(all_assets)}")
    print(f"🔍 ASSETS_FILTER: Active assets (quantity > 0): {len(assets)}")
    
    for asset in all_assets:
        status = "ACTIVE" if asset.quantity and asset.quantity > 0 else "SOLD/INACTIVE"  # type: ignore
        print(f"🔍 Asset: {asset.name}, quantity: {asset.quantity}, value: {asset.current_value}, status: {status}")
    
    # Debug logging
    print(f"🔍 Found {len(assets)} active assets for user {current_user.id}")
    for asset in assets:
        print(f"🔍 Active Asset: {asset.name}, type: {asset.asset_type}, current_value: {asset.current_value}, initial_value: {asset.initial_value}, quantity: {asset.quantity}")
        if asset.asset_metadata:  # type: ignore
            print(f"🔍   Metadata: {asset.asset_metadata}")
    
    return assets

@router.post("/", response_model=AssetSchema)
async def create_asset(
    asset: AssetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new asset."""
    db_asset = Asset(**asset.model_dump(), user_id=current_user.id)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/{asset_id}/", response_model=AssetSchema)
async def get_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific asset by ID."""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    return asset

@router.put("/{asset_id}/", response_model=AssetSchema)
async def update_asset(
    asset_id: UUID,
    asset_update: AssetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing asset."""
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    update_data = asset_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    
    db.commit()
    db.refresh(asset)
    return asset

@router.delete("/{asset_id}/")
async def delete_asset(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an asset and all its associated transactions."""
    from app.models.transaction import Transaction
    
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    # Get count of transactions for this asset
    transaction_count = db.query(Transaction).filter(
        Transaction.asset_id == asset_id,
        Transaction.user_id == current_user.id
    ).count()
    
    # Delete all transactions for this asset first (explicit deletion for clarity)
    db.query(Transaction).filter(
        Transaction.asset_id == asset_id,
        Transaction.user_id == current_user.id
    ).delete()
    
    # Delete the asset
    db.delete(asset)
    db.commit()
    
    return {
        "message": f"Asset '{asset.name}' deleted successfully",
        "transactions_deleted": transaction_count,
        "asset_name": asset.name
    }


# Document Upload Endpoints

@router.post("/{asset_id}/upload-document/")
async def upload_asset_document(
    asset_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a document for an asset."""
    
    print(f"🔄 Document upload started:")
    print(f"   Asset ID: {asset_id}")
    print(f"   User ID: {current_user.id}")
    print(f"   File: {file.filename}")
    print(f"   Content Type: {file.content_type}")
    print(f"   Supabase URL: {settings.SUPABASE_URL}")
    
    # Validate asset exists and belongs to user
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id
    ).first()
    
    if not asset:
        print(f"❌ Asset not found: {asset_id} for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    print(f"✅ Asset found: {asset.name} (type: {asset.asset_type})")
    
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
    total_usage = db.query(Asset).filter(
        Asset.user_id == current_user.id,
        Asset.document_size.isnot(None)
    ).with_entities(func.sum(Asset.document_size)).scalar() or 0
    
    if total_usage + len(content) > 25 * 1024 * 1024:  # 25MB total
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total storage limit (25MB) would be exceeded"
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'bin'
    unique_filename = f"{current_user.id}/{asset_id}_{secrets.token_hex(8)}.{file_extension}"
    
    print(f"📁 Generated filename: {unique_filename}")
    
    try:
        # Ensure the storage bucket exists
        print(f"🪣 Checking/creating storage bucket...")
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
        print(f"🚀 Uploading to Supabase Storage...")
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
        
        # Update asset with document information
        print(f"💾 Updating asset with document metadata...")
        update_data = {
            "document_path": unique_filename,
            "document_name": file.filename,
            "document_size": len(content),
            "document_type": file_extension.lower(),
            "document_uploaded_at": datetime.utcnow()
        }
        
        print(f"   Document data: {update_data}")
        
        for field, value in update_data.items():
            setattr(asset, field, value)
        
        db.commit()
        db.refresh(asset)
        
        print(f"✅ Document upload completed successfully!")
        print(f"   Asset ID: {asset.id}")
        print(f"   Document path: {asset.document_path}")
        print(f"   Document name: {asset.document_name}")
        
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
        print(f"   Asset ID: {asset_id}")
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


@router.get("/{asset_id}/download-document/")
async def download_asset_document(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download a document for an asset."""
    
    # Validate asset exists, belongs to user, and has a document
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id,
        Asset.document_path.isnot(None)
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset or document not found"
        )
    
    try:
        # Get download URL from Supabase Storage
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/storage/v1/object/sign/asset-documents/{asset.document_path}",
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
                "document_name": asset.document_name,
                "document_size": asset.document_size,
                "document_type": asset.document_type,
                "expires_in": 3600
            }
            
    except Exception as e:
        print(f"Document download error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )


@router.delete("/{asset_id}/delete-document/")
async def delete_asset_document(
    asset_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a document for an asset."""
    
    # Validate asset exists, belongs to user, and has a document
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.user_id == current_user.id,
        Asset.document_path.isnot(None)
    ).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset or document not found"
        )
    
    document_path = asset.document_path
    document_name = asset.document_name
    
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
        
        # Clear document fields from asset
        clear_data = {
            "document_path": None,
            "document_name": None,
            "document_size": None,
            "document_type": None,
            "document_uploaded_at": None
        }
        
        for field, value in clear_data.items():
            setattr(asset, field, value)
        
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

