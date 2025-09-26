// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.179',
  buildDate: '2025-01-26', 
  deploymentId: 'cors-security-hardening',
  description: 'Critical CORS security fix: replaced dangerous wildcard ["*"] origins with explicit secure domain whitelist to prevent CORS-based attacks'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}