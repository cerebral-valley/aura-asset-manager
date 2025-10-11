import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://27a3645cd8e778c6be27cf19eca40635@o4510169956679680.ingest.de.sentry.io/4510172314665040",
  environment: import.meta.env.MODE, // 'development' or 'production'
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
