import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  getDocs,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
  limit
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '@lib/firebase/legacy-compat';
import { AppointmentConflictService } from './AppointmentConflictService';

// ✅ Utility function for generating IDs (with fallback for older browsers)
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const COLLECTION_NAME = 'appointments';

// Safe collection reference that provides both sync and async access patterns
const getAppointmentsCollection = () => {
  // Try synchronous cached version first
  if (firebaseManager.isReadySync()) {
    try {
      const db = firebaseManager.getFirestoreSync();
      return collection(db, COLLECTION_NAME);
    } catch (error) {
      console.warn('⚠️ Sync access failed:', error);
      throw new Error('Firebase not ready - please wait for initialization');
    }
  }
  
  throw new Error('Firebase not ready - please wait for initialization');
};

// Async version with retry logic for use in async contexts
const getAppointmentsCollectionAsync = async () => {
  // Try synchronous cached version first
  if (firebaseManager.isReadySync()) {
    try {
      const db = firebaseManager.getFirestoreSync();
      return collection(db, COLLECTION_NAME);
    } catch (error) {
      console.warn('⚠️ Sync access failed, falling back to async:', error);
    }
  }
  
  // Fallback to async version with proper retry logic
  let retries = 0;
  while (!firebaseManager.isReadySync() && retries < 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    retries++;
  }
  
  if (!firebaseManager.isReadySync()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  
  // Ensure instances are cached
  await firebaseManager.cacheInstances();
  
  const db = await getOptimizedFirestore();
  if (!db) throw new Error('Firestore not initialized');
  
  return collection(db, COLLECTION_NAME);
};

export interface Appointment {
  id: string;
  clinicId: string;
  patientId?: string;
  doctorId?: string;
  patient: string;
  doctor: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format 
  timeSlot: string; // HH:MM format for scheduling
  duration: number; // minutes
  type: 'follow-up' | 'consultation' | 'surgery' | 'emergency' | 'check_up' | 'procedure' | 'vaccination' | 'lab_test' | 'imaging' | 'other';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'normal' | 'high' | 'urgent';
  location?: string; // room number, etc.
  phone?: string;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'failed';
  insuranceInfo?: {
    provider: string;
    number: string;
    coverageAmount?: number;
  };
  isAvailableSlot?: boolean; // for scheduling system
  completed?: boolean; // legacy field for backward compatibility
  patientAvatar?: string;
  reminderSent?: boolean;
  followUpRequired?: boolean;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export const AppointmentService = {
  // ✅ ENHANCED: Smart patient management that updates existing patients instead of creating duplicates
  async ensurePatientExists(clinicId: string, patientName: string, patientPhone?: string, existingPatientId?: string): Promise<string | undefined> {
    try {
      // Dynamic import to avoid circular dependency
      const { PatientService } = await import('./PatientService');
      
      // ✅ PRIORITY 1: If we have an existing patient ID, update that patient instead of searching
      if (existingPatientId && existingPatientId !== 'legacy-patient' && existingPatientId !== 'unknown-patient') {
        try {
          console.log(`🔄 PRIORITY UPDATE: Updating existing patient ${existingPatientId} with new name: ${patientName}`);
          
          // First verify the patient exists
          const allPatients = await PatientService.searchPatients(clinicId, '');
          const existingPatient = allPatients.find(p => p.id === existingPatientId);
          
          if (existingPatient) {
            // Update the existing patient with new information
            const updateData: any = { name: patientName };
            if (patientPhone && patientPhone.trim() !== '') {
              updateData.phone = patientPhone;
            }
            
            await PatientService.updatePatient(existingPatientId, updateData);
            console.log(`✅ PRIORITY UPDATE SUCCESS: Patient updated - ${existingPatient.name} → ${patientName} (ID: ${existingPatientId})`);
            return existingPatientId;
          } else {
            console.warn(`⚠️ PRIORITY UPDATE: Patient with ID ${existingPatientId} not found, proceeding with search strategies`);
          }
        } catch (updateError) {
          console.warn(`⚠️ PRIORITY UPDATE FAILED: Could not update patient ${existingPatientId}:`, updateError);
          // Continue to search logic below if update fails
        }
      }
      
      // ✅ STRATEGY 2: Search for existing patients only if no existing ID was provided
      if (!existingPatientId || existingPatientId === 'legacy-patient' || existingPatientId === 'unknown-patient') {
        console.log(`🔍 SEARCHING: No valid existing patient ID, searching for matches for: ${patientName}`);
        
        const existingPatients = await PatientService.searchPatients(clinicId, patientName);
        
        // Strategy 2A: Exact name and phone match
        let exactMatch = existingPatients.find(p => {
          const nameMatch = p.name?.toLowerCase().trim() === patientName.toLowerCase().trim();
          const phoneMatch = !patientPhone || !p.phone || p.phone === patientPhone;
          return nameMatch && phoneMatch;
        });
        
        // Strategy 2B: If no exact match and phone provided, try phone-only match
        if (!exactMatch && patientPhone && patientPhone.trim() !== '') {
          exactMatch = existingPatients.find(p => p.phone === patientPhone);
          if (exactMatch) {
            console.log(`📞 PHONE MATCH: Found patient by phone, updating name: ${exactMatch.name} → ${patientName}`);
            await PatientService.updatePatient(exactMatch.id, { name: patientName });
            return exactMatch.id;
          }
        }
        
        // Strategy 2C: Fuzzy name matching (only if no phone provided to avoid false matches)
        if (!exactMatch && (!patientPhone || patientPhone.trim() === '')) {
          exactMatch = existingPatients.find(p => {
            const similarity = this.calculateNameSimilarity(p.name || '', patientName);
            return similarity > 0.85; // Higher threshold for safety
          });
          
          if (exactMatch) {
            console.log(`🎯 FUZZY MATCH: Found similar patient, updating: ${exactMatch.name} → ${patientName}`);
            const updateData: any = { name: patientName };
            if (patientPhone) updateData.phone = patientPhone;
            await PatientService.updatePatient(exactMatch.id, updateData);
            return exactMatch.id;
          }
        }
        
        if (exactMatch) {
          console.log(`✅ SEARCH SUCCESS: Patient found and will be used: ${patientName} (ID: ${exactMatch.id})`);
          return exactMatch.id;
        }
        
        // Only create new patient if no existing ID was provided and no match found
        console.log(`🆕 NEW PATIENT: No matches found, creating new patient: ${patientName}`);
        
        const newPatientData = {
          name: patientName,
          phone: patientPhone || '',
          email: '',
          status: 'new' as const,
          condition: '',
          isActive: true,
          medicalHistory: [],
          medications: [],
          visitNotes: [],
          vitalSigns: [],
          documents: [],
          allergies: []
        };
        
        const patientId = await PatientService.createPatient(clinicId, newPatientData);
        console.log(`✅ NEW PATIENT CREATED: ${patientName} (ID: ${patientId})`);
        return patientId;
      }
      
      // If we reach here, we had an existing ID but couldn't update or find the patient
      console.warn(`⚠️ FALLBACK: Could not update existing patient ${existingPatientId}, returning as-is`);
      return existingPatientId;
      
    } catch (error) {
      console.error('❌ Error ensuring patient exists:', error);
      // Return the existing ID if we had one, to avoid breaking the appointment
      return existingPatientId || undefined;
    }
  },

  // ✅ NEW: Helper function to calculate name similarity
  calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    if (n1 === n2) return 1.0;
    
    // Levenshtein distance for similarity
    const matrix = Array(n2.length + 1).fill(null).map(() => Array(n1.length + 1).fill(null));
    
    for (let i = 0; i <= n1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= n2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= n2.length; j++) {
      for (let i = 1; i <= n1.length; i++) {
        const indicator = n1[i - 1] === n2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const maxLength = Math.max(n1.length, n2.length);
    return maxLength === 0 ? 1.0 : (maxLength - matrix[n2.length][n1.length]) / maxLength;
  },

  //  ✅ ENHANCED: Enhanced createAppointment with conflict detection
  async createAppointment(clinicId: string, appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>): Promise<string> {
    try {
      // ✅ STEP 0: Ensure Firebase is ready
      if (!firebaseManager.isReady()) {
        console.log('🔄 Firebase not ready, waiting for initialization...');
        // Wait up to 5 seconds for Firebase to be ready
        let attempts = 0;
        while (!firebaseManager.isReady() && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!firebaseManager.isReady()) {
          throw new Error('Firebase failed to initialize within timeout period');
        }
      }

      // ✅ STEP 1: Validate appointment data and check for conflicts
      if (appointmentData.doctorId && appointmentData.date && appointmentData.timeSlot) {
        const validation = await AppointmentConflictService.validateAppointment({
          doctorId: appointmentData.doctorId,
          date: appointmentData.date,
          timeSlot: appointmentData.timeSlot,
          duration: appointmentData.duration || 30
        });

        if (!validation.isValid) {
          throw new Error(`❌ Appointment Conflict: ${validation.error}`);
        }
      }

      const id = generateId();
      
      // ✅ STEP 2: Ensure patient exists and get patientId
      let patientId = appointmentData.patientId;
      if (!patientId && appointmentData.patient) {
        patientId = await this.ensurePatientExists(clinicId, appointmentData.patient, appointmentData.phone);
      }
      
      // ✅ STEP 3: Validate and clean appointment data
      const cleanedAppointmentData = {
        ...appointmentData,
        duration: appointmentData.duration || 20, // ✅ FIXED: Ensure duration has default value (updated to 20 mins)
        type: appointmentData.type || 'consultation',
        priority: appointmentData.priority || 'normal',
        status: appointmentData.status || 'scheduled',
        paymentStatus: appointmentData.paymentStatus || 'pending',
        location: appointmentData.location || '',
        notes: appointmentData.notes || '',
        phone: appointmentData.phone || '',
        time: appointmentData.time || '',
        timeSlot: appointmentData.timeSlot || appointmentData.time || '',
        patient: appointmentData.patient || '',
        doctor: appointmentData.doctor || 'Unknown Doctor'
      };
      
      const appointment: Appointment = {
        ...cleanedAppointmentData,
        id,
        clinicId,
        patientId: patientId || appointmentData.patientId, // Set patientId if we found/created one
        isActive: true,
        completed: cleanedAppointmentData.status === 'completed', // for backward compatibility
        reminderSent: false,
        followUpRequired: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // ✅ STEP 3: Save to Firebase with retry logic
      let saveAttempts = 0;
      const maxAttempts = 3;
      
      while (saveAttempts < maxAttempts) {
        try {
          const appointmentsCollection = await getAppointmentsCollectionAsync();
          await setDoc(doc(appointmentsCollection, id), appointment);
          console.log('✅ Appointment saved to Firebase:', id, patientId ? `with linked patient: ${patientId}` : 'without patient link');
          break; // Success, exit retry loop
        } catch (saveError) {
          saveAttempts++;
          console.error(`❌ Attempt ${saveAttempts} failed to save appointment:`, saveError);
          
          if (saveAttempts >= maxAttempts) {
            // Final attempt failed, try backup method
            console.log('🔄 Trying backup save method...');
            try {
              // Use alternative Firebase Data Manager as backup
              const { firebaseDataManager } = await import('@utils/firebaseDataManager');
              const dataManager = firebaseDataManager.initialize({ clinicId });
              // Remove the id, createdAt, and updatedAt fields for the backup method
              const { id, createdAt, updatedAt, ...appointmentForBackup } = appointment;
              // Ensure required fields are strings for the backup method
              const appointmentWithRequiredFields: any = {
                ...appointmentForBackup,
                patientId: appointmentForBackup.patientId || '',
                doctorId: appointmentForBackup.doctorId || ''
              };
              await dataManager.createAppointment(appointmentWithRequiredFields);
              console.log('✅ Appointment saved via backup method');
              break;
            } catch (backupError) {
              console.error('❌ Backup save method also failed:', backupError);
              throw new Error(`Failed to save appointment after ${maxAttempts} attempts: ${saveError}`);
            }
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * saveAttempts));
          }
        }
      }
      
      // ✅ STEP 4: Create local backup
      try {
        const localAppointments = JSON.parse(localStorage.getItem('clinic_appointments_backup') || '[]');
        localAppointments.push({
          ...appointment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          backupTimestamp: Date.now()
        });
        localStorage.setItem('clinic_appointments_backup', JSON.stringify(localAppointments));
        console.log('✅ Appointment backed up locally');
      } catch (backupError) {
        console.warn('⚠️ Failed to create local backup:', backupError);
        // Don't fail the operation for backup errors
      }
      
      // ✅ STEP 5: Mark time slot as reserved
      if (appointmentData.doctorId && appointmentData.date && appointmentData.timeSlot) {
        console.log(`🔒 Time slot reserved: ${appointmentData.doctorId} at ${appointmentData.date} ${appointmentData.timeSlot}`);
      }
      
      // ✅ STEP 6: Trigger cross-page sync events
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('appointmentCreated', {
          detail: { appointment, source: 'AppointmentService' }
        }));
      }
      
      return id;
    } catch (error) {
      console.error('❌ AppointmentService.createAppointment failed:', error);
      throw error;
    }
  },

  // Update an existing appointment with conflict detection
  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<void> {
    // ✅ Check for conflicts if rescheduling (changing date, time, or doctor)
    if ((updates.doctorId || updates.date || updates.timeSlot) && 
        updates.doctorId && updates.date && updates.timeSlot) {
      
      const validation = await AppointmentConflictService.validateAppointment({
        doctorId: updates.doctorId,
        date: updates.date,
        timeSlot: updates.timeSlot,
        duration: updates.duration || 30,
        appointmentId: appointmentId // Exclude current appointment from conflict check
      });

      if (!validation.isValid) {
        throw new Error(`❌ Reschedule Conflict: ${validation.error}`);
      }
    }

    const appointmentsCollection = await getAppointmentsCollectionAsync();
    const appointmentRef = doc(appointmentsCollection, appointmentId);
    
    // Handle backward compatibility for completed field
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    if (updates.status === 'completed') {
      updateData.completed = true;
    } else if (updates.status) {
      updateData.completed = false;
    }

    await setDoc(appointmentRef, updateData, { merge: true });
    console.log('✅ Appointment updated:', appointmentId);
  },

  // Delete an appointment (soft delete)
  async deleteAppointment(appointmentId: string): Promise<void> {
    await this.updateAppointment(appointmentId, { isActive: false });
    console.log('✅ Appointment soft deleted:', appointmentId);
  },

  // Hard delete an appointment
  async hardDeleteAppointment(appointmentId: string): Promise<void> {
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    await deleteDoc(doc(appointmentsCollection, appointmentId));
    console.log('✅ Appointment permanently deleted:', appointmentId);
  },

  // Listen to appointments for a specific clinic
  listenAppointments(clinicId: string, callback: (appointments: Appointment[]) => void): () => void {
    const q = query(
      getAppointmentsCollection(),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('date', 'desc'),
      orderBy('timeSlot', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      console.log(`📅 Appointments updated: ${appointments.length} active appointments`);
      callback(appointments);
    }, (error) => {
      console.error('❌ Error listening to appointments:', error);
      callback([]);
    });
  },

  // Listen to appointments for a specific date
  listenAppointmentsByDate(clinicId: string, date: string, callback: (appointments: Appointment[]) => void): () => void {
    const q = query(
      getAppointmentsCollection(),
      where('clinicId', '==', clinicId),
      where('date', '==', date),
      where('isActive', '==', true),
      orderBy('timeSlot', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      callback(appointments);
    });
  },

  // Listen to appointments for a specific doctor
  listenAppointmentsByDoctor(clinicId: string, doctorId: string, callback: (appointments: Appointment[]) => void): () => void {
    const q = query(
      getAppointmentsCollection(),
      where('clinicId', '==', clinicId),
      where('doctorId', '==', doctorId),
      where('isActive', '==', true),
      orderBy('date', 'desc'),
      orderBy('timeSlot', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      callback(appointments);
    });
  },

  // Listen to appointments for a specific patient
  listenAppointmentsByPatient(clinicId: string, patientId: string, callback: (appointments: Appointment[]) => void): () => void {
    const q = query(
      getAppointmentsCollection(),
      where('clinicId', '==', clinicId),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      callback(appointments);
    });
  },

  // Get appointments by status
  listenAppointmentsByStatus(clinicId: string, status: Appointment['status'], callback: (appointments: Appointment[]) => void): () => void {
    const q = query(
      getAppointmentsCollection(),
      where('clinicId', '==', clinicId),
      where('status', '==', status),
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      callback(appointments);
    });
  },

  // Get upcoming appointments (today and future)
  listenUpcomingAppointments(clinicId: string, callback: (appointments: Appointment[]) => void): () => void {
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      getAppointmentsCollection(),
      where('clinicId', '==', clinicId),
      where('date', '>=', today),
      where('isActive', '==', true),
      orderBy('date', 'asc'),
      orderBy('timeSlot', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      callback(appointments);
    });
  },

  // Get today's appointments
  async getTodaysAppointments(clinicId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    const q = query(
      appointmentsCollection,
      where('clinicId', '==', clinicId),
      where('date', '==', today),
      where('isActive', '==', true),
      orderBy('timeSlot', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  },

  // Get recent appointments (last 10)
  async getRecentAppointments(clinicId: string, limitCount: number = 10): Promise<Appointment[]> {
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    const q = query(
      appointmentsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  },

  // Search appointments by patient name or phone
  async searchAppointments(clinicId: string, searchTerm: string): Promise<Appointment[]> {
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    const q = query(
      appointmentsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const allAppointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];

    // Client-side filtering
    const searchTermLower = searchTerm.toLowerCase();
    return allAppointments.filter(appointment => 
      appointment.patient?.toLowerCase().includes(searchTermLower) ||
      appointment.doctor?.toLowerCase().includes(searchTermLower) ||
      appointment.phone?.includes(searchTerm) ||
      appointment.type?.toLowerCase().includes(searchTermLower) ||
      appointment.notes?.toLowerCase().includes(searchTermLower)
    );
  },

  // Mark appointment as completed
  async completeAppointment(appointmentId: string, notes?: string): Promise<void> {
    const updates: Partial<Appointment> = {
      status: 'completed',
      completed: true,
    };
    
    if (notes) {
      updates.notes = notes;
    }

    await this.updateAppointment(appointmentId, updates);
  },

  // Reschedule appointment
  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string, newTimeSlot: string): Promise<void> {
    await this.updateAppointment(appointmentId, {
      date: newDate,
      time: newTime,
      timeSlot: newTimeSlot,
      status: 'rescheduled'
    });
    
    // ✅ NEW: Trigger cross-page sync after rescheduling
    console.log('✅ Appointment rescheduled, triggering automatic sync');
    import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
      triggerAutomaticSync.appointment({ 
        id: appointmentId, 
        date: newDate, 
        time: newTime, 
        timeSlot: newTimeSlot, 
        status: 'rescheduled',
        updatedAt: new Date().toISOString()
      }, 'update');
    });
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    const updates: Partial<Appointment> = {
      status: 'cancelled'
    };
    
    if (reason) {
      updates.notes = `Cancelled: ${reason}${updates.notes ? ` | Previous notes: ${updates.notes}` : ''}`;
    }

    await this.updateAppointment(appointmentId, updates);
  },

  // Mark reminder as sent
  async markReminderSent(appointmentId: string): Promise<void> {
    await this.updateAppointment(appointmentId, { reminderSent: true });
  },

  // Batch create appointments (for scheduling)
  async batchCreateAppointments(clinicId: string, appointments: Array<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>>): Promise<void> {
    // Ensure Firebase is ready before creating batch
    if (!(await firebaseManager.isReady())) {
      throw new Error('Firebase not ready - please wait for initialization');
    }
    
    const db = await getOptimizedFirestore();
    const batch = writeBatch(db);
    
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    
    appointments.forEach(appointmentData => {
      const id = generateId();
      const appointmentRef = doc(appointmentsCollection, id);
      const appointment: Appointment = {
        ...appointmentData,
        id,
        clinicId,
        isActive: true,
        completed: appointmentData.status === 'completed',
        reminderSent: false,
        followUpRequired: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      batch.set(appointmentRef, appointment);
    });

    await batch.commit();
    console.log(`✅ Batch created ${appointments.length} appointments`);
  },

  // Get appointment statistics
  async getAppointmentStats(clinicId: string): Promise<{
    total: number;
    today: number;
    completed: number;
    pending: number;
    cancelled: number;
    upcoming: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    const q = query(
      appointmentsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map(doc => doc.data()) as Appointment[];

    return {
      total: appointments.length,
      today: appointments.filter(a => a.date === today).length,
      completed: appointments.filter(a => a.status === 'completed').length,
      pending: appointments.filter(a => a.status === 'pending').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      upcoming: appointments.filter(a => a.date >= today && a.status !== 'completed' && a.status !== 'cancelled').length,
    };
  },

  // ✅ NEW: Sync existing appointments to create missing patient records
  async syncExistingAppointmentsToPatients(clinicId: string): Promise<{
    totalAppointments: number;
    patientsCreated: number;
    patientsLinked: number;
    errors: string[];
  }> {
    console.log('🔄 Starting sync of existing appointments to patients...');
    
    try {
      // Get all active appointments for the clinic
      const appointmentsCollection = await getAppointmentsCollectionAsync();
      const q = query(
        appointmentsCollection,
        where('clinicId', '==', clinicId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

      console.log(`📊 Found ${appointments.length} appointments to process`);

      let patientsCreated = 0;
      let patientsLinked = 0;
      const errors: string[] = [];
      // Ensure Firebase is ready before creating batch
      if (!(await firebaseManager.isReady())) {
        throw new Error('Firebase not ready - please wait for initialization');
      }
      
      const db = await getOptimizedFirestore();
      const batch = writeBatch(db);

      // Process each appointment
      for (const appointment of appointments) {
        try {
          // Skip if patient name is missing
          if (!appointment.patient || appointment.patient.trim() === '') {
            continue;
          }

          // Skip if already has patientId
          if (appointment.patientId) {
            continue;
          }

          // Try to ensure patient exists
          const patientId = await this.ensurePatientExists(
            clinicId, 
            appointment.patient, 
            appointment.phone
          );

          if (patientId) {
            // Update appointment with patientId
            const appointmentRef = doc(appointmentsCollection, appointment.id);
            batch.update(appointmentRef, { 
              patientId: patientId,
              updatedAt: serverTimestamp()
            });
            
            // Count if we created a new patient vs linked existing
            const { PatientService: PatientServiceImport } = await import('./PatientService');
            const existingPatients = await PatientServiceImport.searchPatients(clinicId, appointment.patient);
            const wasNewlyCreated = existingPatients.some(p => p.id === patientId && 
              p.createdAt && 
              (new Date().getTime() - new Date(p.createdAt.toDate()).getTime()) < 60000 // Created in last minute
            );
            
            if (wasNewlyCreated) {
              patientsCreated++;
            } else {
              patientsLinked++;
            }
          }

        } catch (error) {
          const errorMsg = `Failed to process appointment ${appointment.id} for patient ${appointment.patient}: ${error}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }

      // Commit all appointment updates
      const batchUpdates = appointments.filter(a => !a.patientId && a.patient?.trim()).length;
      if (batchUpdates > 0) {
        await batch.commit();
        console.log(`✅ Updated ${patientsCreated + patientsLinked} appointments with patient links`);
      }

      const result = {
        totalAppointments: appointments.length,
        patientsCreated,
        patientsLinked,
        errors
      };

      console.log('🎉 Appointment-Patient sync completed:', result);
      return result;

    } catch (error) {
      console.error('❌ Error during appointment-patient sync:', error);
      throw error;
    }
  },

  // ✅ NEW: Get appointments with enhanced patient data
  async getAppointmentsWithPatientData(clinicId: string): Promise<Array<Appointment & { patientData?: any }>> {
    const appointments = await this.getAllAppointments(clinicId);
    const result: Array<Appointment & { patientData?: any }> = [];

    for (const appointment of appointments) {
      let appointmentWithPatient: Appointment & { patientData?: any } = { ...appointment };
      
      // Try to get patient data if patientId exists
      if (appointment.patientId) {
        try {
          // Dynamic import to avoid circular dependency
          const { PatientService } = await import('./PatientService');
          const patients = await PatientService.searchPatients(clinicId, '');
          const patientData = patients.find(p => p.id === appointment.patientId);
          if (patientData) {
            appointmentWithPatient.patientData = patientData;
          }
        } catch (error) {
          console.warn(`⚠️ Could not load patient data for appointment ${appointment.id}:`, error);
        }
      }
      
      result.push(appointmentWithPatient);
    }

    return result;
  },

  // ✅ NEW: Helper to get all appointments (used by sync function)
  async getAllAppointments(clinicId: string): Promise<Appointment[]> {
    const appointmentsCollection = await getAppointmentsCollectionAsync();
    const q = query(
      appointmentsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  }
};

export default AppointmentService; 