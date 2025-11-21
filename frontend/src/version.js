// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.255',
  buildDate: '2025-01-25',
  deploymentId: 'hexagon-mandala-geometry-fix',
  description: 'CRITICAL FIX: Hexagon Mandala geometry corrections. Fixed background circle overlap (radius 48→42) to not overlap outer constellation points. Corrected mandala web connections - each outer point now properly connects to its aligned inner point (0,2,4→0,1,2) plus previous inner, creating proper sacred geometry pattern instead of random connections.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
