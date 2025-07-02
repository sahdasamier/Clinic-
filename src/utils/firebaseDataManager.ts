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
  type Unsubscribe 
} from 'firebase/firestore';
import { db } from '../api/firebase';

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
    
    // Start real-time listeners
    this.startPaymentListener();
    this.startAppointmentListener();
    
    return this;
  }

  // ✅ PAYMENTS - Real-time Firebase management
  public startPaymentListener(): void {
    if (!this.config?.clinicId) return;

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
  public startAppointmentListener(): void {
    if (!this.config?.clinicId) return;

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
      const appointmentsRef = collection(db, this.appointmentsCollection);
      const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        clinicId: this.config.clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Appointment created in Firebase:', docRef.id);
      
      this.triggerGlobalEvent('appointmentCreated', {
        appointmentId: docRef.id,
        appointmentData,
        source: 'firebase-create',
        timestamp: Date.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      throw error;
    }
  }

  public async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<void> {
    try {
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

  // ✅ GETTERS for current data
  public async getPayments(): Promise<Payment[]> {
    if (!this.config?.clinicId) return [];

    try {
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