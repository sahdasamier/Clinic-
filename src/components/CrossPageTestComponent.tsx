import React, { useState, useEffect } from 'react';

const CrossPageTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(`🧪 TEST: ${message}`);
  };

  const clearTestResults = () => {
    setTestResults([]);
    console.clear();
  };

  // Test payment status synchronization
  const testPaymentSync = () => {
    setIsTestRunning(true);
    addTestResult('🚀 Starting Payment Synchronization Test');

    // Test 1: Dispatch payment status change event
    addTestResult('📤 Test 1: Dispatching payment status change event...');
    window.dispatchEvent(new CustomEvent('paymentStatusChanged', {
      detail: {
        appointmentId: 'test-appointment-123',
        patient: 'Test Patient',
        paymentId: 'test-payment-456',
        oldStatus: 'pending',
        newStatus: 'paid',
        source: 'AppointmentListPage',
        timestamp: Date.now()
      }
    }));
    addTestResult('✅ Payment status change event dispatched');

    // Test 2: Dispatch appointment payment sync event
    setTimeout(() => {
      addTestResult('📤 Test 2: Dispatching appointment payment sync event...');
      window.dispatchEvent(new CustomEvent('appointmentPaymentStatusSynced', {
        detail: {
          appointmentId: 'test-appointment-123',
          newStatus: 'paid',
          source: 'PaymentListPage',
          timestamp: Date.now()
        }
      }));
      addTestResult('✅ Appointment payment sync event dispatched');
    }, 1000);

    // Test 3: Check debug functions
    setTimeout(() => {
      addTestResult('🔍 Test 3: Checking debug functions...');
      
      if ((window as any).debugPaymentSync) {
        addTestResult('✅ debugPaymentSync function is available');
        (window as any).debugPaymentSync('test-appointment-123', 'Test Patient');
      } else {
        addTestResult('❌ debugPaymentSync function not found');
      }

      if ((window as any).debugAppointmentSync) {
        addTestResult('✅ debugAppointmentSync function is available');
        (window as any).debugAppointmentSync('test-appointment-123');
      } else {
        addTestResult('❌ debugAppointmentSync function not found');
      }

      setIsTestRunning(false);
      addTestResult('🎯 Payment Synchronization Test Completed');
    }, 2000);
  };

  // Test console logging
  const testConsoleLogging = () => {
    addTestResult('🎯 Testing Console Logging...');
    
    console.log('🧪 TEST LOG: Payment status change simulation');
    console.log('📋 Simulated payment details:', {
      appointmentId: 'test-123',
      oldStatus: 'pending',
      newStatus: 'paid',
      timestamp: new Date().toISOString()
    });
    
    addTestResult('✅ Console logging test completed - check browser console');
  };

  // Test Firebase data manager functions
  const testFirebaseDataManager = () => {
    addTestResult('🔥 Testing Firebase Data Manager functions...');
    
    // Check if Firebase functions are available
    const functionsToCheck = [
      'processAllAppointmentsForPayments',
      'syncPaymentWithAppointment',
      'updatePaymentStatus'
    ];

    functionsToCheck.forEach(funcName => {
      if ((window as any)[funcName]) {
        addTestResult(`✅ ${funcName} function is available`);
      } else {
        addTestResult(`⚠️ ${funcName} function not found on window`);
      }
    });
  };

  // Comprehensive test suite
  const runFullTestSuite = () => {
    clearTestResults();
    addTestResult('🎯 Starting Comprehensive Payment Sync Test Suite');
    
    // Test console logging first
    testConsoleLogging();
    
    // Test Firebase functions
    setTimeout(() => testFirebaseDataManager(), 500);
    
    // Test payment synchronization
    setTimeout(() => testPaymentSync(), 1000);
    
    addTestResult('🏁 Full test suite initiated - results will appear below');
  };

  // Listen for events during testing
  useEffect(() => {
    const handlePaymentStatusChanged = (event: CustomEvent) => {
      addTestResult(`📨 Received paymentStatusChanged event: ${JSON.stringify(event.detail, null, 2)}`);
    };

    const handleAppointmentPaymentSynced = (event: CustomEvent) => {
      addTestResult(`📨 Received appointmentPaymentStatusSynced event: ${JSON.stringify(event.detail, null, 2)}`);
    };

    window.addEventListener('paymentStatusChanged', handlePaymentStatusChanged as EventListener);
    window.addEventListener('appointmentPaymentStatusSynced', handleAppointmentPaymentSynced as EventListener);

    return () => {
      window.removeEventListener('paymentStatusChanged', handlePaymentStatusChanged as EventListener);
      window.removeEventListener('appointmentPaymentStatusSynced', handleAppointmentPaymentSynced as EventListener);
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🧪 Payment Synchronization Testing Console
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={runFullTestSuite}
          disabled={isTestRunning}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isTestRunning ? '⏳ Testing...' : '🚀 Run Full Test Suite'}
        </button>
        
        <button
          onClick={testPaymentSync}
          disabled={isTestRunning}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          🔄 Test Payment Sync
        </button>
        
        <button
          onClick={testConsoleLogging}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          📝 Test Console Logs
        </button>
        
        <button
          onClick={clearTestResults}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          🗑️ Clear Results
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        <div className="mb-2 text-gray-300">Test Results Console:</div>
        {testResults.length === 0 ? (
          <div className="text-gray-500">No test results yet. Click a test button to start.</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🔍 Manual Testing Instructions:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Open the Appointments page in one browser tab</li>
          <li>Open the Payments page in another browser tab</li>
          <li>Create an appointment with payment status "pending"</li>
          <li>Switch to the Appointments tab and change payment status to "paid"</li>
          <li>Check the browser console for detailed logs</li>
          <li>Switch to the Payments tab and verify the payment status updated</li>
          <li>Try changing payment status from the Payments page</li>
          <li>Verify the appointment status updates accordingly</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">🎯 Console Commands Available:</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li><code>debugPaymentSync(appointmentId, patient)</code> - Debug payment synchronization</li>
          <li><code>debugAppointmentSync(appointmentId)</code> - Debug appointment synchronization</li>
          <li>Open browser console (F12) to see detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default CrossPageTestComponent; 