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
} from './../firebase/legacy-compat';

// Initialize optimized Firebase and wait for it
console.log("🔄 Legacy Firebase file initializing optimized Firebase...");

// ✅ SIMPLIFIED: Direct function exports that ensure services are ready
export const getFirestore = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 Firestore not ready - please wait for Firebase initialization');
  }
  return getOptimizedFirestore();
};

export const getAuth = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 Auth not ready - please wait for Firebase initialization');
  }
  return getOptimizedAuth();
};

export const getStorage = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 Storage not ready - please wait for Firebase initialization');
  }
  return getOptimizedStorage();
};

export const getApp = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 App not ready - please wait for Firebase initialization');
  }
  return firebaseManager.getApp();
};

export const getFunctions = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 Functions not ready - please wait for Firebase initialization');
  }
  return getOptimizedFunctions();
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

// ✅ SIMPLE AND RELIABLE: Direct function that returns actual Firestore instance
export const getDb = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 Firestore not ready - please wait for Firebase initialization to complete');
  }
  return getOptimizedFirestore();
};

// ✅ SIMPLIFIED: Direct service exports without proxies
export const db = getDb;
export const firestore = getDb;
export const auth = getAuth;
export const storage = getStorage;
export const app = getApp;
export const functions = getFunctions;

// Auth helpers for AuthContext
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";

export const authHelpers = {
  signIn: async (email: string, password: string) => {
    if (!firebaseManager.isReady()) {
      throw new Error('🔥 Auth not ready for signIn');
    }
    const authInstance = getOptimizedAuth();
    return await signInWithEmailAndPassword(authInstance, email, password);
  },
  
  signUp: async (email: string, password: string) => {
    if (!firebaseManager.isReady()) {
      throw new Error('🔥 Auth not ready for signUp');
    }
    const authInstance = getOptimizedAuth();
    return await createUserWithEmailAndPassword(authInstance, email, password);
  },
  
  signOut: async () => {
    if (!firebaseManager.isReady()) {
      throw new Error('🔥 Auth not ready for signOut');
    }
    const authInstance = getOptimizedAuth();
    return await firebaseSignOut(authInstance);
  }
};

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

// Export configuration
export { firebaseConfig };