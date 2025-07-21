import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './styles/globalStyles.css'
import './i18n';

// Blaze plan features
import BlazePlanInitializer from './components/BlazePlanInitializer';

// Deferred initialization to prevent circular dependencies
const initializeServices = async () => {
  try {
    // Guard against Shadow DOM polyfill conflicts
    if (typeof window !== 'undefined' && window.Element && !(window.Element.prototype.attachShadow as any)._guarded) {
      const originalAttachShadow = window.Element.prototype.attachShadow;
      window.Element.prototype.attachShadow = function(options) {
        if (this.shadowRoot) {
          console.warn('Shadow root already exists on element, skipping...');
          return this.shadowRoot;
        }
        return originalAttachShadow.call(this, options);
      };
      (window.Element.prototype.attachShadow as any)._guarded = true;
    }
    
    // Initialize EmailJS for email sending functionality
    const { initializeEmailJS } = await import('./services/emailService');
    await initializeEmailJS();

    // Initialize optimized Firebase services
    try {
      const { initializeOptimizedServices } = await import('./api/firebase');
      await initializeOptimizedServices();
      console.log('✅ Optimized Firebase services initialized');
      
      // Fallback: Import legacy services for backward compatibility
      await import('./api/analytics');
      await import('./api/messaging');
      await import('./api/storage');
      console.log('✅ Legacy Firebase Blaze plan services preloaded');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Firebase services:', error);
      // Try legacy initialization as fallback
      try {
        await import('./api/firebase');
        console.log('✅ Fallback to legacy Firebase initialization');
      } catch (fallbackError) {
        console.error('❌ Complete Firebase initialization failure:', fallbackError);
      }
    }
    
    // Import utilities after React app has started to prevent circular deps
    // These modules have auto-initialization code that can cause issues if loaded too early
    setTimeout(async () => {
      try {
        await import('./utils/manualSync');
        await import('./utils/emergencyFix');
        await import('./utils/firebaseFriendlySync');
        await import('./utils/firebaseDataManagerInit');
        // Legacy doctor utilities (commented out for clean build)
        // await import('./utils/doctorDebugger');
        await import('./utils/doctorSync');
        await import('./utils/quickDoctorFix');
        // await import('./utils/emergencyDoctorFix');
        
        console.log('✅ All utility modules loaded successfully');
        
        // Show doctor debugging availability message
        console.log('👩‍⚕️ Doctor debugging tools are now available!');
        console.log('   ⚡ Run fixDoctors() - EMERGENCY FIX (NEW - NO IMPORTS)');
        console.log('   🚀 Run runInstantDoctorFix() - INSTANT FIX');
        console.log('   📋 Run completeDoctorAssignmentSolution() - Complete solution');
        console.log('   🔧 Run quickFixDoctorAssignment() - Quick fix');
        console.log('   🔍 Run debugPatientDoctorAssignment() - Detailed analysis');
        
      } catch (error) {
        console.warn('⚠️ Some utility modules failed to load:', error);
      }
    }, 1000);
    
  } catch (error) {
    console.warn('⚠️ Service initialization failed:', error);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BlazePlanInitializer>
    <App />
  </BlazePlanInitializer>
)

// Initialize services after React app has started
initializeServices();