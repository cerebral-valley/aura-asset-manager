// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.103',
  buildDate: '2025-09-16',
  deploymentId: 'fix-infinite-loop-version-tracking',
  description: 'Remove commit hash from version tracking to prevent infinite loop'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}