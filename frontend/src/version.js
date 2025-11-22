// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.261',
  buildDate: '2025-01-25',
  deploymentId: 'favicon-logo-integration',
  description: 'Add Minimalist Mandala logo as browser favicon. Created SVG favicon with sacred geometry design (6 outer gold points + 3 inner cyan points). Updated HTML to use SVG favicon with ICO fallback. Updated page title to "Aura Asset Manager - Your Command Center For Wealth" for better SEO and branding consistency. Logo now visible in browser tabs, bookmarks, and history.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
