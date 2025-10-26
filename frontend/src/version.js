// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.231',
  buildDate: '2025-01-09',
  deploymentId: 'build-error-fix',
  description: 'Fixed build error - corrected import path for useAuth in EnhancedInsurancePolicyBreakdown'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
