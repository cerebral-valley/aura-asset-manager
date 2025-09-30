/**
 * Goals API Service
 * 
 * CRITICAL: URL formatting must match FastAPI backend routes exactly:
 * - Root endpoints use NO trailing slash
 * - Mismatched URLs cause 307 redirects → HTTPS→HTTP downgrade
 * - CSP policies block HTTP requests → "Refused to connect" errors
 */

import apiClient from '@/lib/api'

export const goalsService = {
  async getGoals(includeCompleted = false, config = {}) {
    const params = includeCompleted ? '?include_completed=true' : ''
    const response = await apiClient.get(`/goals/${params}`, config)
    return response.data
  },

  async getGoal(id, config = {}) {
    const response = await apiClient.get(`/goals/${id}`, config)
    return response.data
  },

  async createGoal(goal, config = {}) {
    const response = await apiClient.post('/goals', goal, config)
    return response.data
  },

  async updateGoal(id, goal, config = {}) {
    const response = await apiClient.put(`/goals/${id}`, goal, config)
    return response.data
  },

  async deleteGoal(id, config = {}) {
    const response = await apiClient.delete(`/goals/${id}`, config)
    return response.data
  },

  async completeGoal(id, config = {}) {
    const response = await apiClient.patch(`/goals/${id}/complete`, {}, config)
    return response.data
  }
}