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
  }
}