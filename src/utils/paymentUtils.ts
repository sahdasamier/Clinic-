import { 
  PaymentData, 
  defaultClinicPaymentSettings, 
  ClinicPaymentSettings,
  AppointmentTypeSettings,
  defaultVATSettings,
  VATSettings 
} from '../data/mockData';

// Storage keys
const PAYMENTS_STORAGE_KEY = 'clinic_payments_data';
const CLINIC_SETTINGS_KEY = 'clinic_payment_settings';
const VAT_SETTINGS_KEY = 'clinic_vat_settings';

// Load clinic payment settings
export const loadClinicPaymentSettings = (): ClinicPaymentSettings => {
  try {
    const stored = localStorage.getItem(CLINIC_SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return { ...defaultClinicPaymentSettings, ...settings };
    }
  } catch (error) {
    console.warn('Error loading clinic payment settings:', error);
  }
  return defaultClinicPaymentSettings;
};

// Save clinic payment settings
export const saveClinicPaymentSettings = (settings: ClinicPaymentSettings) => {
  try {
    localStorage.setItem(CLINIC_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Error saving clinic payment settings:', error);
  }
};

// Load VAT settings
export const loadVATSettings = (): VATSettings => {
  try {
    const stored = localStorage.getItem(VAT_SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return { ...defaultVATSettings, ...settings };
    }
  } catch (error) {
    console.warn('Error loading VAT settings:', error);
  }
  return defaultVATSettings;
};

// Load payments from storage
export const loadPaymentsFromStorage = (): PaymentData[] => {
  try {
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (stored) {
      const payments = JSON.parse(stored);
      return Array.isArray(payments) ? payments : [];
    }
  } catch (error) {
    console.warn('Error loading payments from storage:', error);
  }
  return [];
};

// Save payments to storage
export const savePaymentsToStorage = (payments: PaymentData[]) => {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    // Dispatch event for other components to sync
    window.dispatchEvent(new CustomEvent('paymentsUpdated', { 
      detail: { payments } 
    }));
  } catch (error) {
    console.warn('Error saving payments to storage:', error);
  }
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
}

export const createAutoPaymentForAppointment = (params: CreateAutoPaymentParams): PaymentData | null => {
  try {
    const clinicSettings = loadClinicPaymentSettings();
    
    // Check if auto-payment creation is enabled
    if (!clinicSettings.autoCreatePaymentOnCompletion) {
      console.log('Auto-payment creation is disabled in clinic settings');
      return null;
    }

    // Get appointment type settings
    const typeSettings = getAppointmentTypeSettings(params.appointmentType);
    if (!typeSettings && !params.customAmount) {
      console.warn(`No cost settings found for appointment type: ${params.appointmentType}`);
      return null;
    }

    // Calculate amounts
    const baseAmount = params.customAmount || typeSettings?.cost || 0;
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

    // Create payment record
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
      status: 'pending',
      method: clinicSettings.defaultPaymentMethod,
      description: `${params.appointmentType} appointment with Dr. ${params.doctorName} (Auto-generated)`,
      category: typeSettings?.category || params.appointmentType.toLowerCase(),
      insurance: 'No',
      insuranceAmount: 0,
      paidAmount: 0,
      includeVAT: includeVAT,
      vatRate: includeVAT ? vatSettings.rate : 0,
      vatAmount: vatAmount,
      totalAmountWithVAT: totalAmount,
      baseAmount: baseAmount
    };

    // Save payment
    const updatedPayments = [...existingPayments, newPayment];
    savePaymentsToStorage(updatedPayments);

    console.log(`✅ Auto-payment created for appointment ${params.appointmentId}:`, newPayment);
    return newPayment;

  } catch (error) {
    console.error('Error creating auto-payment for appointment:', error);
    return null;
  }
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