/**
 * User Settings API Service
 */

import { supabase } from '../lib/supabase.js'

// Get API base URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://aura-asset-manager-production.up.railway.app/api/v1').replace(/^http:/, 'https:')

class UserSettingsService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/user-settings`
  }

  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  async getSettings() {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(this.baseUrl, { headers })

      if (response.status === 401) {
        throw new Error('Invalid authentication credentials')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      if (error.message === 'No authentication token found') {
        throw new Error('Please log in to view settings')
      }
      throw error
    }
  }

  async saveSettings(settings) {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(settings)
      })

      if (response.status === 401) {
        throw new Error('Invalid authentication credentials')
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save settings')
      }

      return response.json()
    } catch (error) {
      if (error.message === 'No authentication token found') {
        throw new Error('Please log in to save settings')
      }
      throw error
    }
  }

  async updateSettings(settings) {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      })

      if (response.status === 401) {
        throw new Error('Invalid authentication credentials')
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update settings')
      }

      return response.json()
    } catch (error) {
      if (error.message === 'No authentication token found') {
        throw new Error('Please log in to update settings')
      }
      throw error
    }
  }
}

export const userSettingsService = new UserSettingsService()
