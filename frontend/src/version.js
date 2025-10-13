// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.175',
  buildDate: '2025-10-13',
  deploymentId: 'sentry-production-dsn',
  description: 'Update Sentry integration with production DSN for real error tracking'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

