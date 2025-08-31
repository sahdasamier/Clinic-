import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from './../firebase/legacy-compat';

// Helper to get safe database reference with async initialization
const getDb = async () => {
  const maxRetries = 10;
  const retryDelay = 500; // 500ms
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const isReady = await firebaseManager.isReady();
    if (isReady) {
      const db = getOptimizedFirestore();
      if (db) {
        return db;
      }
    }
    
    console.warn(`⏳ DoctorPatients: Firebase not ready, attempt ${attempt}/${maxRetries}`);
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Firebase initialization timeout - please refresh the page');
};

export interface DoctorPatientAssignment {
  id?: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  assignedAt: any;
  assignedBy: string;
  isActive: boolean;
}

/**
 * Get all patients assigned to a specific doctor
 */
export const getPatientsByDoctor = async (doctorId: string, clinicId: string): Promise<any[]> => {
  try {
    const db = await getDb();
    // Query patients assigned to this doctor
    const patientsQuery = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(patientsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching patients for doctor:', error);
    return [];
  }
};

/**
 * Get all doctors in a clinic
 */
export const getDoctorsByClinic = async (clinicId: string): Promise<any[]> => {
  try {
    const db = await getDb();
    const doctorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'doctor'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(doctorsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

/**
 * Assign a patient to a doctor
 */
export const assignPatientToDoctor = async (
  patientId: string,
  doctorId: string,
  clinicId: string,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = await getDb();
    // Update patient document with doctorId
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      doctorId: doctorId,
      updatedAt: serverTimestamp(),
      updatedBy: assignedBy
    });

    // Create assignment record for tracking
    const assignmentData: DoctorPatientAssignment = {
      doctorId,
      doctorName: '', // Will be filled by UI
      patientId,
      patientName: '', // Will be filled by UI  
      clinicId,
      assignedAt: serverTimestamp(),
      assignedBy,
      isActive: true
    };

    await addDoc(collection(db, 'doctor_patient_assignments'), assignmentData);

    console.log(`✅ Patient ${patientId} assigned to doctor ${doctorId}`);
    return { success: true };
  } catch (error) {
    console.error('Error assigning patient to doctor:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Remove patient assignment from doctor
 */
export const unassignPatientFromDoctor = async (
  patientId: string,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = await getDb();
    // Remove doctorId from patient document
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      doctorId: '', // Clear assignment
      updatedAt: serverTimestamp(),
      updatedBy: assignedBy
    });

    console.log(`✅ Patient ${patientId} unassigned from doctor`);
    return { success: true };
  } catch (error) {
    console.error('Error unassigning patient from doctor:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Get assignment history for a patient
 */
export const getPatientAssignmentHistory = async (patientId: string): Promise<DoctorPatientAssignment[]> => {
  try {
    const db = await getDb();
    const assignmentsQuery = query(
      collection(db, 'doctor_patient_assignments'),
      where('patientId', '==', patientId)
    );
    
    const querySnapshot = await getDocs(assignmentsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DoctorPatientAssignment[];
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    return [];
  }
};

/**
 * Check if current user can access patient data
 */
export const canAccessPatient = async (
  userId: string, 
  userRole: string, 
  patientId: string
): Promise<boolean> => {
  try {
    // Management can access all patients
    if (userRole === 'management') {
      return true;
    }
    
    // Doctors can only access their assigned patients
    if (userRole === 'doctor') {
      const db = await getDb();
      // Get patient document to check doctorId
      const patientQuery = query(
        collection(db, 'patients'),
        where('doctorId', '==', userId)
      );
      
      const querySnapshot = await getDocs(patientQuery);
      return querySnapshot.docs.some(doc => doc.id === patientId);
    }
    
    // Receptionists have limited access (basic info only)
    if (userRole === 'receptionist') {
      return true; // Basic access for scheduling
    }
    
    return false;
  } catch (error) {
    console.error('Error checking patient access:', error);
    return false;
  }
}; 