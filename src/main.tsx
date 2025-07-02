import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './styles/globalStyles.css'
import './i18n';
import { initializeEmailJS } from './services/emailService'
// Import manual sync utility for global access
import './utils/manualSync'
// Import emergency fix commands (for manual use)
import './utils/emergencyFix'
// Import Firebase-friendly sync (replaces aggressive auto-sync)
import './utils/firebaseFriendlySync'
// Import Firebase Data Manager for real-time synchronization
import './utils/firebaseDataManagerInit'

// Initialize EmailJS for email sending functionality
initializeEmailJS();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)