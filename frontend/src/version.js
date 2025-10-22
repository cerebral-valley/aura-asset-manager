// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.221.9',
  buildDate: '2025-10-21',
  deploymentId: 'time-value-and-portfolio-enhancements',
  description: 'Add Time Value tool, default mix restore, and clearer VaR storytelling with allocation heat tiles'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
