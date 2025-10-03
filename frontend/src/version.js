// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.149',
  buildDate: '2025-10-04',
  deploymentId: 'backend-goals-api',
  description: 'Backend Goals API: Created SQLAlchemy UserGoal model, Pydantic schemas (GoalBase, GoalCreate, GoalUpdate, GoalResponse), and full CRUD endpoints (GET /, GET /{id}/, POST /, PUT /{id}/, DELETE /{id}/) with proper trailing slashes and authentication. Registered goals router in main.py.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

