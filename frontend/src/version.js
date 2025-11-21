// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.253',
  buildDate: '2025-01-25',
  deploymentId: 'hexagon-mandala-combo',
  description: 'Added 4th logo variation: Hexagon Mandala (6+3 points) - killer combo fusing hexagonal symmetry with inner triangle mysticism. Perfect balance of the Hexagon and Mandala designs. Updated Logo Showcase to display all 4 variations in responsive grid layout.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
