// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.143',
  buildDate: '2025-01-13',
  deploymentId: 'cors-wildcard-temp',
  description: 'TEMPORARY: Using CORS wildcard to test asset selection functionality - will revert to secure config after testing'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}