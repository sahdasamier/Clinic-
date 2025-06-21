// Data Synchronization Manager for Clinic Management System
// Handles bidirectional sync between appointments, payments, doctors, and patients

export interface SyncEventDetail {
  source: string;
  timestamp: string;
  data?: any;
}

// Storage keys
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
 * Generic function to save data and dispatch update event
 */
export const saveDataWithSync = (
  storageKey: string,
  data: any[],
  eventType: string,
  source: string
): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    dispatchSyncEvent(eventType, source, { count: data.length });
    console.log(`✅ DataSync: Saved ${data.length} items to ${storageKey}`);
  } catch (error) {
    console.error(`❌ DataSync: Error saving to ${storageKey}:`, error);
    throw error;
  }
};

/**
 * Generic function to load data from storage
 */
export const loadDataFromStorage = <T>(
  storageKey: string,
  defaultData: T[] = []
): T[] => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (Array.isArray(parsedData)) {
        console.log(`✅ DataSync: Loaded ${parsedData.length} items from ${storageKey}`);
        return parsedData;
      }
    }
  } catch (error) {
    console.error(`❌ DataSync: Error loading from ${storageKey}:`, error);
  }
  
  console.log(`ℹ️ DataSync: Using default data for ${storageKey}`);
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
 * Appointment-specific sync utilities
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
    return loadDataFromStorage(SYNC_STORAGE_KEYS.APPOINTMENTS, defaultData);
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.APPOINTMENTS_UPDATED, handler, componentName);
  }
};

/**
 * Payment-specific sync utilities
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
    return loadDataFromStorage(SYNC_STORAGE_KEYS.PAYMENTS, defaultData);
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.PAYMENTS_UPDATED, handler, componentName);
  }
};

/**
 * Doctor-specific sync utilities
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
    return loadDataFromStorage(SYNC_STORAGE_KEYS.DOCTORS, defaultData);
  },
  
  listen: (handler: (event: CustomEvent<SyncEventDetail>) => void, componentName: string) => {
    return setupSyncListener(SYNC_EVENTS.DOCTORS_UPDATED, handler, componentName);
  }
};

/**
 * Patient-specific sync utilities
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
    return loadDataFromStorage(SYNC_STORAGE_KEYS.PATIENTS, defaultData);
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
 * Debug utility to log current storage state
 */
export const debugStorageState = () => {
  console.group('🔍 DataSync: Current Storage State');
  
  Object.entries(SYNC_STORAGE_KEYS).forEach(([key, storageKey]) => {
    try {
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : null;
      const count = Array.isArray(parsed) ? parsed.length : 0;
      console.log(`${key}: ${count} items`);
    } catch (error) {
      console.error(`${key}: Error parsing data`);
    }
  });
  
  console.groupEnd();
}; 