// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.163',
  buildDate: '2025-10-11',
  deploymentId: 'fix-import-path-useauth',
  description: 'Hotfix: Fixed import path for useAuth in AssetDocumentUpload component causing Vercel build failure. Changed from useAuth.js to useAuth (no extension) for proper Vite resolution.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

