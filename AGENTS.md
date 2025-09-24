# Aura Asset Manager - AI Coding Instructions

## 🚨 CRITICAL: File Operations
**Always verify files contain actual code after creation/editing:**
```bash
wc -l filename && head -3 filename  # Verify content exists
```

## Architecture Overview
**Full-Stack Financial Platform**: FastAPI backend + Vite/React frontend + Supabase auth + PostgreSQL
- **Backend**: `/backend/` - FastAPI with SQLAlchemy ORM, Pydantic schemas, deployed on Railway
- **Frontend**: `/frontend/` - Vite + React + Axios + React Router, deployed on Vercel
- **Database**: Supabase-managed PostgreSQL with UUID primary keys
- **Deployment**: Railway (backend) + Vercel (frontend), Docker containers for Railway

### API Integration Pattern
1. Create `backend/app/api/v1/[feature].py`
2. Register in `backend/main.py`: `app.include_router(feature.router, prefix="/api/v1/feature")`
3. Create `frontend/src/services/[feature].js` using `apiClient`
4. Test via `/docs` auto-generated FastAPI docs

### Authentication Flow
- **Frontend**: `useAuth()` hook → Supabase session → Bearer token
- **API**: `apiClient` (Axios) auto-injects tokens via interceptors
- **Backend**: JWT validation via Supabase service key

### Database Patterns
- **Models**: SQLAlchemy with UUID primary keys in `backend/app/models/`
- **Multi-tenancy**: Foreign keys to `users.id`
- **Flexible data**: JSONB `metadata` columns for asset-specific fields

### Container Networking
- **Local**: `localhost:8000` (backend), `localhost:5173` (frontend)
- **Docker**: `backend:8000` (not localhost)
- **Railway**: Empty `railway.json` forces Docker detection

### Deployment Architecture
- **Backend**: Railway with Docker containers, auto-deploys from main branch
- **Frontend**: Vercel with automatic preview deployments from PRs
- **CORS**: Dynamic origins for Vercel preview URLs (`*.vercel.app`)
- **Environment Variables**: Railway for backend config, Vercel for frontend config

### Critical Files
- `backend/main.py` - Router registration required for all new endpoints
- `frontend/src/lib/api.js` - Axios instance with auth interceptors
- `backend/app/core/config.py` - Environment-aware Pydantic settings

### MCP Configuration & Usage
**🔧 Model Context Protocol (MCP) Tools Available:**
- **Playwright MCP or Chrome-DevTools MCP**: Browser automation for live testing
- **Supabase MCP**: Database operations and queries
- **Vercel MCP**: Frontend deployment monitoring (when needed)
- **Configuration**: Located in `.vscode/mcp.json`

**📋 MCP Usage Guidelines:**
- ✅ **USE MCP**: For browser testing, database operations, structured operations
- ✅ **Live Testing**: Playwright MCP or Chrome-DevTools MCP for comprehensive end-to-end testing
- 🚫 **Railway Deployment**: Manual log analysis - logs will be provided by user

### Development Commands
```bash
# Backend: cd backend && /.../aura-asset-manager/.venv/bin/python -m uvicorn main:app --reload --port 8002
# Frontend: cd frontend && npm run dev
# Full stack: docker-compose up --build
```

### Post-Push Deployment Monitoring
After any GitHub push, **deployment verification approach**:

**� Railway Backend Deployment:**
- **Manual Log Analysis**: User will provide Railway deployment/build logs for analysis
- **No CLI/MCP required**: Avoid using `railway logs` or Railway MCP tools
- **Health Check Only**: `curl -s -w "%{http_code}" [URL]` for service verification if needed

**🔍 Vercel Frontend Deployment:**  
- **Quick Status Check**: `vercel ls` for recent deployments if needed
- **Health Check**: `curl -s -w "%{http_code}" [URL]` for service verification
- **Manual Analysis**: User may provide build logs if issues arise

**📋 Log Analysis Focus:**
- **Container Startup**: Check for "Starting Container" and server process initialization
- **API Health**: Look for successful HTTP responses (200 OK)
- **Error Detection**: Identify deployment failures, runtime exceptions, or configuration issues
- **Performance**: Note response times and database query efficiency

**Report deployment status after analysis:**
- ✅ SUCCESS: Services healthy, no errors in provided logs
- ❌ FAILED: [Specific issue found] - [recommendation for fix]

### Domain Models
**Financial platform**: Assets (real_estate, stocks, annuities), Insurance, Transactions
- UUID primary keys, JSONB metadata, payment schedules for annuities

## Project Mission & Workflow

### Project Mission
**Personal financial sanctuary platform** - Help users visualize and feel secure about their financial foundation, focusing on peace of mind over complex metrics/budgeting.

### Feature Development Cycle
1. **Backend**: Create endpoint + register router in `main.py`
2. **Frontend**: Create service + component + route  
3. **Test**: Use `/docs` for API, local dev server for UI
4. **Deploy**: Railway detects Docker via empty `railway.json`

### Common Pitfalls
- Forgot router registration → 404 errors
- Hardcoded localhost → breaks in Docker
- Empty file creation → import errors
- Missing auth token → 401 errors

### Asset Types & UX Focus
- **Asset Types**: Real estate, stocks, annuities, insurance with JSONB metadata
- **UX Principle**: Simplicity over complexity, visual security, peace of mind
- **Technical**: Supabase PostgreSQL, UUID primary keys, Railway deployment

## 🔬 PROVEN DEBUGGING & TESTING METHODOLOGY

### Phase 1: Deep Analysis & Planning
1. **Use Sequential Thinking Tool First**: Break down complex problems systematically
2. **Root Cause Analysis**: Focus on underlying issues, not just symptoms
3. **Create TODO Lists**: Track progress with markdown checkboxes for accountability

### Phase 2: Code Implementation
1. **Incremental Changes**: Make small, testable modifications
2. **Context Architecture**: Watch for duplicate providers/contexts (major React pitfall)
3. **Verify File Content**: Always check files contain actual code after creation/editing

### 🚨 CRITICAL: Automatic GitHub Push After Code Completion
**OVERRIDE Beast Mode Instructions**: Unlike general Beast Mode guidelines, for THIS PROJECT always push code to GitHub after completing any coding task:

```bash
git add .
git commit -m "Clear descriptive commit message"
git push origin main
```

**Reasoning**: 
- Railway auto-deploys from main branch - immediate deployment verification needed
- Vercel creates preview deployments - essential for live testing
- Manual deployment logs analysis requires actual deployments
- Live testing with Playwright MCP or Chrome-DevTools MCP requires deployed changes

**This overrides any Beast Mode instruction about asking permission before Git operations.**

## 🏷️ CRITICAL: Version Tracking & Deployment Verification

### Mandatory Version Management
**EVERY GitHub push MUST include version tracking:**

1. **Update Version File**: Always update `frontend/src/version.js` before committing:
   ```javascript
   export const VERSION_INFO = {
     version: 'v0.1XX',           // Increment XX for each deployment
     buildDate: 'YYYY-MM-DD',     // Current date
     deploymentId: 'feature-name', // Brief description
     description: 'Description of changes'
   }
   ```

2. **Commit Message Format**:
   ```bash
   git commit -m "Version: v0.1XX

   type(scope): description
   
   - Detailed change 1
   - Detailed change 2"
   ```

3. **Version Increment Rules**:
   - Start from v0.101 and increment by 1 for each deployment
   - Major features: increment by 10 (v0.110, v0.120, etc.)
   - Hotfixes: increment by 1 (v0.101, v0.102, etc.)

### Deployment Verification Protocol
**After every push, use MCP Playwright or Chrome-DevTools MCP to verify deployment:**

1. **Navigate to Dashboard**: Check version display in top-right corner
2. **Version Verification**: Confirm new version number is displayed
3. **Feature Testing**: Test the specific changes made
4. **Screenshot Evidence**: Take screenshot showing new version deployed

**Version Display Location**: 
- Dashboard page, top-right corner: `v0.1XX`
- Visible to user as deployment verification
- Helps distinguish old vs new deployments during testing

### Phase 3: Deployment Verification (CRITICAL)
**After every GitHub push, deployment analysis workflow:**

**� Manual Log Analysis Approach:**
- **Railway Logs**: User will provide Railway deployment/build logs for analysis
- **Log Focus**: Container startup, API responses, error detection, performance metrics
- **No Automated Tools**: Do not use `railway logs`, Railway MCP, or CLI commands
- **Health Checks**: Optional `curl` health checks for service verification only

**🔍 Log Analysis Checklist:**
- ✅ **Container Status**: "Starting Container" and server initialization
- ✅ **API Health**: HTTP 200 responses, endpoint functionality
- ✅ **Error Detection**: Runtime exceptions, configuration issues, build failures
- ✅ **Database**: Query performance, connection status, data validation
- ✅ **CORS/Auth**: Proper configuration for production environment

**🚨 ANALYSIS EFFICIENCY REQUIREMENT:**
- **Focus on Issues**: Identify specific problems from provided logs
- **Actionable Insights**: Provide clear recommendations for any problems found
- **Performance Notes**: Comment on response times and system health
- **No CLI Execution**: All analysis based on user-provided log content

**Report deployment status after analysis:**
- ✅ SUCCESS: Services healthy, no errors in provided logs
- ❌ FAILED: [Service] failed - [specific error from logs]

### Phase 4: Live Application Testing (MANDATORY)
**Never rely on local testing alone - always test live deployment:**

```bash
# Use Playwright MCP for comprehensive live testing
mcp_playwright_browser_navigate("https://aura-asset-manager.vercel.app/")
mcp_playwright_browser_snapshot()  # Get accessibility snapshot
mcp_playwright_browser_console_messages()  # Check for JS errors
```

**🚨 CRITICAL: Browser Session Management**
- **ALWAYS use Playwright MCP ONLY**: Never mix Chrome DevTools MCP and Playwright MCP in the same session
- **Close existing sessions FIRST**: Always use `mcp_playwright_browser_close()` before starting new tests
- **Fresh session for each major test**: Quit and restart browser to ensure clean state
- **Session isolation**: Each test should start with clean browser state
- **Use console logs**: `mcp_playwright_browser_console_messages()` to get error details automatically
- **Visual verification**: `mcp_playwright_browser_snapshot()` for page state documentation

**Testing Protocol - ALWAYS FOLLOW THIS ORDER:**
1. **Close existing sessions**: `mcp_playwright_browser_close()` if any browser is running  
2. **Navigate fresh**: `mcp_playwright_browser_navigate("https://aura-asset-manager.vercel.app/")`
3. **Authenticate**: Use Google OAuth on live site for realistic user flow
4. **Navigate systematically**: Test affected pages/features in sequence
5. **Console monitoring**: Use `mcp_playwright_browser_console_messages()` after each major action
6. **Visual verification**: Use `mcp_playwright_browser_snapshot()` to confirm UI state
7. **Cross-feature testing**: Verify changes don't break unrelated features

### 🧪 COMPREHENSIVE TESTING METHODOLOGY

#### Feature Development Testing Protocol
**For new features and major changes:**
1. **Feature-Specific Testing**: Test EVERY aspect of the new feature
   - Create realistic test scenarios using actual data
   - Test all user interaction paths (happy path + edge cases)
   - Verify all buttons, modals, forms, and navigation elements
   - Test responsive behavior across different screen sizes
   
2. **Multi-Asset Testing**: When testing financial features
   - Select multiple assets with different types (stocks, crypto, bonds, ETFs)
   - Verify calculations with various combinations of asset values
   - Test edge cases: very large numbers, zero values, negative values
   - Validate currency formatting and number parsing

3. **Complete User Journey Testing**: Don't just navigate to pages
   - **Target Page Example**: Navigate → Select 3+ assets → Create net worth target → Create 4 custom goals → Verify all calculations → Test modals → Check allocation overview → Review target logs
   - Take screenshots at each major step for evidence
   - Monitor browser console logs throughout entire journey

#### Bug Resolution Testing Protocol  
**For reported issues and bug fixes:**
1. **Reproduce the Exact Issue**: 
   - Follow user's exact steps to reproduce the problem
   - Document console errors, network failures, UI glitches
   - Take screenshots/video of the bug occurring

2. **Iterative Testing with Browser Console**:
   ```bash
   # After each code change:
   1. Deploy changes
   2. Open browser developer tools
   3. Navigate to affected page
   4. Perform the problematic action
   5. Check console for errors/warnings
   6. If issues persist, analyze console logs and iterate
   7. Repeat until issue is completely resolved
   ```

3. **Verification Testing**:
   - Test the specific reported issue is fixed
   - Test related functionality wasn't broken
   - Test the same issue across different browsers/devices
   - Verify fix works with different user data scenarios

#### Deployment Testing Standards
**After every GitHub push with feature changes:**
1. **Authentication & Navigation Baseline**:
   - Authenticate via Google OAuth
   - Navigate to all major pages (Dashboard, Assets, Targets, etc.)
   - Verify navigation works and pages load without console errors

2. **Feature-Specific Deep Testing**:
   - **For Target Page Changes**: Select multiple liquid assets, verify totals calculate correctly, create net worth target, create multiple custom targets, test all modals and buttons
   - **For Asset Page Changes**: Add/edit/delete assets, test all asset types, verify calculations update across application
   - **For Dashboard Changes**: Verify all charts render, test theme switching, check responsive design

3. **Browser Console Monitoring**:
   ```bash
   # Check these at every step:
   - No JavaScript errors (red console messages)
   - No failed network requests (404, 500 errors)
   - No React warnings or context errors
   - Proper data loading and state management
   ```

4. **Evidence Collection**:
   - Take full-page screenshots of working features
   - Record console output when issues are found
   - Document successful test scenarios with data
   - Save evidence in `.playwright-mcp/` or `.chrome-devtools-mcp/` folder with descriptive names

#### Testing Failure Recovery Protocol
**When live testing reveals issues:**
1. **Don't Report Success Prematurely**: If any aspect of the feature doesn't work as expected, continue iterating
2. **Use Browser Console for Debugging**: Check for JavaScript errors, network failures, React warnings
3. **Test with Different Data**: Try various combinations of user data, asset values, target amounts
4. **Iterate Until Perfect**: Make code changes, deploy, test again until all functionality works flawlessly
5. **Document What Was Fixed**: Note specific issues found during testing and how they were resolved

#### Testing Quality Standards
- **✅ GOOD**: "Tested target creation with $50,000 vacation goal, verified allocation calculations update correctly, checked browser console shows no errors"
- **❌ BAD**: "Navigated to targets page, looks like it's working"
- **✅ GOOD**: "Selected 3 assets (Bitcoin £100k, Apple £18.5k, Treasury Bond £52k), total shows £170,500, created net worth target £500k, progress bar shows 34%, monthly growth calculation displays £7,963/month"
- **❌ BAD**: "Asset selection works, target creation works"

### Phase 5: Comprehensive Validation
**For theme/UI changes specifically:**
1. Test ALL theme options (not just the changed ones)
2. Test light AND dark mode for each theme
3. Verify charts/visualizations render correctly
4. Check for React Context errors in console
5. Validate responsive design on different viewport sizes

### Critical Lessons Learned
- **ThemeProvider Conflicts**: Multiple React contexts cause "must be used within provider" errors
- **OKLCH vs HSL**: Chart libraries often require HSL format for colors
- **Context Calls**: Minimize useContext calls - pass theme data through props when possible
- **Live Testing**: Local development can mask deployment-specific issues
- **Console Logs**: Browser console often reveals issues not visible in UI
- **Manual Log Analysis**: User provides deployment logs for expert analysis
- **Timeout Discipline**: Never run deployment commands without timeouts (max 60s)

### Emergency Response Protocol
**When pages break after deployment:**
1. Check browser console for React errors
2. Verify all imports resolve correctly
3. Look for duplicate context providers
4. Test API endpoints independently via `/docs`
5. Roll back if necessary, debug systematically
