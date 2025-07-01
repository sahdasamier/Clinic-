import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
import ManualSyncUtility from './manualSync';

/**
 * Global Auto-Sync Service
 * Automatically detects and fixes appointment-patient sync issues
 */
export class GlobalAutoSyncService {
  private static isRunning = false;
  private static lastSyncTime = 0;
  private static syncCooldown = 30000; // 30 seconds cooldown between syncs

  /**
   * Initialize global auto-sync monitoring
   */
  static init() {
    console.log('🌍 GlobalAutoSyncService: Initializing...');
    
    // Start monitoring every 10 seconds
    setInterval(() => {
      this.checkAndSync();
    }, 10000);

    // Also check immediately
    setTimeout(() => {
      this.checkAndSync();
    }, 5000);
  }

  /**
   * Check for sync issues and fix them automatically
   */
  static async checkAndSync(clinicId = 'demo-clinic') {
    // Prevent multiple syncs running at once
    if (this.isRunning) return;
    
    // Respect cooldown period
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncCooldown) return;

    try {
      this.isRunning = true;
      
      // Quick check: Get counts
      const appointments = await AppointmentService.getAllAppointments(clinicId);
      const patients = await PatientService.searchPatients(clinicId, '');
      
      console.log(`🔍 GlobalAutoSyncService: Checking clinic ${clinicId} - ${appointments.length} appointments, ${patients.length} patients`);
      
      // If we have appointments but no patients, it's a sync issue
      if (appointments.length > 0 && patients.length === 0) {
        console.log('🚨 GlobalAutoSyncService: SYNC ISSUE DETECTED! Starting emergency sync...');
        
        const result = await ManualSyncUtility.syncAppointmentsToPatients(clinicId);
        
        console.log('🎉 GlobalAutoSyncService: Emergency sync completed:', result);
        this.lastSyncTime = now;
        
        // Show user notification
        if ('error' in result) {
          console.warn('⚠️ GlobalAutoSyncService: Sync completed with errors:', result.error);
        } else if (result.patientsCreated > 0) {
          console.log(`✅ GlobalAutoSyncService: Created ${result.patientsCreated} patients from ${result.totalAppointments} appointments`);
          
          // Optional: Show user notification
          if (typeof window !== 'undefined' && window.alert) {
            setTimeout(() => {
              window.alert(`🎉 Auto-sync completed!\nCreated ${result.patientsCreated} patients from your appointments.`);
            }, 2000);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ GlobalAutoSyncService: Error during auto-sync:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Force sync now (ignores cooldown)
   */
  static async forceSyncNow(clinicId = 'demo-clinic') {
    console.log('🚀 GlobalAutoSyncService: Force sync requested...');
    this.lastSyncTime = 0; // Reset cooldown
    await this.checkAndSync(clinicId);
  }

  /**
   * Manual trigger for immediate sync
   */
  static async emergencySync(clinicId = 'demo-clinic') {
    console.log('🆘 GlobalAutoSyncService: EMERGENCY SYNC TRIGGERED!');
    
    try {
      const result = await ManualSyncUtility.syncAppointmentsToPatients(clinicId);
      
      if ('error' in result) {
        console.error('❌ Emergency sync failed:', result.error);
        return false;
      } else {
        console.log(`✅ Emergency sync completed: ${result.patientsCreated} patients created`);
        return true;
      }
    } catch (error) {
      console.error('❌ Emergency sync error:', error);
      return false;
    }
  }
}

// Make it available globally
(window as any).GlobalAutoSyncService = GlobalAutoSyncService;

// Auto-initialize when this module loads
if (typeof window !== 'undefined') {
  // Wait a bit for the app to initialize
  setTimeout(() => {
    GlobalAutoSyncService.init();
  }, 8000);
}

export default GlobalAutoSyncService; 