---
name: db-optimize
description: Analyze SQLAlchemy queries for performance and correctness
---

# Task
Review the selected database query code for:

## Query Efficiency
- [ ] N+1 query problems (use `joinedload` or `selectinload`)
- [ ] Unnecessary database round-trips
- [ ] Proper indexing on frequently queried columns
- [ ] Pagination for large result sets
- [ ] SELECT only needed columns (avoid `SELECT *`)

## UUID Handling (CRITICAL)
- [ ] **NEVER convert UUIDs to strings for comparison**
- [ ] Direct UUID object comparison: `asset.id == selection.asset_id`
- [ ] **NOT**: `str(asset.id) == str(selection.asset_id)` (breaks equality)

## SQLAlchemy Best Practices
- [ ] Session management (proper commit/rollback)
- [ ] Filter by `user_id` for multi-tenancy
- [ ] Use ORM relationships instead of manual joins
- [ ] Proper exception handling for database errors
- [ ] JSONB queries for metadata fields

## Security
- [ ] No raw SQL with user input (SQL injection risk)
- [ ] Parameterized queries via SQLAlchemy ORM
- [ ] Proper user authorization checks

## Common Patterns
```python
# ✅ CORRECT - UUID comparison
selection_lookup = {sel.asset_id: sel.is_selected for sel in user_selections}
asset.is_selected = selection_lookup.get(asset.id, False)

# ❌ WRONG - String conversion breaks lookup
selection_lookup = {str(sel.asset_id): sel.is_selected for sel in user_selections}
asset.is_selected = selection_lookup.get(str(asset.id), False)
```

Identify issues and provide optimized alternatives.
