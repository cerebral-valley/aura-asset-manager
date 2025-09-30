// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.143',
  buildDate: '2025-05-15',
  deploymentId: 'complete-annuity-deprecation',
  description: 'Removed final annuity references from useAuth hook - annuities feature completely deprecated'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

