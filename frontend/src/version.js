// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.263',
  buildDate: '2025-01-25',
  deploymentId: 'favicon-gitignore-fix',
  description: 'Fix favicon 404 error - .gitignore was blocking frontend/public/ folder. Updated .gitignore to allow Vite static assets, force-added favicon.svg and favicon.ico to git. Favicon files now properly deployed to Vercel and will display in browser tabs.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
