// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.146',
  buildDate: '2025-01-28',
  deploymentId: 'complete-goals-system',
  description: 'Complete Goals system implementation: CRUD operations, goal completion, progress tracking, asset selection fixes, comprehensive UI enhancements'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
