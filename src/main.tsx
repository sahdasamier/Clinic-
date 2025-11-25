import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import '@/index.css'
import '@styles/globalStyles.css'
import '@/i18n';

// Firebase service initializer
import FirebaseServiceInitializer from '@components/FirebaseServiceInitializer';

// Initialize modern Firebase
import { initializeFirebase } from '@lib/firebase';

// ✅ IMPROVED: More robust service initialization with better error handling
const initializeServices = async () => {
  try {
    console.log('🚀 Starting service initialization...');
    
    // Shadow DOM guard is already in index.html, no need for duplicate here

    // ✅ CRITICAL: Initialize modern Firebase services FIRST
    try {
      console.log('⏳ Initializing modern Firebase services...');
      await initializeFirebase();
      console.log('✅ Modern Firebase services initialized successfully');
      
      // ✅ IMPROVED: Verify Firebase is ready
      const { isFirebaseReadyAsync } = await import('@lib/firebase');
      let verificationRetries = 0;
      const maxVerificationRetries = 10;
      
      while (!(await isFirebaseReadyAsync()) && verificationRetries < maxVerificationRetries) {
        console.log(`⏳ Verifying Firebase initialization... (${verificationRetries + 1}/${maxVerificationRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        verificationRetries++;
      }
      
      if (!(await isFirebaseReadyAsync())) {
        throw new Error('Firebase failed verification after initialization');
      }
      
      console.log('✅ Firebase readiness verified');
      
      // ✅ IMPROVED: Load essential modules with better error handling
      console.log('✅ Modern Firebase services ready');
      
      // Load only existing utility modules
      try {
        await Promise.allSettled([
          import('@utils/i18nUtils').catch(e => console.warn('i18n utils load failed:', e)),
          import('@utils/validation').catch(e => console.warn('Validation utils load failed:', e)),
          import('@utils/dateUtils').catch(e => console.warn('Date utils load failed:', e))
        ]);
        console.log('✅ All utility modules loaded');
      } catch (error) {
        console.warn('⚠️ Some utilities failed to load:', error);
      }
    } catch (error) {
      console.error('❌ CRITICAL: Failed to initialize Firebase services:', error);
      
      // Continue with app rendering but with limited functionality
      throw error;
    }
    
    // Show service initialization completion message
    setTimeout(() => {
      console.log('✅ Application initialization completed successfully');
      console.log('🏯 Clinic Management System ready for use');
    }, 1000);
    
  } catch (error) {
    console.error('❌ CRITICAL: Service initialization failed:', error);
    // Still allow the app to render, but with error state
    return error;
  }
};

// ✅ IMPROVED: AppInitializer component to manage loading states within React
const AppInitializer: React.FC = () => {
  const [initState, setInitState] = React.useState<{
    status: 'loading' | 'error' | 'warning' | 'ready';
    error?: Error;
  }>({ status: 'loading' });

  React.useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Starting application initialization...');
        const initError = await initializeServices();
        
        if (initError) {
          console.warn('⚠️ App starting with limited functionality due to initialization errors');
          setInitState({ status: 'warning', error: initError instanceof Error ? initError : new Error('Unknown initialization error') });
        } else {
          console.log('✅ All services initialized successfully');
          console.log('🎨 Rendering React application...');
          setInitState({ status: 'ready' });
        }
      } catch (error) {
        console.error('❌ CRITICAL: Failed to start application:', error);
        setInitState({ status: 'error', error: error instanceof Error ? error : new Error('Unknown error') });
      }
    };

    initialize();
  }, []);

  if (initState.status === 'loading') {
    return (
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
  }

  if (initState.status === 'error') {
    return (
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
          Error: {initState.error?.message || 'Unknown error'}
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

  if (initState.status === 'warning') {
    return (
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
          Error: {initState.error?.message || 'Unknown error'}
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
          onClick={() => setInitState({ status: 'ready' })}
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
  }

  // Ready state - render the actual app
  return (
      <FirebaseServiceInitializer>
        <App />
      </FirebaseServiceInitializer>
    );
};

// ✅ CRITICAL: Ensure single React root creation (prevents HMR issues)
let root: ReturnType<typeof ReactDOM.createRoot>;

const startApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ Root element not found!');
    return;
  }

  // Check if root was already created (HMR might trigger this multiple times)
  if (!root) {
    console.log('🎨 Creating React root...');
    root = ReactDOM.createRoot(rootElement);
  } else {
    console.log('🔄 Reusing existing React root (HMR)...');
  }

  // Render the app
  root.render(<AppInitializer />);
  console.log('✅ App rendered successfully');
};

// Start the application
startApp();

// HMR support - ensure clean updates during development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔥 HMR update detected, re-rendering...');
    startApp();
  });
}