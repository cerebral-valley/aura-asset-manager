// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.14',
  buildDate: '2025-10-21',
  deploymentId: 'fire-sip-refinement',
  description: 'Refine FIRE equation variables, extend projection, and align SIP/Lump Sum charts'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
