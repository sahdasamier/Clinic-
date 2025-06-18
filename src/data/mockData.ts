// Mock data for the clinic application

// Days of the week
export const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Available time slots
export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

// Base doctor schedules data - Minimal for clean deployment
export const baseDoctorSchedules = [
  {
    id: 1,
    name: 'Dr. Default',
    avatar: 'DD',
    specialty: 'general_medicine',
    workingHours: { start: '09:00', end: '17:00' },
    offDays: ['friday', 'saturday'],
    maxPatientsPerHour: 3,
    consultationDuration: 30,
  }
];

// Medical specialties
export const medicalSpecialties = [
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
export const appointmentTypes = [
  { value: 'consultation', key: 'consultation' },
  { value: 'follow-up', key: 'follow_up' },
  { value: 'emergency', key: 'emergency' },
  { value: 'routine-checkup', key: 'routine_checkup' },
  { value: 'specialist-referral', key: 'specialist_referral' },
];

// Default form values
export const defaultDoctorFormData = {
  name: '',
  specialty: '',
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
  offDays: [] as string[],
  consultationDuration: 30,
  maxPatientsPerHour: 2,
};

export const defaultTimeSlotFormData = {
  time: '',
  type: 'regular' as 'regular' | 'available' | 'reserved',
  patientName: '',
  patientPhone: '',
  appointmentType: 'consultation',
  notes: '',
};

// Doctor interface
export interface Doctor {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  workingHours: { start: string; end: string };
  offDays: string[];
  consultationDuration: number;
  maxPatientsPerHour: number;
}

// Appointment interface (compatible with appointment page)
export interface Appointment {
  id: number;
  patient: string;
  patientAvatar: string;
  date: string;
  time: string;
  timeSlot: string;
  duration: number;
  doctor: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'rescheduled' | 'no-show' | 'completed';
  location: string;
  phone: string;
  notes: string;
  completed: boolean;
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  isAvailableSlot?: boolean; // New field to distinguish available slots from actual appointments
}

// Export the base doctor schedules for use in other components
export const doctorSchedules = baseDoctorSchedules;

// Patient-related interfaces and data
export interface MedicalHistory {
  date: string;
  condition: string;
  treatment: string;
  doctor: string;
  notes?: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: string;
  prescribedBy: string;
  dateStarted: string;
}

export interface VisitNote {
  date: string;
  note: string;
  doctor: string;
}

export interface VitalSign {
  date: string;
  bp: string;
  pulse: string;
  weight: string;
  height: string;
}

export interface Document {
  id: number;
  title: string;
  type: string;
  date: string;
  file?: File;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  condition: string;
  status: string;
  avatar: string;
  address: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: string;
  medicalHistory: MedicalHistory[];
  medications: Medication[];
  visitNotes: VisitNote[];
  vitalSigns: VitalSign[];
  documents: Document[];
}

// Initial patients data - Empty for clean deployment
export const initialPatients: Patient[] = [];

// Default patient form data
export const defaultNewPatientData = {
  name: '',
  phone: '',
  email: '',
  age: '',
  gender: '',
  address: '',
  emergencyContact: '',
  bloodType: '',
  condition: '',
  status: 'new'
};

// Default medical history form data
export const defaultMedicalHistoryData = {
  date: new Date().toISOString().split('T')[0],
  condition: '',
  treatment: '',
  doctor: 'Dr. Ahmed Ali',
  notes: ''
};

// Default medication form data
export const defaultMedicationData = {
  name: '',
  dosage: '',
  frequency: '',
  duration: ''
};

// Default appointment data
export const defaultAppointmentData = {
  date: '',
  time: '',
  type: 'Follow-up',
  duration: '30',
  notes: '',
  priority: 'Normal'
};

// Patient status options
export const patientStatusOptions = [
  { value: 'new', key: 'new' },
  { value: 'old', key: 'old' },
  { value: 'follow-up', key: 'follow_up' },
  { value: 'discharged', key: 'discharged' },
];

// Blood type options
export const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Gender options
export const genderOptions = [
  { value: 'Male', key: 'male' },
  { value: 'Female', key: 'female' },
];

// Common medical conditions
export const commonConditions = [
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

// Common medications for quick selection
export const commonMedications = [
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
  { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
  { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily' },
  { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' },
  { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' },
];

// Appointment-related data
export interface AppointmentData {
  id: number;
  patient: string;
  patientAvatar: string;
  date: string;
  time: string;
  timeSlot: string;
  duration: number;
  doctor: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'rescheduled' | 'no-show' | 'completed';
  location: string;
  phone: string;
  notes: string;
  completed: boolean;
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
}

// Default appointments data - Empty for clean deployment
export const getDefaultAppointments = (): AppointmentData[] => {
  return [];
};

// Payment-related data
export interface PaymentData {
  id: number;
  invoiceId: string;
  patient: string;
  patientAvatar: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  method: string;
  description: string;
  category: string;
  insurance: 'Yes' | 'No';
  insuranceAmount: number;
  paidAmount?: number;
}

// Sample patient names for payments - Empty for clean deployment
export const samplePaymentPatients = [];

// Default payment data generator - Empty for clean deployment
export const generateDefaultPayments = (): PaymentData[] => {
  return [];
};

// Notification-related data
export interface NotificationAppointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  status: string;
  type: string;
  priority: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPayment {
  id: number;
  invoiceId: string;
  patient: string;
  amount: number;
  status: string;
  date: string;
  dueDate?: string;
  method: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPatient {
  id: number;
  name: string;
  status: string;
  lastVisit: string | null;
  nextAppointment: string | null;
  medications?: Array<{
    name: string;
    status: string;
    dateStarted: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  supplier: string;
  lastUpdated: string;
  status: string;
}

// Default notification data generators - Empty for clean deployment
export const getDefaultNotificationAppointments = (): NotificationAppointment[] => {
  return [];
};

export const getDefaultNotificationPayments = (): NotificationPayment[] => {
  return [];
};

export const getDefaultNotificationPatients = (): NotificationPatient[] => {
  return [];
};

export const getDefaultInventory = (): InventoryItem[] => [];

// Default form data for new invoice/payment
export const defaultNewInvoiceData = {
  patient: '',
  amount: '',
  category: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  description: '',
  method: '',
  insuranceAmount: '',
};

// Payment categories
export const paymentCategories = [
  'consultation',
  'checkup', 
  'surgery',
  'emergency',
  'followup',
  'medication',
  'diagnostic',
  'therapy'
];

// Payment methods
export const paymentMethods = [
  'Credit Card',
  'Cash',
  'Bank Transfer',
  'Insurance',
  'Check',
  'Online Payment'
];

// Payment statuses
export const paymentStatuses = [
  { value: 'paid', key: 'paid' },
  { value: 'pending', key: 'pending' },
  { value: 'overdue', key: 'overdue' },
  { value: 'partial', key: 'partial' },
];

// Appointment types
export const appointmentTypesOptions = [
  'Consultation',
  'Check-up',
  'Follow-up',
  'Emergency',
  'Surgery Consultation',
  'Diagnostic',
  'Therapy',
  'Routine Checkup'
];

// Priority levels
export const priorityLevels = [
  { value: 'normal', key: 'normal' },
  { value: 'high', key: 'high' },
  { value: 'urgent', key: 'urgent' },
];

// Doctor Dashboard related data - Empty for clean deployment
export const doctorDashboardPatientsData = [
  { name: 'Mon', patients: 0 },
  { name: 'Tue', patients: 0 },
  { name: 'Wed', patients: 0 },
  { name: 'Thu', patients: 0 },
  { name: 'Fri', patients: 0 },
  { name: 'Sat', patients: 0 },
  { name: 'Sun', patients: 0 },
];

export const doctorDashboardMyPatients: Array<{
  id: number;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  nextAppointment: string;
  avatar: string;
  status: string;
}> = [];

export const doctorDashboardTodaysAppointments: Array<{
  id: number;
  time: string;
  patient: string;
  type: string;
  duration: string;
  avatar: string;
}> = [];

export const doctorDashboardRecentActivity: Array<{
  id: number;
  type: string;
  patient: string;
  timeAgo: string;
  icon: string;
  color: string;
}> = [];

// Receptionist Dashboard related data - Empty for clean deployment
export const receptionistDashboardTodayAppointments: Array<{
  id: number;
  time: string;
  patient: string;
  doctor: string;
  status: string;
  avatar: string;
  duration: number;
}> = [];

export const receptionistDashboardPaymentsDue: Array<{
  id: number;
  patient: string;
  amount: string;
  dueDate: string;
}> = [];

export const receptionistDashboardInventoryAlerts: Array<{
  id: number;
  item: string;
  stock: number;
  minStock: number;
  status: string;
}> = [];

// Scheduling API - Default doctor schedules
export interface DoctorScheduleData {
  id: string;
  name: string;
  specialty: string;
  workingHours: {
    start: string;
    end: string;
  };
  offDays: string[];
  maxPatientsPerHour: number;
  consultationDuration: number;
}

export const getDefaultDoctorSchedulesData = (): DoctorScheduleData[] => {
  return [
    {
      id: 'dr_default',
      name: 'Dr. Default',
      specialty: 'General Practice',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      offDays: ['Friday', 'Saturday'],
      maxPatientsPerHour: 3,
      consultationDuration: 30
    }
  ];
};

// Storage keys for different modules
export const STORAGE_KEYS_DATA = {
  NOTIFICATIONS: 'clinic_notifications_data',
  APPOINTMENTS: 'clinic_appointments_data',
  PAYMENTS: 'clinic_payments_data', 
  PATIENTS: 'clinic_patients_data',
  INVENTORY: 'clinic_inventory_data',
  SETTINGS: 'clinic_notification_settings'
}; 