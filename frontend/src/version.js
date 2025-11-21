// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.258',
  buildDate: '2025-01-25',
  deploymentId: 'logo-visibility-darkmode-fix',
  description: 'Enhanced Minimalist Mandala visibility + full light/dark mode support for logo showcase. Fixes: increased connection line stroke width (0.5→0.8px) and opacity (0.4→0.6) for better visibility when zoomed out, enhanced Star of David pattern visibility (0.15→0.35 opacity). Added comprehensive light/dark mode styling across entire showcase page with adaptive backgrounds, borders, text colors, and shadows.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
