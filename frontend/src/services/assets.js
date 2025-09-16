import apiClient from '../lib/api'

export const assetsService = {
  async getAssets(config = {}) {
    const response = await apiClient.get('/assets/', config)
    return response.data
  },

  async getAsset(id, config = {}) {
    const response = await apiClient.get(`/assets/${id}/`, config)
    return response.data
  },

  async createAsset(asset, config = {}) {
    const response = await apiClient.post('/assets/', asset, config)
    return response.data
  },

  async updateAsset(id, asset, config = {}) {
    const response = await apiClient.put(`/assets/${id}/`, asset, config)
    return response.data
  },

  async deleteAsset(id, config = {}) {
    const response = await apiClient.delete(`/assets/${id}/`, config)
    return response.data
  }
}

