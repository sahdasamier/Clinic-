/**
 * Modern Firestore v9+ Configuration
 * Optimized Firestore setup with offline persistence
 */

import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  enableMultiTabIndexedDbPersistence,
  connectFirestoreEmulator,
  type Firestore
} from 'firebase/firestore';
import { getFirebaseApp } from './config';

let firestoreInstance: Firestore | null = null;
let initializationPromise: Promise<Firestore> | null = null;

/**
 * Enhanced Firestore initialization with offline persistence
 */
async function initializeFirestoreWithPersistence(): Promise<Firestore> {
  const app = getFirebaseApp();

  try {
    // Try to get existing instance first
    try {
      const existingDb = getFirestore(app);
      if (existingDb) {
        console.debug('💾 Using existing Firestore instance');
        return existingDb;
      }
    } catch (error) {
      // Instance doesn't exist yet, continue with initialization
    }

    // Try enhanced offline persistence (v9+ preferred method)
    try {
      const db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({
            forceOwnership: false
          })
        })
      });
      
      console.debug('💾 Firestore initialized with enhanced offline persistence');
      return db;
    } catch (enhancedError) {
      console.warn('⚠️ Enhanced persistence failed, falling back to legacy mode:', enhancedError);
    }

    // Fallback to multi-tab persistence
    try {
      const db = initializeFirestore(app, {});
      await enableMultiTabIndexedDbPersistence(db);
      console.debug('💾 Firestore initialized with multi-tab persistence');
      return db;
    } catch (multiTabError) {
      console.warn('⚠️ Multi-tab persistence failed, using in-memory cache:', multiTabError);
    }

    // Final fallback - basic Firestore without persistence
    const db = getFirestore(app);
    console.debug('💾 Firestore initialized without persistence');
    return db;

  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    throw error;
  }
}

/**
 * Gets the Firestore instance - initializes if needed
 */
export async function getFirestoreInstance(): Promise<Firestore> {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = initializeFirestoreWithPersistence();
  
  try {
    firestoreInstance = await initializationPromise;
    
    // Setup emulator in development
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
      const emulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost';
      const emulatorPort = parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || '8080');
      
      try {
        connectFirestoreEmulator(firestoreInstance, emulatorHost, emulatorPort);
        console.debug(`🔧 Connected to Firestore emulator at ${emulatorHost}:${emulatorPort}`);
      } catch (emulatorError) {
        console.warn('⚠️ Failed to connect to Firestore emulator:', emulatorError);
      }
    }
    
    return firestoreInstance;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

/**
 * Synchronous getter for Firestore (throws if not initialized)
 */
export function getFirestore(): Firestore {
  if (!firestoreInstance) {
    throw new Error('Firestore not initialized. Call getFirestoreInstance() first.');
  }
  return firestoreInstance;
}

/**
 * Checks if Firestore is initialized
 */
export function isFirestoreReady(): boolean {
  return firestoreInstance !== null;
}

/**
 * Gets Firestore offline status utilities
 */
export const firestoreUtils = {
  isOffline: () => !navigator.onLine,
  
  onOfflineStateChange: (callback: (isOffline: boolean) => void) => {
    const handleOnline = () => {
      console.debug('🌐 Back online - Firestore will sync pending changes');
      callback(false);
    };
    
    const handleOffline = () => {
      console.debug('📱 Offline - Using Firestore cached data');
      callback(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};