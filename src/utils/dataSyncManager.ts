// Data Synchronization Manager for Clinic Management System
// Handles bidirectional sync between appointments, payments, doctors, and patients
// UPDATED: Removed localStorage persistence - components manage their own state

export interface SyncEventDetail {
  source: string;
  timestamp: string;
  data?: any;
}

// Storage keys - kept for compatibility but no longer used for localStorage
export const SYNC_STORAGE_KEYS = {
  APPOINTMENTS: 'clinic_appointments_data',
  PAYMENTS: 'clinic_payments_data',
  PATIENTS: 'clinic_patients_data',
  DOCTORS: 'clinic_doctor_schedules',
} as const;

// Event types
export const SYNC_EVENTS = {
  APPOINTMENTS_UPDATED: 'appointmentsUpdated',
  PAYMENTS_UPDATED: 'paymentsUpdated',
  PATIENTS_UPDATED: 'patientsUpdated',
  DOCTORS_UPDATED: 'doctorsUpdated',
  APPOINTMENT_PAYMENT_SYNC: 'appointmentPaymentSync',
  DATA_CLEARED: 'userDataCleared',
} as const;

/**
 * Dispatch a sync event to notify other components
 */
export const dispatchSyncEvent = (
  eventType: string, 
  source: string, 
  data?: any
): void => {
  const eventDetail: SyncEventDetail = {
    source,
    timestamp: new Date().toISOString(),
    data
  };

  const event = new CustomEvent(eventType, { detail: eventDetail });
  window.dispatchEvent(event);
  
  console.log(`🔔 DataSync: Dispatched ${eventType} from ${source}`, eventDetail);
};

/**
 * Generic function to dispatch update event - NO LONGER SAVES TO localStorage
 */
export const saveDataWithSync = (
  storageKey: string,
  data: any[],
  eventType: string,
  source: string
): void => {
  try {
    // REMOVED: localStorage.setItem(storageKey, JSON.stringify(data));
    dispatchSyncEvent(eventType, source, { count: data.length });
    console.log(`✅ DataSync: Dispatched event for ${data.length} items (no localStorage)`);
  } catch (error) {
    console.error(`❌ DataSync: Error dispatching event for ${storageKey}:`, error);
    throw error;
  }
};

/**
 * Generic function to load data from storage - DEPRECATED, returns empty array
 */
export const loadDataFromStorage = <T>(
  storageKey: string,
  defaultData: T[] = []
): T[] => {
  console.log(`⚠️ DataSync: loadDataFromStorage is deprecated for ${storageKey} - components should manage their own state`);
  return defaultData;
};

/**
 * Set up event listener with cleanup
 */
export const setupSyncListener = (
  eventType: string,
  handler: (event: CustomEvent<SyncEventDetail>) => void,
  componentName: string
): (() => void) => {
  const wrappedHandler = (event: Event) => {
    const customEvent = event as CustomEvent<SyncEventDetail>;
    console.log(`📞 DataSync: ${componentName} received ${eventType}`, customEvent.detail);
    handler(customEvent);
  };

  window.addEventListener(eventType, wrappedHandler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(eventType, wrappedHandler);
    console.log(`🧹 DataSync: ${componentName} cleaned up ${eventType} listener`);
  };
};

/**
 * Appointment-specific sync utilities - UPDATED: No localStorage operations
 */
export const appointmentSync = {
  save: (appointments: any[], source: string) => {
    saveDataWithSync(
      SYNC_STORAGE_KEYS.APPOINTMENTS,
      appointments,
      SYNC_EVENTS.APPOINTMENTS_UPDATED,
      source
    );
  },
  
  load: (defaultData: any[] = []) => {
    console.log(`⚠️ appointmentSync.load is deprecated - component should manage its own state`);
    return defaultData;
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.APPOINTMENTS_UPDATED, handler, componentName);
  }
};

/**
 * Payment-specific sync utilities - UPDATED: No localStorage operations
 */
export const paymentSync = {
  save: (payments: any[], source: string) => {
    saveDataWithSync(
      SYNC_STORAGE_KEYS.PAYMENTS,
      payments,
      SYNC_EVENTS.PAYMENTS_UPDATED,
      source
    );
  },
  
  load: (defaultData: any[] = []) => {
    console.log(`⚠️ paymentSync.load is deprecated - component should manage its own state`);
    return defaultData;
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.PAYMENTS_UPDATED, handler, componentName);
  }
};

/**
 * Doctor-specific sync utilities - UPDATED: No localStorage operations
 */
export const doctorSync = {
  save: (doctors: any[], source: string) => {
    saveDataWithSync(
      SYNC_STORAGE_KEYS.DOCTORS,
      doctors,
      SYNC_EVENTS.DOCTORS_UPDATED,
      source
    );
  },
  
  load: (defaultData: any[] = []) => {
    console.log(`⚠️ doctorSync.load is deprecated - component should manage its own state`);
    return defaultData;
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.DOCTORS_UPDATED, handler, componentName);
  }
};

/**
 * Patient-specific sync utilities - UPDATED: No localStorage operations
 */
export const patientSync = {
  save: (patients: any[], source: string) => {
    saveDataWithSync(
      SYNC_STORAGE_KEYS.PATIENTS,
      patients,
      SYNC_EVENTS.PATIENTS_UPDATED,
      source
    );
  },
  
  load: (defaultData: any[] = []) => {
    console.log(`⚠️ patientSync.load is deprecated - component should manage its own state`);
    return defaultData;
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.PATIENTS_UPDATED, handler, componentName);
  }
};

/**
 * Initialize bidirectional sync between appointments and payments
 */
export const initializeBidirectionalSync = (componentName: string): (() => void) => {
  const cleanupFunctions: (() => void)[] = [];

  // Log initialization
  console.log(`🔄 DataSync: Initializing bidirectional sync for ${componentName}`);

  // Set up all necessary listeners based on component
  if (componentName.includes('Appointment')) {
    // Appointment component listens to payments, doctors, patients
    cleanupFunctions.push(
      paymentSync.listen((event) => {
        console.log(`📊 AppointmentSync: Payment data updated, ${event.detail.data?.count || 0} payments`);
      }, componentName)
    );
  }
  
  if (componentName.includes('Payment')) {
    // Payment component listens to appointments, doctors, patients
    cleanupFunctions.push(
      appointmentSync.listen((event) => {
        console.log(`💰 PaymentSync: Appointment data updated, ${event.detail.data?.count || 0} appointments`);
      }, componentName)
    );
  }

  // Return cleanup function that calls all cleanup functions
  return () => {
    console.log(`🧹 DataSync: Cleaning up bidirectional sync for ${componentName}`);
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};

/**
 * Debug utility to log current storage state - UPDATED: No longer checks localStorage
 */
export const debugStorageState = () => {
  console.group('🔍 DataSync: Current Storage State (localStorage operations removed)');
  
  Object.entries(SYNC_STORAGE_KEYS).forEach(([key, storageKey]) => {
    console.log(`${key}: localStorage operations removed - components manage their own state`);
  });
  
  console.groupEnd();
}; 