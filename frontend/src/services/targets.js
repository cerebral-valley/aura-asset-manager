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
    const response = await apiClient.put('/targets/liquid-assets', data, config)
    return response.data
  },

  // Allocation endpoint - match @router.post("/{target_id}/allocations")
  async updateTargetAllocations(targetId, allocations, config = {}) {
    const response = await apiClient.post(`/targets/${targetId}/allocations`, allocations, config)
    return response.data
  }
}