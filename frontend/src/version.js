// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.239',
  buildDate: '2025-11-15',
  deploymentId: 'dashboard-font-unification',
  description: 'Switches the entire dashboard to a mono-based JetBrains font with enforced slashed zeros so every number, chart, and label uses the same typeface'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
