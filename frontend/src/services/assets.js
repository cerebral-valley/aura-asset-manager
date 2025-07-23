import apiClient from '@/lib/api.js'

export const assetsService = {
  async getAssets() {
    const response = await apiClient.get('/assets')
    return response.data
  },

  async getAsset(id) {
    const response = await apiClient.get(`/assets/${id}`)
    return response.data
  },

  async createAsset(asset) {
    const response = await apiClient.post('/assets', asset)
    return response.data
  },

  async updateAsset(id, asset) {
    const response = await apiClient.put(`/assets/${id}`, asset)
    return response.data
  },

  async deleteAsset(id) {
    const response = await apiClient.delete(`/assets/${id}`)
    return response.data
  }
}

