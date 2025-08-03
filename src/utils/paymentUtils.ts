import { 
  PaymentData, 
  defaultClinicPaymentSettings, 
  ClinicPaymentSettings,
  AppointmentTypeSettings,
  defaultVATSettings,
  VATSettings 
} from '../data/mockData';
import { PaymentNotificationService } from '../services/paymentNotificationService';
import { PaymentService, type Payment as FirebasePayment } from '../services/PaymentService';
import { 
  getClinicSettings, 
  updateVATSettings as updateVATSettingsFirebase,
  updatePaymentSettings as updatePaymentSettingsFirebase,
  type VATSettings as FirebaseVATSettings,
  type ClinicPaymentSettings as FirebaseClinicPaymentSettings,
  defaultVATSettings as firebaseDefaultVATSettings,
  defaultClinicPaymentSettings as firebaseDefaultClinicPaymentSettings
} from '../api/clinics';

// Storage keys
const PAYMENTS_STORAGE_KEY = 'clinic_payments_data';
const CLINIC_SETTINGS_KEY = 'clinic_payment_settings';
const VAT_SETTINGS_KEY = 'clinic_vat_settings';

// ✅ NEW: Use Firebase for clinic settings instead of localStorage
let cachedSettings: { [clinicId: string]: any } = {};

// Load clinic payment settings from localStorage
export const loadClinicPaymentSettings = (): ClinicPaymentSettings => {
  try {
    const stored = localStorage.getItem(CLINIC_SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      console.log('✅ loadClinicPaymentSettings: Loaded from localStorage');
      return settings;
    }
  } catch (error) {
    console.error('❌ Error loading clinic settings:', error);
  }
  
  console.log('📝 Using default clinic payment settings');
  return defaultClinicPaymentSettings;
};

// Save clinic payment settings to localStorage
export const saveClinicPaymentSettings = (settings: ClinicPaymentSettings): void => {
  try {
    localStorage.setItem(CLINIC_SETTINGS_KEY, JSON.stringify(settings));
    console.log('✅ saveClinicPaymentSettings: Saved to localStorage');
  } catch (error) {
    console.error('❌ saveClinicPaymentSettings: localStorage error:', error);
  }
};

// Load VAT settings from localStorage
export const loadVATSettings = (): VATSettings => {
  try {
    const stored = localStorage.getItem(VAT_SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      console.log('✅ loadVATSettings: Loaded from localStorage');
      return settings;
    }
  } catch (error) {
    console.error('❌ Error loading VAT settings:', error);
  }
  
  console.log('📝 Using default VAT settings');
  return defaultVATSettings;
};

// Save VAT settings to localStorage
export const saveVATSettings = (settings: VATSettings): void => {
  try {
    localStorage.setItem(VAT_SETTINGS_KEY, JSON.stringify(settings));
    console.log('✅ saveVATSettings: Saved to localStorage');
  } catch (error) {
    console.error('❌ saveVATSettings: localStorage error:', error);
  }
};

// ✅ HYBRID: localStorage primary + Firebase sync
export const loadPaymentsFromStorage = (): PaymentData[] => {
  try {
    const stored = localStorage.getItem('clinic_payments_data');
    if (stored) {
      const payments = JSON.parse(stored);
      console.log(`✅ loadPaymentsFromStorage: Returning ${payments.length} payments from localStorage`);
      return payments;
    }
  } catch (error) {
    console.error('❌ Error loading payments from localStorage:', error);
  }
  
  console.log('📝 No payments in localStorage, returning empty array');
  return [];
};

export const savePaymentsToStorage = (payments: PaymentData[]): void => {
  try {
    localStorage.setItem('clinic_payments_data', JSON.stringify(payments));
    console.log(`💾 Saved ${payments.length} payments to localStorage`);
    
    // ✅ SYNC: Trigger cross-page event for immediate UI updates
    window.dispatchEvent(new CustomEvent('paymentsUpdated', {
      detail: { payments, source: 'paymentUtils', timestamp: Date.now() }
    }));
  } catch (error) {
    console.error('❌ Error saving payments to localStorage:', error);
  }
};

// Helper function to convert Firebase Payment to PaymentData
const convertFirebasePaymentToPaymentData = (payment: FirebasePayment): PaymentData => {
  return {
    id: parseInt(payment.id.slice(-6)) || Math.floor(Math.random() * 1000000), // Use last 6 chars as numeric ID
    invoiceId: payment.invoiceId || `INV-${payment.id}`,
    patient: payment.patient,
    patientAvatar: payment.patient.split(' ').map(n => n[0]).join('').toUpperCase() || 'P',
    doctor: payment.doctor || 'Unknown Doctor',
    appointmentId: payment.appointmentId || '',
    amount: payment.amount,
    currency: payment.currency,
    date: payment.date,
    dueDate: payment.dueDate || payment.date,
    status: payment.status as PaymentData['status'],
    method: payment.method,
    description: payment.description || 'Payment',
    category: payment.category || 'consultation',
    insurance: payment.insurance === 'Yes' ? 'Yes' : 'No',
    insuranceAmount: payment.insuranceAmount || 0,
    paidAmount: payment.paidAmount || (payment.status === 'paid' ? payment.amount : 0),
    includeVAT: payment.includeVAT || false,
    vatRate: payment.vatRate || 0,
    vatAmount: payment.vatAmount || 0,
    totalAmountWithVAT: payment.totalAmountWithVAT || payment.amount,
    baseAmount: payment.baseAmount || payment.amount
  };
};

// Helper function to convert PaymentData to Firebase Payment
const convertPaymentDataToFirebasePayment = (paymentData: PaymentData, clinicId: string): Omit<FirebasePayment, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    clinicId,
    patientId: paymentData.appointmentId ? `patient-${paymentData.appointmentId}` : undefined,
    patient: paymentData.patient,
    doctor: paymentData.doctor,
    appointmentId: paymentData.appointmentId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    status: paymentData.status as FirebasePayment['status'],
    date: paymentData.date,
    dueDate: paymentData.dueDate,
    method: paymentData.method,
    description: paymentData.description,
    category: paymentData.category,
    invoiceId: paymentData.invoiceId,
    paidAmount: paymentData.paidAmount,
    includeVAT: paymentData.includeVAT,
    vatRate: paymentData.vatRate,
    vatAmount: paymentData.vatAmount,
    totalAmountWithVAT: paymentData.totalAmountWithVAT,
    baseAmount: paymentData.baseAmount,
    insurance: paymentData.insurance,
    insuranceAmount: paymentData.insuranceAmount,
    isActive: true
  };
};

// ✅ UTILITY: Debug and utility functions
export const resetPaymentsToDefaults = (): PaymentData[] => {
  const { generateDefaultPayments } = require('../data/mockData');
  const defaultPayments = generateDefaultPayments();
  savePaymentsToStorage(defaultPayments);
  console.log('🔄 Reset payments to defaults');
  return defaultPayments;
};

export const clearAllPayments = (): void => {
  savePaymentsToStorage([]);
  console.log('🗑️ Cleared all payments');
};

export const getInMemoryPaymentsDebugInfo = () => {
  const payments = loadPaymentsFromStorage();
  
  return {
    count: payments.length,
    totalPayments: payments.length,
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    paidRevenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    summary: [
      { metric: 'Total Payments', value: payments.length },
      { metric: 'Paid Payments', value: payments.filter(p => p.status === 'paid').length },
      { metric: 'Pending Payments', value: payments.filter(p => p.status === 'pending').length },
      { metric: 'Total Revenue', value: `${payments.reduce((sum, p) => sum + p.amount, 0)} EGP` },
      { metric: 'Paid Revenue', value: `${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)} EGP` }
    ]
  };
};

// Generate unique invoice ID
export const generateInvoiceId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

// Calculate VAT amount
export const calculateVATAmount = (baseAmount: number, vatRate: number): number => {
  return (baseAmount * vatRate) / 100;
};

// Calculate total amount with VAT
export const calculateTotalWithVAT = (baseAmount: number, vatRate: number): number => {
  return baseAmount + calculateVATAmount(baseAmount, vatRate);
};

// Get appointment type settings (async version for Firebase)
export const getAppointmentTypeSettings = async (appointmentType: string, clinicId: string): Promise<AppointmentTypeSettings | null> => {
  try {
    const clinicSettings = loadClinicPaymentSettings();
    return clinicSettings.appointmentTypes.find(
      type => type.type.toLowerCase() === appointmentType.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error getting appointment type settings:', error);
    return null;
  }
};

// Create auto-payment for completed appointment (Firebase version)
export interface CreateAutoPaymentParams {
  clinicId: string; // Add clinicId as required
  appointmentId: string; // Change to string to match Firebase
  patientId?: string;
  patientName: string;
  patientAvatar: string;
  doctorName: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentDuration: number;
  customAmount?: number;
  isCompleted?: boolean;
}

export const createAutoPaymentForAppointment = async (params: CreateAutoPaymentParams): Promise<PaymentData | null> => {
  try {
    const clinicSettings = loadClinicPaymentSettings();
    
    // For completed appointments, always create payment (override settings)
    if (!params.isCompleted && !clinicSettings.autoCreatePaymentOnCompletion) {
      console.log('Auto-payment creation is disabled in clinic settings');
      return null;
    }

    // Get appointment type settings (simplified for localStorage approach)
    const typeSettings = { cost: 200, currency: 'EGP', includeVAT: false, category: 'consultation' };
    if (!typeSettings && !params.customAmount) {
      console.warn(`No cost settings found for appointment type: ${params.appointmentType}`);
      if (params.isCompleted) {
        console.log('Using default amount for completed appointment');
      } else {
        return null;
      }
    }

    // Calculate amounts
    const baseAmount = params.customAmount || typeSettings?.cost || (params.isCompleted ? 200 : 0);
    const vatSettings = loadVATSettings();
    const includeVAT = typeSettings?.includeVAT !== false && vatSettings.enabled;
    
    let vatAmount = 0;
    let totalAmount = baseAmount;
    
    if (includeVAT) {
      vatAmount = calculateVATAmount(baseAmount, vatSettings.rate);
      totalAmount = calculateTotalWithVAT(baseAmount, vatSettings.rate);
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + clinicSettings.defaultPaymentDueDays);

    // Create payment record using Firebase
    const paymentStatus = params.isCompleted ? 'paid' : 'pending';
    
    const firebasePaymentData = {
      patientId: params.patientId,
      patient: params.patientName,
      doctor: params.doctorName,
      appointmentId: params.appointmentId,
      amount: totalAmount,
      currency: typeSettings?.currency || 'EGP',
      status: paymentStatus as FirebasePayment['status'],
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      method: clinicSettings.defaultPaymentMethod,
      description: `${params.appointmentType} appointment with Dr. ${params.doctorName} ${params.isCompleted ? '(Completed - Auto-paid)' : '(Auto-generated)'}`,
      category: typeSettings?.category || params.appointmentType.toLowerCase(),
      invoiceId: generateInvoiceId(),
      paidAmount: params.isCompleted ? totalAmount : 0,
      includeVAT: includeVAT,
      vatRate: includeVAT ? vatSettings.rate : 0,
      vatAmount: vatAmount,
      totalAmountWithVAT: totalAmount,
      baseAmount: baseAmount,
      insurance: 'No',
      insuranceAmount: 0,
      isActive: true
    };

    // Save payment to Firebase
    const paymentId = await PaymentService.createPayment(params.clinicId, firebasePaymentData);
    console.log(`✅ Auto-payment created in Firebase for appointment ${params.appointmentId} (${paymentStatus}):`, paymentId);
    
    // Send notification if payment is marked as paid
    if (params.isCompleted) {
      const notificationService = PaymentNotificationService.getInstance();
      notificationService.notifyPaymentCompleted({
        patientName: firebasePaymentData.patient,
        amount: firebasePaymentData.amount,
        paymentId: firebasePaymentData.invoiceId,
        method: firebasePaymentData.method
      });
    }
    
    // Convert to PaymentData format for return
    return convertFirebasePaymentToPaymentData({
      ...firebasePaymentData,
      id: paymentId,
      clinicId: params.clinicId,
      createdAt: new Date(),
      updatedAt: new Date()
    } as FirebasePayment);

  } catch (error) {
    console.error('Error creating auto-payment for appointment:', error);
    return null;
  }
};

// Create paid payment for completed appointment
export const createPaidPaymentForCompletedAppointment = async (params: CreateAutoPaymentParams): Promise<PaymentData | null> => {
  return createAutoPaymentForAppointment({ ...params, isCompleted: true });
};

// ✅ REMOVED: Duplicate function - using the localStorage version below

// Get appointment payment summary (Firebase version)
export const getAppointmentPaymentSummary = async (clinicId: string, appointmentId: string) => {
  try {
    const payments = await PaymentService.getPaymentsByAppointment(clinicId, appointmentId);
    
    if (payments.length === 0) {
      return { hasPayment: false, totalAmount: 0, totalPaid: 0, status: 'no-payment' };
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    
    let status = 'pending';
    if (totalPaid >= totalAmount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    return {
      hasPayment: true,
      payments: payments.map(convertFirebasePaymentToPaymentData),
      totalAmount,
      totalPaid,
      status,
      remainingAmount: totalAmount - totalPaid
    };
  } catch (error) {
    console.error('Error getting appointment payment summary:', error);
    return { hasPayment: false, totalAmount: 0, totalPaid: 0, status: 'error' };
  }
};

// ✅ CRITICAL: Update payment status (localStorage + sync events)
export const updatePaymentStatus = (paymentId: string, newStatus: string, paidAmount?: number): boolean => {
  try {
    const payments = loadPaymentsFromStorage();
    const paymentIndex = payments.findIndex(p => p.id.toString() === paymentId.toString());
    
    if (paymentIndex === -1) {
      console.warn(`⚠️ Payment ${paymentId} not found for status update`);
      return false;
    }
    
    const payment = payments[paymentIndex];
    const oldStatus = payment.status;
    
    // Update payment status
    payment.status = newStatus as any;
    
    // Handle paid amount for partial payments
    if (paidAmount !== undefined) {
      payment.paidAmount = paidAmount;
    }
    
    // ✅ NEW: Use calculated payment status based on amounts and due date
    const calculatedStatus = getCalculatedPaymentStatus(
      newStatus,
      payment.paidAmount || 0,
      payment.amount,
      payment.dueDate
    );
    
    // Update to calculated status if different
    if (calculatedStatus !== newStatus) {
      payment.status = calculatedStatus as any;
      console.log(`🔄 Auto-corrected payment status from ${newStatus} to ${calculatedStatus} based on amounts and due date`);
    }
    
    // Update the payment in array
    payments[paymentIndex] = payment;
    
    // Save back to localStorage
    savePaymentsToStorage(payments);
    
    console.log(`✅ Payment ${paymentId} status: ${oldStatus} → ${payment.status}`);
    
    // ✅ CRITICAL: Sync with appointments immediately
    updateAppointmentPaymentStatusInPayments(payment.appointmentId || '', payment.status);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    return false;
  }
};

// ✅ CRITICAL: Sync payment status back to appointments
export const updateAppointmentPaymentStatusInPayments = (appointmentId: string, paymentStatus: string): void => {
  if (!appointmentId) return;
  
  try {
    // Trigger appointment status update event
    window.dispatchEvent(new CustomEvent('appointmentPaymentStatusUpdated', {
      detail: { 
        appointmentId, 
        paymentStatus, 
        source: 'paymentUtils',
        timestamp: Date.now()
      }
    }));
    
    console.log(`🔄 Triggered appointment ${appointmentId} payment status update: ${paymentStatus}`);
  } catch (error) {
    console.error('❌ Error syncing appointment payment status:', error);
  }
};

// Mark payment as paid (convenience function)
export const markPaymentAsPaid = (paymentId: string, paidAmount?: number): boolean => {
  return updatePaymentStatus(paymentId, 'paid', paidAmount);
};

// ✅ ENHANCED: Smart payment creation with Firebase integration
export const createPayment = (paymentData: any): any => {
  try {
    const paymentId = crypto.randomUUID();
    const invoiceId = paymentData.invoiceId || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const payment = {
      id: paymentId,
      invoiceId,
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // ✅ Save to Firebase if clinicId is provided
    if (paymentData.clinicId) {
      // Save to Firebase asynchronously (don't block the return)
      (async () => {
        try {
          const { firebaseDataManager } = await import('../utils/firebaseDataManager');
          const dataManager = firebaseDataManager.initialize({ 
            clinicId: paymentData.clinicId 
          });
          await dataManager.createPayment(payment);
          console.log('✅ Payment saved to Firebase:', paymentId);
        } catch (firebaseError) {
          console.error('❌ Failed to save payment to Firebase:', firebaseError);
          
          // Save to emergency backup
          try {
            const emergencyPayments = JSON.parse(localStorage.getItem('clinic_payments_emergency') || '[]');
            emergencyPayments.push({ ...payment, isEmergencyBackup: true });
            localStorage.setItem('clinic_payments_emergency', JSON.stringify(emergencyPayments));
            console.log('🚨 Payment saved as emergency backup');
          } catch (backupError) {
            console.error('❌ Emergency payment backup also failed:', backupError);
          }
        }
      })();
    }

    // ✅ Also save to localStorage for immediate use
    try {
      const localPayments = JSON.parse(localStorage.getItem('clinic_payments') || '[]');
      localPayments.push(payment);
      localStorage.setItem('clinic_payments', JSON.stringify(localPayments));
      console.log('✅ Payment saved locally:', paymentId);
    } catch (localError) {
      console.error('❌ Failed to save payment locally:', localError);
    }

    // ✅ Trigger cross-page sync events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('paymentCreated', {
        detail: { payment, source: 'createPayment' }
      }));
    }

    return payment;
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    throw error;
  }
};

// Function to manually trigger payment notifications (for testing)
export const triggerPaymentNotification = async (paymentId: number): Promise<boolean> => {
  try {
    const payments = loadPaymentsFromStorage();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
      console.error('Payment not found:', paymentId);
      return false;
    }
    
    const notificationService = PaymentNotificationService.getInstance();
    
    if (payment.status === 'paid') {
      await notificationService.notifyPaymentCompleted({
        patientName: payment.patient,
        amount: payment.amount,
        paymentId: payment.invoiceId,
        method: payment.method
      });
    } else {
      // For testing, allow notifications for any payment
      await notificationService.notifyPaymentCompleted({
        patientName: payment.patient,
        amount: payment.amount,
        paymentId: payment.invoiceId,
        method: payment.method
      });
    }
    
    console.log(`✅ Notification triggered for payment: ${payment.invoiceId}`);
    return true;
  } catch (error) {
    console.error('Error triggering payment notification:', error);
    return false;
  }
};

// Test payment notification system
export const testPaymentNotificationSystem = async (): Promise<void> => {
  const notificationService = PaymentNotificationService.getInstance();
  await notificationService.testPaymentNotification();
};

// Create payment for appointment (ALL appointments - completed or pending)
export const createPaymentForAllAppointments = (appointment: any): PaymentData | null => {
  try {
    // Use simplified settings for localStorage approach
    const clinicSettings = { 
      defaultPaymentMethod: 'cash', 
      defaultPaymentDueDays: 7 
    };
    
    // Get appointment type settings (simplified)
    const typeSettings = { cost: 200, currency: 'EGP', includeVAT: false, category: 'consultation' };
    
    // Calculate amounts - use default amount if no settings found
    const baseAmount = typeSettings?.cost || 200; // Default to 200 EGP
    const vatSettings = { enabled: false, rate: 14 };
    const includeVAT = typeSettings?.includeVAT !== false && vatSettings.enabled;
    
    let vatAmount = 0;
    let totalAmount = baseAmount;
    
    if (includeVAT) {
      vatAmount = calculateVATAmount(baseAmount, vatSettings.rate);
      totalAmount = calculateTotalWithVAT(baseAmount, vatSettings.rate);
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + clinicSettings.defaultPaymentDueDays);

    // Load existing payments to get next ID
    const existingPayments = loadPaymentsFromStorage();
    
    // Check if payment already exists for this appointment
    const existingPayment = existingPayments.find(p => p.appointmentId === appointment.id?.toString());
    if (existingPayment) {
      console.log(`Payment already exists for appointment ${appointment.id}`);
      return existingPayment;
    }
    
    const nextId = existingPayments.length > 0 ? Math.max(...existingPayments.map(p => p.id)) + 1 : 1;

    // Determine payment status based on appointment status
    const isCompleted = appointment.status === 'completed' || appointment.completed === true;
    const paymentStatus = isCompleted ? 'paid' : 'pending';
    
    const newPayment: PaymentData = {
      id: nextId,
      invoiceId: generateInvoiceId(),
      patient: appointment.patient,
      patientAvatar: appointment.patient.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      doctor: appointment.doctor,
      appointmentId: appointment.id?.toString() || nextId.toString(),
      amount: totalAmount,
      currency: typeSettings?.currency || 'EGP',
      date: appointment.date,
      dueDate: dueDate.toISOString().split('T')[0],
      status: paymentStatus,
      method: clinicSettings.defaultPaymentMethod,
      description: `${appointment.type} appointment with Dr. ${appointment.doctor} ${isCompleted ? '(Completed - Auto-paid)' : '(Pending appointment)'}`,
      category: typeSettings?.category || appointment.type.toLowerCase(),
      insurance: 'No',
      insuranceAmount: 0,
      paidAmount: isCompleted ? totalAmount : 0, // Full amount paid if completed
      includeVAT: includeVAT,
      vatRate: includeVAT ? vatSettings.rate : 0,
      vatAmount: vatAmount,
      totalAmountWithVAT: totalAmount,
      baseAmount: baseAmount
    };

    // Save payment
    const updatedPayments = [...existingPayments, newPayment];
    savePaymentsToStorage(updatedPayments);

    console.log(`✅ Payment created for appointment ${appointment.id} (${paymentStatus}):`, newPayment);
    
    // Send notification if payment is marked as paid
    if (isCompleted) {
      const notificationService = PaymentNotificationService.getInstance();
      notificationService.notifyPaymentCompleted({
        patientName: newPayment.patient,
        amount: newPayment.amount,
        paymentId: newPayment.invoiceId,
        method: newPayment.method
      });
    }
    
    return newPayment;

  } catch (error) {
    console.error('Error creating payment for appointment:', error);
    return null;
  }
};

// Process all appointments and create payments
export const processAllAppointmentsForPayments = (appointments: any[]): PaymentData[] => {
  const createdPayments: PaymentData[] = [];
  
  appointments.forEach(appointment => {
    const payment = createPaymentForAllAppointments(appointment);
    if (payment) {
      createdPayments.push(payment);
    }
  });
  
  console.log(`📋 Processed ${appointments.length} appointments, created ${createdPayments.length} payments`);
  return createdPayments;
};

// Update payment amount
export const updatePaymentAmount = (paymentId: number, newAmount: number, newPaidAmount?: number): boolean => {
  try {
    const payments = loadPaymentsFromStorage();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      console.error('Payment not found:', paymentId);
      return false;
    }
    
    const payment = payments[paymentIndex];
    const vatSettings = { enabled: false, rate: 14 };
    
    // Recalculate VAT if applicable
    let vatAmount = 0;
    let totalAmount = newAmount;
    
    if (payment.includeVAT && vatSettings.enabled) {
      vatAmount = calculateVATAmount(newAmount, payment.vatRate || vatSettings.rate);
      totalAmount = calculateTotalWithVAT(newAmount, payment.vatRate || vatSettings.rate);
    }
    
    // Update payment
    const updatedPayment = {
      ...payment,
      baseAmount: newAmount,
      amount: totalAmount,
      vatAmount: vatAmount,
      totalAmountWithVAT: totalAmount,
      paidAmount: newPaidAmount ?? payment.paidAmount
    };
    
    payments[paymentIndex] = updatedPayment;
    savePaymentsToStorage(payments);
    
    console.log(`✅ Payment amount updated for ${payment.invoiceId}: ${payment.amount} → ${totalAmount}`);
    return true;
  } catch (error) {
    console.error('Error updating payment amount:', error);
    return false;
  }
};

// ✅ NEW: Calculate real-time revenue and profit
export const calculateCurrentRevenue = (): { 
  totalRevenue: number, 
  paidRevenue: number, 
  pendingRevenue: number,
  overallProfit: number 
} => {
  const payments = loadPaymentsFromStorage();
  
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate profit (for now, assuming 70% profit margin)
  const overallProfit = paidRevenue * 0.7;
  
  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    overallProfit
  };
};

// ✅ NEW: Get payment statistics
export const getPaymentStatistics = () => {
  const payments = loadPaymentsFromStorage();
  const revenue = calculateCurrentRevenue();
  
  return {
    totalPayments: payments.length,
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    ...revenue
  };
};

// ✅ NEW: Add global debug commands for payment storage
if (typeof window !== 'undefined') {
  // Add debug functions to window for easy access
  (window as any).paymentStorageDebug = () => {
    const info = getInMemoryPaymentsDebugInfo();
    console.log('💰 IN-MEMORY PAYMENT STORAGE DEBUG:', info);
    console.table(info.summary);
    alert(`💰 Payment Storage Debug:\n\nTotal Payments: ${info.count}\n\nCheck console for detailed table view.`);
    return info;
  };

  (window as any).resetPayments = () => {
    const reset = resetPaymentsToDefaults();
    console.log('🔄 Payments reset to defaults:', reset.length);
    alert(`✅ Payments Reset!\n\nReset to ${reset.length} default payments.\nRefresh the payment page to see changes.`);
    return reset;
  };

  (window as any).clearPayments = () => {
    clearAllPayments();
    console.log('🗑️ All payments cleared');
    alert('🗑️ All payments cleared!\n\nRefresh the payment page to see changes.');
  };

  (window as any).addTestPayment = () => {
    const testPayment: PaymentData = {
      id: Date.now(),
      invoiceId: `TEST-${Date.now()}`,
      patient: 'Test Patient',
      patientAvatar: 'TP',
      doctor: 'Dr. Test',
      amount: 150,
      currency: 'EGP',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      method: 'Cash',
      description: 'Test payment for debugging',
      category: 'consultation',
      insurance: 'No',
      insuranceAmount: 0,
      paidAmount: 0,
      includeVAT: false,
      vatRate: 0,
      vatAmount: 0,
      totalAmountWithVAT: 150,
      baseAmount: 150
    };
    
    const current = loadPaymentsFromStorage();
    const updated = [...current, testPayment];
    savePaymentsToStorage(updated);
    
    console.log('➕ Test payment added:', testPayment);
    alert('➕ Test payment added!\n\nRefresh the payment page to see changes.');
    return testPayment;
  };

  // ✅ NEW: Revenue calculation debug commands
  (window as any).calculateRevenue = () => {
    const stats = getPaymentStatistics();
    console.log('💰 PAYMENT STATISTICS:', stats);
    console.table([
      { Metric: 'Total Revenue', Value: `${stats.totalRevenue} EGP` },
      { Metric: 'Paid Revenue', Value: `${stats.paidRevenue} EGP` },
      { Metric: 'Pending Revenue', Value: `${stats.pendingRevenue} EGP` },
      { Metric: 'Profit (70%)', Value: `${stats.overallProfit} EGP` },
      { Metric: 'Total Payments', Value: stats.totalPayments },
      { Metric: 'Paid Payments', Value: stats.paidPayments },
      { Metric: 'Pending Payments', Value: stats.pendingPayments },
      { Metric: 'Overdue Payments', Value: stats.overduePayments }
    ]);
    alert(`💰 Revenue Statistics:\n\nTotal Revenue: ${stats.totalRevenue} EGP\nPaid Revenue: ${stats.paidRevenue} EGP\nPending Revenue: ${stats.pendingRevenue} EGP\nProfit: ${stats.overallProfit} EGP\n\nTotal Payments: ${stats.totalPayments}\nPaid: ${stats.paidPayments}\nPending: ${stats.pendingPayments}\nOverdue: ${stats.overduePayments}`);
    return stats;
  };

  // ✅ NEW: Test payment status update function
  (window as any).testPaymentStatusUpdate = async (paymentId?: number, newStatus?: string) => {
    const payments = loadPaymentsFromStorage();
    
    if (!paymentId) {
      // Use first payment if no ID provided
      if (payments.length > 0) {
        paymentId = payments[0].id;
      } else {
        alert('❌ No payments found to test with!');
        return;
      }
    }
    
    if (!newStatus) {
      newStatus = 'paid'; // Default to paid
    }
    
    console.log(`🧪 TEST: Updating payment ${paymentId} to status ${newStatus}`);
    
    const result = updatePaymentStatus(paymentId.toString(), newStatus);
    
    if (result) {
      console.log(`✅ TEST: Payment status update successful`);
      alert(`✅ Test successful!\n\nPayment ${paymentId} updated to ${newStatus}\n\nCheck the UI to see if it updated!`);
    } else {
      console.log(`❌ TEST: Payment status update failed`);
      alert(`❌ Test failed!\n\nPayment ${paymentId} could not be updated to ${newStatus}`);
    }
    
    return result;
  };

  (window as any).triggerRevenueUpdate = () => {
    const stats = getPaymentStatistics();
    window.dispatchEvent(new CustomEvent('revenueCalculationRequested', {
      detail: stats
    }));
    console.log('💰 Revenue calculation update triggered with stats:', stats);
    alert('💰 Revenue calculation update triggered!\n\nCheck console for details.');
    return stats;
  };

  // Add console command info
  console.log(`
  💰 PAYMENT STORAGE DEBUG COMMANDS AVAILABLE:
  
  • paymentStorageDebug() - Show current payment storage state
  • resetPayments() - Reset payments to default state
  • clearPayments() - Clear all payments
  • addTestPayment() - Add a test payment for debugging
  • calculateRevenue() - Calculate and display current revenue/profit
  • triggerRevenueUpdate() - Trigger revenue calculation update event
  • testPaymentStatusUpdate(paymentId?, newStatus?) - Test payment status update
  
  💡 Type any of these commands in the console to manage payment storage!
  
  🧪 TESTING EXAMPLES:
  • testPaymentStatusUpdate() - Update first payment to "paid"
  • testPaymentStatusUpdate(1, 'paid') - Update payment ID 1 to "paid"  
  • testPaymentStatusUpdate(1, 'pending') - Update payment ID 1 to "pending"
  `);
} 

// ✅ NEW: Get appointment payment amount from clinic settings
export const getAppointmentPaymentAmount = (appointmentType: string, clinicSettings?: ClinicPaymentSettings): number => {
  const settings = clinicSettings || loadClinicPaymentSettings();
  const appointmentTypeSetting = settings.appointmentTypes.find(
    type => type.type.toLowerCase() === appointmentType.toLowerCase() ||
            type.category.toLowerCase() === appointmentType.toLowerCase()
  );
  
  return appointmentTypeSetting?.cost || 200; // Default fallback amount
};

// ✅ NEW: Check if payment is overdue
export const isPaymentOverdue = (dueDate: string): boolean => {
  if (!dueDate) return false;
  
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  return today > due;
};

// ✅ NEW: Auto-detect payment status based on due date and amount
export const getCalculatedPaymentStatus = (
  currentStatus: string,
  paidAmount: number,
  totalAmount: number,
  dueDate?: string
): string => {
  // If cancelled or failed, keep as is
  if (currentStatus === 'cancelled' || currentStatus === 'failed') {
    return currentStatus;
  }
  
  // If fully paid, return paid
  if (paidAmount >= totalAmount) {
    return 'paid';
  }
  
  // If partially paid
  if (paidAmount > 0 && paidAmount < totalAmount) {
    // Check if overdue
    if (dueDate && isPaymentOverdue(dueDate)) {
      return 'overdue';
    }
    return 'partial';
  }
  
  // If not paid at all, check if overdue
  if (paidAmount === 0 && dueDate && isPaymentOverdue(dueDate)) {
    return 'overdue';
  }
  
  return 'pending';
}; 

// ✅ NEW: Automatic overdue detection and update
export const detectAndUpdateOverduePayments = async (): Promise<{
  updatedPayments: number;
  updatedAppointments: number;
}> => {
  try {
    const payments = loadPaymentsFromStorage();
    let updatedPayments = 0;
    let updatedAppointments = 0;
    
    const updatedPaymentsList = payments.map(payment => {
      // Skip if already marked as overdue, paid, cancelled, or failed
      if (['overdue', 'paid', 'cancelled', 'failed'].includes(payment.status)) {
        return payment;
      }
      
      // Check if payment should be marked as overdue
      const calculatedStatus = getCalculatedPaymentStatus(
        payment.status,
        payment.paidAmount || 0,
        payment.amount,
        payment.dueDate
      );
      
      if (calculatedStatus === 'overdue' && payment.status !== 'overdue') {
        payment.status = 'overdue';
        updatedPayments++;
        
        // Sync with appointment
        if (payment.appointmentId) {
          updateAppointmentPaymentStatusInPayments(payment.appointmentId, 'overdue');
          updatedAppointments++;
        }
        
        console.log(`📅 Payment ${payment.id || payment.invoiceId} marked as overdue (due: ${payment.dueDate})`);
      }
      
      return payment;
    });
    
    // Save updated payments
    if (updatedPayments > 0) {
      savePaymentsToStorage(updatedPaymentsList);
      console.log(`✅ Overdue detection complete: ${updatedPayments} payments and ${updatedAppointments} appointments updated`);
    }
    
    return { updatedPayments, updatedAppointments };
  } catch (error) {
    console.error('❌ Error detecting overdue payments:', error);
    return { updatedPayments: 0, updatedAppointments: 0 };
  }
};

// ✅ NEW: Run overdue detection on app initialization
export const initializePaymentStatusCheck = (): void => {
  // Run initial check
  detectAndUpdateOverduePayments();
  
  // Set up daily check at midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    // Run at midnight
    detectAndUpdateOverduePayments();
    
    // Then run every 24 hours
    setInterval(detectAndUpdateOverduePayments, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  console.log('🕒 Payment overdue detection scheduled');
}; 

// ✅ NEW: Clear all payment-related localStorage data
export const clearAllPaymentCache = (): void => {
  try {
    // Clear payment data
    localStorage.removeItem(PAYMENTS_STORAGE_KEY);
    localStorage.removeItem('clinic_payments_data'); // Backup key
    
    // Clear payment settings
    localStorage.removeItem(CLINIC_SETTINGS_KEY);
    localStorage.removeItem(VAT_SETTINGS_KEY);
    
    // Clear other payment-related cache
    localStorage.removeItem('clinicPaymentMethods');
    localStorage.removeItem('clinic_vat_settings');
    localStorage.removeItem('clinic_payment_settings');
    localStorage.removeItem('clinic_employees_data');
    localStorage.removeItem('clinic_business_expenses_data');
    localStorage.removeItem('clinic_vat_adjustments');
    
    // Clear cached settings
    cachedSettings = {};
    
    console.log('🧹 All payment cache cleared from localStorage');
    
    // Dispatch event to notify all components
    window.dispatchEvent(new CustomEvent('paymentCacheCleared', {
      detail: { timestamp: Date.now(), source: 'manual-clear' }
    }));
    
  } catch (error) {
    console.error('❌ Error clearing payment cache:', error);
  }
};

// ✅ NEW: Force reload payments from Firebase only (no localStorage fallback)
export const forceRefreshFromFirebase = async (clinicId: string): Promise<any[]> => {
  try {
    console.log('🔄 Force refreshing payments from Firebase only...');
    
    // Import PaymentService dynamically to avoid circular dependencies
    const { PaymentService } = await import('../services/PaymentService');
    
    // Get fresh data from Firebase
    const firebasePayments = await PaymentService.getPayments(clinicId);
    console.log(`✅ Retrieved ${firebasePayments.length} payments from Firebase`);
    
    // Clear localStorage to prevent fallback
    localStorage.removeItem(PAYMENTS_STORAGE_KEY);
    
    // Only save to localStorage if we have Firebase data
    if (firebasePayments.length > 0) {
      const convertedPayments = firebasePayments.map((payment: any) => ({
        id: parseInt(payment.id) || Math.random() * 1000,
        invoiceId: payment.invoiceId || `INV-${payment.id}`,
        patient: payment.patient || 'Unknown Patient',
        patientAvatar: payment.patient?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'UP',
        doctor: payment.doctor || 'Unknown Doctor',
        appointmentId: payment.appointmentId || '',
        amount: payment.amount || 0,
        currency: payment.currency || 'USD',
        date: payment.date || new Date().toISOString().split('T')[0],
        dueDate: payment.dueDate || new Date().toISOString().split('T')[0],
        status: payment.status || 'pending',
        method: payment.method || 'cash',
        description: payment.description || 'Payment',
        category: payment.category || 'consultation',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: payment.paidAmount || (payment.status === 'completed' ? payment.amount : 0),
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: payment.amount || 0,
        baseAmount: payment.amount || 0
      }));
      
      savePaymentsToStorage(convertedPayments);
      return convertedPayments;
    }
    
    // If no Firebase data, return empty array (don't fall back to localStorage)
    console.log('💰 No payments found in Firebase - returning empty array');
    return [];
    
  } catch (error) {
    console.error('❌ Error force refreshing from Firebase:', error);
    throw error;
  }
};

// ✅ NEW: Check if localStorage has stale data
export const hasStalePaymentData = (): boolean => {
  try {
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    return !!stored && JSON.parse(stored).length > 0;
  } catch {
    return false;
  }
};

// ✅ NEW: Complete cache reset and Firebase sync
export const resetPaymentSystemCache = async (clinicId: string): Promise<void> => {
  try {
    console.log('🔄 Starting complete payment system cache reset...');
    
    // Step 1: Clear all local cache
    clearAllPaymentCache();
    
    // Step 2: Wait a moment for cache clear events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 3: Force refresh from Firebase
    await forceRefreshFromFirebase(clinicId);
    
    // Step 4: Notify all components
    window.dispatchEvent(new CustomEvent('paymentSystemReset', {
      detail: { 
        timestamp: Date.now(), 
        source: 'cache-reset',
        clinicId 
      }
    }));
    
    console.log('✅ Payment system cache reset complete');
    
  } catch (error) {
    console.error('❌ Error resetting payment system cache:', error);
    throw error;
  }
}; 

// ✅ NEW: Global console command for clearing payment cache
if (typeof window !== 'undefined') {
  // Add global command to window for easy access via browser console
  (window as any).clearPaymentCache = async (clinicId?: string) => {
    try {
      console.log('🧹 Starting manual payment cache clear...');
      
      if (clinicId) {
        // Full reset with Firebase sync
        await resetPaymentSystemCache(clinicId);
        console.log('✅ Payment cache cleared and refreshed from Firebase');
        console.log('📄 Reload the page to see changes');
      } else {
        // Just clear localStorage
        clearAllPaymentCache();
        console.log('✅ Payment cache cleared from localStorage');
        console.log('💡 Usage: clearPaymentCache("your-clinic-id") for full reset with Firebase sync');
        console.log('📄 Reload the page to see changes');
      }
      
      return 'Success! Payment cache cleared.';
    } catch (error) {
      console.error('❌ Error clearing payment cache:', error);
      return 'Error clearing cache. Check console for details.';
    }
  };

  // Add help command
  (window as any).clearPaymentCacheHelp = () => {
    console.log(`
🧹 PAYMENT CACHE CLEARING COMMANDS:

1. clearPaymentCache()
   - Clears all payment data from localStorage only
   
2. clearPaymentCache("your-clinic-id")
   - Clears localStorage AND refreshes from Firebase
   - Replace "your-clinic-id" with your actual clinic ID
   
3. clearPaymentCacheHelp()
   - Shows this help message

WHAT GETS CLEARED:
- clinic_payments_data
- clinic_payment_settings  
- clinic_vat_settings
- clinic_employees_data
- clinic_business_expenses_data
- clinic_vat_adjustments
- And more payment-related cache

TROUBLESHOOTING:
- If you see payments that don't exist in Firebase, run: clearPaymentCache("clinic-id")
- After clearing, reload the page to see changes
- Check Network tab to verify Firebase requests
    `);
    return 'Help displayed in console';
  };

  console.log('💡 Payment cache clearing commands added to window:');
  console.log('   - clearPaymentCache() - Clear localStorage only');  
  console.log('   - clearPaymentCache("clinic-id") - Clear cache and refresh from Firebase');
  console.log('   - clearPaymentCacheHelp() - Show detailed help');
} 

// ✅ NEW: Find existing payment by appointment ID to prevent duplicates
export const findPaymentByAppointmentId = async (appointmentId: string, clinicId: string): Promise<any | null> => {
  try {
    // Import PaymentService dynamically to avoid circular dependencies
    const { PaymentService } = await import('../services/PaymentService');
    
    const payments = await PaymentService.getPayments(clinicId);
    
    // First try to find by exact appointmentId match
    let payment = payments.find(p => p.appointmentId === appointmentId);
    
    if (!payment) {
      console.log(`⚠️ No payment found with appointmentId: ${appointmentId}`);
      return null;
    }
    
    console.log(`✅ Found existing payment ${payment.id} for appointmentId: ${appointmentId}`);
    return payment;
  } catch (error) {
    console.error('❌ Error finding payment by appointment ID:', error);
    return null;
  }
};

// ✅ NEW: Safely update or create payment for appointment
export const updateOrCreatePaymentForAppointment = async (
  appointmentData: {
    id: string;
    patient: string;
    doctor: string;
    type: string;
    date: string;
  },
  paymentStatus: string,
  clinicId: string
): Promise<{ updated: boolean; paymentId: string }> => {
  try {
    // Check for existing payment
    const existingPayment = await findPaymentByAppointmentId(appointmentData.id, clinicId);
    
    if (existingPayment) {
      // Update existing payment
      const { PaymentService } = await import('../services/PaymentService');
      await PaymentService.updatePayment(existingPayment.id, {
        status: paymentStatus
      });
      
      console.log(`✅ Updated existing payment ${existingPayment.id} to status: ${paymentStatus}`);
      return { updated: true, paymentId: existingPayment.id };
    } else {
      // Create new payment
      const appointmentAmount = getAppointmentPaymentAmount(appointmentData.type);
      
      const paymentData = {
        patient: appointmentData.patient,
        patientAvatar: appointmentData.patient.split(' ').map(n => n[0]).join('').toUpperCase() || 'P',
        doctor: appointmentData.doctor || 'Unknown Doctor',
        amount: appointmentAmount,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: appointmentData.date,
        status: paymentStatus as 'pending' | 'paid',
        method: 'cash',
        description: `Payment for ${appointmentData.type} appointment`,
        category: 'consultation',
        insurance: 'No' as 'Yes' | 'No',
        insuranceAmount: 0,
        paidAmount: paymentStatus === 'paid' ? appointmentAmount : 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: appointmentAmount,
        baseAmount: appointmentAmount,
        appointmentId: appointmentData.id
      };

      const newPayment = createPayment(paymentData);
      console.log(`✅ Created new payment ${newPayment.invoiceId} with status: ${paymentStatus}`);
      return { updated: false, paymentId: newPayment.id };
    }
  } catch (error) {
    console.error('❌ Error updating or creating payment:', error);
    throw error;
  }
}; 

// ✅ NEW: Sync emergency backup appointments to Firebase
export const syncEmergencyAppointments = async (): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> => {
  try {
    const emergencyBackups = JSON.parse(localStorage.getItem('clinic_appointments_emergency') || '[]');
    
    if (emergencyBackups.length === 0) {
      console.log('📋 No emergency appointment backups to sync');
      return { synced: 0, failed: 0, errors: [] };
    }

    console.log(`🔄 Syncing ${emergencyBackups.length} emergency backup appointments...`);

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const appointment of emergencyBackups) {
      try {
        // Import AppointmentService dynamically
        const { AppointmentService } = await import('../services/AppointmentService');
        
        // Extract clinic ID from appointment or use default
        const clinicId = appointment.clinicId || 'demo-clinic';
        
        // Remove emergency backup fields and create proper appointment
        const { id, isEmergencyBackup, ...appointmentData } = appointment;
        
        // Create new appointment in Firebase
        await AppointmentService.createAppointment(clinicId, appointmentData);
        synced++;
        
        console.log(`✅ Synced emergency appointment: ${appointment.patient} - ${appointment.date}`);
      } catch (syncError) {
        failed++;
        const errorMsg = `Failed to sync appointment for ${appointment.patient}: ${syncError}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }
    }

    // Clear emergency backups after sync attempt
    if (synced > 0) {
      localStorage.removeItem('clinic_appointments_emergency');
      console.log(`🧹 Cleared emergency backup storage after syncing ${synced} appointments`);
    }

    // Trigger UI refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('emergencyAppointmentsSynced', {
        detail: { synced, failed, errors }
      }));
    }

    return { synced, failed, errors };
  } catch (error) {
    console.error('❌ Error syncing emergency appointments:', error);
    return { synced: 0, failed: 0, errors: [error.message] };
  }
};

// ✅ NEW: Check for and sync emergency backups on app start
export const initializeAppointmentBackupSync = (): void => {
  // Check for emergency backups on page load
  setTimeout(async () => {
    try {
      const emergencyBackups = JSON.parse(localStorage.getItem('clinic_appointments_emergency') || '[]');
      
      if (emergencyBackups.length > 0) {
        console.log(`🚨 Found ${emergencyBackups.length} emergency appointment backups`);
        
        // Ask user if they want to sync
        const shouldSync = confirm(
          `Found ${emergencyBackups.length} appointment(s) that were saved offline.\n\n` +
          'Would you like to sync them to the server now?'
        );
        
        if (shouldSync) {
          const result = await syncEmergencyAppointments();
          
          if (result.synced > 0) {
            alert(`✅ Successfully synced ${result.synced} appointment(s) to the server.`);
          }
          
          if (result.failed > 0) {
            alert(`⚠️ ${result.failed} appointment(s) failed to sync:\n\n${result.errors.slice(0, 3).join('\n')}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking emergency backups:', error);
    }
  }, 2000); // Wait 2 seconds after page load
  
  console.log('🔄 Emergency appointment backup sync initialized');
}; 

// ✅ ENHANCED: Global console commands for appointment backup debugging
(window as any).checkAppointmentBackups = () => {
  try {
    const regularBackups = JSON.parse(localStorage.getItem('clinic_appointments_backup') || '[]');
    const emergencyBackups = JSON.parse(localStorage.getItem('clinic_appointments_emergency') || '[]');
    
    console.log('📋 APPOINTMENT BACKUP STATUS:');
    console.log(`   • Regular backups: ${regularBackups.length} appointments`);
    console.log(`   • Emergency backups: ${emergencyBackups.length} appointments`);
    
    if (regularBackups.length > 0) {
      console.log('📋 Regular backup details:', regularBackups.slice(0, 3));
    }
    
    if (emergencyBackups.length > 0) {
      console.log('🚨 Emergency backup details:', emergencyBackups);
    }
    
    console.log('📋 COMMANDS:');
    console.log('   • syncEmergencyAppointments() - Sync emergency backups to Firebase');
    console.log('   • clearAppointmentBackups() - Clear all local backups');
    console.log('   • testAppointmentSave() - Test appointment saving functionality');
    
    return {
      regularBackups: regularBackups.length,
      emergencyBackups: emergencyBackups.length,
      data: { regularBackups, emergencyBackups }
    };
  } catch (error) {
    console.error('❌ Error checking appointment backups:', error);
    return null;
  }
};

(window as any).syncEmergencyAppointments = async () => {
  try {
    const result = await syncEmergencyAppointments();
    console.log('✅ Manual sync completed:', result);
    return result;
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    return { synced: 0, failed: 0, errors: [error.message] };
  }
};

(window as any).clearAppointmentBackups = (confirmClear = false) => {
  if (!confirmClear) {
    console.log('⚠️ This will permanently delete all local appointment backups.');
    console.log('   Call clearAppointmentBackups(true) to confirm.');
    return;
  }
  
  try {
    localStorage.removeItem('clinic_appointments_backup');
    localStorage.removeItem('clinic_appointments_emergency');
    console.log('🧹 All appointment backups cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing backups:', error);
    return { success: false, error: error.message };
  }
};

(window as any).testAppointmentSave = async () => {
  try {
    console.log('🧪 Testing appointment save functionality...');
    
    // Test Firebase readiness
    const { firebaseManager } = await import('../api/firebaseOptimized');
    const isReady = firebaseManager.isReady();
    console.log(`🔥 Firebase ready: ${isReady}`);
    
    if (!isReady) {
      console.log('⏳ Waiting for Firebase initialization...');
      let attempts = 0;
      while (!firebaseManager.isReady() && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      console.log(`🔥 Firebase ready after wait: ${firebaseManager.isReady()}`);
    }
    
    // Test collection access
    try {
      const { AppointmentService } = await import('../services/AppointmentService');
      console.log('✅ AppointmentService imported successfully');
      
      // You can add more specific tests here
      console.log('🧪 Test completed - check console for any errors above');
      return { success: true, firebaseReady: firebaseManager.isReady() };
    } catch (serviceError) {
      console.error('❌ AppointmentService test failed:', serviceError);
      return { success: false, error: serviceError.message };
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

console.log('🔧 Appointment Backup Debug Commands Available:');
console.log('   • checkAppointmentBackups() - Check backup status');
console.log('   • syncEmergencyAppointments() - Manually sync emergency backups');
console.log('   • clearAppointmentBackups(true) - Clear all backups');
console.log('   • testAppointmentSave() - Test save functionality'); 

// ✅ NEW: Force sync appointments and payments
export const forceSyncAppointmentsAndPayments = async (clinicId: string): Promise<{
  appointmentsSynced: number;
  paymentsSynced: number;
  errors: string[];
}> => {
  try {
    console.log('🔄 Starting forced sync of appointments and payments...');
    
    let appointmentsSynced = 0;
    let paymentsSynced = 0;
    const errors: string[] = [];

    // Sync emergency appointment backups
    try {
      const appointmentResult = await syncEmergencyAppointments();
      appointmentsSynced = appointmentResult.synced;
      errors.push(...appointmentResult.errors);
    } catch (appointmentError) {
      errors.push(`Appointment sync failed: ${appointmentError}`);
    }

    // Sync emergency payment backups
    try {
      const emergencyPayments = JSON.parse(localStorage.getItem('clinic_payments_emergency') || '[]');
      
      for (const payment of emergencyPayments) {
        try {
          const { firebaseDataManager } = await import('../utils/firebaseDataManager');
          const dataManager = firebaseDataManager.initialize({ clinicId });
          await dataManager.createPayment(payment);
          paymentsSynced++;
          console.log(`✅ Synced emergency payment: ${payment.invoiceId}`);
        } catch (paymentError) {
          errors.push(`Failed to sync payment ${payment.invoiceId}: ${paymentError}`);
        }
      }
      
      if (paymentsSynced > 0) {
        localStorage.removeItem('clinic_payments_emergency');
        console.log(`🧹 Cleared ${paymentsSynced} emergency payments from localStorage`);
      }
    } catch (paymentSyncError) {
      errors.push(`Payment sync failed: ${paymentSyncError}`);
    }

    // Trigger UI refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('forceSyncCompleted', {
        detail: { appointmentsSynced, paymentsSynced, errors }
      }));
    }

    console.log(`✅ Forced sync completed: ${appointmentsSynced} appointments, ${paymentsSynced} payments`);
    return { appointmentsSynced, paymentsSynced, errors };
  } catch (error) {
    console.error('❌ Force sync failed:', error);
    return { appointmentsSynced: 0, paymentsSynced: 0, errors: [error.message] };
  }
};

// ✅ ENHANCED: Additional console commands for debugging
(window as any).forceSyncAll = async (clinicId = 'demo-clinic') => {
  try {
    const result = await forceSyncAppointmentsAndPayments(clinicId);
    console.log('✅ Force sync result:', result);
    
    if (result.appointmentsSynced > 0 || result.paymentsSynced > 0) {
      alert(`✅ Synced ${result.appointmentsSynced} appointments and ${result.paymentsSynced} payments`);
    } else if (result.errors.length > 0) {
      alert(`⚠️ Sync completed with errors:\n${result.errors.slice(0, 3).join('\n')}`);
    } else {
      alert('ℹ️ No data to sync');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Force sync failed:', error);
    alert('❌ Force sync failed: ' + error.message);
    return { appointmentsSynced: 0, paymentsSynced: 0, errors: [error.message] };
  }
};

(window as any).checkFirebaseConnection = async () => {
  try {
    console.log('🔍 Checking Firebase connection...');
    
    // Test Firebase readiness
    const { firebaseManager } = await import('../api/firebaseOptimized');
    const isReady = firebaseManager.isReady();
    console.log(`🔥 Firebase ready: ${isReady}`);
    
    if (!isReady) {
      console.log('⏳ Waiting for Firebase to initialize...');
      return { connected: false, error: 'Firebase not ready' };
    }
    
    // Test Firestore connection
    try {
      const { firebaseDataManager } = await import('../utils/firebaseDataManager');
      const dataManager = firebaseDataManager.initialize({ clinicId: 'demo-clinic' });
      
      // Try to read some data (this tests the connection)
      console.log('📊 Testing Firestore connection...');
      const testResult = await dataManager.getAppointments();
      console.log(`✅ Firestore connected - found ${testResult.length} appointments`);
      
      return { 
        connected: true, 
        appointmentCount: testResult.length,
        firebaseReady: isReady 
      };
    } catch (firestoreError) {
      console.error('❌ Firestore connection failed:', firestoreError);
      return { 
        connected: false, 
        error: firestoreError.message,
        firebaseReady: isReady 
      };
    }
  } catch (error) {
    console.error('❌ Firebase connection check failed:', error);
    return { connected: false, error: error.message };
  }
};

console.log('🔧 Enhanced Debug Commands Available:');
console.log('   • forceSyncAll(clinicId) - Force sync all appointments and payments');
console.log('   • checkFirebaseConnection() - Test Firebase and Firestore connection');
console.log('   • checkAppointmentBackups() - Check local backup status'); 

// ✅ NEW: Comprehensive test for appointment and payment saving
(window as any).testAppointmentAndPaymentFlow = async (clinicId = 'demo-clinic') => {
  try {
    console.log('🧪 Testing complete appointment and payment flow...');
    
    const testData = {
      patientName: 'Test Patient ' + Date.now(),
      patientPhone: '+1234567890',
      doctorName: 'Dr. Test',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      type: 'consultation',
      duration: 30,
      location: 'Room 1',
      priority: 'normal' as const,
      notes: 'Test appointment for debugging',
      clinicId: clinicId
    };

    console.log('📝 Test data:', testData);

    // Test 1: Check Firebase connection
    console.log('1️⃣ Testing Firebase connection...');
    const connectionTest = await (window as any).checkFirebaseConnection();
    if (!connectionTest.connected) {
      throw new Error(`Firebase connection failed: ${connectionTest.error}`);
    }
    console.log('✅ Firebase connected successfully');

    // Test 2: Create appointment via API
    console.log('2️⃣ Testing appointment creation via API...');
    const { createAppointment } = await import('../api/appointments');
    const createdAppointment = await createAppointment(testData);
    console.log('✅ Appointment created via API:', createdAppointment.id);

    // Test 3: Verify appointment appears in Firebase
    console.log('3️⃣ Verifying appointment in Firebase...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for Firebase sync
    
    const { firebaseDataManager } = await import('../utils/firebaseDataManager');
    const dataManager = firebaseDataManager.initialize({ clinicId });
    const firebaseAppointments = await dataManager.getAppointments();
    
    const foundAppointment = firebaseAppointments.find(apt => apt.id === createdAppointment.id);
    if (!foundAppointment) {
      throw new Error('Appointment not found in Firebase after creation');
    }
    console.log('✅ Appointment verified in Firebase:', foundAppointment.id);

    // Test 4: Verify payment was created
    console.log('4️⃣ Verifying payment creation...');
    const firebasePayments = await dataManager.getPayments();
    const foundPayment = firebasePayments.find(payment => payment.appointmentId === createdAppointment.id);
    
    if (!foundPayment) {
      console.warn('⚠️ Payment not found in Firebase - this might be expected if payment creation is async');
    } else {
      console.log('✅ Payment verified in Firebase:', foundPayment.invoiceId);
    }

    // Test 5: Test payment status update
    console.log('5️⃣ Testing payment status update...');
    try {
      await dataManager.syncAppointmentPaymentStatus(createdAppointment.id, 'paid');
      console.log('✅ Payment status updated successfully');
    } catch (paymentUpdateError) {
      console.warn('⚠️ Payment status update failed:', paymentUpdateError);
    }

    // Test summary
    const summary = {
      appointmentCreated: !!createdAppointment.id,
      appointmentInFirebase: !!foundAppointment,
      paymentCreated: !!foundPayment,
      clinicId: foundAppointment?.clinicId,
      appointmentId: createdAppointment.id,
      paymentId: foundPayment?.id,
      testCompleted: true
    };

    console.log('🎉 Test completed successfully!');
    console.log('📊 Test Summary:', summary);
    
    alert(`🎉 Test Passed!\n\n✅ Appointment created: ${createdAppointment.id}\n✅ Saved to Firebase: ${foundAppointment ? 'Yes' : 'No'}\n✅ Payment created: ${foundPayment ? 'Yes' : 'Pending'}\n✅ ClinicId: ${foundAppointment?.clinicId}`);
    
    return summary;
  } catch (error) {
    console.error('❌ Test failed:', error);
    alert(`❌ Test Failed: ${error.message}`);
    return { 
      testCompleted: false, 
      error: error.message,
      appointmentCreated: false,
      appointmentInFirebase: false,
      paymentCreated: false
    };
  }
};

console.log('🧪 TESTING COMMANDS:');
console.log('   • testAppointmentAndPaymentFlow(clinicId) - Complete flow test'); 

// ✅ NEW: Validate and clean appointment data before Firebase operations
export const validateAndCleanAppointmentData = (appointmentData: any): any => {
  const cleaned = {
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
    patient: appointmentData.patient || '',
    doctor: appointmentData.doctor || 'Unknown Doctor',
    date: appointmentData.date || new Date().toISOString().split('T')[0],
    isActive: appointmentData.isActive !== undefined ? appointmentData.isActive : true,
    completed: appointmentData.completed !== undefined ? appointmentData.completed : false,
    reminderSent: appointmentData.reminderSent !== undefined ? appointmentData.reminderSent : false,
    followUpRequired: appointmentData.followUpRequired !== undefined ? appointmentData.followUpRequired : false
  };
  
  // Remove any undefined values
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      console.warn(`⚠️ Removing undefined field: ${key}`);
      delete cleaned[key];
    }
  });
  
  console.log('✅ Appointment data validated and cleaned:', cleaned);
  return cleaned;
}; 

// ✅ NEW: Debug appointment validation
(window as any).debugAppointmentValidation = (testData = {}) => {
  console.log('🧪 Testing appointment data validation...');
  
  const testAppointment = {
    patient: testData.patient,
    doctor: testData.doctor,
    date: testData.date,
    time: testData.time,
    duration: testData.duration, // This might be undefined
    type: testData.type,
    priority: testData.priority,
    ...testData
  };
  
  console.log('📝 Original test data (with potential undefined values):', testAppointment);
  
  const cleaned = validateAndCleanAppointmentData(testAppointment);
  console.log('✅ Cleaned and validated data:', cleaned);
  
  // Check for any remaining undefined values
  const undefinedFields = Object.keys(cleaned).filter(key => cleaned[key] === undefined);
  if (undefinedFields.length > 0) {
    console.error('❌ Still has undefined fields:', undefinedFields);
  } else {
    console.log('✅ No undefined values found - data is clean!');
  }
  
  return { original: testAppointment, cleaned, undefinedFields };
};

console.log('🧪 VALIDATION COMMANDS:');
console.log('   • debugAppointmentValidation(data) - Test appointment data cleaning'); 