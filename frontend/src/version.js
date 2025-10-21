// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.6',
  buildDate: '2025-10-21',
  deploymentId: 'userguide-enhancements-search-index',
  description: 'UserGuide enhancements: reduced sidebar width, added search functionality, comprehensive index, removed release notes'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
