import { getDoctorsByClinic } from '../api/doctorPatients';
import { UserData } from '../api/auth';

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
    
    // Save back to storage
    saveSchedulingDoctorsToStorage(clinicId, finalDoctors);
    
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
 */
export const saveSchedulingDoctorsToStorage = (clinicId: string, doctors: SchedulingDoctor[]): void => {
  console.warn(`⚠️ saveSchedulingDoctorsToStorage: localStorage persistence disabled for clinic ${clinicId} - ${doctors.length} doctors not saved`);
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