// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.177',
  buildDate: '2025-10-13',
  deploymentId: 'csp-sentry-security-fix',
  description: 'Add CSP headers allowing Sentry domains + security headers - dual approach for reliable error tracking'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

