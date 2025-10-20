// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.14',
  buildDate: '2025-10-20',
  deploymentId: 'buy-rent-and-down-payment-tools',
  description: 'Introduce buy vs rent and down-payment trackers, color-code maps, and improve centering'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
