// ✅ OPTIMIZED FIREBASE CONFIGURATION
// Addresses dynamic import warnings and improves sync performance

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  enableMultiTabIndexedDbPersistence,
  type Firestore,
  connectFirestoreEmulator
} from "firebase/firestore";
import { 
  getAuth,
  type Auth,
  connectAuthEmulator
} from "firebase/auth";
import { getStorage, type FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import { getFunctions, type Functions, connectFunctionsEmulator } from "firebase/functions";

// Enhanced Firebase configuration with environment validation
export interface OptimizedFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Validate environment configuration
function validateFirebaseConfig(): OptimizedFirebaseConfig {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  // Validate required fields
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }

  return config;
}

// Singleton class for optimized Firebase services
class OptimizedFirebaseManager {
  private static instance: OptimizedFirebaseManager;
  private app: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private auth: Auth | null = null;
  private storage: FirebaseStorage | null = null;
  private analytics: Analytics | null = null;
  private messaging: Messaging | null = null;
  private functions: Functions | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): OptimizedFirebaseManager {
    if (!OptimizedFirebaseManager.instance) {
      OptimizedFirebaseManager.instance = new OptimizedFirebaseManager();
    }
    return OptimizedFirebaseManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const config = validateFirebaseConfig();
      
      // Initialize or reuse existing app
      this.app = getApps().length ? getApp() : initializeApp(config);
      
      // Initialize services in optimal order
      await this.initializeFirestore();
      this.initializeAuth();
      this.initializeStorage();
      this.initializeAnalytics();
      await this.initializeMessaging();
      this.initializeFunctions();

      // Setup development tools
      if (import.meta.env.MODE === 'development') {
        this.setupDevelopmentTools();
      }

      this.isInitialized = true;
      console.log("🔥 Optimized Firebase initialized successfully");
      
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      throw error;
    }
  }

  private async initializeFirestore(): Promise<void> {
    if (!this.app) throw new Error("Firebase app not initialized");

    try {
      // Try enhanced offline persistence first
      this.firestore = initializeFirestore(this.app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({
            forceOwnership: false
          })
        })
      });
      
      console.log("✅ Firestore with enhanced offline persistence initialized");
      
    } catch (error) {
      console.warn("⚠️ Enhanced persistence failed, trying multi-tab persistence:", error);
      
      try {
        // Fallback to multi-tab persistence
        this.firestore = initializeFirestore(this.app, {});
        await enableMultiTabIndexedDbPersistence(this.firestore);
        console.log("✅ Firestore with multi-tab persistence initialized");
        
      } catch (fallbackError) {
        console.warn("⚠️ Multi-tab persistence failed, using memory cache:", fallbackError);
        
        // Final fallback to memory cache
        this.firestore = initializeFirestore(this.app, {});
        console.log("✅ Firestore with memory cache initialized");
      }
    }

    // Setup development emulator
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(this.firestore, 'localhost', 8080);
        console.log("🔧 Connected to Firestore emulator");
      } catch (error) {
        console.log("Firestore emulator not available");
      }
    }
  }

  private initializeAuth(): void {
    if (!this.app) throw new Error("Firebase app not initialized");
    
    this.auth = getAuth(this.app);
    
    // Setup development emulator
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(this.auth, "http://localhost:9099");
        console.log("🔧 Connected to Auth emulator");
      } catch (error) {
        console.log("Auth emulator not available");
      }
    }
    
    console.log("✅ Firebase Auth initialized");
  }

  private initializeStorage(): void {
    if (!this.app) throw new Error("Firebase app not initialized");
    
    this.storage = getStorage(this.app);
    
    // Setup development emulator
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectStorageEmulator(this.storage, "localhost", 9199);
        console.log("🔧 Connected to Storage emulator");
      } catch (error) {
        console.log("Storage emulator not available");
      }
    }
    
    console.log("✅ Firebase Storage initialized");
  }

  private initializeAnalytics(): void {
    if (!this.app) throw new Error("Firebase app not initialized");
    
    try {
      this.analytics = getAnalytics(this.app);
      console.log("✅ Firebase Analytics initialized");
    } catch (error) {
      console.warn("⚠️ Analytics initialization failed:", error);
    }
  }

  private async initializeMessaging(): Promise<void> {
    if (!this.app || typeof window === 'undefined') return;
    
    try {
      const supported = await isSupported();
      if (supported) {
        this.messaging = getMessaging(this.app);
        console.log("✅ Firebase Cloud Messaging initialized");
      } else {
        console.log("⚠️ Cloud Messaging not supported in this browser");
      }
    } catch (error) {
      console.warn("⚠️ Messaging initialization failed:", error);
    }
  }

  private initializeFunctions(): void {
    if (!this.app) throw new Error("Firebase app not initialized");
    
    this.functions = getFunctions(this.app);
    
    // Setup development emulator
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFunctionsEmulator(this.functions, "localhost", 5001);
        console.log("🔧 Connected to Functions emulator");
      } catch (error) {
        console.log("Functions emulator not available");
      }
    }
    
    console.log("✅ Firebase Functions initialized");
  }

  private setupDevelopmentTools(): void {
    if (typeof window !== 'undefined' && this.app) {
      (window as any).firebaseApp = this.app;
      (window as any).firebaseServices = {
        app: this.app,
        firestore: this.firestore,
        auth: this.auth,
        storage: this.storage,
        analytics: this.analytics,
        messaging: this.messaging,
        functions: this.functions
      };
      console.log("🔧 Firebase development tools attached to window");
    }
  }

  // Getters for services
  getApp(): FirebaseApp {
    if (!this.app) throw new Error("Firebase not initialized");
    return this.app;
  }

  getFirestore(): Firestore {
    if (!this.firestore) throw new Error("Firestore not initialized");
    return this.firestore;
  }

  getAuth(): Auth {
    if (!this.auth) throw new Error("Auth not initialized");
    return this.auth;
  }

  getStorage(): FirebaseStorage {
    if (!this.storage) throw new Error("Storage not initialized");
    return this.storage;
  }

  getAnalytics(): Analytics | null {
    return this.analytics;
  }

  getMessaging(): Messaging | null {
    return this.messaging;
  }

  getFunctions(): Functions {
    if (!this.functions) throw new Error("Functions not initialized");
    return this.functions;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const firebaseManager = OptimizedFirebaseManager.getInstance();

// Convenience exports for backward compatibility
export async function initializeOptimizedFirebase(): Promise<void> {
  await firebaseManager.initialize();
}

export function getOptimizedFirestore(): Firestore {
  return firebaseManager.getFirestore();
}

export function getOptimizedAuth(): Auth {
  return firebaseManager.getAuth();
}

export function getOptimizedStorage(): FirebaseStorage {
  return firebaseManager.getStorage();
}

export function getOptimizedAnalytics(): Analytics | null {
  return firebaseManager.getAnalytics();
}

export function getOptimizedMessaging(): Messaging | null {
  return firebaseManager.getMessaging();
}

export function getOptimizedFunctions(): Functions {
  return firebaseManager.getFunctions();
}

// Export configuration for external use
export { validateFirebaseConfig }; 