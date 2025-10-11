// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.167',
  buildDate: '2025-01-24',
  deploymentId: 'backend-document-upload-debug',
  description: 'Enhanced backend document upload with comprehensive debug logging and migration'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

