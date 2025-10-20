// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.10',
  buildDate: '2025-10-20',
  deploymentId: 'insurance-export-theme-tune',
  description: 'Polish insurance mapping export to match on-screen styling and remove inactive visuals'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
