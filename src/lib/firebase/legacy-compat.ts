/**
 * Legacy Compatibility Layer
 * Provides compatibility for old import paths during refactoring
 */

// Re-export modern Firebase services with legacy names for compatibility
export { getFirebaseApp as getApp } from './config';
export { getFirestoreInstance as getOptimizedFirestore, getFirestore as db, getFirestore as getOptimizedFirestoreSync } from './firestore';
export { getFirebaseAuth as getOptimizedAuth, getAuth as getOptimizedAuthSync, authService as authHelpers, getFirebaseAuth as auth } from './auth';
export { getFirebaseStorage as getOptimizedStorage } from './storage';
export { getFirebaseFunctions as getOptimizedFunctions } from './functions';
export { getFirebaseMessaging as getOptimizedMessaging } from '../api/messaging';
export { getFirebaseAnalytics as getOptimizedAnalytics } from '../api/analytics';
export { validateConfig as validateFirebaseConfig } from './config';

// Additional compatibility exports
export { getFirebaseConfig as firebaseConfig } from './config';
export { isFirebaseInitialized as isOptimizedFirebaseReady } from './config';

// Combined services getter
export async function getOptimizedServices() {
  const isReady = await firebaseManager.isReady();
  return {
    app: await firebaseManager.getApp(),
    firestore: isReady ? (await import('./firestore')).getFirestoreInstance() : null,
    auth: isReady ? (await import('./auth')).getFirebaseAuth() : null,
    storage: isReady ? (await import('./storage')).getFirebaseStorage() : null,
    functions: isReady ? (await import('./functions')).getFirebaseFunctions() : null,
    messaging: isReady ? (await import('../api/messaging')).getFirebaseMessaging() : null,
    analytics: isReady ? (await import('../api/analytics')).getFirebaseAnalytics() : null,
  };
}

// Cached Firebase instances for synchronous access
let cachedApp: any = null;
let cachedFirestore: any = null;
let cachedAuth: any = null;

// Firebase manager compatibility
export const firebaseManager = {
  isReady: async () => {
    try {
      const { isFirebaseInitialized } = await import('./config');
      const { isFirestoreReady } = await import('./firestore');
      const { isAuthReady } = await import('./auth');
      
      return isFirebaseInitialized() && isFirestoreReady() && isAuthReady();
    } catch (error) {
      console.warn('Error checking Firebase readiness:', error);
      return false;
    }
  },
  
  // Synchronous version for getters - uses cached instances
  isReadySync: () => {
    try {
      // Quick check using cached instances
      return cachedFirestore !== null && cachedAuth !== null && cachedApp !== null;
    } catch (error) {
      return false;
    }
  },
  
  getApp: async () => {
    try {
      const { getFirebaseApp } = await import('./config');
      const app = getFirebaseApp();
      cachedApp = app; // Cache for sync access
      return app;
    } catch (error) {
      console.warn('Error getting Firebase app:', error);
      return null;
    }
  },
  
  // Synchronous version for getters - returns cached instance
  getAppSync: () => {
    return cachedApp;
  },
  
  // Synchronous getters for cached instances
  getFirestoreSync: () => {
    if (!cachedFirestore) {
      throw new Error('Firestore not cached yet - call cacheInstances() first');
    }
    return cachedFirestore;
  },
  
  getAuthSync: () => {
    if (!cachedAuth) {
      throw new Error('Auth not cached yet - call cacheInstances() first');
    }
    return cachedAuth;
  },
  
  // Cache Firebase instances for synchronous access
  cacheInstances: async () => {
    try {
      const { getFirebaseApp } = await import('./config');
      const { getFirestoreInstance, getFirestore } = await import('./firestore');
      const { getFirebaseAuth } = await import('./auth');
      
      cachedApp = getFirebaseApp();
      // Cache the async instance result for sync access
      cachedFirestore = await getFirestoreInstance();
      cachedAuth = getFirebaseAuth();
      
      console.log('✅ Firebase instances cached for synchronous access');
    } catch (error) {
      console.warn('⚠️ Failed to cache Firebase instances:', error);
    }
  },
  
  // Firebase Messaging
  getMessaging: async () => {
    try {
      const { getFirebaseMessaging } = await import('../api/messaging');
      return getFirebaseMessaging();
    } catch (error) {
      console.warn('Error getting Firebase Messaging:', error);
      return null;
    }
  },
  
  // Firebase Analytics
  getAnalytics: async () => {
    try {
      const { getFirebaseAnalytics } = await import('../api/analytics');
      return getFirebaseAnalytics();
    } catch (error) {
      console.warn('Error getting Firebase Analytics:', error);
      return null;
    }
  },
  
  getStatus: async () => {
    return (await firebaseManager.isReady()) ? 'ready' : 'initializing';
  },
  
  initialize: async () => {
    try {
      const { initializeFirebase } = await import('./index');
      const result = await initializeFirebase();
      
      // Cache instances after successful initialization
      await firebaseManager.cacheInstances();
      
      return result;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
};

// Legacy export compatibility
export * from './index';