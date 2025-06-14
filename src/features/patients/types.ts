export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  condition: string;
  status: 'new' | 'old' | 'follow-up';
  avatar: string;
  address: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: string;
  medicalHistory: MedicalHistoryRecord[];
  medications: Medication[];
  visitNotes: VisitNote[];
  vitalSigns: VitalSign[];
  documents: Document[];
}

export interface MedicalHistoryRecord {
  date: string;
  condition: string;
  treatment: string;
  doctor: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
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
  url: string;
  dateUploaded: string;
}

export interface ActiveFilters {
  gender: string;
  ageRange: string;
  condition: string;
  status: string;
}

export interface NewPatientData {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  condition: string;
  status: string;
}

export interface AppointmentData {
  date: string;
  time: string;
  type: string;
  duration: string;
  notes: string;
  priority: string;
}

export interface NewMedicalHistory {
  date: string;
  condition: string;
  treatment: string;
  doctor: string;
  notes: string;
}

export interface NewMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export type ViewMode = 'table' | 'cards';
export type PatientOrganizationMode = 'reservation' | 'completion' | 'all';
export type TreatmentType = 'existing' | 'new' | 'custom'; 