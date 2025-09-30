---
applyTo: '**'
---

# Feature Deprecation Guide - Lessons from Annuities Removal

## 🎯 Purpose

This guide documents critical lessons learned from the annuities feature deprecation (v0.141-v0.144). Use this as a comprehensive checklist and reference when deprecating any feature in the Aura Asset Manager codebase.

## 📊 Case Study: Annuities Deprecation Metrics

**What we learned:**
- **Initial estimate:** 2-3 files to delete
- **Actual affected files:** 20+ files across backend/frontend
- **Deployment cycles:** 4 (v0.141, v0.142, v0.143, v0.144)
- **Time to complete:** ~2 hours of systematic cleanup
- **Lines removed:** 3,600+ lines of code

**Root cause:** Feature was NOT architecturally isolated. References scattered across:
- 5 backend files (API, models, schemas)
- 15+ frontend files (services, components, pages, hooks)
- Query infrastructure (queryKeys, queryUtils)
- Navigation menus (AppLayout, UserGuide)
- Documentation sections
- Type constants and asset definitions

## ⚠️ Pre-Deprecation Checklist (MANDATORY)

**Before deprecating ANY feature, create comprehensive inventory:**

### 1. Backend Layer Search
```bash
# Search ALL backend files for feature references
grep -r "feature_name" backend/ --include="*.py"
grep -r "FeatureName" backend/ --include="*.py"
```

### 2. Frontend Layer Search
```bash
# Search ALL frontend files
grep -r "feature" frontend/src/ --include="*.{js,jsx}"
grep -r "Feature" frontend/src/ --include="*.{js,jsx}"
```

### 3. Complete Deletion Checklist

**Backend:**
- [ ] API endpoints (`backend/app/api/v1/[feature].py`)
- [ ] Router registration in `backend/main.py`
- [ ] Database models (`backend/app/models/[feature].py`)
- [ ] Pydantic schemas (`backend/app/schemas/[feature].py`)
- [ ] Schema fields in related models (e.g., Asset, User)
- [ ] Test files (`backend/tests/`)
- [ ] Root-level test files (`test_[feature]_*.py`)

**Frontend:**
- [ ] Service files (`frontend/src/services/[feature].js`)
- [ ] Page components (`frontend/src/pages/[Feature].jsx`)
- [ ] Feature components (`frontend/src/components/[feature]/`)
- [ ] Routes in `frontend/src/App.jsx`
- [ ] Query keys in `frontend/src/lib/queryKeys.js`
- [ ] Query utilities in `frontend/src/lib/queryUtils.js`
- [ ] SYNC_MESSAGES constants
- [ ] Invalidation helpers
- [ ] Mutation success handlers
- [ ] Navigation links in `frontend/src/components/layout/AppLayout.jsx`
- [ ] User guide sections in `frontend/src/pages/UserGuide.jsx`
- [ ] Type constants in `frontend/src/constants/`
- [ ] Context providers/hooks in `frontend/src/hooks/`
- [ ] Any prefetching in `useAuth.jsx` or similar

**Documentation:**
- [ ] README.md references
- [ ] API documentation
- [ ] User guide sections
- [ ] Deployment notes

## 🚨 Common Pitfalls & Solutions

### Pitfall #1: Hidden References in Query Infrastructure

**Problem:** Deleted service files, but query keys and sync messages remained.

**Example - What NOT to do:**
```javascript
// ❌ WRONG - Leftover infrastructure after feature deletion
export const queryKeys = {
  assets: { /* ... */ },
  deletedFeature: {  // ← Still here!
    baseKey: ['aura', 'deletedFeature'],
    list: () => [/* ... */]
  }
}

export const SYNC_MESSAGES = {
  FEATURE_CREATED: 'feature_created',  // ← Still here!
  FEATURE_UPDATED: 'feature_updated',
  FEATURE_DELETED: 'feature_deleted',
}
```

**Solution:**
- Search `queryKeys.js` - Remove entire feature object
- Search `queryUtils.js` - Remove ALL SYNC_MESSAGES constants
- Search `queryUtils.js` - Remove invalidation helpers (`invalidateFeature`)
- Search `queryUtils.js` - Remove mutation success handlers (`onFeatureSuccess`)
- Search for switch/case statements handling feature messages

### Pitfall #2: Navigation Links Pointing to Deleted Routes

**Problem:** Removed route from `App.jsx`, forgot navigation menu.

**Example - What NOT to do:**
```jsx
// ❌ WRONG - Navigation link to non-existent route
const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Deleted Feature', href: '/deleted-feature' },  // ← 404!
]
```

**Solution - Check ALL navigation locations:**
- `frontend/src/components/layout/AppLayout.jsx` - Main navigation array
- `frontend/src/pages/UserGuide.jsx` - Documentation navigation/sections array
- Any breadcrumb components
- Footer links
- Sidebar links
- Mobile navigation menus

### Pitfall #3: Schema Fields Surviving Model Deletion

**Problem:** Deleted API endpoints and frontend, but Pydantic schemas kept feature fields.

**Example - What NOT to do:**
```python
# ❌ WRONG - Orphaned schema fields
class AssetBase(BaseModel):
    name: str
    # Deleted feature fields still here!
    deleted_feature_type: Optional[str] = None
    deleted_feature_data: Optional[Dict] = None
```

**Solution - Check ALL schema variations:**
- `Base` schemas (e.g., `AssetBase`)
- `Create` schemas (e.g., `AssetCreate`)
- `Update` schemas (e.g., `AssetUpdate`)
- `Response` schemas (e.g., `AssetResponse`)
- Any schema that might reference the feature

### Pitfall #4: Type Constants Creating "Ghost" Options

**Problem:** Removed feature UI, but type constants still listed deprecated options.

**Example - What NOT to do:**
```javascript
// ❌ WRONG - Orphaned type constants
export const assetTypes = {
  'Active Category': [/* ... */],
  'Deleted Feature Category': [  // ← Ghost category!
    { value: 'deleted_type_1', label: 'Deleted Type 1' },
  ]
}
```

**Solution - Check type constant impacts:**
- Dropdown options in forms
- Form validation rules
- Filtering logic in lists
- Display logic in components
- Category definitions
- Asset type definitions

### Pitfall #5: Authentication Hooks with Feature Prefetching

**Problem:** Auth hook prefetching deleted feature data on login.

**Example - What NOT to do:**
```javascript
// ❌ WRONG - Prefetching deleted feature
const prefetchUserData = async () => {
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: queryKeys.assets.list(), /* ... */ }),
    queryClient.prefetchQuery({ queryKey: queryKeys.deleted.list(), /* ... */ }),  // ← BOOM!
  ])
}
```

**Solution - Check authentication critical paths:**
- `frontend/src/hooks/useAuth.jsx` - Check all prefetch queries
- `AuthProvider` component - Check initialization logic
- Any "on login" data loading
- Session initialization code
- **Critical:** These break BEFORE user sees UI, so test auth flow thoroughly

## 📋 Systematic Deprecation Workflow

### Phase 1: Inventory (30 minutes)

```bash
# Create complete list of all references
grep -r "feature_name" . --include="*.{py,js,jsx}" > deprecation-checklist.txt

# Review and categorize by:
# - Backend files
# - Frontend files  
# - Configuration files
# - Documentation

# Count total references
wc -l deprecation-checklist.txt
```

### Phase 2: Backend Deletion (in order)

**Order matters - follow this sequence:**

1. **Router registration in `main.py`** (prevents new requests)
   ```python
   # Remove this line
   app.include_router(feature.router, prefix="/api/v1/feature", tags=["feature"])
   ```

2. **API endpoint file** (removes routes)
   ```bash
   rm backend/app/api/v1/feature.py
   ```

3. **Database model** (removes ORM)
   ```bash
   rm backend/app/models/feature.py
   ```

4. **Pydantic schemas** (removes validation)
   ```bash
   rm backend/app/schemas/feature.py
   ```

5. **Schema fields in other models** (clean up related fields)
   - Check Asset, User, Transaction models
   - Remove feature-specific fields

6. **Test files** (removes backend tests)
   ```bash
   rm backend/tests/test_feature.py
   rm test_feature_*.py
   ```

### Phase 3: Frontend Deletion (in order)

**Order matters - follow this sequence:**

1. **Service file** (breaks all API calls to feature)
   ```bash
   rm frontend/src/services/feature.js
   ```

2. **Query keys object** (removes query infrastructure)
   - Edit `frontend/src/lib/queryKeys.js`
   - Remove entire feature object from queryKeys

3. **Query utils** (removes synchronization)
   - Edit `frontend/src/lib/queryUtils.js`
   - Remove SYNC_MESSAGES constants
   - Remove invalidation helpers
   - Remove mutation handlers
   - Remove switch/case statements

4. **Page components** (removes UI)
   ```bash
   rm frontend/src/pages/Feature.jsx
   ```

5. **Component directory** (removes UI fragments)
   ```bash
   rm -rf frontend/src/components/feature/
   ```

6. **Navigation links** (prevents user navigation)
   - Edit `AppLayout.jsx` - Remove from navigation array
   - Edit `UserGuide.jsx` - Remove from sections array

7. **Routes in App.jsx** (removes route registration)
   ```javascript
   // Remove import
   // Remove <Route path="/feature" element={<Feature />} />
   ```

8. **Type constants** (removes from dropdowns/forms)
   - Edit `frontend/src/constants/assetTypes.js`
   - Edit `frontend/src/constants/featureTypes.js`
   - Remove category entries

9. **User guide sections** (updates documentation)
   - Edit `UserGuide.jsx`
   - Remove entire feature section

10. **Authentication hooks** (critical!)
    - Edit `useAuth.jsx`
    - Remove prefetch queries
    - Remove imports

### Phase 4: Verification

```bash
# Final search - should only find docs/comments
grep -ri "feature_name" . --include="*.{py,js,jsx}" | grep -v "test_" | grep -v ".md"

# Should return 0 or only version/documentation references
```

## 🔍 Post-Deletion Testing Protocol

**Test these systematically after deprecation:**

### 1. Build/Compile Check
```bash
# Backend - Check for syntax errors
cd backend && python -m compileall .

# Frontend - Check for import/build errors  
cd frontend && npm run build

# Both should succeed without errors
```

### 2. Import Resolution Check
- Open browser developer console
- Load the application
- Look for:
  - "cannot resolve" errors
  - 404s on deleted routes
  - Failed API calls
  - Undefined variable errors

### 3. Authentication Flow Check
- Test complete login flow
- Verify no prefetch errors in console
- Check for query errors on dashboard load
- Confirm no hanging requests

### 4. Navigation Check
- Click ALL navigation links
- Verify no 404 pages
- Check breadcrumbs work
- Test mobile navigation

### 5. Feature-Specific Checks
- Verify related features still work
- Check dashboard doesn't reference deleted feature
- Ensure reports/exports work
- Test any dependent features

## 💡 Prevention: Feature Isolation Principles

**Design features for EASY deprecation from day 1:**

### 1. Self-Contained Service Structure

```javascript
// ✅ GOOD - All feature logic in one directory
frontend/src/features/myFeature/
  ├── services/myFeatureService.js
  ├── components/
  │   ├── MyFeatureList.jsx
  │   ├── MyFeatureDetail.jsx
  │   └── MyFeatureForm.jsx
  ├── pages/MyFeaturePage.jsx
  ├── hooks/useMyFeature.js
  ├── constants/myFeatureTypes.js
  └── utils/myFeatureHelpers.js

// When deprecating, delete entire directory
```

### 2. Feature Flags

```javascript
// ✅ GOOD - Easy to disable entire feature
// frontend/src/config/features.js
export const FEATURES = {
  MY_FEATURE_ENABLED: import.meta.env.VITE_FEATURE_MY_FEATURE !== 'false',
  ANOTHER_FEATURE_ENABLED: import.meta.env.VITE_FEATURE_ANOTHER !== 'false'
}

// In navigation
import { FEATURES } from '@/config/features'

const navigation = [
  { name: 'Dashboard', href: '/' },
  FEATURES.MY_FEATURE_ENABLED && { 
    name: 'My Feature', 
    href: '/my-feature' 
  }
].filter(Boolean)

// In routes
{FEATURES.MY_FEATURE_ENABLED && (
  <Route path="/my-feature" element={<MyFeature />} />
)}
```

### 3. Isolated Query Keys with Namespace

```javascript
// ✅ GOOD - Feature has its own namespace
export const queryKeys = {
  myFeature: {
    _namespace: 'myFeature',  // Makes search/delete easier
    baseKey: ['aura', 'myFeature'],
    all: () => [...queryKeys.myFeature.baseKey],
    list: () => [...queryKeys.myFeature.baseKey, 'list'],
    detail: (id) => [...queryKeys.myFeature.baseKey, 'detail', id],
  }
}

// When deprecating, search for "myFeature" finds everything
```

### 4. Clear Naming Conventions

```javascript
// ✅ GOOD - Searchable, obvious naming
import { myFeatureService } from '@/services/myFeatureService'
import { MyFeatureList } from '@/components/myFeature/MyFeatureList'
import { useMyFeature } from '@/hooks/useMyFeature'

// Easy to find all references with grep -r "myFeature"

// ❌ BAD - Generic names hide feature coupling
import { dataService } from '@/services/data'
import { List } from '@/components/List'
import { useData } from '@/hooks/useData'

// Impossible to know what these are for
```

### 5. Documented Dependencies

```markdown
<!-- In feature README.md or component comments -->

# My Feature

## Dependencies
- Uses `assetsService` for asset data
- Integrates with Dashboard for summary display
- Adds fields to Asset schema: `my_feature_field1`, `my_feature_field2`
- Prefetched in `useAuth.jsx` on login

## Deprecation Checklist
When removing this feature:
- [ ] Remove query keys from queryKeys.js
- [ ] Remove navigation link from AppLayout.jsx
- [ ] Remove prefetch from useAuth.jsx
- [ ] Remove schema fields from Asset model
- [ ] Update Dashboard to handle missing data
```

## 🛡️ Defensive Coding Practices

### 1. Grep Before You Commit

```bash
# Before marking deprecation "complete"
grep -ri "featurename" . --include="*.{py,js,jsx}" | wc -l

# Should be 0 or only doc/comment references
# If > 5, investigate each one
```

### 2. Build Test

```bash
# Check for broken imports
cd frontend && npm run build

# If build succeeds, imports are clean
# If build fails, read error carefully - it tells you exactly what's missing
```

### 3. Runtime Query Error Detection

```javascript
// Add to dev environment - frontend/src/main.jsx
if (import.meta.env.DEV) {
  queryClient.setDefaultOptions({
    queries: {
      onError: (error) => {
        console.error('❌ Query error detected:', error)
        console.trace('Query error stack trace')
        // Helps catch deleted query keys immediately
      }
    }
  })
}
```

### 4. Console Error Monitoring

**After deprecation:**
- Open browser developer console
- Clear console
- Load application
- Navigate through all pages
- Look for:
  - "cannot resolve" errors
  - "404" errors
  - "undefined" errors
  - Failed network requests
- Any errors = incomplete cleanup

### 5. Version Tracking

```javascript
// Always update version.js with each cleanup iteration
export const VERSION_INFO = {
  version: 'v0.14X',
  buildDate: 'YYYY-MM-DD',
  deploymentId: 'feature-deprecation-cleanup',
  description: 'Removed [specific component] from [feature] deprecation'
}
```

## 🎓 Meta-Lessons: Technical Debt Management

### The Real Cost of Features

**Initial Development:**
- Design: 4 hours
- Implementation: 2 days
- Testing: 4 hours
- **Total:** ~3 days

**Hidden Maintenance:**
- Bug fixes over 6 months: ~2 days
- Feature updates: ~1 day
- Integration maintenance: ~1 day
- **Total:** ~4 days

**Deprecation:**
- Initial estimate: 2 hours
- Actual time (systematic): 2 hours
- Testing and fixes: 2 hours
- **Total:** ~4-6 hours

**Key Insight:** Features are easier to add than to remove. The deprecation cost is often underestimated.

### Prevention Strategy

1. **Feature Justification**
   - Question every new feature: "Is this CORE to the app?"
   - Will this be used by >50% of users?
   - Does this align with the product mission?
   - Can this be a plugin/extension instead?

2. **Design for Removal**
   - Use feature flags from day 1
   - Keep features architecturally isolated
   - Document integration points during development
   - Use clear, searchable naming conventions

3. **Regular Audits**
   - Quarterly "dead code" audits
   - Track feature usage metrics
   - Review and deprecate unused features promptly
   - Keep architecture diagrams updated

4. **Documentation First**
   - Document dependencies before building
   - Create deprecation checklist during development
   - Keep integration points visible
   - Update docs when feature changes

### When to Deprecate

**Green Flags (safe to deprecate):**
- Feature used by <5% of users
- High maintenance cost
- Better alternative exists
- Conflicts with product direction
- Security/performance concerns

**Red Flags (reconsider):**
- Core functionality
- High user engagement
- No replacement available
- Recent feature (<6 months old)
- Promised in roadmap

## 📚 Reference: Annuities Deprecation Timeline

**v0.141** - Initial cleanup
- Removed backend API endpoints
- Removed database models and schemas
- Removed frontend pages and components
- Removed routes from App.jsx
- Result: Vercel build failed - "Could not resolve AnnuityManager"

**v0.142** - Fixed import errors
- Removed AnnuityManager import from Assets.jsx
- Removed annuity service from UserSettings.jsx
- Removed annuity types from Transactions.jsx
- Result: Build succeeded but useAuth still broken

**v0.143** - Fixed authentication
- Removed annuity service from useAuth.jsx
- Removed annuity prefetch queries
- Fixed security_middleware.py lint errors
- Result: Authentication working, but query infrastructure remained

**v0.144** - Final cleanup
- Removed annuity schema fields from Asset schemas
- Removed annuities query keys object
- Removed all annuity SYNC_MESSAGES
- Removed invalidateAnnuities helper
- Removed onAnnuitySuccess mutation helper
- Removed Annuities navigation link
- Removed entire Annuity Planning section from UserGuide
- Updated asset type categories
- Result: Complete deprecation, 278 lines removed

**Total:** 4 deployment cycles, 20+ files modified, 3,600+ lines removed

## ✅ Quick Reference Checklist

```markdown
## Feature Deprecation Checklist

### Pre-Deprecation
- [ ] Run grep search for all references
- [ ] Create comprehensive file list
- [ ] Estimate scope (files, lines, dependencies)
- [ ] Plan deployment strategy
- [ ] Update version.js

### Backend
- [ ] Remove router registration
- [ ] Delete API endpoint file
- [ ] Delete model file
- [ ] Delete schema file  
- [ ] Remove schema fields from related models
- [ ] Delete test files

### Frontend - Infrastructure
- [ ] Delete service file
- [ ] Remove query keys object
- [ ] Remove SYNC_MESSAGES constants
- [ ] Remove invalidation helpers
- [ ] Remove mutation handlers
- [ ] Remove switch/case handlers

### Frontend - UI
- [ ] Delete page components
- [ ] Delete component directory
- [ ] Remove from App.jsx routes
- [ ] Remove from navigation arrays
- [ ] Remove from type constants
- [ ] Remove from UserGuide sections

### Frontend - Critical Hooks
- [ ] Remove from useAuth prefetching
- [ ] Remove from context providers
- [ ] Update related hooks

### Verification
- [ ] Run backend compile check
- [ ] Run frontend build
- [ ] Check browser console for errors
- [ ] Test authentication flow
- [ ] Test all navigation links
- [ ] Final grep search (should be clean)

### Deployment
- [ ] Update version.js
- [ ] Commit with clear message
- [ ] Push to GitHub
- [ ] Monitor Railway logs
- [ ] Monitor Vercel deployment
- [ ] Test live application
- [ ] Update documentation
```

---

*Document created: 2025-09-30*
*Last updated: 2025-09-30*
*Based on: Annuities deprecation (v0.141-v0.144)*
