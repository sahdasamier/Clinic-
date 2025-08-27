// Simple Medical Requirements Persistence Test
// Run this in the browser console to test the system

console.log('🧪 Simple Medical Requirements Persistence Test');

// Test configuration
let testPatientId = null;
let testClinicId = null;

// Utility function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Step 1: Setup and find a test patient
const setupTest = async () => {
  try {
    console.log('🔧 Setting up test...');
    
    // Try to get clinic ID from various sources
    testClinicId = window.currentUser?.clinicId || 
                   window.userProfile?.clinicId || 
                   window.authUser?.clinicId;
    
    if (!testClinicId) {
      throw new Error('No clinic ID found. Please make sure you are logged in.');
    }
    
    console.log('✅ Clinic ID:', testClinicId);
    
    // Find a patient to test with
    const patients = await window.firebase.firestore()
      .collection('patients')
      .where('clinicId', '==', testClinicId)
      .limit(1)
      .get();
    
    if (patients.empty) {
      throw new Error('No patients found in this clinic');
    }
    
    testPatientId = patients.docs[0].id;
    const patientData = patients.docs[0].data();
    
    console.log('✅ Test patient:', { id: testPatientId, name: patientData.name });
    console.log('📊 Initial pending requirements count:', patientData.pendingRequirementsCount || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
};

// Step 2: Add a medical requirement
const addRequirement = async () => {
  try {
    console.log('📋 Adding medical requirement...');
    
    const requirementData = {
      patientId: testPatientId,
      title: 'Test Blood Test',
      type: 'laboratory',
      status: 'pending',
      dateOrdered: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'normal',
      description: 'Test requirement for persistence verification',
      orderedBy: 'Test System',
      clinicId: testClinicId,
      isActive: true
    };
    
    const docRef = await window.firebase.firestore()
      .collection(`clinics/${testClinicId}/medicalRequirements`)
      .add(requirementData);
    
    console.log('✅ Medical requirement added:', docRef.id);
    
    // Wait for background processes
    await wait(2000);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to add requirement:', error.message);
    return false;
  }
};

// Step 3: Check if patient document was updated
const checkPatientUpdate = async () => {
  try {
    console.log('🔥 Checking patient document update...');
    
    const patientDoc = await window.firebase.firestore()
      .collection('patients')
      .doc(testPatientId)
      .get();
    
    const data = patientDoc.data();
    const newCount = data.pendingRequirementsCount || 0;
    const hasPending = data.hasPendingRequirements || false;
    
    console.log('📊 Patient document state:', {
      pendingRequirementsCount: newCount,
      hasPendingRequirements: hasPending
    });
    
    if (newCount > 0 && hasPending === true) {
      console.log('✅ Patient document updated successfully!');
      return true;
    } else {
      console.error('❌ Patient document not updated as expected');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check patient update:', error.message);
    return false;
  }
};

// Step 4: Check patient list display
const checkPatientListDisplay = () => {
  try {
    console.log('📋 Checking patient list display...');
    
    // Look for the medical requirements column
    const table = document.querySelector('table');
    if (!table) {
      console.error('❌ No table found on page');
      return false;
    }
    
    // Find the medical requirements column
    const headers = table.querySelectorAll('thead th');
    let medicalRequirementsColumnIndex = -1;
    
    headers.forEach((header, index) => {
      const text = header.textContent.toLowerCase();
      if (text.includes('medical') || text.includes('requirement') || text.includes('pending')) {
        medicalRequirementsColumnIndex = index;
      }
    });
    
    if (medicalRequirementsColumnIndex === -1) {
      console.error('❌ Medical requirements column not found');
      return false;
    }
    
    console.log('📋 Medical requirements column found at index:', medicalRequirementsColumnIndex);
    
    // Find our test patient's row
    const rows = table.querySelectorAll('tbody tr');
    let patientRow = null;
    
    for (const row of rows) {
      const rowText = row.textContent;
      if (rowText.includes(testPatientId) || rowText.includes('Test')) {
        patientRow = row;
        break;
      }
    }
    
    if (!patientRow) {
      console.error('❌ Test patient row not found');
      return false;
    }
    
    // Check the medical requirements cell
    const cells = patientRow.querySelectorAll('td');
    const requirementsCell = cells[medicalRequirementsColumnIndex];
    
    if (!requirementsCell) {
      console.error('❌ Medical requirements cell not found');
      return false;
    }
    
    const cellText = requirementsCell.textContent.trim();
    console.log('📊 Medical requirements cell content:', cellText);
    
    if (cellText.includes('Yes') && cellText.includes('1')) {
      console.log('✅ Patient list correctly shows pending requirements!');
      return true;
    } else {
      console.error('❌ Expected "Yes (1)" but got:', cellText);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check patient list display:', error.message);
    return false;
  }
};

// Step 5: Test persistence after refresh simulation
const testPersistence = async () => {
  try {
    console.log('🔄 Testing persistence...');
    
    // Simulate refresh by manually refreshing counts
    if (typeof window.refreshMedicalRequirementsCounts === 'function') {
      console.log('🔄 Manually refreshing counts...');
      await window.refreshMedicalRequirementsCounts();
      await wait(2000);
    }
    
    // Check if data is still there
    const patientDoc = await window.firebase.firestore()
      .collection('patients')
      .doc(testPatientId)
      .get();
    
    const data = patientDoc.data();
    const countAfterRefresh = data.pendingRequirementsCount || 0;
    const hasPendingAfterRefresh = data.hasPendingRequirements || false;
    
    console.log('📊 State after refresh:', {
      countAfterRefresh,
      hasPendingAfterRefresh
    });
    
    if (countAfterRefresh > 0 && hasPendingAfterRefresh === true) {
      console.log('✅ Data persisted after refresh!');
      return true;
    } else {
      console.error('❌ Data did not persist after refresh');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to test persistence:', error.message);
    return false;
  }
};

// Step 6: Verify final consistency
const verifyConsistency = async () => {
  try {
    console.log('🔍 Verifying final consistency...');
    
    // Check patient document
    const patientDoc = await window.firebase.firestore()
      .collection('patients')
      .doc(testPatientId)
      .get();
    
    const patientData = patientDoc.data();
    
    // Check actual requirements
    const requirementsSnapshot = await window.firebase.firestore()
      .collection(`clinics/${testClinicId}/medicalRequirements`)
      .where('patientId', '==', testPatientId)
      .where('status', '==', 'pending')
      .get();
    
    const actualPendingCount = requirementsSnapshot.docs.length;
    
    console.log('📊 Final verification:', {
      patientPendingCount: patientData.pendingRequirementsCount,
      patientHasPending: patientData.hasPendingRequirements,
      actualPendingRequirements: actualPendingCount
    });
    
    if (patientData.pendingRequirementsCount === actualPendingCount && 
        patientData.hasPendingRequirements === (actualPendingCount > 0)) {
      console.log('✅ Final state is consistent!');
      return true;
    } else {
      console.error('❌ Final state is inconsistent');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to verify consistency:', error.message);
    return false;
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting Medical Requirements Persistence Test...');
  console.log('=' .repeat(50));
  
  const results = [];
  
  // Step 1: Setup
  results.push(await setupTest());
  if (!results[0]) {
    console.error('💥 Test failed at setup');
    return;
  }
  
  // Step 2: Add requirement
  results.push(await addRequirement());
  if (!results[1]) {
    console.error('💥 Test failed at adding requirement');
    return;
  }
  
  // Step 3: Check patient update
  results.push(await checkPatientUpdate());
  if (!results[2]) {
    console.error('💥 Test failed at patient update check');
    return;
  }
  
  // Step 4: Check display
  results.push(checkPatientListDisplay());
  if (!results[3]) {
    console.error('💥 Test failed at display check');
    return;
  }
  
  // Step 5: Test persistence
  results.push(await testPersistence());
  if (!results[4]) {
    console.error('💥 Test failed at persistence test');
    return;
  }
  
  // Step 6: Verify consistency
  results.push(await verifyConsistency());
  if (!results[5]) {
    console.error('💥 Test failed at consistency check');
    return;
  }
  
  console.log('=' .repeat(50));
  console.log('🎉 ALL TESTS PASSED! Medical Requirements Persistence Verified!');
  console.log('📊 Results:', results.map(r => r ? '✅' : '❌').join(' '));
};

// Cleanup function
const cleanup = async () => {
  try {
    console.log('🧹 Cleaning up test data...');
    
    if (testPatientId && testClinicId) {
      // Remove test requirements
      const requirementsSnapshot = await window.firebase.firestore()
        .collection(`clinics/${testClinicId}/medicalRequirements`)
        .where('patientId', '==', testPatientId)
        .where('title', '==', 'Test Blood Test')
        .get();
      
      const deletePromises = requirementsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      console.log('✅ Test requirements cleaned up');
      
      // Reset patient counts
      await window.firebase.firestore()
        .collection('patients')
        .doc(testPatientId)
        .update({
          pendingRequirementsCount: 0,
          hasPendingRequirements: false,
          updatedAt: new Date()
        });
      
      console.log('✅ Patient counts reset');
    }
  } catch (error) {
    console.error('⚠️ Cleanup failed:', error.message);
  }
};

// Expose functions to window
window.testMedicalRequirementsPersistence = runTest;
window.cleanupMedicalRequirementsTest = cleanup;

console.log('🧪 Simple Medical Requirements Persistence Test ready!');
console.log('📋 Available functions:');
console.log('   - window.testMedicalRequirementsPersistence() - Run the test');
console.log('   - window.cleanupMedicalRequirementsTest() - Clean up test data');
console.log('🚀 Run: window.testMedicalRequirementsPersistence() to start testing'); 