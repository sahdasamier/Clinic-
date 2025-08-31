import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getOptimizedFirestore, getOptimizedAuth, firebaseManager } from '@lib/firebase/legacy-compat';
import { createUserAccount } from '@lib/api/auth';

// Helper to get safe database reference
const getDb = async () => {
  // Try synchronous cached version first
  if (firebaseManager.isReadySync()) {
    try {
      return firebaseManager.getFirestoreSync();
    } catch (error) {
      console.warn('⚠️ Sync access failed, falling back to async:', error);
    }
  }
  
  // Fallback to async version
  if (!(await firebaseManager.isReady())) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  
  // Ensure instances are cached
  await firebaseManager.cacheInstances();
  
  return await getOptimizedFirestore();
};

// Helper to get safe auth reference
const getAuth = async () => {
  // Try synchronous cached version first
  if (firebaseManager.isReadySync()) {
    try {
      return firebaseManager.getAuthSync();
    } catch (error) {
      console.warn('⚠️ Sync auth access failed, falling back to async:', error);
    }
  }
  
  // Fallback to async version
  if (!(await firebaseManager.isReady())) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  
  // Ensure instances are cached
  await firebaseManager.cacheInstances();
  
  return getOptimizedAuth();
};

export const initializeFirestore = async () => {
  try {
    console.log('🚀 Initializing Firestore with demo data...');

    // Check if Firebase is ready
    if (!firebaseManager.isReady()) {
      console.log('⚠️ Firebase not ready - skipping Firestore initialization');
      return false;
    }

    // Check if user is authenticated before trying to write
    const auth = await getAuth();
    if (!auth.currentUser) {
      console.log('⚠️ No authenticated user - skipping Firestore initialization');
      return false;
    }

    // Create demo clinic
    const demoClinicData = {
      id: 'demo-clinic',
      name: 'Demo Clinic',
      isActive: true,
      settings: {
        allowedFeatures: ['patients', 'appointments', 'payments', 'laboratoryRadiology'],
        maxUsers: 50,
        subscriptionPlan: 'premium',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: auth.currentUser.email || 'system',
    };

    // Use setDoc with specific ID
    const db = await getDb();
    await setDoc(doc(db, 'clinics', 'demo-clinic'), demoClinicData);

    console.log('✅ Demo clinic created successfully');

    // Create some sample data collections structure (only if needed)
    const collections = ['patients', 'appointments', 'laboratoryRadiology'];
    
    for (const collectionName of collections) {
      try {
        // Create a dummy document to initialize the collection
        const db = await getDb();
        await addDoc(collection(db, collectionName), {
          _initialized: true,
          createdAt: new Date(),
          clinicId: 'demo-clinic',
        });
        console.log(`✅ ${collectionName} collection initialized`);
      } catch (collectionError) {
        console.warn(`⚠️ Could not initialize ${collectionName} collection:`, collectionError);
      }
    }

    console.log('🎉 Firestore initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    return false;
  }
};

// Function to check if demo clinic exists and is active
export const checkDemoClinicExists = async (): Promise<{ exists: boolean; isActive?: boolean }> => {
  try {
    const db = await getDb();
    const demoClinicRef = doc(db, 'clinics', 'demo-clinic');
    const docSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(demoClinicRef));
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('🏥 Demo clinic found:', {
        name: data.name,
        isActive: data.isActive,
        settings: data.settings
      });
      return { exists: true, isActive: data.isActive };
    } else {
      console.log('⚠️ Demo clinic does not exist');
      return { exists: false };
    }
  } catch (error) {
    console.error('❌ Error checking demo clinic:', error);
    return { exists: false };
  }
};

// Function to create a test user account
export const createTestUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'management' | 'doctor' | 'receptionist';
}) => {
  try {
    console.log(`🔧 Creating test user: ${userData.email}`);
    
    const result = await createUserAccount({
      ...userData,
      clinicId: 'demo-clinic',
    });

    if (result.success) {
      console.log(`✅ Test user ${userData.email} created successfully`);
      return true;
    } else {
      console.error(`❌ Failed to create test user: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    return false;
  }
};

// Force create/update demo clinic to ensure it's active (SAFE VERSION)
export const ensureDemoClinicActive = async (): Promise<boolean> => {
  try {
    console.log('🔧 Ensuring demo clinic is active...');
    
    // Check if Firebase is ready
    if (!firebaseManager.isReady()) {
      console.log('⚠️ Firebase not ready - skipping demo clinic activation');
      return false;
    }

    // Check if user is authenticated before trying to write
    const auth = await getAuth();
    if (!auth.currentUser) {
      console.log('⚠️ No authenticated user - skipping demo clinic activation');
      return false;
    }
    
    // Always create/update the demo clinic to ensure it's active
    const demoClinicData = {
      id: 'demo-clinic',
      name: 'Demo Clinic',
      isActive: true, // Force active
      settings: {
        allowedFeatures: ['patients', 'appointments', 'payments', 'laboratoryRadiology'],
        maxUsers: 50,
        subscriptionPlan: 'premium',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: auth.currentUser.email || 'system',
    };

    const db = await getDb();
    await setDoc(doc(db, 'clinics', 'demo-clinic'), demoClinicData);
    console.log('✅ Demo clinic created/updated and set to active');
    return true;
  } catch (error) {
    console.error('❌ Error ensuring demo clinic is active:', error);
    return false;
  }
};

// Call this function when the app starts - SAFE NON-BLOCKING VERSION
export const ensureDemoClinicExists = async () => {
  try {
    // Check if we can read (this doesn't require write permissions)
    const clinicStatus = await checkDemoClinicExists();
    
    if (!clinicStatus.exists) {
      console.log('📋 Demo clinic not found - will create when admin logs in');
      // Don't try to create immediately - wait for admin login
      return false;
    } else if (!clinicStatus.isActive) {
      console.log('⚠️ Demo clinic exists but is inactive - will activate when admin logs in');
      // Don't try to activate immediately - wait for admin login
      return false;
    } else {
      console.log('✅ Demo clinic already exists and is active');
      return true;
    }
  } catch (error) {
    console.warn('⚠️ Could not check demo clinic status (this is normal on first load):', error);
    return false;
  }
};

// Function to be called after admin authentication
export const initializeDemoClinicAfterAuth = async () => {
  try {
    console.log('🔧 Post-authentication demo clinic initialization...');
    
    const clinicStatus = await checkDemoClinicExists();
    
    if (!clinicStatus.exists) {
      console.log('📋 Creating demo clinic after authentication...');
      return await initializeFirestore();
    } else if (!clinicStatus.isActive) {
      console.log('⚠️ Activating demo clinic after authentication...');
      return await ensureDemoClinicActive();
    } else {
      console.log('✅ Demo clinic is already properly configured');
      return true;
    }
  } catch (error) {
    console.error('❌ Error in post-authentication initialization:', error);
    return false;
  }
}; 