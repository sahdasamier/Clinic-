/**
 * Firebase Functions Module
 * Provides Firebase Cloud Functions integration
 */

import { getFunctions, connectFunctionsEmulator, httpsCallable, type Functions } from 'firebase/functions';
import { getFirebaseApp } from './config';

let functionsInstance: Functions | null = null;
let isEmulatorConnected = false;
let isFunctionsInitialized = false;

/**
 * Get Firebase Functions instance
 */
export function getFirebaseFunctions(): Functions {
  if (!functionsInstance) {
    const app = getFirebaseApp();
    functionsInstance = getFunctions(app);
    isFunctionsInitialized = true;
    
    // Connect to emulator in development
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true' && !isEmulatorConnected) {
      try {
        connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
        isEmulatorConnected = true;
        console.log('🔧 Connected to Firebase Functions emulator');
      } catch (error) {
        console.warn('⚠️ Failed to connect to Functions emulator:', error);
      }
    }
  }
  
  return functionsInstance;
}

/**
 * Check if Functions is ready
 */
export function isFunctionsReady(): boolean {
  return isFunctionsInitialized && !!functionsInstance;
}

/**
 * Call a cloud function
 */
export function callFunction<T = any, R = any>(functionName: string, data?: T): Promise<R> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<T, R>(functions, functionName);
  return callable(data).then(result => result.data);
}

// Alias for compatibility
export const getFunctionsInstance = getFirebaseFunctions;