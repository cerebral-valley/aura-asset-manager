// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.219.0',
  buildDate: '2025-10-21',
  deploymentId: 'dashboard-magic-ui-refactor',
  description: 'Refactor Dashboard with Magic UI components - animated gradient, enhanced value cards with number tickers, sparkle effects, and staggered blur fade animations'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
