// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.151',
  buildDate: '2024-12-08',
  deploymentId: 'fix-trailing-slashes',
  description: 'Fixed URL trailing slashes to match FastAPI routes exactly, prevent 307 redirects'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}