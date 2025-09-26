import apiClient from '../lib/api'

/**
 * Targets API Service
 * 
 * CRITICAL: URL formatting must match FastAPI backend routes exactly:
 * - Root endpoints (@router.get("/"), @router.post("/")) use NO trailing slash
 * - All other endpoints (@router.put("/{id}"), etc.) use NO trailing slash
 * - Mismatched URLs cause FastAPI 307 redirects that downgrade HTTPS→HTTP
 * - CSP policies block HTTP requests, causing "Refused to connect" errors
 */
export const targetsService = {
  // Root endpoints - match @router.get("/") and @router.post("/")
  async getTargets(config = {}) {
    const response = await apiClient.get('/targets', config)
    return response.data
  },

  async createTarget(target, config = {}) {
    const response = await apiClient.post('/targets', target, config)
    return response.data
  },

  // ID-based endpoints - match @router.put("/{target_id}"), @router.delete("/{target_id}")
  async updateTarget(id, target, config = {}) {
    const response = await apiClient.put(`/targets/${id}`, target, config)
    return response.data
  },

  async deleteTarget(id, config = {}) {
    const response = await apiClient.delete(`/targets/${id}`, config)
    return response.data
  },

  // Action endpoints - match @router.post("/{target_id}/complete"), @router.post("/{target_id}/restore")
  async completeTarget(id, config = {}) {
    const response = await apiClient.post(`/targets/${id}/complete`, {}, config)
    return response.data
  },

  async restoreTarget(id, config = {}) {
    const response = await apiClient.post(`/targets/${id}/restore`, {}, config)
    return response.data
  },

  // Special endpoints - match @router.get("/completed"), @router.put("/liquid-assets")
  async getCompletedTargets(config = {}) {
    const response = await apiClient.get('/targets/completed', config)
    return response.data
  },

  async updateAssetSelections(data, config = {}) {
    // data should already contain the 'selections' property
    console.log('🔧 DEBUG [targetService]: Making PUT request to /targets/liquid-assets with data:', data);
    try {
      // Validate data format before sending
      if (!data.selections || typeof data.selections !== 'object') {
        throw new Error('Invalid selection data: must contain "selections" object');
      }
      
      // Ensure all values are boolean
      const cleanedSelections = {};
      Object.entries(data.selections).forEach(([key, value]) => {
        cleanedSelections[key] = Boolean(value);
      });
      
      // Use cleaned data
      const cleanedData = { selections: cleanedSelections };
      
      // Ensure we're passing proper Content-Type header
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Content-Type'] = 'application/json';
      
      console.log('🔧 DEBUG [targetService]: Clean payload:', JSON.stringify(cleanedData, null, 2));
      
      const response = await apiClient.put('/targets/liquid-assets', cleanedData, config);
      console.log('🔧 DEBUG [targetService]: PUT request successful, response:', response);
      return response.data;
    } catch (error) {
      console.error('🔧 DEBUG [targetService]: PUT request failed:', error);
      console.error('🔧 DEBUG [targetService]: Error config:', error.config);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('🔧 DEBUG [targetService]: Server response error:');
        console.error('  - Status:', error.response.status);
        console.error('  - Data:', error.response.data);
        console.error('  - Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // Likely a CORS, network or timeout issue
        console.error('🔧 DEBUG [targetService]: No response received from server (network/CORS issue)');
        console.error('  - Request details:', error.request);
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('🔧 DEBUG [targetService]: Request setup error:', error.message);
      }
      
      throw error;
    }
  },

  // Allocation endpoint - match @router.post("/{target_id}/allocations")
  async updateTargetAllocations(targetId, allocations, config = {}) {
    const response = await apiClient.post(`/targets/${targetId}/allocations`, allocations, config)
    return response.data
  }
}