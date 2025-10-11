/**
 * AssetDocumentUpload Component
 * 
 * Handles document upload, display, and management for individual assets.
 * Features:
 * - Drag & drop file upload
 * - File validation (type, size, quota)
 * - Upload progress indicator
 * - Document preview and download
 * - Delete functionality
 */

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../../services/documents.js'
import { useAuth } from '../../hooks/useAuth'
import { queryKeys } from '../../lib/queryKeys.js'

const AssetDocumentUpload = ({ asset, onUploadSuccess, onUploadError }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationError, setValidationError] = useState('')
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()
  const { session } = useAuth()

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const validation = documentService.validateFile(file)
      if (!validation.success) {
        throw new Error(validation.error)
      }
      
      return documentService.uploadDocument(asset.id, file, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })
    },
    onSuccess: (data) => {
      setUploadProgress(0)
      setValidationError('')
      // Invalidate assets query to refresh asset data with document info
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() })
      onUploadSuccess?.(data)
    },
    onError: (error) => {
      setUploadProgress(0)
      const errorMessage = error.response?.data?.detail || error.message
      setValidationError(errorMessage)
      onUploadError?.(errorMessage)
    }
  })

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: () => documentService.getDownloadUrl(asset.id),
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.download_url, '_blank')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to download document'
      setValidationError(errorMessage)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => documentService.deleteDocument(asset.id),
    onSuccess: () => {
      setValidationError('')
      // Invalidate assets query to refresh asset data
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() })
      onUploadSuccess?.(null) // Signal document removed
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete document'
      setValidationError(errorMessage)
    }
  })

  const handleFileSelect = (file) => {
    if (!file) return
    
    setValidationError('')
    uploadMutation.mutate(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0]) // Only handle first file
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const hasDocument = asset.document_name && asset.document_path
  const isUploading = uploadMutation.isPending
  const isDownloading = downloadMutation.isPending
  const isDeleting = deleteMutation.isPending

  if (!session) {
    return null // Don't render if not authenticated
  }

  return (
    <div className="space-y-4">
      {/* Document Status Display */}
      {hasDocument ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {documentService.getFileTypeInfo(asset.document_type).icon}
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {asset.document_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {documentService.formatFileSize(asset.document_size)} • 
                  {documentService.getFileTypeInfo(asset.document_type).label}
                </p>
                {asset.document_uploaded_at && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Uploaded {new Date(asset.document_uploaded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {/* Download Button */}
              <button
                onClick={() => downloadMutation.mutate()}
                disabled={isDownloading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
              
              {/* Delete Button */}
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={isDeleting}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Zone */
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="text-4xl">📎</div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Asset Document
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Drag & drop a file here, or click to select
              </p>
              
              <button
                onClick={openFileDialog}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Select File'}
              </button>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Supports PDF, JPEG, DOCX • Max 3MB per file • 25MB total limit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Display */}
      {validationError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{validationError}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpeg,.jpg,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}

export default AssetDocumentUpload