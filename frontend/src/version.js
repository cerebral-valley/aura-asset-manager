// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.152',
  buildDate: '2024-12-08',
  deploymentId: 'add-url-comments',
  description: 'Added detailed comments explaining FastAPI URL matching requirements'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}