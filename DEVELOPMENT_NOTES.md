# Aura Asset Manager - Development Notes

## 🚀 Deployment Learnings

### Railway Priority (CRITICAL):
- `railway.json` (Docker) > `package.json` (Node.js detection) > `nixpacks.toml`
- **Never remove railway.json** - causes Node.js misdetection
- Working commit reference: `160ae14` (pre-Profile implementation)

### Container Networking:
- Local: `http://localhost:8000/api/v1`  
- Docker: `http://backend:8000/api/v1`
- Production: Environment-specific URLs via `getApiBaseUrl()`

## 🎨 UI/UX Patterns

### Component Structure:
- Always implement on creation (no empty placeholders)
- Use consistent error boundaries and loading states
- Shadcn/UI components for consistency

### Data Flow:
- React Context for auth state
- Custom hooks for API operations  
- Supabase for data persistence

## 📊 Database Schema Notes

### Critical Tables:
- `users` - Auth and profile data
- `assets` - Financial asset tracking
- `annuities` - Payment schedule calculations
- `countries` - Reference data for profile setup

### Migration Pattern:
- Numbered files: `001_`, `002_`, etc.
- Always test locally before deploy
- Supabase migrations auto-apply on deploy

## ⚠️ Common Pitfalls Resolved

1. **Empty File Creation** - Always implement immediately
2. **API Registration** - Must add to `main.py` router
3. **Docker Environment** - Container service names vs localhost
4. **Requirements Management** - Update immediately after pip install
5. **CORS Configuration** - Add new frontend origins when needed

## 🔧 Local Development Setup

```bash
# Backend
cd backend && source ../.venv/bin/activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Frontend  
cd frontend && npm run dev

# Docker (Full Stack)
docker-compose up --build
```

## 📝 Next Implementation Guidelines

- Profile page: Extend existing placeholder with country selection
- Asset management: Build on existing CRUD patterns
- PDF export: Maintain existing jsPDF integration
- Authentication: Extend current JWT + Supabase pattern
