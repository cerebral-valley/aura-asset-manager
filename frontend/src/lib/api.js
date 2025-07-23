import axios from 'axios'
import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aura-asset-manager-production.up.railway.app/api/v1'

// Log the API URL being used for debugging
console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('API Request - Session data:', session)
    console.log('API Request - URL:', config.url)
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
      console.log('API Request - Added auth header, token length:', session.access_token.length)
    } else {
      console.log('API Request - No access token found')
    }
  } catch (error) {
    console.error('Error getting auth session:', error)
  }
  
  return config
})

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => {
    console.log('API Response - Success:', response.status, response.config.url)
    return response
  }, 
  error => {
    // Log detailed error information
    console.log('API Response - Error occurred for URL:', error.config?.url)
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error setting up request:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient

