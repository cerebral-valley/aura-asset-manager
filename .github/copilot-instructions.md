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

### Development Commands
```bash
# Backend: cd backend && /.../aura-asset-manager/.venv/bin/python -m uvicorn main:app --reload --port 8002
# Frontend: cd frontend && npm run dev
# Full stack: docker-compose up --build
```

### Post-Push Deployment Monitoring
After any GitHub push, **always verify deployment status**:
```bash
# Railway backend status
railway logs  # Check recent deployment logs
railway status  # Check service status

# Vercel frontend status  
vercel ls  # List recent deployments
vercel logs [deployment-url]  # Get deployment logs

# Report findings (don't troubleshoot, just report)
# ✅ SUCCESS: Backend deployed, logs show server running
# ❌ FAILED: Frontend build error in logs, needs investigation
```

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

### Phase 3: Deployment Verification (CRITICAL)
**After every GitHub push, ALWAYS verify deployments:**

```bash
# Backend Railway Status
railway logs --build    # Check build logs for errors
railway logs --app      # Check runtime logs
curl -s "https://[app].up.railway.app/docs" | head -10  # API health check

# Frontend Vercel Status  
vercel ls                # List recent deployments
vercel logs [deployment] # Check build/runtime logs
```

**Report deployment status before proceeding:**
- ✅ SUCCESS: Both services deployed, logs clean
- ❌ FAILED: [Service] failed - [specific error from logs]

### Phase 4: Live Application Testing (MANDATORY)
**Never rely on local testing alone - always test live deployment:**

```bash
# Use Playwright MCP for comprehensive live testing
mcp_playwright_browser_navigate("https://aura-asset-manager.vercel.app/")
mcp_playwright_browser_snapshot()  # Get accessibility snapshot
mcp_playwright_browser_console_messages()  # Check for JS errors
```

**Testing Protocol:**
1. **Authenticate**: Use Google OAuth on live site for realistic user flow
2. **Navigate**: Test affected pages/features systematically  
3. **Console Analysis**: Monitor browser console for errors during navigation
4. **Visual Verification**: Take screenshots of key functionality working
5. **Cross-Feature Testing**: Verify changes don't break unrelated features

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

### Emergency Response Protocol
**When pages break after deployment:**
1. Check browser console for React errors
2. Verify all imports resolve correctly
3. Look for duplicate context providers
4. Test API endpoints independently via `/docs`
5. Roll back if necessary, debug systematically
