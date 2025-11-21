// Version tracking for Aura Asset Manager
// This file is automatically updated with each deployment

export const VERSION_INFO = {
  version: 'v0.246',
  buildDate: '2025-01-06',
  deploymentId: 'beautiful-login-testimonials',
  description: 'Beautiful redesign of login page with testimonials from Kunal Jadhav, Nijat Garavey, Pete Siriwanransug. Updated stats to realistic values (10K+ users, £500M+ tracked, 99.9% uptime). Premium Apple/Wealthfront-inspired design with gradients, animations, and modern layout.'
}

export const getVersionDisplay = () => {
  return `${VERSION_INFO.version}`
}

export const getFullVersionInfo = () => {
  return VERSION_INFO
}
