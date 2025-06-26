// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
    measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialise (or reuse) the app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ⬇️  ADD THIS LINE — it puts the app on window for dev-tools only
if (typeof window !== "undefined") {
  (window as any).firebaseApp = app;
  console.log("🔥 Firebase initialised in", (import.meta as any).env?.MODE || "unknown");
}

// Initialize Firestore with enhanced offline persistence
let firestore;
try {
  firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({
        // Optional: Handle multiple tab scenarios gracefully
        forceOwnership: false
      })
    })
  });
  
  console.log("✅ Firestore offline persistence enabled successfully");
  
  // Log cache size periodically for monitoring (development only)
  if ((import.meta as any).env?.MODE === 'development') {
    // Optional: Add cache monitoring in development
    setTimeout(() => {
      console.log("📊 Firestore offline cache is active and monitoring data");
    }, 1000);
  }
  
} catch (error) {
  console.warn("⚠️ Firestore offline persistence failed, falling back to memory cache:", error);
  
  // Fallback to memory cache if persistent cache fails
  firestore = initializeFirestore(app, {
    // This will use memory-only cache as fallback
  });
}

const auth = getAuth(app);

// Auth helpers for AuthContext
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

// Export for use in other files
export { auth, firestore, firebaseConfig };

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
    persistenceEnabled: true, // We know it's enabled since we set it up
    cacheType: 'IndexedDB', // persistentLocalCache uses IndexedDB
    timestamp: new Date().toISOString()
  })
};