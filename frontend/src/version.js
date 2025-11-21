// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.248',
  buildDate: '2025-01-06',
  deploymentId: 'constellation-command-center',
  description: 'Complete redesign with Constellation Portfolio + Summit Ascent hybrid. Animated intro sequence: "Aura Asset Manager" appears center, moves to top-left corner, followed by "Your Command Center For Wealth" tagline. Mountain silhouette with constellation stars, aurora streams, champagne gold accents. Premium command center theme for ultra-high-net-worth individuals.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
