// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.126',
  buildDate: '2024-12-19', 
  deploymentId: 'strategic-asset-classification-system',
  description: 'Strategic Asset Classification System with comprehensive Asset Purpose framework, enhanced User Guide with detailed portfolio construction guidance, theme consistency fixes, and database schema alignment'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}