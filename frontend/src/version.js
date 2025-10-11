// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.174',
  buildDate: '2025-01-28',
  deploymentId: 'sentry-dependency-fix',
  description: 'Fix missing @sentry/react package dependency - resolves build failures'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

