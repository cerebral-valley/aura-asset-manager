// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.179',
  buildDate: '2025-10-13',
  deploymentId: 'cors-preflight-fix',
  description: 'Fix CORS 400 errors on OPTIONS preflight requests - allow all headers'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

