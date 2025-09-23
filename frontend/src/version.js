// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.138',
  buildDate: '2024-12-21',
  deploymentId: 'liquid-assets-fix',
  description: 'Fixed liquid assets endpoint by filtering asset types instead of non-existent is_liquid column'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}