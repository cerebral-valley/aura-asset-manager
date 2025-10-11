// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.165',
  buildDate: '2025-01-03',
  deploymentId: 'fix-document-upload-session-check',
  description: 'Fix AssetDocumentUpload component session blocking issue - remove unnecessary authentication check that prevented upload interface from rendering'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

