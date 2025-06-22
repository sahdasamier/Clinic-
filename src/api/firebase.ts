// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyDotAr3OZOao6-2EGsg6xusem8ENdgRa-E",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "clinic-d9c0a.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "clinic-d9c0a",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "clinic-d9c0a.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "430481926571",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:430481926571:web:4ac32749d6b0f674868aee",
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || "G-PKFMPKHVTZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({})
  })
});

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