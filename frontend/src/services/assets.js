import apiClient from '../lib/api'

/**
 * Assets API Service
 * 
 * CRITICAL: URL formatting must match FastAPI backend routes exactly:
 * - Root endpoints use NO trailing slash
 * - Mismatched URLs cause 307 redirects → HTTPS→HTTP downgrade
 * - CSP policies block HTTP requests → "Refused to connect" errors
 */
export const assetsService = {
  async getAssets(config = {}) {
    const response = await apiClient.get('/assets', config)
    return response.data
  },

  async getAsset(id, config = {}) {
    const response = await apiClient.get(`/assets/${id}`, config)
    return response.data
  },

  async createAsset(asset, config = {}) {
    const response = await apiClient.post('/assets', asset, config)
    return response.data
  },

  async updateAsset(id, asset, config = {}) {
    const response = await apiClient.put(`/assets/${id}`, asset, config)
    return response.data
  },

  async deleteAsset(id, config = {}) {
    const response = await apiClient.delete(`/assets/${id}`, config)
    return response.data
  }
}

