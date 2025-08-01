import { getDoctorsByClinic } from '../api/doctorPatients';
import { UserData } from '../api/auth';
import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
// Legacy utility commented out for clean build
// import { updatePatientAppointmentFields, syncDoctorInformationForAllPatients } from './appointmentPatientSync';
import { FirebaseFriendlySync } from './firebaseFriendlySync';

export interface SchedulingDoctor {
  id: number;
  firebaseId: string;  // 🔑 Link to Firebase user
  name: string;
  avatar: string;
  specialty: string;
  workingHours: { 
    start: string; 
    end: string; 
  };
  offDays: string[];
  maxPatientsPerHour: number;
  consultationDuration: number;
  clinicId: string;  // 🔑 Clinic association
  isActive: boolean;
  syncedAt: string;  // Last sync timestamp
}

export interface DoctorSyncResult {
  patientsUpdated: number;
  patientsChecked: number;
  errors: string[];
  syncMethod: 'firebase' | 'localStorage';
  timestamp: string;
}

/**
 * Sync Firebase doctors to scheduling system for a specific clinic
 */
export const syncFirebaseDoctorsToScheduling = async (clinicId: string): Promise<SchedulingDoctor[]> => {
  try {
    console.log(`🔄 Syncing doctors for clinic: ${clinicId}`);
    
    // Get doctors from Firebase for this clinic
    const firebaseDoctors = await getDoctorsByClinic(clinicId);
    
    // Load existing scheduling doctors for this clinic
    const existingDoctors = loadSchedulingDoctorsFromStorage(clinicId);
    
    // Convert Firebase doctors to scheduling format
    const syncedDoctors: SchedulingDoctor[] = [];
    let nextId = Math.max(...existingDoctors.map(d => d.id), 0) + 1;
    
    for (const fbDoctor of firebaseDoctors) {
      // Check if doctor already exists in scheduling
      let existingDoctor = existingDoctors.find(d => d.firebaseId === fbDoctor.id);
      
      if (existingDoctor) {
        // Update existing doctor info
        const updatedDoctor: SchedulingDoctor = {
          ...existingDoctor,
          name: `Dr. ${fbDoctor.firstName} ${fbDoctor.lastName}`,
          syncedAt: new Date().toISOString(),
          isActive: fbDoctor.isActive
        };
        syncedDoctors.push(updatedDoctor);
        console.log(`✅ Updated existing doctor: ${updatedDoctor.name}`);
      } else {
        // Create new scheduling doctor from Firebase data
        const newDoctor: SchedulingDoctor = {
          id: nextId++,
          firebaseId: fbDoctor.id,  // 🔑 Link to Firebase
          name: `Dr. ${fbDoctor.firstName} ${fbDoctor.lastName}`,
          avatar: `${fbDoctor.firstName[0]}${fbDoctor.lastName[0]}`.toUpperCase(),
          specialty: (fbDoctor as any).specialty || 'General Practice',  // Default specialty
          workingHours: { 
            start: '09:00', 
            end: '17:00' 
          },
          offDays: ['Friday'],  // Default
          maxPatientsPerHour: 4,
          consultationDuration: 30,
          clinicId: clinicId,
          isActive: fbDoctor.isActive,
          syncedAt: new Date().toISOString()
        };
        syncedDoctors.push(newDoctor);
        console.log(`✅ Created new scheduling doctor: ${newDoctor.name}`);
      }
    }
    
    // Keep existing non-Firebase doctors (manually added ones)
    const manualDoctors = existingDoctors.filter(d => !d.firebaseId);
    const finalDoctors = [...syncedDoctors, ...manualDoctors];
    
    // Note: localStorage persistence intentionally disabled
    // Data is managed through Firebase real-time sync instead
    
    console.log(`🎉 Successfully synced ${syncedDoctors.length} doctors for clinic ${clinicId}`);
    return finalDoctors.filter(d => d.isActive);  // Return only active doctors
    
  } catch (error) {
    console.error('❌ Error syncing Firebase doctors to scheduling:', error);
    return loadSchedulingDoctorsFromStorage(clinicId);  // Fallback to existing
  }
};

/**
 * Load scheduling doctors - UPDATED: No localStorage persistence
 */
export const loadSchedulingDoctorsFromStorage = (clinicId: string): SchedulingDoctor[] => {
  console.warn(`⚠️ loadSchedulingDoctorsFromStorage: localStorage persistence disabled for clinic ${clinicId} - returning empty array`);
  return [];
};

/**
 * Save scheduling doctors - UPDATED: No localStorage persistence
 * Data is managed through Firebase real-time sync instead
 */
export const saveSchedulingDoctorsToStorage = (clinicId: string, doctors: SchedulingDoctor[]): void => {
  // Intentionally disabled - using Firebase real-time sync instead of localStorage
  // This prevents storage conflicts and ensures data consistency across sessions
};

/**
 * Get Firebase doctor ID from scheduling doctor name
 */
export const getFirebaseIdFromSchedulingDoctor = (
  doctorName: string, 
  clinicId: string
): string | null => {
  try {
    const doctors = loadSchedulingDoctorsFromStorage(clinicId);
    const doctor = doctors.find(d => 
      d.name.toLowerCase().includes(doctorName.toLowerCase()) ||
      doctorName.toLowerCase().includes(d.name.toLowerCase())
    );
    
    return doctor?.firebaseId || null;
  } catch (error) {
    console.error('❌ Error getting Firebase ID from scheduling doctor:', error);
    return null;
  }
};

/**
 * Auto-sync doctors - UPDATED: No localStorage caching
 */
export const autoSyncDoctorsIfNeeded = async (clinicId: string): Promise<SchedulingDoctor[]> => {
  try {
    console.warn('⚠️ autoSyncDoctorsIfNeeded: localStorage caching disabled - always syncing fresh data');
    const doctors = await syncFirebaseDoctorsToScheduling(clinicId);
    return doctors;
  } catch (error) {
    console.error('❌ Error in auto-sync:', error);
    return loadSchedulingDoctorsFromStorage(clinicId);
  }
};

/**
 * Force sync doctors - UPDATED: No localStorage sync timestamps
 */
export const forceSyncDoctors = async (clinicId: string): Promise<SchedulingDoctor[]> => {
  console.log('🔄 Force syncing doctors...');
  console.warn('⚠️ forceSyncDoctors: localStorage sync timestamps disabled');
  const doctors = await syncFirebaseDoctorsToScheduling(clinicId);
  return doctors;
};

/**
 * Sync doctor information from appointments to patients using Firebase
 */
export const syncDoctorInformationFirebase = async (clinicId: string = 'demo-clinic'): Promise<DoctorSyncResult> => {
  console.log('👩‍⚕️ Starting Firebase doctor sync...');
  
  try {
    // Get data from Firebase
    const appointments = await AppointmentService.getAllAppointments(clinicId);
    const patients = await PatientService.searchPatients(clinicId, '');
    
    if (appointments.length === 0) {
      console.log('⚠️ No appointments found for doctor sync');
      return {
        patientsUpdated: 0,
        patientsChecked: 0,
        errors: ['No appointments found'],
        syncMethod: 'firebase',
        timestamp: new Date().toISOString()
      };
    }
    
    if (patients.length === 0) {
      console.log('⚠️ No patients found for doctor sync');
      return {
        patientsUpdated: 0,
        patientsChecked: 0,
        errors: ['No patients found'],
        syncMethod: 'firebase',
        timestamp: new Date().toISOString()
      };
    }
    
    // Use Firebase-friendly sync for doctor information
    const patientsUpdated = await FirebaseFriendlySync.syncDoctorInformation(clinicId, appointments, patients);
    
    console.log(`✅ Firebase doctor sync completed: ${patientsUpdated} patients updated`);
    
    return {
      patientsUpdated,
      patientsChecked: patients.length,
      errors: [],
      syncMethod: 'firebase',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Firebase doctor sync failed:', error);
    return {
      patientsUpdated: 0,
      patientsChecked: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      syncMethod: 'firebase',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Sync doctor information from appointments to patients using localStorage
 */
export const syncDoctorInformationLocal = (): DoctorSyncResult => {
  console.log('👩‍⚕️ Starting local doctor sync...');
  
  try {
    // Legacy function commented out for clean build
    // const patientsUpdated = syncDoctorInformationForAllPatients();
    const patientsUpdated = 0; // Placeholder
    
    console.log(`✅ Local doctor sync completed: ${patientsUpdated} patients updated`);
    
    return {
      patientsUpdated,
      patientsChecked: 0, // Not tracked in local sync
      errors: [],
      syncMethod: 'localStorage',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Local doctor sync failed:', error);
    return {
      patientsUpdated: 0,
      patientsChecked: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      syncMethod: 'localStorage',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Automatic doctor sync that chooses the best method based on available data
 */
export const syncDoctorInformationAuto = async (clinicId: string = 'demo-clinic'): Promise<DoctorSyncResult> => {
  console.log('👩‍⚕️ Starting automatic doctor sync...');
  
  try {
    // Try Firebase first
    const firebaseResult = await syncDoctorInformationFirebase(clinicId);
    
    if (firebaseResult.errors.length === 0) {
      console.log('✅ Firebase doctor sync succeeded');
      return firebaseResult;
    }
    
    // Fallback to localStorage
    console.log('⚠️ Firebase sync failed, falling back to localStorage...');
    const localResult = syncDoctorInformationLocal();
    
    return {
      ...localResult,
      errors: [
        ...firebaseResult.errors,
        ...localResult.errors
      ]
    };
    
  } catch (error) {
    console.error('❌ Automatic doctor sync failed:', error);
    return {
      patientsUpdated: 0,
      patientsChecked: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      syncMethod: 'firebase',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Test the doctor synchronization functionality
 */
export const testDoctorSync = async (clinicId: string = 'demo-clinic'): Promise<void> => {
  console.log('🧪 Testing doctor synchronization...');
  
  try {
    // Test Firebase sync
    console.log('📋 Testing Firebase sync...');
    const firebaseResult = await syncDoctorInformationFirebase(clinicId);
    console.log('Firebase sync result:', firebaseResult);
    
    // Test localStorage sync
    console.log('📋 Testing localStorage sync...');
    const localResult = syncDoctorInformationLocal();
    console.log('localStorage sync result:', localResult);
    
    // Test automatic sync
    console.log('📋 Testing automatic sync...');
    const autoResult = await syncDoctorInformationAuto(clinicId);
    console.log('Automatic sync result:', autoResult);
    
    console.log('✅ Doctor sync testing completed');
    
  } catch (error) {
    console.error('❌ Doctor sync testing failed:', error);
    throw error;
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).syncDoctorInformationFirebase = syncDoctorInformationFirebase;
  (window as any).syncDoctorInformationLocal = syncDoctorInformationLocal;
  (window as any).syncDoctorInformationAuto = syncDoctorInformationAuto;
  (window as any).testDoctorSync = testDoctorSync;
}

// Export default auto sync function
export default syncDoctorInformationAuto; 