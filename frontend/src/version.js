// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.250',
  buildDate: '2025-01-25',
  deploymentId: 'pure-cosmic-constellation',
  description: 'Pure constellation cosmic theme - removed mountains entirely, enhanced with 35 twinkling stars in varied sizes, added 4 subtle nebula clouds for depth, stronger aurora streams with animation, deeper gradient (black → deep navy → midnight blue with radial overlay). Refined, elegant cosmic aesthetic for wealth command center.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
