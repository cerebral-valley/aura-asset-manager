# File Upload Feature Documentation

## Overview

This document outlines the comprehensive file upload feature implementation for Aura Asset Manager, enabling users to attach documents, images, and other files to their assets for better organization and record-keeping.

## Table of Contents

- [Overview](#overview)
- [Feature Capabilities](#feature-capabilities)
- [Technical Architecture](#technical-architecture)
- [Implementation Strategy](#implementation-strategy)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [File Management Operations](#file-management-operations)
- [Security Considerations](#security-considerations)
- [MCP Integration](#mcp-integration)
- [Deployment Considerations](#deployment-considerations)
- [Future Enhancements](#future-enhancements)

## Feature Capabilities

### Core Upload Features

- **Multi-file Upload**: Upload multiple documents simultaneously
- **Drag & Drop Interface**: Intuitive file selection with drag-and-drop support
- **File Type Support**: Documents (PDF, DOC, DOCX), Images (JPG, PNG, WebP), Spreadsheets (XLS, XLSX)
- **Size Limits**:
  - Standard uploads: Up to 6MB per file
  - Resumable uploads: Up to 5GB per file for large documents
- **Batch Operations**: Process multiple files efficiently
- **Progress Tracking**: Real-time upload progress indicators

### Document Categories for Assets

**Real Estate Assets:**

- Purchase agreements and contracts
- Property deeds and titles
- Inspection reports
- Insurance policies
- Tax assessments
- Appraisal reports

**Investment Assets:**

- Brokerage statements
- Stock certificates
- Bond documents
- Mutual fund prospectuses
- Dividend records
- Tax forms (1099s, etc.)

**Insurance Assets:**

- Policy documents
- Coverage summaries
- Claims history
- Beneficiary information
- Premium payment records

**Business Assets:**

- Business licenses
- Equipment warranties
- Purchase receipts
- Valuation reports
- Depreciation schedules

## Technical Architecture

### Storage Solution: Supabase Storage

**Why Supabase Storage:**

- **Scalability**: Global CDN with 285+ cities for low-latency access
- **Security**: Built-in Row Level Security (RLS) and access controls
- **S3 Compatibility**: Standard protocols for tool integration
- **Cost Effective**: Competitive pricing with generous free tier
- **Integration**: Seamless integration with existing Supabase infrastructure

**Storage Configuration:**

```javascript
// Bucket structure
asset-documents/
├── {user_id}/
│   ├── {asset_id}/
│   │   ├── contracts/
│   │   ├── insurance/
│   │   ├── valuations/
│   │   └── misc/
```

### Upload Methods

**1. Standard Upload (< 6MB files):**

```javascript
const { data, error } = await supabase.storage
  .from('asset-documents')
  .upload(`${userId}/${assetId}/${category}/${fileName}`, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false
  })
```

**2. Resumable Upload (> 6MB files):**

```javascript
const upload = new tus.Upload(file, {
  endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
  headers: {
    authorization: `Bearer ${session.access_token}`,
    'x-upsert': 'false'
  },
  metadata: {
    bucketName: 'asset-documents',
    objectName: `${userId}/${assetId}/${category}/${fileName}`,
    contentType: file.type
  },
  chunkSize: 6 * 1024 * 1024 // 6MB chunks
})
```

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)

1. **Supabase Storage Setup**
   - Create `asset-documents` bucket with proper RLS policies
   - Configure CORS settings for frontend access
   - Set up file size and type restrictions

2. **Database Schema Extension**
   - Extend existing `asset_documents` table
   - Add indexes for efficient querying
   - Create RLS policies for user isolation

3. **Backend Services**
   - Create document upload/download services
   - Implement file validation and security checks
   - Add metadata management endpoints

### Phase 2: Advanced Features

- Automatic document type detection based on content

1. **Upload Components**
   - Drag-and-drop file upload interface
   - Progress indicators and status feedback
   - File preview and validation

2. **Document Management UI**
   - Document gallery for each asset
   - Category-based organization
   - Search and filtering capabilities

3. **Asset Integration**
   - Add document section to asset forms
   - Quick upload during asset creation
   - Document count indicators in asset lists

### Phase 3: AI Integration

- OCR for scanned documents

## Database Schema

### Extended Asset Documents Table

```sql
-- Enhanced asset_documents table
CREATE TABLE asset_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  
  -- Document categorization
  document_type TEXT NOT NULL CHECK (document_type IN (
    'contract', 'insurance', 'valuation', 'tax_document', 
    'certificate', 'receipt', 'statement', 'legal', 'misc'
  )),
  document_category TEXT, -- Additional subcategorization
  
  -- Metadata
  description TEXT,
  tags TEXT[], -- Array of tags for better organization
  
  -- Versioning
  version_number INTEGER DEFAULT 1,
  replaces_document_id UUID REFERENCES asset_documents(id),
  is_current_version BOOLEAN DEFAULT true,
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_asset_documents_asset_id ON asset_documents(asset_id);
CREATE INDEX idx_asset_documents_user_id ON asset_documents(user_id);
CREATE INDEX idx_asset_documents_type ON asset_documents(document_type);
CREATE INDEX idx_asset_documents_current ON asset_documents(is_current_version) WHERE is_current_version = true;

-- RLS Policies
ALTER TABLE asset_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON asset_documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upload documents to own assets" ON asset_documents
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM assets WHERE id = asset_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own documents" ON asset_documents
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own documents" ON asset_documents
  FOR DELETE USING (user_id = auth.uid());
```

### Document Statistics View

```sql
-- View for document statistics per asset
CREATE VIEW asset_document_stats AS
SELECT 
  asset_id,
  COUNT(*) as total_documents,
  COUNT(*) FILTER (WHERE is_current_version = true) as current_documents,
  SUM(file_size) as total_size,
  MAX(uploaded_at) as last_upload_date,
  array_agg(DISTINCT document_type) as document_types
FROM asset_documents
WHERE is_current_version = true
GROUP BY asset_id;
```

## API Endpoints

### Document Upload Service

```javascript
// frontend/src/services/assetDocuments.js
export const assetDocumentService = {
  // Upload single document
  async uploadDocument(assetId, file, documentType, description = '') {
    const userId = await this.getUserId()
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${userId}/${assetId}/${documentType}/${fileName}`
    
    try {
      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('asset-documents')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600'
        })
      
      if (storageError) throw storageError
      
      // Store metadata in database
      const { data: dbData, error: dbError } = await supabase
        .from('asset_documents')
        .insert({
          asset_id: assetId,
          user_id: userId,
          file_name: file.name,
          file_path: storageData.path,
          file_size: file.size,
          content_type: file.type,
          document_type: documentType,
          description
        })
        .select()
        .single()
      
      if (dbError) throw dbError
      
      return { data: dbData, error: null }
    } catch (error) {
      console.error('Document upload error:', error)
      return { data: null, error }
    }
  },

  // Upload multiple documents
  async uploadDocuments(assetId, files, documentType) {
    const results = []
    
    for (const file of files) {
      const result = await this.uploadDocument(assetId, file, documentType)
      results.push({ file: file.name, ...result })
    }
    
    return results
  },

  // Get documents for an asset
  async getAssetDocuments(assetId, config = {}) {
    const { data, error } = await apiClient.get(
      `/assets/${assetId}/documents`,
      config
    )
    return { data, error }
  },

  // Delete document
  async deleteDocument(documentId, config = {}) {
    try {
      // Get document info first
      const { data: document } = await supabase
        .from('asset_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()
      
      if (!document) throw new Error('Document not found')
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('asset-documents')
        .remove([document.file_path])
      
      if (storageError) throw storageError
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('asset_documents')
        .delete()
        .eq('id', documentId)
      
      if (dbError) throw dbError
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Document deletion error:', error)
      return { success: false, error }
    }
  },

  // Replace document (versioning)
  async replaceDocument(documentId, newFile, description = '') {
    try {
      // Get original document
      const { data: originalDoc } = await supabase
        .from('asset_documents')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (!originalDoc) throw new Error('Original document not found')
      
      // Mark original as not current
      await supabase
        .from('asset_documents')
        .update({ is_current_version: false })
        .eq('id', documentId)
      
      // Upload new version
      const userId = await this.getUserId()
      const fileName = `${Date.now()}-${newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${userId}/${originalDoc.asset_id}/${originalDoc.document_type}/${fileName}`
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('asset-documents')
        .upload(filePath, newFile, {
          contentType: newFile.type,
          cacheControl: '3600'
        })
      
      if (storageError) throw storageError
      
      // Create new version record
      const { data: newDoc, error: dbError } = await supabase
        .from('asset_documents')
        .insert({
          asset_id: originalDoc.asset_id,
          user_id: originalDoc.user_id,
          file_name: newFile.name,
          file_path: storageData.path,
          file_size: newFile.size,
          content_type: newFile.type,
          document_type: originalDoc.document_type,
          description,
          version_number: originalDoc.version_number + 1,
          replaces_document_id: documentId,
          is_current_version: true
        })
        .select()
        .single()
      
      if (dbError) throw dbError
      
      return { data: newDoc, error: null }
    } catch (error) {
      console.error('Document replacement error:', error)
      return { data: null, error }
    }
  },

  // Get document download URL
  async getDocumentUrl(documentId, expiresIn = 3600) {
    try {
      const { data: document } = await supabase
        .from('asset_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()
      
      if (!document) throw new Error('Document not found')
      
      const { data: signedURL, error } = await supabase.storage
        .from('asset-documents')
        .createSignedUrl(document.file_path, expiresIn)
      
      if (error) throw error
      
      return { url: signedURL.signedUrl, error: null }
    } catch (error) {
      console.error('Get document URL error:', error)
      return { url: null, error }
    }
  }
}
```

## Frontend Components

### Document Upload Component

```jsx
// frontend/src/components/DocumentUpload.jsx
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { assetDocumentService } from '../services/assetDocuments'

export const DocumentUpload = ({ assetId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    
    const results = []
    for (const file of acceptedFiles) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      const result = await assetDocumentService.uploadDocument(
        assetId, 
        file, 
        'misc', // Default category
        '', // Description
        {
          onProgress: (progress) => {
            setUploadProgress(prev => ({ 
              ...prev, 
              [file.name]: progress.percentage 
            }))
          }
        }
      )
      
      results.push(result)
    }
    
    setUploading(false)
    setUploadProgress({})
    onUploadComplete?.(results)
  }, [assetId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB limit
    multiple: true
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" /* Upload icon */ />
          {isDragActive ? (
            <p className="text-lg font-medium text-blue-600">
              Drop the files here...
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX, JPG, PNG up to 50MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploading files...</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Document Gallery Component

```jsx
// frontend/src/components/DocumentGallery.jsx
import React, { useState, useEffect } from 'react'
import { assetDocumentService } from '../services/assetDocuments'

export const DocumentGallery = ({ assetId }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const documentTypes = {
    contract: { label: 'Contracts', icon: '📄' },
    insurance: { label: 'Insurance', icon: '🛡️' },
    valuation: { label: 'Valuations', icon: '💰' },
    tax_document: { label: 'Tax Documents', icon: '📊' },
    certificate: { label: 'Certificates', icon: '🏆' },
    receipt: { label: 'Receipts', icon: '🧾' },
    legal: { label: 'Legal', icon: '⚖️' },
    misc: { label: 'Other', icon: '📁' }
  }

  useEffect(() => {
    loadDocuments()
  }, [assetId])

  const loadDocuments = async () => {
    setLoading(true)
    const { data, error } = await assetDocumentService.getAssetDocuments(assetId)
    if (!error && data) {
      setDocuments(data)
    }
    setLoading(false)
  }

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    const { success } = await assetDocumentService.deleteDocument(documentId)
    if (success) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    }
  }

  const handleReplace = async (documentId, newFile) => {
    const { data, error } = await assetDocumentService.replaceDocument(
      documentId, 
      newFile,
      `Replaced on ${new Date().toLocaleDateString()}`
    )
    
    if (!error && data) {
      await loadDocuments() // Reload to get updated list
    }
  }

  const filteredDocuments = documents.filter(doc => 
    selectedCategory === 'all' || doc.document_type === selectedCategory
  )

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <div className="animate-pulse">Loading documents...</div>
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({documents.length})
        </button>
        {Object.entries(documentTypes).map(([type, { label, icon }]) => {
          const count = documents.filter(doc => doc.document_type === type).length
          if (count === 0) return null
          
          return (
            <button
              key={type}
              onClick={() => setSelectedCategory(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === type
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {icon} {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
          <p>Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              documentType={documentTypes[document.document_type]}
              onDelete={() => handleDelete(document.id)}
              onReplace={(file) => handleReplace(document.id, file)}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const DocumentCard = ({ document, documentType, onDelete, onReplace, formatFileSize }) => {
  const [showActions, setShowActions] = useState(false)
  
  const handleDownload = async () => {
    const { url, error } = await assetDocumentService.getDocumentUrl(document.id)
    if (!error && url) {
      const a = document.createElement('a')
      a.href = url
      a.download = document.file_name
      a.click()
    }
  }

  const handleReplaceClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = document.content_type
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) onReplace(file)
    }
    input.click()
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="text-2xl">{documentType.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {document.file_name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(document.file_size)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(document.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-1">
            <button
              onClick={handleDownload}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Download"
            >
              <svg className="w-4 h-4" /* Download icon */ />
            </button>
            <button
              onClick={handleReplaceClick}
              className="p-1 text-gray-400 hover:text-yellow-600"
              title="Replace"
            >
              <svg className="w-4 h-4" /* Replace icon */ />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <svg className="w-4 h-4" /* Delete icon */ />
            </button>
          </div>
        )}
      </div>
      
      {document.description && (
        <p className="text-xs text-gray-600 mt-2 italic">
          {document.description}
        </p>
      )}
      
      {document.version_number > 1 && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Version {document.version_number}
        </div>
      )}
    </div>
  )
}
```

## File Management Operations

### Upload Operations

**Single File Upload:**

- Drag & drop or click to select
- Real-time progress tracking
- Automatic categorization suggestions
- Metadata extraction (file size, type, etc.)

**Batch Upload:**

- Multiple file selection
- Parallel upload processing
- Individual file progress tracking
- Error handling for failed uploads

### Delete Operations

**Soft Delete (Recommended):**

```javascript
// Mark as deleted but keep in database for audit trail
const softDeleteDocument = async (documentId) => {
  await supabase
    .from('asset_documents')
    .update({ 
      deleted_at: new Date().toISOString(),
      is_current_version: false 
    })
    .eq('id', documentId)
}
```

**Hard Delete:**

```javascript
// Completely remove from storage and database
const hardDeleteDocument = async (documentId) => {
  // 1. Delete from storage
  const { data: document } = await supabase
    .from('asset_documents')
    .select('file_path')
    .eq('id', documentId)
    .single()
  
  await supabase.storage
    .from('asset-documents')
    .remove([document.file_path])
  
  // 2. Delete from database
  await supabase
    .from('asset_documents')
    .delete()
    .eq('id', documentId)
}
```

### Replace Operations

**Version Control Strategy:**

1. **Keep Original**: Mark original as `is_current_version: false`
2. **Upload New**: Create new record with `version_number + 1`
3. **Link Versions**: Set `replaces_document_id` to original document ID
4. **Maintain History**: Keep all versions for audit trail

**Replace Implementation:**

```javascript
const replaceDocument = async (originalId, newFile, reason = '') => {
  // Step 1: Get original document info
  const { data: original } = await supabase
    .from('asset_documents')
    .select('*')
    .eq('id', originalId)
    .single()
  
  // Step 2: Mark original as not current
  await supabase
    .from('asset_documents')
    .update({ 
      is_current_version: false,
      replaced_at: new Date().toISOString(),
      replacement_reason: reason
    })
    .eq('id', originalId)
  
  // Step 3: Upload new file
  const newFilePath = generateFilePath(original.asset_id, original.document_type, newFile.name)
  
  const { data: uploadData } = await supabase.storage
    .from('asset-documents')
    .upload(newFilePath, newFile)
  
  // Step 4: Create new version record
  const { data: newDocument } = await supabase
    .from('asset_documents')
    .insert({
      ...omit(original, ['id', 'created_at', 'updated_at']),
      file_name: newFile.name,
      file_path: uploadData.path,
      file_size: newFile.size,
      content_type: newFile.type,
      version_number: original.version_number + 1,
      replaces_document_id: originalId,
      is_current_version: true,
      replacement_reason: reason
    })
    .select()
    .single()
  
  return newDocument
}
```

## Security Considerations

### Access Control

**Row Level Security (RLS):**

```sql
-- Users can only access documents for assets they own
CREATE POLICY "asset_documents_select" ON asset_documents
  FOR SELECT USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = asset_id AND user_id = auth.uid()
    )
  );
```

**Storage Bucket Policies:**
```sql
-- Supabase Storage RLS for asset-documents bucket
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'asset-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'asset-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### File Validation

**Frontend Validation:**

- File type restrictions
- File size limits
- Filename sanitization
- Virus scanning integration (future)

**Backend Validation:**

```javascript
const validateFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed')
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large')
  }
  
  return true
}
```

### Privacy & Compliance

**Data Protection:**

- Encrypted storage at rest
- Encrypted transmission (HTTPS)
- Access logging and audit trails
- Retention policy compliance

**GDPR Compliance:**

- Right to deletion (hard delete option)
- Data export capabilities
- User consent tracking
- Data processing transparency

## MCP Integration

### Available MCP Servers for Document Operations

**1. Supabase Storage MCP (Recommended):**
```bash
# Install via npm
npm install -g @desmond-labs/supabase-storage-mcp

# Configuration for Claude Desktop
{
  "mcpServers": {
    "supabase-storage": {
      "command": "npx",
      "args": ["-y", "@desmond-labs/supabase-storage-mcp"],
      "env": {
        "SUPABASE_URL": "your-project-url",
        "SUPABASE_SERVICE_KEY": "your-service-role-key"
      }
    }
  }
}
```

**MCP Capabilities:**
### Core Features:

- **Batch Upload**: Upload 1-500 files with progress tracking
- **File Validation**: MIME type checking and file signature verification  
- **Security**: Enterprise-grade with rate limiting and audit logging
- **Auto-Download**: Generate JavaScript code for browser downloads
- **Batch Operations**: Process multiple files efficiently

**2. Self-Hosted Supabase MCP:**
```bash
# For comprehensive Supabase operations including storage
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["/path/to/self-hosted-supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your-project-url",
        "SUPABASE_SERVICE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### AI-Assisted Document Management

**Document Categorization:**
- Automatic document type detection based on content
- Smart tagging suggestions
- Metadata extraction from document content

**Content Analysis:**
- OCR for scanned documents
- Key information extraction
- Document similarity analysis

## Deployment Considerations

### Storage Configuration

**Bucket Setup:**
```javascript
// Create bucket with proper configuration
const createDocumentBucket = async () => {
  const { data, error } = await supabase.storage.createBucket('asset-documents', {
    public: false, // Private bucket
    fileSizeLimit: 52428800, // 50MB limit
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  })
  
  return { data, error }
}
```

**CORS Configuration:**
```javascript
// Enable CORS for frontend access
const corsConfig = {
  allowedOrigins: [
    'https://aura-asset-manager.vercel.app',
    'http://localhost:5173' // Development
  ],
  allowedHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
}
```

### Performance Optimization

**Image Optimization:**
```javascript
// Automatic image transformation
const getOptimizedImageUrl = (filePath, options = {}) => {
  const { width = 800, height = 600, quality = 80 } = options
  
  return supabase.storage
    .from('asset-documents')
    .getPublicUrl(filePath, {
      transform: {
        width,
        height,
        resize: 'cover',
        quality
      }
    })
}
```

**Caching Strategy:**
- CDN caching for frequently accessed documents
- Browser cache headers for static content
- Progressive loading for document galleries

### Monitoring & Analytics

**Key Metrics to Track:**
- Upload success/failure rates
- File storage usage per user
- Popular document types
- Access patterns and frequency

**Implementation:**
```javascript
// Track upload metrics
const trackUploadMetrics = async (userId, assetId, fileSize, success) => {
  await supabase.from('upload_metrics').insert({
    user_id: userId,
    asset_id: assetId,
    file_size: fileSize,
    success,
    timestamp: new Date().toISOString()
  })
}
```

## Future Enhancements

### Phase 4: Advanced Features (Month 2)

**Document Processing:**
- OCR for scanned documents
- Automatic text extraction and indexing
- Document content search capabilities

**AI Integration:**
- Smart document categorization
- Content summarization
- Key information extraction
- Duplicate document detection

**Collaboration Features:**
- Document sharing with family members
- Comment and annotation system
- Document approval workflows

### Phase 5: Premium Features (Month 3)

**Advanced Security:**
- End-to-end encryption for sensitive documents
- Digital signatures and verification
- Watermarking for document protection

**Integration & Automation:**
- Email attachment auto-import
- Bank/brokerage statement import
- Tax document organization
- Insurance policy renewal alerts

**Analytics & Insights:**
- Document organization health scores
- Missing document identification
- Document lifecycle analytics

### Phase 6: Mobile & Offline (Month 4)

**Mobile Optimization:**
- Camera document capture
- Mobile-optimized upload interface
- Offline document viewing

**Advanced Sync:**
- Progressive sync for large files
- Conflict resolution for concurrent edits
- Backup and restore capabilities

## Conclusion

This comprehensive file upload feature will transform Aura Asset Manager from a simple asset tracking tool into a complete digital asset management platform. By implementing secure document storage, intuitive file operations, and AI-powered organization features, users will have a centralized location for all their important financial documents with professional-grade security and accessibility.

The phased implementation approach ensures a stable rollout while providing immediate value to users, with advanced features building upon a solid foundation of core functionality.
