// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.233',
  buildDate: '2025-10-26',
  deploymentId: 'insurance-aggregation-improvements',
  description: 'Changed Coverage to Income bar scaling from 20x to 10x base, removed Other grouping to show all policy types distinctly, added Total row to Policy Type Counts table'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
