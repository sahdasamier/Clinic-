import ManualSyncUtility from './manualSync';

/**
 * Immediate Sync Utility
 * Runs immediately when the app loads to fix any sync issues
 */
export class ImmediateSyncUtility {
  private static hasRun = false;

  /**
   * Run immediate sync check
   */
  static async runImmediateSync() {
    if (this.hasRun) return;
    this.hasRun = true;

    console.log('⚡ ImmediateSyncUtility: Starting immediate sync check...');

    // Wait for app to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const clinicId = 'demo-clinic';
      
      // Check if we have the sync issue
      const debugInfo = await ManualSyncUtility.debugClinicData(clinicId);
      
      console.log('⚡ ImmediateSyncUtility: Debug info:', debugInfo);
      
      // If we have appointments but no patients, fix immediately
      if (debugInfo.appointments > 0 && debugInfo.patients === 0) {
        console.log('🚨 ImmediateSyncUtility: CRITICAL SYNC ISSUE DETECTED! Fixing immediately...');
        
        const result = await ManualSyncUtility.syncAppointmentsToPatients(clinicId);
        
        console.log('🎉 ImmediateSyncUtility: Emergency sync completed:', result);
        
        // Show user a notification
        if ('error' in result) {
          console.warn('⚠️ Immediate sync had errors:', result.error);
        } else if (result.patientsCreated > 0) {
          console.log(`✅ ImmediateSyncUtility: Successfully created ${result.patientsCreated} patients!`);
          
          // Show success notification to user
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.alert) {
              window.alert(`🎉 Sync Complete!\n\nFound and fixed sync issue:\n• Created ${result.patientsCreated} patients\n• Linked ${result.patientsLinked} existing patients\n• Processed ${result.totalAppointments} appointments\n\nYour patient list is now ready!`);
            }
          }, 5000);
        }
      } else {
        console.log('✅ ImmediateSyncUtility: No sync issues detected');
      }
      
    } catch (error) {
      console.error('❌ ImmediateSyncUtility: Error during immediate sync:', error);
    }
  }
}

// Auto-run when this module loads
if (typeof window !== 'undefined') {
  // Run after a short delay
  setTimeout(() => {
    ImmediateSyncUtility.runImmediateSync();
  }, 2000);
}

// Make it available globally
(window as any).ImmediateSyncUtility = ImmediateSyncUtility;

export default ImmediateSyncUtility; 