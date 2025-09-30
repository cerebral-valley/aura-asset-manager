# Error Flow Diagram: Page Loading Issue

## Visual Representation of the Error Chain

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Startup                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  App.jsx (line 167)                                         │
│  useQuerySync(queryClient)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  lib/queryUtils.js (lines 319-330)                         │
│  export const useQuerySync = (queryClient) => {             │
│    useEffect(() => {                                        │
│      const cleanup = broadcastUtils.setupListener(...)     │
│    }, [queryClient])                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  lib/queryUtils.js (lines 58-133)                          │
│  broadcastUtils.setupListener(queryClient)                 │
│                                                             │
│  Sets up message handler with switch statement:            │
│    case SYNC_MESSAGES.INVALIDATE_ANNUITIES:                │
│    case SYNC_MESSAGES.ANNUITY_CREATED:                     │
│    case SYNC_MESSAGES.ANNUITY_UPDATED:                     │
│    case SYNC_MESSAGES.ANNUITY_DELETED:                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CRITICAL ERROR (line 80, 115)                              │
│  invalidationHelpers.invalidateAnnuities(queryClient)       │
│                                                             │
│  ❌ TypeError: invalidateAnnuities is not a function       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  lib/queryKeys.js                                           │
│  export const invalidationHelpers = {                       │
│    ✅ invalidateAssets: ...,                                │
│    ✅ invalidateTransactions: ...,                          │
│    ✅ invalidateInsurance: ...,                             │
│    ✅ invalidateGoals: ...,                                 │
│    ✅ invalidateDashboard: ...,                             │
│    ❌ invalidateAnnuities: MISSING!                         │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           TanStack Query System Breaks                      │
│                                                             │
│  Query initialization fails                                 │
│  Data fetching breaks                                       │
│  Pages dependent on queries fail to load                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Page Impact Matrix

```
┌──────────────────┬──────────────────┬─────────────┬──────────────────┐
│ Page Name        │ Route            │ Uses Query? │ Loading Status   │
├──────────────────┼──────────────────┼─────────────┼──────────────────┤
│ Dashboard        │ /                │ ✅ Yes      │ ❌ BROKEN        │
│ Assets           │ /portfolio       │ ✅ Yes      │ ❌ BROKEN        │
│ Goals            │ /goals           │ ✅ Yes      │ ❌ BROKEN        │
│ Transactions     │ /transactions    │ ✅ Yes      │ ❌ BROKEN        │
│ Analytics        │ /analytics       │ ⚠️  useEffect│ ❌ BROKEN        │
├──────────────────┼──────────────────┼─────────────┼──────────────────┤
│ Insurance        │ /insurance       │ ✅ Yes      │ ✅ WORKS*        │
│ Profile          │ /profile         │ ❌ No       │ ✅ WORKS         │
│ User Guide       │ /guide           │ ❌ No       │ ✅ WORKS         │
│ Settings         │ /settings        │ ❌ No       │ ✅ WORKS         │
└──────────────────┴──────────────────┴─────────────┴──────────────────┘

* Insurance works intermittently - depends on timing of error
```

---

## Code Location Map

```
frontend/src/
│
├── App.jsx ─────────────────────────┐
│   └── Line 167: useQuerySync()     │ Initiates sync
│                                     │
├── lib/                              │
│   ├── queryUtils.js ────────────────┤
│   │   ├── Line 23: INVALIDATE_ANNUITIES message type
│   │   ├── Line 80: Case handler ❌  │ References missing function
│   │   ├── Line 115: Case handler ❌ │ References missing function
│   │   ├── Line 207: onAnnuitySuccess ❌ References missing function
│   │   └── Lines 319-330: useQuerySync hook
│   │                                 │
│   └── queryKeys.js ─────────────────┤
│       ├── Lines 4-71: queryKeys object (✅ has assets, transactions, insurance, goals)
│       ├── Lines 103-154: invalidationHelpers object
│       │                                 │
│       └── ❌ MISSING: invalidateAnnuities function
│                                         │
└── pages/                                │
    ├── Dashboard.jsx ❌ ────────────────┤ Broken - uses TanStack Query
    ├── Assets.jsx ❌ ───────────────────┤ Broken - uses TanStack Query
    ├── Goals.jsx ❌ ────────────────────┤ Broken - uses TanStack Query
    ├── Transactions.jsx ❌ ─────────────┤ Broken - uses TanStack Query
    ├── Analytics.jsx ❌ ────────────────┤ Broken - uses useEffect
    │                                     │
    ├── Insurance.jsx ✅ ────────────────┤ Works - timing dependent
    ├── Profile.jsx ✅ ──────────────────┤ Works - no TanStack Query
    ├── UserGuide.jsx ✅ ────────────────┤ Works - static
    └── UserSettings.jsx ✅ ─────────────┘ Works - no TanStack Query
```

---

## Fix Implementation Map

### Option 1: Add Missing Functions (Recommended)

```diff
File: frontend/src/lib/queryKeys.js

 export const queryKeys = {
   all: ['aura'],
   assets: { ... },
   transactions: { ... },
   insurance: { ... },
+  annuities: {
+    baseKey: ['aura', 'annuities'],
+    all: () => [...queryKeys.annuities.baseKey],
+    list: (filters) => {
+      if (!filters || Object.keys(filters).length === 0) {
+        return [...queryKeys.annuities.baseKey, 'list']
+      }
+      return [...queryKeys.annuities.baseKey, 'list', normalizeFilters(filters)]
+    },
+    detail: (id) => [...queryKeys.annuities.baseKey, 'detail', id],
+  },
   goals: { ... },
   dashboard: { ... },
   user: { ... },
 }

 export const invalidationHelpers = {
   invalidateAssets: (queryClient) => { ... },
   invalidateTransactions: (queryClient) => { ... },
   invalidateInsurance: (queryClient) => { ... },
+  invalidateAnnuities: (queryClient) => {
+    queryClient.invalidateQueries({ queryKey: queryKeys.annuities.baseKey })
+  },
   invalidateGoals: (queryClient) => { ... },
   invalidateDashboard: (queryClient) => { ... },
   invalidateAll: (queryClient) => { ... },
 }
```

**Result:** All pages work ✅

---

### Option 2: Remove Annuities References

```diff
File: frontend/src/lib/queryUtils.js

 export const SYNC_MESSAGES = {
   INVALIDATE_ASSETS: 'invalidate_assets',
   INVALIDATE_TRANSACTIONS: 'invalidate_transactions',
   INVALIDATE_INSURANCE: 'invalidate_insurance',
-  INVALIDATE_ANNUITIES: 'invalidate_annuities',
   INVALIDATE_DASHBOARD: 'invalidate_dashboard',
   ...
-  ANNUITY_CREATED: 'annuity_created',
-  ANNUITY_UPDATED: 'annuity_updated',
-  ANNUITY_DELETED: 'annuity_deleted',
 }

 // Remove from switch statement (lines 79-81)
-case SYNC_MESSAGES.INVALIDATE_ANNUITIES:
-  invalidationHelpers.invalidateAnnuities(queryClient)
-  break

 // Remove from switch statement (lines 112-117)
-case SYNC_MESSAGES.ANNUITY_CREATED:
-case SYNC_MESSAGES.ANNUITY_UPDATED:
-case SYNC_MESSAGES.ANNUITY_DELETED:
-  invalidationHelpers.invalidateAnnuities(queryClient)
-  invalidationHelpers.invalidateDashboard(queryClient)
-  break

 // Remove entire function (lines 204-220)
-onAnnuitySuccess: (queryClient, type, data = {}) => {
-  invalidationHelpers.invalidateAnnuities(queryClient)
-  invalidationHelpers.invalidateDashboard(queryClient)
-  ...
-},
```

**Result:** All pages work ✅

---

## Testing Flow After Fix

```
1. Clear Cache
   └─► Clear browser cache and session storage
       └─► Remove cached TanStack Query data

2. Restart Dev Server
   └─► Fresh JavaScript bundle
       └─► Clean state initialization

3. Open DevTools Console
   └─► Monitor for errors
       └─► Check for "invalidateAnnuities" errors

4. Test Each Page
   ├─► Dashboard (/)
   ├─► Assets (/portfolio)
   ├─► Goals (/goals)
   ├─► Transactions (/transactions)
   └─► Analytics (/analytics)
       └─► Verify: Data loads, no console errors

5. Verify Working Pages
   ├─► Insurance (/insurance)
   ├─► Profile (/profile)
   ├─► User Guide (/guide)
   └─► Settings (/settings)
       └─► Confirm: Still functioning correctly

6. Cross-Tab Testing
   └─► Open multiple tabs
       └─► Test broadcast channel synchronization
           └─► Verify: No annuity-related errors
```

---

## Timeline of Bug Introduction

```
Phase 1: Planning
│
├─► Developer adds annuities support to queryUtils.js
│   └─► Message types defined
│   └─► Handlers created
│   └─► Mutation helpers added
│
Phase 2: Partial Implementation (INCOMPLETE)
│
├─► ❌ Query keys NOT added to queryKeys.js
├─► ❌ Invalidation helpers NOT added to queryKeys.js
├─► ❌ Service layer NOT created
└─► ❌ UI components NOT created
│
Phase 3: Deployment
│
└─► Orphaned references cause runtime errors
    └─► Pages fail to load
```

---

## Root Cause Summary

**What went wrong:**
- Developer added annuities infrastructure to `queryUtils.js`
- Never completed implementation in `queryKeys.js`
- Orphaned code references undefined functions
- Runtime error breaks TanStack Query initialization
- Pages dependent on queries fail to load

**Why it's hard to debug:**
- Build succeeds (no compile-time errors)
- Error occurs at runtime during initialization
- Some pages work (those not using TanStack Query)
- Error may not be immediately visible in console
- Timing-dependent behavior adds confusion
