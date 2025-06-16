import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  timeSlot: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'rescheduled' | 'no-show' | 'completed';
  location: string;
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  duration: number;
  location: string;
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
}

const APPOINTMENTS_COLLECTION = 'appointments';

// Create a new appointment
export const createAppointment = async (appointmentData: AppointmentFormData): Promise<Appointment> => {
  try {
    const appointment: Omit<Appointment, 'id'> = {
      patientId: generatePatientId(appointmentData.patientName),
      patientName: appointmentData.patientName,
      patientPhone: appointmentData.patientPhone,
      doctorId: generateDoctorId(appointmentData.doctorName),
      doctorName: appointmentData.doctorName,
      date: appointmentData.date,
      time: appointmentData.time,
      timeSlot: convertTimeToSlot(appointmentData.time),
      duration: appointmentData.duration,
      type: appointmentData.type,
      status: 'pending',
      location: appointmentData.location,
      priority: appointmentData.priority,
      notes: appointmentData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
      ...appointment,
      createdAt: Timestamp.fromDate(appointment.createdAt),
      updatedAt: Timestamp.fromDate(appointment.updatedAt)
    });

    return { ...appointment, id: docRef.id };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
};

// Get all appointments
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(appointmentsRef, orderBy('date', 'desc'), orderBy('timeSlot', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
};

// Get appointments by date
export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      appointmentsRef, 
      where('date', '==', date),
      orderBy('timeSlot', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    throw new Error('Failed to fetch appointments for the specified date');
  }
};

// Get appointments by doctor
export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      appointmentsRef, 
      where('doctorId', '==', doctorId),
      orderBy('date', 'desc'),
      orderBy('timeSlot', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments by doctor:', error);
    throw new Error('Failed to fetch doctor appointments');
  }
};

// Update appointment
export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']): Promise<void> => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw new Error('Failed to update appointment status');
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId: string, reason?: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw new Error('Failed to cancel appointment');
  }
};

// Get appointment statistics
export const getAppointmentStats = async () => {
  try {
    const appointments = await getAppointments();
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: appointments.length,
      today: appointments.filter(apt => apt.date === today).length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length
    };
  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    throw new Error('Failed to fetch appointment statistics');
  }
};

// Helper functions
const generatePatientId = (patientName: string): string => {
  return `patient_${patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
};

const generateDoctorId = (doctorName: string): string => {
  return `doctor_${doctorName.toLowerCase().replace(/\s+/g, '_')}`;
};

const convertTimeToSlot = (time: string): string => {
  // Convert time format like "3:00 PM" to "15:00"
  const [timePart, period] = time.split(' ');
  const [hours, minutes] = timePart.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// Check if time slot is available
export const isTimeSlotAvailable = async (date: string, timeSlot: string, doctorId?: string): Promise<boolean> => {
  try {
    const appointmentsRef = collection(db, APPOINTMENTS_COLLECTION);
    let q = query(
      appointmentsRef,
      where('date', '==', date),
      where('timeSlot', '==', timeSlot)
    );
    
    if (doctorId) {
      q = query(q, where('doctorId', '==', doctorId));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
}; 