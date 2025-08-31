import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from './../firebase/legacy-compat';

// Helper to get safe database reference
const getDb = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  return getOptimizedFirestore();
};

// TODO: Implement clinic-related API functions (e.g., fetch clinics, create clinic) 

export interface ClinicPaymentSettings {
  vatEnabled: boolean;
  vatRate: number;
  currency: string;
  paymentMethods: {
    cash: boolean;
    card: boolean;
    insurance: boolean;
    bank: boolean;
  };
}

export interface ClinicSettings {
  id: string;
  clinicId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  paymentSettings: ClinicPaymentSettings;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

const SETTINGS_COLLECTION = 'clinic_settings';

// Default payment settings
const defaultClinicPaymentSettings: ClinicPaymentSettings = {
  vatEnabled: false,
  vatRate: 0.21, // 21% VAT (adjust for your country)
  currency: 'USD',
  paymentMethods: {
    cash: true,
    card: true,
    insurance: true,
    bank: true
  }
};

export const getClinicSettings = async (clinicId: string): Promise<ClinicSettings> => {
  try {
    const settingsRef = doc(getDb(), SETTINGS_COLLECTION, clinicId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      console.log('✅ Clinic settings loaded from Firebase:', clinicId);
      return {
        id: settingsDoc.id,
        clinicId,
        ...data
      } as ClinicSettings;
    } else {
      // Create default settings if they don't exist
      console.log('🔧 Creating default clinic settings for:', clinicId);
      const defaultSettings: Omit<ClinicSettings, 'id'> = {
        clinicId,
        name: 'Demo Clinic',
        address: '123 Medical Street',
        phone: '+1 234 567 8900',
        email: 'admin@democlinic.com',
        paymentSettings: defaultClinicPaymentSettings,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(settingsRef, defaultSettings);
      return { id: clinicId, ...defaultSettings } as ClinicSettings;
    }
  } catch (error) {
    console.error('❌ Error loading clinic settings:', error);
    throw error;
  }
};

export const updateClinicSettings = async (clinicId: string, updates: Partial<ClinicSettings>): Promise<void> => {
  try {
    const settingsRef = doc(getDb(), SETTINGS_COLLECTION, clinicId);
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

// Listen to clinic settings changes
export const listenToClinicSettings = (clinicId: string, callback: (settings: ClinicSettings) => void): () => void => {
  const settingsRef = doc(getDb(), SETTINGS_COLLECTION, clinicId);
  
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      const settings = {
        id: doc.id,
        ...doc.data()
      } as ClinicSettings;
      callback(settings);
    }
  });
}; 