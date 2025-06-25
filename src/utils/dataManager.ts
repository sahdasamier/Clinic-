// Data management utilities for user sessions
// UPDATED: Removed localStorage persistence - data export/import disabled

// Keys for localStorage - kept for compatibility but no longer used
export const STORAGE_KEYS = {
  APPOINTMENTS: 'clinic_appointments',
  PATIENTS: 'clinic_patients', 
  PAYMENTS: 'clinic_payments',
  DOCTORS: 'clinic_doctors',
  MEDICAL_RECORDS: 'clinic_medical_records',
  PRESCRIPTIONS: 'clinic_prescriptions',
  ANALYTICS: 'clinic_analytics',
  SETTINGS: 'clinic_settings'
};



// Export data for backup - DEPRECATED: No longer reads from localStorage
export const exportUserData = () => {
  console.warn('⚠️ exportUserData is deprecated - no localStorage data to export');
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    data: {},
    note: 'localStorage persistence removed - no data to export'
  };
};

// Import data from backup - DEPRECATED: No longer writes to localStorage
export const importUserData = (backupData: any): boolean => {
  console.warn('⚠️ importUserData is deprecated - localStorage persistence removed');
  console.log('Received backup data:', backupData);
  
  // Trigger update events to notify components
  window.dispatchEvent(new CustomEvent('userDataCleared'));
  window.dispatchEvent(new CustomEvent('appointmentsUpdated'));
  
  console.log('✅ Import events dispatched (no data actually imported)');
  return true;
}; 