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
 * Load scheduling doctors from localStorage for a specific clinic
 */
export const loadSchedulingDoctorsFromStorage = (clinicId: string): SchedulingDoctor[] => {
  try {
    const key = `clinic_${clinicId}_scheduling_doctors`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('❌ Error loading scheduling doctors from storage:', error);
    return [];
  }
};

/**
 * Save scheduling doctors to localStorage for a specific clinic
 */
export const saveSchedulingDoctorsToStorage = (clinicId: string, doctors: SchedulingDoctor[]): void => {
  try {
    const key = `clinic_${clinicId}_scheduling_doctors`;
    localStorage.setItem(key, JSON.stringify(doctors));
    console.log(`💾 Saved ${doctors.length} scheduling doctors for clinic ${clinicId}`);
  } catch (error) {
    console.error('❌ Error saving scheduling doctors to storage:', error);
  }
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
 * Auto-sync doctors when page loads (with caching)
 */
export const autoSyncDoctorsIfNeeded = async (clinicId: string): Promise<SchedulingDoctor[]> => {
  try {
    // Check last sync time
    const lastSyncKey = `clinic_${clinicId}_last_doctor_sync`;
    const lastSync = localStorage.getItem(lastSyncKey);
    const now = Date.now();
    const syncInterval = 5 * 60 * 1000; // 5 minutes
    
    if (!lastSync || (now - parseInt(lastSync)) > syncInterval) {
      console.log('🔄 Auto-syncing doctors (cache expired)');
      const doctors = await syncFirebaseDoctorsToScheduling(clinicId);
      localStorage.setItem(lastSyncKey, now.toString());
      return doctors;
    } else {
      console.log('✅ Using cached doctors (sync not needed)');
      return loadSchedulingDoctorsFromStorage(clinicId);
    }
  } catch (error) {
    console.error('❌ Error in auto-sync:', error);
    return loadSchedulingDoctorsFromStorage(clinicId);
  }
};

/**
 * Force sync doctors (manual refresh)
 */
export const forceSyncDoctors = async (clinicId: string): Promise<SchedulingDoctor[]> => {
  console.log('🔄 Force syncing doctors...');
  const doctors = await syncFirebaseDoctorsToScheduling(clinicId);
  
  // Update last sync time
  const lastSyncKey = `clinic_${clinicId}_last_doctor_sync`;
  localStorage.setItem(lastSyncKey, Date.now().toString());
  
  return doctors;
}; 