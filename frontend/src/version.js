// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.226',
  buildDate: '2025-10-25',
  deploymentId: 'dashboard-enhancements',
  description: 'Enhanced dashboard with dynamic growth potential, asset ratios, and insurance coverage metrics. Insurance chart now shows coverage amounts like assets.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
