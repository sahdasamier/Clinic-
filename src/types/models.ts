import { UserPermissions } from './permissions';

export interface Clinic {
  id: string;
  name: string;
  isActive: boolean;
  settings: {
    allowedFeatures: string[];
    maxUsers: number;
    subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string; // super admin email
}

export interface Branch {
    id: string;
    name: string;
    clinicId: string;
}

export interface User {
  id: string;
  email: string;
  role: "management" | "doctor" | "receptionist";
  clinicId: string;
  branchId?: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  permissions?: UserPermissions; // Custom permissions override role defaults
  createdAt: string;
  updatedAt: string;
  createdBy: string; // who created this user
}

// Super Admin type for admin panel
export interface SuperAdmin {
  email: string;
  role: 'super_admin';
}

export interface Patient {
  id: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  condition?: string;
  status: 'new' | 'old' | 'follow-up' | 'admitted' | 'transferred' | 'discharged';
  lastVisit?: string;
  nextAppointment?: string;
  medicalHistory?: Array<{
    date: string;
    condition: string;
    treatment: string;
    doctor: string;
    notes?: string;
  }>;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    dateStarted: string;
    status: 'Active' | 'Discontinued';
  }>;
  visitNotes?: Array<{
    date: string;
    doctor: string;
    notes: string;
    visitType: string;
  }>;
  vitalSigns?: Array<{
    date: string;
    height: number;
    weight: number;
    bloodPressure: string;
    temperature: number;
    heartRate: number;
  }>;
  documents?: Array<{
    name: string;
    url: string;
    uploadDate: string;
    type: string;
  }>;
  avatar?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  // Extended properties for appointment integration
  appointmentData?: {
    lastCompletedDate?: any;
    nextPendingDate?: any;
    completed?: any[];
    notCompleted?: any[];
    totalAppointments?: number;
  };
  allCompletedVisits?: Array<{
    date: any;
    time: any;
    type: any;
    doctor: any;
    notes: any;
    appointmentId: any;
  }>;
  todayAppointment?: string;
  // For backward compatibility with different id types
  _appointmentCount?: number;
  _completedCount?: number;
  _pendingCount?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  date: string;
  status: "scheduled" | "checked-in" | "completed" | "cancelled";
  // ...
}

// Notification types
export interface Notification {
  id: string;
  type: 'appointment' | 'payment' | 'inventory' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ReactNode;
  color?: string;
  clinicId: string;
  branchId?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  appointments: boolean;
  payments: boolean;
  inventory: boolean;
  system: boolean;
}

// Add more as needed 