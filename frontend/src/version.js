// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.170',
  buildDate: '2025-10-12',
  deploymentId: 'insurance-docs-simplified',
  description: 'Simplified insurance document upload to replicate exact Assets pattern - same bucket, same validation, same UI structure'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

