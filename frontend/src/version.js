// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.132',
  buildDate: '2024-12-21',
  deploymentId: 'target-page-bug-fixes-comprehensive',
  description: 'Fixed asset value concatenation bug, implemented working target creation modals, improved compact asset section layout, added comprehensive testing methodology'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}