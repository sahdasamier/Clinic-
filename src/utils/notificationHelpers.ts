import { addNewItemToStorage, markAsRecentlyUpdated } from '../api/notifications';

// Storage keys (matching the ones in notifications.ts)
export const STORAGE_KEYS = {
  NOTIFICATIONS: 'clinic_notifications_data',
  APPOINTMENTS: 'clinic_appointments_data',
  PAYMENTS: 'clinic_payments_data', 
  PATIENTS: 'clinic_patients_data',
  INVENTORY: 'clinic_inventory_data',
  SETTINGS: 'clinic_notification_settings'
};

// Helper functions for adding items with proper notification timestamps

export const addNewPatient = (patientData: any) => {
  const patient = addNewItemToStorage(STORAGE_KEYS.PATIENTS, {
    ...patientData,
    status: 'new' // Ensure new patients are marked as 'new' for notifications
  });
  
  console.log('New patient added:', patient);
  return patient;
};

export const addNewPayment = (paymentData: any) => {
  const payment = addNewItemToStorage(STORAGE_KEYS.PAYMENTS, {
    ...paymentData,
    // Ensure current date if not provided
    date: paymentData.date || new Date().toISOString().split('T')[0]
  });
  
  console.log('New payment added:', payment);
  return payment;
};

export const addNewAppointment = (appointmentData: any) => {
  const appointment = addNewItemToStorage(STORAGE_KEYS.APPOINTMENTS, {
    ...appointmentData,
    status: appointmentData.status || 'confirmed'
  });
  
  console.log('New appointment added:', appointment);
  return appointment;
};

// Helper functions for updating existing items - REMOVED localStorage operations

export const markPaymentAsPaid = (paymentId: string | number) => {
  markAsRecentlyUpdated(STORAGE_KEYS.PAYMENTS, paymentId);
  
  // Note: Payment status updates should be handled by the calling component's state
  // No longer automatically updating localStorage - component manages its own state
  console.log(`Payment ${paymentId} marked as paid - state should be updated by calling component`);
};

export const updateAppointmentStatus = (appointmentId: string | number, status: string) => {
  markAsRecentlyUpdated(STORAGE_KEYS.APPOINTMENTS, appointmentId);
  
  // Note: Appointment status updates should be handled by the calling component's state
  // No longer automatically updating localStorage - component manages its own state
  console.log(`Appointment ${appointmentId} status updated to ${status} - state should be updated by calling component`);
};

export const updatePatientStatus = (patientId: string | number, status: string) => {
  markAsRecentlyUpdated(STORAGE_KEYS.PATIENTS, patientId);
  
  // Note: Patient status updates should be handled by the calling component's state
  // No longer automatically updating localStorage - component manages its own state
  console.log(`Patient ${patientId} status updated to ${status} - state should be updated by calling component`);
};

// Example usage:
/*
// When adding a new patient:
const newPatient = addNewPatient({
  name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com'
});

// When adding a new payment:
const newPayment = addNewPayment({
  patient: 'John Doe',
  amount: 150.00,
  invoiceId: 'INV-2024-123',
  status: 'paid',
  method: 'Credit Card'
});

// When marking an existing payment as paid:
markPaymentAsPaid(2);

// When updating appointment status:
updateAppointmentStatus(3, 'cancelled');
*/ 