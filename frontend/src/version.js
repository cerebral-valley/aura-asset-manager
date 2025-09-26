// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.177',
  buildDate: '2025-01-26', 
  deploymentId: 'backend-import-fix',
  description: 'Fixed SQLAlchemy import error: removed UserAssetSelection from __init__.py imports that was causing 502 backend crashes'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}