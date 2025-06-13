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

// Helper functions for updating existing items

export const markPaymentAsPaid = (paymentId: string | number) => {
  markAsRecentlyUpdated(STORAGE_KEYS.PAYMENTS, paymentId);
  
  // Update the payment status
  const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
  const updatedPayments = payments.map((payment: any) => 
    payment.id === paymentId 
      ? { ...payment, status: 'paid', updatedAt: new Date().toISOString() }
      : payment
  );
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedPayments));
  
  console.log(`Payment ${paymentId} marked as paid`);
};

export const updateAppointmentStatus = (appointmentId: string | number, status: string) => {
  markAsRecentlyUpdated(STORAGE_KEYS.APPOINTMENTS, appointmentId);
  
  // Update the appointment status
  const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  const updatedAppointments = appointments.map((appointment: any) => 
    appointment.id === appointmentId 
      ? { ...appointment, status, updatedAt: new Date().toISOString() }
      : appointment
  );
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
  
  console.log(`Appointment ${appointmentId} status updated to ${status}`);
};

export const updatePatientStatus = (patientId: string | number, status: string) => {
  markAsRecentlyUpdated(STORAGE_KEYS.PATIENTS, patientId);
  
  // Update the patient status
  const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
  const updatedPatients = patients.map((patient: any) => 
    patient.id === patientId 
      ? { ...patient, status, updatedAt: new Date().toISOString() }
      : patient
  );
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));
  
  console.log(`Patient ${patientId} status updated to ${status}`);
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