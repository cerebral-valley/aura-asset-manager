// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.164',
  buildDate: '2025-10-11',
  deploymentId: 'add-edit-buttons-access-documents',
  description: 'Critical UI Fix: Added Edit buttons to Assets table to make document upload feature accessible to users. The feature was fully implemented but lacked UI access points.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

