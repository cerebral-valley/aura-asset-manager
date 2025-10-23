// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.16',
  buildDate: '2025-10-23',
  deploymentId: 'sip-inflation-adjustments',
  description: 'Align SIP & Lump Sum inflation-adjusted growth with growth minus inflation rate'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
