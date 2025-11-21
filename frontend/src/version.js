// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.254',
  buildDate: '2025-01-25',
  deploymentId: 'hexagon-mandala-fixes',
  description: 'Fixed Hexagon Mandala geometry issues: increased inner triangle size (radius 18→22), enhanced aurora glow visibility (opacity 0.25→0.5, strokeWidth 0.3→0.5), removed cluttered radial center lines, improved Star of David pattern, larger constellation points for better visibility. Now a true visual match to the other logos.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
