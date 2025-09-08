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
  // 1) Try to read from env (primary path during development/builds)
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  } as Record<string, string | undefined>;

  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const envMissing = required.filter(key => !envConfig[key]);

  // 2) Known configs as fallback to avoid broken builds/deploys due to missing/mismatched env
  const knownConfigs: Record<'development' | 'production', FirebaseConfig> = {
    development: {
      apiKey: 'AIzaSyDotAr3OZOao6-2EGsg6xusem8ENdgRa-E',
      authDomain: 'clinic-d9c0a.firebaseapp.com',
      projectId: 'clinic-d9c0a',
      storageBucket: 'clinic-d9c0a.firebasestorage.app',
      messagingSenderId: '430481926571',
      appId: '1:430481926571:web:4ac32749d6b0f674868aee',
      measurementId: 'G-PKFMPKHVTZ'
    },
    production: {
      apiKey: 'AIzaSyBU9NyJYqpve2-Ac_hvKOhUtFlRtb2yJlc',
      authDomain: 'clinicy-health.firebaseapp.com',
      projectId: 'clinicy-health',
      storageBucket: 'clinicy-health.firebasestorage.app',
      messagingSenderId: '61851414075',
      appId: '1:61851414075:web:5346d6a0d537557e0d361e',
      measurementId: 'G-8FP069MDN0'
    }
  };

  // Decide target by hostname when env incomplete or clearly wrong
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  // Strict production host whitelist
  const prodHosts = new Set<string>([
    'clinicy-health.firebaseapp.com',
    'clinicy-health.web.app'
  ]);
  const looksLikeProdHost = prodHosts.has(host);
  const forceProd = (import.meta as any).env?.VITE_FORCE_PROD === 'true';
  const forcedSelection = (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const override = window.localStorage.getItem('firebaseProject');
        if (override === 'prod') return 'prod';
        if (override === 'dev') return 'dev';
      }
    } catch {}
    return null;
  })();
  const fallback = looksLikeProdHost ? knownConfigs.production : knownConfigs.development;

  // If env is complete, use it; else fallback
  const usingEnv = envMissing.length === 0;
  let config: FirebaseConfig = usingEnv
    ? {
        apiKey: envConfig.apiKey!,
        authDomain: envConfig.authDomain!,
        projectId: envConfig.projectId!,
        storageBucket: envConfig.storageBucket!,
        messagingSenderId: envConfig.messagingSenderId!,
        appId: envConfig.appId!,
        measurementId: envConfig.measurementId
      }
    : fallback;

  // Respect explicit overrides first, but NEVER allow prod on non-prod hosts unless forceProd
  if (forcedSelection === 'dev') {
    config = knownConfigs.development;
  } else if (forcedSelection === 'prod') {
    const isLocal = /localhost|127\.0\.0\.1/.test(host);
    if (looksLikeProdHost || forceProd) {
      config = knownConfigs.production;
    } else if (isLocal) {
      console.warn('Ignoring localStorage prod override on localhost. Using development config.');
      config = knownConfigs.development;
    } else {
      console.warn('Ignoring prod override on non-production host. Using development config.');
      config = knownConfigs.development;
    }
  } else if (!forceProd) {
    // Default bias to development unless explicitly forced for production
    const isLocal = /localhost|127\.0\.0\.1/.test(host);
    config = isLocal || !looksLikeProdHost ? knownConfigs.development : knownConfigs.production;
  }

  // Force sane defaults by host:
  const isLocal = /localhost|127\.0\.0\.1/.test(host);
  if (isLocal && config.projectId !== knownConfigs.development.projectId) {
    console.warn('Local host detected but non-dev Firebase config provided. Forcing development config.');
    config = knownConfigs.development;
  }
  if (!isLocal && looksLikeProdHost && config.projectId !== knownConfigs.production.projectId) {
    console.warn('Production host detected but non-prod Firebase config provided. Forcing production config.');
    config = knownConfigs.production;
  }

  // Minimal sanity check: prevent obvious cross-project mixups
  const authDomainMatchesProject = config.authDomain.includes(config.projectId);
  if (!authDomainMatchesProject) {
    // Force internal consistency
    const safe = looksLikeProdHost ? knownConfigs.production : knownConfigs.development;
    console.warn('Firebase config authDomain/projectId mismatch detected. Using safe fallback for:', host);
    return safe;
  }

  if (!usingEnv) {
    console.warn('Using fallback Firebase config inferred from hostname:', host, config.projectId);
  }
  console.debug('Firebase project selected:', config.projectId, 'host:', host);

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