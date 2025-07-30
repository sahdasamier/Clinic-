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

// ✅ FIXED: Initialize services before React app rendering
const initializeServices = async () => {
  try {
    console.log('🚀 Starting service initialization...');
    
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

    // ✅ CRITICAL: Initialize optimized Firebase services FIRST
    try {
      console.log('⏳ Initializing optimized Firebase services...');
      await initializeOptimizedServices();
      console.log('✅ Optimized Firebase services initialized successfully');
      
      // ✅ IMPROVED: Verify Firebase is actually ready
      const { firebaseManager } = await import('./api/firebaseOptimized');
      let verificationRetries = 0;
      const maxVerificationRetries = 5;
      
      while (!firebaseManager.isReady() && verificationRetries < maxVerificationRetries) {
        console.log(`⏳ Verifying Firebase initialization... (${verificationRetries + 1}/${maxVerificationRetries})`);
        await new Promise(resolve => setTimeout(resolve, 200));
        verificationRetries++;
      }
      
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase failed verification after initialization');
      }
      
      console.log('✅ Firebase readiness verified');
      
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
      console.error('❌ CRITICAL: Failed to initialize Firebase services:', error);
      // Continue with app rendering but with limited functionality
      throw error;
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
    console.error('❌ CRITICAL: Service initialization failed:', error);
    // Still allow the app to render, but with error state
    return error;
  }
};

// ✅ FIXED: Initialize services first, then render the app
const startApp = async () => {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  
  try {
    // Show a loading screen first
    root.render(
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Initializing Clinic Management</h2>
        <p style={{ color: '#666' }}>Setting up Firebase services...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
    
    // Initialize services
    console.log('🚀 Starting application initialization...');
    const initError = await initializeServices();
    
    if (initError) {
      console.warn('⚠️ App starting with limited functionality due to initialization errors');
    } else {
      console.log('✅ All services initialized successfully');
    }
    
    // Render the actual app
    console.log('🎨 Rendering React application...');
    root.render(
      <BlazePlanInitializer>
        <App />
      </BlazePlanInitializer>
    );
    
  } catch (error) {
    console.error('❌ CRITICAL: Failed to start application:', error);
    
    // Render error screen
    root.render(
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#ffebee',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>🚨 Initialization Error</h1>
        <p style={{ color: '#666', marginBottom: '20px', maxWidth: '600px' }}>
          The application failed to initialize properly. Please check your internet connection and reload the page.
        </p>
        <p style={{ color: '#999', fontSize: '0.9em', marginBottom: '20px' }}>
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
};

// Start the application
startApp();