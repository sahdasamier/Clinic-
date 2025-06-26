import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { firestore }
  from '../lib/firebase'; // Assuming this is your Firebase initialization file
import {
  type ClinicPaymentSettings,
  type AppointmentTypeSettings,
  type VATSettings,
  defaultClinicPaymentSettings, // For default structure if no config exists
  defaultVATSettings, // For default structure
} from '../data/mockData'; // Adjust path as necessary

// Interface for the entire clinic configuration document
export interface ClinicConfig extends DocumentData {
  id: string; // Should be the clinicId
  paymentSettings: ClinicPaymentSettings;
  vatSettings: VATSettings;
  // Can add other configurations like notification preferences, etc.
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const CLINIC_CONFIGS_COLLECTION = 'clinicConfigs';

/**
 * Creates or retrieves the default clinic configuration.
 * This is used if a clinic's configuration document doesn't exist yet.
 * @param clinicId The ID of the clinic.
 * @returns A default ClinicConfig object.
 */
const getDefaultClinicConfig = (clinicId: string): ClinicConfig => {
  return {
    id: clinicId,
    paymentSettings: defaultClinicPaymentSettings,
    vatSettings: defaultVATSettings,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

/**
 * Retrieves the full configuration for a specific clinic.
 * If no configuration exists, it initializes and returns a default one (but does not save it automatically).
 * @param clinicId The ID of the clinic.
 * @returns A Promise resolving to the ClinicConfig object or null if clinicId is invalid.
 */
export const getClinicConfig = async (clinicId: string): Promise<ClinicConfig | null> => {
  if (!clinicId) {
    console.error('ClinicConfigService: clinicId is required to get config.');
    return null;
  }
  try {
    const docRef = doc(firestore, CLINIC_CONFIGS_COLLECTION, clinicId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ClinicConfig;
    } else {
      console.warn(`ClinicConfigService: No config found for clinic ${clinicId}. Returning default structure.`);
      // It's often better to initialize the config explicitly when a clinic is created
      // or when settings are first accessed and saved.
      // For now, we return the default structure without saving.
      return getDefaultClinicConfig(clinicId);
    }
  } catch (error) {
    console.error('ClinicConfigService: Error fetching clinic configuration:', error);
    throw error;
  }
};

/**
 * Saves or updates the entire clinic configuration.
 * If the document doesn't exist, it will be created.
 * @param clinicId The ID of the clinic.
 * @param config The ClinicConfig object to save.
 * @returns A Promise that resolves when the operation is complete.
 */
export const saveClinicConfig = async (clinicId: string, configData: Partial<ClinicConfig>): Promise<void> => {
  if (!clinicId) {
    console.error('ClinicConfigService: clinicId is required to save config.');
    return;
  }
  try {
    const docRef = doc(firestore, CLINIC_CONFIGS_COLLECTION, clinicId);
    const dataToSave = {
      ...configData,
      id: clinicId, // Ensure clinicId is part of the document data
      updatedAt: Timestamp.now(),
    };
    // Use setDoc with merge: true to create or update
    await setDoc(docRef, dataToSave, { merge: true });
    console.log(`ClinicConfigService: Configuration for clinic ${clinicId} saved.`);
  } catch (error) {
    console.error('ClinicConfigService: Error saving clinic configuration:', error);
    throw error;
  }
};


/**
 * Updates only the paymentSettings part of the clinic configuration.
 * @param clinicId The ID of the clinic.
 * @param paymentSettings The new payment settings.
 * @returns A Promise that resolves when the operation is complete.
 */
export const updatePaymentSettings = async (clinicId: string, paymentSettings: ClinicPaymentSettings): Promise<void> => {
  if (!clinicId) {
    console.error('ClinicConfigService: clinicId is required to update payment settings.');
    return;
  }
  try {
    const docRef = doc(firestore, CLINIC_CONFIGS_COLLECTION, clinicId);
    await updateDoc(docRef, {
      paymentSettings: paymentSettings,
      updatedAt: Timestamp.now(),
    });
    console.log(`ClinicConfigService: Payment settings for clinic ${clinicId} updated.`);
  } catch (error) {
    console.error('ClinicConfigService: Error updating payment settings:', error);
    // Consider creating the document if it doesn't exist
    const currentConfig = await getDoc(docRef);
    if (!currentConfig.exists()) {
      console.log(`ClinicConfigService: No config found for clinic ${clinicId}, creating with new payment settings.`);
      const defaultConfig = getDefaultClinicConfig(clinicId);
      await saveClinicConfig(clinicId, { ...defaultConfig, paymentSettings });
    } else {
      throw error;
    }
  }
};

/**
 * Updates only the vatSettings part of the clinic configuration.
 * @param clinicId The ID of the clinic.
 * @param vatSettings The new VAT settings.
 * @returns A Promise that resolves when the operation is complete.
 */
export const updateVatSettings = async (clinicId: string, vatSettings: VATSettings): Promise<void> => {
  if (!clinicId) {
    console.error('ClinicConfigService: clinicId is required to update VAT settings.');
    return;
  }
  try {
    const docRef = doc(firestore, CLINIC_CONFIGS_COLLECTION, clinicId);
    await updateDoc(docRef, {
      vatSettings: vatSettings,
      updatedAt: Timestamp.now(),
    });
    console.log(`ClinicConfigService: VAT settings for clinic ${clinicId} updated.`);
  } catch (error) {
    console.error('ClinicConfigService: Error updating VAT settings:', error);
    const currentConfig = await getDoc(docRef);
    if (!currentConfig.exists()) {
      console.log(`ClinicConfigService: No config found for clinic ${clinicId}, creating with new VAT settings.`);
      const defaultConfig = getDefaultClinicConfig(clinicId);
      await saveClinicConfig(clinicId, { ...defaultConfig, vatSettings });
    } else {
      throw error;
    }
  }
};

/**
 * Retrieves a specific service fee for a given appointment type.
 * @param clinicId The ID of the clinic.
 * @param appointmentType The type of the appointment (e.g., "Consultation").
 * @returns A Promise resolving to the AppointmentTypeSettings or null if not found.
 */
export const getServiceFee = async (clinicId: string, appointmentType: string): Promise<AppointmentTypeSettings | null> => {
  if (!clinicId || !appointmentType) {
    console.error('ClinicConfigService: clinicId and appointmentType are required to get service fee.');
    return null;
  }
  try {
    const config = await getClinicConfig(clinicId);
    if (config && config.paymentSettings && config.paymentSettings.appointmentTypes) {
      const feeSetting = config.paymentSettings.appointmentTypes.find(
        (fee) => fee.type.toLowerCase() === appointmentType.toLowerCase()
      );
      return feeSetting || null;
    }
    return null;
  } catch (error) {
    console.error('ClinicConfigService: Error fetching service fee:', error);
    throw error; // Or return null based on how you want to handle errors
  }
};

/**
 * Listens to real-time updates for a clinic's configuration.
 * @param clinicId The ID of the clinic.
 * @param callback A function to call with the updated ClinicConfig data.
 * @returns An Unsubscribe function to stop listening.
 */
export const listenToClinicConfig = (
  clinicId: string,
  callback: (config: ClinicConfig | null) => void
): Unsubscribe => {
  if (!clinicId) {
    console.error('ClinicConfigService: clinicId is required to listen to config.');
    callback(null); // Call with null if no clinicId
    return () => {}; // Return a no-op unsubscribe function
  }

  const docRef = doc(firestore, CLINIC_CONFIGS_COLLECTION, clinicId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as ClinicConfig);
      } else {
        // If no config exists, provide a default structure to the callback.
        // The component using this listener can decide if it wants to save this default.
        console.warn(`ClinicConfigService: No config found for clinic ${clinicId} during listener setup. Providing default structure.`);
        callback(getDefaultClinicConfig(clinicId));
      }
    },
    (error) => {
      console.error('ClinicConfigService: Real-time listener error:', error);
      callback(null); // Propagate error state or default
    }
  );

  return unsubscribe;
};

// Ensure that the defaultClinicPaymentSettings and defaultVATSettings are imported
// and used correctly in getDefaultClinicConfig.

// Example of ensuring a clinic has a configuration (e.g., on clinic creation or first settings access)
export const ensureClinicConfigExists = async (clinicId: string): Promise<ClinicConfig> => {
    if (!clinicId) {
        throw new Error("Clinic ID is required to ensure configuration exists.");
    }
    const docRef = doc(firestore, CLINIC_CONFIGS_COLLECTION, clinicId);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        console.log(`ClinicConfigService: Initializing default config for clinic ${clinicId}.`);
        const defaultConfig = getDefaultClinicConfig(clinicId);
        await setDoc(docRef, { ...defaultConfig, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
        docSnap = await getDoc(docRef); // Re-fetch after creation
        if (!docSnap.exists()) { // Should not happen if setDoc was successful
          throw new Error(`Failed to create and fetch clinic config for ${clinicId}`);
        }
    }
    return { id: docSnap.id, ...docSnap.data() } as ClinicConfig;
};
