// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218',
  buildDate: '2025-10-19',
  deploymentId: 'fix-insurance-hierarchy-trailing-slash',
  description: 'FIX: Insurance hierarchy endpoint trailing slash causing 307 redirects - removed trailing slash from /hierarchy/ to /hierarchy to match codebase pattern and prevent HTTPS downgrade'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
