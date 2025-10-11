/**
 * Document Upload Service
 * 
 * Handles document upload, download, and deletion for assets.
 * Supports PDF, JPEG, and DOCX files with size and quota validation.
 */

import apiClient from '../lib/api.js'

export const documentService = {
  /**
   * Upload a document for an asset
   * @param {string} assetId - Asset UUID
   * @param {File} file - File to upload (PDF/JPEG/DOCX, max 3MB)
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Upload response with document metadata
   */
  async uploadDocument(assetId, file, config = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(
      `/assets/${assetId}/upload-document/`,
      formData,
      {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers
        }
      }
    )
    return response.data
  },

  /**
   * Get download URL for an asset document
   * @param {string} assetId - Asset UUID
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Download URL and document metadata
   */
  async getDownloadUrl(assetId, config = {}) {
    const response = await apiClient.get(`/assets/${assetId}/download-document/`, config)
    return response.data
  },

  /**
   * Delete a document for an asset
   * @param {string} assetId - Asset UUID
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Deletion confirmation
   */
  async deleteDocument(assetId, config = {}) {
    const response = await apiClient.delete(`/assets/${assetId}/delete-document/`, config)
    return response.data
  },

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result with success flag and error message
   */
  validateFile(file) {
    const maxSize = 3 * 1024 * 1024 // 3MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!file) {
      return { success: false, error: 'No file selected' }
    }
    
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 3MB limit' }
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File type not allowed. Please use PDF, JPEG, or DOCX files.' }
    }
    
    return { success: true }
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size (e.g., "1.5 MB")
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  },

  /**
   * Get file type icon/label
   * @param {string} fileType - File extension (pdf, jpeg, docx)
   * @returns {Object} Icon and label information
   */
  getFileTypeInfo(fileType) {
    const typeMap = {
      pdf: { icon: '📄', label: 'PDF Document', color: 'text-red-600' },
      jpeg: { icon: '🖼️', label: 'JPEG Image', color: 'text-green-600' },
      jpg: { icon: '🖼️', label: 'JPEG Image', color: 'text-green-600' },
      docx: { icon: '📝', label: 'Word Document', color: 'text-blue-600' }
    }
    
    return typeMap[fileType?.toLowerCase()] || { icon: '📎', label: 'Document', color: 'text-gray-600' }
  }
}