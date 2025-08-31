/**
 * Modern Firebase v9+ Configuration
 * Centralized Firebase setup with optimized initialization
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Validates that all required Firebase environment variables are present
 */
export function validateConfig(): FirebaseConfig {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}\nPlease check your .env file.`);
  }

  return config;
}

/**
 * Firebase app instance - singleton pattern
 */
let firebaseApp: FirebaseApp | null = null;

/**
 * Initializes Firebase app if not already initialized
 */
export function initializeFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const config = validateConfig();
    
    // Check if app already exists (happens in dev with hot reload)
    if (getApps().length > 0) {
      firebaseApp = getApp();
      console.debug('📱 Using existing Firebase app');
    } else {
      firebaseApp = initializeApp(config);
      console.debug('📱 Firebase app initialized');
    }
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase app:', error);
    throw error;
  }
}

/**
 * Gets the current Firebase app instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    return initializeFirebaseApp();
  }
  return firebaseApp;
}

/**
 * Checks if Firebase app is initialized
 */
export function isFirebaseInitialized(): boolean {
  return firebaseApp !== null;
}

/**
 * Gets the Firebase configuration (safe for client use)
 */
export function getFirebaseConfig(): Omit<FirebaseConfig, 'apiKey'> {
  const config = validateConfig();
  // Return config without API key for security
  const { apiKey, ...publicConfig } = config;
  return publicConfig;
}