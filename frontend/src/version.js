// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.149',
  buildDate: '2025-01-04',
  deploymentId: 'env-priority-fix',
  description: 'Removed .env.local to ensure .env.production HTTPS URLs take precedence for production deployment'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}