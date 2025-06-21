import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './styles/globalStyles.css'
import './i18n';
import { initializeEmailJS } from './services/emailService'

// Initialize EmailJS for email sending functionality
initializeEmailJS();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)