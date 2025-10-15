// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.195',
  buildDate: '2025-10-15',
  deploymentId: 'update-lockfile',
  description: 'HOTFIX: Update pnpm-lock.yaml to match package.json dependencies - v0.194 failed due to frozen-lockfile mismatch'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

