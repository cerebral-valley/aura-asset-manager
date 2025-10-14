// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.190',
  buildDate: '2025-10-14',
  deploymentId: 'liquidity-filter-exact-match',
  description: 'Fix Liquidity filter substring issue - changed back to exact match (===) to prevent "liquid" from matching "not liquid"'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

