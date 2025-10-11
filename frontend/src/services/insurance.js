import apiClient from '@/lib/api'

export const insuranceService = {
  async getPolicies(config = {}) {
    const response = await apiClient.get('/insurance/', config)
    return response.data
  },

  async getPolicy(id, config = {}) {
    const response = await apiClient.get(`/insurance/${id}`, config)
    return response.data
  },

  async createPolicy(policy, config = {}) {
    const response = await apiClient.post('/insurance/', policy, config)
    return response.data
  },

  async updatePolicy(id, policy, config = {}) {
    const response = await apiClient.put(`/insurance/${id}`, policy, config)
    return response.data
  },

  async deletePolicy(id, config = {}) {
    const response = await apiClient.delete(`/insurance/${id}`, config)
    return response.data
  },

  // Insurance Document Management Methods (same pattern as Assets)
  /**
   * Get documents for an insurance policy
   * @param {string} policyId - Policy UUID
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Documents data for the policy
   */
  async getDocuments(policyId, config = {}) {
    const response = await apiClient.get(`/insurance/${policyId}/documents/`, config)
    return response.data
  },

  /**
   * Upload a document for an insurance policy
   * @param {string} policyId - Policy UUID
   * @param {File} file - File to upload (PDF/JPEG/DOCX, max 3MB)
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Upload response with document metadata
   */
  async uploadDocument(policyId, file, config = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(
      `/insurance/${policyId}/upload-document/`,
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
   * Get download URL for an insurance document
   * @param {string} policyId - Policy UUID
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Download URL and document metadata
   */
  async downloadDocument(policyId, config = {}) {
    const response = await apiClient.get(`/insurance/${policyId}/download-document/`, config)
    return response.data
  },

  /**
   * Delete document for an insurance policy
   * @param {string} policyId - Policy UUID
   * @param {Object} config - Axios configuration (for abort signals)
   * @returns {Promise} Deletion confirmation
   */
  async deleteDocument(policyId, config = {}) {
    const response = await apiClient.delete(`/insurance/${policyId}/delete-document/`, config)
    return response.data
  },

  /**
   * Validate insurance document file before upload (same as Assets)
   * @param {File} file - File to validate
   * @returns {Object} Validation result with success flag and error message
   */
  validateDocument(file) {
    const maxSize = 3 * 1024 * 1024 // 3MB (same as Assets)
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
      return { success: false, error: 'Only PDF, JPEG, and DOCX files are allowed.' }
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
  }
}

