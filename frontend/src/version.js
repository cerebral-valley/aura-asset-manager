// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.228',
  buildDate: '2025-01-09',
  deploymentId: 'dashboard-react-error-fix',
  description: 'Fixed React error #310 by declaring annualIncome variable before usage in useMemo dependencies'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
