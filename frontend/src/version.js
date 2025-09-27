// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.132',
  buildDate: '2025-09-27', 
  deploymentId: 'vercel-assets-refresh-hotfix',
  description: 'Ensure assets route rewrites fallback to SPA while leaving hashed static bundles untouched'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
