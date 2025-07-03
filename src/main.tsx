import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './styles/globalStyles.css'
import './i18n';

// Deferred initialization to prevent circular dependencies
const initializeServices = async () => {
  try {
    // Initialize EmailJS for email sending functionality
    const { initializeEmailJS } = await import('./services/emailService');
    await initializeEmailJS();
    
    // Import utilities after React app has started to prevent circular deps
    // These modules have auto-initialization code that can cause issues if loaded too early
    setTimeout(async () => {
      try {
        await import('./utils/manualSync');
        await import('./utils/emergencyFix');
        await import('./utils/firebaseFriendlySync');
        await import('./utils/firebaseDataManagerInit');
        console.log('✅ All utility modules loaded successfully');
      } catch (error) {
        console.warn('⚠️ Some utility modules failed to load:', error);
      }
    }, 1000);
    
  } catch (error) {
    console.warn('⚠️ Service initialization failed:', error);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize services after React app has started
initializeServices();