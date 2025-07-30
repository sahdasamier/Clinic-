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

// ✅ SIMPLIFIED: Wait for Firebase to be ready, then export actual services
let servicesReady = false;
let _internalApp: any = null;
let _internalFirestore: any = null;
let _internalAuth: any = null;
let _internalStorage: any = null;
let _internalFunctions: any = null;

// Wait for Firebase to be ready and then initialize services
const initializeServices = async () => {
  if (servicesReady) return;
  
  // Wait for Firebase to be ready
  let retries = 0;
  const maxRetries = 50; // 5 seconds max wait
  
  while (!firebaseManager.isReady() && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase initialization timeout after 5 seconds');
  }
  
  // Now initialize all services
  try {
    _internalApp = firebaseManager.getApp();
    _internalFirestore = getOptimizedFirestore();
    _internalAuth = getOptimizedAuth();
    _internalStorage = getOptimizedStorage();
    _internalFunctions = getOptimizedFunctions();
    
    servicesReady = true;
    console.log('✅ All Firebase services initialized and ready');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase services:', error);
    throw error;
    }
};

// Initialize services immediately
initializeServices().catch(error => {
  console.error('❌ Critical: Firebase services failed to initialize:', error);
});

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
    if (!servicesReady || !_internalAuth) {
      throw new Error('🔥 Auth not ready for signIn');
    }
    return await signInWithEmailAndPassword(_internalAuth, email, password);
  },
  
  signUp: async (email: string, password: string) => {
    if (!servicesReady || !_internalAuth) {
      throw new Error('🔥 Auth not ready for signUp');
    }
    return await createUserWithEmailAndPassword(_internalAuth, email, password);
  },
  
  signOut: async () => {
    if (!servicesReady || !_internalAuth) {
      throw new Error('🔥 Auth not ready for signOut');
    }
    return await firebaseSignOut(_internalAuth);
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

// ✅ SAFE EXPORTS: Function-based exports that ensure services are ready
export const getFirestore = () => {
  if (!servicesReady || !_internalFirestore) {
    throw new Error('🔥 Firestore not ready - please wait for Firebase initialization');
  }
  return _internalFirestore;
};

export const getAuth = () => {
  if (!servicesReady || !_internalAuth) {
    throw new Error('🔥 Auth not ready - please wait for Firebase initialization');
  }
  return _internalAuth;
};

export const getStorage = () => {
  if (!servicesReady || !_internalStorage) {
    throw new Error('🔥 Storage not ready - please wait for Firebase initialization');
  }
  return _internalStorage;
};

export const getApp = () => {
  if (!servicesReady || !_internalApp) {
    throw new Error('🔥 App not ready - please wait for Firebase initialization');
  }
  return _internalApp;
};

export const getFunctions = () => {
  if (!servicesReady || !_internalFunctions) {
    throw new Error('🔥 Functions not ready - please wait for Firebase initialization');
  }
  return _internalFunctions;
};

// ✅ BACKWARD COMPATIBILITY: Direct exports that wait for services
export { analytics, messaging, firebaseConfig };

// ✅ SIMPLE AND RELIABLE: Direct function that returns actual Firestore instance
export const getDb = () => {
  if (!servicesReady || !_internalFirestore) {
    throw new Error('🔥 Firestore not ready - please wait for Firebase initialization to complete');
  }
  return _internalFirestore;
};

// ✅ ES6 MODULE COMPATIBILITY: Export as const with Proxy
export const db = new Proxy({}, {
  get(target, prop) {
    const instance = getDb();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  has(target, prop) {
    try {
      const instance = getDb();
      return prop in instance;
    } catch {
      return false;
    }
  },
  ownKeys(target) {
    try {
      const instance = getDb();
      return Reflect.ownKeys(instance);
    } catch {
      return [];
    }
  },
  getOwnPropertyDescriptor(target, prop) {
    try {
      const instance = getDb();
      return Object.getOwnPropertyDescriptor(instance, prop);
    } catch {
      return undefined;
    }
  }
});

// ✅ SAFE BACKWARD COMPATIBILITY: Proxy-based exports for individual services
// Rename internal variables to avoid conflicts
let _app: any = null;
let _firestore: any = null;
let _auth: any = null;
let _storage: any = null;
let _functions: any = null;



// Create safe proxies for the services
const createServiceProxy = (serviceName: string, getServiceValue: () => any) => {
  return new Proxy({}, {
    get(target, prop) {
      if (!servicesReady) {
        throw new Error(`🔥 ${serviceName} not ready - please wait for Firebase initialization to complete`);
      }
      
      const service = getServiceValue();
      if (!service) {
        throw new Error(`🔥 ${serviceName} failed to initialize`);
      }
      
      const value = service[prop];
      if (typeof value === 'function') {
        return value.bind(service);
      }
      return value;
    }
  });
};

export const auth = createServiceProxy('Auth', () => _auth);
export const firestore = db; // Use the same proxy as db
export const storage = createServiceProxy('Storage', () => _storage);
export const app = createServiceProxy('App', () => _app);
export const functions = createServiceProxy('Functions', () => _functions);

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