/**
 * Comprehensive Doctor Fix
 * 
 * This utility fixes all doctor assignment issues across appointments and patients.
 * It handles "Dr. Current Doctor" placeholders, invalid doctor IDs, and missing patient doctor info.
 */

import { collection, getDocs, query, where, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '../api/firebaseOptimized';

export interface FixResult {
  success: boolean;
  message: string;
  appointmentsFixed: number;
  patientsFixed: number;
  details: {
    appointmentIssues: string[];
    patientIssues: string[];
    fixedAppointments: any[];
    fixedPatients: any[];
  };
}

/**
 * Comprehensive fix for all doctor assignment issues
 */
export const comprehensiveDoctorFix = async (clinicId: string = 'demo-clinic'): Promise<FixResult> => {
  console.log('🚀 Starting comprehensive doctor fix...');
  
  try {
    if (!firebaseManager.isReady()) {
      throw new Error('Firebase not ready - please wait for initialization');
    }
    
    const db = getOptimizedFirestore();
    const batch = writeBatch(db);
    
    // 1. Get all available doctors
    console.log('👩‍⚕️ Fetching available doctors...');
    const doctorsQuery = query(
      collection(db, 'users'),
      where('clinicId', '==', clinicId),
      where('role', '==', 'doctor'),
      where('isActive', '==', true)
    );
    const doctorsSnapshot = await getDocs(doctorsQuery);
    const availableDoctors = doctorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    console.log('✅ Available doctors:', availableDoctors.map(d => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`
    })));
    
    if (availableDoctors.length === 0) {
      return {
        success: false,
        message: 'No active doctors found in the clinic',
        appointmentsFixed: 0,
        patientsFixed: 0,
        details: {
          appointmentIssues: ['No doctors available'],
          patientIssues: ['No doctors available'],
          fixedAppointments: [],
          fixedPatients: []
        }
      };
    }
    
    // 2. Get all appointments
    console.log('📅 Fetching appointments...');
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    })) as any[];
    
    console.log(`📊 Found ${appointments.length} appointments`);
    
    // 3. Get all patients
    console.log('👥 Fetching patients...');
    const patientsQuery = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    })) as any[];
    
    console.log(`👤 Found ${patients.length} patients`);
    
    // 4. Analyze and fix appointment issues
    const appointmentIssues: string[] = [];
    const fixedAppointments: any[] = [];
    let appointmentsToFix = 0;
    
    // Default to first available doctor for assignments
    const defaultDoctor = availableDoctors[0];
    const defaultDoctorName = `${defaultDoctor.firstName} ${defaultDoctor.lastName}`;
    
    console.log(`🎯 Using default doctor for fixes: ${defaultDoctorName} (${defaultDoctor.id})`);
    
    for (const appointment of appointments) {
      let needsUpdate = false;
      const updates: any = {};
      const issues: string[] = [];
      
      // Check for "Dr. Current Doctor" placeholder
      if (appointment.doctor === 'Dr. Current Doctor') {
        updates.doctor = defaultDoctorName;
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        issues.push('Had "Dr. Current Doctor" placeholder');
      }
      
      // Check for invalid doctor ID
      if (appointment.doctorId && !availableDoctors.find(d => d.id === appointment.doctorId)) {
        updates.doctorId = defaultDoctor.id;
        // If doctor name is also missing/invalid, set it
        if (!appointment.doctor || appointment.doctor === 'Dr. Current Doctor' || appointment.doctor === 'Not Assigned') {
          updates.doctor = defaultDoctorName;
        }
        needsUpdate = true;
        issues.push(`Invalid doctorId: ${appointment.doctorId}`);
      }
      
      // Check for missing doctor information
      if (!appointment.doctor || appointment.doctor === 'Not Assigned') {
        updates.doctor = defaultDoctorName;
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        issues.push('Missing doctor name');
      }
      
      // Check for missing doctor ID when doctor name exists
      if (appointment.doctor && appointment.doctor !== 'Not Assigned' && appointment.doctor !== 'Dr. Current Doctor' && !appointment.doctorId) {
        // Try to find matching doctor by name
        const matchingDoctor = availableDoctors.find(d => 
          `${d.firstName} ${d.lastName}` === appointment.doctor ||
          `Dr. ${d.firstName} ${d.lastName}` === appointment.doctor
        );
        
        if (matchingDoctor) {
          updates.doctorId = matchingDoctor.id;
        } else {
          updates.doctorId = defaultDoctor.id;
          updates.doctor = defaultDoctorName;
        }
        needsUpdate = true;
        issues.push('Missing doctorId');
      }
      
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updates._lastDoctorFix = new Date().toISOString();
        
        batch.update(appointment.ref, updates);
        appointmentsToFix++;
        
        fixedAppointments.push({
          id: appointment.id,
          patient: appointment.patient,
          originalDoctor: appointment.doctor,
          originalDoctorId: appointment.doctorId,
          newDoctor: updates.doctor || appointment.doctor,
          newDoctorId: updates.doctorId || appointment.doctorId,
          issues
        });
        
        appointmentIssues.push(`Appointment ${appointment.id} (${appointment.patient}): ${issues.join(', ')}`);
      }
    }
    
    // 5. Analyze and fix patient issues
    const patientIssues: string[] = [];
    const fixedPatients: any[] = [];
    let patientsToFix = 0;
    
    // Group appointments by patient name for syncing
    const appointmentsByPatient = new Map<string, any[]>();
    appointments.forEach(apt => {
      if (apt.patient && apt.patient.trim()) {
        const patientName = apt.patient.trim();
        if (!appointmentsByPatient.has(patientName)) {
          appointmentsByPatient.set(patientName, []);
        }
        appointmentsByPatient.get(patientName)!.push(apt);
      }
    });
    
    for (const patient of patients) {
      let needsUpdate = false;
      const updates: any = {};
      const issues: string[] = [];
      
      // Check if patient has doctor information
      const hasValidDoctor = patient.doctor && patient.doctor !== 'Not Assigned' && patient.doctor.trim() !== '';
      const hasValidDoctorId = patient.doctorId && availableDoctors.find(d => d.id === patient.doctorId);
      
      if (!hasValidDoctor || !hasValidDoctorId) {
        // Try to get doctor info from appointments
        const patientAppointments = appointmentsByPatient.get(patient.name) || [];
        const appointmentsWithDoctor = patientAppointments.filter(apt => 
          apt.doctor && apt.doctor !== 'Not Assigned' && apt.doctor !== 'Dr. Current Doctor' && apt.doctor.trim() !== ''
        );
        
        if (appointmentsWithDoctor.length > 0) {
          // Use most recent appointment with doctor
          const mostRecent = appointmentsWithDoctor
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          updates.doctor = mostRecent.doctor;
          updates.doctorId = mostRecent.doctorId || defaultDoctor.id;
          updates.doctorName = mostRecent.doctor;
          issues.push('Synced from appointment');
        } else {
          // Assign default doctor
          updates.doctor = defaultDoctorName;
          updates.doctorId = defaultDoctor.id;
          updates.doctorName = defaultDoctorName;
          issues.push('Assigned default doctor');
        }
        
        needsUpdate = true;
      }
      
      // Check for invalid doctor ID
      if (patient.doctorId && !availableDoctors.find(d => d.id === patient.doctorId)) {
        updates.doctorId = defaultDoctor.id;
        if (!hasValidDoctor) {
          updates.doctor = defaultDoctorName;
          updates.doctorName = defaultDoctorName;
        }
        needsUpdate = true;
        issues.push(`Invalid doctorId: ${patient.doctorId}`);
      }
      
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updates._lastDoctorSync = new Date().toISOString();
        updates._doctorSyncSource = 'comprehensive_fix';
        
        batch.update(patient.ref, updates);
        patientsToFix++;
        
        fixedPatients.push({
          id: patient.id,
          name: patient.name,
          originalDoctor: patient.doctor,
          originalDoctorId: patient.doctorId,
          newDoctor: updates.doctor || patient.doctor,
          newDoctorId: updates.doctorId || patient.doctorId,
          issues
        });
        
        patientIssues.push(`Patient ${patient.name}: ${issues.join(', ')}`);
      }
    }
    
    // 6. Commit all changes
    if (appointmentsToFix > 0 || patientsToFix > 0) {
      console.log(`📝 Committing fixes: ${appointmentsToFix} appointments, ${patientsToFix} patients`);
      await batch.commit();
      
      // Trigger refresh events
      window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
      window.dispatchEvent(new CustomEvent('appointmentPatientSync'));
      window.dispatchEvent(new CustomEvent('firebaseDataUpdate'));
      
      console.log('✅ Comprehensive doctor fix completed successfully');
      
      return {
        success: true,
        message: `Fixed ${appointmentsToFix} appointments and ${patientsToFix} patients`,
        appointmentsFixed: appointmentsToFix,
        patientsFixed: patientsToFix,
        details: {
          appointmentIssues,
          patientIssues,
          fixedAppointments,
          fixedPatients
        }
      };
    } else {
      console.log('✅ No doctor issues found - all data is consistent');
      return {
        success: true,
        message: 'No doctor issues found - all data is consistent',
        appointmentsFixed: 0,
        patientsFixed: 0,
        details: {
          appointmentIssues: [],
          patientIssues: [],
          fixedAppointments: [],
          fixedPatients: []
        }
      };
    }
    
  } catch (error) {
    console.error('❌ Comprehensive doctor fix failed:', error);
    return {
      success: false,
      message: `Fix failed: ${error instanceof Error ? error.message : String(error)}`,
      appointmentsFixed: 0,
      patientsFixed: 0,
      details: {
        appointmentIssues: [`Error: ${error}`],
        patientIssues: [`Error: ${error}`],
        fixedAppointments: [],
        fixedPatients: []
      }
    };
  }
};

/**
 * Quick diagnosis of doctor issues without fixing
 */
export const diagnoseDoctorIssues = async (clinicId: string = 'demo-clinic') => {
  console.log('🔍 Diagnosing doctor issues...');
  
  try {
    if (!firebaseManager.isReady()) {
      throw new Error('Firebase not ready - please wait for initialization');
    }
    
    const db = getOptimizedFirestore();
    
    // Get available doctors
    const doctorsQuery = query(
      collection(db, 'users'),
      where('clinicId', '==', clinicId),
      where('role', '==', 'doctor'),
      where('isActive', '==', true)
    );
    const doctorsSnapshot = await getDocs(doctorsQuery);
    const availableDoctors = doctorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    // Get appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    // Get patients
    const patientsQuery = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    // Analyze issues
    const diagnosis = {
      availableDoctors: availableDoctors.map(d => ({
        id: d.id,
        name: `${d.firstName} ${d.lastName}`
      })),
      appointmentIssues: {
        drCurrentDoctor: appointments.filter(a => a.doctor === 'Dr. Current Doctor'),
        invalidDoctorId: appointments.filter(a => a.doctorId && !availableDoctors.find(d => d.id === a.doctorId)),
        missingDoctor: appointments.filter(a => !a.doctor || a.doctor === 'Not Assigned'),
        missingDoctorId: appointments.filter(a => a.doctor && a.doctor !== 'Not Assigned' && !a.doctorId)
      },
      patientIssues: {
        missingDoctor: patients.filter(p => !p.doctor || p.doctor === 'Not Assigned'),
        invalidDoctorId: patients.filter(p => p.doctorId && !availableDoctors.find(d => d.id === p.doctorId)),
        missingDoctorId: patients.filter(p => p.doctor && p.doctor !== 'Not Assigned' && !p.doctorId)
      }
    };
    
    console.log('📊 DIAGNOSIS RESULTS:', diagnosis);
    
    return diagnosis;
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    return null;
  }
};

// Make functions available globally for testing
(window as any).comprehensiveDoctorFix = comprehensiveDoctorFix;
(window as any).diagnoseDoctorIssues = diagnoseDoctorIssues; 