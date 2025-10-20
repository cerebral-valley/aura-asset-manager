// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.3',
  buildDate: '2025-10-20',
  deploymentId: 'insurance-route-ordering-fix',
  description: 'FIX: Insurance hierarchy 422 error - fixed FastAPI route ordering (moved /hierarchy before /{policy_id} to prevent UUID validation error)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
