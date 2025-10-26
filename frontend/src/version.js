// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.233.1',
  buildDate: '2025-10-26',
  deploymentId: 'insurance-aggregation-bugfix',
  description: 'Fixed calculateProtectionMetrics to work dynamically with all policy types instead of hard-coded categories'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
