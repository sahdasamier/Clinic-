import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
  WriteBatch,
  writeBatch,
  limit,
  DocumentData,
  getDoc, // Import getDoc for fetching a single document
} from 'firebase/firestore';
import { db } from '../api/firebase'; // Assuming db is exported from firebase api

const COLLECTION_NAME = 'payments';
const paymentsCollection = collection(db, COLLECTION_NAME);

export interface Payment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName?: string; // For easier display, denormalized
  appointmentId?: string; // Link to appointment if applicable
  invoiceId?: string; // Human-readable invoice number

  serviceName: string; // e.g., "General Consultation", "X-Ray"
  serviceDate: string; // YYYY-MM-DD, typically same as appointment or service delivery

  baseAmount: number; // Cost of service before VAT
  vatRateApplied?: number; // VAT rate percentage (e.g., 14 for 14%)
  vatAmountCalculated?: number; // Calculated VAT amount based on rate and baseAmount
  totalAmount: number; // Total amount due (baseAmount + vatAmountCalculated)
  amountPaid: number; // Amount actually paid by patient/insurance

  currency: string; // e.g., "EGP", "USD"
  status: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'refunded' | 'cancelled' | 'overdue';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'insurance' | 'other';
  paymentDate?: string; // YYYY-MM-DD, when the payment was made/processed
  transactionId?: string; // For card or bank transfers

  notes?: string;

  createdBy?: string; // User ID of who created the payment record
  updatedBy?: string; // User ID of who last updated it

  isActive: boolean; // For soft deletes
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

import { ClinicConfigService } from './ClinicConfigService'; // Import the service

export const PaymentService = {
  // Create a new payment
  async createPayment(
    clinicId: string,
    // Updated input type to include baseAmount and appointmentType for fee/VAT calculation
    paymentInputData: Omit<Payment, 'id' | 'clinicId' | 'isActive' | 'createdAt' | 'updatedAt' | 'totalAmount' | 'vatRateApplied' | 'vatAmountCalculated'> & {
      patientId: string;
      serviceName: string; // This could be the appointmentType or a more general service name
      serviceDate: string;
      baseAmount: number;
      amountPaid: number; // Initial amount paid (could be 0 for pending)
      currency: string;
      status: Payment['status'];
      appointmentType?: string; // Optional: if the serviceName isn't the exact appointmentType for fee lookup
    }
  ): Promise<string> {
    if (!clinicId) {
      console.error("PaymentService: Clinic ID is required to create a payment.");
      throw new Error("Clinic ID is required.");
    }

    const newDocRef = doc(paymentsCollection); // Auto-generate ID
    
    let finalTotalAmount = paymentInputData.baseAmount;
    let vatRateApplied: number | undefined = undefined;
    let vatAmountCalculated: number | undefined = undefined;
    let serviceIncludesVAT = false;

    // Fetch clinic configuration for VAT settings and potentially default currency/method
    const clinicConfig = await ClinicConfigService.getClinicConfig(clinicId);
    const activeVatSettings = clinicConfig?.vatSettings;

    // Determine if VAT should be applied for this specific service/appointment type
    const typeForFeeLookup = paymentInputData.appointmentType || paymentInputData.serviceName;
    const serviceFeeSettings = await ClinicConfigService.getServiceFee(clinicId, typeForFeeLookup);

    if (serviceFeeSettings) {
      serviceIncludesVAT = serviceFeeSettings.includeVAT;
    } else {
      // Fallback: If no specific serviceFeeSetting, use clinic's default VAT inclusion policy
      serviceIncludesVAT = clinicConfig?.paymentSettings?.includeVATByDefault || false;
      console.warn(`PaymentService: No specific service fee setting for "${typeForFeeLookup}". Using clinic default VAT inclusion: ${serviceIncludesVAT}`);
    }
    
    if (serviceIncludesVAT && activeVatSettings?.enabled && activeVatSettings.rate > 0) {
      vatRateApplied = activeVatSettings.rate;
      vatAmountCalculated = (paymentInputData.baseAmount * vatRateApplied) / 100;
      finalTotalAmount = paymentInputData.baseAmount + vatAmountCalculated;
    }

    const payment: Payment = {
      id: newDocRef.id,
      clinicId,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...paymentInputData, // Spread the input data
      baseAmount: paymentInputData.baseAmount,
      vatRateApplied,
      vatAmountCalculated,
      totalAmount: finalTotalAmount, // Calculated total amount
      // Ensure all required fields from Payment interface are present
      patientName: paymentInputData.patientName || 'N/A', // Ensure patientName is present
      invoiceId: paymentInputData.invoiceId || `INV-${Date.now()}`, // Generate if not provided
    };
    
    await setDoc(newDocRef, payment);
    console.log('✅ Payment created with dynamic fee calculation:', newDocRef.id, payment);
    return newDocRef.id;
  },

  // Update an existing payment
  async updatePayment(paymentId: string, updates: Partial<Omit<Payment, 'id' | 'clinicId' | 'createdAt'>>): Promise<void> {
    const paymentRef = doc(db, COLLECTION_NAME, paymentId); // Corrected to use db and COLLECTION_NAME
    const updateData: Partial<DocumentData> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    await setDoc(paymentRef, updateData, { merge: true });
    console.log('✅ Payment updated:', paymentId);
  },

  // Soft delete a payment
  async deletePayment(paymentId: string): Promise<void> {
    await this.updatePayment(paymentId, { isActive: false, status: 'cancelled' });
    console.log('✅ Payment soft deleted:', paymentId);
  },

  // Hard delete a payment
  async hardDeletePayment(paymentId: string): Promise<void> {
    const paymentRef = doc(db, COLLECTION_NAME, paymentId);
    await deleteDoc(paymentRef);
    console.log('✅ Payment permanently deleted:', paymentId);
  },

  // Get a single payment by ID
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const paymentRef = doc(db, COLLECTION_NAME, paymentId);
    const docSnap = await getDoc(paymentRef); // Use getDoc for a single document

    if (docSnap.exists()) {
      const docData = docSnap.data();
      return {
        id: docSnap.id,
        ...docData,
        createdAt: docData.createdAt instanceof Timestamp ? docData.createdAt : Timestamp.now(),
        updatedAt: docData.updatedAt instanceof Timestamp ? docData.updatedAt : Timestamp.now(),
      } as Payment;
    }
    console.log(`ℹ️ Payment with ID ${paymentId} not found.`);
    return null;
  },

  // Listen to all payments for a specific clinic
  listenPayments(clinicId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(
      paymentsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('serviceDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
        } as Payment;
      });
      console.log(`💰 Payments updated for clinic ${clinicId}: ${payments.length} active payments`);
      callback(payments);
    }, (error) => {
      console.error(`❌ Error listening to payments for clinic ${clinicId}:`, error);
      callback([]);
    });
  },

  // Listen to payments for a specific patient
  listenPaymentsByPatient(clinicId: string, patientId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(
      paymentsCollection,
      where('clinicId', '==', clinicId),
      where('patientId', '==', patientId),
      where('isActive', '==', true),
      orderBy('serviceDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
        } as Payment;
      });
      console.log(`💰 Payments updated for patient ${patientId} in clinic ${clinicId}: ${payments.length} payments`);
      callback(payments);
    }, (error) => {
      console.error(`❌ Error listening to payments for patient ${patientId}:`, error);
      callback([]);
    });
  },

  // Listen to payment(s) for a specific appointment
  listenPaymentByAppointment(clinicId: string, appointmentId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(
      paymentsCollection,
      where('clinicId', '==', clinicId),
      where('appointmentId', '==', appointmentId),
      where('isActive', '==', true)
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
        } as Payment;
      });
      console.log(`💰 Payment(s) updated for appointment ${appointmentId} in clinic ${clinicId}: ${payments.length} payment(s)`);
      callback(payments);
    }, (error) => {
      console.error(`❌ Error listening to payment for appointment ${appointmentId}:`, error);
      callback([]);
    });
  },

  // Get payments by status (one-time fetch)
  async getPaymentsByStatus(clinicId: string, status: Payment['status']): Promise<Payment[]> {
    const q = query(
      paymentsCollection,
      where('clinicId', '==', clinicId),
      where('status', '==', status),
      where('isActive', '==', true),
      orderBy('serviceDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
        } as Payment;
      });
  },

  // Get payments within a date range (one-time fetch)
  async getPaymentsByDateRange(clinicId: string, startDate: string, endDate: string): Promise<Payment[]> {
    const q = query(
      paymentsCollection,
      where('clinicId', '==', clinicId),
      where('serviceDate', '>=', startDate),
      where('serviceDate', '<=', endDate),
      where('isActive', '==', true),
      orderBy('serviceDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
        } as Payment;
      });
  },

  // Batch update payments
  async batchUpdatePayments(updates: Array<{ paymentId: string; data: Partial<Omit<Payment, 'id' | 'clinicId' | 'createdAt'>> }>): Promise<void> {
    const batchOp: WriteBatch = writeBatch(db);
    updates.forEach(update => {
      const paymentRef = doc(db, COLLECTION_NAME, update.paymentId); // Corrected
      batchOp.update(paymentRef, { ...update.data, updatedAt: Timestamp.now() });
    });
    await batchOp.commit();
    console.log(`✅ Batch updated ${updates.length} payments`);
  },
};

export default PaymentService;