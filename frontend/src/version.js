// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.8',
  buildDate: '2025-10-21',
  deploymentId: 'portfolio-modelling-polish',
  description: 'Polish portfolio modelling UX with portfolio loader, plain-language guidance, and heat-map allocation view'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
