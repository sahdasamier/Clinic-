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
import { db } from '../api/firebase';

const COLLECTION_NAME = 'appointments';
const appointmentsCollection = collection(db, COLLECTION_NAME);

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
  type: string; // consultation, check_up, surgery, etc.
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'normal' | 'high' | 'urgent';
  location?: string; // room number, etc.
  phone?: string;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue';
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
  // ✅ NEW: Helper function to check if patient exists and create if needed
  async ensurePatientExists(clinicId: string, patientName: string, patientPhone?: string): Promise<string | undefined> {
    try {
      // Dynamic import to avoid circular dependency
      const { PatientService } = await import('./PatientService');
      
      // Check if patient already exists by name and phone
      const existingPatients = await PatientService.searchPatients(clinicId, patientName);
      
      // Try to find exact match by name (and phone if provided)
      const exactMatch = existingPatients.find(p => {
        const nameMatch = p.name?.toLowerCase().trim() === patientName.toLowerCase().trim();
        const phoneMatch = !patientPhone || !p.phone || p.phone === patientPhone;
        return nameMatch && phoneMatch;
      });
      
      if (exactMatch) {
        console.log(`✅ Patient already exists: ${exactMatch.name} (ID: ${exactMatch.id})`);
        return exactMatch.id;
      }
      
      // Create new patient if not found
      console.log(`🆕 Creating new patient from appointment: ${patientName}`);
      
      const newPatientData = {
        name: patientName,
        phone: patientPhone || '',
        email: '',
        status: 'new' as const,
        condition: '',
        isActive: true,
        // Set default values for required fields
        medicalHistory: [],
        medications: [],
        visitNotes: [],
        vitalSigns: [],
        documents: [],
        allergies: []
      };
      
      const patientId = await PatientService.createPatient(clinicId, newPatientData);
      console.log(`✅ New patient created: ${patientName} (ID: ${patientId})`);
      
      return patientId;
      
    } catch (error) {
      console.error('❌ Error ensuring patient exists:', error);
      // Don't fail the appointment creation if patient creation fails
      return undefined;
    }
  },

  // ✅ MODIFIED: Enhanced createAppointment to automatically create patients
  async createAppointment(clinicId: string, appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>): Promise<string> {
    const id = crypto.randomUUID();
    
    // ✅ Ensure patient exists and get patientId
    let patientId = appointmentData.patientId;
    if (!patientId && appointmentData.patient) {
      patientId = await this.ensurePatientExists(clinicId, appointmentData.patient, appointmentData.phone);
    }
    
    const appointment: Appointment = {
      ...appointmentData,
      id,
      clinicId,
      patientId: patientId || appointmentData.patientId, // Set patientId if we found/created one
      isActive: true,
      completed: appointmentData.status === 'completed', // for backward compatibility
      reminderSent: false,
      followUpRequired: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(appointmentsCollection, id), appointment);
    console.log('✅ Appointment created:', id, patientId ? `with linked patient: ${patientId}` : 'without patient link');
    return id;
  },

  // Update an existing appointment
  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<void> {
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
    await deleteDoc(doc(appointmentsCollection, appointmentId));
    console.log('✅ Appointment permanently deleted:', appointmentId);
  },

  // Listen to appointments for a specific clinic
  listenAppointments(clinicId: string, callback: (appointments: Appointment[]) => void): () => void {
    const q = query(
      appointmentsCollection,
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
      appointmentsCollection,
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
      appointmentsCollection,
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
      appointmentsCollection,
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
      appointmentsCollection,
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
      appointmentsCollection,
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

  // Search appointments by patient name or phone
  async searchAppointments(clinicId: string, searchTerm: string): Promise<Appointment[]> {
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
    const batch = writeBatch(db);
    
    appointments.forEach(appointmentData => {
      const id = crypto.randomUUID();
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

  // Get recent appointments (last 10)
  async getRecentAppointments(clinicId: string, limitCount: number = 10): Promise<Appointment[]> {
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