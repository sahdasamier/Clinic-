// ✅ UNIFIED FIREBASE CONFIG - USES OPTIMIZED FIREBASE
// This file now delegates to the optimized Firebase implementation

import { 
  firebaseManager,
  initializeOptimizedFirebase,
  getOptimizedFirestore,
  getOptimizedAuth,
  getOptimizedStorage,
  getOptimizedAnalytics,
  getOptimizedMessaging,
  getOptimizedFunctions
} from './firebaseOptimized';

// Initialize optimized Firebase and wait for it
console.log("🔄 Legacy Firebase file initializing optimized Firebase...");

// Create a promise that resolves when Firebase is ready
const firebaseReady = initializeOptimizedFirebase().then(() => {
  console.log("✅ Optimized Firebase ready for legacy compatibility");
}).catch(error => {
  console.error("❌ Failed to initialize optimized Firebase from legacy file:", error);
  throw error;
});

// Create services that wait for Firebase to be ready
const createLazyService = (getService: () => any, serviceName: string) => {
  let service: any = null;
  let isInitialized = false;
  
  const initializeService = () => {
    if (!isInitialized && firebaseManager.isReady()) {
      try {
        service = getService();
        isInitialized = true;
      } catch (error) {
        console.error(`Failed to initialize ${serviceName}:`, error);
        throw error;
      }
    }
    return service;
  };
  
  return new Proxy({}, {
    get(target, prop) {
      // Try to initialize if not already done
      if (!isInitialized) {
        try {
          initializeService();
        } catch (error) {
          // If Firebase isn't ready and this is a critical function call
          if (prop === 'collection' || prop === 'doc') {
            console.warn(`⚠️ ${serviceName} not ready for ${String(prop)}() call. This should not happen at module load time.`);
          }
          throw new Error(`${serviceName} not ready yet. Firebase is still initializing. Avoid calling ${String(prop)} at module load time.`);
        }
      }
      
      if (!service) {
        throw new Error(`${serviceName} failed to initialize`);
      }
      
      const value = service[prop];
      return typeof value === 'function' ? value.bind(service) : value;
    }
  });
};

// Create service proxies
const app = createLazyService(() => firebaseManager.getApp(), 'Firebase App');
const firestore = createLazyService(() => getOptimizedFirestore(), 'Firestore');
const auth = createLazyService(() => getOptimizedAuth(), 'Auth');
const storage = createLazyService(() => getOptimizedStorage(), 'Storage');
const functions = createLazyService(() => getOptimizedFunctions(), 'Functions');

// Optional services (can be null)
let analytics: any = null;
let messaging: any = null;

// Try to get optional services, but don't fail if they're not available
firebaseReady.then(() => {
  try {
    analytics = getOptimizedAnalytics();
  } catch (error) {
    console.log('Analytics not available');
  }
  
  try {
    messaging = getOptimizedMessaging();
  } catch (error) {
    console.log('Messaging not available');
  }
}).catch(() => {
  // Firebase failed to initialize, services will remain null
});

// Auth helpers for AuthContext
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";

export const authHelpers = {
  signIn: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },
  
  signUp: async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },
  
  signOut: async () => {
    return await firebaseSignOut(auth);
  }
};

// Get the Firebase configuration for legacy compatibility
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Export for use in other files
export { 
  auth, 
  firestore, 
  storage, 
  analytics, 
  messaging, 
  functions,
  firebaseConfig,
  app 
};

// Export firestore as db for backward compatibility
export const db = firestore;

// Utility functions for offline persistence monitoring
export const firestoreUtils = {
  // Check if app is currently offline
  isOffline: () => !navigator.onLine,
  
  // Monitor offline/online state changes
  onOfflineStateChange: (callback: (isOffline: boolean) => void) => {
    const handleOnline = () => {
      console.log("🌐 App back online - Firestore will sync cached changes");
      callback(false);
    };
    
    const handleOffline = () => {
      console.log("📱 App offline - Using Firestore cached data");
      callback(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
  
  // Get current cache status info
  getCacheInfo: () => ({
    isOnline: navigator.onLine,
    persistenceEnabled: true,
    cacheType: 'IndexedDB',
    timestamp: new Date().toISOString()
  })
};

// ✅ OPTIMIZED FIREBASE CONVENIENCE FUNCTIONS
// Use these instead of the legacy exports above

// Initialize optimized Firebase (call this in main.tsx or App.tsx)
export async function initializeOptimizedServices(): Promise<void> {
  try {
    await initializeOptimizedFirebase();
    console.log('🚀 Optimized Firebase services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize optimized Firebase:', error);
    throw error;
  }
}

// Get optimized services (preferred over legacy exports)
export function getOptimizedServices() {
  return {
    firestore: getOptimizedFirestore(),
    auth: getOptimizedAuth(),
    storage: getOptimizedStorage(),
    isReady: firebaseManager.isReady()
  };
}

// Migration helper: Check if optimized Firebase is ready
export function isOptimizedFirebaseReady(): boolean {
  return firebaseManager.isReady();
}