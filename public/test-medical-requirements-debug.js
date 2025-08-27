// Test script to debug medical requirements counting
console.log('🔧 Medical Requirements Debug Test Started');

// Test 1: Check if the debug functions are available
if (typeof window.forceRefreshAndDebug === 'function') {
  console.log('✅ forceRefreshAndDebug function is available');
} else {
  console.error('❌ forceRefreshAndDebug function is not available');
}

if (typeof window.debugMedicalRequirements === 'function') {
  console.log('✅ debugMedicalRequirements function is available');
} else {
  console.error('❌ debugMedicalRequirements function is not available');
}

if (typeof window.refreshMedicalRequirementsCounts === 'function') {
  console.log('✅ refreshMedicalRequirementsCounts function is available');
} else {
  console.error('❌ refreshMedicalRequirementsCounts function is not available');
}

// Test 2: Check if MedicalRequirementsService is available
if (typeof window.MedicalRequirementsService !== 'undefined') {
  console.log('✅ MedicalRequirementsService is available');
} else {
  console.error('❌ MedicalRequirementsService is not available');
}

// Test 3: Check current patient requirements state
if (typeof window.debugMedicalRequirements === 'function') {
  console.log('🔍 Current medical requirements state:');
  window.debugMedicalRequirements();
} else {
  console.log('⚠️ Cannot check current state - function not available');
}

// Test 4: Check if there are any pending requirements
console.log('📊 Checking for pending medical requirements...');

// Test 5: Test force refresh
if (typeof window.forceRefreshAndDebug === 'function') {
  console.log('🚀 Testing force refresh...');
  window.forceRefreshAndDebug().then(() => {
    console.log('✅ Force refresh completed');
    
    // Check state after refresh
    if (typeof window.debugMedicalRequirements === 'function') {
      console.log('🔍 State after refresh:');
      window.debugMedicalRequirements();
    }
  }).catch(error => {
    console.error('❌ Force refresh failed:', error);
  });
} else {
  console.error('❌ Force refresh function not available');
}

console.log('🔧 Medical Requirements Debug Test Completed'); 