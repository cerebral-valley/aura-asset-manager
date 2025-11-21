---
name: debug-prod
description: Systematic debugging for production problems
---

# Task
Help debug this production issue systematically:

## Information Gathering
1. **Reproduce the issue**: Exact steps to trigger the problem
2. **Browser console**: JavaScript errors, network failures
3. **Network tab**: Failed API requests (status codes, payloads)
4. **Railway logs**: Backend errors, stack traces
5. **Version check**: Dashboard top-right corner version number

## Common Failure Modes

### Frontend Issues
- [ ] Import errors (named vs default export mismatch)
- [ ] Context provider conflicts ("must be used within provider")
- [ ] API URL mismatches (trailing slash problems → 307 redirects)
- [ ] Missing `enabled: !!session` causing pre-auth API calls
- [ ] CORS/CSP blocks (HTTP downgrade from HTTPS)

### Backend Issues
- [ ] Router not registered in `backend/main.py` → 404 errors
- [ ] UUID string conversion breaking lookups
- [ ] Missing authentication dependency
- [ ] Database session leaks
- [ ] CORS origin not whitelisted

### Deployment Issues
- [ ] Vercel build failed (check build logs)
- [ ] Railway deployment failed (check deployment logs)
- [ ] Environment variables missing
- [ ] Stale cache (version mismatch)

## Debugging Steps
1. Check browser console for exact error messages
2. Verify API endpoints work via `/docs`
3. Test authentication flow independently
4. Check Railway logs for backend exceptions
5. Verify version matches latest deployment
6. Test in incognito mode (rule out cache issues)

## Root Cause Analysis
- What changed in the last deployment?
- Does the issue occur locally?
- Is it specific to certain users/data?
- Can it be reproduced consistently?

Analyze the issue and provide step-by-step debugging plan.
