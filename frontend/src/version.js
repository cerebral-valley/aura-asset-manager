// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.125',
  buildDate: '2024-12-19', 
  deploymentId: 'transaction-system-enhancement',
  description: 'Complete transaction system overhaul with Asset Purpose, new transaction types, Values column fix, Actions column removal, and enhanced Assets table'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}