/**
 * Doctor Assignment Debugger and Fixer
 * 
 * This utility helps debug and fix doctor assignment issues between appointments and patients.
 */

import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
import { syncDoctorInformationAuto } from './doctorSync';
import { FirebaseDataBridge } from './firebaseFriendlySync';

interface DebugResult {
  appointments: any[];
  patients: any[];
  doctorMatches: any[];
  issues: string[];
  recommendations: string[];
}

/**
 * Comprehensive debug of patient-doctor assignment
 */
export const debugPatientDoctorAssignment = async (clinicId: string = 'demo-clinic'): Promise<DebugResult> => {
  console.log('🔍 Starting comprehensive patient-doctor debug...');
  
  try {
    // Get all data
    const appointments = await AppointmentService.getAllAppointments(clinicId);
    const patients = await PatientService.searchPatients(clinicId, '');
    
    console.log(`📊 Data Overview:`);
    console.log(`   • Appointments: ${appointments.length}`);
    console.log(`   • Patients: ${patients.length}`);
    
    // Analyze appointment doctor data
    const appointmentsWithDoctors = appointments.filter(apt => 
      apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
    );
    
    console.log(`   • Appointments with doctors: ${appointmentsWithDoctors.length}`);
    
    // Analyze patient doctor data
    const patientsWithDoctors = patients.filter(p => 
      p.doctor && p.doctor.trim() !== '' && p.doctor !== 'Not Assigned'
    );
    
    console.log(`   • Patients with doctors: ${patientsWithDoctors.length}`);
    
    // Find doctor matches
    const doctorMatches: any[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check each patient
    patients.forEach(patient => {
      const patientAppointments = appointments.filter(apt => 
        apt.patient && apt.patient.toLowerCase().trim() === patient.name?.toLowerCase().trim()
      );
      
      const appointmentsWithDoctor = patientAppointments.filter(apt => 
        apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned'
      );
      
      const patientHasDoctor = patient.doctor && patient.doctor.trim() !== '' && patient.doctor !== 'Not Assigned';
      
      const match = {
        patientName: patient.name,
        patientId: patient.id,
        currentPatientDoctor: patient.doctor || 'None',
        patientDoctorId: patient.doctorId || 'None',
        totalAppointments: patientAppointments.length,
        appointmentsWithDoctor: appointmentsWithDoctor.length,
        appointmentDoctors: appointmentsWithDoctor.map(apt => ({
          date: apt.date,
          doctor: apt.doctor,
          doctorId: apt.doctorId
        })),
        needsSync: appointmentsWithDoctor.length > 0 && !patientHasDoctor,
        hasConflict: patientHasDoctor && appointmentsWithDoctor.length > 0 && 
                    !appointmentsWithDoctor.some(apt => apt.doctor === patient.doctor)
      };
      
      doctorMatches.push(match);
      
      if (match.needsSync) {
        issues.push(`Patient "${patient.name}" has appointments with doctors but no doctor assigned`);
        recommendations.push(`Sync doctor from appointments for patient "${patient.name}"`);
      }
      
      if (match.hasConflict) {
        issues.push(`Patient "${patient.name}" has different doctor in appointments vs patient record`);
        recommendations.push(`Update patient "${patient.name}" doctor to match most recent appointment`);
      }
    });
    
    // Display results
    console.log(`\n🔍 DETAILED ANALYSIS:`);
    doctorMatches.forEach(match => {
      console.log(`\n👤 Patient: ${match.patientName}`);
      console.log(`   Current Doctor: ${match.currentPatientDoctor}`);
      console.log(`   Appointments: ${match.totalAppointments} total, ${match.appointmentsWithDoctor} with doctors`);
      if (match.appointmentDoctors.length > 0) {
        console.log(`   Appointment Doctors:`, match.appointmentDoctors);
      }
      if (match.needsSync) {
        console.log(`   ⚠️  NEEDS SYNC: Patient has no doctor but appointments have doctors`);
      }
      if (match.hasConflict) {
        console.log(`   ⚠️  CONFLICT: Patient doctor differs from appointment doctors`);
      }
    });
    
    console.log(`\n❌ ISSUES FOUND: ${issues.length}`);
    issues.forEach(issue => console.log(`   • ${issue}`));
    
    console.log(`\n💡 RECOMMENDATIONS: ${recommendations.length}`);
    recommendations.forEach(rec => console.log(`   • ${rec}`));
    
    return {
      appointments,
      patients,
      doctorMatches,
      issues,
      recommendations
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  }
};

/**
 * Quick fix to assign doctors from appointments to patients
 */
export const quickFixDoctorAssignment = async (clinicId: string = 'demo-clinic'): Promise<number> => {
  console.log('🚀 Starting quick doctor assignment fix...');
  
  try {
    const debug = await debugPatientDoctorAssignment(clinicId);
    
    const patientsToFix = debug.doctorMatches.filter(match => match.needsSync);
    
    if (patientsToFix.length === 0) {
      console.log('✅ No patients need doctor assignment fixes');
      return 0;
    }
    
    console.log(`🔧 Fixing ${patientsToFix.length} patients...`);
    
    let fixed = 0;
    
    for (const match of patientsToFix) {
      if (match.appointmentDoctors.length > 0) {
        // Get the most recent appointment doctor
        const mostRecentDoctor = match.appointmentDoctors[0];
        
        try {
          await PatientService.updatePatient(match.patientId, {
            doctor: mostRecentDoctor.doctor,
            doctorId: mostRecentDoctor.doctorId || mostRecentDoctor.doctor,
            doctorName: mostRecentDoctor.doctor,
            _lastDoctorSync: new Date().toISOString(),
            _doctorSyncSource: 'manual_fix'
          });
          
          console.log(`✅ Fixed patient "${match.patientName}" - assigned doctor: ${mostRecentDoctor.doctor}`);
          fixed++;
          
        } catch (error) {
          console.error(`❌ Failed to fix patient "${match.patientName}":`, error);
        }
      }
    }
    
    if (fixed > 0) {
      // Refresh all pages
      await FirebaseDataBridge.refreshAll(clinicId);
      console.log(`🎉 Quick fix complete! Fixed ${fixed} patients. All pages will update automatically.`);
    }
    
    return fixed;
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    throw error;
  }
};

/**
 * Manual doctor assignment for specific patients
 */
export const manualAssignDoctor = async (
  patientNames: string[], 
  doctorName: string, 
  doctorId?: string,
  clinicId: string = 'demo-clinic'
): Promise<number> => {
  console.log(`🔧 Manually assigning doctor "${doctorName}" to ${patientNames.length} patients...`);
  
  try {
    const patients = await PatientService.searchPatients(clinicId, '');
    
    let assigned = 0;
    
    for (const patientName of patientNames) {
      const patient = patients.find(p => 
        p.name?.toLowerCase().trim() === patientName.toLowerCase().trim()
      );
      
      if (patient) {
        try {
          await PatientService.updatePatient(patient.id, {
            doctor: doctorName,
            doctorId: doctorId || doctorName,
            doctorName: doctorName,
            _lastDoctorSync: new Date().toISOString(),
            _doctorSyncSource: 'manual_assignment'
          });
          
          console.log(`✅ Assigned doctor "${doctorName}" to patient "${patient.name}"`);
          assigned++;
          
        } catch (error) {
          console.error(`❌ Failed to assign doctor to patient "${patient.name}":`, error);
        }
      } else {
        console.warn(`⚠️ Patient "${patientName}" not found`);
      }
    }
    
    if (assigned > 0) {
      // Refresh all pages
      await FirebaseDataBridge.refreshAll(clinicId);
      console.log(`🎉 Manual assignment complete! Assigned doctor to ${assigned} patients.`);
    }
    
    return assigned;
    
  } catch (error) {
    console.error('❌ Manual assignment failed:', error);
    throw error;
  }
};

/**
 * Check if appointments actually have doctor information
 */
export const checkAppointmentDoctorData = async (clinicId: string = 'demo-clinic'): Promise<void> => {
  console.log('🔍 Checking appointment doctor data...');
  
  try {
    const appointments = await AppointmentService.getAllAppointments(clinicId);
    
    console.log(`📊 Appointment Doctor Analysis:`);
    console.log(`   Total appointments: ${appointments.length}`);
    
    const doctorStats = {
      withDoctor: 0,
      withDoctorId: 0,
      withBoth: 0,
      withNeither: 0,
      uniqueDoctors: new Set<string>(),
      uniqueDoctorIds: new Set<string>()
    };
    
    appointments.forEach(apt => {
      const hasDoctor = apt.doctor && apt.doctor.trim() !== '' && apt.doctor !== 'Not Assigned';
      const hasDoctorId = apt.doctorId && apt.doctorId.trim() !== '';
      
      if (hasDoctor) {
        doctorStats.withDoctor++;
        doctorStats.uniqueDoctors.add(apt.doctor);
      }
      
      if (hasDoctorId) {
        doctorStats.withDoctorId++;
        doctorStats.uniqueDoctorIds.add(apt.doctorId);
      }
      
      if (hasDoctor && hasDoctorId) {
        doctorStats.withBoth++;
      }
      
      if (!hasDoctor && !hasDoctorId) {
        doctorStats.withNeither++;
      }
    });
    
    console.log(`   With doctor name: ${doctorStats.withDoctor}`);
    console.log(`   With doctor ID: ${doctorStats.withDoctorId}`);
    console.log(`   With both: ${doctorStats.withBoth}`);
    console.log(`   With neither: ${doctorStats.withNeither}`);
    console.log(`   Unique doctors: ${doctorStats.uniqueDoctors.size}`);
    console.log(`   Unique doctor IDs: ${doctorStats.uniqueDoctorIds.size}`);
    
    if (doctorStats.uniqueDoctors.size > 0) {
      console.log(`\n👩‍⚕️ Doctors found in appointments:`);
      Array.from(doctorStats.uniqueDoctors).forEach(doctor => {
        console.log(`   • ${doctor}`);
      });
    }
    
    if (doctorStats.withNeither > 0) {
      console.log(`\n⚠️ WARNING: ${doctorStats.withNeither} appointments have no doctor information!`);
      console.log(`   This means patients cannot get doctor assignments from these appointments.`);
      console.log(`   Consider adding doctors to appointments or manually assigning doctors to patients.`);
    }
    
  } catch (error) {
    console.error('❌ Appointment doctor data check failed:', error);
    throw error;
  }
};

/**
 * Complete doctor assignment solution
 */
export const completeDoctorAssignmentSolution = async (clinicId: string = 'demo-clinic'): Promise<void> => {
  console.log('🚀 RUNNING COMPLETE DOCTOR ASSIGNMENT SOLUTION...');
  console.log('==================================================');
  
  try {
    // Step 1: Check appointment doctor data
    console.log('🔍 STEP 1: Checking appointment doctor data...');
    await checkAppointmentDoctorData(clinicId);
    
    // Step 2: Run comprehensive debug
    console.log('\n🔍 STEP 2: Running comprehensive debug...');
    const debug = await debugPatientDoctorAssignment(clinicId);
    
    // Step 3: Try automatic sync first
    console.log('\n🔄 STEP 3: Trying automatic doctor sync...');
    const syncResult = await syncDoctorInformationAuto(clinicId);
    console.log('Sync result:', syncResult);
    
    // Step 4: If sync didn't fix everything, run quick fix
    console.log('\n🔧 STEP 4: Running quick fix for remaining issues...');
    const fixedCount = await quickFixDoctorAssignment(clinicId);
    
    // Step 5: Final verification
    console.log('\n✅ STEP 5: Final verification...');
    const finalDebug = await debugPatientDoctorAssignment(clinicId);
    
    console.log('\n🎉 SOLUTION COMPLETE!');
    console.log('==================================================');
    console.log(`   • Patients with doctors: ${finalDebug.doctorMatches.filter(m => m.currentPatientDoctor !== 'None').length}`);
    console.log(`   • Remaining issues: ${finalDebug.issues.length}`);
    
    if (finalDebug.issues.length === 0) {
      console.log('✅ All doctor assignment issues resolved!');
    } else {
      console.log('⚠️ Some issues remain. Consider manual assignment.');
    }
    
  } catch (error) {
    console.error('❌ Complete solution failed:', error);
    throw error;
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).debugPatientDoctorAssignment = debugPatientDoctorAssignment;
  (window as any).quickFixDoctorAssignment = quickFixDoctorAssignment;
  (window as any).manualAssignDoctor = manualAssignDoctor;
  (window as any).checkAppointmentDoctorData = checkAppointmentDoctorData;
  (window as any).completeDoctorAssignmentSolution = completeDoctorAssignmentSolution;
}

export {
  debugPatientDoctorAssignment,
  quickFixDoctorAssignment,
  manualAssignDoctor,
  checkAppointmentDoctorData,
  completeDoctorAssignmentSolution
}; 