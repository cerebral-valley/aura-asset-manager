// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.19',
  buildDate: '2025-10-24',
  deploymentId: 'user-guide-pdf-fix',
  description: 'Ensure User Guide PDF download captures the complete in-app documentation'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
