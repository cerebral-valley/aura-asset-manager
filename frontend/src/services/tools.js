/**
 * Tools API Service
 * 
 * Service for advanced asset analysis and visualization tools.
 * Handles asset hierarchy generation for mind map visualizations.
 */

import apiClient from '../lib/api'

/**
 * Default hierarchy order: Liquidity → Time Horizon → Purpose → Type
 */
export const DEFAULT_HIERARCHY = ['liquidity', 'time_horizon', 'purpose', 'type']

export const toolsService = {
  /**
   * Get asset hierarchy for visualization
   * @param {Object} config - Configuration object
   * @param {string[]} config.hierarchy - Order of hierarchy levels
   * @param {number} config.depth - Number of levels to display (1-5)
   * @param {Object} axiosConfig - Axios configuration (for abort signal)
   * @returns {Promise<Object>} Hierarchy data with nodes and edges
   */
  async getAssetHierarchy(config = {}, axiosConfig = {}) {
    try {
      const requestData = {
        hierarchy: config.hierarchy || DEFAULT_HIERARCHY,
        depth: config.depth || 5
      }
      
      const response = await apiClient.post('/tools/asset-hierarchy', requestData, axiosConfig)
      return response.data
    } catch (error) {
      console.error('Error fetching asset hierarchy:', error)
      throw error
    }
  }
}
