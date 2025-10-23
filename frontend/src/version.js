// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.17',
  buildDate: '2025-10-23',
  deploymentId: 'sip-real-rate-guard',
  description: 'Guard inflation-adjusted SIP/Lump Sum projections with growth minus inflation rate'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
