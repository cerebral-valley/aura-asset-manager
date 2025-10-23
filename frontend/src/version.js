// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.15',
  buildDate: '2025-10-21',
  deploymentId: 'sip-portfolio-value-fix',
  description: 'Plot cumulative portfolio values for SIP & Lump Sum and extend FIRE documentation'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
