// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.4',
  buildDate: '2025-10-20',
  deploymentId: 'insurance-route-ordering-redeploy',
  description: 'REDEPLOY: Force Railway deployment of route ordering fix - /hierarchy before /{policy_id}'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
