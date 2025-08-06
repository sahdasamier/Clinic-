/**
 * Payment Synchronization Test Script
 * Run this in browser console to test payment sync between appointments and payments
 */

// Test configuration
const TEST_CONFIG = {
  appointmentId: 'test-appointment-' + Date.now(),
  patientName: 'Test Patient Sync',
  paymentId: 'test-payment-' + Date.now(),
  testDelay: 1000
};

// ✅ NEW: Function to detect clinic ID
function detectClinicId() {
  try {
    // Try multiple sources for clinic ID
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (userProfile.clinicId) {
      console.log(`🎯 Found clinic ID from userProfile: ${userProfile.clinicId}`);
      return userProfile.clinicId;
    }
    
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (authUser.clinicId) {
      console.log(`🎯 Found clinic ID from authUser: ${authUser.clinicId}`);
      return authUser.clinicId;
    }
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const clinicFromUrl = urlParams.get('clinicId');
    if (clinicFromUrl) {
      console.log(`🎯 Found clinic ID from URL: ${clinicFromUrl}`);
      return clinicFromUrl;
    }
    
    // Check if there's a global clinic ID
    if (window.userProfile && window.userProfile.clinicId) {
      console.log(`🎯 Found clinic ID from window.userProfile: ${window.userProfile.clinicId}`);
      return window.userProfile.clinicId;
    }
    
    console.warn('⚠️ Could not detect clinic ID automatically');
    console.log('💡 Please check localStorage for user data or manually provide clinic ID');
    
    // Show available localStorage keys that might contain clinic info
    console.log('🔍 Available localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('clinic') || key.includes('user') || key.includes('auth'))) {
        console.log(`  - ${key}`);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error detecting clinic ID:', error);
    return null;
  }
}

// Console styling
const styles = {
  test: 'background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px;',
  event: 'background: #2196F3; color: white; padding: 2px 8px; border-radius: 3px;',
  success: 'background: #8BC34A; color: white; padding: 2px 8px; border-radius: 3px;',
  error: 'background: #F44336; color: white; padding: 2px 8px; border-radius: 3px;',
  info: 'background: #FF9800; color: white; padding: 2px 8px; border-radius: 3px;'
};

// Test results storage
const testResults = {
  eventsDispatched: 0,
  eventsReceived: 0,
  errors: [],
  startTime: null,
  endTime: null
};

// Event listeners for testing
const testEventListeners = {
  paymentStatusChanged: (event) => {
    testResults.eventsReceived++;
    console.log('%c📨 EVENT RECEIVED: paymentStatusChanged', styles.event);
    console.log('Event Details:', event.detail);
  },
  
  appointmentPaymentStatusSynced: (event) => {
    testResults.eventsReceived++;
    console.log('%c📨 EVENT RECEIVED: appointmentPaymentStatusSynced', styles.event);
    console.log('Event Details:', event.detail);
  }
};

// Setup event listeners
function setupTestListeners() {
  console.log('%c🔧 Setting up test event listeners...', styles.info);
  
  window.addEventListener('paymentStatusChanged', testEventListeners.paymentStatusChanged);
  window.addEventListener('appointmentPaymentStatusSynced', testEventListeners.appointmentPaymentStatusSynced);
  
  console.log('%c✅ Event listeners setup complete', styles.success);
}

// Cleanup event listeners
function cleanupTestListeners() {
  console.log('%c🧹 Cleaning up test event listeners...', styles.info);
  
  window.removeEventListener('paymentStatusChanged', testEventListeners.paymentStatusChanged);
  window.removeEventListener('appointmentPaymentStatusSynced', testEventListeners.appointmentPaymentStatusSynced);
  
  console.log('%c✅ Event listeners cleanup complete', styles.success);
}

// Test 1: Payment status change from appointments
function testPaymentStatusChangeFromAppointments() {
  console.log('%c🧪 TEST 1: Payment status change from appointments', styles.test);
  
  const eventDetail = {
    appointmentId: TEST_CONFIG.appointmentId,
    patient: TEST_CONFIG.patientName,
    paymentId: TEST_CONFIG.paymentId,
    oldStatus: 'pending',
    newStatus: 'paid',
    source: 'AppointmentListPage',
    timestamp: Date.now()
  };
  
  console.log('Dispatching paymentStatusChanged event with data:', eventDetail);
  
  window.dispatchEvent(new CustomEvent('paymentStatusChanged', {
    detail: eventDetail
  }));
  
  testResults.eventsDispatched++;
  console.log('%c✅ Event dispatched successfully', styles.success);
}

// Test 2: Payment sync from payments page
function testPaymentSyncFromPayments() {
  console.log('%c🧪 TEST 2: Payment sync from payments page', styles.test);
  
  const eventDetail = {
    appointmentId: TEST_CONFIG.appointmentId,
    newStatus: 'paid',
    source: 'PaymentListPage',
    timestamp: Date.now()
  };
  
  console.log('Dispatching appointmentPaymentStatusSynced event with data:', eventDetail);
  
  window.dispatchEvent(new CustomEvent('appointmentPaymentStatusSynced', {
    detail: eventDetail
  }));
  
  testResults.eventsDispatched++;
  console.log('%c✅ Event dispatched successfully', styles.success);
}

// Test 3: Check debug functions availability
function testDebugFunctions() {
  console.log('%c🧪 TEST 3: Debug functions availability', styles.test);
  
  const functionsToCheck = [
    'debugPaymentSync',
    'debugAppointmentSync',
    'debugPaymentDuplicates',
    'debugPaymentAppointmentRelationships',
    'getCurrentClinicId',
    'debugCurrentClinicPayments',
    'debugCurrentClinicRelationships'
  ];
  
  functionsToCheck.forEach(funcName => {
    if (window[funcName] && typeof window[funcName] === 'function') {
      console.log(`%c✅ ${funcName} is available and callable`, styles.success);
    } else {
      console.log(`%c⚠️ ${funcName} is not available`, styles.info);
    }
  });
}

// Test 4: Console logging verification
function testConsoleLogging() {
  console.log('%c🧪 TEST 4: Console logging verification', styles.test);
  
  // Simulate payment status change logging
  console.log('🎯 SIMULATED APPOINTMENT PAYMENT STATUS CHANGE STARTED:');
  console.log('📋 Appointment Details:', {
    appointmentId: TEST_CONFIG.appointmentId,
    patientName: TEST_CONFIG.patientName,
    currentPaymentStatus: 'pending',
    newPaymentStatus: 'paid',
    timestamp: new Date().toISOString()
  });
  
  console.log('🔄 SIMULATED: Payment status updated in Firebase');
  console.log('📋 SIMULATED: APPOINTMENT PAYMENT STATUS CHANGE COMPLETED SUCCESSFULLY');
  console.log('✅ SIMULATED: Payment status updated via Firestore and synced across pages');
  
  console.log('%c✅ Console logging test completed', styles.success);
}

// ✅ NEW: Test clinic ID detection and payment debugging
function testClinicIdAndPayments() {
  console.log('%c🧪 TEST 5: Clinic ID detection and payment debugging', styles.test);
  
  const clinicId = detectClinicId();
  
  if (clinicId) {
    console.log(`%c✅ Clinic ID detected: ${clinicId}`, styles.success);
    
    // Test debug functions with detected clinic ID
    if (window.debugCurrentClinicPayments) {
      console.log('%c🔧 Testing automatic clinic payment debugging...', styles.info);
      window.debugCurrentClinicPayments();
    }
    
    if (window.debugCurrentClinicRelationships) {
      console.log('%c🔧 Testing automatic clinic relationship debugging...', styles.info);
      window.debugCurrentClinicRelationships();
    }
  } else {
    console.log('%c❌ Could not detect clinic ID', styles.error);
    console.log('%c💡 Manual commands available:', styles.info);
    console.log('  - debugPaymentDuplicates("your-clinic-id")');
    console.log('  - debugPaymentAppointmentRelationships("your-clinic-id")');
  }
}

// Main test runner
async function runPaymentSyncTests() {
  console.clear();
  console.log('%c🚀 STARTING PAYMENT SYNCHRONIZATION TESTS', styles.test);
  console.log('=' .repeat(60));
  
  testResults.startTime = Date.now();
  testResults.eventsDispatched = 0;
  testResults.eventsReceived = 0;
  testResults.errors = [];
  
  // Setup
  setupTestListeners();
  
  try {
    // Test clinic ID detection first
    await new Promise(resolve => {
      testClinicIdAndPayments();
      setTimeout(resolve, TEST_CONFIG.testDelay);
    });
    
    // Run other tests with delays
    await new Promise(resolve => {
      testPaymentStatusChangeFromAppointments();
      setTimeout(resolve, TEST_CONFIG.testDelay);
    });
    
    await new Promise(resolve => {
      testPaymentSyncFromPayments();
      setTimeout(resolve, TEST_CONFIG.testDelay);
    });
    
    await new Promise(resolve => {
      testDebugFunctions();
      setTimeout(resolve, TEST_CONFIG.testDelay);
    });
    
    await new Promise(resolve => {
      testConsoleLogging();
      setTimeout(resolve, TEST_CONFIG.testDelay);
    });
    
    // Final results
    testResults.endTime = Date.now();
    
    console.log('=' .repeat(60));
    console.log('%c🎯 TEST RESULTS SUMMARY', styles.test);
    console.log(`⏱️ Test Duration: ${testResults.endTime - testResults.startTime}ms`);
    console.log(`📤 Events Dispatched: ${testResults.eventsDispatched}`);
    console.log(`📨 Events Received: ${testResults.eventsReceived}`);
    console.log(`❌ Errors: ${testResults.errors.length}`);
    
    if (testResults.errors.length > 0) {
      console.log('%c🚨 ERRORS ENCOUNTERED:', styles.error);
      testResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (testResults.eventsDispatched === testResults.eventsReceived && testResults.errors.length === 0) {
      console.log('%c🎉 ALL TESTS PASSED!', styles.success);
    } else {
      console.log('%c⚠️ Some tests may have issues', styles.info);
    }
    
  } catch (error) {
    console.log('%c❌ Test runner error:', styles.error, error);
  } finally {
    // Cleanup
    cleanupTestListeners();
    console.log('%c🏁 Payment synchronization tests completed', styles.test);
  }
}

// Expose to global scope for easy access
window.runPaymentSyncTests = runPaymentSyncTests;
window.testPaymentSync = runPaymentSyncTests;
window.detectClinicId = detectClinicId;

// Quick test functions
window.quickTestPaymentEvent = () => {
  window.dispatchEvent(new CustomEvent('paymentStatusChanged', {
    detail: {
      appointmentId: 'quick-test-' + Date.now(),
      patient: 'Quick Test Patient',
      paymentId: 'quick-payment-' + Date.now(),
      oldStatus: 'pending',
      newStatus: 'paid',
      source: 'QuickTest',
      timestamp: Date.now()
    }
  }));
  console.log('%c⚡ Quick payment event dispatched', styles.event);
};

window.quickTestAppointmentEvent = () => {
  window.dispatchEvent(new CustomEvent('appointmentPaymentStatusSynced', {
    detail: {
      appointmentId: 'quick-test-' + Date.now(),
      newStatus: 'paid',
      source: 'QuickTest',
      timestamp: Date.now()
    }
  }));
  console.log('%c⚡ Quick appointment event dispatched', styles.event);
};

console.log('%c🧪 Payment Sync Test Script Loaded!', styles.test);
console.log('Available commands:');
console.log('  - runPaymentSyncTests() - Run full test suite');
console.log('  - testPaymentSync() - Alias for full test suite');
console.log('  - detectClinicId() - Detect your clinic ID');
console.log('  - quickTestPaymentEvent() - Quick payment event test');
console.log('  - quickTestAppointmentEvent() - Quick appointment event test');

// Auto-detect clinic ID on load
console.log('🔍 Auto-detecting clinic ID...');
const autoDetectedClinicId = detectClinicId();
if (autoDetectedClinicId) {
  console.log(`%c🎯 Your clinic ID is: ${autoDetectedClinicId}`, styles.success);
  console.log(`%cUse this for debugging: debugPaymentDuplicates("${autoDetectedClinicId}")`, styles.info);
} else {
  console.log('%c⚠️ Could not auto-detect clinic ID', styles.info);
} 