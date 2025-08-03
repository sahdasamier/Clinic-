import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from './firebaseOptimized';

// Helper to get safe database reference
const getDb = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  return getOptimizedFirestore();
};

export interface Appointment {
  id?: string;
  clinicId: string; // ✅ FIXED: Added missing clinicId field
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
  status: 'confirmed' | 'pending' | 'cancelled' | 'rescheduled' | 'no-show' | 'completed' | 'scheduled';
  location: string;
  priority: 'normal' | 'high' | 'urgent';
  paymentStatus: 'pending' | 'completed' | 'partial' | 'failed' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  isAvailableSlot?: boolean;
  completed?: boolean;
  reminderSent?: boolean;
  followUpRequired?: boolean;
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
  paymentStatus?: 'pending' | 'completed' | 'partial' | 'failed' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  clinicId?: string; // ✅ ADDED: clinicId parameter
}

const APPOINTMENTS_COLLECTION = 'appointments';

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

// Create a new appointment
export const createAppointment = async (appointmentData: AppointmentFormData): Promise<Appointment> => {
  try {
    // ✅ FIXED: Require clinicId parameter
    if (!appointmentData.clinicId) {
      throw new Error('clinicId is required for appointment creation');
    }

    // ✅ Ensure Firebase is ready
    if (!firebaseManager.isReady()) {
      console.log('🔄 Firebase not ready for appointment creation, waiting...');
      let attempts = 0;
      while (!firebaseManager.isReady() && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase failed to initialize for appointment creation');
      }
    }

    const appointmentId = generateId();
    const appointment: Omit<Appointment, 'id'> = {
      clinicId: appointmentData.clinicId, // ✅ FIXED: Include clinicId
      patientId: generatePatientId(appointmentData.patientName),
      patientName: appointmentData.patientName || '',
      patientPhone: appointmentData.patientPhone || '',
      doctorId: generateDoctorId(appointmentData.doctorName),
      doctorName: appointmentData.doctorName || '',
      date: appointmentData.date || new Date().toISOString().split('T')[0],
      time: appointmentData.time || '09:00',
      timeSlot: convertTimeToSlot(appointmentData.time) || appointmentData.time || '09:00',
      duration: appointmentData.duration || 20, // ✅ FIXED: Ensure duration has default value (updated to 20 mins)
      type: appointmentData.type || 'consultation',
      status: 'scheduled',  // ✅ Changed from 'pending' to 'scheduled'
      location: appointmentData.location || '',
      priority: appointmentData.priority || 'normal',
      paymentStatus: appointmentData.paymentStatus || 'pending',
      notes: appointmentData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isAvailableSlot: false,  // ✅ FIXED: Explicitly mark as reserved appointment
      isActive: true,  // ✅ Added: Mark as active
      completed: false,
      reminderSent: false,
      followUpRequired: false
    } as any;

    // ✅ Save to Firebase with retry logic
    let docRef;
    let saveAttempts = 0;
    const maxAttempts = 3;
    
    while (saveAttempts < maxAttempts) {
      try {
        docRef = await addDoc(collection(getDb(), APPOINTMENTS_COLLECTION), {
          ...appointment,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Appointment created in Firebase via API:', docRef.id, 'clinicId:', appointmentData.clinicId);
        break; // Success, exit retry loop
      } catch (saveError) {
        saveAttempts++;
        console.error(`❌ API Appointment save attempt ${saveAttempts} failed:`, saveError);
        
        if (saveAttempts >= maxAttempts) {
          throw new Error(`Failed to save appointment via API after ${maxAttempts} attempts: ${saveError}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * saveAttempts));
      }
    }

    if (!docRef) {
      throw new Error('Failed to get document reference after successful save');
    }

    const savedAppointment = { ...appointment, id: docRef.id };

    // ✅ ENHANCED: Create corresponding payment record
    try {
      console.log('💰 Creating payment record for appointment...');
      
      // Import payment utilities
      const { getAppointmentPaymentAmount, createPayment } = await import('../utils/paymentUtils');
      const appointmentAmount = getAppointmentPaymentAmount(appointmentData.type);
      
      const paymentData = {
        clinicId: appointmentData.clinicId,
        patient: appointmentData.patientName,
        patientAvatar: appointmentData.patientName.split(' ').map(n => n[0]).join('').toUpperCase() || 'P',
        doctor: appointmentData.doctorName,
        appointmentId: docRef.id,
        amount: appointmentAmount,
        currency: 'EGP',
        status: savedAppointment.paymentStatus === 'paid' ? 'paid' : 'pending',
        date: new Date().toISOString().split('T')[0],
        dueDate: appointmentData.date,
        method: 'cash',
        description: `Payment for ${appointmentData.type} appointment`,
        category: 'consultation',
        invoiceId: `INV-${Date.now()}-${docRef.id.slice(-6)}`,
        paidAmount: savedAppointment.paymentStatus === 'paid' ? appointmentAmount : 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: appointmentAmount,
        baseAmount: appointmentAmount,
        insurance: 'No' as const,
        insuranceAmount: 0,
        isActive: true
      };

      const paymentRecord = createPayment(paymentData);
      console.log('✅ Payment record created:', paymentRecord.invoiceId);
      
      // Also save to Firebase Data Manager for consistency
      try {
        const { firebaseDataManager } = await import('../utils/firebaseDataManager');
        const dataManager = firebaseDataManager.initialize({ clinicId: appointmentData.clinicId });
        await dataManager.createPayment(paymentData);
        console.log('✅ Payment also saved to Firebase via DataManager');
      } catch (dmError) {
        console.warn('⚠️ Failed to save payment via DataManager (not critical):', dmError);
      }
    } catch (paymentError) {
      console.error('❌ Error creating payment record:', paymentError);
      // Don't fail appointment creation if payment fails
    }

    // ✅ Create local backup
    try {
      const localAppointments = JSON.parse(localStorage.getItem('clinic_appointments_backup') || '[]');
      localAppointments.push({
        ...savedAppointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        backupTimestamp: Date.now(),
        source: 'API'
      });
      localStorage.setItem('clinic_appointments_backup', JSON.stringify(localAppointments));
      console.log('✅ Appointment backed up locally via API');
    } catch (backupError) {
      console.warn('⚠️ Failed to create local backup via API:', backupError);
    }

    // ✅ Trigger cross-page sync events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appointmentCreated', {
        detail: { appointment: savedAppointment, source: 'AppointmentsAPI' }
      }));
    }

    return savedAppointment;
  } catch (error) {
    console.error('❌ API createAppointment failed:', error);
    
    // ✅ Emergency fallback: save to localStorage only
    try {
      const emergencyAppointment = {
        ...appointment,
        id: 'emergency-' + Date.now(),
        clinicId: appointmentData.clinicId || 'unknown-clinic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmergencyBackup: true
      };
      
      const emergencyBackups = JSON.parse(localStorage.getItem('clinic_appointments_emergency') || '[]');
      emergencyBackups.push(emergencyAppointment);
      localStorage.setItem('clinic_appointments_emergency', JSON.stringify(emergencyBackups));
      
      console.log('🚨 Appointment saved as emergency backup only:', emergencyAppointment.id);
      alert('⚠️ Appointment saved locally but failed to sync with server. Please check your internet connection and try refreshing the page.');
      
      return emergencyAppointment as Appointment;
    } catch (emergencyError) {
      console.error('❌ Emergency backup also failed:', emergencyError);
      throw new Error('Failed to create appointment: ' + error.message);
    }
  }
};

// Get all appointments
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(getDb(), APPOINTMENTS_COLLECTION);
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
    const appointmentsRef = collection(getDb(), APPOINTMENTS_COLLECTION);
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
    const appointmentsRef = collection(getDb(), APPOINTMENTS_COLLECTION);
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
    const appointmentRef = doc(getDb(), APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']): Promise<void> => {
  try {
    const appointmentRef = doc(getDb(), APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw new Error('Failed to update appointment status');
  }
};

// Update appointment payment status
export const updateAppointmentPaymentStatus = async (appointmentId: string, paymentStatus: Appointment['paymentStatus']): Promise<void> => {
  try {
    const appointmentRef = doc(getDb(), APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      paymentStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating appointment payment status:', error);
    throw new Error('Failed to update appointment payment status');
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(getDb(), APPOINTMENTS_COLLECTION, appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId: string, reason?: string): Promise<void> => {
  try {
    const appointmentRef = doc(getDb(), APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      updatedAt: serverTimestamp()
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
    const appointmentsRef = collection(getDb(), APPOINTMENTS_COLLECTION);
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