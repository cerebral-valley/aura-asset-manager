/**
 * User Settings API Service
 */

import apiClient from '@/lib/api'

class UserSettingsService {
  constructor() {
    this.baseUrl = '/user-settings'
  }

  async getSettings() {
    try {
      const response = await apiClient.get(this.baseUrl)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to view settings')
      }
      throw new Error(error.response?.data?.detail || 'Failed to load settings')
    }
  }

  async saveSettings(settings) {
    try {
      const response = await apiClient.post(this.baseUrl, settings)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to save settings')
      }
      throw new Error(error.response?.data?.detail || 'Failed to save settings')
    }
  }

  async updateSettings(settings) {
    try {
      const response = await apiClient.put(this.baseUrl, settings)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to update settings')
      }
      throw new Error(error.response?.data?.detail || 'Failed to update settings')
    }
  }
}

export const userSettingsService = new UserSettingsService()
