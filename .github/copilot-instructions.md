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
