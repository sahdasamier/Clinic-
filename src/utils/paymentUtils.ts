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
      
      // Auto-determine status based on paid amount
      if (paidAmount >= payment.amount) {
        payment.status = 'paid';
      } else if (paidAmount > 0) {
        payment.status = 'partial';
      }
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

// ✅ Create payment with appointment linking
export const createPayment = (paymentData: Omit<PaymentData, 'id' | 'invoiceId'>): PaymentData => {
  try {
    const payments = loadPaymentsFromStorage();
    
    // Generate new ID and invoice ID
    const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    const invoiceId = `INV-${Date.now()}-${newId}`;
    
    const newPayment: PaymentData = {
      ...paymentData,
      id: newId,
      invoiceId,
      patientAvatar: paymentData.patient.split(' ').map(n => n[0]).join('').toUpperCase() || 'UP'
    };
    
    // Add to payments array
    const updatedPayments = [...payments, newPayment];
    savePaymentsToStorage(updatedPayments);
    
    console.log(`✅ Created payment ${invoiceId} for ${paymentData.patient}`);
    
    // ✅ SYNC: Link to appointment if provided
    if (paymentData.appointmentId) {
      updateAppointmentPaymentStatusInPayments(paymentData.appointmentId, newPayment.status);
    }
    
    return newPayment;
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