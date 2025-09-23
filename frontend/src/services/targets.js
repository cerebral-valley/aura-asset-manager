import apiClient from '../lib/api'

export const targetsService = {
  async getTargets(config = {}) {
    const response = await apiClient.get('/targets/', config)
    return response.data
  },

  async createTarget(target, config = {}) {
    const response = await apiClient.post('/targets/', target, config)
    return response.data
  },

  async updateTarget(id, target, config = {}) {
    const response = await apiClient.put(`/targets/${id}/`, target, config)
    return response.data
  },

  async deleteTarget(id, config = {}) {
    const response = await apiClient.delete(`/targets/${id}/`, config)
    return response.data
  },

  async completeTarget(id, config = {}) {
    const response = await apiClient.post(`/targets/${id}/complete/`, {}, config)
    return response.data
  },

  async getCompletedTargets(config = {}) {
    const response = await apiClient.get('/targets/completed', config)
    return response.data
  },

  async getLiquidAssets(config = {}) {
    const response = await apiClient.get('/targets/liquid-assets', config)
    return response.data
  },

  async updateAssetSelections(selections, config = {}) {
    const response = await apiClient.put('/targets/liquid-assets', { selections }, config)
    return response.data
  },

  async updateTargetAllocations(targetId, allocations, config = {}) {
    const response = await apiClient.post(`/targets/${targetId}/allocations/`, allocations, config)
    return response.data
  },

  async restoreTarget(id, config = {}) {
    const response = await apiClient.post(`/targets/${id}/restore/`, {}, config)
    return response.data
  }
}