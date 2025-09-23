// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.147',
  buildDate: '2025-09-23',
  deploymentId: 'trailing-slash-fix',
  description: 'CRITICAL FIX: Added trailing slashes back to frontend service URLs to match FastAPI backend routes and prevent HTTPS→HTTP redirect CSP violations'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}