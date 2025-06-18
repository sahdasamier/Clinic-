// Data management utilities for user sessions

// Keys for localStorage
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



// Export data for backup
export const exportUserData = () => {
  try {
    const userData: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      if (data) {
        userData[key] = JSON.parse(data);
      }
    });
    
    return {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data: userData
    };
  } catch (error) {
    console.error('❌ Error exporting user data:', error);
    return null;
  }
};

// Import data from backup
export const importUserData = (backupData: any): boolean => {
  try {
    if (!backupData || !backupData.data) {
      throw new Error('Invalid backup data');
    }
    
    // Clear existing data first
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Import the backup data
    Object.entries(backupData.data).forEach(([key, value]) => {
      const storageKey = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
      if (storageKey && value) {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    });
    
    // Trigger update events
    window.dispatchEvent(new CustomEvent('userDataCleared'));
    window.dispatchEvent(new CustomEvent('appointmentsUpdated'));
    
    console.log('✅ User data imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Error importing user data:', error);
    return false;
  }
}; 