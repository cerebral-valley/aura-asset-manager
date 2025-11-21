---
name: fastapi-review
description: Review FastAPI endpoint for security, authentication, and best practices
---

# Task
Review the selected FastAPI endpoint code for:

## Security
- [ ] Authentication with `get_current_user` dependency
- [ ] Authorization checks (user owns the resource)
- [ ] Input validation with Pydantic schemas
- [ ] SQL injection prevention (SQLAlchemy ORM usage)
- [ ] CORS configuration compliance

## Code Quality
- [ ] Proper error handling with HTTP status codes
- [ ] Database session management (no leaks)
- [ ] Consistent response schemas
- [ ] Router registration in `backend/main.py`
- [ ] URL trailing slash pattern (list: `/`, detail: `/{id}/`)

## Architecture
- [ ] Multi-tenancy with `user_id` foreign key
- [ ] UUID primary keys
- [ ] JSONB metadata for flexible fields
- [ ] Proper service layer separation if needed

Provide specific code suggestions with explanations.
