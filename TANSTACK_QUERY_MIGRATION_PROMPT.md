# TanStack Query Migration Prompt for Aura Asset Manager

## 🎯 **Purpose & Goal**

**Mission**: Migrate the Aura Asset Manager frontend from individual page-level data fetching to a centralized TanStack Query caching system with intelligent invalidation, reducing database load by 70% and improving page navigation speed by 90%.

**Success Criteria**:
- ✅ All pages load instantly from cache after initial data fetch
- ✅ Cross-tab synchronization maintains data consistency
- ✅ Smart invalidation ensures fresh data after mutations
- ✅ Zero breaking changes to existing functionality
- ✅ Session-based persistence for financial data security

---

## 🏗️ **High-Level Architecture Strategy**

### **Current State Analysis**
- **Pattern**: Each page (`Assets.jsx`, `Transactions.jsx`, etc.) has individual `useEffect` + service calls
- **Services**: Clean service layer (`assetsService`, `transactionsService`, `insuranceService`, `annuityService`)
- **Problem**: Fresh API calls on every navigation, no caching, no cross-tab sync

### **Target State Architecture**
```
┌─ TanStack Query Provider ─┐
│  ┌─ Session Persistence ─┐ │
│  │  ┌─ Smart Cache ─────┐ │ │
│  │  │ Assets, Txns,     │ │ │
│  │  │ Insurance, etc.   │ │ │
│  │  └───────────────────┘ │ │
│  └─────────────────────────┘ │
└─────────────────────────────────┘
```

### **Data Relationship Mapping**
```
Assets ←→ Transactions (bidirectional invalidation)
Insurance (independent)
Annuities (independent)
Dashboard Summary (depends on all)
User Settings/Profile (independent)
```

---

## 📋 **Meso-Level Implementation Plan**

### **Phase 1: Foundation Setup (Day 1)**

#### **1.1 Package Installation**
```bash
cd frontend
# Core + Devtools
npm install @tanstack/react-query
npm install --save-dev @tanstack/react-query-devtools

# Persistence (sessionStorage/localStorage persister)
npm install @tanstack/query-persist-client-core @tanstack/query-sync-storage-persister

# Optional: IndexedDB persister for large datasets (>5MB cache, offline support)
npm install localforage @tanstack/query-persist-client-core @tanstack/query-persist-client-experimental
```

#### **1.2 App.jsx QueryClient Setup**
- Install QueryClient provider at root level
- Configure cache settings optimized for financial data
- Add persistence layer with sessionStorage (or IndexedDB for larger datasets)
- Include devtools for debugging (dev only)

#### **1.3 Query Keys Architecture**
```javascript
// Define in: frontend/src/lib/queryKeys.js
export const queryKeys = {
  assets: ['assets'],
  // For lists with params, prefer a factory
  transactions: (params) => ['transactions', params],
  insurance: ['insurance'],
  annuities: ['annuities'],
  dashboardSummary: ['dashboard-summary'],
  userSettings: ['user-settings'],
  profile: ['profile']
}
```

### **Phase 2: Service Integration (Day 1-2)**

#### **2.1 Create Query Hooks**
```javascript
// Create: frontend/src/hooks/useDataQueries.js
// Centralized query hooks for all data fetching
```

#### **2.2 Page Migration Priority**
1. **Dashboard.jsx** (lowest risk, highest visibility)
2. **Assets.jsx** (core functionality)
3. **Transactions.jsx** (most complex)
4. **Insurance.jsx** (independent)
5. **Annuities.jsx** (independent)
6. **UserSettings.jsx** (low risk)
7. **Profile.jsx** (low risk)

### **Phase 3: Mutation Integration (Day 2)**

#### **3.1 Smart Invalidation Patterns**
```javascript
// Asset mutations → invalidate: assets, transactions, dashboard-summary
// Transaction mutations → invalidate: transactions, assets, dashboard-summary
// Insurance mutations → invalidate: insurance, dashboard-summary
// Annuity mutations → invalidate: annuities, dashboard-summary
```

#### **3.1.1 v5 Invalidation Signature**
```javascript
// Use object form in v5
queryClient.invalidateQueries({ queryKey: queryKeys.assets })
```

#### **3.2 Optimistic Updates**
- Implement for create/update operations
- Rollback mechanism for failed mutations

### **Phase 4: Advanced Features (Day 3)**

#### **4.1 Cross-Tab Synchronization**
- BroadcastChannel API implementation
- Storage event listeners for cache sync

```javascript
// Simple cross-tab invalidation bus
const bc = new BroadcastChannel('aura-cache')
// Emit after successful mutations
bc.postMessage({ type: 'invalidate', keys: ['assets', 'transactions'] })
// Listen in other tabs
bc.onmessage = (e) => {
  if (e?.data?.type === 'invalidate') {
    e.data.keys.forEach((k) => {
      const key = queryKeys[k]
      if (key) queryClient.invalidateQueries({ queryKey: key })
    })
  }
}
```

#### **4.2 Background Refresh Strategy**
- Configure `staleTime` and `gcTime`
- Background refetch on window focus (optional)

---

## 🔧 **Low-Level Technical Implementation**

### **Critical File Modifications**

#### **A. App.jsx Changes**
```javascript
// BEFORE: Basic React Router setup
// AFTER: Add QueryClient provider + persistence

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// Configuration object for cache settings (v5: gcTime instead of cacheTime)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes; raise to rely on explicit invalidation
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1
    }
  }
})

// Session-scoped persistence (do not persist auth tokens)
persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({ storage: sessionStorage, throttleTime: 1000 }),
  maxAge: 60 * 60 * 1000 // 1 hour
})

// Optional: Clear cache on logout or user change
// auth.onLogout(() => { queryClient.clear(); sessionStorage.clear(); })
```

#### **1.2.1 IndexedDB Alternative for Large Datasets**
```javascript
// For applications with >5MB cache needs or offline requirements
import localforage from 'localforage'
import { experimental_createPersister } from '@tanstack/query-persist-client-experimental'

// Configure localforage for financial data
localforage.config({
  name: 'AuraAssetManager',
  storeName: 'queryCache',
  version: 1.0,
  description: 'TanStack Query cache for financial data'
})

// Use IndexedDB persister instead of sessionStorage
const indexedDBPersister = experimental_createPersister({
  storage: localforage,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours for IndexedDB
  buster: '', // Change to force cache invalidation
})

persistQueryClient({
  queryClient,
  persister: indexedDBPersister,
  maxAge: 24 * 60 * 60 * 1000
})

// When to use each persister:
// sessionStorage: < 5MB cache, session-only persistence, simple financial data
// IndexedDB: > 5MB cache, cross-session persistence, complex datasets, offline support
```

#### **1.3 Prefetch on Login (Initial Hydration)**
```javascript
// After auth success, prefetch core datasets once
await Promise.all([
  queryClient.prefetchQuery({ queryKey: queryKeys.assets, queryFn: ({ signal }) => assetsService.getAssets({ signal }) }),
  queryClient.prefetchQuery({ queryKey: queryKeys.transactions, queryFn: ({ signal }) => transactionsService.getTransactions({ signal }) }),
  queryClient.prefetchQuery({ queryKey: queryKeys.insurance, queryFn: ({ signal }) => insuranceService.getInsurance({ signal }) }),
  queryClient.prefetchQuery({ queryKey: queryKeys.annuities, queryFn: ({ signal }) => annuitiesService.getAnnuities({ signal }) }),
  queryClient.prefetchQuery({ queryKey: queryKeys.dashboardSummary, queryFn: ({ signal }) => dashboardService.getSummary({ signal }) }),
])
```

#### **B. Page Migration Pattern**
```javascript
// BEFORE (existing pattern):
const [assets, setAssets] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchAssets = async () => {
    try {
      const data = await assetsService.getAssets()
      setAssets(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  fetchAssets()
}, [])

// AFTER (TanStack Query pattern):
// Note: avoid name collision with useQuery's `error` field by aliasing the debug logger
import { error as logError, log } from '@/lib/debug'

const { 
  data: assets = [], 
  isLoading: loading,
  error: queryError,
  refetch
} = useQuery({
  queryKey: queryKeys.assets,
  enabled: !!session, // gate by auth session
  queryFn: async ({ signal }) => {
    log('Assets:query', 'Starting assets fetch via TanStack Query')
    const result = await assetsService.getAssets({ signal }) // pass abort signal to axios
    log('Assets:query', `Fetched ${result?.length || 0} assets successfully`)
    return result
  },
  onError: (err) => {
    logError('Assets:fetch', 'Failed to fetch assets:', err)
  }
})
```

#### **C. Mutation Pattern**
```javascript
// BEFORE (direct service call):
const handleCreateAsset = async (assetData) => {
  try {
    await assetsService.createAsset(assetData)
    fetchAssets() // Manual refetch
  } catch (err) {
    console.error('Error:', err)
  }
}

// AFTER (useMutation with optimistic update + smart invalidation)
import { error as logError, log } from '@/lib/debug'

const createAssetMutation = useMutation({
  mutationFn: (assetData) => assetsService.createAsset(assetData),
  onMutate: async (newAsset) => {
    // Cancel outgoing fetches for assets to avoid overwriting optimistic update
    await queryClient.cancelQueries({ queryKey: queryKeys.assets })
    // Snapshot previous
    const previousAssets = queryClient.getQueryData(queryKeys.assets)
    // Optimistically update
    queryClient.setQueryData(queryKeys.assets, (old = []) => [newAsset, ...old])
    return { previousAssets }
  },
  onError: (err, _vars, context) => {
    // Rollback on error
    if (context?.previousAssets) {
      queryClient.setQueryData(queryKeys.assets, context.previousAssets)
    }
    logError('Assets:create', 'Failed to create asset:', err)
  },
  onSuccess: () => {
    log('Assets:create', 'Asset created successfully, invalidating related caches')
  },
  onSettled: () => {
    // Ensure fresh data across related sections
    queryClient.invalidateQueries({ queryKey: queryKeys.assets })
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary })
  }
})
```

---

#### **D. Pagination and Filters (Transactions)**
```javascript
// Query keys encode parameters for correct caching
export const queryKeys = {
  transactions: (params) => ['transactions', params],
  // ... others as above
}

// Standard pagination parameters for transactions
interface TransactionParams {
  page?: number          // Current page (1-based)
  pageSize?: number      // Items per page (default: 20)
  filters?: {            // Filter criteria
    type?: string        // 'income' | 'expense' | 'transfer'
    category?: string    // Transaction category
    dateRange?: {        // Date range filter
      start: string      // ISO date string
      end: string        // ISO date string
    }
    amountRange?: {      // Amount filter
      min: number
      max: number
    }
    assetId?: string     // Filter by related asset
  }
  sort?: {               // Sorting options
    field: string        // 'date' | 'amount' | 'category'
    direction: 'asc' | 'desc'
  }
}

// Paginated query with smooth transitions
const { data, isLoading, isFetching } = useQuery({
  queryKey: queryKeys.transactions({ page, pageSize, filters, sort }),
  queryFn: ({ signal, queryKey }) => transactionsService.getTransactions({ ...queryKey[1], signal }),
  keepPreviousData: true,
  placeholderData: (prev) => prev, // keep previous while fetching next
})
```

#### **E. Abort/Cancel In‑Flight Requests**
```javascript
// Option A (non-breaking): add optional axios config param to services
// assetsService.getAssets(config) → forwards to axios
// Existing call sites remain valid; queries can pass { signal }

// Option B: add parallel methods that accept options
// assetsService.getAssetsWithOptions({ signal })

// In queryFn (preferred):
queryFn: ({ signal }) => assetsService.getAssets({ signal })
```

#### **F. Service Layer Enhancement (Recommended Implementation)**
```javascript
// Update service methods to accept optional axios config
// Example: frontend/src/services/assetsService.js

const getAssets = async (config = {}) => {
  try {
    const response = await apiClient.get('/api/v1/assets', config)
    return response.data
  } catch (error) {
    throw error
  }
}

const createAsset = async (assetData, config = {}) => {
  try {
    const response = await apiClient.post('/api/v1/assets', assetData, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Pattern for all services:
// - Add optional config parameter as last argument
// - Default to empty object for backward compatibility
// - Forward config directly to axios calls
// - Enables abort signals: service.getAssets({ signal })
```

## ⚠️ **Critical Dos and Don'ts**

### **✅ DOS**

1. **Preserve Existing Service Calls**
   - Keep all `assetsService.getAssets()` calls intact
   - Only change where they're called from (useQuery vs useEffect)
   - Allow adding an optional axios config param (e.g., `{ signal }`) to service methods for request cancellation

2. **Maintain Error Handling**
   - Keep existing try-catch patterns
   - Add query-specific error handling
   - Preserve user-facing error messages

3. **Debug Logging Integration**
   - Use existing `log()`, `warn()`, `error()` functions
   - Add query-specific debugging
   - Log cache hits/misses for performance monitoring

4. **Gradual Migration**
   - Migrate one page at a time
   - Test thoroughly before moving to next page
   - Keep SafeSection wrappers intact

5. **Import Path Consistency**
   - Maintain existing import patterns
   - Use proper case sensitivity (Loading vs loading)
   - Keep relative vs absolute import consistency

### **❌ DON'TS**

1. **Don't Break Service Layer**
   - Never modify existing service functions
   - Don't change API endpoint calls
   - Don't alter data transformation logic

2. **Don't Remove Loading States**
   - Keep existing `<Loading pageName="..." />` components
   - Don't remove SafeSection wrappers
   - Maintain loading UX patterns

3. **Don't Change Route Structure**
   - Keep existing router configuration
   - Don't modify page component exports
   - Don't alter navigation patterns

4. **Don't Skip Testing**
   - Always test build after each page migration
   - Verify all imports resolve correctly
   - Check for console errors

5. **Don't Mass Replace**
   - Never do global find/replace operations
   - Migrate pages individually
   - Test each change before proceeding

---

## 🚨 **Common Pitfalls from Previous Experience**

### **Import Path Errors**
- ❌ `import Loading from '@/components/ui/loading'` (wrong case)
- ✅ `import Loading from '@/components/ui/Loading'` (correct case)
- ❌ `import SafeSection from '@/components/ui/safe-section'` (wrong path)
- ✅ `import SafeSection from '@/components/util/SafeSection'` (correct path)

### **Service Integration Mistakes**
- ❌ Changing service function signatures
- ✅ Using services as-is in queryFn
- ❌ Breaking existing error handling
- ✅ Wrapping with query error handling

### **State Management Conflicts**
- ❌ Mixing useState with useQuery for same data
- ✅ Replace useState completely with useQuery
- ❌ Forgetting to remove useEffect dependencies
- ✅ Clean removal of manual data fetching

---

## 🛠️ **Micro-Level Debug Implementation**

### **Debug Logging Pattern**
```javascript
// Query Success Logging
import { error as logError, log } from '@/lib/debug'

const { data, isLoading, error: queryError } = useQuery({
  queryKey: queryKeys.assets,
  queryFn: async ({ signal }) => {
    log('Assets:query', 'Starting assets fetch via TanStack Query')
    const result = await assetsService.getAssets({ signal })
    log('Assets:query', `Fetched ${result?.length || 0} assets successfully`)
    return result
  },
  onSuccess: (data) => {
    log('Assets:query', 'Assets query completed successfully', {
      count: data?.length,
      cached: !isLoading,
      timestamp: new Date().toISOString()
    })
  },
  onError: (err) => {
    logError('Assets:query', 'Assets query failed:', err)
  }
})

// Mutation Debug Logging
const createMutation = useMutation({
  mutationFn: async (assetData) => {
    log('Assets:create', 'Starting asset creation', { assetData })
    return await assetsService.createAsset(assetData)
  },
  onSuccess: (result, variables) => {
    log('Assets:create', 'Asset creation successful', { result, variables })
    log('Assets:cache', 'Invalidating related queries: assets, transactions, dashboard')
  },
  onError: (error, variables) => {
    error('Assets:create', 'Asset creation failed', { error, variables })
  }
})
```

### **Cache Performance Monitoring**
```javascript
// Prefer lightweight, dev-only checks
if (process.env.NODE_ENV !== 'production') {
  const assetsCached = !!queryClient.getQueryData(queryKeys.assets)
  const transactionsCached = !!queryClient.getQueryData(queryKeys.transactions)
  log('Cache:status', 'Cache snapshot', { assetsCached, transactionsCached })
}
```

---

## 🔄 **Easy Rollback Strategy**

### **Git Branch Protection**
```bash
# Before starting migration
git checkout -b feature/tanstack-query-migration
git checkout -b backup/pre-migration-safe-state

# Create checkpoint after each page
git add . && git commit -m "checkpoint: Assets.jsx migrated successfully"
```

### **Feature Flag Pattern**
```javascript
// Add to each page during migration
const USE_TANSTACK_QUERY = process.env.REACT_APP_USE_TANSTACK_QUERY === 'true'

if (USE_TANSTACK_QUERY) {
  // New TanStack Query implementation
  const { data: assets, isLoading } = useQuery(...)
} else {
  // Original implementation (fallback)
  const [assets, setAssets] = useState([])
  // ... existing code
}
```

### **Quick Rollback Commands**
```bash
# Rollback specific file
git checkout HEAD~1 -- frontend/src/pages/Assets.jsx

# Rollback entire migration
git checkout backup/pre-migration-safe-state

# Emergency production rollback
git revert HEAD --no-edit && git push origin main
```

---

## ✅ **Post-Implementation Verification Checklist**

### **Functional Verification**

#### **Page Load Testing**
- [ ] Dashboard loads without errors
- [ ] Assets page displays data correctly
- [ ] Transactions page shows all transaction data
- [ ] Insurance page functions normally
- [ ] Annuities page displays portfolio data
- [ ] UserSettings page loads preferences
- [ ] Profile page shows user information

#### **Navigation Testing**
- [ ] Page-to-page navigation is instant (cached)
- [ ] Browser back/forward buttons work correctly
- [ ] Direct URL access works for all routes
- [ ] No loading spinners on subsequent visits to same page

#### **CRUD Operations Testing**
- [ ] Create new asset → Assets page updates + Dashboard reflects change
- [ ] Edit transaction → Transactions + Assets pages update
- [ ] Delete insurance → Insurance page updates + Dashboard reflects change
- [ ] Update annuity → Annuities page updates + Dashboard reflects change

#### **Cross-Tab Synchronization**
- [ ] Open same page in multiple tabs
- [ ] Create/edit data in one tab
- [ ] Verify other tabs automatically sync the changes
- [ ] Test with different page combinations

### **Technical Verification**

#### **Build & Import Testing**
```bash
# Must pass without errors
cd frontend && npm run build

# Check for import issues
npm run dev
# Open browser console, verify no import errors
```

#### **Performance Verification**
- [ ] Network tab shows reduced API calls on navigation
- [ ] Cache hit ratio > 80% after initial load
- [ ] Page transition time < 100ms
- [ ] Memory usage remains stable during extended use

#### **Error Handling Verification**
- [ ] Network failures show appropriate error messages
- [ ] Failed mutations display user-friendly errors
- [ ] Cache errors don't break page functionality
- [ ] Service errors are properly logged with debug info

#### **Security Verification**
- [ ] sessionStorage contains only non-sensitive cached data
- [ ] No authentication tokens in client-side storage
- [ ] Cache data clears on session end
- [ ] XSS prevention measures intact

#### **Logout/Identity Switch Handling**
- [ ] Clear React Query cache and storage on logout or user change
  - e.g., `queryClient.clear(); sessionStorage.clear();`

#### **Logout/Identity Switch Handling**
- [ ] Clear React Query cache and storage on logout or user change
  - e.g., `queryClient.clear(); sessionStorage.clear();`

### **Debug Information Verification**
- [ ] Query success/failure logs appear in console
- [ ] Cache invalidation events are logged
- [ ] Performance metrics are trackable
- [ ] Error contexts provide sufficient debugging info

### **Rollback Testing**
- [ ] Feature flag toggle works correctly
- [ ] Git rollback commands restore functionality
- [ ] Emergency rollback procedure documented and tested
- [ ] Backup branch contains working pre-migration state

---

## 🎯 **Implementation Decision Matrix**

### **Persister Selection Guide**
```
Dataset Size     | Duration       | Offline Support | Recommended Persister
-----------------|----------------|-----------------|---------------------
< 5MB            | Session only   | Not needed      | sessionStorage
< 5MB            | Cross-session  | Not needed      | localStorage  
> 5MB            | Session only   | Not needed      | sessionStorage
> 5MB            | Cross-session  | Not needed      | IndexedDB
Any size         | Any duration   | Required        | IndexedDB + localforage
```

### **Service Layer Update Priority**
```
Priority | Service            | Complexity | Impact
---------|-------------------|------------|--------
High     | assetsService     | Low        | Core functionality
High     | transactionsService| Medium    | Pagination support
Medium   | dashboardService  | Low        | Summary data
Medium   | insuranceService  | Low        | Independent module
Low      | annuityService    | Low        | Independent module
Low      | userService       | Low        | Profile/settings
```

### **Migration Risk Assessment**
```
Page            | Risk Level | Complexity | Dependencies
----------------|------------|------------|-------------
Dashboard.jsx   | Low        | Medium     | All services
Assets.jsx      | Medium     | High       | Transactions
Transactions.jsx| High       | Very High  | Assets, pagination
Insurance.jsx   | Low        | Low        | Independent
Annuities.jsx   | Low        | Medium     | Independent
UserSettings.jsx| Very Low   | Low        | Independent
Profile.jsx     | Very Low   | Low        | Independent
```

---

## 🎯 **Success Metrics**

### **Quantitative Targets**
- **Page Load Speed**: < 100ms for cached pages (vs 2-3s current)
- **API Call Reduction**: 70% fewer requests per user session
- **Cache Hit Ratio**: > 80% after initial data load
- **Error Rate**: < 1% increase from baseline

### **Qualitative Targets**
- **User Experience**: Instant page navigation feel
- **Developer Experience**: Simplified data fetching patterns
- **Maintainability**: Centralized cache management
- **Scalability**: Reduced backend load as user base grows

---

## 📝 **Final Implementation Notes**

### **Critical Success Factors**
1. **Preserve existing functionality**: Zero breaking changes
2. **Maintain error handling**: All existing error patterns intact
3. **Keep debug logging**: Enhanced with query-specific info
4. **Test incrementally**: One page at a time
5. **Document changes**: Clear commit messages for each step

### **Emergency Contacts**
- Rollback immediately if any production page fails to load
- Revert specific commits if functionality breaks
- Use feature flags for gradual rollout if needed

### **Post-Migration Optimization**
- Monitor cache performance metrics
- Tune `staleTime` and `gcTime` based on usage
- Implement advanced features (prefetching, background sync)
- Consider server-side optimizations (ETags, compression)

### **Server Support (Optional, Recommended)**
- Add ETag/Last-Modified for conditional GETs
- Ensure pagination and minimal field selection on list endpoints
- Enable gzip/br compression for large JSON payloads

---

**🚀 Ready for implementation! This prompt provides comprehensive guidance for a successful, risk-free TanStack Query migration.**
