import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './styles/globalStyles.css'
import './i18n';

// Blaze plan features
import BlazePlanInitializer from './components/BlazePlanInitializer';

// Initialize optimized Firebase first
import { initializeOptimizedServices } from './api/firebase';
import { initializeEmailJS } from './services/emailService';

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
    await initializeEmailJS();

    // Initialize optimized Firebase services first
    try {
      await initializeOptimizedServices();
      console.log('✅ Optimized Firebase services initialized');
      
      // Now that Firebase is ready, dynamically import the modules that depend on it
      await Promise.all([
        import('./api/analytics'),
        import('./api/messaging'),
        import('./api/storage'),
        import('./utils/manualSync'),
        import('./utils/emergencyFix'),
        import('./utils/firebaseFriendlySync'),
        import('./utils/firebaseDataManagerInit'),
        import('./utils/doctorSync'),
        import('./utils/quickDoctorFix'),
        import('./utils/instantDoctorFix'),
        import('./utils/enableRealtimeListeners')
      ]);
      
      console.log('✅ All Firebase-dependent modules loaded successfully');
      console.log('✅ Legacy Firebase Blaze plan services preloaded');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Firebase services:', error);
    }
    
    // Show doctor debugging availability message after a delay
    setTimeout(() => {
      console.log('✅ All utility modules loaded successfully');
      
      // Show doctor debugging availability message
      console.log('👩‍⚕️ Doctor debugging tools are now available!');
      console.log('   ⚡ Run fixDoctors() - EMERGENCY FIX (NEW - NO IMPORTS)');
      console.log('   🚀 Run runInstantDoctorFix() - INSTANT FIX');
      console.log('   📋 Run completeDoctorAssignmentSolution() - Complete solution');
      console.log('   🔧 Run quickFixDoctorAssignment() - Quick fix');
      console.log('   🔍 Run debugPatientDoctorAssignment() - Detailed analysis');
      console.log('');
      console.log('🔥 Firebase management tools:');
      console.log('   📋 Run checkFirebaseIndexes() - Check if indexes are ready');
      console.log('   🔄 Run enableAllRealtimeListeners() - Re-enable after indexes are ready');
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