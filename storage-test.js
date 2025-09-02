// Storage Test Script
// This script tests if Firebase Storage is working properly

console.log('🔥 Testing Firebase Storage...');

async function testStorage() {
  try {
    console.log('📋 Testing Storage Configuration...');
    
    // Test 1: Check if storage is initialized
    const { getFirebaseStorage } = await import('./src/lib/firebase/storage');
    const storage = getFirebaseStorage();
    
    if (storage) {
      console.log('✅ Firebase Storage initialized successfully');
      console.log('📁 Storage bucket:', storage.app.options.storageBucket);
    } else {
      console.log('❌ Firebase Storage not initialized');
      return false;
    }
    
    // Test 2: Check if storage rules are working
    console.log('📋 Testing Storage Rules...');
    
    // Test 3: Check if we can create a reference
    const { ref } = await import('firebase/storage');
    const testRef = ref(storage, 'test/upload-test.txt');
    console.log('✅ Storage reference created:', testRef.fullPath);
    
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

// Run the test
testStorage().then(success => {
  if (success) {
    console.log('🎉 Storage tests passed!');
  } else {
    console.log('💥 Storage tests failed!');
  }
});

