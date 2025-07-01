import { 
  PaymentData, 
  defaultClinicPaymentSettings, 
  ClinicPaymentSettings,
  AppointmentTypeSettings,
  defaultVATSettings,
  VATSettings 
} from '../data/mockData';
import { PaymentNotificationService } from '../services/paymentNotificationService';


// Storage keys
const PAYMENTS_STORAGE_KEY = 'clinic_payments_data';
const CLINIC_SETTINGS_KEY = 'clinic_payment_settings';
const VAT_SETTINGS_KEY = 'clinic_vat_settings';

// ✅ NEW: In-memory payment storage to replace localStorage
let inMemoryPayments: PaymentData[] = [];

// Initialize in-memory payments with defaults if empty
const initializeInMemoryPayments = () => {
  if (inMemoryPayments.length === 0) {
    // Import and use generateDefaultPayments if available
    try {
      const { generateDefaultPayments } = require('../data/mockData');
      inMemoryPayments = generateDefaultPayments();
      console.log('✅ Initialized in-memory payments with defaults:', inMemoryPayments.length);
    } catch (error) {
      console.log('⚠️ Could not load default payments, starting with empty array');
      inMemoryPayments = [];
    }
  }
};

// Load clinic payment settings - UPDATED: No localStorage, using defaults
export const loadClinicPaymentSettings = (): ClinicPaymentSettings => {
  console.warn('⚠️ loadClinicPaymentSettings: localStorage persistence disabled - using defaults');
  return defaultClinicPaymentSettings;
};

// Save clinic payment settings - DEPRECATED: No localStorage persistence
export const saveClinicPaymentSettings = (settings: ClinicPaymentSettings) => {
  console.warn('⚠️ saveClinicPaymentSettings: localStorage persistence disabled');
  console.log('Clinic payment settings received (not persisted):', settings);
};

// Load VAT settings - UPDATED: No localStorage, using defaults
export const loadVATSettings = (): VATSettings => {
  console.warn('⚠️ loadVATSettings: localStorage persistence disabled - using defaults');
  return defaultVATSettings;
};

// ✅ UPDATED: Load payments from in-memory storage
export const loadPaymentsFromStorage = (): PaymentData[] => {
  initializeInMemoryPayments();
  console.log(`✅ loadPaymentsFromStorage: Returning ${inMemoryPayments.length} in-memory payments`);
  return [...inMemoryPayments]; // Return a copy to prevent direct mutation
};

// ✅ UPDATED: Save payments to in-memory storage
export const savePaymentsToStorage = (payments: PaymentData[]) => {
  inMemoryPayments = [...payments]; // Store a copy
  console.log(`✅ savePaymentsToStorage: Saved ${payments.length} payments to in-memory storage`);
  
  // Dispatch event for other components to sync
  window.dispatchEvent(new CustomEvent('paymentsUpdated', { 
    detail: { payments: [...payments] } 
  }));
};

// ✅ NEW: Reset in-memory payments to defaults
export const resetPaymentsToDefaults = (): PaymentData[] => {
  try {
    const { generateDefaultPayments } = require('../data/mockData');
    inMemoryPayments = generateDefaultPayments();
    console.log('✅ Reset in-memory payments to defaults:', inMemoryPayments.length);
  } catch (error) {
    console.log('⚠️ Could not load default payments, resetting to empty array');
    inMemoryPayments = [];
  }
  
  // Dispatch event for components to sync
  window.dispatchEvent(new CustomEvent('paymentsUpdated', { 
    detail: { payments: [...inMemoryPayments] } 
  }));
  
  return [...inMemoryPayments];
};

// ✅ NEW: Clear all in-memory payments
export const clearAllPayments = (): void => {
  inMemoryPayments = [];
  console.log('✅ Cleared all in-memory payments');
  
  // Dispatch event for components to sync
  window.dispatchEvent(new CustomEvent('paymentsUpdated', { 
    detail: { payments: [] } 
  }));
};

// ✅ NEW: Get current in-memory payments count for debugging
export const getInMemoryPaymentsDebugInfo = () => {
  return {
    count: inMemoryPayments.length,
    payments: [...inMemoryPayments],
    summary: inMemoryPayments.map(p => ({
      id: p.id,
      patient: p.patient,
      amount: `${p.amount} ${p.currency}`,
      status: p.status,
      invoiceId: p.invoiceId
    }))
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

// Get appointment type settings
export const getAppointmentTypeSettings = (appointmentType: string): AppointmentTypeSettings | null => {
  const clinicSettings = loadClinicPaymentSettings();
  return clinicSettings.appointmentTypes.find(
    type => type.type.toLowerCase() === appointmentType.toLowerCase()
  ) || null;
};

// Create auto-payment for completed appointment
export interface CreateAutoPaymentParams {
  appointmentId: number;
  patientName: string;
  patientAvatar: string;
  doctorName: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentDuration: number;
  customAmount?: number; // Optional override amount
  isCompleted?: boolean; // Whether appointment is already completed
}

export const createAutoPaymentForAppointment = (params: CreateAutoPaymentParams): PaymentData | null => {
  try {
    const clinicSettings = loadClinicPaymentSettings();
    
    // For completed appointments, always create payment (override settings)
    if (!params.isCompleted && !clinicSettings.autoCreatePaymentOnCompletion) {
      console.log('Auto-payment creation is disabled in clinic settings');
      return null;
    }

    // Get appointment type settings
    const typeSettings = getAppointmentTypeSettings(params.appointmentType);
    if (!typeSettings && !params.customAmount) {
      console.warn(`No cost settings found for appointment type: ${params.appointmentType}`);
      // For completed appointments, use default amount if no settings found
      if (params.isCompleted) {
        console.log('Using default amount for completed appointment');
      } else {
        return null;
      }
    }

    // Calculate amounts
    const baseAmount = params.customAmount || typeSettings?.cost || (params.isCompleted ? 200 : 0); // Default to 200 EGP for completed appointments
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

    // Load existing payments to get next ID
    const existingPayments = loadPaymentsFromStorage();
    const nextId = existingPayments.length > 0 ? Math.max(...existingPayments.map(p => p.id)) + 1 : 1;

    // Create payment record - if appointment is completed, mark as paid
    const paymentStatus = params.isCompleted ? 'paid' : 'pending';
    
    const newPayment: PaymentData = {
      id: nextId,
      invoiceId: generateInvoiceId(),
      patient: params.patientName,
      patientAvatar: params.patientAvatar,
      doctor: params.doctorName,
      appointmentId: params.appointmentId.toString(),
      amount: totalAmount,
      currency: typeSettings?.currency || 'EGP',
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: paymentStatus,
      method: clinicSettings.defaultPaymentMethod,
      description: `${params.appointmentType} appointment with Dr. ${params.doctorName} ${params.isCompleted ? '(Completed - Auto-paid)' : '(Auto-generated)'}`,
      category: typeSettings?.category || params.appointmentType.toLowerCase(),
      insurance: 'No',
      insuranceAmount: 0,
      paidAmount: params.isCompleted ? totalAmount : 0, // Full amount paid if completed
      includeVAT: includeVAT,
      vatRate: includeVAT ? vatSettings.rate : 0,
      vatAmount: vatAmount,
      totalAmountWithVAT: totalAmount,
      baseAmount: baseAmount
    };

    // Save payment
    const updatedPayments = [...existingPayments, newPayment];
    savePaymentsToStorage(updatedPayments);

    console.log(`✅ Auto-payment created for appointment ${params.appointmentId} (${paymentStatus}):`, newPayment);
    
    // Send notification if payment is marked as paid
    if (params.isCompleted) {
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
    console.error('Error creating auto-payment for appointment:', error);
    return null;
  }
};

// Create paid payment for completed appointment
export const createPaidPaymentForCompletedAppointment = async (params: CreateAutoPaymentParams): Promise<PaymentData | null> => {
  return createAutoPaymentForAppointment({ ...params, isCompleted: true });
};

// Update appointment payment status
export const updateAppointmentPaymentStatusInPayments = (appointmentId: number, paymentStatus: string) => {
  try {
    const payments = loadPaymentsFromStorage();
    const updatedPayments = payments.map(payment => 
      payment.appointmentId === appointmentId.toString()
        ? { ...payment, status: paymentStatus as any }
        : payment
    );
    savePaymentsToStorage(updatedPayments);
  } catch (error) {
    console.error('Error updating appointment payment status in payments:', error);
  }
};

// Get appointment payment summary
export const getAppointmentPaymentSummary = (appointmentId: number) => {
  try {
    const payments = loadPaymentsFromStorage();
    const appointmentPayments = payments.filter(p => p.appointmentId === appointmentId.toString());
    
    if (appointmentPayments.length === 0) {
      return { hasPayment: false, totalAmount: 0, totalPaid: 0, status: 'no-payment' };
    }

    const totalAmount = appointmentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = appointmentPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    
    let status = 'pending';
    if (totalPaid >= totalAmount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    return {
      hasPayment: true,
      payments: appointmentPayments,
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

// Update payment status with notifications
export const updatePaymentStatus = async (paymentId: number, newStatus: string, paidAmount?: number): Promise<boolean> => {
  try {
    console.log(`🔧 updatePaymentStatus: Starting update for payment ${paymentId} to status ${newStatus}`);
    
    const payments = loadPaymentsFromStorage();
    console.log(`🔧 updatePaymentStatus: Loaded ${payments.length} payments from storage`);
    
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      console.error(`❌ updatePaymentStatus: Payment ${paymentId} not found in ${payments.length} payments`);
      return false;
    }
    
    const oldPayment = payments[paymentIndex];
    const oldStatus = oldPayment.status;
    console.log(`🔧 updatePaymentStatus: Found payment ${oldPayment.invoiceId} with current status: ${oldStatus}`);
    
    // ✅ Calculate proper paid amount when marking as paid
    let actualPaidAmount = paidAmount;
    if (newStatus === 'paid' && !paidAmount) {
      // If marking as paid without specific amount, use full amount
      actualPaidAmount = oldPayment.amount;
      console.log(`🔧 updatePaymentStatus: Setting paid amount to full amount: ${actualPaidAmount}`);
    } else if (newStatus === 'pending' || newStatus === 'overdue') {
      // If marking as pending/overdue, reset paid amount to 0
      actualPaidAmount = 0;
      console.log(`🔧 updatePaymentStatus: Resetting paid amount to 0 for ${newStatus} status`);
    }
    
    // Update payment
    const updatedPayment = {
      ...oldPayment,
      status: newStatus as any,
      paidAmount: actualPaidAmount ?? oldPayment.paidAmount
    };
    
    console.log(`🔧 updatePaymentStatus: Updated payment object:`, {
      id: updatedPayment.id,
      invoiceId: updatedPayment.invoiceId,
      oldStatus: oldStatus,
      newStatus: updatedPayment.status,
      amount: updatedPayment.amount,
      paidAmount: updatedPayment.paidAmount
    });
    
    // ✅ CRITICAL: Update the array and save immediately
    payments[paymentIndex] = updatedPayment;
    console.log(`🔧 updatePaymentStatus: Updated payment in array at index ${paymentIndex}`);
    
    // ✅ CRITICAL: Force save to in-memory storage
    savePaymentsToStorage(payments);
    console.log(`🔧 updatePaymentStatus: Saved ${payments.length} payments to storage`);
    
    // ✅ VERIFICATION: Load back from storage to verify the update
    const verificationPayments = loadPaymentsFromStorage();
    const verificationPayment = verificationPayments.find(p => p.id === paymentId);
    console.log(`🔧 updatePaymentStatus: Verification - payment status in storage: ${verificationPayment?.status}`);
    
    // ✅ NEW: Trigger revenue calculation update
    console.log(`💰 Payment status changed: ${oldStatus} → ${newStatus}, triggering revenue update`);
    window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
      detail: {
        paymentId: paymentId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        payment: updatedPayment,
        revenueImpact: newStatus === 'paid' ? updatedPayment.amount : (oldStatus === 'paid' ? -updatedPayment.amount : 0)
      }
    }));
    
    // ✅ CRITICAL: Force a paymentsUpdated event for immediate UI refresh
    window.dispatchEvent(new CustomEvent('paymentsUpdated', { 
      detail: { 
        payments: [...payments],
        updatedPaymentId: paymentId,
        oldStatus: oldStatus,
        newStatus: newStatus
      } 
    }));
    console.log(`🔧 updatePaymentStatus: Dispatched paymentsUpdated event for UI refresh`);
    
    // Send notification if payment was just marked as paid
    if (oldStatus !== 'paid' && newStatus === 'paid') {
      const notificationService = PaymentNotificationService.getInstance();
      await notificationService.notifyPaymentCompleted({
        patientName: updatedPayment.patient,
        amount: updatedPayment.amount,
        paymentId: updatedPayment.invoiceId,
        method: updatedPayment.method
      });
      
      console.log(`✅ Payment ${updatedPayment.invoiceId} marked as paid - notification sent`);
    }
    
    // ✅ NEW: Update appointment payment status if linked (with cross-page sync)
    if (updatedPayment.appointmentId) {
      updateAppointmentPaymentStatusInPayments(parseInt(updatedPayment.appointmentId), newStatus);
      
      // Trigger appointment payment status sync event
      window.dispatchEvent(new CustomEvent('appointmentPaymentStatusSynced', {
        detail: {
          appointmentId: updatedPayment.appointmentId,
          patient: updatedPayment.patient,
          oldStatus: oldStatus,
          newStatus: newStatus,
          paymentId: updatedPayment.invoiceId,
          amount: updatedPayment.amount
        }
      }));
    }
    
    console.log(`✅ updatePaymentStatus: Successfully updated payment ${paymentId} from ${oldStatus} to ${newStatus}`);
    return true;
  } catch (error) {
    console.error('❌ updatePaymentStatus: Error updating payment status:', error);
    return false;
  }
};

// Mark payment as paid (convenience function)
export const markPaymentAsPaid = async (paymentId: number, paidAmount?: number): Promise<boolean> => {
  return await updatePaymentStatus(paymentId, 'paid', paidAmount);
};

// Create new payment with notification
export const createPayment = async (paymentData: Omit<PaymentData, 'id' | 'invoiceId'>): Promise<PaymentData | null> => {
  try {
    const existingPayments = loadPaymentsFromStorage();
    const nextId = existingPayments.length > 0 ? Math.max(...existingPayments.map(p => p.id)) + 1 : 1;
    
    const newPayment: PaymentData = {
      ...paymentData,
      id: nextId,
      invoiceId: generateInvoiceId()
    };
    
    const updatedPayments = [...existingPayments, newPayment];
    savePaymentsToStorage(updatedPayments);
    
    console.log(`✅ New payment created: ${newPayment.invoiceId}`);
    
    // If payment is already marked as paid, send notification
    if (newPayment.status === 'paid') {
      const notificationService = PaymentNotificationService.getInstance();
      await notificationService.notifyPaymentCompleted({
        patientName: newPayment.patient,
        amount: newPayment.amount,
        paymentId: newPayment.invoiceId,
        method: newPayment.method
      });
    }
    
    return newPayment;
  } catch (error) {
    console.error('Error creating payment:', error);
    return null;
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
    const clinicSettings = loadClinicPaymentSettings();
    
    // Get appointment type settings
    const typeSettings = getAppointmentTypeSettings(appointment.type);
    
    // Calculate amounts - use default amount if no settings found
    const baseAmount = typeSettings?.cost || 200; // Default to 200 EGP
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
    const vatSettings = loadVATSettings();
    
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
    
    const result = await updatePaymentStatus(paymentId, newStatus);
    
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