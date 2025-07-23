import apiClient from '@/lib/api.js'

export const insuranceService = {
  async getPolicies() {
    const response = await apiClient.get('/insurance')
    return response.data
  },

  async getPolicy(id) {
    const response = await apiClient.get(`/insurance/${id}`)
    return response.data
  },

  async createPolicy(policy) {
    const response = await apiClient.post('/insurance', policy)
    return response.data
  },

  async updatePolicy(id, policy) {
    const response = await apiClient.put(`/insurance/${id}`, policy)
    return response.data
  },

  async deletePolicy(id) {
    const response = await apiClient.delete(`/insurance/${id}`)
    return response.data
  }
}

