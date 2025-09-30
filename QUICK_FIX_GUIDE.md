# Quick Fix Guide - Page Loading Issue

## Problem
Pages not loading: Dashboard, Assets, Goals, Transactions, Analytics

## Root Cause
Missing `invalidateAnnuities()` function

## Fix (2 minutes)

### Open File
```bash
frontend/src/lib/queryKeys.js
```

### Step 1: Add Query Keys (Line ~46)
**Location:** After the `insurance` section, before the `goals` section

**Add this code:**
```javascript
// Annuities-related queries
annuities: {
  baseKey: ['aura', 'annuities'],
  all: () => [...queryKeys.annuities.baseKey],
  list: (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return [...queryKeys.annuities.baseKey, 'list']
    }
    return [...queryKeys.annuities.baseKey, 'list', normalizeFilters(filters)]
  },
  detail: (id) => [...queryKeys.annuities.baseKey, 'detail', id],
},
```

**Context:**
```javascript
  // Insurance-related queries
  insurance: {
    baseKey: ['aura', 'insurance'],
    all: () => [...queryKeys.insurance.baseKey],
    list: (filters) => { ... },
    detail: (id) => [...queryKeys.insurance.baseKey, 'detail', id],
  },

  // ADD ANNUITIES SECTION HERE <<<

  // Goals-related queries
  goals: {
    baseKey: ['aura', 'goals'],
    ...
  },
```

### Step 2: Add Invalidation Helper (Line ~133)
**Location:** After `invalidateInsurance`, before `invalidateGoals`

**Add this code:**
```javascript
// Invalidate annuities data (independent of assets/transactions)
invalidateAnnuities: (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.annuities.baseKey })
},
```

**Context:**
```javascript
export const invalidationHelpers = {
  // ... other functions ...

  // Invalidate insurance data (independent of assets/transactions)
  invalidateInsurance: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.insurance.baseKey })
  },

  // ADD INVALIDATION HELPER HERE <<<

  // Invalidate goals data
  invalidateGoals: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.goals.baseKey })
  },

  // ... rest of functions ...
}
```

### Step 3: Test
```bash
# Clear cache
# - Open DevTools → Application → Clear storage

# Restart dev server
npm run dev

# Test these pages (should all work now):
# - http://localhost:5173/ (Dashboard)
# - http://localhost:5173/portfolio (Assets)
# - http://localhost:5173/goals (Goals)
# - http://localhost:5173/transactions (Transactions)
# - http://localhost:5173/analytics (Analytics)
```

## Expected Result
✅ All pages load correctly
✅ No console errors
✅ Data displays properly

## Verification
- [ ] Dashboard loads with data
- [ ] Assets page shows asset list
- [ ] Goals page displays goals
- [ ] Transactions page shows history
- [ ] Analytics page renders charts
- [ ] Console shows no errors

## Done! 🎉
All pages should now work correctly.

---

## Alternative: Remove Annuities Code

If you prefer to remove the unused annuities code instead:

**File:** `frontend/src/lib/queryUtils.js`

**Remove:**
1. Line 23: `INVALIDATE_ANNUITIES`, `ANNUITY_CREATED`, `ANNUITY_UPDATED`, `ANNUITY_DELETED`
2. Lines 79-81: Case handler for `INVALIDATE_ANNUITIES`
3. Lines 112-117: Case handlers for annuity CRUD operations
4. Lines 204-220: `onAnnuitySuccess` function

This requires more changes and removes infrastructure for future features.
**Recommendation:** Use the quick fix above instead.
