// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.171',
  buildDate: '2025-01-13',
  deploymentId: 'insurance-document-getDocuments-fix',
  description: 'Fix missing getDocuments endpoint for insurance document upload feature'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

