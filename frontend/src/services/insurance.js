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
  }
}

