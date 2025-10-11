// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.168',
  buildDate: '2025-10-11',
  deploymentId: 'user-specific-storage-security',
  description: 'Implement user-specific folder storage with Supabase security policies for document isolation'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}

