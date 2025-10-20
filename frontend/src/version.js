// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.8',
  buildDate: '2025-10-20',
  deploymentId: 'fix-insurance-mapping-loop',
  description: 'Memoize currency helpers to stop Insurance Mapping tab from hitting React render loop'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
