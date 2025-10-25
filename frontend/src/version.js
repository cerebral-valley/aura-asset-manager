// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.225',
  buildDate: '2025-10-25',
  deploymentId: 'dashboard-fixes',
  description: 'Fixed dashboard UI issues: Insurance chart labels now show policy type + count + percentage, Growth Potential shows only percentage without currency symbol'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
