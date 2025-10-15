// Query keys for TanStack Query v5
// Provides standardized, hierarchical keys for caching and invalidation

export const queryKeys = {
  // Base keys for top-level invalidation
  all: ['aura'],
  
  // Asset-related queries
  assets: {
    baseKey: ['aura', 'assets'],
    all: () => [...queryKeys.assets.baseKey],
    list: (filters) => {
      if (!filters || Object.keys(filters).length === 0) {
        return [...queryKeys.assets.baseKey, 'list']
      }
      return [...queryKeys.assets.baseKey, 'list', normalizeFilters(filters)]
    },
    detail: (id) => [...queryKeys.assets.baseKey, 'detail', id],
  },

  // Transaction-related queries
  transactions: {
    baseKey: ['aura', 'transactions'],
    all: () => [...queryKeys.transactions.baseKey],
    list: (filters) => {
      if (!filters || Object.keys(filters).length === 0) {
        return [...queryKeys.transactions.baseKey, 'list']
      }
      return [...queryKeys.transactions.baseKey, 'list', normalizeFilters(filters)]
    },
    detail: (id) => [...queryKeys.transactions.baseKey, 'detail', id],
    byAsset: (assetId) => [...queryKeys.transactions.baseKey, 'by-asset', assetId],
  },

  // Insurance-related queries
  insurance: {
    baseKey: ['aura', 'insurance'],
    all: () => [...queryKeys.insurance.baseKey],
    list: (filters) => {
      if (!filters || Object.keys(filters).length === 0) {
        return [...queryKeys.insurance.baseKey, 'list']
      }
      return [...queryKeys.insurance.baseKey, 'list', normalizeFilters(filters)]
    },
    detail: (id) => [...queryKeys.insurance.baseKey, 'detail', id],
  },

  // Dashboard and aggregated queries
  dashboard: {
    baseKey: ['aura', 'dashboard'],
    summary: () => [...queryKeys.dashboard.baseKey, 'summary'],
    recentActivity: () => [...queryKeys.dashboard.baseKey, 'recent-activity'],
  },

  // User-related queries
  user: {
    baseKey: ['aura', 'user'],
    profile: () => [...queryKeys.user.baseKey, 'profile'],
    settings: () => [...queryKeys.user.baseKey, 'settings'],
  },

  // Goals-related queries
  goals: {
    baseKey: ['aura', 'goals'],
    all: () => [...queryKeys.goals.baseKey],
    list: (filters) => {
      if (!filters || Object.keys(filters).length === 0) {
        return [...queryKeys.goals.baseKey, 'list']
      }
      return [...queryKeys.goals.baseKey, 'list', normalizeFilters(filters)]
    },
    detail: (id) => [...queryKeys.goals.baseKey, 'detail', id],
    byType: (goalType) => [...queryKeys.goals.baseKey, 'by-type', goalType],
    completed: () => [...queryKeys.goals.baseKey, 'completed'],
  },

  // Tools-related queries
  tools: {
    baseKey: ['aura', 'tools'],
    assetHierarchy: (config) => {
      if (!config || Object.keys(config).length === 0) {
        return [...queryKeys.tools.baseKey, 'asset-hierarchy']
      }
      return [...queryKeys.tools.baseKey, 'asset-hierarchy', normalizeFilters(config)]
    },
  },
}

// Utility function to normalize filter objects for consistent caching
function normalizeFilters(filters) {
  if (!filters || typeof filters !== 'object') {
    return {}
  }

  // Sort keys to ensure consistent order
  const sortedKeys = Object.keys(filters).sort()
  const normalized = {}

  for (const key of sortedKeys) {
    const value = filters[key]
    
    // Skip undefined/null values
    if (value == null) continue
    
    // Normalize arrays and objects
    if (Array.isArray(value)) {
      normalized[key] = [...value].sort()
    } else if (typeof value === 'object') {
      normalized[key] = normalizeFilters(value)
    } else {
      normalized[key] = value
    }
  }

  return normalized
}

// Helper functions for common invalidation patterns
export const invalidationHelpers = {
  // Invalidate all asset-related data (use when assets change)
  invalidateAssets: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.baseKey })
  },

  // Invalidate all transaction-related data (use when transactions change)
  invalidateTransactions: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.baseKey })
  },

  // Smart invalidation: when asset changes, also invalidate related transactions
  invalidateAssetAndTransactions: (queryClient, assetId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.baseKey })
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.baseKey })
    if (assetId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.byAsset(assetId) })
    }
  },

  // When transaction changes, also invalidate related asset
  invalidateTransactionAndAssets: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.baseKey })
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.baseKey })
  },

  // Invalidate insurance data (independent of assets/transactions)
  invalidateInsurance: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.insurance.baseKey })
  },

  // Invalidate goals data (use when goals change)
  invalidateGoals: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.goals.baseKey })
  },

  // Invalidate goals and assets (use when goal allocations change)
  invalidateGoalsAndAssets: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.goals.baseKey })
    queryClient.invalidateQueries({ queryKey: queryKeys.assets.baseKey })
  },

  // Invalidate dashboard summaries (use when underlying data changes)
  invalidateDashboard: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.baseKey })
  },

  // Full app invalidation (use sparingly, for major data changes)
  invalidateAll: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.all })
  },
}

export default queryKeys