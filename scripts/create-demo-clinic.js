const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
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
    const { getDoc } = require('firebase/firestore');
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