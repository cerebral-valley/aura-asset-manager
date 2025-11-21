// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.259',
  buildDate: '2025-01-25',
  deploymentId: 'logo-branding-integration',
  description: 'Integrate Minimalist Mandala logo into login page and sidebar. Added 32px logo beside "Aura" text in sidebar header. Added 48px logo to login page fixed header alongside brand name. Updated copyright footer with standard legal wording: "© 2025 Aura Asset Manager. All rights reserved." plus proprietary marks disclaimer. Logo showcase remains at /logo-showcase for future prototyping.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
