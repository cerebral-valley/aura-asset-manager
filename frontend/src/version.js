// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.194',
  buildDate: '2025-10-15',
  deploymentId: 'fix-xyflow-dependency',
  description: 'HOTFIX: Add @xyflow/react and @dagrejs/dagre to package.json - v0.193 build failed due to missing dependencies'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

