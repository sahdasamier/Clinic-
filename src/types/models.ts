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
  firstName: string;
  lastName: string;
  dob: string;
  clinicId: string;
  branchId?: string;
  // ...
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