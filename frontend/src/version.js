// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.143',
  buildDate: '2024-09-30',
  deploymentId: 'goals-feature-backend-phase',
  description: 'Phase 1-4: Complete backend API and services for Goals feature - database schema, models, schemas, endpoints, and frontend service layer'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
