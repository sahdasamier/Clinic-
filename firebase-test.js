// Firebase Configuration Test
// This script tests if the Firebase configuration is properly loaded

console.log('🔥 Testing Firebase Configuration...');

// Check if environment variables are loaded
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('📋 Environment Variables Check:');
requiredVars.forEach(varName => {
  const value = import.meta.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
  }
});

// Test Firebase initialization
async function testFirebaseInit() {
  try {
    console.log('🚀 Testing Firebase initialization...');
    
    const { initializeFirebase } = await import('@lib/firebase');
    await initializeFirebase();
    
    console.log('✅ Firebase initialization successful');
    
    // Test Firestore access
    const { getFirestoreInstance } = await import('@lib/firebase/firestore');
    const firestore = await getFirestoreInstance();
    
    console.log('✅ Firestore access successful');
    
    // Test Auth access
    const { getFirebaseAuth } = await import('@lib/firebase/auth');
    const auth = getFirebaseAuth();
    
    console.log('✅ Auth access successful');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
}

// Run the test
testFirebaseInit().then(success => {
  if (success) {
    console.log('🎉 All Firebase tests passed!');
  } else {
    console.log('💥 Firebase tests failed!');
  }
});
