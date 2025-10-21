// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.3',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-nav-personalization',
  description: 'Personalize dashboard greeting with first name, reorder nav (Goals between Analytics/Tools), align pie chart boundaries'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
