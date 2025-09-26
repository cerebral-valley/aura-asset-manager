// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.170',
  buildDate: '2024-12-27',
  deploymentId: 'fix-uuid-import',
  description: 'Fixed missing UUID import in targets.py for asset selections endpoint'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}