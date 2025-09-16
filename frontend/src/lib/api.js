import axios from 'axios'
import { supabase } from './supabase'

// Ensure HTTPS is always used
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://aura-asset-manager-production.up.railway.app/api/v1').replace(/^http:/, 'https:')

// Cache access token in memory for performance
let cachedAccessToken = null
let tokenCacheTime = 0
const TOKEN_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Initialize token cache from auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('Auth state change:', event)
  }
  
  if (session?.access_token) {
    cachedAccessToken = session.access_token
    tokenCacheTime = Date.now()
  } else {
    cachedAccessToken = null
    tokenCacheTime = 0
  }
})

// Helper function to get cached or fresh token
const getAccessToken = async () => {
  // Return cached token if it's fresh (within 5 minutes)
  if (cachedAccessToken && (Date.now() - tokenCacheTime < TOKEN_CACHE_DURATION)) {
    return cachedAccessToken
  }
  
  // Fetch fresh token if cache is stale
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      cachedAccessToken = session.access_token
      tokenCacheTime = Date.now()
      return cachedAccessToken
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error getting fresh auth session:', error)
    }
  }
  
  return null
}

// Log the API URL being used for debugging (DEV only)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
}

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
    }
    
    // Get cached or fresh access token
    const accessToken = await getAccessToken()
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}${accessToken ? ' (authenticated)' : ' (no auth)'}`)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('API Request - Error setting up auth:', error)
    }
  }
  
  return config
})

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    }
    return response
  }, 
  error => {
    // Always log errors, even in production, but keep them concise
    console.error(`API Error: ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase() || ''} ${error.config?.url || ''}`)
    
    if (import.meta.env.DEV) {
      if (error.response) {
        console.error('API Response - Server error data:', error.response.data)
      } else if (error.request) {
        console.error('API Response - No response received (network/CORS issue)')
      } else {
        console.error('API Response - Request setup error:', error.message)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

