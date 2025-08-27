// Comprehensive Test Script for Medical Requirements Persistence
// This script tests the end-to-end flow of medical requirement counting and persistence

console.log('🧪 Starting Medical Requirements Persistence Test...');

// Test configuration
const TEST_CONFIG = {
  patientId: null, // Will be set from existing patients
  clinicId: null,  // Will be set from current user
  testRequirementId: `test-req-${Date.now()}`,
  maxWaitTime: 10000, // 10 seconds max wait
  checkInterval: 500   // Check every 500ms
};

// Test results storage
const TEST_RESULTS = {
  step1: { name: 'Setup Test Environment', status: 'pending', details: '' },
  step2: { name: 'Add Medical Requirement', status: 'pending', details: '' },
  step3: { name: 'Verify Firestore Update', status: 'pending', details: '' },
  step4: { name: 'Check Patient List Display', status: 'pending', details: '' },
  step5: { name: 'Test Page Refresh Persistence', status: 'pending', details: '' },
  step6: { name: 'Verify Final State', status: 'pending', details: '' }
};

// Utility functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTestStep = (step, status, details = '') => {
  TEST_RESULTS[step].status = status;
  TEST_RESULTS[step].details = details;
  
  const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'pending' ? '⏳' : '⚠️';
  console.log(`${emoji} ${TEST_RESULTS[step].name}: ${status.toUpperCase()}`);
  if (details) console.log(`   Details: ${details}`);
};

const waitForCondition = async (conditionFn, description, maxWait = TEST_CONFIG.maxWaitTime) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    if (await conditionFn()) {
      return true;
    }
    await wait(TEST_CONFIG.checkInterval);
  }
  
  throw new Error(`Timeout waiting for: ${description}`);
};

// Step 1: Setup Test Environment
const setupTestEnvironment = async () => {
  try {
    console.log('🔧 Setting up test environment...');
    
    // Check if we're in the right context
    if (!window.firebase || !window.firebase.firestore) {
      throw new Error('Firebase not available in this context');
    }
    
    // Get current user and clinic info
    if (typeof window.getCurrentUser === 'function') {
      const user = await window.getCurrentUser();
      TEST_CONFIG.clinicId = user?.clinicId;
      console.log('✅ Got clinic ID:', TEST_CONFIG.clinicId);
    } else {
      // Try to get from global state
      TEST_CONFIG.clinicId = window.currentUser?.clinicId || window.userProfile?.clinicId;
      console.log('✅ Got clinic ID from global state:', TEST_CONFIG.clinicId);
    }
    
    if (!TEST_CONFIG.clinicId) {
      throw new Error('No clinic ID available');
    }
    
    // Get a test patient ID
    const patients = await window.firebase.firestore()
      .collection('patients')
      .where('clinicId', '==', TEST_CONFIG.clinicId)
      .limit(1)
      .get();
    
    if (patients.empty) {
      throw new Error('No patients found in clinic');
    }
    
    TEST_CONFIG.patientId = patients.docs[0].id;
    const patientData = patients.docs[0].data();
    console.log('✅ Got test patient:', { id: TEST_CONFIG.patientId, name: patientData.name });
    
    // Check initial state
    const initialCount = patientData.pendingRequirementsCount || 0;
    console.log('📊 Initial pending requirements count:', initialCount);
    
    logTestStep('step1', 'success', `Clinic: ${TEST_CONFIG.clinicId}, Patient: ${patientData.name} (${TEST_CONFIG.patientId}), Initial Count: ${initialCount}`);
    
  } catch (error) {
    logTestStep('step1', 'error', error.message);
    throw error;
  }
};

// Step 2: Add Medical Requirement
const addMedicalRequirement = async () => {
  try {
    console.log('📋 Adding medical requirement...');
    
    const requirementData = {
      patientId: TEST_CONFIG.patientId,
      title: 'Test Blood Test',
      type: 'laboratory',
      status: 'pending',
      dateOrdered: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      priority: 'normal',
      description: 'Test requirement for persistence verification',
      orderedBy: 'Test System',
      clinicId: TEST_CONFIG.clinicId,
      isActive: true
    };
    
    // Add to Firestore
    const docRef = await window.firebase.firestore()
      .collection(`clinics/${TEST_CONFIG.clinicId}/medicalRequirements`)
      .add(requirementData);
    
    console.log('✅ Medical requirement added with ID:', docRef.id);
    
    // Wait a bit for any background processes
    await wait(1000);
    
    logTestStep('step2', 'success', `Requirement added: ${docRef.id}`);
    
  } catch (error) {
    logTestStep('step2', 'error', error.message);
    throw error;
  }
};

// Step 3: Verify Firestore Update
const verifyFirestoreUpdate = async () => {
  try {
    console.log('🔥 Verifying Firestore update...');
    
    // Wait for the patient document to be updated
    const patientUpdated = await waitForCondition(async () => {
      const patientDoc = await window.firebase.firestore()
        .collection('patients')
        .doc(TEST_CONFIG.patientId)
        .get();
      
      const data = patientDoc.data();
      const newCount = data.pendingRequirementsCount || 0;
      const hasPending = data.hasPendingRequirements || false;
      
      console.log('📊 Current patient state:', { newCount, hasPending });
      
      return newCount > 0 && hasPending === true;
    }, 'Patient document to be updated with pending requirements');
    
    if (patientUpdated) {
      // Get the final patient data
      const patientDoc = await window.firebase.firestore()
        .collection('patients')
        .doc(TEST_CONFIG.patientId)
        .get();
      
      const data = patientDoc.data();
      console.log('✅ Patient document updated successfully:', {
        pendingRequirementsCount: data.pendingRequirementsCount,
        hasPendingRequirements: data.hasPendingRequirements
      });
      
      logTestStep('step3', 'success', `Count: ${data.pendingRequirementsCount}, Has Pending: ${data.hasPendingRequirements}`);
    }
    
  } catch (error) {
    logTestStep('step3', 'error', error.message);
    throw error;
  }
};

// Step 4: Check Patient List Display
const checkPatientListDisplay = async () => {
  try {
    console.log('📋 Checking patient list display...');
    
    // Wait for the UI to update
    await wait(1000);
    
    // Look for the medical requirements column in the table
    const table = document.querySelector('table');
    if (!table) {
      throw new Error('No table found on page');
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
      throw new Error('Medical requirements column not found');
    }
    
    console.log('📋 Medical requirements column found at index:', medicalRequirementsColumnIndex);
    
    // Find the row for our test patient
    const rows = table.querySelectorAll('tbody tr');
    let patientRow = null;
    
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        // Check if this row contains our patient (look for patient name or ID)
        const rowText = row.textContent;
        if (rowText.includes(TEST_CONFIG.patientId) || rowText.includes('Test')) {
          patientRow = row;
          break;
        }
      }
    }
    
    if (!patientRow) {
      throw new Error('Test patient row not found in table');
    }
    
    // Check the medical requirements cell
    const cells = patientRow.querySelectorAll('td');
    const requirementsCell = cells[medicalRequirementsColumnIndex];
    
    if (!requirementsCell) {
      throw new Error('Medical requirements cell not found');
    }
    
    const cellText = requirementsCell.textContent.trim();
    console.log('📊 Medical requirements cell content:', cellText);
    
    // Check if it shows "Yes (1)" or similar
    if (cellText.includes('Yes') && cellText.includes('1')) {
      console.log('✅ Patient list correctly shows pending requirements');
      logTestStep('step4', 'success', `Cell shows: "${cellText}"`);
    } else {
      throw new Error(`Expected "Yes (1)" but got: "${cellText}"`);
    }
    
  } catch (error) {
    logTestStep('step4', 'error', error.message);
    throw error;
  }
};

// Step 5: Test Page Refresh Persistence
const testPageRefreshPersistence = async () => {
  try {
    console.log('🔄 Testing page refresh persistence...');
    
    // Store current state
    const beforeRefresh = {
      patientId: TEST_CONFIG.patientId,
      timestamp: Date.now()
    };
    
    console.log('📊 State before refresh:', beforeRefresh);
    
    // Simulate a page refresh by reloading the data
    if (typeof window.refreshMedicalRequirementsCounts === 'function') {
      console.log('🔄 Manually refreshing medical requirements counts...');
      await window.refreshMedicalRequirementsCounts();
      await wait(2000); // Wait for refresh to complete
    }
    
    // Check if the data is still there
    const patientDoc = await window.firebase.firestore()
      .collection('patients')
      .doc(TEST_CONFIG.patientId)
      .get();
    
    const data = patientDoc.data();
    const countAfterRefresh = data.pendingRequirementsCount || 0;
    const hasPendingAfterRefresh = data.hasPendingRequirements || false;
    
    console.log('📊 State after refresh:', {
      countAfterRefresh,
      hasPendingAfterRefresh
    });
    
    if (countAfterRefresh > 0 && hasPendingAfterRefresh === true) {
      console.log('✅ Data persisted after refresh');
      logTestStep('step5', 'success', `Count: ${countAfterRefresh}, Has Pending: ${hasPendingAfterRefresh}`);
    } else {
      throw new Error('Data did not persist after refresh');
    }
    
  } catch (error) {
    logTestStep('step5', 'error', error.message);
    throw error;
  }
};

// Step 6: Verify Final State
const verifyFinalState = async () => {
  try {
    console.log('🔍 Verifying final state...');
    
    // Check Firestore
    const patientDoc = await window.firebase.firestore()
      .collection('patients')
      .doc(TEST_CONFIG.patientId)
      .get();
    
    const patientData = patientDoc.data();
    
    // Check medical requirements collection
    const requirementsSnapshot = await window.firebase.firestore()
      .collection(`clinics/${TEST_CONFIG.clinicId}/medicalRequirements`)
      .where('patientId', '==', TEST_CONFIG.patientId)
      .where('status', '==', 'pending')
      .get();
    
    const pendingRequirements = requirementsSnapshot.docs.length;
    
    console.log('📊 Final verification:', {
      patientPendingCount: patientData.pendingRequirementsCount,
      patientHasPending: patientData.hasPendingRequirements,
      actualPendingRequirements: pendingRequirements
    });
    
    // Verify consistency
    if (patientData.pendingRequirementsCount === pendingRequirements && 
        patientData.hasPendingRequirements === (pendingRequirements > 0)) {
      console.log('✅ Final state is consistent');
      logTestStep('step6', 'success', `Count: ${patientData.pendingRequirementsCount}, Requirements: ${pendingRequirements}`);
    } else {
      throw new Error('Final state is inconsistent');
    }
    
  } catch (error) {
    logTestStep('step6', 'error', error.message);
    throw error;
  }
};

// Main test execution
const runPersistenceTest = async () => {
  try {
    console.log('🚀 Starting Medical Requirements Persistence Test...');
    console.log('=' .repeat(60));
    
    await setupTestEnvironment();
    await addMedicalRequirement();
    await verifyFirestoreUpdate();
    await checkPatientListDisplay();
    await testPageRefreshPersistence();
    await verifyFinalState();
    
    console.log('=' .repeat(60));
    console.log('🎉 ALL TESTS PASSED! Medical Requirements Persistence Verified!');
    
    // Print summary
    console.log('\n📋 Test Summary:');
    Object.values(TEST_RESULTS).forEach(result => {
      const emoji = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳';
      console.log(`${emoji} ${result.name}: ${result.status.toUpperCase()}`);
      if (result.details) console.log(`   ${result.details}`);
    });
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    // Print partial results
    console.log('\n📋 Partial Test Results:');
    Object.values(TEST_RESULTS).forEach(result => {
      const emoji = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳';
      console.log(`${emoji} ${result.name}: ${result.status.toUpperCase()}`);
      if (result.details) console.log(`   ${result.details}`);
    });
  }
};

// Cleanup function
const cleanupTest = async () => {
  try {
    console.log('🧹 Cleaning up test data...');
    
    if (TEST_CONFIG.patientId && TEST_CONFIG.clinicId) {
      // Remove the test requirement
      const requirementsSnapshot = await window.firebase.firestore()
        .collection(`clinics/${TEST_CONFIG.clinicId}/medicalRequirements`)
        .where('patientId', '==', TEST_CONFIG.patientId)
        .where('title', '==', 'Test Blood Test')
        .get();
      
      const deletePromises = requirementsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      console.log('✅ Test requirements cleaned up');
      
      // Reset patient counts
      await window.firebase.firestore()
        .collection('patients')
        .doc(TEST_CONFIG.patientId)
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

// Expose functions to window for manual testing
window.runMedicalRequirementsPersistenceTest = runPersistenceTest;
window.cleanupMedicalRequirementsTest = cleanupTest;
window.getMedicalRequirementsTestResults = () => TEST_RESULTS;

console.log('🧪 Medical Requirements Persistence Test ready!');
console.log('📋 Available functions:');
console.log('   - window.runMedicalRequirementsPersistenceTest() - Run the full test');
console.log('   - window.cleanupMedicalRequirementsTest() - Clean up test data');
console.log('   - window.getMedicalRequirementsTestResults() - Get test results');
console.log('🚀 Run: window.runMedicalRequirementsPersistenceTest() to start testing'); 