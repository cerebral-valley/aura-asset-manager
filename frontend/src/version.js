// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.137',
  buildDate: '2024-12-21',
  deploymentId: 'api-routing-fix',
  description: 'Fixed API endpoint routing issues - removed trailing slashes and resolved backend import problems'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}