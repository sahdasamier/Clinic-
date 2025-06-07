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
  apiKey: "AIzaSyDotAr3OZOao6-2EGsg6xusem8ENdgRa-E",
  authDomain: "clinic-d9c0a.firebaseapp.com",
  projectId: "clinic-d9c0a",
  storageBucket: "clinic-d9c0a.firebasestorage.app",
  messagingSenderId: "430481926571",
  appId: "1:430481926571:web:4ac32749d6b0f674868aee",
  measurementId: "G-PKFMPKHVTZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Export for use in other files
export { auth, firestore, analytics };