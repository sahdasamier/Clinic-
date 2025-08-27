// Test script for medical requirements counts
// Run this in the browser console to test if counts are updating properly

console.log('🧪 Testing medical requirements counts...');

// Test 1: Check if the manual refresh function is available
if (typeof window.refreshMedicalRequirementsCounts === 'function') {
  console.log('✅ Manual refresh function is available');
} else {
  console.error('❌ Manual refresh function is not available');
}

// Test 2: Check if debug functions are available
if (typeof window.debugMedicalRequirements === 'function') {
  console.log('✅ Debug function is available');
} else {
  console.error('❌ Debug function is not available');
}

if (typeof window.debugMedicalRequirementsState === 'function') {
  console.log('✅ Debug state function is available');
} else {
  console.error('❌ Debug state function is not available');
}

if (typeof window.testMedicalRequirementsConnection === 'function') {
  console.log('✅ Test connection function is available');
} else {
  console.error('❌ Test connection function is not available');
}

// Test 3: Check current patient requirements state
console.log('📊 Current patient requirements state:', {
  patientRequirements: window.patientRequirements || 'Not found',
  totalPatients: document.querySelectorAll('tr[data-patient-id]').length || 'Unknown'
});

// Test 4: Run debug functions
console.log('🔍 Running debug functions...');
try {
  if (window.debugMedicalRequirementsState) {
    window.debugMedicalRequirementsState();
  }
  if (window.debugMedicalRequirements) {
    window.debugMedicalRequirements();
  }
} catch (error) {
  console.error('❌ Error running debug functions:', error);
}

// Test 5: Test manual refresh
console.log('🔄 Testing manual refresh...');
try {
  if (window.refreshMedicalRequirementsCounts) {
    await window.refreshMedicalRequirementsCounts();
    console.log('✅ Manual refresh completed');
  } else {
    console.error('❌ Manual refresh function not available');
  }
} catch (error) {
  console.error('❌ Manual refresh failed:', error);
}

// Test 6: Test connection
console.log('🧪 Testing medical requirements connection...');
try {
  if (window.testMedicalRequirementsConnection) {
    await window.testMedicalRequirementsConnection();
    console.log('✅ Connection test completed');
  } else {
    console.error('❌ Connection test function not available');
  }
} catch (error) {
  console.error('❌ Connection test failed:', error);
}

// Test 7: Check if events are being dispatched
console.log('📡 Testing event dispatching...');

// Listen for medical requirement events
const eventListener = (event) => {
  console.log(`📋 Event received: ${event.type}`, event.detail);
};

window.addEventListener('medicalRequirementAdded', eventListener);
window.addEventListener('medicalRequirementUpdated', eventListener);
window.addEventListener('medicalRequirementCountRefreshed', eventListener);
window.addEventListener('allMedicalRequirementCountsRefreshed', eventListener);

console.log('✅ Event listeners added');

// Test 8: Simulate a medical requirement addition
console.log('🎭 Simulating medical requirement addition...');
window.dispatchEvent(new CustomEvent('medicalRequirementAdded', {
  detail: {
    patientId: 'test-patient-123',
    requirementId: 'test-req-456',
    status: 'pending',
    clinicId: 'demo-clinic'
  }
}));

// Test 9: Simulate a count refresh
console.log('🔄 Simulating count refresh...');
window.dispatchEvent(new CustomEvent('medicalRequirementCountRefreshed', {
  detail: {
    patientId: 'test-patient-123',
    count: 5,
    clinicId: 'demo-clinic'
  }
}));

// Test 10: Check localStorage for medical requirements
console.log('💾 Checking localStorage for medical requirements...');
const localStorageKeys = Object.keys(localStorage).filter(key => key.includes('medical'));
console.log('LocalStorage keys:', localStorageKeys);

localStorageKeys.forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`📁 ${key}:`, data);
  } catch (error) {
    console.error(`❌ Error parsing ${key}:`, error);
  }
});

// Test 11: Check Firebase collection
console.log('🔥 Checking Firebase collection...');
try {
  // This will only work if Firebase is available
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  console.log('✅ Firebase imports successful');
  
  // Note: This won't work in the console without proper Firebase context
  console.log('ℹ️ Firebase collection check requires proper context');
} catch (error) {
  console.log('ℹ️ Firebase check skipped (console context)');
}

// Test 12: Check the actual table data
console.log('📋 Checking actual table data...');
const tableRows = document.querySelectorAll('table tbody tr');
console.log(`📊 Found ${tableRows.length} table rows`);

// Look for medical requirements column
const headers = document.querySelectorAll('table thead th');
let medicalRequirementsColumnIndex = -1;
headers.forEach((header, index) => {
  if (header.textContent.toLowerCase().includes('medical') || header.textContent.toLowerCase().includes('requirement')) {
    medicalRequirementsColumnIndex = index;
    console.log(`📋 Medical requirements column found at index ${index}`);
  }
});

if (medicalRequirementsColumnIndex !== -1) {
  tableRows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    if (cells[medicalRequirementsColumnIndex]) {
      const cellText = cells[medicalRequirementsColumnIndex].textContent;
      console.log(`📊 Row ${rowIndex + 1}: "${cellText}"`);
    }
  });
} else {
  console.log('⚠️ Medical requirements column not found in table headers');
}

// Test 13: Cleanup
setTimeout(() => {
  window.removeEventListener('medicalRequirementAdded', eventListener);
  window.removeEventListener('medicalRequirementUpdated', eventListener);
  window.removeEventListener('medicalRequirementCountRefreshed', eventListener);
  window.removeEventListener('allMedicalRequirementCountsRefreshed', eventListener);
  console.log('🧹 Event listeners cleaned up');
}, 10000);

console.log('🎉 Medical requirements count test completed!');
console.log('📋 Check the console for event logs and any errors');
console.log('🔄 Use window.refreshMedicalRequirementsCounts() to manually refresh counts');
console.log('🔍 Use window.debugMedicalRequirementsState() to check current state');
console.log('🧪 Use window.testMedicalRequirementsConnection() to test Firebase connection'); 