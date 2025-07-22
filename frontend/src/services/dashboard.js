import apiClient from '../lib/api'

export const dashboardService = {
  async getSummary() {
    const response = await apiClient.get('/dashboard/summary')
    return response.data
  }
}

