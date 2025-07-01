import ManualSyncUtility from './manualSync';

/**
 * EMERGENCY FIX
 * Run this immediately to fix appointment-patient sync issues
 */
export const EMERGENCY_FIX = async () => {
  console.log('🆘 EMERGENCY FIX: Starting immediate sync...');
  
  try {
    const result = await ManualSyncUtility.syncAppointmentsToPatients('demo-clinic');
    
    if ('error' in result) {
      console.error('❌ Emergency fix failed:', result.error);
      if (typeof window !== 'undefined') {
        alert(`❌ Emergency fix failed: ${result.error}`);
      }
      return false;
    } else {
      console.log('🎉 Emergency fix completed:', result);
      if (typeof window !== 'undefined') {
        alert(`🎉 EMERGENCY FIX COMPLETED!\n\n✅ Created ${result.patientsCreated} patients\n✅ Linked ${result.patientsLinked} existing patients\n✅ Processed ${result.appointmentsProcessed}/${result.totalAppointments} appointments\n\nRefresh the patient page to see your patients!`);
      }
      return true;
    }
  } catch (error) {
    console.error('❌ Emergency fix error:', error);
    if (typeof window !== 'undefined') {
      alert(`❌ Emergency fix error: ${error}`);
    }
    return false;
  }
};

/**
 * QUICK FIX - Just create patients without detailed linking
 */
export const QUICK_FIX = async () => {
  console.log('⚡ QUICK FIX: Creating patients from appointments...');
  
  try {
    const result = await ManualSyncUtility.quickCreatePatientsFromAppointments('demo-clinic');
    console.log('⚡ Quick fix completed:', result);
    if (typeof window !== 'undefined') {
      alert(`⚡ QUICK FIX COMPLETED!\n\n✅ Created ${result.created} patients from appointments\n\nRefresh the patient page to see your patients!`);
    }
    return true;
  } catch (error) {
    console.error('❌ Quick fix error:', error);
    if (typeof window !== 'undefined') {
      alert(`❌ Quick fix error: ${error}`);
    }
    return false;
  }
};

// Make them available globally
(window as any).EMERGENCY_FIX = EMERGENCY_FIX;
(window as any).QUICK_FIX = QUICK_FIX;

// Also make them easier to access
(window as any).emergencyFix = EMERGENCY_FIX;
(window as any).quickFix = QUICK_FIX;
(window as any).fixNow = EMERGENCY_FIX;

console.log('🆘 Emergency Fix Commands Available:');
console.log('   EMERGENCY_FIX() - Full sync with detailed results');
console.log('   QUICK_FIX() - Quick patient creation');
console.log('   emergencyFix() - Shortcut for full sync');
console.log('   quickFix() - Shortcut for quick fix');
console.log('   fixNow() - Another shortcut for full sync');

export default { EMERGENCY_FIX, QUICK_FIX }; 