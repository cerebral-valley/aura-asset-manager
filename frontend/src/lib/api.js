import axios from 'axios'
import { supabase } from './supabase'

// Ensure HTTPS is always used
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://aura-asset-manager-production.up.railway.app/api/v1').replace(/^http:/, 'https:')

// Log the API URL being used for debugging
console.log('API Base URL:', API_BASE_URL)
console.log('Environment check - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('All environment variables:', import.meta.env)

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    // Ensure the URL is always HTTPS
    if (config.baseURL.startsWith('http:')) {
      config.baseURL = config.baseURL.replace('http:', 'https:')
      console.log('API Request - Fixed baseURL to use HTTPS:', config.baseURL)
    }
    
    const fullURL = config.baseURL + config.url
    console.log('API Request START - Full URL:', fullURL)
    console.log('API Request - Base URL:', config.baseURL)
    console.log('API Request - Endpoint:', config.url)
    console.log('API Request - Method:', config.method)
    
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('API Request - Session exists:', !!session)
    console.log('API Request - Access token exists:', !!session?.access_token)
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
      console.log('API Request - Added auth header, token length:', session.access_token.length)
      console.log('API Request - Token preview:', session.access_token.substring(0, 20) + '...')
    } else {
      console.log('API Request - No access token found')
    }
    
    console.log('API Request - Final headers:', config.headers)
  } catch (error) {
    console.error('API Request - Error getting auth session:', error)
  }
  
  return config
})

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => {
    console.log('API Response - SUCCESS:', response.status, 'URL:', response.config.url)
    console.log('API Response - Data:', response.data)
    return response
  }, 
  error => {
    // Log detailed error information
    console.error('API Response - ERROR for URL:', error.config?.url)
    console.error('API Response - Full error object:', error)
    
    if (error.response) {
      console.error('API Response - Server responded with error:', error.response.status)
      console.error('API Response - Error data:', error.response.data)
      console.error('API Response - Error headers:', error.response.headers)
    } else if (error.request) {
      console.error('API Response - No response received')
      console.error('API Response - Request details:', error.request)
      console.error('API Response - This usually means network/CORS issues')
    } else {
      console.error('API Response - Error setting up request:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

