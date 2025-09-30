---
applyTo: '**'
---

# Aura Asset Manager - Comprehensive Coding Instructions

## 🎯 Core Principles

This document captures critical coding patterns, debugging lessons, and preventive measures learned through systematic issue resolution. Focus on preventing the most common failure modes while maintaining code quality and consistency.

## 🏗️ Service Architecture Patterns

### Frontend Service Layer Standards

#### ✅ Consistent Export Pattern
**ALL services MUST use named exports:**

```javascript
// ✅ CORRECT - Named export pattern
export const serviceName = {
  async getItems(config = {}) { /* ... */ },
  async createItem(data, config = {}) { /* ... */ },
  // ... other methods
}

// ❌ WRONG - Default export (causes import inconsistencies)
const serviceName = { /* ... */ }
export default serviceName
```

#### ✅ Import Pattern Consistency
**ALL service imports MUST use destructuring:**

```javascript
// ✅ CORRECT - Named import
import { annuityService } from '../services/annuities.js'
import { assetsService } from '../services/assets.js'

// ❌ WRONG - Default import (breaks with named exports)
import annuityService from '../services/annuities.js'
```

#### ✅ API URL Formatting Rules
**Critical: URL patterns MUST match backend FastAPI routes exactly**

**Current Pattern (as of 2025-09-30):**
- **List endpoints**: Use trailing slash `/assets/`, `/transactions/`, `/insurance/`
- **Detail endpoints**: Use trailing slash `/assets/{id}/`, `/transactions/{id}/`
- **Action endpoints**: NO trailing slash `/dashboard/summary`, `/profile/options`

```javascript
// ✅ CORRECT - Current codebase patterns
// List endpoints - WITH trailing slash
async getAssets(config = {}) {
  const response = await apiClient.get('/assets/', config)  // Trailing slash required
  return response.data
}

// Detail endpoints - WITH trailing slash
async getAsset(id, config = {}) {
  const response = await apiClient.get(`/assets/${id}/`, config)  // Trailing slash required
  return response.data
}

// Action/summary endpoints - NO trailing slash
async getSummary(config = {}) {
  const response = await apiClient.get('/dashboard/summary', config)  // No trailing slash
  return response.data
}

// ❌ WRONG - Inconsistent patterns cause 307 redirects
async getAssets(config = {}) {
  const response = await apiClient.get('/assets', config)  // Missing required trailing slash
  return response.data
}
```

**Why this matters:**
- Mismatched URLs → 307 Permanent Redirect
- 307 redirect downgrades HTTPS→HTTP
- CSP blocks HTTP requests → "Refused to connect" errors
- **Always check backend route definition** in `backend/app/api/v1/[feature].py`

### Backend FastAPI Route Registration

#### ✅ Router Registration Checklist
**Every new API endpoint MUST be registered in `backend/main.py`:**

```python
# ✅ REQUIRED - Add this line for every new router
app.include_router(feature.router, prefix="/api/v1/feature", tags=["feature"])
```

**Common failure mode:** Creating endpoints without router registration → 404 errors

## 🔑 Authentication & Authorization Patterns

### Frontend Auth Integration

#### ✅ Service Authentication Pattern
```javascript
// ✅ All services automatically get auth via apiClient interceptors
// No manual token handling required in service methods
export const serviceExample = {
  async getData(config = {}) {
    // apiClient automatically adds Bearer token via interceptors
    const response = await apiClient.get('/endpoint', config)
    return response.data
  }
}
```

#### ✅ Component Auth Checking
```javascript
// ✅ Standard auth checking pattern
const { user, session } = useAuth()

// Enable queries only after authentication
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: () => service.getData(),
  enabled: !!session,  // Prevent pre-auth API calls
})
```

## 🗄️ Database & UUID Handling

### Critical UUID Patterns

#### ✅ Backend UUID Comparison
**NEVER convert UUIDs to strings for comparison:**

```python
# ✅ CORRECT - Direct UUID object comparison
selection_lookup = {sel.asset_id: bool(sel.is_selected) for sel in user_selections}
asset.is_selected = selection_lookup.get(asset.id, False)

# ❌ WRONG - String conversion breaks UUID equality
selection_lookup = {str(sel.asset_id): bool(sel.is_selected) for sel in user_selections}
asset.is_selected = selection_lookup.get(str(asset.id), False)
```

**Why this fails:** Python UUID objects don't equal their string representations, causing lookup failures and "snap back" UI bugs.

#### ✅ Frontend UUID Handling
```javascript
// ✅ UUIDs as strings in frontend (JSON serialization)
const selection = {
  asset_id: "550e8400-e29b-41d4-a716-446655440000",  // String format
  is_selected: true
}
```

## 🌐 API Integration Patterns

### Error Handling Standards

#### ✅ Service Error Pattern
```javascript
export const serviceExample = {
  async getData(config = {}) {
    try {
      const response = await apiClient.get('/endpoint', config)
      return response.data
    } catch (error) {
      // Log for debugging but let calling component handle UI
      console.error('Error fetching data:', error)
      throw error  // Re-throw for component handling
    }
  }
}
```

#### ✅ Component Error Handling
```javascript
// ✅ Component-level error handling for user feedback
const handleAction = async () => {
  try {
    await service.doAction(data)
    // Success feedback
  } catch (error) {
    // User-facing error handling
    setError(error.response?.data?.detail || 'Operation failed')
  }
}
```

### Request Configuration Pattern

#### ✅ Optional Config Parameter
**All service methods MUST accept optional config for abort signals:**

```javascript
// ✅ CORRECT - Optional config parameter for abort signals
async getData(params = {}, config = {}) {
  const queryString = new URLSearchParams(params).toString()
  const url = `/endpoint${queryString ? `?${queryString}` : ''}`
  const response = await apiClient.get(url, config)  // Forward config to axios
  return response.data
}

// ✅ Usage with abort signal
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: ({ signal }) => service.getData({}, { signal }),
  // TanStack Query automatically cancels on unmount
})
```

## 🎨 React Patterns & Context Management

### Context Provider Conflicts

#### ✅ Single Context Provider Pattern
**NEVER nest duplicate providers:**

```jsx
// ✅ CORRECT - Single provider at app root
function App() {
  return (
    <ThemeProvider>
      <QueryClient>
        <Router>
          {/* App content */}
        </Router>
      </QueryClient>
    </ThemeProvider>
  )
}

// ❌ WRONG - Duplicate providers cause "must be used within provider" errors
function App() {
  return (
    <ThemeProvider>
      <Router>
        <ThemeProvider>  {/* Duplicate causes conflicts */}
          {/* content */}
        </ThemeProvider>
      </Router>
    </ThemeProvider>
  )
}
```

### Data Loading Patterns

#### ✅ Loading State Management
```javascript
// ✅ Standard loading pattern with TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.feature.list(),
  queryFn: ({ signal }) => service.getItems({ signal }),
  enabled: !!session,
  staleTime: 5 * 60 * 1000,  // 5 minutes
})

// ✅ Show loading state
if (isLoading) return <Loading pageName="Feature" />
if (error) return <div>Error: {error.message}</div>
```

## � New Page/Feature Development Checklist

### Complete Workflow for Adding New Features

**Use this checklist when creating new pages or major features:**

#### Phase 1: Backend Development
- [ ] **Create database model** in `backend/app/models/[feature].py`
  - UUID primary key: `id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)`
  - User FK: `user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))`
  - JSONB metadata if needed: `metadata = Column(JSONB, default=dict)`
  
- [ ] **Create Pydantic schemas** in `backend/app/schemas/[feature].py`
  - `[Feature]Base` - shared fields
  - `[Feature]Create` - creation payload
  - `[Feature]Update` - update payload
  - `[Feature]Response` - API response with computed fields
  
- [ ] **Create API endpoint** in `backend/app/api/v1/[feature].py`
  - Use proper trailing slash pattern (list: `/`, detail: `/{id}/`)
  - Add auth dependency: `current_user: User = Depends(get_current_user)`
  - Implement CRUD operations: GET (list), GET (detail), POST, PUT/PATCH, DELETE
  
- [ ] **Register router in main.py** - CRITICAL STEP
  ```python
  from app.api.v1 import feature
  app.include_router(feature.router, prefix="/api/v1/feature", tags=["feature"])
  ```
  
- [ ] **Test endpoint via `/docs`** - FastAPI auto-generated documentation
  - Test authentication with valid Bearer token
  - Verify request/response schemas match expectations
  - Check error handling (401, 404, 500)

#### Phase 2: Frontend Service Layer
- [ ] **Create service file** in `frontend/src/services/[feature].js`
  - Use named export pattern: `export const featureService = { ... }`
  - All methods accept optional `config = {}` for abort signals
  - Use correct URL patterns (trailing slashes for list/detail)
  
  ```javascript
  export const featureService = {
    async getItems(config = {}) {
      const response = await apiClient.get('/feature/', config)  // Note trailing slash
      return response.data
    },
    async getItem(id, config = {}) {
      const response = await apiClient.get(`/feature/${id}/`, config)
      return response.data
    },
    async createItem(data, config = {}) {
      const response = await apiClient.post('/feature/', data, config)
      return response.data
    },
    async updateItem(id, data, config = {}) {
      const response = await apiClient.put(`/feature/${id}/`, data, config)
      return response.data
    },
    async deleteItem(id, config = {}) {
      const response = await apiClient.delete(`/feature/${id}/`, config)
      return response.data
    }
  }
  ```

#### Phase 3: Query Infrastructure
- [ ] **Add query keys** in `frontend/src/lib/queryKeys.js`
  ```javascript
  export const queryKeys = {
    // ... existing keys
    feature: {
      all: ['feature'],
      list: () => [...queryKeys.feature.all, 'list'],
      detail: (id) => [...queryKeys.feature.all, 'detail', id],
    }
  }
  ```
  
- [ ] **Add to queryUtils** in `frontend/src/lib/queryUtils.js`
  - Add to `SYNC_MESSAGES` array for real-time sync
  - Add invalidation logic if needed

#### Phase 4: Component Development
- [ ] **Create page component** in `frontend/src/pages/[Feature]Page.jsx`
  - Use `useAuth()` for authentication check
  - Use TanStack Query with proper patterns:
    ```javascript
    const { user, session } = useAuth()
    
    const { data, isLoading, error } = useQuery({
      queryKey: queryKeys.feature.list(),
      queryFn: ({ signal }) => featureService.getItems({ signal }),
      enabled: !!session,  // Wait for authentication
      staleTime: 5 * 60 * 1000,  // 5 minutes
    })
    
    if (isLoading) return <Loading pageName="Feature" />
    if (error) return <div>Error: {error.message}</div>
    ```
  
- [ ] **Add navigation links** in multiple locations:
  - Desktop sidebar: `frontend/src/components/Sidebar.jsx`
  - Mobile drawer: `frontend/src/components/MobileDrawer.jsx`
  - Breadcrumbs if applicable
  
- [ ] **Create route** in `frontend/src/App.jsx`
  ```javascript
  import FeaturePage from './pages/FeaturePage'
  
  <Route path="/feature" element={<ProtectedRoute><FeaturePage /></ProtectedRoute>} />
  ```

#### Phase 5: Testing & Verification
- [ ] **Local development testing**
  - Start backend: `cd backend && uvicorn main:app --reload`
  - Start frontend: `cd frontend && npm run dev`
  - Test authentication flow
  - Test CRUD operations
  - Check browser console for errors
  
- [ ] **Update version** in `frontend/src/version.js`
  ```javascript
  export const VERSION_INFO = {
    version: 'v0.1XX',  // Increment from current
    buildDate: '2025-MM-DD',
    deploymentId: 'feature-name',
    description: 'Add [feature] page with full CRUD operations'
  }
  ```
  
- [ ] **Commit and push to GitHub**
  ```bash
  git add .
  git commit -m "Version: v0.1XX - Add [feature] page with CRUD operations"
  git push origin main
  ```
  
- [ ] **Live deployment testing** - Use Playwright MCP
  1. Close existing browser sessions: `mcp_playwright_browser_close()`
  2. Navigate to live site: `mcp_playwright_browser_navigate("https://aura-asset-manager.vercel.app/")`
  3. Authenticate with Google OAuth
  4. Navigate to new feature page
  5. Test all CRUD operations with real data
  6. Check console: `mcp_playwright_browser_console_messages()`
  7. Verify version number in dashboard top-right
  
- [ ] **Cross-feature validation**
  - Test that existing pages still work
  - Verify navigation doesn't break
  - Check for authentication issues
  - Test theme switching on new page

#### Common Pitfalls to Avoid
- ❌ Forgetting to register router in `backend/main.py` → 404 errors
- ❌ Missing trailing slashes on URLs → 307 redirects → CSP blocks
- ❌ Using default exports instead of named exports → import errors
- ❌ Not adding `enabled: !!session` to queries → pre-auth API calls fail
- ❌ Forgetting to add navigation links → users can't access new page
- ❌ Not updating version before push → deployment verification confusion
- ❌ Skipping live testing → production-only issues discovered by users

## �🛡️ Security & Environment

### Environment Configuration

#### ✅ API Base URL Handling
```javascript
// ✅ Environment-aware API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-api.railway.app/api/v1'
  : 'http://localhost:8000/api/v1'

// ✅ HTTPS enforcement in production
apiClient.interceptors.request.use(async (config) => {
  if (config.baseURL?.startsWith('http:')) {
    config.baseURL = config.baseURL.replace('http:', 'https:')
  }
  // ... auth token handling
})
```

#### ✅ CORS Configuration
**SECURITY CRITICAL: NEVER use wildcard origins in production**

```python
# ✅ CORRECT - Explicit origins only (backend/app/core/config.py)
ALLOWED_ORIGINS: List[str] = [
    "https://aura-asset-manager.vercel.app",  # Production
    "https://aura-asset-manager-git-main-cerebral-valley.vercel.app",  # Git main branch
    "https://aura-asset-manager-cerebral-valley.vercel.app",  # Main deployment
    "http://localhost:5173",  # Local Vite dev
    "http://localhost:5176",  # Alternative local port
    "http://localhost:3000"   # Alternative dev port
]

# ✅ CORRECT - Dynamic Vercel preview handling (backend/main.py)
def is_allowed_origin(origin: str) -> bool:
    """Check if origin is allowed, including dynamic Vercel URLs."""
    if origin in settings.ALLOWED_ORIGINS:
        return True
    
    # Allow Vercel preview deployments with regex
    import re
    vercel_patterns = [
        r'https://aura-asset-manager.*\.vercel\.app$',
        r'https://.*--aura-asset-manager.*\.vercel\.app$'
    ]
    
    for pattern in vercel_patterns:
        if re.match(pattern, origin):
            return True
    
    return False

# ❌ WRONG - Wildcard origins are security vulnerability
allow_origins=["*"]  # Exposes API to any origin
origins.append("*vercel.app")  # Too permissive
```

**CSP Headers (Content Security Policy):**
```python
# ✅ CORRECT - Restrictive CSP (backend/app/core/security_middleware.py)
response.headers["Content-Security-Policy"] = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline'; "  # Allow inline scripts for React
    "style-src 'self' 'unsafe-inline'; "   # Allow inline styles
    "img-src 'self' data: https:; "       # Allow data URIs and HTTPS images
    "connect-src 'self' https://*.supabase.co; "  # API + Supabase only
    "frame-ancestors 'none';"              # Prevent clickjacking
)

# Additional security headers
response.headers["X-Content-Type-Options"] = "nosniff"
response.headers["X-Frame-Options"] = "DENY"
response.headers["X-XSS-Protection"] = "1; mode=block"
response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
```

## 🧪 Testing & Debugging Protocols

### Live Testing Standards

#### ✅ Post-Deployment Verification
**After every GitHub push:**

1. **Version Tracking**: Update `frontend/src/version.js` before commit
2. **Browser Console Check**: Use browser dev tools, check for errors
3. **Feature Testing**: Test specific functionality end-to-end
4. **Cross-Feature Validation**: Ensure changes don't break unrelated features

#### ✅ Browser Testing Protocol - PLAYWRIGHT MCP ONLY
**🚨 CRITICAL: Always use Playwright MCP exclusively, never mix with Chrome DevTools MCP**

**Session Management:**
- **ALWAYS close existing sessions first**: Use `mcp_playwright_browser_close()` before starting new tests
- **Fresh session for each major test**: Quit and restart browser to ensure clean state
- **Use only Playwright MCP tools**: Never switch to Chrome DevTools MCP in same session

**Testing Workflow:**
```bash
# Correct workflow for each test session:
1. mcp_playwright_browser_close()  # Clean slate  
2. mcp_playwright_browser_navigate("https://aura-asset-manager.vercel.app/")  # Fresh session
3. Authenticate with Google OAuth
4. Navigate to affected pages systematically
5. mcp_playwright_browser_console_messages()  # Check for errors after actions
6. mcp_playwright_browser_snapshot()  # Document UI state
7. Test specific functionality and verify results
```

**Error Detection:**
- Use `mcp_playwright_browser_console_messages()` after each major action
- Look for React context errors, network failures, import issues
- Check for API request/response problems

```javascript
// ✅ Version tracking pattern
export const VERSION_INFO = {
  version: 'v0.1XX',
  buildDate: '2024-XX-XX',
  deploymentId: 'feature-description',
  description: 'Summary of changes made'
}
```

#### ✅ Common Debugging Patterns
```bash
# ✅ Check for JavaScript errors in browser console
# Look for:
# - React context errors ("must be used within provider")
# - Network request failures (401, 404, 500)
# - Import resolution failures
# - CORS/CSP blocks

# ✅ Backend endpoint testing
# Use FastAPI auto-generated docs at /docs
# Test endpoints independently before frontend integration
```

## 🚨 Critical Failure Modes & Prevention

### Most Common Issues & Solutions

1. **UUID Lookup Failures**
   - **Symptom**: UI state "snap back," selections don't persist
   - **Cause**: String conversion of UUID objects in Python
   - **Fix**: Use direct UUID object comparison, never str(uuid)

2. **Import/Export Inconsistencies**
   - **Symptom**: Import errors, undefined service methods
   - **Cause**: Mixed default/named import patterns
   - **Fix**: Standardize on named exports + destructured imports

3. **API URL Mismatches**
   - **Symptom**: "Refused to connect" errors, 307 redirects
   - **Cause**: Trailing slash mismatches with FastAPI routes
   - **Fix**: Match frontend URLs exactly to backend route patterns

4. **Router Registration Forgotten**
   - **Symptom**: 404 errors on valid endpoints
   - **Cause**: New routers not added to main.py
   - **Fix**: Always register new routers in backend/main.py

5. **Context Provider Conflicts**
   - **Symptom**: "must be used within provider" errors
   - **Cause**: Duplicate or nested providers
   - **Fix**: Single provider at app root, check provider tree

### File Creation Verification

#### ✅ Always Verify File Content
```bash
# ✅ After creating/editing files, verify content exists
wc -l filename && head -3 filename
```

**Common failure:** Empty file creation → import errors → cascading failures

## 📝 Documentation & Maintenance

### Code Comments for Complex Logic

#### ✅ Critical Business Logic Comments
```javascript
/**
 * Targets API Service
 * 
 * CRITICAL: URL formatting must match FastAPI backend routes exactly:
 * - Root endpoints use NO trailing slash
 * - Mismatched URLs cause 307 redirects → HTTPS→HTTP downgrade
 * - CSP policies block HTTP requests → "Refused to connect" errors
 */
```

### Version Control Best Practices

#### ✅ Commit Message Pattern
```bash
git commit -m "Version: v0.1XX

type(scope): description

- Specific change 1
- Specific change 2"
```

## 🔄 Development Workflow

### Feature Development Cycle

1. **Backend**: Create endpoint + register router
2. **Service**: Create frontend service with proper patterns
3. **Component**: Integrate service with proper error handling
4. **Test**: Use `/docs` for API, browser console for frontend
5. **Deploy**: Push to GitHub, verify deployment
6. **Validate**: Live testing with browser dev tools

### Emergency Response Protocol

**When pages break after deployment:**
1. Check browser console for errors
2. Verify all imports resolve correctly  
3. Look for duplicate context providers
4. Test API endpoints via `/docs`
5. Check URL patterns match backend routes
6. Roll back if necessary, debug systematically

---

## 📚 Quick Reference

### Service Template
```javascript
export const featureService = {
  async getItems(config = {}) {
    const response = await apiClient.get('/feature/', config)  // Note trailing slash
    return response.data
  },
  async getItem(id, config = {}) {
    const response = await apiClient.get(`/feature/${id}/`, config)  // Trailing slash
    return response.data
  },
  async createItem(data, config = {}) {
    const response = await apiClient.post('/feature/', data, config)
    return response.data
  },
  async updateItem(id, data, config = {}) {
    const response = await apiClient.put(`/feature/${id}/`, data, config)
    return response.data
  },
  async deleteItem(id, config = {}) {
    const response = await apiClient.delete(`/feature/${id}/`, config)
    return response.data
  }
}
```

### Component Integration Template
```jsx
import { featureService } from '../services/feature.js'

const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.feature.list(),
  queryFn: ({ signal }) => featureService.getItems({ signal }),
  enabled: !!session
})
```

### Backend Router Template
```python
# backend/app/api/v1/feature.py
router = APIRouter()

@router.get("/")
async def get_items():
    return {"items": []}

# backend/main.py
app.include_router(feature.router, prefix="/api/v1/feature", tags=["feature"])
```

---

## 📚 Additional Resources

For comprehensive guidance on feature deprecation, see:
- `.github/special-instructions/Feature-Deprecation.md` - Complete guide based on annuities removal lessons

---

*This document is living documentation - update when new patterns or failure modes are discovered.*