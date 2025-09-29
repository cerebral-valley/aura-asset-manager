// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.137',
  buildDate: '2024-12-29',
  deploymentId: 'theme-persistence-fix',
  description: 'Implemented theme persistence across login sessions, database integration, matrix optimization'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
