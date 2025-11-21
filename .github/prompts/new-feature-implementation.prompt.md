---
name: new-feature
description: Complete workflow for adding new features
---

# Task
Guide me through implementing this new feature following the project's architecture:

## Phase 1: Backend Development
- [ ] Create database model in `backend/app/models/[feature].py`
  - UUID primary key: `id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)`
  - User FK: `user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))`
  - JSONB metadata if needed
- [ ] Create Pydantic schemas in `backend/app/schemas/[feature].py`
  - `[Feature]Base`, `[Feature]Create`, `[Feature]Update`, `[Feature]Response`
- [ ] Create API endpoint in `backend/app/api/v1/[feature].py`
  - Use proper trailing slash pattern
  - Add auth dependency: `current_user: User = Depends(get_current_user)`
  - Implement CRUD operations
- [ ] **CRITICAL**: Register router in `backend/main.py`
- [ ] Test endpoint via `/docs`

## Phase 2: Frontend Service Layer
- [ ] Create service file in `frontend/src/services/[feature].js`
  - Use named export: `export const featureService = { ... }`
  - All methods accept optional `config = {}`
  - Use correct URL patterns (trailing slashes)
- [ ] Add query keys in `frontend/src/lib/queryKeys.js`
- [ ] Add to queryUtils for real-time sync if needed

## Phase 3: Component Development
- [ ] Create page component in `frontend/src/pages/[Feature]Page.jsx`
  - Use `useAuth()` for authentication
  - TanStack Query with `enabled: !!session`
  - Loading states with `<Loading pageName="Feature" />`
- [ ] Add navigation links (Sidebar.jsx, MobileDrawer.jsx)
- [ ] Create route in `frontend/src/App.jsx`

## Phase 4: Testing & Deployment
- [ ] Local testing (backend + frontend)
- [ ] Update version in `frontend/src/version.js`
- [ ] Commit and push to GitHub
- [ ] Live deployment testing with Playwright MCP
- [ ] Cross-feature validation

Generate a step-by-step implementation plan for this feature.
