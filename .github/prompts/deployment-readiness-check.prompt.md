---
name: deploy-check
description: Pre-deployment checklist for code changes
---

# Task
Verify the code is ready for deployment:

## Backend Checklist (Railway)
- [ ] Router registered in `backend/main.py`
- [ ] Environment variables documented
- [ ] CORS origins include Vercel preview URLs
- [ ] Database migrations created (if schema changed)
- [ ] Security middleware configured
- [ ] Health check endpoint works
- [ ] Dockerfile builds successfully

## Frontend Checklist (Vercel)
- [ ] All imports resolve correctly (named exports)
- [ ] API URLs match backend routes (trailing slashes)
- [ ] Environment variables set in Vercel
- [ ] Build succeeds locally: `npm run build`
- [ ] No console errors in production build
- [ ] Version updated in `frontend/src/version.js`

## Testing Checklist
- [ ] Local testing completed (backend + frontend)
- [ ] FastAPI `/docs` endpoint tests pass
- [ ] Browser console shows no errors
- [ ] Authentication flow works
- [ ] Cross-feature validation (no regressions)

## Version Tracking
- [ ] `frontend/src/version.js` incremented
- [ ] Clear commit message with version number
- [ ] Deployment description added

## Post-Deploy Verification Plan
- [ ] Test live deployment with Playwright MCP
- [ ] Verify version number in dashboard (top-right)
- [ ] Test new features end-to-end
- [ ] Monitor Railway logs for errors
- [ ] Check browser console on live site

Generate a deployment checklist for the selected changes.
