// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.105',
  buildDate: '2025-09-16',
  deploymentId: 'fix-vercel-deployment-imports',
  description: 'Fix Vercel deployment issue: corrected service imports in useAuth hook (assetsService named export instead of default)'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}