import apiClient from '../lib/api.js'

export const dashboardService = {
  async getSummary() {
    const response = await apiClient.get('/dashboard/summary')
    return response.data
  }
}

