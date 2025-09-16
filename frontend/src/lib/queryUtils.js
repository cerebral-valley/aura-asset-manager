// Query utilities for TanStack Query with cross-tab synchronization
import { useEffect } from 'react'
import { queryKeys, invalidationHelpers } from './queryKeys'

// BroadcastChannel for cross-tab synchronization
const BROADCAST_CHANNEL_NAME = 'aura-query-sync'
let broadcastChannel = null

// Initialize BroadcastChannel if supported
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
  } catch (error) {
    console.warn('BroadcastChannel initialization failed:', error)
  }
}

// Message types for cross-tab communication
export const SYNC_MESSAGES = {
  INVALIDATE_ASSETS: 'invalidate_assets',
  INVALIDATE_TRANSACTIONS: 'invalidate_transactions',
  INVALIDATE_INSURANCE: 'invalidate_insurance',
  INVALIDATE_ANNUITIES: 'invalidate_annuities',
  INVALIDATE_DASHBOARD: 'invalidate_dashboard',
  ASSET_CREATED: 'asset_created',
  ASSET_UPDATED: 'asset_updated',
  ASSET_DELETED: 'asset_deleted',
  TRANSACTION_CREATED: 'transaction_created',
  TRANSACTION_UPDATED: 'transaction_updated',
  TRANSACTION_DELETED: 'transaction_deleted',
  INSURANCE_CREATED: 'insurance_created',
  INSURANCE_UPDATED: 'insurance_updated',
  INSURANCE_DELETED: 'insurance_deleted',
  ANNUITY_CREATED: 'annuity_created',
  ANNUITY_UPDATED: 'annuity_updated',
  ANNUITY_DELETED: 'annuity_deleted',
}

// BroadcastChannel utilities
export const broadcastUtils = {
  // Send message to other tabs
  broadcast: (type, data = {}) => {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type,
          data,
          timestamp: Date.now(),
          source: 'aura-asset-manager',
        })
      } catch (error) {
        console.warn('Failed to broadcast message:', error)
      }
    }
  },

  // Setup listener for incoming messages
  setupListener: (queryClient) => {
    if (!broadcastChannel || !queryClient) return null

    const handleMessage = (event) => {
      const { type, data } = event.data

      // Prevent handling our own messages
      if (event.data.source === 'aura-asset-manager') {
        switch (type) {
          case SYNC_MESSAGES.INVALIDATE_ASSETS:
            invalidationHelpers.invalidateAssets(queryClient)
            break
          
          case SYNC_MESSAGES.INVALIDATE_TRANSACTIONS:
            invalidationHelpers.invalidateTransactions(queryClient)
            break

          case SYNC_MESSAGES.INVALIDATE_INSURANCE:
            invalidationHelpers.invalidateInsurance(queryClient)
            break

          case SYNC_MESSAGES.INVALIDATE_ANNUITIES:
            invalidationHelpers.invalidateAnnuities(queryClient)
            break

          case SYNC_MESSAGES.INVALIDATE_DASHBOARD:
            invalidationHelpers.invalidateDashboard(queryClient)
            break

          // Smart invalidation for asset operations
          case SYNC_MESSAGES.ASSET_CREATED:
          case SYNC_MESSAGES.ASSET_UPDATED:
          case SYNC_MESSAGES.ASSET_DELETED:
            invalidationHelpers.invalidateAssetAndTransactions(queryClient, data.assetId)
            invalidationHelpers.invalidateDashboard(queryClient)
            break

          // Smart invalidation for transaction operations
          case SYNC_MESSAGES.TRANSACTION_CREATED:
          case SYNC_MESSAGES.TRANSACTION_UPDATED:
          case SYNC_MESSAGES.TRANSACTION_DELETED:
            invalidationHelpers.invalidateTransactionAndAssets(queryClient)
            invalidationHelpers.invalidateDashboard(queryClient)
            break

          // Insurance operations (independent)
          case SYNC_MESSAGES.INSURANCE_CREATED:
          case SYNC_MESSAGES.INSURANCE_UPDATED:
          case SYNC_MESSAGES.INSURANCE_DELETED:
            invalidationHelpers.invalidateInsurance(queryClient)
            invalidationHelpers.invalidateDashboard(queryClient)
            break

          // Annuity operations (independent)
          case SYNC_MESSAGES.ANNUITY_CREATED:
          case SYNC_MESSAGES.ANNUITY_UPDATED:
          case SYNC_MESSAGES.ANNUITY_DELETED:
            invalidationHelpers.invalidateAnnuities(queryClient)
            invalidationHelpers.invalidateDashboard(queryClient)
            break

          default:
            console.log('Unknown sync message type:', type)
        }
      }
    }

    broadcastChannel.addEventListener('message', handleMessage)
    
    // Return cleanup function
    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleMessage)
      }
    }
  },

  // Close the broadcast channel
  close: () => {
    if (broadcastChannel) {
      try {
        broadcastChannel.close()
        broadcastChannel = null
      } catch (error) {
        console.warn('Failed to close BroadcastChannel:', error)
      }
    }
  },
}

// Smart invalidation helpers for mutations
export const mutationHelpers = {
  // Asset mutation helpers
  onAssetSuccess: (queryClient, type, data = {}) => {
    // Invalidate locally
    invalidationHelpers.invalidateAssetAndTransactions(queryClient, data.assetId)
    invalidationHelpers.invalidateDashboard(queryClient)
    
    // Broadcast to other tabs
    const messageType = {
      create: SYNC_MESSAGES.ASSET_CREATED,
      update: SYNC_MESSAGES.ASSET_UPDATED,
      delete: SYNC_MESSAGES.ASSET_DELETED,
    }[type]
    
    if (messageType) {
      broadcastUtils.broadcast(messageType, data)
    }
  },

  // Transaction mutation helpers  
  onTransactionSuccess: (queryClient, type, data = {}) => {
    // Invalidate locally
    invalidationHelpers.invalidateTransactionAndAssets(queryClient)
    invalidationHelpers.invalidateDashboard(queryClient)
    
    // Broadcast to other tabs
    const messageType = {
      create: SYNC_MESSAGES.TRANSACTION_CREATED,
      update: SYNC_MESSAGES.TRANSACTION_UPDATED,
      delete: SYNC_MESSAGES.TRANSACTION_DELETED,
    }[type]
    
    if (messageType) {
      broadcastUtils.broadcast(messageType, data)
    }
  },

  // Insurance mutation helpers
  onInsuranceSuccess: (queryClient, type, data = {}) => {
    // Invalidate locally
    invalidationHelpers.invalidateInsurance(queryClient)
    invalidationHelpers.invalidateDashboard(queryClient)
    
    // Broadcast to other tabs
    const messageType = {
      create: SYNC_MESSAGES.INSURANCE_CREATED,
      update: SYNC_MESSAGES.INSURANCE_UPDATED,
      delete: SYNC_MESSAGES.INSURANCE_DELETED,
    }[type]
    
    if (messageType) {
      broadcastUtils.broadcast(messageType, data)
    }
  },

  // Annuity mutation helpers
  onAnnuitySuccess: (queryClient, type, data = {}) => {
    // Invalidate locally
    invalidationHelpers.invalidateAnnuities(queryClient)
    invalidationHelpers.invalidateDashboard(queryClient)
    
    // Broadcast to other tabs
    const messageType = {
      create: SYNC_MESSAGES.ANNUITY_CREATED,
      update: SYNC_MESSAGES.ANNUITY_UPDATED,
      delete: SYNC_MESSAGES.ANNUITY_DELETED,
    }[type]
    
    if (messageType) {
      broadcastUtils.broadcast(messageType, data)
    }
  },
}

// Query error handling utilities
export const queryErrorHandlers = {
  // Standard error handler for queries
  onQueryError: (error, query) => {
    console.error('Query failed:', {
      queryKey: query.queryKey,
      error: error.message,
      status: error.response?.status,
    })

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle auth errors - could trigger logout
      console.warn('Authentication error in query:', query.queryKey)
    } else if (error.response?.status === 403) {
      // Handle permission errors
      console.warn('Permission error in query:', query.queryKey)
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error in query:', query.queryKey)
    }
  },

  // Standard error handler for mutations
  onMutationError: (error, variables, context, mutation) => {
    console.error('Mutation failed:', {
      mutationKey: mutation.options.mutationKey,
      error: error.message,
      status: error.response?.status,
      variables,
    })

    // Handle specific error cases
    if (error.response?.status === 422) {
      // Validation errors
      console.warn('Validation error in mutation:', error.response.data)
    }
  },
}

// Query retry logic
export const retryLogic = {
  // Standard retry function for queries
  queryRetry: (failureCount, error) => {
    // Don't retry on client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false
    }
    
    // Retry up to 3 times for server errors (5xx) or network errors
    return failureCount < 3
  },

  // Standard retry function for mutations
  mutationRetry: (failureCount, error) => {
    // Don't retry on client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false
    }
    
    // Retry once for server errors (5xx) or network errors
    return failureCount < 1
  },
}

// Optimistic update helpers
export const optimisticHelpers = {
  // Optimistically add an item to a list
  addItemOptimistically: (queryClient, queryKey, newItem) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return [newItem]
      return Array.isArray(oldData) ? [...oldData, newItem] : oldData
    })
  },

  // Optimistically update an item in a list
  updateItemOptimistically: (queryClient, queryKey, updatedItem, idField = 'id') => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData || !Array.isArray(oldData)) return oldData
      return oldData.map(item => 
        item[idField] === updatedItem[idField] ? { ...item, ...updatedItem } : item
      )
    })
  },

  // Optimistically remove an item from a list
  removeItemOptimistically: (queryClient, queryKey, itemId, idField = 'id') => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData || !Array.isArray(oldData)) return oldData
      return oldData.filter(item => item[idField] !== itemId)
    })
  },
}

// Hook to setup cross-tab sync on app initialization
export const useQuerySync = (queryClient) => {
  useEffect(() => {
    if (!queryClient) return

    // Setup broadcast listener
    const cleanup = broadcastUtils.setupListener(queryClient)

    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup()
    }
  }, [queryClient])
}

export default {
  queryKeys,
  invalidationHelpers,
  broadcastUtils,
  mutationHelpers,
  queryErrorHandlers,
  retryLogic,
  optimisticHelpers,
  useQuerySync,
}