// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Export for use in other files
export { auth, firestore, analytics, firebaseConfig };

// Export firestore as db for backward compatibility
export const db = firestore;