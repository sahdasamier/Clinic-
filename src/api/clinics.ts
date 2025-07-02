import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// TODO: Implement clinic-related API functions (e.g., fetch clinics, create clinic) 

// Add these interfaces and functions at the end of the file
export interface VATSettings {
  enabled: boolean;
  rate: number;
  defaultIncludeVAT: boolean;
  registrationNumber?: string;
  description?: string;
}

export interface ClinicPaymentSettings {
  autoCreatePaymentOnCompletion: boolean;
  defaultPaymentMethod: string;
  defaultPaymentDueDays: number;
  appointmentTypes: Array<{
    type: string;
    cost: number;
    currency: string;
    includeVAT: boolean;
    category: string;
  }>;
}

export interface ClinicSettings {
  id: string;
  clinicId: string;
  vatSettings: VATSettings;
  paymentSettings: ClinicPaymentSettings;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

const SETTINGS_COLLECTION = 'clinicSettings';

// Default settings
export const defaultVATSettings: VATSettings = {
  enabled: true,
  rate: 14,
  defaultIncludeVAT: true,
  registrationNumber: '',
  description: 'Value Added Tax'
};

export const defaultClinicPaymentSettings: ClinicPaymentSettings = {
  autoCreatePaymentOnCompletion: true,
  defaultPaymentMethod: 'cash',
  defaultPaymentDueDays: 30,
  appointmentTypes: [
    { type: 'consultation', cost: 200, currency: 'EGP', includeVAT: true, category: 'medical' },
    { type: 'check_up', cost: 150, currency: 'EGP', includeVAT: true, category: 'medical' },
    { type: 'surgery', cost: 1000, currency: 'EGP', includeVAT: true, category: 'medical' },
    { type: 'follow_up', cost: 100, currency: 'EGP', includeVAT: true, category: 'medical' }
  ]
};

// Get clinic settings
export const getClinicSettings = async (clinicId: string): Promise<ClinicSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, clinicId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      console.log('✅ Clinic settings loaded from Firebase:', clinicId);
      return {
        id: settingsDoc.id,
        ...data
      } as ClinicSettings;
    } else {
      // Create default settings if they don't exist
      console.log('📝 Creating default clinic settings for:', clinicId);
      const defaultSettings: ClinicSettings = {
        id: clinicId,
        clinicId,
        vatSettings: defaultVATSettings,
        paymentSettings: defaultClinicPaymentSettings,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('❌ Error getting clinic settings:', error);
    // Return defaults if Firebase fails
    return {
      id: clinicId,
      clinicId,
      vatSettings: defaultVATSettings,
      paymentSettings: defaultClinicPaymentSettings,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

// Update clinic settings
export const updateClinicSettings = async (clinicId: string, updates: Partial<ClinicSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, clinicId);
    await setDoc(settingsRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Clinic settings updated:', clinicId);
  } catch (error) {
    console.error('❌ Error updating clinic settings:', error);
    throw error;
  }
};

// Update VAT settings
export const updateVATSettings = async (clinicId: string, vatSettings: VATSettings): Promise<void> => {
  try {
    await updateClinicSettings(clinicId, { vatSettings });
    console.log('✅ VAT settings updated for clinic:', clinicId);
  } catch (error) {
    console.error('❌ Error updating VAT settings:', error);
    throw error;
  }
};

// Update payment settings
export const updatePaymentSettings = async (clinicId: string, paymentSettings: ClinicPaymentSettings): Promise<void> => {
  try {
    await updateClinicSettings(clinicId, { paymentSettings });
    console.log('✅ Payment settings updated for clinic:', clinicId);
  } catch (error) {
    console.error('❌ Error updating payment settings:', error);
    throw error;
  }
};

// Listen to clinic settings changes
export const listenToClinicSettings = (clinicId: string, callback: (settings: ClinicSettings) => void): () => void => {
  const settingsRef = doc(db, SETTINGS_COLLECTION, clinicId);
  
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      const settings = {
        id: doc.id,
        ...doc.data()
      } as ClinicSettings;
      callback(settings);
    } else {
      // Return defaults if document doesn't exist
      callback({
        id: clinicId,
        clinicId,
        vatSettings: defaultVATSettings,
        paymentSettings: defaultClinicPaymentSettings,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }, (error) => {
    console.error('❌ Error listening to clinic settings:', error);
    // Return defaults on error
    callback({
      id: clinicId,
      clinicId,
      vatSettings: defaultVATSettings,
      paymentSettings: defaultClinicPaymentSettings,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
}; 