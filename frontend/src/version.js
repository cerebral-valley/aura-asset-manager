// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.173',
  buildDate: '2025-10-12',
  deploymentId: 'sentry-integration-debug',
  description: 'Debug Sentry integration - add comprehensive logging and test button visibility'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

