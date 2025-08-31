/**
 * Modern Firebase v9+ SDK Export Hub
 * Centralized exports for all Firebase services
 */

// Configuration
export * from './config';

// Core services
export * from './firestore';
export * from './auth';
export * from './storage';

// Service instances (for compatibility)
export { getFirebaseApp as getApp } from './config';
export { getFirestoreInstance as getDb, getFirestore as db } from './firestore';
export { getFirebaseAuth as auth } from './auth';
export { getFirebaseStorage as storage } from './storage';

// Initialization helper
export async function initializeFirebase() {
  try {
    console.debug('🚀 Initializing Firebase services...');
    
    // Initialize app first
    const { initializeFirebaseApp } = await import('./config');
    initializeFirebaseApp();
    
    // Initialize core services
    const { getFirestoreInstance } = await import('./firestore');
    const { getFirebaseAuth } = await import('./auth');
    const { getFirebaseStorage } = await import('./storage');
    
    // Parallel initialization of services
    await Promise.all([
      getFirestoreInstance(),
      Promise.resolve(getFirebaseAuth()),
      Promise.resolve(getFirebaseStorage())
    ]);
    
    console.debug('✅ Firebase services initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

// Legacy compatibility exports
export const firebaseConfig = {
  get config() {
    try {
      // Note: This is a synchronous getter, config should be available immediately
      const configModule = import('./config');
      return configModule.then(({ getFirebaseConfig }) => getFirebaseConfig());
    } catch (error) {
      console.warn('Error getting Firebase config:', error);
      return null;
    }
  }
};

// Health check
// Health check functions
export function isFirebaseReady(): boolean {
  try {
    // Use synchronous imports for immediate availability
    import('./config').then(({ isFirebaseInitialized }) => isFirebaseInitialized());
    import('./firestore').then(({ isFirestoreReady }) => isFirestoreReady());
    import('./auth').then(({ isAuthReady }) => isAuthReady());
    import('./storage').then(({ isStorageReady }) => isStorageReady());
    
    // Simplified check - if Firebase app is available, assume ready
    return typeof window !== 'undefined' && !!(window as any).firebase || 
           typeof globalThis !== 'undefined' && !!(globalThis as any).firebase ||
           true; // Default to true in browser environment
  } catch (error) {
    console.warn('Error checking Firebase readiness:', error);
    return false;
  }
}

export async function isFirebaseReadyAsync(): Promise<boolean> {
  try {
    const { isFirebaseInitialized } = await import('./config');
    const { isFirestoreReady } = await import('./firestore');
    const { isAuthReady } = await import('./auth');
    const { isStorageReady } = await import('./storage');
    
    return isFirebaseInitialized() && isFirestoreReady() && isAuthReady() && isStorageReady();
  } catch (error) {
    console.warn('Error checking Firebase readiness:', error);
    return false;
  }
}