/**
 * User Settings API Service
 */

// Get API base URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://aura-asset-manager-production.up.railway.app/api/v1').replace(/^http:/, 'https:')

class UserSettingsService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/user-settings`
  }

  async getSettings() {
    const token = localStorage.getItem('token')
    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async saveSettings(settings) {
    const token = localStorage.getItem('token')
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to save settings')
    }

    return response.json()
  }

  async updateSettings(settings) {
    const token = localStorage.getItem('token')
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update settings')
    }

    return response.json()
  }
}

export const userSettingsService = new UserSettingsService()
