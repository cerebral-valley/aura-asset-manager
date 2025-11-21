---
name: service-review
description: Review service file for API integration patterns
---

# Task
Review the selected service file for:

## Export Pattern (CRITICAL)
- [ ] **Named export**: `export const serviceExample = { ... }`
- [ ] **NOT default export** (causes import inconsistencies)
- [ ] All imports use destructuring: `import { service } from '../services/feature.js'`

## API URL Formatting (CRITICAL)
- [ ] **List endpoints**: Trailing slash `/assets/`, `/transactions/`
- [ ] **Detail endpoints**: Trailing slash `/assets/{id}/`, `/transactions/{id}/`
- [ ] **Action endpoints**: NO trailing slash `/dashboard/summary`
- [ ] URLs match backend FastAPI routes exactly (check `backend/app/api/v1/[feature].py`)

## Method Signatures
- [ ] Optional config parameter: `async getData(params = {}, config = {})`
- [ ] Config forwarded to axios for abort signals
- [ ] Proper error re-throwing: `catch (error) { throw error }`

## Error Handling
- [ ] Try-catch blocks in all async methods
- [ ] Console.error for debugging
- [ ] Re-throw errors for component handling
- [ ] No premature error swallowing

## Standard CRUD Pattern
```javascript
export const featureService = {
  async getItems(config = {}) { /* GET /feature/ */ },
  async getItem(id, config = {}) { /* GET /feature/{id}/ */ },
  async createItem(data, config = {}) { /* POST /feature/ */ },
  async updateItem(id, data, config = {}) { /* PUT /feature/{id}/ */ },
  async deleteItem(id, config = {}) { /* DELETE /feature/{id}/ */ }
}
```

Check against this pattern and suggest fixes.
