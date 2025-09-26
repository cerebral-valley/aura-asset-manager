// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.178',
  buildDate: '2025-01-26', 
  deploymentId: 'targets-feature-removal',
  description: 'Complete removal of targets feature: removed backend models, API endpoints, frontend components, routes, navigation, query keys, and documentation'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}