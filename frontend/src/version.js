// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.220.0',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-enhanced-charts',
  description: 'Enhance Dashboard charts with MagicCard wrappers, animated number tickers, smooth transitions, and interactive hover effects'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
