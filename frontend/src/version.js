// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.4',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-light-mode-fix',
  description: 'Fix light mode readability: DashboardCard wrapper with theme-aware styling (white bg, subtle gradients, proper contrast)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
