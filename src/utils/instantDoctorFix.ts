/**
 * INSTANT DOCTOR FIX - The fastest way to fix all doctor assignment issues
 * This function combines the best of all fix utilities for maximum effectiveness
 */

import { comprehensiveDoctorFix } from './comprehensiveDoctorFix';
import { quickFixDoctorIssues } from './quickDoctorFix';

/**
 * Instant Doctor Fix - Runs the most effective fixes in sequence
 */
export const runInstantDoctorFix = async (clinicId: string = 'demo-clinic'): Promise<boolean> => {
  console.log('🚀 INSTANT DOCTOR FIX - Starting the fastest comprehensive solution...');
  console.log('================================================================');
  
  try {
    // Step 1: Quick fix for placeholder values and invalid IDs
    console.log('⚡ STEP 1: Fixing placeholder values and invalid IDs...');
    const quickFixResult = await quickFixDoctorIssues();
    
    if (quickFixResult) {
      console.log('✅ Quick fixes applied successfully');
    } else {
      console.log('⚠️ Quick fix completed with warnings');
    }
    
    // Step 2: Comprehensive fix for all remaining issues
    console.log('🔧 STEP 2: Running comprehensive doctor assignment fix...');
    const comprehensiveResult = await comprehensiveDoctorFix(clinicId);
    
    // Step 3: Trigger data refresh
    console.log('🔄 STEP 3: Refreshing application data...');
    window.dispatchEvent(new CustomEvent('doctorAssignmentChanged'));
    window.dispatchEvent(new CustomEvent('firebaseDataUpdate'));
    
    // Results summary
    console.log('');
    console.log('🎉 INSTANT FIX RESULTS:');
    console.log('=======================');
    console.log(`✅ Comprehensive fix: ${comprehensiveResult.success ? 'Success' : 'Failed'}`);
    console.log(`📊 Appointments fixed: ${comprehensiveResult.appointmentsFixed}`);
    console.log(`👥 Patients fixed: ${comprehensiveResult.patientsFixed}`);
    
    if (comprehensiveResult.success) {
      console.log('');
      console.log('🎊 ALL DOCTOR ISSUES FIXED INSTANTLY!');
      console.log('Please refresh your application to see the changes.');
      
      // Show success alert
      if (typeof window !== 'undefined' && window.alert) {
        alert(`🎉 INSTANT FIX COMPLETE!\n\n✅ Fixed ${comprehensiveResult.appointmentsFixed} appointments\n✅ Fixed ${comprehensiveResult.patientsFixed} patients\n\nPlease refresh your browser to see all changes!`);
      }
      
      return true;
    } else {
      console.log('⚠️ Some issues may remain:', comprehensiveResult.message);
      
      // Show partial success alert
      if (typeof window !== 'undefined' && window.alert) {
        alert(`⚡ INSTANT FIX PARTIAL SUCCESS\n\n✅ Fixed ${comprehensiveResult.appointmentsFixed} appointments\n✅ Fixed ${comprehensiveResult.patientsFixed} patients\n\n⚠️ Some issues remain: ${comprehensiveResult.message}\n\nPlease refresh your browser and check the console for details.`);
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Instant fix failed:', error);
    
    if (typeof window !== 'undefined' && window.alert) {
      alert(`❌ INSTANT FIX FAILED\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nTry running individual fix functions:\n• completeDoctorAssignmentSolution()\n• quickFixDoctorIssues()\n• debugPatientDoctorAssignment()`);
    }
    
    return false;
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).runInstantDoctorFix = runInstantDoctorFix;
}

export default runInstantDoctorFix; 