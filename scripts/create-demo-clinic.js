import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createDemoClinic() {
  try {
    console.log('🏥 Creating demo clinic...');
    
    const demoClinicData = {
      id: 'demo-clinic',
      name: 'Demo Clinic',
      isActive: true,
      settings: {
        allowedFeatures: ['patients', 'appointments', 'payments', 'inventory', 'notifications', 'settings'],
        maxUsers: 50,
        subscriptionPlan: 'premium',
      },
      address: '123 Demo Street, Demo City',
      phone: '+1-555-0123',
      email: 'demo@clinic.com',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'system',
    };

    await setDoc(doc(db, 'clinics', 'demo-clinic'), demoClinicData);
    console.log('✅ Demo clinic created successfully!');
    
    // Verify creation
    const clinicDoc = await getDoc(doc(db, 'clinics', 'demo-clinic'));
    if (clinicDoc.exists()) {
      const data = clinicDoc.data();
      console.log('✅ Verification successful:', {
        name: data.name,
        isActive: data.isActive,
        settings: data.settings
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo clinic:', error);
    process.exit(1);
  }
}

createDemoClinic(); 