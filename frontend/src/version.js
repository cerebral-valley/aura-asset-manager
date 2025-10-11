// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.166',
  buildDate: '2025-10-11',
  deploymentId: 'fix-modal-theme-and-file-upload',
  description: 'Fix modal theme styling and file upload dialog issues'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

