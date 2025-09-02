// Test file to debug Firebase permissions issue
// This file will help identify the root cause of the "Missing or insufficient permissions" error

console.log('🔍 Starting Firebase permissions debug test...');

// Test 1: Check if user is authenticated
async function testUserAuthentication() {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    console.log('✅ User authentication test:', {
      isAuthenticated: !!user,
      email: user?.email,
      uid: user?.uid,
      emailVerified: user?.emailVerified
    });
    
    return user;
  } catch (error) {
    console.error('❌ User authentication test failed:', error);
    return null;
  }
}

// Test 2: Check user's custom claims
async function testUserClaims() {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('⚠️ No authenticated user for claims test');
      return null;
    }
    
    const token = await user.getIdTokenResult();
    
    console.log('✅ User claims test:', {
      admin: token.claims.admin,
      clinicId: token.claims.clinicId,
      role: token.claims.role,
      allClaims: token.claims
    });
    
    return token.claims;
  } catch (error) {
    console.error('❌ User claims test failed:', error);
    return null;
  }
}

// Test 3: Check Firestore rules for medicalRequirements collection
async function testFirestoreAccess() {
  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const db = getFirestore();
    
    // Test reading from medicalRequirements collection
    const testDocRef = doc(db, 'clinics', 'demo-clinic', 'medicalRequirements', 'test-doc');
    
    try {
      const docSnap = await getDoc(testDocRef);
      console.log('✅ Firestore read test:', {
        exists: docSnap.exists(),
        hasPermission: true
      });
    } catch (readError) {
      console.log('❌ Firestore read test failed:', readError.message);
    }
    
    // Test writing to medicalRequirements collection
    const { setDoc } = await import('firebase/firestore');
    const testWriteData = {
      testField: 'test-value',
      timestamp: new Date().toISOString()
    };
    
    try {
      await setDoc(testDocRef, testWriteData);
      console.log('✅ Firestore write test: Success');
      
      // Clean up test document
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(testDocRef);
      console.log('✅ Test document cleaned up');
    } catch (writeError) {
      console.log('❌ Firestore write test failed:', writeError.message);
    }
    
  } catch (error) {
    console.error('❌ Firestore access test failed:', error);
  }
}

// Test 4: Check specific medical requirement order access
async function testMedicalRequirementOrderAccess() {
  try {
    const { getFirestore, collection, query, getDocs, where } = await import('firebase/firestore');
    const db = getFirestore();
    
    // Try to access medicalRequirements collection
    const medicalRequirementsRef = collection(db, 'clinics', 'demo-clinic', 'medicalRequirements');
    const q = query(medicalRequirementsRef, where('isActive', '==', true));
    
    try {
      const querySnapshot = await getDocs(q);
      console.log('✅ Medical requirements collection access test:', {
        documentsCount: querySnapshot.size,
        hasPermission: true
      });
      
      // Try to access first document
      if (!querySnapshot.empty) {
        const firstDoc = querySnapshot.docs[0];
        console.log('✅ First medical requirement document:', {
          id: firstDoc.id,
          data: firstDoc.data()
        });
      }
      
    } catch (queryError) {
      console.log('❌ Medical requirements collection query failed:', queryError.message);
    }
    
  } catch (error) {
    console.error('❌ Medical requirement order access test failed:', error);
  }
}

// Test 5: Check user's clinic association
async function testUserClinicAssociation() {
  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');
    
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('⚠️ No authenticated user for clinic association test');
      return;
    }
    
    // Try to get user's profile from users collection
    const userDocRef = doc(db, 'users', user.uid);
    
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ User clinic association test:', {
          clinicId: userData.clinicId,
          role: userData.role,
          isActive: userData.isActive
        });
      } else {
        console.log('⚠️ User document does not exist in users collection');
      }
    } catch (userDocError) {
      console.log('❌ User document access failed:', userDocError.message);
    }
    
  } catch (error) {
    console.error('❌ User clinic association test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive permissions debug...\n');
  
  await testUserAuthentication();
  console.log('');
  
  await testUserClaims();
  console.log('');
  
  await testFirestoreAccess();
  console.log('');
  
  await testMedicalRequirementOrderAccess();
  console.log('');
  
  await testUserClinicAssociation();
  console.log('');
  
  console.log('🏁 Permissions debug test completed');
}

// Export for use in browser console
window.runPermissionsDebug = runAllTests;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  console.log('🔍 Permissions debug script loaded. Run window.runPermissionsDebug() to test permissions.');
}
