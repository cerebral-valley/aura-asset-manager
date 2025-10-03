/**
 * Goals Service
 * 
 * Frontend service layer for Goals API endpoints.
 * Uses named export pattern with proper trailing slashes to match backend routes.
 */

import apiClient from '../lib/api'

export const goalsService = {
  /**
   * Get all goals for the current user
   * @param {Object} config - Axios config (includes abort signal)
   * @returns {Promise<Array>} Array of goal objects
   */
  async getGoals(config = {}) {
    const response = await apiClient.get('/goals/', config)
    return response.data
  },

  /**
   * Get a single goal by ID
   * @param {string} id - Goal UUID
   * @param {Object} config - Axios config (includes abort signal)
   * @returns {Promise<Object>} Goal object
   */
  async getGoal(id, config = {}) {
    const response = await apiClient.get(`/goals/${id}/`, config)
    return response.data
  },

  /**
   * Create a new goal
   * @param {Object} goalData - Goal data (goal_type, title, target_amount, etc.)
   * @param {Object} config - Axios config (includes abort signal)
   * @returns {Promise<Object>} Created goal object
   */
  async createGoal(goalData, config = {}) {
    const response = await apiClient.post('/goals/', goalData, config)
    return response.data
  },

  /**
   * Update an existing goal
   * @param {string} id - Goal UUID
   * @param {Object} goalData - Updated goal data
   * @param {Object} config - Axios config (includes abort signal)
   * @returns {Promise<Object>} Updated goal object
   */
  async updateGoal(id, goalData, config = {}) {
    const response = await apiClient.put(`/goals/${id}/`, goalData, config)
    return response.data
  },

  /**
   * Mark a goal as complete (auto-sets completed_date)
   * @param {string} id - Goal UUID
   * @param {Object} config - Axios config (includes abort signal)
   * @returns {Promise<Object>} Updated goal object with completion date
   */
  async completeGoal(id, config = {}) {
    const response = await apiClient.put(`/goals/${id}/`, { goal_completed: true }, config)
    return response.data
  },

  /**
   * Delete a goal
   * @param {string} id - Goal UUID
   * @param {Object} config - Axios config (includes abort signal)
   * @returns {Promise<Object>} Success message
   */
  async deleteGoal(id, config = {}) {
    const response = await apiClient.delete(`/goals/${id}/`, config)
    return response.data
  }
}
