/**
 * Emergency Doctor Fix - No Dynamic Imports
 * 
 * This utility fixes doctor assignment issues without using dynamic imports
 */

import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

// Direct Firebase operations for doctor assignment
export const emergencyFixDoctorAssignment = async (clinicId: string = 'demo-clinic') => {
  console.log('🚀 Emergency doctor assignment fix starting...');
  
  try {
    const db = getFirestore();
    
    // Get appointments
    console.log('📅 Fetching appointments...');
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${appointments.length} appointments`);
    
    // Get patients
    console.log('👥 Fetching patients...');
    const patientsQuery = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`👤 Found ${patients.length} patients`);
    
    // Find patient "farha youssif"
    const targetPatient = patients.find(p => 
      p.name && p.name.toLowerCase().includes('farha')
    );
    
    if (!targetPatient) {
      console.log('❌ Patient "farha youssif" not found');
      return { success: false, message: 'Patient not found' };
    }
    
    console.log(`👤 Found patient: ${targetPatient.name}`);
    console.log(`🔍 Current doctor: ${targetPatient.doctor || 'None'}`);
    
    // Find patient's appointments
    const patientAppointments = appointments.filter(apt => 
      apt.patient && apt.patient.toLowerCase().includes('farha')
    );
    
    console.log(`📅 Found ${patientAppointments.length} appointments for patient`);
    
    // Check appointments with doctors
    const appointmentsWithDoctors = patientAppointments.filter(apt => 
      apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
    );
    
    console.log(`👩‍⚕️ Appointments with doctors: ${appointmentsWithDoctors.length}`);
    
    let doctorToAssign = null;
    let assignmentSource = '';
    
    if (appointmentsWithDoctors.length > 0) {
      // Use doctor from most recent appointment
      const mostRecent = appointmentsWithDoctors
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      doctorToAssign = mostRecent.doctor;
      assignmentSource = 'from_appointment';
      
      console.log(`🎯 Using doctor from appointment: ${doctorToAssign}`);
      
    } else {
      // Find any doctor from all appointments
      const allDoctorsInSystem = appointments
        .filter(apt => apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned')
        .map(apt => apt.doctor);
      
      const uniqueDoctors = [...new Set(allDoctorsInSystem)];
      
      if (uniqueDoctors.length > 0) {
        doctorToAssign = uniqueDoctors[0];
        assignmentSource = 'auto_assignment';
        
        console.log(`🤖 Auto-assigning first available doctor: ${doctorToAssign}`);
        console.log(`👩‍⚕️ Available doctors in system:`, uniqueDoctors);
        
      } else {
        console.log('❌ No doctors found in any appointments');
        return { 
          success: false, 
          message: 'No doctors found in appointments. Please add doctors to appointments first.' 
        };
      }
    }
    
    if (doctorToAssign) {
      // Update patient with doctor information
      const patientRef = doc(db, 'patients', targetPatient.id);
      
      const updateData = {
        doctor: doctorToAssign,
        doctorId: doctorToAssign,
        doctorName: doctorToAssign,
        _lastDoctorSync: new Date().toISOString(),
        _doctorSyncSource: assignmentSource,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(patientRef, updateData);
      
      console.log(`✅ Successfully assigned doctor "${doctorToAssign}" to patient "${targetPatient.name}"`);
      
      // Trigger page refresh events
      window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
      window.dispatchEvent(new CustomEvent('appointmentPatientSync'));
      window.dispatchEvent(new CustomEvent('firebaseDataUpdate'));
      
      return {
        success: true,
        message: `Assigned doctor "${doctorToAssign}" to patient "${targetPatient.name}"`,
        doctor: doctorToAssign,
        patient: targetPatient.name,
        source: assignmentSource
      };
    }
    
    return { success: false, message: 'No doctor could be assigned' };
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    return { 
      success: false, 
      message: `Fix failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Fix all patients with missing doctors
export const emergencyFixAllPatientsWithoutDoctors = async (clinicId: string = 'demo-clinic') => {
  console.log('🚀 Emergency fix for ALL patients without doctors...');
  
  try {
    const db = getFirestore();
    
    // Get all data
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const patientsQuery = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Processing ${patients.length} patients and ${appointments.length} appointments`);
    
    let fixed = 0;
    const results = [];
    
    for (const patient of patients) {
      const hasDoctor = patient.doctor && patient.doctor.trim() !== '' && patient.doctor !== 'Not Assigned';
      
      if (!hasDoctor) {
        console.log(`🔧 Fixing patient: ${patient.name}`);
        
        // Find patient's appointments
        const patientAppointments = appointments.filter(apt => 
          apt.patient && patient.name && 
          apt.patient.toLowerCase().trim() === patient.name.toLowerCase().trim()
        );
        
        const appointmentsWithDoctors = patientAppointments.filter(apt => 
          apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
        );
        
        let doctorToAssign = null;
        
        if (appointmentsWithDoctors.length > 0) {
          // Use doctor from most recent appointment
          const mostRecent = appointmentsWithDoctors
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          doctorToAssign = mostRecent.doctor;
        } else {
          // Use any available doctor from the system
          const allDoctors = appointments
            .filter(apt => apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned')
            .map(apt => apt.doctor);
          const uniqueDoctors = [...new Set(allDoctors)];
          
          if (uniqueDoctors.length > 0) {
            doctorToAssign = uniqueDoctors[0];
          }
        }
        
        if (doctorToAssign) {
          try {
            const patientRef = doc(db, 'patients', patient.id);
            await updateDoc(patientRef, {
              doctor: doctorToAssign,
              doctorId: doctorToAssign,
              doctorName: doctorToAssign,
              _lastDoctorSync: new Date().toISOString(),
              _doctorSyncSource: 'emergency_bulk_fix',
              updatedAt: new Date().toISOString()
            });
            
            console.log(`✅ Fixed patient "${patient.name}" - assigned doctor: ${doctorToAssign}`);
            fixed++;
            results.push({
              patient: patient.name,
              doctor: doctorToAssign,
              success: true
            });
            
          } catch (error) {
            console.error(`❌ Failed to fix patient "${patient.name}":`, error);
            results.push({
              patient: patient.name,
              success: false,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        } else {
          console.log(`⚠️ No doctor available for patient "${patient.name}"`);
          results.push({
            patient: patient.name,
            success: false,
            error: 'No doctors available'
          });
        }
      } else {
        console.log(`ℹ️ Patient "${patient.name}" already has doctor: ${patient.doctor}`);
      }
    }
    
    console.log(`🎉 Emergency fix complete! Fixed ${fixed} patients.`);
    
    if (fixed > 0) {
      // Trigger refresh events
      window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
      window.dispatchEvent(new CustomEvent('appointmentPatientSync'));
      window.dispatchEvent(new CustomEvent('firebaseDataUpdate'));
    }
    
    return {
      success: true,
      fixed,
      total: patients.length,
      results
    };
    
  } catch (error) {
    console.error('❌ Bulk emergency fix failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).emergencyFixDoctorAssignment = emergencyFixDoctorAssignment;
  (window as any).emergencyFixAllPatientsWithoutDoctors = emergencyFixAllPatientsWithoutDoctors;
  
  // Convenient one-liner
  (window as any).fixDoctors = async () => {
    const result = await emergencyFixAllPatientsWithoutDoctors();
    
    if (result.success) {
      alert(`✅ Emergency Fix Complete!\n\nFixed ${result.fixed} out of ${result.total} patients.\n\nPage will refresh automatically.`);
      setTimeout(() => window.location.reload(), 2000);
    } else {
      alert(`❌ Emergency fix failed: ${result.message}`);
    }
    
    return result;
  };
}

export { emergencyFixDoctorAssignment, emergencyFixAllPatientsWithoutDoctors }; 