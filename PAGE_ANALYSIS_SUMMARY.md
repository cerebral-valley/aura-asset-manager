# Page Analysis Summary

## Quick Reference: Working vs Non-Working Pages

### Current Status

| Page | Route | Status | Query Usage | Issue |
|------|-------|--------|-------------|-------|
| **Dashboard** | `/` | ❌ NOT WORKING | TanStack Query | Blocked by querySync error |
| **Assets** | `/portfolio` | ❌ NOT WORKING | TanStack Query | Blocked by querySync error |
| **Goals** | `/goals` | ❌ NOT WORKING | TanStack Query | Blocked by querySync error |
| **Transactions** | `/transactions` | ❌ NOT WORKING | TanStack Query | Blocked by querySync error |
| **Analytics** | `/analytics` | ❌ NOT WORKING | useEffect + useState | Indirect impact |
| **Insurance** | `/insurance` | ✅ WORKING | TanStack Query | Timing-dependent |
| **Profile** | `/profile` | ✅ WORKING | Traditional state | No TanStack Query |
| **User Guide** | `/guide` | ✅ WORKING | Static content | No data fetching |
| **Settings** | `/settings` | ✅ WORKING | Traditional state | No TanStack Query |

---

## Root Cause

**Problem:** Missing `invalidateAnnuities()` function in `frontend/src/lib/queryKeys.js`

**Location:** Referenced in `frontend/src/lib/queryUtils.js` at:
- Line 80 (INVALIDATE_ANNUITIES handler)
- Line 115 (Annuity CRUD operations)
- Line 207 (onAnnuitySuccess helper)

**Effect:** JavaScript runtime error during TanStack Query initialization breaks query system, preventing pages from loading data.

---

## Technical Details

### Error Occurs At App Startup

```
App.jsx (line 167)
  └─► useQuerySync(queryClient)
      └─► queryUtils.js (line 319-330)
          └─► broadcastUtils.setupListener(queryClient)
              └─► Switch case handler (line 115)
                  └─► invalidationHelpers.invalidateAnnuities(queryClient)
                      └─► ❌ TypeError: invalidateAnnuities is not a function
```

### Why Some Pages Work

**Insurance works (sometimes):**
- May initialize before error fully propagates
- Depends on timing and cached data
- Not reliably functional

**Profile, UserGuide, Settings work:**
- Don't use TanStack Query
- Use traditional `useState` + `useEffect`
- Independent of query system

**Dashboard, Assets, Goals, Transactions fail:**
- Depend heavily on TanStack Query
- Query system broken by initialization error
- Cannot fetch data

---

## Evidence Checklist

- [x] Build succeeds (no syntax/import errors)
- [x] Missing function identified in queryKeys.js
- [x] Three references to missing function in queryUtils.js
- [x] Clear pattern: TanStack Query pages fail
- [x] Working pages don't use TanStack Query (except Insurance)
- [x] No annuities infrastructure exists (keys, service, UI)
- [x] Orphaned code from incomplete feature implementation

---

## Solution Summary

### Option 1: Add Missing Infrastructure (Recommended)
**Action:** Add annuities query keys and invalidation helper to `queryKeys.js`
**Time:** 2 minutes
**Risk:** Low (follows existing patterns)
**Benefit:** Enables future annuities feature

### Option 2: Remove Orphaned Code
**Action:** Remove all annuities references from `queryUtils.js`
**Time:** 5 minutes
**Risk:** Medium (multiple deletions required)
**Benefit:** Clean codebase, no unused code

---

## Testing Checklist

After implementing fix:

### Clear Cache
- [ ] Clear browser cache
- [ ] Clear session storage  
- [ ] Clear localStorage

### Restart Environment
- [ ] Stop dev server
- [ ] Restart dev server
- [ ] Verify clean build

### Test Non-Working Pages
- [ ] Dashboard (`/`) - Verify data loads
- [ ] Assets (`/portfolio`) - Verify asset list displays
- [ ] Goals (`/goals`) - Verify goals list displays
- [ ] Transactions (`/transactions`) - Verify transaction history loads
- [ ] Analytics (`/analytics`) - Verify charts render

### Test Working Pages (Regression)
- [ ] Insurance (`/insurance`) - Still works
- [ ] Profile (`/profile`) - Still works
- [ ] User Guide (`/guide`) - Still works
- [ ] Settings (`/settings`) - Still works

### Browser Console
- [ ] No errors: `invalidateAnnuities is not a function`
- [ ] No errors: `Cannot read property 'invalidateAnnuities'`
- [ ] No TanStack Query errors
- [ ] No React rendering errors

### Cross-Tab Testing
- [ ] Open app in two tabs
- [ ] Make changes in one tab
- [ ] Verify synchronization works
- [ ] No broadcast channel errors

---

## File Locations

**Files to Check:**
```
frontend/src/
├── lib/
│   ├── queryKeys.js         ← Add missing functions here
│   └── queryUtils.js        ← Contains broken references
├── App.jsx                  ← Calls useQuerySync()
└── pages/
    ├── Dashboard.jsx        ← Broken
    ├── Assets.jsx           ← Broken  
    ├── Goals.jsx            ← Broken
    ├── Transactions.jsx     ← Broken
    ├── Analytics.jsx        ← Broken
    ├── Insurance.jsx        ← Works (timing-dependent)
    ├── Profile.jsx          ← Works
    ├── UserGuide.jsx        ← Works
    └── UserSettings.jsx     ← Works
```

---

## Expected Results After Fix

### Before Fix
```
✅ Insurance      (timing-dependent)
✅ Profile        (no TanStack Query)
✅ User Guide     (static)
✅ Settings       (no TanStack Query)
❌ Dashboard      (TanStack Query broken)
❌ Assets         (TanStack Query broken)
❌ Goals          (TanStack Query broken)
❌ Transactions   (TanStack Query broken)
❌ Analytics      (indirect impact)
```

### After Fix
```
✅ Insurance      (stable)
✅ Profile        (unchanged)
✅ User Guide     (unchanged)
✅ Settings       (unchanged)
✅ Dashboard      (TanStack Query working)
✅ Assets         (TanStack Query working)
✅ Goals          (TanStack Query working)
✅ Transactions   (TanStack Query working)
✅ Analytics      (no longer blocked)
```

---

## Developer Notes

### Why This Bug is Hard to Debug

1. **Build succeeds** - No compile-time errors
2. **Silent failure** - May not show obvious console error
3. **Partial functionality** - Some pages work, creating confusion
4. **Timing-dependent** - Insurance page works sometimes
5. **Indirect impact** - Analytics uses useEffect but still fails
6. **Missing context** - No clear indicator of annuities feature status

### Prevention for Future

1. **Complete features** before committing infrastructure code
2. **Add TypeScript** for better type checking
3. **Unit tests** for query utilities
4. **Integration tests** for page loading
5. **Linting rules** to detect unused code patterns

---

## Quick Fix Implementation (Option 1)

Copy-paste this into `frontend/src/lib/queryKeys.js`:

**Step 1:** Add after insurance section (around line 46):
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

**Step 2:** Add after invalidateInsurance (around line 133):
```javascript
// Invalidate annuities data (independent of assets/transactions)
invalidateAnnuities: (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.annuities.baseKey })
},
```

**Done!** Restart dev server and test pages.

---

## Contact & Support

For questions about this diagnostic:
- **Documentation:** See DIAGNOSTIC_REPORT.md for full analysis
- **Diagrams:** See ERROR_FLOW_DIAGRAM.md for visual flow
- **Repository:** github.com/cerebral-valley/aura-asset-manager
