import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
  type Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '@lib/firebase/legacy-compat';

// ✅ COMPREHENSIVE FIREBASE DATA MANAGER
// Handles real-time synchronization across all pages

export interface FirebaseDataManagerConfig {
  clinicId: string;
  userId?: string;
}

export interface Payment {
  id: string;
  clinicId: string;
  patientId?: string;
  patient: string;
  doctor?: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue' | 'partial';
  date: string;
  dueDate?: string;
  method: string;
  description?: string;
  category?: string;
  invoiceId?: string;
  paidAmount?: number;
  includeVAT?: boolean;
  vatRate?: number;
  vatAmount?: number;
  totalAmountWithVAT?: number;
  baseAmount?: number;
  insurance?: string;
  insuranceAmount?: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patient: string;
  doctorId: string;
  doctor: string;
  date: string;
  time: string;
  timeSlot: string;
  type: 'consultation' | 'follow-up' | 'surgery' | 'emergency';
  duration: number;
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue';
  location?: string;
  notes?: string;
  phone?: string;
  completed?: boolean;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

class FirebaseDataManager {
  private static instance: FirebaseDataManager;
  private config: FirebaseDataManagerConfig | null = null;
  private listeners: Map<string, Unsubscribe> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();

  // Collections
  private paymentsCollection = 'payments';
  private appointmentsCollection = 'appointments';

  // ✅ Helper method to get Firebase database instance
  private async getDb() {
    if (!firebaseManager.isReady()) {
      console.log('🔄 Firebase not ready, initializing...');
      await firebaseManager.initialize();
    }
    return getOptimizedFirestore();
  }
  private settingsCollection = 'clinicSettings';

  private constructor() {}

  public static getInstance(): FirebaseDataManager {
    if (!FirebaseDataManager.instance) {
      FirebaseDataManager.instance = new FirebaseDataManager();
    }
    return FirebaseDataManager.instance;
  }

  // ✅ Initialize with clinic configuration
  public initialize(config: FirebaseDataManagerConfig) {
    this.config = config;
    console.log('🔥 Firebase Data Manager initialized for clinic:', config.clinicId);
    
    // Start real-time listeners asynchronously
    this.startPaymentListener().catch(console.error);
    this.startAppointmentListener().catch(console.error);
    
    return this;
  }

  // ✅ PAYMENTS - Real-time Firebase management
  public async startPaymentListener(): Promise<void> {
    if (!this.config?.clinicId) return;

    const db = await this.getDb();
    const paymentsRef = collection(db, this.paymentsCollection);
    const q = query(
      paymentsRef, 
      where('clinicId', '==', this.config.clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const payments: Payment[] = [];
      
      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        } as Payment);
      });

      console.log(`🔥 REALTIME: Received ${payments.length} payments from Firebase`);
      
      // Notify all listeners
      this.notifyListeners('payments', payments);
      
      // Trigger cross-page events
      this.triggerGlobalEvent('paymentsUpdated', {
        payments,
        source: 'firebase-realtime',
        timestamp: Date.now()
      });
    }, (error) => {
      console.error('❌ Payment listener error:', error);
    });

    this.listeners.set('payments', unsubscribe);
  }

  public async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.config?.clinicId) throw new Error('Firebase Data Manager not initialized');

    try {
      const db = await this.getDb();
      const paymentsRef = collection(db, this.paymentsCollection);
      const docRef = await addDoc(paymentsRef, {
        ...paymentData,
        clinicId: this.config.clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Payment created in Firebase:', docRef.id);
      
      // Trigger immediate cross-page sync
      this.triggerGlobalEvent('paymentCreated', {
        paymentId: docRef.id,
        paymentData,
        source: 'firebase-create',
        timestamp: Date.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      throw error;
    }
  }

  public async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<void> {
    try {
      const db = await this.getDb();
      const paymentRef = doc(db, this.paymentsCollection, paymentId);
      await updateDoc(paymentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Payment updated in Firebase:', paymentId);
      
      // Trigger immediate cross-page sync
      this.triggerGlobalEvent('paymentUpdated', {
        paymentId,
        updates,
        source: 'firebase-update',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      throw error;
    }
  }

  public async deletePayment(paymentId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const paymentRef = doc(db, this.paymentsCollection, paymentId);
      await updateDoc(paymentRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Payment deleted (soft) in Firebase:', paymentId);
      
      this.triggerGlobalEvent('paymentDeleted', {
        paymentId,
        source: 'firebase-delete',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Error deleting payment:', error);
      throw error;
    }
  }

  // ✅ APPOINTMENTS - Real-time Firebase management
  public async startAppointmentListener(): Promise<void> {
    if (!this.config?.clinicId) return;

    const db = await this.getDb();
    const appointmentsRef = collection(db, this.appointmentsCollection);
    const q = query(
      appointmentsRef, 
      where('clinicId', '==', this.config.clinicId),
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointments: Appointment[] = [];
      
      snapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        } as Appointment);
      });

      console.log(`🔥 REALTIME: Received ${appointments.length} appointments from Firebase`);
      
      // Notify all listeners
      this.notifyListeners('appointments', appointments);
      
      // Trigger cross-page events
      this.triggerGlobalEvent('appointmentsUpdated', {
        appointments,
        source: 'firebase-realtime',
        timestamp: Date.now()
      });
    }, (error) => {
      console.error('❌ Appointment listener error:', error);
    });

    this.listeners.set('appointments', unsubscribe);
  }

  public async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.config?.clinicId) throw new Error('Firebase Data Manager not initialized');

    try {
      const db = await this.getDb();
      const appointmentsRef = collection(db, this.appointmentsCollection);
      
      // ✅ FIX: Validate essential fields before creating appointment
      if (!appointmentData.patient || appointmentData.patient.trim() === '') {
        throw new Error('❌ Cannot create appointment: Patient name is required');
      }
      if (!appointmentData.doctor || appointmentData.doctor.trim() === '') {
        throw new Error('❌ Cannot create appointment: Doctor name is required');
      }
      if (!appointmentData.date || appointmentData.date.trim() === '') {
        throw new Error('❌ Cannot create appointment: Date is required');
      }
      if (!appointmentData.time || appointmentData.time.trim() === '') {
        throw new Error('❌ Cannot create appointment: Time is required');
      }
      
      // ✅ ENHANCED: Validate and clean appointment data to prevent undefined values
      const cleanedData = {
        ...appointmentData,
        duration: appointmentData.duration || 20,
        type: appointmentData.type || 'consultation',
        priority: appointmentData.priority || 'normal',
        status: appointmentData.status || 'scheduled',
        paymentStatus: appointmentData.paymentStatus || 'pending',
        location: appointmentData.location || '',
        notes: appointmentData.notes || '',
        phone: appointmentData.phone || '',
        time: appointmentData.time || '09:00',
        timeSlot: appointmentData.timeSlot || appointmentData.time || '09:00',
        patient: appointmentData.patient.trim(),
        doctor: appointmentData.doctor.trim(),
        date: appointmentData.date.trim()
      };
      
      // Remove any undefined values
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined) {
          console.warn(`⚠️ DataManager: Removing undefined field: ${key}`);
          delete cleanedData[key];
        }
      });
      
      // ✅ Enhanced appointment data with proper defaults
      const enhancedAppointmentData = {
        ...cleanedData,
        clinicId: this.config.clinicId,
        isActive: true,
        completed: cleanedData.status === 'completed' || false,
        reminderSent: false,
        followUpRequired: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // ✅ Save with retry logic
      let docRef;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          docRef = await addDoc(appointmentsRef, enhancedAppointmentData);
          console.log('✅ Appointment created in Firebase via DataManager:', docRef.id);
          break;
        } catch (saveError) {
          attempts++;
          console.error(`❌ DataManager save attempt ${attempts} failed:`, saveError);
          
          if (attempts >= maxAttempts) {
            throw saveError;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      if (!docRef) {
        throw new Error('Failed to create document reference');
      }

      // ✅ Create local backup
      try {
        const localAppointments = JSON.parse(localStorage.getItem('clinic_appointments_backup') || '[]');
        localAppointments.push({
          ...enhancedAppointmentData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          backupTimestamp: Date.now(),
          source: 'FirebaseDataManager'
        });
        localStorage.setItem('clinic_appointments_backup', JSON.stringify(localAppointments));
        console.log('✅ Appointment backed up locally via DataManager');
      } catch (backupError) {
        console.warn('⚠️ Failed to create local backup via DataManager:', backupError);
      }
      
      this.triggerGlobalEvent('appointmentCreated', {
        appointmentId: docRef.id,
        appointmentData: enhancedAppointmentData,
        source: 'firebase-create',
        timestamp: Date.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating appointment in DataManager:', error);
      
      // ✅ Emergency fallback for DataManager
      try {
        const emergencyAppointment = {
          ...appointmentData,
          id: 'emergency-dm-' + Date.now(),
          clinicId: this.config.clinicId,
          isActive: true,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEmergencyBackup: true,
          source: 'DataManager-Emergency'
        };
        
        const emergencyBackups = JSON.parse(localStorage.getItem('clinic_appointments_emergency') || '[]');
        emergencyBackups.push(emergencyAppointment);
        localStorage.setItem('clinic_appointments_emergency', JSON.stringify(emergencyBackups));
        
        console.log('🚨 DataManager: Appointment saved as emergency backup:', emergencyAppointment.id);
        
        // Trigger event even for emergency save
        this.triggerGlobalEvent('appointmentCreated', {
          appointmentId: emergencyAppointment.id,
          appointmentData: emergencyAppointment,
          source: 'firebase-emergency',
          timestamp: Date.now()
        });
        
        return emergencyAppointment.id;
      } catch (emergencyError) {
        console.error('❌ DataManager emergency backup also failed:', emergencyError);
        throw error; // Throw original error
      }
    }
  }

  public async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const db = await this.getDb();
      const appointmentRef = doc(db, this.appointmentsCollection, appointmentId);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Appointment updated in Firebase:', appointmentId);
      
      this.triggerGlobalEvent('appointmentUpdated', {
        appointmentId,
        updates,
        source: 'firebase-update',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      throw error;
    }
  }

  // ✅ SYNC APPOINTMENT AND PAYMENT STATUS
  public async syncAppointmentPaymentStatus(appointmentId: string, paymentStatus: string): Promise<void> {
    try {
      // Update appointment payment status
      await this.updateAppointment(appointmentId, { paymentStatus: paymentStatus as any });
      
      // Find and update related payments
      const db = await this.getDb();
      const paymentsRef = collection(db, this.paymentsCollection);
      const q = query(
        paymentsRef,
        where('appointmentId', '==', appointmentId),
        where('clinicId', '==', this.config!.clinicId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const updatePromises: Promise<void>[] = [];
      
      snapshot.forEach((doc) => {
        const paymentRef = doc.ref;
        updatePromises.push(updateDoc(paymentRef, {
          status: paymentStatus,
          updatedAt: serverTimestamp()
        }));
      });
      
      await Promise.all(updatePromises);
      
      console.log(`✅ Synced appointment ${appointmentId} payment status to ${paymentStatus}`);
      
      this.triggerGlobalEvent('appointmentPaymentSynced', {
        appointmentId,
        paymentStatus,
        source: 'firebase-sync',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Error syncing appointment payment status:', error);
      throw error;
    }
  }

  // ✅ EVENT SYSTEM for cross-page communication
  public addEventListener(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  public removeEventListener(eventType: string, callback: Function): void {
    this.eventListeners.get(eventType)?.delete(callback);
  }

  private notifyListeners(dataType: string, data: any): void {
    const listeners = this.eventListeners.get(dataType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in ${dataType} listener:`, error);
        }
      });
    }
  }

  public triggerGlobalEvent(eventType: string, data: any): void {
    // Browser custom events for immediate cross-page sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    }
    
    // Internal event system
    this.notifyListeners(eventType, data);
  }

  // ✅ CLEANUP
  public cleanup(): void {
    // Unsubscribe from all Firebase listeners
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log(`🧹 Cleaned up ${key} listener`);
    });
    this.listeners.clear();
    
    // Clear event listeners
    this.eventListeners.clear();
    
    console.log('🧹 Firebase Data Manager cleaned up');
  }

  // ✅ NEW: Cleanup utility to remove empty/invalid appointments
  public async cleanupEmptyAppointments(): Promise<{
    totalChecked: number;
    invalidFound: number;
    deleted: number;
    errors: string[];
  }> {
    if (!this.config?.clinicId) throw new Error('Firebase Data Manager not initialized');

    try {
      const db = await this.getDb();
      const appointmentsRef = collection(db, this.appointmentsCollection);
      
      // Get all appointments for this clinic
      const q = query(appointmentsRef, where('clinicId', '==', this.config.clinicId));
      const snapshot = await getDocs(q);
      
      const appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data()
      }));
      
      console.log(`🧹 Checking ${appointments.length} appointments for cleanup...`);
      
      // Find appointments with missing essential data
      const invalidAppointments = appointments.filter(apt => {
        const hasEmptyFields = !apt.patient || apt.patient.trim() === '' ||
                              !apt.doctor || apt.doctor.trim() === '' ||
                              !apt.date || apt.date.trim() === '' ||
                              !apt.time || apt.time.trim() === '';
        return hasEmptyFields;
      });
      
      console.log(`🚫 Found ${invalidAppointments.length} invalid appointments`);
      
      let deleted = 0;
      const errors: string[] = [];
      
      // Delete invalid appointments in batches
      const batch = writeBatch(db);
      
      for (const apt of invalidAppointments) {
        try {
          console.log(`🗑️ Marking for deletion: ID ${apt.id}`, {
            patient: apt.patient || '(empty)',
            doctor: apt.doctor || '(empty)',
            date: apt.date || '(empty)',
            time: apt.time || '(empty)'
          });
          
          batch.delete(apt.ref);
          deleted++;
        } catch (error) {
          const errorMsg = `Failed to delete appointment ${apt.id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
      // Commit the batch deletion
      if (deleted > 0) {
        await batch.commit();
        console.log(`✅ Successfully deleted ${deleted} invalid appointments`);
      }
      
      return {
        totalChecked: appointments.length,
        invalidFound: invalidAppointments.length,
        deleted,
        errors
      };
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }

  // ✅ GETTERS for current data
  public async getPayments(): Promise<Payment[]> {
    if (!this.config?.clinicId) return [];

    try {
      const db = await this.getDb();
      const paymentsRef = collection(db, this.paymentsCollection);
      const q = query(
        paymentsRef,
        where('clinicId', '==', this.config.clinicId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const payments: Payment[] = [];
      
      snapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        } as Payment);
      });
      
      return payments;
    } catch (error) {
      console.error('❌ Error getting payments:', error);
      return [];
    }
  }

  public async getAppointments(): Promise<Appointment[]> {
    if (!this.config?.clinicId) return [];

    try {
      const db = await this.getDb();
      const appointmentsRef = collection(db, this.appointmentsCollection);
      const q = query(
        appointmentsRef,
        where('clinicId', '==', this.config.clinicId),
        where('isActive', '==', true),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      snapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        } as Appointment);
      });
      
      return appointments;
    } catch (error) {
      console.error('❌ Error getting appointments:', error);
      return [];
    }
  }

  // ✅ STATISTICS AND SUMMARY
  public async getPaymentSummary(): Promise<{
    totalPayments: number;
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
    overduePayments: number;
  }> {
    const payments = await this.getPayments();
    
    return {
      totalPayments: payments.length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      paidRevenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      pendingRevenue: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      overduePayments: payments.filter(p => p.status === 'overdue').length
    };
  }

  public async getAppointmentSummary(): Promise<{
    totalAppointments: number;
    todayAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
  }> {
    const appointments = await this.getAppointments();
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalAppointments: appointments.length,
      todayAppointments: appointments.filter(a => a.date === today).length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length
    };
  }
}

// ✅ EXPORT SINGLETON INSTANCE
export const firebaseDataManager = FirebaseDataManager.getInstance();

// ✅ NEW: Export getter for cleanup functions
export const getFirebaseDataManager = (): FirebaseDataManager => {
  return firebaseDataManager;
};

// ✅ CONVENIENCE HOOKS FOR REACT COMPONENTS
export const useFirebaseData = (clinicId: string) => {
  return firebaseDataManager.initialize({ clinicId });
};

// ✅ GLOBAL DEBUG FUNCTIONS
if (typeof window !== 'undefined') {
  (window as any).firebaseDataManager = firebaseDataManager;
  (window as any).testFirebaseSync = () => {
    console.log('🧪 Testing Firebase real-time sync...');
    firebaseDataManager.triggerGlobalEvent('testEvent', {
      message: 'Test cross-page sync working!',
      timestamp: Date.now()
    });
  };
}

export default firebaseDataManager; 