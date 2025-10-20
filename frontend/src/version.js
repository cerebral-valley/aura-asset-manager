// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.13',
  buildDate: '2025-10-20',
  deploymentId: 'loan-calculator-launch',
  description: 'Add loan calculator tool, unify mapping controls, and refresh export styling'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
