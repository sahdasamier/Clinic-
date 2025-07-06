/**
 * Quick Doctor Assignment Fix
 * 
 * Immediate console commands to fix doctor assignment issues
 */

// Simple function that can be copied and pasted into console
export const instantDoctorFix = `
// 🚀 INSTANT DOCTOR ASSIGNMENT FIX
// Copy and paste this entire block into your browser console:

(async function() {
  console.log('🚀 Starting instant doctor assignment fix...');
  
  try {
    // Import required services
    const { AppointmentService } = await import('./services/AppointmentService');
    const { PatientService } = await import('./services/PatientService');
    
    // Get data
    const appointments = await AppointmentService.getAllAppointments('demo-clinic');
    const patients = await PatientService.searchPatients('demo-clinic', '');
    
    console.log(\`📊 Found \${appointments.length} appointments, \${patients.length} patients\`);
    
    // Check if appointments have doctors
    const appointmentsWithDoctors = appointments.filter(apt => 
      apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
    );
    
    console.log(\`👩‍⚕️ Appointments with doctors: \${appointmentsWithDoctors.length}\`);
    
    if (appointmentsWithDoctors.length === 0) {
      console.log('❌ No appointments have doctor information!');
      console.log('💡 You need to add doctors to appointments first.');
      return;
    }
    
    // Fix patients
    let fixed = 0;
    
    for (const patient of patients) {
      const patientAppointments = appointments.filter(apt => 
        apt.patient && apt.patient.toLowerCase().trim() === patient.name?.toLowerCase().trim()
      );
      
      const appointmentsWithDoctor = patientAppointments.filter(apt => 
        apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
      );
      
      if (appointmentsWithDoctor.length > 0) {
        // Get most recent appointment with doctor
        const mostRecent = appointmentsWithDoctor
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        const patientHasDoctor = patient.doctor && patient.doctor.trim() !== '' && patient.doctor !== 'Not Assigned';
        
        if (!patientHasDoctor) {
          try {
            await PatientService.updatePatient(patient.id, {
              doctor: mostRecent.doctor,
              doctorId: mostRecent.doctorId || mostRecent.doctor,
              doctorName: mostRecent.doctor,
              _lastDoctorSync: new Date().toISOString(),
              _doctorSyncSource: 'instant_fix'
            });
            
            console.log(\`✅ Fixed patient "\${patient.name}" - assigned doctor: \${mostRecent.doctor}\`);
            fixed++;
          } catch (error) {
            console.error(\`❌ Failed to fix patient "\${patient.name}":\`, error);
          }
        }
      }
    }
    
    console.log(\`🎉 Instant fix complete! Fixed \${fixed} patients.\`);
    
    if (fixed > 0) {
      console.log('🔄 Refreshing page data...');
      window.location.reload();
    }
    
  } catch (error) {
    console.error('❌ Instant fix failed:', error);
    console.log('💡 Try the manual approach or check if you are logged in.');
  }
})();
`;

// Make instant fix available globally
if (typeof window !== 'undefined') {
  (window as any).instantDoctorFix = () => {
    console.log(instantDoctorFix);
    console.log('📋 Copy the code above and paste it in the console to run the fix!');
  };
  
  // Also provide a direct executable version
  (window as any).runInstantDoctorFix = async () => {
    console.log('🚀 Starting instant doctor assignment fix...');
    
    try {
      // Import required services
      const { AppointmentService } = await import('../services/AppointmentService');
      const { PatientService } = await import('../services/PatientService');
      
      // Get data
      const appointments = await AppointmentService.getAllAppointments('demo-clinic');
      const patients = await PatientService.searchPatients('demo-clinic', '');
      
      console.log(`📊 Found ${appointments.length} appointments, ${patients.length} patients`);
      
      // Check if appointments have doctors
      const appointmentsWithDoctors = appointments.filter(apt => 
        apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
      );
      
      console.log(`👩‍⚕️ Appointments with doctors: ${appointmentsWithDoctors.length}`);
      
      if (appointmentsWithDoctors.length === 0) {
        console.log('❌ No appointments have doctor information!');
        console.log('💡 You need to add doctors to appointments first.');
        console.log('💡 Go to appointments page and assign doctors to appointments.');
        return 0;
      }
      
      // Show available doctors in appointments
      const uniqueDoctors = [...new Set(appointmentsWithDoctors.map(apt => apt.doctor))];
      console.log(`👩‍⚕️ Available doctors in appointments:`, uniqueDoctors);
      
      // Fix patients
      let fixed = 0;
      
      for (const patient of patients) {
        const patientAppointments = appointments.filter(apt => 
          apt.patient && apt.patient.toLowerCase().trim() === patient.name?.toLowerCase().trim()
        );
        
        const appointmentsWithDoctor = patientAppointments.filter(apt => 
          apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
        );
        
        if (appointmentsWithDoctor.length > 0) {
          // Get most recent appointment with doctor
          const mostRecent = appointmentsWithDoctor
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          const patientHasDoctor = patient.doctor && patient.doctor.trim() !== '' && patient.doctor !== 'Not Assigned';
          
          if (!patientHasDoctor) {
            try {
              await PatientService.updatePatient(patient.id, {
                doctor: mostRecent.doctor,
                doctorId: mostRecent.doctorId || mostRecent.doctor,
                doctorName: mostRecent.doctor,
                _lastDoctorSync: new Date().toISOString(),
                _doctorSyncSource: 'instant_fix'
              });
              
              console.log(`✅ Fixed patient "${patient.name}" - assigned doctor: ${mostRecent.doctor}`);
              fixed++;
            } catch (error) {
              console.error(`❌ Failed to fix patient "${patient.name}":`, error);
            }
          } else {
            console.log(`ℹ️ Patient "${patient.name}" already has doctor: ${patient.doctor}`);
          }
        } else {
          console.log(`⚠️ Patient "${patient.name}" has no appointments with doctors`);
        }
      }
      
      console.log(`🎉 Instant fix complete! Fixed ${fixed} patients.`);
      
      if (fixed > 0) {
        console.log('🔄 Triggering page refresh for updates...');
        
        // Trigger refresh events
        window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
        window.dispatchEvent(new CustomEvent('appointmentPatientSync'));
        
        // Show success message
        alert(`✅ Doctor Assignment Fix Complete!\n\nFixed ${fixed} patients with doctor information from appointments.\n\nThe page will refresh automatically to show the updates.`);
        
        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert('ℹ️ No patients needed doctor assignment fixes.\n\nEither all patients already have doctors assigned,\nor the appointments don\'t contain doctor information.');
      }
      
      return fixed;
      
    } catch (error) {
      console.error('❌ Instant fix failed:', error);
      alert(`❌ Instant fix failed: ${error}\n\nPlease check the console for details and ensure you are logged in.`);
      return 0;
    }
  };
} 