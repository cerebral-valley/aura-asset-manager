// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.256',
  buildDate: '2025-01-25',
  deploymentId: 'hexagon-mandala-redesign',
  description: 'Complete redesign of Hexagon Mandala (6+3) to match Wealth Mandala (8+4) structure. Now features: dual orbital rings, radial center connections, Star of David pattern (every 2nd point), aurora glow background, larger central orb (r=10), matching gradients and visual style. Perfect visual harmony with the 8+4 mandala design.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
