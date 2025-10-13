// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.180',
  buildDate: '2025-10-14',
  deploymentId: 'secure-cors-headers',
  description: 'Replace wildcard CORS headers with explicit Sentry-compatible allowlist for security'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

