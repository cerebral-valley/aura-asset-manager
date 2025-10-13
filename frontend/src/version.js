// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.178',
  buildDate: '2025-10-13',
  deploymentId: 'vercel-csp-sentry-fix',
  description: 'Add Sentry domains to Vercel CSP configuration - simple fix for error tracking'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

