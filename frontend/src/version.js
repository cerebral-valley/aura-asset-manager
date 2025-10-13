// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.176',
  buildDate: '2025-10-13',
  deploymentId: 'sentry-tunnel-fix',
  description: 'Fix CORS issues with Sentry tunnel through backend - enables full error tracking'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

