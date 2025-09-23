// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.133',
  buildDate: '2024-12-21',
  deploymentId: 'target-page-complete-implementation',
  description: 'Complete Target page implementation per TARGET_PAGE.md: persistent asset selection, CRUD operations, allocation management, target logs, comprehensive testing'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}