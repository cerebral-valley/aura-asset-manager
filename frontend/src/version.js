// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.146',
  buildDate: '2025-09-23',
  deploymentId: 'backend-route-fix',
  description: 'BACKEND FIX: Removed trailing slashes from router.get/post routes to prevent Railway HTTPS→HTTP redirects that browsers block'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}