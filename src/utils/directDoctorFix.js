/**
 * DIRECT DOCTOR FIX - Copy and paste this entire file into browser console
 * Fixes: "Dr. Current Doctor", invalid doctor IDs, missing patient doctors
 */

window.directDoctorFix = async function() {
  console.log('🚀 DIRECT DOCTOR FIX STARTING...');
  
  try {
    // Import Firebase functions
    const { getFirestore, collection, getDocs, query, where, writeBatch, doc } = await import('firebase/firestore');
    
    const db = getFirestore();
    const batch = writeBatch(db);
    const clinicId = 'demo-clinic';
    
    console.log('👩‍⚕️ Getting available doctors...');
    
    // 1. Get available doctors
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
    }));
    
    console.log('✅ Available doctors:', doctors.map(d => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`
    })));
    
    if (doctors.length === 0) {
      console.error('❌ No doctors found!');
      alert('❌ No doctors found in the clinic!');
      return false;
    }
    
    const defaultDoctor = doctors[0];
    const defaultDoctorName = `${defaultDoctor.firstName} ${defaultDoctor.lastName}`;
    
    console.log(`🎯 Using default doctor: ${defaultDoctorName} (${defaultDoctor.id})`);
    
    // 2. Fix appointments
    console.log('📅 Getting and fixing appointments...');
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
    }));
    
    console.log(`📊 Found ${appointments.length} appointments`);
    
    let appointmentsFixed = 0;
    const appointmentIssues = [];
    
    appointments.forEach(appointment => {
      let needsUpdate = false;
      const updates = {};
      const issues = [];
      
      // Fix "Dr. Current Doctor"
      if (appointment.doctor === 'Dr. Current Doctor') {
        updates.doctor = defaultDoctorName;
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        issues.push('Fixed "Dr. Current Doctor"');
        console.log(`📋 Fixing "Dr. Current Doctor" for patient: ${appointment.patient}`);
      }
      
      // Fix specific invalid doctor ID from your console log
      if (appointment.doctorId === '3BcfQxPgu6W9Gn1dIlZy3MfjOXz2') {
        updates.doctorId = defaultDoctor.id;
        if (!appointment.doctor || appointment.doctor === 'Dr. Current Doctor') {
          updates.doctor = defaultDoctorName;
        }
        needsUpdate = true;
        issues.push('Fixed invalid doctor ID');
        console.log(`🔧 Fixing invalid doctor ID for patient: ${appointment.patient}`);
      }
      
      // Fix missing or invalid doctor info
      if (!appointment.doctor || appointment.doctor === 'Not Assigned') {
        updates.doctor = defaultDoctorName;
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        issues.push('Assigned missing doctor');
        console.log(`👩‍⚕️ Assigning doctor to patient: ${appointment.patient}`);
      }
      
      // Fix missing doctor ID when doctor name exists
      if (appointment.doctor && 
          appointment.doctor !== 'Not Assigned' && 
          appointment.doctor !== 'Dr. Current Doctor' && 
          !appointment.doctorId) {
        updates.doctorId = defaultDoctor.id;
        needsUpdate = true;
        issues.push('Added missing doctor ID');
        console.log(`🆔 Adding doctor ID for patient: ${appointment.patient}`);
      }
      
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updates._directFix = new Date().toISOString();
        batch.update(appointment.ref, updates);
        appointmentsFixed++;
        appointmentIssues.push(`${appointment.patient}: ${issues.join(', ')}`);
      }
    });
    
    // 3. Fix patients
    console.log('👥 Getting and fixing patients...');
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
    }));
    
    console.log(`👤 Found ${patients.length} patients`);
    
    let patientsFixed = 0;
    const patientIssues = [];
    
    patients.forEach(patient => {
      let needsUpdate = false;
      const updates = {};
      const issues = [];
      
      // Check if patient needs doctor assignment
      const hasValidDoctor = patient.doctor && 
                           patient.doctor !== 'Not Assigned' && 
                           patient.doctor.trim() !== '';
      const hasValidDoctorId = patient.doctorId && 
                             doctors.find(d => d.id === patient.doctorId);
      
      if (!hasValidDoctor || !hasValidDoctorId) {
        // Try to get doctor from appointments first
        const patientAppointments = appointments.filter(apt => 
          apt.patient?.toLowerCase().trim() === patient.name?.toLowerCase().trim()
        );
        
        const appointmentWithDoctor = patientAppointments.find(apt => 
          apt.doctor && 
          apt.doctor !== 'Not Assigned' && 
          apt.doctor !== 'Dr. Current Doctor' &&
          apt.doctor.trim() !== ''
        );
        
        if (appointmentWithDoctor) {
          updates.doctor = appointmentWithDoctor.doctor;
          updates.doctorId = appointmentWithDoctor.doctorId || defaultDoctor.id;
          updates.doctorName = appointmentWithDoctor.doctor;
          issues.push('Synced from appointment');
          console.log(`🔄 Syncing doctor from appointment for patient: ${patient.name}`);
        } else {
          updates.doctor = defaultDoctorName;
          updates.doctorId = defaultDoctor.id;
          updates.doctorName = defaultDoctorName;
          issues.push('Assigned default doctor');
          console.log(`👩‍⚕️ Assigning default doctor to patient: ${patient.name}`);
        }
        
        needsUpdate = true;
      }
      
      // Fix invalid doctor ID
      if (patient.doctorId && !doctors.find(d => d.id === patient.doctorId)) {
        updates.doctorId = defaultDoctor.id;
        if (!hasValidDoctor) {
          updates.doctor = defaultDoctorName;
          updates.doctorName = defaultDoctorName;
        }
        needsUpdate = true;
        issues.push('Fixed invalid doctor ID');
        console.log(`🔧 Fixing invalid doctor ID for patient: ${patient.name}`);
      }
      
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updates._directFix = new Date().toISOString();
        batch.update(patient.ref, updates);
        patientsFixed++;
        patientIssues.push(`${patient.name}: ${issues.join(', ')}`);
      }
    });
    
    // 4. Commit all changes
    if (appointmentsFixed > 0 || patientsFixed > 0) {
      console.log(`📝 Committing ${appointmentsFixed} appointment fixes and ${patientsFixed} patient fixes...`);
      await batch.commit();
      
      console.log('✅ DIRECT FIX COMPLETED SUCCESSFULLY!');
      console.log('📋 Appointment Issues Fixed:', appointmentIssues);
      console.log('👤 Patient Issues Fixed:', patientIssues);
      
      // Trigger refresh events
      try {
        window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
        window.dispatchEvent(new CustomEvent('firebaseDataUpdate'));
      } catch (e) {
        console.log('Note: Could not trigger refresh events');
      }
      
      alert(`✅ DOCTOR FIX COMPLETED SUCCESSFULLY!

Fixed Issues:
• ${appointmentsFixed} appointments
• ${patientsFixed} patients

The following were resolved:
- "Dr. Current Doctor" placeholders
- Invalid doctor ID: 3BcfQxPgu6W9Gn1dIlZy3MfjOXz2
- Missing patient doctor assignments

Please refresh your appointment and patient pages to see the changes.`);
      
      return true;
    } else {
      console.log('✅ No issues found - all doctor data is consistent');
      alert('✅ No doctor issues found - all data appears to be consistent');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Direct fix failed:', error);
    alert(`❌ Direct fix failed: ${error.message}

Make sure you are:
1. Logged into the app
2. On a page where Firebase is loaded
3. Have proper permissions

Error details in console.`);
    return false;
  }
};

// Auto-run message
console.log(`
🩺 DIRECT DOCTOR FIX LOADED!

To fix your doctor issues, run:
directDoctorFix()

This will fix:
✅ "Dr. Current Doctor" placeholders
✅ Invalid doctor ID: 3BcfQxPgu6W9Gn1dIlZy3MfjOXz2  
✅ Missing patient doctor assignments
✅ Sync issues between appointments and patients
`); 