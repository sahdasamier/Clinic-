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
  limit,
  getDoc // Ensure getDoc is imported for fetching single documents
} from 'firebase/firestore';
import { db } from '../api/firebase';
import { PaymentService } from './PaymentService'; // For updating payment status

const COLLECTION_NAME = 'appointments';
const appointmentsCollection = collection(db, COLLECTION_NAME);

export interface Appointment {
  id: string;
  clinicId: string;
  patientId?: string;
  doctorId?: string;
  patient: string; // patientName
  doctor: string; // doctorName
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format 
  timeSlot: string; // HH:MM format for scheduling
  duration: number; // minutes
  type: string; // consultation, check_up, surgery, etc.
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'normal' | 'high' | 'urgent';
  location?: string; // room number, etc.
  phone?: string; // patientPhone
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue'; // This should align with Payment service statuses
  insuranceInfo?: {
    provider: string;
    number: string;
    coverageAmount?: number;
  };
  isAvailableSlot?: boolean; // for scheduling system
  completed?: boolean; // legacy field for backward compatibility, prefer using status
  patientAvatar?: string;
  reminderSent?: boolean;
  followUpRequired?: boolean;
  checkoutTime?: Timestamp; // New field for checkout logic
  isActive: boolean;
  createdAt: Timestamp; // Changed from any to Timestamp
  updatedAt: Timestamp; // Changed from any to Timestamp
}

export const AppointmentService = {
  // Create a new appointment
  async createAppointment(clinicId: string, appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'isActive' | 'checkoutTime' | 'completed' | 'reminderSent' | 'followUpRequired'>): Promise<string> {
    const id = crypto.randomUUID(); // Using crypto for UUID
    const appointment: Appointment = {
      ...appointmentData,
      id,
      clinicId,
      isActive: true,
      completed: appointmentData.status === 'completed',
      reminderSent: false,
      followUpRequired: false,
      createdAt: Timestamp.now(), // Use Timestamp.now()
      updatedAt: Timestamp.now(), // Use Timestamp.now()
    };

    await setDoc(doc(appointmentsCollection, id), appointment);
    console.log('✅ Appointment created:', id);
    return id;
  },

  // Update an existing appointment
  async updateAppointment(appointmentId: string, updates: Partial<Omit<Appointment, 'id'|'clinicId'|'createdAt'>>): Promise<void> {
    const appointmentRef = doc(appointmentsCollection, appointmentId);
    
    const updateData: Partial<Appointment> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.status === 'completed' && !updates.completed) {
      updateData.completed = true; // Ensure legacy 'completed' field is also set
    } else if (updates.status && updates.status !== 'completed' && updates.completed === undefined) {
      updateData.completed = false;
    }


    await setDoc(appointmentRef, updateData, { merge: true });
    console.log('✅ Appointment updated:', appointmentId);
  },

  // Delete an appointment (soft delete)
  async deleteAppointment(appointmentId: string): Promise<void> {
    await this.updateAppointment(appointmentId, { isActive: false, status: 'cancelled' });
    console.log('✅ Appointment soft deleted:', appointmentId);
  },

  // Hard delete an appointment
  async hardDeleteAppointment(appointmentId: string): Promise<void> {
    await deleteDoc(doc(appointmentsCollection, appointmentId));
    console.log('✅ Appointment permanently deleted:', appointmentId);
  },

  // Get a single appointment by ID
  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
    const docSnap = await getDoc(appointmentRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }
    return null;
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
      
      console.log(`📅 Appointments updated for clinic ${clinicId}: ${appointments.length} active appointments`);
      callback(appointments);
    }, (error) => {
      console.error(`❌ Error listening to appointments for clinic ${clinicId}:`, error);
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
      // Note: Firestore does not support case-insensitive or partial text search on its own.
      // For more advanced search, consider a third-party service like Algolia.
      // This will fetch all and filter client-side, which is not efficient for large datasets.
    );

    const snapshot = await getDocs(q);
    const allAppointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];

    const searchTermLower = searchTerm.toLowerCase();
    return allAppointments.filter(appointment => 
      appointment.patient?.toLowerCase().includes(searchTermLower) ||
      appointment.doctor?.toLowerCase().includes(searchTermLower) ||
      appointment.phone?.includes(searchTerm) || // Phone might not need lowercasing
      appointment.type?.toLowerCase().includes(searchTermLower) ||
      appointment.notes?.toLowerCase().includes(searchTermLower)
    );
  },

  // Checkout an appointment: Mark as completed and update payment status to paid
  async checkoutAppointment(clinicId: string, appointmentId: string, paymentIdToUpdate?: string): Promise<void> {
    const appointmentUpdates: Partial<Omit<Appointment, 'id'|'clinicId'|'createdAt'>> = {
      status: 'completed',
      completed: true, // for legacy compatibility
      checkoutTime: Timestamp.now(),
      paymentStatus: 'paid', // Update paymentStatus on appointment as well
    };
    await this.updateAppointment(appointmentId, appointmentUpdates);
    console.log(`✅ Appointment ${appointmentId} checked out.`);

    // Attempt to find and update the corresponding payment
    let paymentId = paymentIdToUpdate;
    if (!paymentId) {
        // Try to find payment by appointmentId if not directly provided
        const paymentQuery = query(
            collection(db, 'payments'),
            where('clinicId', '==', clinicId),
            where('appointmentId', '==', appointmentId),
            where('isActive', '==', true),
            limit(1)
        );
        const paymentSnapshot = await getDocs(paymentQuery);
        if (!paymentSnapshot.empty) {
            paymentId = paymentSnapshot.docs[0].id;
            const paymentData = paymentSnapshot.docs[0].data();
            // Update payment to 'paid' and set amountPaid to totalAmount if not already set
            await PaymentService.updatePayment(paymentId, {
                status: 'paid',
                amountPaid: paymentData.totalAmount, // Assume full payment on checkout
                paymentDate: new Date().toISOString().split('T')[0]
            });
            console.log(`✅ Payment ${paymentId} for appointment ${appointmentId} marked as paid.`);
        } else {
            console.warn(`⚠️ No active payment found for appointment ${appointmentId} to mark as paid during checkout.`);
        }
    } else {
        // If paymentId was provided, fetch it to get totalAmount before updating
        const paymentDoc = await PaymentService.getPaymentById(paymentId);
        if (paymentDoc) {
            await PaymentService.updatePayment(paymentId, {
                status: 'paid',
                amountPaid: paymentDoc.totalAmount,
                paymentDate: new Date().toISOString().split('T')[0]
            });
            console.log(`✅ Payment ${paymentId} (provided) for appointment ${appointmentId} marked as paid.`);
        } else {
            console.warn(`⚠️ Provided paymentId ${paymentId} not found for appointment ${appointmentId}.`);
        }
    }
  },

  // Mark appointment as completed
  async completeAppointment(appointmentId: string, notes?: string): Promise<void> {
    const updates: Partial<Omit<Appointment, 'id'|'clinicId'|'createdAt'>> = {
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
    const currentAppointment = await this.getAppointmentById(appointmentId);
    const updates: Partial<Omit<Appointment, 'id'|'clinicId'|'createdAt'>> = {
      status: 'cancelled'
    };
    if (reason) {
      updates.notes = `Cancelled: ${reason}${currentAppointment?.notes ? ` | Previous notes: ${currentAppointment.notes}` : ''}`;
    }
    await this.updateAppointment(appointmentId, updates);
  },

  // Mark reminder as sent
  async markReminderSent(appointmentId: string): Promise<void> {
    await this.updateAppointment(appointmentId, { reminderSent: true });
  },

  // Batch create appointments (for scheduling)
  async batchCreateAppointments(clinicId: string, appointmentsData: Array<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'isActive' | 'checkoutTime' | 'completed' | 'reminderSent' | 'followUpRequired'>>): Promise<void> {
    const batch = writeBatch(db);
    
    appointmentsData.forEach(appointmentData => {
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      batch.set(appointmentRef, appointment);
    });

    await batch.commit();
    console.log(`✅ Batch created ${appointmentsData.length} appointments`);
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
      pending: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length, // Include confirmed in pending for stats
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      upcoming: appointments.filter(a => a.date >= today && (a.status === 'pending' || a.status === 'confirmed' || a.status === 'rescheduled')).length,
    };
  },

  // Get recent appointments (last 10)
  async getRecentAppointments(clinicId: string, limitCount: number = 10): Promise<Appointment[]> {
    const q = query(
      appointmentsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'), // Order by creation time
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  }
};

export default AppointmentService; 