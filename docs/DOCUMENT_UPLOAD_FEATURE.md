# Document Upload Feature Implementation Guide

## 📋 Executive Summary

This document outlines the comprehensive implementation plan for adding document upload functionality to the Aura Asset Manager. The feature enables users to attach PDF, JPEG, and DOCX files to their assets with proper storage management, security, and user experience considerations.

**Key Features:**
- Document attachment for each asset (one document per asset)
- File type validation (PDF, JPEG, DOCX only)
- Individual file size limit: 3MB
- Total user storage limit: 25MB
- Secure storage with user isolation
- Document viewing in new browser tab
- Storage usage tracking and visualization

---

## 🔍 Current System Analysis

### Database Structure Analysis (Completed: October 11, 2025)
**Current Assets Table Schema:**
- ✅ **Primary Keys**: `id` (UUID), `user_id` (UUID foreign key)
- ✅ **Core Fields**: `name`, `asset_type`, `description`, `purchase_date`
- ✅ **Financial Fields**: `initial_value`, `current_value`, `quantity`, `unit_of_measure`
- ✅ **Strategic Fields**: `is_selected`, `liquid_assets`, `time_horizon`, `asset_purpose`
- ✅ **Metadata**: `metadata` (JSONB), `asset_metadata` (text)
- ✅ **Timestamps**: `created_at`, `updated_at`, `modified_at`

**Project Details:**
- **Supabase Project**: `aura-asset-manager-prod` (ID: buuyvrysvjwqqfoyfbdr)
- **Region**: ap-southeast-1
- **Database Version**: PostgreSQL 17.4.1.057
- **RLS Enabled**: Yes (on all tables)

### Missing Components for Document Upload:
- ❌ Document storage columns in assets table
- ❌ Storage bucket for file management
- ❌ File size tracking mechanism
- ❌ Storage quota enforcement

---

## 🏗️ Implementation Plan

## Phase 1: Database Schema & Storage Setup

### 1.1 Database Schema Extension

**Migration Name:** `add_document_support_to_assets`

**Required SQL Changes:**
```sql
-- Add document attachment columns to assets table
ALTER TABLE assets ADD COLUMN document_path TEXT;
ALTER TABLE assets ADD COLUMN document_name TEXT;
ALTER TABLE assets ADD COLUMN document_size INTEGER; -- size in bytes
ALTER TABLE assets ADD COLUMN document_type TEXT; -- 'pdf', 'jpeg', 'docx'
ALTER TABLE assets ADD COLUMN document_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add validation constraints
ALTER TABLE assets ADD CONSTRAINT check_document_type 
    CHECK (document_type IS NULL OR document_type IN ('pdf', 'jpeg', 'docx'));
    
ALTER TABLE assets ADD CONSTRAINT check_document_size 
    CHECK (document_size IS NULL OR (document_size > 0 AND document_size <= 3145728)); -- 3MB max

-- Add performance index
CREATE INDEX idx_assets_document_path ON assets(document_path) WHERE document_path IS NOT NULL;

-- Add index for storage usage queries
CREATE INDEX idx_assets_user_document_size ON assets(user_id, document_size) WHERE document_size IS NOT NULL;
```

### 1.2 Supabase Storage Bucket Configuration

**Storage Bucket Setup:**
```sql
-- Create storage bucket for asset documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'asset-documents', 
    'asset-documents', 
    false, 
    3145728, -- 3MB in bytes
    ARRAY[
        'application/pdf', 
        'image/jpeg', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
);
```

**Row Level Security Policies:**
```sql
-- Policy: Users can upload their own asset documents
CREATE POLICY "Users can upload own asset documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'asset-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view their own asset documents
CREATE POLICY "Users can view own asset documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'asset-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own asset documents
CREATE POLICY "Users can delete own asset documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'asset-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### 1.3 Storage Usage Helper Function

**Utility Function:**
```sql
-- Function to calculate user's total document storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(document_size) 
         FROM assets 
         WHERE user_id = user_uuid 
         AND document_size IS NOT NULL), 
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 2: Backend API Development

### 2.1 Asset Model Updates

**File:** `backend/app/models/asset.py`

**Add to existing Asset class:**
```python
# Document attachment fields
document_path = Column(Text, nullable=True)
document_name = Column(Text, nullable=True)
document_size = Column(Integer, nullable=True)  # bytes
document_type = Column(Text, nullable=True)     # pdf, jpeg, docx
document_uploaded_at = Column(DateTime(timezone=True), nullable=True)
```

### 2.2 Pydantic Schema Updates

**File:** `backend/app/schemas/asset.py`

**Add to AssetBase class:**
```python
# Document attachment fields
document_path: Optional[str] = None
document_name: Optional[str] = None
document_size: Optional[int] = None
document_type: Optional[str] = None
document_uploaded_at: Optional[datetime] = None
```

**New Response Schema:**
```python
class DocumentUploadResponse(BaseModel):
    message: str
    document_name: str
    document_size: int
    document_type: str
    storage_used: int
    storage_limit: int = 26214400  # 25MB

class StorageUsageResponse(BaseModel):
    total_used: int
    total_limit: int = 26214400  # 25MB
    percentage_used: float
    remaining: int
    documents_count: int
```

### 2.3 New API Endpoints

**File:** `backend/app/api/v1/assets.py`

**Required Endpoints:**

1. **Upload Document**
   ```python
   @router.post("/{asset_id}/document/", response_model=AssetSchema)
   async def upload_document(
       asset_id: UUID,
       file: UploadFile,
       current_user: User = Depends(get_current_active_user),
       db: Session = Depends(get_db)
   ):
   ```

2. **Get Document URL**
   ```python
   @router.get("/{asset_id}/document/")
   async def get_document(
       asset_id: UUID,
       current_user: User = Depends(get_current_active_user),
       db: Session = Depends(get_db)
   ):
   ```

3. **Delete Document**
   ```python
   @router.delete("/{asset_id}/document/", response_model=AssetSchema)
   async def delete_document(
       asset_id: UUID,
       current_user: User = Depends(get_current_active_user),
       db: Session = Depends(get_db)
   ):
   ```

4. **Storage Usage**
   ```python
   @router.get("/storage-usage/", response_model=StorageUsageResponse)
   async def get_storage_usage(
       current_user: User = Depends(get_current_active_user),
       db: Session = Depends(get_db)
   ):
   ```

### 2.4 File Validation Configuration

**Constants:**
```python
# File validation settings
ALLOWED_MIME_TYPES = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpeg', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
}

MAX_FILE_SIZE = 3 * 1024 * 1024  # 3MB in bytes
MAX_TOTAL_STORAGE = 25 * 1024 * 1024  # 25MB in bytes
STORAGE_BUCKET = 'asset-documents'
```

**Storage Path Convention:**
```
asset-documents/{user_id}/{asset_id}/{timestamp}_{filename}
```

---

## Phase 3: Frontend Implementation

### 3.1 Assets Service Extension

**File:** `frontend/src/services/assets.js`

**Add to existing assetsService:**
```javascript
// Document management methods
async uploadDocument(assetId, file, config = {}) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/assets/${assetId}/document/`, formData, {
    ...config,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
},

async getDocumentUrl(assetId, config = {}) {
  const response = await apiClient.get(`/assets/${assetId}/document/`, config);
  return response.data.url;
},

async deleteDocument(assetId, config = {}) {
  const response = await apiClient.delete(`/assets/${assetId}/document/`, config);
  return response.data;
},

async getStorageUsage(config = {}) {
  const response = await apiClient.get('/assets/storage-usage/', config);
  return response.data;
}
```

### 3.2 Assets Table UI Updates

**Current Assets Table Enhancement:**

Add two new columns to the existing Assets table:

| Existing Columns | **NEW: Attachment** | **NEW: Size** |
|-----------------|-------------------|---------------|
| Name, Type, Value, Selected, etc. | View \| Upload \| Remove | 2.3 MB |

**Column Implementation:**
- **Attachment Column**: Conditional button rendering based on `document_name` presence
- **Size Column**: Human-readable format (MB/KB) from `document_size` bytes

### 3.3 New UI Components

#### 3.3.1 Document Upload Modal
**Features:**
- Drag & drop file area
- File type validation (client-side)
- File size validation (3MB max)
- Storage quota check before upload
- Upload progress indicator
- Error handling and user feedback

#### 3.3.2 Storage Usage Indicator
**Location:** Bottom of Assets page
**Design:**
```
📁 Storage Used: 18.7 MB / 25.0 MB (74.8%)
[████████████████░░░░] 5.3 MB remaining
```

#### 3.3.3 Document Actions
- **View Button**: Opens document in new tab via signed URL
- **Upload Button**: Opens upload modal
- **Remove Button**: Confirmation dialog → Delete

### 3.4 State Management Integration

**TanStack Query Extensions:**
```javascript
// Add to existing queryKeys
export const queryKeys = {
  assets: {
    // ... existing keys
    document: (assetId) => [...queryKeys.assets.all, 'document', assetId],
    storageUsage: () => [...queryKeys.assets.all, 'storage-usage'],
  }
}

// New mutations
const uploadDocumentMutation = useMutation({
  mutationFn: ({ assetId, file }) => assetsService.uploadDocument(assetId, file),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() });
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.storageUsage() });
  }
});

const deleteDocumentMutation = useMutation({
  mutationFn: (assetId) => assetsService.deleteDocument(assetId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() });
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.storageUsage() });
  }
});
```

---

## 📅 Implementation Timeline & TODOs

### Phase 1: Database & Storage Foundation (Week 1)

#### Database Schema Setup
- [ ] **1.1.1** Apply migration to add 5 document columns to assets table
- [ ] **1.1.2** Add validation constraints for file types and sizes
- [ ] **1.1.3** Create performance indexes for document queries
- [ ] **1.1.4** Test database schema changes with sample data

#### Storage Bucket Configuration
- [ ] **1.2.1** Create `asset-documents` storage bucket with file size limits
- [ ] **1.2.2** Configure MIME type restrictions (PDF, JPEG, DOCX)
- [ ] **1.2.3** Set up Row Level Security policies for user isolation
- [ ] **1.2.4** Test storage bucket access and file operations

#### Helper Functions
- [ ] **1.3.1** Create `get_user_storage_usage()` function
- [ ] **1.3.2** Test storage calculation accuracy
- [ ] **1.3.3** Performance test with large datasets

### Phase 2: Backend API Development (Week 2)

#### Model & Schema Updates
- [ ] **2.1.1** Update Asset SQLAlchemy model with document fields
- [ ] **2.1.2** Update AssetBase Pydantic schema
- [ ] **2.1.3** Create DocumentUploadResponse and StorageUsageResponse schemas
- [ ] **2.1.4** Test model changes with existing data

#### API Endpoints Implementation
- [ ] **2.2.1** Implement `POST /assets/{id}/document/` upload endpoint
  - [ ] File validation (type, size)
  - [ ] Storage quota enforcement
  - [ ] Supabase Storage integration
  - [ ] Database record update
- [ ] **2.2.2** Implement `GET /assets/{id}/document/` download endpoint
  - [ ] Generate signed URLs
  - [ ] Security access validation
- [ ] **2.2.3** Implement `DELETE /assets/{id}/document/` removal endpoint
  - [ ] Storage file deletion
  - [ ] Database cleanup
- [ ] **2.2.4** Implement `GET /assets/storage-usage/` usage endpoint
  - [ ] Real-time calculation
  - [ ] Response formatting

#### Validation & Security
- [ ] **2.3.1** Implement file type validation (MIME type checking)
- [ ] **2.3.2** Implement file size validation (3MB individual, 25MB total)
- [ ] **2.3.3** Add error handling for all edge cases
- [ ] **2.3.4** Test all endpoints via FastAPI `/docs` interface

### Phase 3: Frontend Implementation (Week 3)

#### Service Layer Integration
- [ ] **3.1.1** Extend assetsService with 4 new document methods
- [ ] **3.1.2** Add proper error handling and response formatting
- [ ] **3.1.3** Implement file upload progress tracking
- [ ] **3.1.4** Test service methods with real API endpoints

#### Assets Table Enhancement
- [ ] **3.2.1** Add "Attachment" column with conditional button rendering
- [ ] **3.2.2** Add "Size" column with human-readable formatting
- [ ] **3.2.3** Update table responsive design for new columns
- [ ] **3.2.4** Test table functionality with various data states

#### UI Components Development
- [ ] **3.3.1** Create DocumentUploadModal component
  - [ ] Drag & drop functionality
  - [ ] File validation feedback
  - [ ] Upload progress indicator
  - [ ] Error state handling
- [ ] **3.3.2** Create StorageUsageIndicator component
  - [ ] Real-time usage display
  - [ ] Visual progress bar
  - [ ] Remaining space calculation
- [ ] **3.3.3** Implement document action buttons
  - [ ] View button (new tab opening)
  - [ ] Upload button (modal trigger)
  - [ ] Remove button (confirmation dialog)

#### State Management Integration
- [ ] **3.4.1** Add document-related query keys to queryKeys structure
- [ ] **3.4.2** Implement upload mutation with optimistic updates
- [ ] **3.4.3** Implement delete mutation with cache invalidation
- [ ] **3.4.4** Add storage usage query with real-time updates

### Phase 4: Integration & Testing (Week 4)

#### End-to-End Testing
- [ ] **4.1.1** Test complete upload flow with real files
- [ ] **4.1.2** Test document viewing in different browsers
- [ ] **4.1.3** Test document deletion and storage cleanup
- [ ] **4.1.4** Test storage quota enforcement
- [ ] **4.1.5** Test file type validation with various formats

#### Edge Case Testing
- [ ] **4.2.1** Test maximum file size uploads (3MB limit)
- [ ] **4.2.2** Test storage quota edge cases (exactly 25MB)
- [ ] **4.2.3** Test unsupported file formats
- [ ] **4.2.4** Test network interruption during upload
- [ ] **4.2.5** Test concurrent uploads from same user

#### Performance Testing
- [ ] **4.3.1** Test upload speed with 3MB files
- [ ] **4.3.2** Test page load performance with many documents
- [ ] **4.3.3** Test storage usage calculation with large datasets
- [ ] **4.3.4** Test browser performance with multiple simultaneous uploads

#### User Experience Validation
- [ ] **4.4.1** Validate upload progress feedback
- [ ] **4.4.2** Validate error message clarity
- [ ] **4.4.3** Validate storage usage visualization
- [ ] **4.4.4** Validate document viewing experience
- [ ] **4.4.5** Test mobile responsiveness for new features

#### Documentation & Deployment
- [ ] **4.5.1** Update API documentation
- [ ] **4.5.2** Update user guide with document features
- [ ] **4.5.3** Create deployment checklist
- [ ] **4.5.4** Version update and deployment to production

---

## 🔐 Security Considerations

### File Security
- **MIME Type Validation**: Server-side validation prevents malicious file uploads
- **File Size Limits**: Prevents resource exhaustion attacks
- **Storage Isolation**: RLS policies ensure users access only their documents
- **Signed URLs**: Temporary access with automatic expiration (24 hours)

### Access Control
- **User Authentication**: All endpoints require valid JWT token
- **Asset Ownership**: Users can only attach documents to their own assets
- **Storage Bucket Policies**: Row-level security on storage.objects table
- **Path Validation**: Server validates storage paths contain user_id

### Data Protection
- **Encrypted Storage**: Supabase Storage provides encryption at rest
- **HTTPS Only**: All file transfers over secure connections
- **No Public Access**: All documents require authentication to view
- **Audit Trail**: Document uploads/deletions logged with timestamps

---

## 📊 Technical Specifications

### File Limits
- **Individual File Size**: 3MB maximum
- **Total User Storage**: 25MB maximum
- **Supported Formats**: PDF, JPEG, DOCX only
- **File Naming**: Original filename preserved with timestamp prefix

### Storage Management
- **Path Structure**: `{user_id}/{asset_id}/{timestamp}_{filename}`
- **Usage Calculation**: Real-time via database query
- **Cleanup Strategy**: Automatic removal on asset deletion
- **Performance**: Indexed queries for efficient storage calculations

### User Experience
- **Upload Feedback**: Real-time progress indicators
- **Error Handling**: Clear, actionable error messages
- **Storage Visualization**: Graphical usage display with remaining space
- **Document Access**: One-click viewing in new browser tab

---

## 🔄 Error Handling & User Feedback

### Upload Errors
- **File Too Large**: "File size exceeds 3MB limit. Please choose a smaller file."
- **Wrong Format**: "Only PDF, JPEG, and DOCX files are allowed."
- **Storage Full**: "Upload would exceed your 25MB storage limit. Currently using X.X MB."
- **Network Error**: "Upload failed due to network error. Please try again."

### View Errors
- **No Document**: "No document uploaded for this asset."
- **Access Error**: "Unable to access document. Please try again."
- **Expired URL**: "Document link has expired. Please refresh and try again."

### Storage Warnings
- **Approaching Limit**: Warning at 90% usage (22.5MB)
- **Critical Usage**: Alert at 95% usage (23.75MB)
- **Storage Full**: Block uploads when at 100% (25MB)

---

## 📋 Success Criteria

### Functional Requirements Met
- ✅ Users can upload PDF, JPEG, DOCX files to assets
- ✅ Individual file size limited to 3MB
- ✅ Total user storage limited to 25MB
- ✅ Documents viewable in new browser tab
- ✅ Storage usage clearly displayed
- ✅ Upload blocked when quota exceeded

### Technical Requirements Met
- ✅ Secure file storage with user isolation
- ✅ Proper database schema with constraints
- ✅ RESTful API following existing patterns
- ✅ Frontend integration with TanStack Query
- ✅ Error handling and user feedback
- ✅ Performance optimized for large files

### User Experience Requirements Met
- ✅ Intuitive upload interface with drag & drop
- ✅ Clear storage usage visualization
- ✅ Responsive design on all devices
- ✅ Fast document viewing
- ✅ Helpful error messages
- ✅ Seamless integration with existing UI

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - API endpoint specifications
- [Database Schema](./DATABASE_SCHEMA.md) - Complete database structure
- [Security Guide](./SECURITY.md) - Security implementation details
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment steps

---

**Document Version**: 1.0  
**Last Updated**: October 11, 2025  
**Implementation Status**: Planning Phase  
**Estimated Completion**: 4 weeks from start date