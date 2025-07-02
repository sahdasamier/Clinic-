import { firebaseDataManager } from './firebaseDataManager';

// ✅ GLOBAL FIREBASE DATA MANAGER INITIALIZATION
// Initialize once when app starts and provide global access

let initialized = false;
let currentClinicId: string | null = null;

export const initializeFirebaseDataManager = (clinicId: string, userId?: string) => {
  if (initialized && currentClinicId === clinicId) {
    console.log('🔥 Firebase Data Manager already initialized for clinic:', clinicId);
    return firebaseDataManager;
  }

  console.log('🔥 Initializing Global Firebase Data Manager for clinic:', clinicId);
  
  // Initialize the data manager
  firebaseDataManager.initialize({
    clinicId,
    userId
  });

  // Set up global event listeners for cross-page communication
  setupGlobalEventListeners();
  
  // Set up global debug functions
  setupGlobalDebugFunctions();

  initialized = true;
  currentClinicId = clinicId;

  return firebaseDataManager;
};

// ✅ GLOBAL EVENT LISTENERS for cross-page synchronization
const setupGlobalEventListeners = () => {
  // Listen for Firebase real-time updates and broadcast to all pages
  firebaseDataManager.addEventListener('paymentsUpdated', (data: any) => {
    console.log('🌐 Global: Broadcasting payment updates to all pages');
    
    // Broadcast to all open pages/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('globalPaymentsUpdated', {
        detail: { payments: data.payments, source: 'firebase-realtime' }
      }));
    }
  });

  firebaseDataManager.addEventListener('appointmentsUpdated', (data: any) => {
    console.log('🌐 Global: Broadcasting appointment updates to all pages');
    
    // Broadcast to all open pages/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('globalAppointmentsUpdated', {
        detail: { appointments: data.appointments, source: 'firebase-realtime' }
      }));
    }
  });

  // Listen for cross-page sync events
  firebaseDataManager.addEventListener('appointmentPaymentSynced', (data: any) => {
    console.log('🌐 Global: Broadcasting appointment payment sync to all pages');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('globalAppointmentPaymentSynced', {
        detail: data
      }));
    }
  });

  console.log('✅ Global event listeners set up for cross-page synchronization');
};

// ✅ GLOBAL DEBUG FUNCTIONS
const setupGlobalDebugFunctions = () => {
  if (typeof window === 'undefined') return;

  // Global Firebase Data Manager access
  (window as any).firebaseDataManager = firebaseDataManager;

  // Test cross-page synchronization
  (window as any).testCrossPageSync = async () => {
    console.log('🧪 Testing cross-page synchronization...');
    
    try {
      // Test payment creation
      const testPayment = {
        clinicId: currentClinicId!,
        patient: 'Test Patient (Cross-Page)',
        doctor: 'Dr. Test',
        amount: 150,
        currency: 'EGP',
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        method: 'cash',
        description: 'Test payment for cross-page sync',
        category: 'consultation',
        invoiceId: `TEST-${Date.now()}`,
        paidAmount: 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 150,
        baseAmount: 150,
        insurance: 'No' as const,
        insuranceAmount: 0,
        isActive: true
      };

      const paymentId = await firebaseDataManager.createPayment(testPayment);
      console.log('✅ Test payment created:', paymentId);

      // Test appointment creation
      const testAppointment = {
        clinicId: currentClinicId!,
        patient: 'Test Patient (Cross-Page)',
        patientId: 'test-patient-cross-page',
        doctor: 'Dr. Test',
        doctorId: 'test-doctor',
        date: new Date().toISOString().split('T')[0],
        time: '15:00',
        timeSlot: '15:00',
        type: 'consultation' as const,
        duration: 30,
        priority: 'normal' as const,
        status: 'confirmed' as const,
        paymentStatus: 'pending' as const,
        location: 'Test Room',
        notes: 'Test appointment for cross-page sync',
        isActive: true
      };

      const appointmentId = await firebaseDataManager.createAppointment(testAppointment);
      console.log('✅ Test appointment created:', appointmentId);

      alert('✅ Cross-page sync test completed! Check other open pages to see real-time updates.');

    } catch (error) {
      console.error('❌ Cross-page sync test failed:', error);
      alert('❌ Cross-page sync test failed. Check console for details.');
    }
  };

  // Get Firebase data summaries
  (window as any).getFirebaseDataSummary = async () => {
    try {
      const paymentSummary = await firebaseDataManager.getPaymentSummary();
      const appointmentSummary = await firebaseDataManager.getAppointmentSummary();
      
      console.log('📊 Firebase Data Summary:');
      console.table([
        { Metric: 'Total Payments', Value: paymentSummary.totalPayments },
        { Metric: 'Total Revenue', Value: `${paymentSummary.totalRevenue} EGP` },
        { Metric: 'Paid Revenue', Value: `${paymentSummary.paidRevenue} EGP` },
        { Metric: 'Pending Revenue', Value: `${paymentSummary.pendingRevenue} EGP` },
        { Metric: 'Total Appointments', Value: appointmentSummary.totalAppointments },
        { Metric: 'Today Appointments', Value: appointmentSummary.todayAppointments },
        { Metric: 'Completed Appointments', Value: appointmentSummary.completedAppointments },
        { Metric: 'Pending Appointments', Value: appointmentSummary.pendingAppointments }
      ]);

      return { paymentSummary, appointmentSummary };
    } catch (error) {
      console.error('❌ Error getting Firebase data summary:', error);
      return null;
    }
  };

  // Force refresh all Firebase data
  (window as any).refreshFirebaseData = async () => {
    try {
      console.log('🔄 Forcing Firebase data refresh...');
      
      // Trigger re-initialization
      if (currentClinicId) {
        firebaseDataManager.cleanup();
        initializeFirebaseDataManager(currentClinicId);
      }
      
      console.log('✅ Firebase data refresh triggered');
      alert('🔄 Firebase data refresh triggered! Check for updates.');
    } catch (error) {
      console.error('❌ Error refreshing Firebase data:', error);
      alert('❌ Error refreshing Firebase data. Check console for details.');
    }
  };

  // Sync appointment and payment status
  (window as any).syncAppointmentPayment = async (appointmentId: string, paymentStatus: string) => {
    try {
      await firebaseDataManager.syncAppointmentPaymentStatus(appointmentId, paymentStatus);
      console.log(`✅ Synced appointment ${appointmentId} payment status to ${paymentStatus}`);
      alert(`✅ Synced appointment payment status to ${paymentStatus}`);
    } catch (error) {
      console.error('❌ Error syncing appointment payment status:', error);
      alert('❌ Error syncing appointment payment status. Check console for details.');
    }
  };

  console.log(`
🔥 FIREBASE DATA MANAGER DEBUG COMMANDS:

• testCrossPageSync() - Test real-time sync between pages
• getFirebaseDataSummary() - Get current data summary
• refreshFirebaseData() - Force refresh all data
• syncAppointmentPayment(appointmentId, status) - Sync appointment payment status
• firebaseDataManager - Direct access to data manager

Example: testCrossPageSync()
  `);
};

// ✅ CLEANUP function
export const cleanupFirebaseDataManager = () => {
  if (initialized) {
    firebaseDataManager.cleanup();
    initialized = false;
    currentClinicId = null;
    console.log('🧹 Global Firebase Data Manager cleaned up');
  }
};

// ✅ UTILS
export const isFirebaseDataManagerInitialized = () => initialized;
export const getCurrentClinicId = () => currentClinicId;

export default {
  initializeFirebaseDataManager,
  cleanupFirebaseDataManager,
  isFirebaseDataManagerInitialized,
  getCurrentClinicId
}; 