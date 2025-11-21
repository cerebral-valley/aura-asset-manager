// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.249',
  buildDate: '2025-01-25',
  deploymentId: 'animation-ux-fixes',
  description: 'Fixed animation centering with absolute positioning and proper transforms. Smoother 1.5s cubic-bezier transitions. Enhanced star visibility (white, larger, stronger glow). Improved mountain silhouette (opacity 0.7, stroke, lighter gradient). Larger fonts (7rem center, 1.75rem corner). Text corrections: High-Level Security, Nijat Garayev. Reduced stars to 15 for better visual clarity.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
