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
  writeBatch
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '../api/firebaseOptimized';

const COLLECTION_NAME = 'payments';

// Safe collection reference that waits for Firebase to be ready
const getPaymentsCollection = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  const db = getOptimizedFirestore();
  return collection(db, COLLECTION_NAME);
};

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

export interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export class PaymentService {
  // Create a new payment
  static async createPayment(clinicId: string, paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>): Promise<string> {
    const id = crypto.randomUUID();
    
    const payment: Payment = {
      ...paymentData,
      id,
      clinicId,
      isActive: true,
      invoiceId: paymentData.invoiceId || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(getPaymentsCollection(), id), payment);
    console.log('✅ Payment created:', id);
    return id;
  }

  // Update an existing payment
  static async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    const paymentRef = doc(getPaymentsCollection(), paymentId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await setDoc(paymentRef, updateData, { merge: true });
    console.log('✅ Payment updated:', paymentId);
    
    // Return the updated payment (in a real app, you might fetch it back)
    return {
      id: paymentId,
      clinicId: '',
      patient: '',
      amount: 0,
      currency: 'USD',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...updates,
    } as Payment;
  }

  // Delete a payment (soft delete)
  static async deletePayment(paymentId: string): Promise<void> {
    await this.updatePayment(paymentId, { isActive: false });
    console.log('✅ Payment soft deleted:', paymentId);
  }

  // Hard delete a payment
  static async hardDeletePayment(paymentId: string): Promise<void> {
    await deleteDoc(doc(getPaymentsCollection(), paymentId));
    console.log('✅ Payment permanently deleted:', paymentId);
  }

  // Listen to payments for a specific clinic
  static listenPayments(clinicId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(
      getPaymentsCollection(),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      
      console.log(`💰 Payments updated: ${payments.length} active payments`);
      callback(payments);
    }, (error) => {
      console.error('❌ Error listening to payments:', error);
      callback([]);
    });
  }

  // Get all payments for a clinic
  static async getPayments(clinicId: string): Promise<Payment[]> {
    const q = query(
      getPaymentsCollection(),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
    
    console.log(`💰 Retrieved ${payments.length} payments for clinic:`, clinicId);
    return payments;
  }

  // Listen to payments by status
  static listenPaymentsByStatus(clinicId: string, status: Payment['status'], callback: (payments: Payment[]) => void): () => void {
    const q = query(
      getPaymentsCollection(),
      where('clinicId', '==', clinicId),
      where('status', '==', status),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      
      callback(payments);
    });
  }

  // Listen to payments for a specific patient
  static listenPaymentsByPatient(clinicId: string, patientId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(
      getPaymentsCollection(),
      where('clinicId', '==', clinicId),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      
      callback(payments);
    });
  }

  // Get payment statistics
  static async getPaymentStats(clinicId: string): Promise<PaymentStats> {
    const payments = await this.getPayments(clinicId);
    
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

    return {
      total,
      paid,
      pending,
      totalAmount,
      paidAmount,
      pendingAmount,
    };
  }

  // Search payments
  static async searchPayments(clinicId: string, searchTerm: string): Promise<Payment[]> {
    const payments = await this.getPayments(clinicId);
    
    const searchTermLower = searchTerm.toLowerCase();
    return payments.filter(payment => 
      payment.patient?.toLowerCase().includes(searchTermLower) ||
      payment.doctor?.toLowerCase().includes(searchTermLower) ||
      payment.invoiceId?.toLowerCase().includes(searchTermLower) ||
      payment.description?.toLowerCase().includes(searchTermLower) ||
      payment.method?.toLowerCase().includes(searchTermLower)
    );
  }

  // Get payments for a specific appointment
  static async getPaymentsByAppointment(clinicId: string, appointmentId: string): Promise<Payment[]> {
    const q = query(
      getPaymentsCollection(),
      where('clinicId', '==', clinicId),
      where('appointmentId', '==', appointmentId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  }

  // Mark payment as paid
  static async markPaymentAsPaid(paymentId: string, paidAmount?: number): Promise<void> {
    const updates: Partial<Payment> = {
      status: 'paid'
    };
    
    if (paidAmount !== undefined) {
      updates.paidAmount = paidAmount;
    }

    await this.updatePayment(paymentId, updates);
  }

  // Batch create payments
  static async batchCreatePayments(clinicId: string, payments: Array<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>>): Promise<void> {
    const batch = writeBatch(getOptimizedFirestore());
    
    payments.forEach(paymentData => {
      const id = crypto.randomUUID();
      const paymentRef = doc(getPaymentsCollection(), id);
      const payment: Payment = {
        ...paymentData,
        id,
        clinicId,
        isActive: true,
        invoiceId: paymentData.invoiceId || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      batch.set(paymentRef, payment);
    });

    await batch.commit();
    console.log(`✅ Batch created ${payments.length} payments`);
  }
} 