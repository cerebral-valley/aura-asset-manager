import apiClient from '@/lib/api'

export const dashboardService = {
  async getSummary(config = {}) {
    console.log('dashboardService: getSummary() called')
    console.log('dashboardService: Making GET request to /dashboard/summary')
    try {
      const response = await apiClient.get('/dashboard/summary', config)
      console.log('dashboardService: Response received:', response.status, response.data)
      return response.data
    } catch (error) {
      console.error('dashboardService: Error in getSummary:', error)
      throw error
    }
  }
}

