// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.229',
  buildDate: '2025-01-09',
  deploymentId: 'react-error-root-cause-fix',
  description: 'Fixed React error #310 root cause - converted EnhancedInsurancePolicyBreakdown to use TanStack Query instead of useState/useEffect'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
