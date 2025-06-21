import { Timestamp } from 'firebase/firestore';

// Base interface for all Firebase documents
export interface FirebaseDocument {
  id?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Users collection: /users/{userId}
export interface UserProfile extends FirebaseDocument {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  clinicId: string;
}

// Patients collection: /patients/{patientId}
export interface Patient extends FirebaseDocument {
  name: string;
  email: string;
  phone: string;
  medicalHistory: string;
  clinicId: string;
  createdBy: string;
}

// Clinic settings interface
export interface ClinicSettings {
  appointmentDuration: number; // minutes
  workingHours: {
    monday: { start: string; end: string; isOpen: boolean };
    tuesday: { start: string; end: string; isOpen: boolean };
    wednesday: { start: string; end: string; isOpen: boolean };
    thursday: { start: string; end: string; isOpen: boolean };
    friday: { start: string; end: string; isOpen: boolean };
    saturday: { start: string; end: string; isOpen: boolean };
    sunday: { start: string; end: string; isOpen: boolean };
  };
  allowOnlineBooking: boolean;
  requirePaymentUpfront: boolean;
  cancellationPolicy: string;
  timezone: string;
}

// Clinics collection: /clinics/{clinicId}
export interface Clinic extends FirebaseDocument {
  name: string;
  address: string;
  phone: string;
  email: string;
  settings: ClinicSettings;
}

// Appointments collection: /appointments/{appointmentId}
export interface Appointment extends FirebaseDocument {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  createdBy: string;
}

// Medical Records collection: /medicalRecords/{recordId}
export interface MedicalRecord extends FirebaseDocument {
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentId?: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  attachments?: string[];
  createdBy: string;
}

// Validation interfaces
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  phone?: boolean;
  pattern?: RegExp;
  custom?: (value: any, formData?: any) => boolean | string;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  missingFields: string[];
}

// Firebase form options
export interface FirebaseFormOptions<T> {
  collection: string;
  documentId?: string;
  initialData: T;
  validationRules: ValidationRules<T>;
  enableRealTimeSync?: boolean;
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
  onSaveSuccess?: (data: T) => void;
  onSaveError?: (error: Error) => void;
  onLoadSuccess?: (data: T) => void;
  onLoadError?: (error: Error) => void;
}

// Persistent form options
export interface PersistentFormOptions<T> extends FirebaseFormOptions<T> {
  storageKey: string;
  enableDraftSaving?: boolean;
  draftSaveDelay?: number;
  clearDraftOnSave?: boolean;
}

// Firebase form state
export interface FirebaseFormState<T> {
  data: T;
  originalData: T;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isOnline: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  lastSaved: Date | null;
  lastSynced: Date | null;
  hasUnsavedChanges: boolean;
}

// Firebase form actions
export interface FirebaseFormActions<T> {
  updateField: (field: keyof T, value: any) => void;
  updateData: (data: Partial<T>) => void;
  setData: (data: T) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  validateField: (field: keyof T) => boolean;
  saveData: () => Promise<boolean>;
  saveLocally: () => void;
  loadFromFirebase: () => Promise<void>;
  syncWithFirebase: () => Promise<void>;
  clearLocalStorage: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;
}

// Combined form return type
export interface FirebaseFormReturn<T> extends FirebaseFormState<T>, FirebaseFormActions<T> {}

// Error types
export interface FirebaseError {
  code: string;
  message: string;
  isNetworkError: boolean;
  isAuthError: boolean;
  isPermissionError: boolean;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: boolean;
  syncInProgress: boolean;
  syncError: Error | null;
}

// Auto-save configuration
export interface AutoSaveConfig {
  enabled: boolean;
  delay: number;
  saveToFirebase: boolean;
  saveToLocalStorage: boolean;
  onAutoSave?: (data: any) => void;
}

// Export collection names as constants
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  CLINICS: 'clinics',
  APPOINTMENTS: 'appointments',
  MEDICAL_RECORDS: 'medicalRecords'
} as const;

export type FirebaseCollection = typeof FIREBASE_COLLECTIONS[keyof typeof FIREBASE_COLLECTIONS]; 