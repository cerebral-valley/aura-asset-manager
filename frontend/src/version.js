// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.169',
  buildDate: '2025-10-11',
  deploymentId: 'insurance-document-upload',
  description: 'Add comprehensive insurance document upload system with PDF/DOCX support, user folder isolation, and full CRUD operations'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

