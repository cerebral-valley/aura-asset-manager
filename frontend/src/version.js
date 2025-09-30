// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.146',
  buildDate: '2025-09-30',
  deploymentId: 'fix-https-enforcement-interceptor',
  description: 'Fixed HTTPS enforcement in API interceptor to check both baseURL and url properties, preventing HTTP downgrades on PUT requests'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

