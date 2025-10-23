// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.13',
  buildDate: '2025-10-21',
  deploymentId: 'fire-sip-fix',
  description: 'Correct FIRE and SIP calculators to use realistic formulas and real returns'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
