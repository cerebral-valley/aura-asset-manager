// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.144',
  buildDate: '2025-09-30',
  deploymentId: 'final-annuity-cleanup',
  description: 'Removed final annuity schema fields and query keys - annuities fully deprecated'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

