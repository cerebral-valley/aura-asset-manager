// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.218.11',
  buildDate: '2025-10-20',
  deploymentId: 'insurance-export-fullscreen-fixes',
  description: 'Restore fullscreen fitView and rebuild PDF export to capture dark-mode styling reliably'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
