export interface Clinic {
  id: string;
  name: string;
  branches: Branch[];
}

export interface Branch {
    id: string;
    name: string;
    clinicId: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "doctor" | "receptionist";
  clinicId: string;
  branchId?: string;
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