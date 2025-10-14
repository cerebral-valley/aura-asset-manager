// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.185',
  buildDate: '2025-01-14',
  deploymentId: 'table-consistency-sidebar-wrapping',
  description: 'Fix sidebar word wrapping consistency, add Liquidity Status to Goals table, standardize table colors app-wide (Assets, Goals, Insurance)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

