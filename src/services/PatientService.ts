import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  getDocs,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../api/firebase';

const COLLECTION_NAME = 'patients';
const patientsCollection = collection(db, COLLECTION_NAME);

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

export const PatientService = {
  // Create a new patient
  async createPatient(clinicId: string, patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>): Promise<string> {
    const id = crypto.randomUUID();
    const patient: Patient = {
      ...patientData,
      id,
      clinicId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(patientsCollection, id), patient);
    console.log('✅ Patient created:', id);
    return id;
  },

  // Update an existing patient
  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
    const patientRef = doc(patientsCollection, patientId);
    await setDoc(patientRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('✅ Patient updated:', patientId);
  },

  // Delete a patient (soft delete by setting isActive to false)
  async deletePatient(patientId: string): Promise<void> {
    await this.updatePatient(patientId, { isActive: false });
    console.log('✅ Patient soft deleted:', patientId);
  },

  // Hard delete a patient (permanent deletion)
  async hardDeletePatient(patientId: string): Promise<void> {
    await deleteDoc(doc(patientsCollection, patientId));
    console.log('✅ Patient permanently deleted:', patientId);
  },

  // Listen to patients for a specific clinic
  listenPatients(clinicId: string, callback: (patients: Patient[]) => void): () => void {
    const q = query(
      patientsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      
      console.log(`📊 Patients updated: ${patients.length} active patients`);
      callback(patients);
    }, (error) => {
      console.error('❌ Error listening to patients:', error);
      callback([]); // Provide empty array as fallback
    });
  },

  // Get patients by status
  listenPatientsByStatus(clinicId: string, status: Patient['status'], callback: (patients: Patient[]) => void): () => void {
    const q = query(
      patientsCollection,
      where('clinicId', '==', clinicId),
      where('status', '==', status),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      
      callback(patients);
    });
  },

  // Search patients by name or phone
  async searchPatients(clinicId: string, searchTerm: string): Promise<Patient[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for better search
    const q = query(
      patientsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const allPatients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];

    // Client-side filtering (not ideal for large datasets)
    const searchTermLower = searchTerm.toLowerCase();
    return allPatients.filter(patient => 
      patient.name?.toLowerCase().includes(searchTermLower) ||
      patient.phone?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTermLower) ||
      patient.condition?.toLowerCase().includes(searchTermLower)
    );
  },

  // Add medical history entry
  async addMedicalHistory(patientId: string, historyEntry: {
    date: string;
    condition: string;
    treatment: string;
    doctor: string;
    notes?: string;
  }): Promise<void> {
    const patientRef = doc(patientsCollection, patientId);
    
    // Get current patient data
    const patientSnapshot = await getDocs(query(patientsCollection, where('__name__', '==', patientId)));
    if (patientSnapshot.empty) {
      throw new Error('Patient not found');
    }
    
    const currentPatient = patientSnapshot.docs[0].data() as Patient;
    const updatedHistory = [...(currentPatient.medicalHistory || []), historyEntry];
    
    await this.updatePatient(patientId, { 
      medicalHistory: updatedHistory,
      lastVisit: historyEntry.date 
    });
  },

  // Add medication
  async addMedication(patientId: string, medication: {
    name: string;
    dosage: string;
    frequency: string;
    dateStarted: string;
    status: 'Active' | 'Discontinued';
  }): Promise<void> {
    const patientRef = doc(patientsCollection, patientId);
    
    const patientSnapshot = await getDocs(query(patientsCollection, where('__name__', '==', patientId)));
    if (patientSnapshot.empty) {
      throw new Error('Patient not found');
    }
    
    const currentPatient = patientSnapshot.docs[0].data() as Patient;
    const updatedMedications = [...(currentPatient.medications || []), medication];
    
    await this.updatePatient(patientId, { medications: updatedMedications });
  },

  // Batch operations for data migration
  async batchCreatePatients(clinicId: string, patients: Array<Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>>): Promise<void> {
    const batch = writeBatch(db);
    
    patients.forEach(patientData => {
      const id = crypto.randomUUID();
      const patientRef = doc(patientsCollection, id);
      const patient: Patient = {
        ...patientData,
        id,
        clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      batch.set(patientRef, patient);
    });

    await batch.commit();
    console.log(`✅ Batch created ${patients.length} patients`);
  },

  // Get patient statistics
  async getPatientStats(clinicId: string): Promise<{
    total: number;
    new: number;
    followUp: number;
    admitted: number;
  }> {
    const q = query(
      patientsCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const patients = snapshot.docs.map(doc => doc.data()) as Patient[];

    return {
      total: patients.length,
      new: patients.filter(p => p.status === 'new').length,
      followUp: patients.filter(p => p.status === 'follow-up').length,
      admitted: patients.filter(p => p.status === 'admitted').length,
    };
  }
};

export default PatientService; 