// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.176',
  buildDate: '2025-01-26', 
  deploymentId: 'cors-fix-deployment',
  description: 'CORS configuration fix to resolve API blocking issues preventing liquid asset selection functionality'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}