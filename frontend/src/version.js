// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.191',
  buildDate: '2025-10-14',
  deploymentId: 'liquidity-filter-dropdown',
  description: 'Convert Liquidity filter from textbox to dropdown select for better UX - users can directly select "Liquid" or "Not Liquid"'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

