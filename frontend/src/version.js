// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.148',
  buildDate: '2024-12-19',
  deploymentId: 'fastapi-redirect-fix',
  description: 'Fixed FastAPI redirect_slashes to prevent HTTP downgrades and CSP violations - resolves assets API connection issues'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
