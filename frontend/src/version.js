// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.188',
  buildDate: '2025-01-14',
  deploymentId: 'insurance-page-fix',
  description: 'CRITICAL FIX: Insurance page blank screen - added missing isDark destructuring from useChartColors hook'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

