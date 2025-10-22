// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.222.0',
  buildDate: '2025-01-22',
  deploymentId: 'user-guide-enhancements',
  description: 'User Guide PDF download, Index moved to top, 8 tools comprehensive documentation added'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
