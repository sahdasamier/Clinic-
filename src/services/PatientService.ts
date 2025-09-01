import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  getDocs,
  getDoc,
  orderBy,
  serverTimestamp,
  writeBatch,
  updateDoc,
  increment
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '@lib/firebase/legacy-compat';

const COLLECTION_NAME = 'patients';

// Safe collection reference that waits for Firebase to be ready
const getPatientsCollection = () => {
  // Try synchronous cached version first
  if (firebaseManager.isReadySync()) {
    try {
      const db = firebaseManager.getFirestoreSync();
      return collection(db, COLLECTION_NAME);
    } catch (error) {
      console.warn('⚠️ Sync access failed, falling back to error:', error);
      throw new Error('Firebase not ready - please wait for initialization');
    }
  }
  
  throw new Error('Firebase not ready - please wait for initialization');
};

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
  // Doctor assignment fields
  doctor?: string;
  doctorId?: string;
  doctorName?: string;
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
    doctor: any;
    notes: any;
    status: any;
  }>;
  // Medical requirements tracking
  pendingRequirementsCount?: number;
  hasPendingRequirements?: boolean;
  medicalRequirements?: Array<{
    id: string | number;
    title: string;
    type: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
    dateOrdered: string;
    dueDate?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    description?: string;
    orderedBy?: string;
  }>;
}

export const PatientService = {
  // ✅ ADDED: Data sanitization function to remove undefined values
  sanitizeFirestoreData(data: any): any {
    const sanitized: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      // Skip undefined values (Firebase doesn't allow them)
      if (value === undefined) {
        console.debug(`🔄 Skipping undefined field in Firestore data: ${key}`);
        return;
      }
      
      // Handle arrays - filter out undefined/null items
      if (Array.isArray(value)) {
        const filteredArray = value.filter(item => item !== undefined && item !== null);
        sanitized[key] = filteredArray;
        return;
      }
      
      // Include the value
      sanitized[key] = value;
    });
    
    return sanitized;
  },
  
  // ✅ ADDED: Data sanitization function to remove undefined values
  sanitizeRequirementData(data: any): any {
    const sanitized: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      // Skip undefined values (Firebase doesn't allow them)
      if (value === undefined) {
        console.debug(`🔄 Skipping undefined field in medical requirement: ${key}`);
        return;
      }
      
      // Handle arrays - filter out undefined/null items
      if (Array.isArray(value)) {
        const filteredArray = value.filter(item => item !== undefined && item !== null);
        sanitized[key] = filteredArray;
        return;
      }
      
      // Include the value
      sanitized[key] = value;
    });
    
    return sanitized;
  },

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

    await setDoc(doc(getPatientsCollection(), id), patient);
    console.log('✅ Patient created:', id);
    return id;
  },

  // Get a patient by ID with enhanced error handling
  async getPatientById(clinicId: string, patientId: string): Promise<Patient | null> {
    try {
      const patientRef = doc(getPatientsCollection(), patientId);
      const patientSnap = await getDoc(patientRef);
      
      if (patientSnap.exists()) {
        // If clinicId is provided, validate it matches
        if (clinicId && patientSnap.data().clinicId !== clinicId) {
          return null;
        }
        
        return {
          id: patientSnap.id,
          ...this.sanitizeFirestoreData(patientSnap.data())
        } as Patient;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching patient by ID:', error);
      return null;
    }
  },

  // Update an existing patient
  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
    // ✅ ADDED: Sanitize updates to remove undefined values
    const sanitizedUpdates: any = {};
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      
      // Skip undefined values (Firebase doesn't allow them)
      if (value === undefined) {
        console.log(`⚠️ Skipping undefined field in patient update: ${key}`);
        return;
      }
      
      // Handle arrays - filter out undefined/null items
      if (Array.isArray(value)) {
        const filteredArray = value.filter(item => item !== undefined && item !== null);
        sanitizedUpdates[key] = filteredArray;
        return;
      }
      
      // Include the value
      sanitizedUpdates[key] = value;
    });
    
    const patientRef = doc(getPatientsCollection(), patientId);
    await setDoc(patientRef, {
      ...sanitizedUpdates,
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
    await deleteDoc(doc(getPatientsCollection(), patientId));
    console.log('✅ Patient permanently deleted:', patientId);
  },

  // Listen to patients for a specific clinic
  listenPatients(clinicId: string, callback: (patients: Patient[]) => void): () => void {
    const q = query(
      getPatientsCollection(),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.sanitizeFirestoreData(doc.data())
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
      getPatientsCollection(),
      where('clinicId', '==', clinicId),
      where('status', '==', status),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.sanitizeFirestoreData(doc.data())
      })) as Patient[];
      
      callback(patients);
    });
  },

  // Search patients by name or phone
  async searchPatients(clinicId: string, searchTerm: string): Promise<Patient[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for better search
    const q = query(
      getPatientsCollection(),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const allPatients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...this.sanitizeFirestoreData(doc.data())
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
    // Get current patient data using the sanitized version
    const currentPatient = await this.getPatientById('', patientId);
    if (!currentPatient) {
      throw new Error('Patient not found');
    }
    
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
    // Get current patient data using the sanitized version
    const currentPatient = await this.getPatientById('', patientId);
    if (!currentPatient) {
      throw new Error('Patient not found');
    }
    
    const updatedMedications = [...(currentPatient.medications || []), medication];
    
    await this.updatePatient(patientId, { medications: updatedMedications });
  },

  // Batch operations for data migration
  async batchCreatePatients(clinicId: string, patients: Array<Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'clinicId'>>): Promise<void> {
    // Ensure Firebase is ready before creating batch
    if (!(await firebaseManager.isReady())) {
      throw new Error('Firebase not ready - please wait for initialization');
    }
    
    const db = await getOptimizedFirestore();
    const batch = writeBatch(db);
    
    patients.forEach(patientData => {
      const id = crypto.randomUUID();
      const patientRef = doc(getPatientsCollection(), id);
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
      getPatientsCollection(),
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
  },

  // Update medical requirement counts for a patient
  async updateRequirementCounts(patientId: string, shouldIncrement: boolean = true): Promise<void> {
    try {
      const patientRef = doc(getPatientsCollection(), patientId);
      
      if (shouldIncrement) {
        // Increment the count and set the flag
        await updateDoc(patientRef, {
          pendingRequirementsCount: increment(1),
          hasPendingRequirements: true,
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Incremented pending requirements count for patient:', patientId);
      } else {
        // Decrement the count and check if we should unset the flag
        await updateDoc(patientRef, {
          pendingRequirementsCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
        
        // Check if count is now 0 and update flag accordingly
        const patientSnapshot = await getDocs(query(getPatientsCollection(), where('__name__', '==', patientId)));
        if (!patientSnapshot.empty) {
          const currentPatient = patientSnapshot.docs[0].data() as Patient;
          const newCount = (currentPatient.pendingRequirementsCount || 0) - 1;
          
          if (newCount <= 0) {
            await updateDoc(patientRef, {
              pendingRequirementsCount: 0,
              hasPendingRequirements: false,
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Reset pending requirements count and flag for patient:', patientId);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating requirement counts for patient:', patientId, error);
      throw error;
    }
  },

  // Set specific requirement count for a patient
  async setRequirementCount(patientId: string, count: number): Promise<void> {
    try {
      const patientRef = doc(getPatientsCollection(), patientId);
      
      await updateDoc(patientRef, {
        pendingRequirementsCount: count,
        hasPendingRequirements: count > 0,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Set pending requirements count to ${count} for patient:`, patientId);
    } catch (error) {
      console.error('❌ Error setting requirement count for patient:', patientId, error);
      throw error;
    }
  },

  // Recalculate and update requirement counts for a patient
  async recalculateRequirementCounts(patientId: string): Promise<void> {
    try {
      const patientSnapshot = await getDocs(query(getPatientsCollection(), where('__name__', '==', patientId)));
      if (patientSnapshot.empty) {
        console.warn('⚠️ Patient not found for requirement count recalculation:', patientId);
        return;
      }
      
      const currentPatient = patientSnapshot.docs[0].data() as Patient;
      const pendingCount = (currentPatient.medicalRequirements || []).filter(
        (req: any) => req.status === 'pending'
      ).length;
      
      await this.setRequirementCount(patientId, pendingCount);
      console.log(`✅ Recalculated requirement counts for patient ${patientId}: ${pendingCount} pending`);
    } catch (error) {
      console.error('❌ Error recalculating requirement counts for patient:', patientId, error);
      throw error;
    }
  },

  // Sync medical requirements from separate collection to patient record
  async syncMedicalRequirements(clinicId: string, patientId: string): Promise<void> {
    try {
      // Import MedicalRequirementsService dynamically to avoid circular dependencies
      const { default: MedicalRequirementsService } = await import('./MedicalRequirementsService');
      
      // Get all medical requirements for this patient from the separate collection
      const requirements = await MedicalRequirementsService.getOrdersByPatient(clinicId, patientId);
      
      // Transform the requirements to match the patient's medicalRequirements format
      const transformedRequirements = requirements.map(req => {
        const transformed = {
          id: req.id,
          title: req.title,
          type: req.requirementType,
          status: req.status,
          dateOrdered: req.dateOrdered,
          dueDate: req.dueDate,
          priority: req.priority,
          description: req.description,
          orderedBy: req.orderedBy,
          completedDate: req.completedDate,
          uploadedFiles: req.documents || [],
          // Add any other fields that might be needed
          category: req.category,
          notes: req.notes,
          processingNotes: req.processingNotes,
          completionNotes: req.completionNotes
        };
        
        // ✅ ADDED: Sanitize the transformed data to remove undefined values
        return this.sanitizeRequirementData(transformed);
      });
      
      // Update the patient's medicalRequirements array
      await this.updatePatient(patientId, {
        medicalRequirements: transformedRequirements
      });
      
      console.log(`✅ Synced ${requirements.length} medical requirements for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Error syncing medical requirements for patient:', patientId, error);
      throw error;
    }
  }
};

export default PatientService; 