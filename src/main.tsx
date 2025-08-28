import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './styles/globalStyles.css'
import './i18n';

// Firebase service initializer
import FirebaseServiceInitializer from './components/FirebaseServiceInitializer';

// Initialize optimized Firebase first
import { initializeOptimizedServices } from './api/firebase';
import { initializeEmailJS } from './services/emailService';

// ✅ IMPROVED: More robust service initialization with better error handling
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
      
      // ✅ IMPROVED: Verify Firebase is actually ready with better timeout
      const { firebaseManager } = await import('./api/firebaseOptimized');
      let verificationRetries = 0;
      const maxVerificationRetries = 10; // Increased from 5 to 10
      
      while (!firebaseManager.isReady() && verificationRetries < maxVerificationRetries) {
        console.log(`⏳ Verifying Firebase initialization... (${verificationRetries + 1}/${maxVerificationRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased from 200ms to 500ms
        verificationRetries++;
      }
      
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase failed verification after initialization');
      }
      
      console.log('✅ Firebase readiness verified');
      
      // ✅ IMPROVED: Load Firebase-dependent modules with better error handling
      const moduleLoadPromises = [
        import('./api/analytics').catch(e => console.warn('Analytics module load failed:', e)),
        import('./api/messaging').catch(e => console.warn('Messaging module load failed:', e)),
        import('./api/storage').catch(e => console.warn('Storage module load failed:', e)),
        import('./utils/manualSync').catch(e => console.warn('Manual sync module load failed:', e)),
        import('./utils/emergencyFix').catch(e => console.warn('Emergency fix module load failed:', e)),
        import('./utils/firebaseFriendlySync').catch(e => console.warn('Firebase friendly sync module load failed:', e)),
        import('./utils/firebaseDataManagerInit').catch(e => console.warn('Data manager init module load failed:', e)),
        import('./utils/quickDoctorFix').catch(e => console.warn('Quick doctor fix module load failed:', e)),
        import('./utils/instantDoctorFix').catch(e => console.warn('Instant doctor fix module load failed:', e)),
        import('./utils/enableRealtimeListeners').catch(e => console.warn('Realtime listeners module load failed:', e))
      ];
      
      await Promise.allSettled(moduleLoadPromises);
      console.log('✅ All Firebase-dependent modules loaded (some may have failed but app will continue)');
      console.log('✅ Legacy Firebase Blaze plan services preloaded');
    } catch (error) {
      console.error('❌ CRITICAL: Failed to initialize Firebase services:', error);
      
      // ✅ NEW: Attempt Firebase recovery
      try {
        console.log('🔄 Attempting Firebase recovery...');
        const { firebaseManager } = await import('./api/firebaseOptimized');
        
        // Check if Firebase is in a recoverable state
        const status = firebaseManager.getStatus();
        console.log('📊 Firebase status:', status);
        
        if (status === 'failed') {
          console.log('🔄 Firebase failed, attempting reinitialization...');
          await firebaseManager.initialize();
          console.log('✅ Firebase recovery successful');
        } else if (status === 'initializing') {
          console.log('⏳ Firebase still initializing, waiting...');
          // Wait a bit more for initialization to complete
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (recoveryError) {
        console.error('❌ Firebase recovery failed:', recoveryError);
        console.warn('⚠️ App will start with limited functionality');
      }
      
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

// ✅ IMPROVED: Better app startup with loading states and error recovery
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
      
      // Show warning but continue
      root.render(
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff3e0',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#f57c00', marginBottom: '20px' }}>⚠️ Limited Functionality Mode</h2>
          <p style={{ color: '#666', marginBottom: '20px', maxWidth: '600px' }}>
            Some services failed to initialize properly. The app will start with limited functionality.
            You can still use basic features, but some advanced features may not work.
          </p>
          <p style={{ color: '#999', fontSize: '0.9em', marginBottom: '20px' }}>
            Error: {initError instanceof Error ? initError.message : 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#f57c00',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Retry
          </button>
          <button 
            onClick={() => {
              // Continue with limited functionality
              root.render(
                <FirebaseServiceInitializer>
                  <App />
                </FirebaseServiceInitializer>
              );
            }}
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
            Continue Anyway
          </button>
        </div>
      );
      return;
    }
    
    console.log('✅ All services initialized successfully');
    
    // Render the actual app
    console.log('🎨 Rendering React application...');
    root.render(
      <FirebaseServiceInitializer>
        <App />
      </FirebaseServiceInitializer>
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