// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.6',
  buildDate: '2025-10-20',
  deploymentId: 'fix-insurance-react-error-185',
  description: 'FIX: React Error #185 - Ensure all node data values are strings/numbers'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
