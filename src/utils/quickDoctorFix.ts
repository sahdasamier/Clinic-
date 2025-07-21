/**
 * Quick Doctor Fix - Run this in browser console
 * Fixes the specific issues: "Dr. Current Doctor", invalid IDs, missing patient doctors
 */

import { getFirestore, collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';

export const quickFixDoctorIssues = async () => {
  console.log('🚀 Quick Doctor Fix Starting...');
  
  try {
    const db = getFirestore();
    const batch = writeBatch(db);
    const clinicId = 'demo-clinic';
    
    // 1. Get available doctors
    console.log('👩‍⚕️ Getting available doctors...');
    const doctorsQuery = query(
      collection(db, 'users'),
      where('clinicId', '==', clinicId),
      where('role', '==', 'doctor'),
      where('isActive', '==', true)
    );
    const doctorsSnapshot = await getDocs(doctorsQuery);
    const doctors = doctorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    console.log('✅ Available doctors:', doctors.map(d => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`
    })));
    
    if (doctors.length === 0) {
      console.error('❌ No doctors found!');
      return false;
    }
    
    const defaultDoctor = doctors[0];
    const defaultDoctorName = `${defaultDoctor.firstName} ${defaultDoctor.lastName}`;
    
    // 2. Fix appointments
    console.log('📅 Fixing appointments...');
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
    
    let appointmentsFixed = 0;
    appointments.forEach(appointment => {
      let needsUpdate = false;
      const updates: any = {};
      
      // Fix "Dr. Current Doctor"
      if (appointment.doctor === 'Dr. Current Doctor') {
        updates.doctor = defaultDoctorName;
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        console.log(`📋 Fixing "Dr. Current Doctor" for patient: ${appointment.patient}`);
      }
      
      // Fix invalid doctor ID "3BcfQxPgu6W9Gn1dIlZy3MfjOXz2"
      if (appointment.doctorId === '3BcfQxPgu6W9Gn1dIlZy3MfjOXz2') {
        updates.doctorId = defaultDoctor.id;
        if (!appointment.doctor || appointment.doctor === 'Dr. Current Doctor') {
          updates.doctor = defaultDoctorName;
        }
        needsUpdate = true;
        console.log(`🔧 Fixing invalid doctor ID for patient: ${appointment.patient}`);
      }
      
      // Fix missing or invalid doctor info
      if (!appointment.doctor || appointment.doctor === 'Not Assigned') {
        updates.doctor = defaultDoctorName;
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        console.log(`👩‍⚕️ Assigning doctor to patient: ${appointment.patient}`);
      }
      
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updates._quickFix = new Date().toISOString();
        batch.update(appointment.ref, updates);
        appointmentsFixed++;
      }
    });
    
    // 3. Fix patients
    console.log('👥 Fixing patients...');
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
    
    let patientsFixed = 0;
    patients.forEach(patient => {
      let needsUpdate = false;
      const updates: any = {};
      
      // Fix missing doctor info
      if (!patient.doctor || patient.doctor === 'Not Assigned' || !patient.doctorId) {
        // Try to get doctor from appointments first
        const patientAppointments = appointments.filter(apt => 
          apt.patient?.toLowerCase().trim() === patient.name?.toLowerCase().trim()
        );
        
        const appointmentWithDoctor = patientAppointments.find(apt => 
          apt.doctor && apt.doctor !== 'Not Assigned' && apt.doctor !== 'Dr. Current Doctor'
        );
        
        if (appointmentWithDoctor) {
          updates.doctor = appointmentWithDoctor.doctor;
          updates.doctorId = appointmentWithDoctor.doctorId || defaultDoctor.id;
          console.log(`🔄 Syncing doctor from appointment for patient: ${patient.name}`);
        } else {
          updates.doctor = defaultDoctorName;
          updates.doctorId = defaultDoctor.id;
          console.log(`👩‍⚕️ Assigning default doctor to patient: ${patient.name}`);
        }
        
        updates.doctorName = updates.doctor;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updates._quickFix = new Date().toISOString();
        batch.update(patient.ref, updates);
        patientsFixed++;
      }
    });
    
    // 4. Commit all changes
    if (appointmentsFixed > 0 || patientsFixed > 0) {
      console.log(`📝 Committing ${appointmentsFixed} appointment fixes and ${patientsFixed} patient fixes...`);
      await batch.commit();
      
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
      window.dispatchEvent(new CustomEvent('firebaseDataUpdate'));
      
      console.log(`✅ Quick fix completed! Fixed ${appointmentsFixed} appointments and ${patientsFixed} patients`);
      alert(`✅ Doctor fix completed!\n\nFixed:\n• ${appointmentsFixed} appointments\n• ${patientsFixed} patients\n\nPlease refresh your pages to see the changes.`);
      
      return true;
    } else {
      console.log('✅ No issues found - all doctor data is consistent');
      alert('✅ No doctor issues found - all data is consistent');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    alert(`❌ Quick fix failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

// Make it available globally
(window as any).quickFixDoctorIssues = quickFixDoctorIssues;

export default quickFixDoctorIssues; 