/**
 * Application Constants
 * Static configuration data for the clinic application
 */

// Time configuration
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

export const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

// Alias for compatibility
export const daysOfWeek = DAYS_OF_WEEK;

// Medical specialties
export const MEDICAL_SPECIALTIES = [
  { value: 'General Medicine', key: 'general_medicine' },
  { value: 'Cardiology', key: 'cardiology' },
  { value: 'Pediatrics', key: 'pediatrics' },
  { value: 'Dermatology', key: 'dermatology' },
  { value: 'Orthopedics', key: 'orthopedics' },
  { value: 'Neurology', key: 'neurology' },
  { value: 'Gastroenterology', key: 'gastroenterology' },
  { value: 'Ophthalmology', key: 'ophthalmology' },
  { value: 'ENT', key: 'ent' },
  { value: 'Psychiatry', key: 'psychiatry' },
  { value: 'Other', key: 'other' },
];

// Appointment types
export const APPOINTMENT_TYPES = [
  { value: 'consultation', key: 'consultation' },
  { value: 'follow-up', key: 'follow_up' },
  { value: 'emergency', key: 'emergency' },
  { value: 'routine-checkup', key: 'routine_checkup' },
  { value: 'specialist-referral', key: 'specialist_referral' },
];

// Payment methods
export const PAYMENT_METHODS = [
  'Credit Card',
  'Cash',
  'Bank Transfer',
  'Insurance',
  'Check',
  'Online Payment'
];

// Payment statuses
export const PAYMENT_STATUSES = [
  { value: 'paid', key: 'paid' },
  { value: 'pending', key: 'pending' },
  { value: 'overdue', key: 'overdue' },
  { value: 'partial', key: 'partial' },
];

// Patient statuses
export const PATIENT_STATUSES = [
  { value: 'new', key: 'new' },
  { value: 'old', key: 'old' },
  { value: 'follow-up', key: 'follow_up' },
  { value: 'discharged', key: 'discharged' },
];

// Blood types
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Gender options
export const GENDER_OPTIONS = [
  { value: 'Male', key: 'male' },
  { value: 'Female', key: 'female' },
];

// Priority levels
export const PRIORITY_LEVELS = [
  { value: 'normal', key: 'normal' },
  { value: 'high', key: 'high' },
  { value: 'urgent', key: 'urgent' },
];

// Payment categories
export const PAYMENT_CATEGORIES = [
  'consultation',
  'checkup', 
  'surgery',
  'emergency',
  'followup',
  'medication',
  'diagnostic',
  'therapy'
];

// Common medical conditions
export const COMMON_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Arthritis',
  'Depression',
  'Anxiety',
  'Migraine',
  'Back Pain',
  'Routine Checkup',
];

// Common medications (for quick selection)
export const COMMON_MEDICATIONS = [
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
  { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
  { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily' },
  { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' },
  { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' },
];

// VAT rate options for different countries
export const VAT_RATE_OPTIONS = [
  { label: 'Egypt (14%)', value: 14 },
  { label: 'UAE (5%)', value: 5 },
  { label: 'Saudi Arabia (15%)', value: 15 },
  { label: 'Jordan (16%)', value: 16 },
  { label: 'Kuwait (0%)', value: 0 },
  { label: 'Custom Rate', value: 0 },
];

// Storage keys for local storage
export const STORAGE_KEYS = {
  NOTIFICATIONS: 'clinic_notifications_data',
  APPOINTMENTS: 'clinic_appointments_data',
  PAYMENTS: 'clinic_payments_data', 
  PATIENTS: 'clinic_patients_data',
  INVENTORY: 'clinic_laboratoryRadiology_data',
  SETTINGS: 'clinic_notification_settings',
  EMPLOYEES: 'clinic_employees_data',
  BUSINESS_EXPENSES: 'clinic_business_expenses_data',
  VAT_ADJUSTMENTS: 'clinic_vat_adjustments',
  EXPENSE_CATEGORIES: 'clinic_expense_categories',
  CLINIC_SETTINGS: 'clinic_payment_settings',
  VAT_SETTINGS: 'clinic_vat_settings'
};

// Default form values
export const DEFAULT_FORMS = {
  DOCTOR: {
    name: '',
    specialty: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    offDays: [] as string[],
    consultationDuration: 30,
    maxPatientsPerHour: 2,
  },
  PATIENT: {
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    condition: '',
    status: 'new',
    doctor: '',
    doctorId: '',
    doctorName: ''
  },
  APPOINTMENT: {
    date: '',
    time: '',
    doctor: '',
    type: 'Follow-up',
    duration: '30',
    notes: '',
    priority: 'Normal'
  },
  INVOICE: {
    patient: '',
    doctor: '',
    appointmentId: '',
    amount: '',
    category: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    method: '',
    insuranceAmount: '',
    includeVAT: false,
    vatRate: 14,
  }
};

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: '1', name: 'Salaries & Benefits', description: 'Employee salaries and benefits', color: '#2196F3', icon: '👥', vatApplicable: false },
  { id: '2', name: 'Rent & Utilities', description: 'Office rent, electricity, water', color: '#FF9800', icon: '🏢', vatApplicable: true },
  { id: '3', name: 'Medical Supplies', description: 'Medical equipment and supplies', color: '#4CAF50', icon: '🏥', vatApplicable: true },
  { id: '4', name: 'Office Supplies', description: 'Office equipment and supplies', color: '#9C27B0', icon: '📋', vatApplicable: true },
  { id: '5', name: 'Marketing', description: 'Advertising and marketing expenses', color: '#E91E63', icon: '📢', vatApplicable: true },
  { id: '6', name: 'Professional Services', description: 'Legal, accounting, consulting', color: '#607D8B', icon: '⚖️', vatApplicable: true },
  { id: '7', name: 'Technology', description: 'Software, hardware, IT services', color: '#795548', icon: '💻', vatApplicable: true },
  { id: '8', name: 'Insurance', description: 'Business insurance premiums', color: '#3F51B5', icon: '🛡️', vatApplicable: false },
  { id: '9', name: 'Training & Development', description: 'Staff training and development', color: '#009688', icon: '📚', vatApplicable: true },
  { id: '10', name: 'Maintenance', description: 'Equipment and facility maintenance', color: '#FFC107', icon: '🔧', vatApplicable: true },
];