/**
 * Profile API Service
 */

import apiClient from '@/lib/api'

class ProfileService {
  constructor() {
    this.baseUrl = '/profile'
  }

  async getProfile() {
    try {
      const response = await apiClient.get(this.baseUrl)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to view profile')
      }
      throw new Error(error.response?.data?.detail || 'Failed to load profile')
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(this.baseUrl, profileData)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to update profile')
      }
      throw new Error(error.response?.data?.detail || 'Failed to update profile')
    }
  }

  async getProfileOptions() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/options`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to load profile options')
    }
  }

  async getCountries() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/countries`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to load countries')
    }
  }
}

export const profileService = new ProfileService()
