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
npm install @tanstack/react-query @tanstack/react-query-persist-client-core
npm install --save-dev @tanstack/react-query-devtools
```

#### **1.2 App.jsx QueryClient Setup**
- Install QueryClient provider at root level
- Configure cache settings optimized for financial data
- Add persistence layer with sessionStorage
- Include devtools for debugging

#### **1.3 Query Keys Architecture**
```javascript
// Define in: frontend/src/lib/queryKeys.js
export const queryKeys = {
  assets: ['assets'],
  transactions: ['transactions'],
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

#### **3.2 Optimistic Updates**
- Implement for create/update operations
- Rollback mechanism for failed mutations

### **Phase 4: Advanced Features (Day 3)**

#### **4.1 Cross-Tab Synchronization**
- BroadcastChannel API implementation
- Storage event listeners for cache sync

#### **4.2 Background Refresh Strategy**
- Configure stale time and cache time
- Background refetch on window focus (optional)

---

## 🔧 **Low-Level Technical Implementation**

### **Critical File Modifications**

#### **A. App.jsx Changes**
```javascript
// BEFORE: Basic React Router setup
// AFTER: Add QueryClient provider wrapper

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { persistQueryClient } from '@tanstack/react-query-persist-client-core'

// Configuration object for cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 1 // Single retry for financial data
    }
  }
})
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
const { 
  data: assets = [], 
  isLoading: loading,
  error,
  refetch
} = useQuery({
  queryKey: queryKeys.assets,
  queryFn: assetsService.getAssets,
  onError: (error) => {
    error('Assets:fetch', 'Failed to fetch assets:', error)
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
  } catch (error) {
    console.error('Error:', error)
  }
}

// AFTER (useMutation with smart invalidation):
const createAssetMutation = useMutation({
  mutationFn: assetsService.createAsset,
  onSuccess: () => {
    queryClient.invalidateQueries(queryKeys.assets)
    queryClient.invalidateQueries(queryKeys.transactions) // Related data
    queryClient.invalidateQueries(queryKeys.dashboardSummary)
    log('Assets:create', 'Asset created successfully, cache invalidated')
  },
  onError: (error) => {
    error('Assets:create', 'Failed to create asset:', error)
  }
})
```

---

## ⚠️ **Critical Dos and Don'ts**

### **✅ DOS**

1. **Preserve Existing Service Calls**
   - Keep all `assetsService.getAssets()` calls intact
   - Only change where they're called from (useQuery vs useEffect)

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
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.assets,
  queryFn: async () => {
    log('Assets:query', 'Starting assets fetch via TanStack Query')
    const result = await assetsService.getAssets()
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
  onError: (error) => {
    error('Assets:query', 'Assets query failed:', error)
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
// Add to useEffect in each migrated page
useEffect(() => {
  const cacheData = queryClient.getQueryCache().getAll()
  log('Cache:status', 'Current cache state', {
    totalQueries: cacheData.length,
    assetsCached: !!queryClient.getQueryData(queryKeys.assets),
    transactionsCached: !!queryClient.getQueryData(queryKeys.transactions),
    cacheSize: JSON.stringify(cacheData).length
  })
}, [])
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
- Tune stale time and cache time based on usage
- Implement advanced features (prefetching, background sync)
- Consider server-side optimizations (ETags, compression)

---

**🚀 Ready for implementation! This prompt provides comprehensive guidance for a successful, risk-free TanStack Query migration.**