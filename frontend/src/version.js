// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.180',
  buildDate: '2025-09-27', 
  deploymentId: 'liquid-time-horizon-updates',
  description: 'Added liquid asset status and time horizon update functionality to transaction system with new Update Type options and table columns'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}