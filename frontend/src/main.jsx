import * as Sentry from "@sentry/react";

console.log('🔧 Initializing Sentry...');
console.log('Environment:', import.meta.env.MODE);

Sentry.init({
  dsn: "https://27a3645cd8e778c6be27cf19eca40635@o4510169956679680.ingest.de.sentry.io/4510172314665040",
  integrations: [Sentry.browserTracingIntegration()],
  environment: import.meta.env.MODE, // 'development' or 'production'
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost", 
    /^https:\/\/aura-asset-manager\.vercel\.app\/api/,
    /^https:\/\/.*\.railway\.app\/api/
  ],
  
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  beforeSend(event) {
    console.log('🚨 Sentry event captured:', event);
    return event;
  }
});

console.log('✅ Sentry initialized');
console.log('Sentry available on window:', typeof window !== 'undefined' ? typeof window.Sentry : 'no window');

// Make Sentry available globally for testing
if (typeof window !== 'undefined') {
  window.Sentry = Sentry;
  console.log('🌐 Sentry attached to window object');
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
