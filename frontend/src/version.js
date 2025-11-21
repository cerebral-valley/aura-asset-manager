// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.252',
  buildDate: '2025-01-25',
  deploymentId: 'cosmic-constellation-refined',
  description: 'Refined Cosmic Constellation logo with 3 variations: Pentagon (5 points - original), Hexagon (6 points - perfect symmetry), Wealth Mandala (8+4 points - dual-layer). Fixed glow artifacts using clean radial gradients, mathematically precise point positioning on circumference using trigonometry. Updated Logo Showcase with comprehensive comparison tools.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
