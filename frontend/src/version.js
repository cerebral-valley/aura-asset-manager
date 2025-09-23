// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.142',
  buildDate: '2025-01-13',
  deploymentId: 'cors-railway-fix',
  description: 'Fixed CORS configuration for Railway deployment - explicitly allow Vercel domains without wildcard dependency'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}