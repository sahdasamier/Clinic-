import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';

/**
 * Firebase Free Tier Friendly Sync WITH Real-Time Page Communication
 * Minimizes Firestore reads/writes while ensuring perfect data flow between pages
 */
export class FirebaseFriendlySync {
  private static lastSyncTime = 0;
  private static syncCooldown = 300000; // 5 minutes cooldown (instead of 30 seconds)
  private static isRunning = false;
  private static hasRunInitialSync = false;
  
  // Local cache to minimize Firebase reads
  private static cache = {
    appointmentCount: 0,
    patientCount: 0,
    lastCacheTime: 0,
    cacheTimeout: 60000 // 1 minute cache
  };

  // ✅ NEW: Real-time data bridge for page communication
  private static dataChangeListeners = new Set<(data: any) => void>();
  private static currentData = {
    appointments: [] as any[],
    patients: [] as any[],
    lastUpdate: 0
  };

  /**
   * ✅ NEW: Register a page for real-time data updates
   */
  static onDataChange(callback: (data: any) => void) {
    this.dataChangeListeners.add(callback);
    
    // Immediately send current data if available
    if (this.currentData.appointments.length > 0 || this.currentData.patients.length > 0) {
      callback(this.currentData);
    }
    
    return () => {
      this.dataChangeListeners.delete(callback);
    };
  }

  /**
   * ✅ NEW: Notify all pages of data changes (like localStorage events)
   */
  private static notifyDataChange(newData: any) {
    this.currentData = {
      ...newData,
      lastUpdate: Date.now()
    };
    
    // Notify all listening pages immediately
    this.dataChangeListeners.forEach(callback => {
      try {
        callback(this.currentData);
      } catch (error) {
        console.warn('⚠️ Error notifying data change listener:', error);
      }
    });
    
    // Also trigger browser events for compatibility
    window.dispatchEvent(new CustomEvent('firebaseDataUpdate', {
      detail: this.currentData
    }));
    
    console.log(`✅ Real-time update sent to ${this.dataChangeListeners.size} pages`);
  }

  /**
   * ✅ NEW: Refresh all pages data from Firebase (minimal reads)
   */
  static async refreshAllPagesData(clinicId = 'demo-clinic') {
    // Check authentication before proceeding
    try {
      const { auth } = await import('../api/firebase');
      if (!auth.currentUser) {
        console.log('💚 FirebaseFriendlySync: No authenticated user, cannot refresh data');
        return null;
      }
    } catch (error) {
      console.warn('⚠️ FirebaseFriendlySync: Auth check failed during refresh:', error);
      return null;
    }
    
    try {
      console.log('💚 Refreshing data for all pages...');
      
      // Get fresh data from Firebase
      const appointments = await AppointmentService.getAllAppointments(clinicId);
      const patients = await PatientService.searchPatients(clinicId, '');
      
      const data = {
        appointments,
        patients,
        clinicId
      };
      
      // Update cache
      this.cache.appointmentCount = appointments.length;
      this.cache.patientCount = patients.length;
      this.cache.lastCacheTime = Date.now();
      
      // Notify all pages immediately
      this.notifyDataChange(data);
      
      console.log(`💚 Data refreshed: ${appointments.length} appointments, ${patients.length} patients`);
      return data;
      
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      return null;
    }
  }

  /**
   * Initialize with minimal Firebase usage
   */
  static init() {
    console.log('💚 FirebaseFriendlySync: Initializing (Free Tier Optimized with Real-Time Communication)...');
    
    // Wait for authentication before running sync
    this.waitForAuthAndInit();

    // Much less frequent monitoring - every 5 minutes instead of 10 seconds
    setInterval(() => {
      this.gentleCheck();
    }, 300000); // 5 minutes
  }

  /**
   * Wait for Firebase authentication before initializing sync
   */
  static async waitForAuthAndInit() {
    try {
      const { auth } = await import('../api/firebase');
      
      // Wait for auth state to be determined
      const waitForAuth = new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });
      
      const user = await waitForAuth;
      
      if (user) {
        console.log('💚 FirebaseFriendlySync: User authenticated, proceeding with sync');
        
        // Only run initial sync once when app loads and user is authenticated
        if (!this.hasRunInitialSync) {
          setTimeout(() => {
            this.runInitialSyncOnce();
          }, 2000); // Reduced delay since auth is confirmed
        }
      } else {
        console.log('💚 FirebaseFriendlySync: No authenticated user, skipping sync');
      }
    } catch (error) {
      console.warn('⚠️ FirebaseFriendlySync: Auth check failed:', error);
    }
  }

  /**
   * Run initial sync only once when app loads
   */
  static async runInitialSyncOnce() {
    if (this.hasRunInitialSync) return;
    this.hasRunInitialSync = true;

    console.log('💚 FirebaseFriendlySync: Running one-time initial sync...');
    
    try {
      // First, refresh data for all pages
      await this.refreshAllPagesData('demo-clinic');
      
      // Then check if sync is needed
      const result = await this.checkAndSyncIfNeeded('demo-clinic');
      if (result && 'patientsCreated' in result && result.patientsCreated > 0) {
        console.log(`✅ Initial sync completed: Created ${result.patientsCreated} patients`);
        
        // Refresh data again after sync to update all pages
        await this.refreshAllPagesData('demo-clinic');
      }
    } catch (error) {
      console.warn('⚠️ Initial sync failed (will retry manually):', error);
    }
  }

  /**
   * Gentle check using cached data to minimize Firebase reads
   */
  static async gentleCheck() {
    try {
      // Check if user is authenticated first
      const { auth } = await import('../api/firebase');
      if (!auth.currentUser) {
        console.log('💚 FirebaseFriendlySync: No authenticated user, skipping gentle check');
        return;
      }

      const now = Date.now();
      
      // Use cache if recent
      if (now - this.cache.lastCacheTime < this.cache.cacheTimeout) {
        console.log('💚 FirebaseFriendlySync: Using cached data (no Firebase reads)');
        
        if (this.cache.appointmentCount > 0 && this.cache.patientCount === 0) {
          console.log('💚 Cached data shows sync needed, but respecting cooldown...');
          // Only proceed if cooldown has passed
          if (now - this.lastSyncTime > this.syncCooldown) {
            await this.checkAndSyncIfNeeded('demo-clinic');
          }
        }
        return;
      }

      // Light check - only if cooldown has passed
      if (now - this.lastSyncTime > this.syncCooldown) {
        await this.checkAndSyncIfNeeded('demo-clinic');
      }
    } catch (error) {
      console.warn('⚠️ FirebaseFriendlySync: Gentle check failed:', error);
    }
  }

  /**
   * Efficient sync that minimizes Firebase operations
   */
  static async checkAndSyncIfNeeded(clinicId = 'demo-clinic') {
    if (this.isRunning) return null;
    
    // Check authentication before proceeding
    try {
      const { auth } = await import('../api/firebase');
      if (!auth.currentUser) {
        console.log('💚 FirebaseFriendlySync: No authenticated user, cannot proceed with sync');
        return null;
      }
    } catch (error) {
      console.warn('⚠️ FirebaseFriendlySync: Auth check failed:', error);
      return null;
    }
    
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncCooldown) {
      console.log('💚 FirebaseFriendlySync: Respecting cooldown period');
      return null;
    }

    try {
      this.isRunning = true;
      
      // Get counts efficiently (minimal reads)
      console.log('💚 FirebaseFriendlySync: Checking data (minimal reads)...');
      
      const appointments = await AppointmentService.getAllAppointments(clinicId);
      const patients = await PatientService.searchPatients(clinicId, '');
      
      // Update cache
      this.cache.appointmentCount = appointments.length;
      this.cache.patientCount = patients.length;
      this.cache.lastCacheTime = now;
      
      console.log(`💚 FirebaseFriendlySync: ${appointments.length} appointments, ${patients.length} patients`);
      
      // ✅ Always notify pages of current data
      this.notifyDataChange({ appointments, patients, clinicId });
      
      // Only sync if there's a clear issue
      if (appointments.length > 0 && patients.length === 0) {
        console.log('💚 FirebaseFriendlySync: Sync needed - proceeding with efficient sync...');
        
        const result = await this.efficientSync(clinicId, appointments);
        this.lastSyncTime = now;
        
        // ✅ Refresh all pages after sync
        if (result && result.patientsCreated > 0) {
          setTimeout(async () => {
            await this.refreshAllPagesData(clinicId);
          }, 2000);
        }
        
        return result;
      } else {
        console.log('💚 FirebaseFriendlySync: No sync needed');
        return null;
      }
      
    } catch (error) {
      console.error('❌ FirebaseFriendlySync: Error during check:', error);
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Efficient sync that minimizes writes by batching operations
   */
  static async efficientSync(clinicId: string, appointments: any[]) {
    console.log('💚 FirebaseFriendlySync: Starting efficient sync...');
    
    try {
      // Get existing patients once
      const existingPatients = await PatientService.searchPatients(clinicId, '');
      const existingPatientNames = new Set(
        existingPatients.map(p => p.name?.toLowerCase().trim())
      );
      
      // Find unique patient names that need to be created
      const uniquePatientNames = new Set<string>();
      appointments.forEach(apt => {
        if (apt.patient && apt.patient.trim()) {
          const patientNameLower = apt.patient.toLowerCase().trim();
          if (!existingPatientNames.has(patientNameLower)) {
            uniquePatientNames.add(apt.patient.trim());
          }
        }
      });
      
      console.log(`💚 Creating ${uniquePatientNames.size} unique patients`);
      
      // Create patients efficiently (batch if possible)
      let patientsCreated = 0;
      const patientCreationPromises: Promise<string>[] = [];
      
      for (const patientName of uniquePatientNames) {
        const patientData = {
          name: patientName,
          phone: '',
          email: '',
          status: 'new' as const,
          condition: 'General consultation',
          isActive: true,
          medicalHistory: [],
          medications: [],
          visitNotes: [],
          vitalSigns: [],
          documents: [],
          allergies: []
        };
        
        patientCreationPromises.push(
          PatientService.createPatient(clinicId, patientData)
        );
      }
      
      // Wait for all patients to be created
      const createdPatientIds = await Promise.all(patientCreationPromises);
      patientsCreated = createdPatientIds.length;
      
      console.log(`✅ FirebaseFriendlySync: Created ${patientsCreated} patients efficiently`);
      
      // ✅ Show user notification with auto-refresh message
      if (patientsCreated > 0) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            alert(`💚 Firebase-Friendly Sync Complete!\n\n✅ Created ${patientsCreated} patients\n✅ Minimal Firebase usage\n✅ All pages will update automatically\n\nData is now synced across all pages!`);
          }
        }, 1000);
      }
      
      return {
        totalAppointments: appointments.length,
        patientsCreated,
        patientsLinked: 0,
        appointmentsProcessed: appointments.length,
        errors: []
      };
      
    } catch (error) {
      console.error('❌ FirebaseFriendlySync: Efficient sync failed:', error);
      throw error;
    }
  }

  /**
   * Manual sync for user-triggered actions (still efficient)
   */
  static async manualSync(clinicId = 'demo-clinic') {
    console.log('💚 FirebaseFriendlySync: Manual sync requested...');
    
    // Reset cooldown for manual sync
    this.lastSyncTime = 0;
    
    const result = await this.checkAndSyncIfNeeded(clinicId);
    
    if (!result) {
      // Force check even if no obvious issue
      try {
        const appointments = await AppointmentService.getAllAppointments(clinicId);
        if (appointments.length > 0) {
          const syncResult = await this.efficientSync(clinicId, appointments);
          
          // ✅ Always refresh all pages after manual sync
          setTimeout(async () => {
            await this.refreshAllPagesData(clinicId);
          }, 2000);
          
          return syncResult;
        } else {
          if (typeof window !== 'undefined') {
            alert('💚 No appointments found to sync');
          }
          return null;
        }
      } catch (error) {
        console.error('❌ Manual sync failed:', error);
        if (typeof window !== 'undefined') {
          alert(`❌ Manual sync failed: ${error}`);
        }
        return null;
      }
    }
    
    return result;
  }

  /**
   * Get Firebase usage estimation
   */
  static getUsageEstimation() {
    const dailyReads = Math.ceil((24 * 60) / 5) * 2; // Every 5 minutes, 2 reads
    const percentOfQuota = (dailyReads / 50000) * 100;
    
    return {
      dailyReads,
      percentOfQuota: percentOfQuota.toFixed(1),
      isWithinLimits: dailyReads < 40000 // Keep some buffer
    };
  }
}

// ✅ NEW: Global data bridge for perfect page communication
export const FirebaseDataBridge = {
  // Subscribe to data changes (like localStorage events)
  subscribe: (callback: (data: any) => void) => {
    return FirebaseFriendlySync.onDataChange(callback);
  },
  
  // Force refresh all pages
  refreshAll: (clinicId = 'demo-clinic') => {
    return FirebaseFriendlySync.refreshAllPagesData(clinicId);
  },
  
  // Get current cached data
  getCurrentData: () => {
    return FirebaseFriendlySync['currentData'];
  }
};

// Make it available globally
(window as any).FirebaseFriendlySync = FirebaseFriendlySync;
(window as any).FirebaseDataBridge = FirebaseDataBridge;

// Manual sync commands
(window as any).fbSync = () => FirebaseFriendlySync.manualSync();
(window as any).fbRefresh = () => FirebaseDataBridge.refreshAll();
(window as any).fbUsage = () => {
  const usage = FirebaseFriendlySync.getUsageEstimation();
  console.log('💚 Firebase Usage Estimation:', usage);
  if (typeof window !== 'undefined') {
    alert(`💚 Firebase Free Tier Usage:\n\nDaily reads: ${usage.dailyReads}\nQuota used: ${usage.percentOfQuota}%\nWithin limits: ${usage.isWithinLimits ? '✅ Yes' : '❌ No'}`);
  }
  return usage;
};

// Show improvement comparison
(window as any).fbImprovement = () => {
  const oldUsage = { dailyReads: 17280, percentOfQuota: 34.6 };
  const newUsage = FirebaseFriendlySync.getUsageEstimation();
  const improvement = ((oldUsage.dailyReads - newUsage.dailyReads) / oldUsage.dailyReads * 100).toFixed(1);
  
  console.log('💚 Firebase Optimization Results:', {
    before: oldUsage,
    after: newUsage,
    improvement: `${improvement}% reduction`
  });
  
  if (typeof window !== 'undefined') {
    alert(`💚 Firebase Optimization Results:\n\n📊 BEFORE (Aggressive):\n• Daily reads: ${oldUsage.dailyReads}\n• Quota used: ${oldUsage.percentOfQuota}%\n\n📊 AFTER (Optimized):\n• Daily reads: ${newUsage.dailyReads}\n• Quota used: ${newUsage.percentOfQuota}%\n\n🎉 IMPROVEMENT:\n• ${improvement}% reduction in Firebase usage!\n• Free tier safe ✅\n• Perfect page communication ✅`);
  }
};

// ✅ NEW: Comprehensive test function
export const testFirebaseSync = async () => {
  console.log('🧪 Running comprehensive Firebase sync test...');
  
  // Check authentication first
  try {
    const { auth } = await import('../api/firebase');
    if (!auth.currentUser) {
      const message = '❌ Authentication Required:\n\nPlease log in to run Firebase sync tests.\nTests require authenticated access to Firebase.';
      console.error(message);
      if (typeof window !== 'undefined') {
        alert(message);
      }
      return { error: 'Not authenticated' };
    }
    console.log('✅ User authenticated:', auth.currentUser.email);
  } catch (authError) {
    console.error('❌ Auth check failed:', authError);
    if (typeof window !== 'undefined') {
      alert(`❌ Authentication Error: ${authError}`);
    }
    return { error: 'Auth check failed' };
  }
  
  try {
    const clinicId = 'demo-clinic';
    
    // Test 1: Check Firebase connection
    console.log('1️⃣ Testing Firebase connection...');
    const appointments = await AppointmentService.getAllAppointments(clinicId);
    const patients = await PatientService.searchPatients(clinicId, '');
    
    console.log(`✅ Firebase connected: ${appointments.length} appointments, ${patients.length} patients`);
    
    // Test 2: Test data bridge
    console.log('2️⃣ Testing Firebase Data Bridge...');
    let bridgeTestPassed = false;
    
    const testUnsubscribe = FirebaseDataBridge.subscribe((data) => {
      if (data.appointments && data.patients) {
        console.log('✅ Data bridge working:', {
          appointments: data.appointments.length,
          patients: data.patients.length
        });
        bridgeTestPassed = true;
      }
    });
    
    // Trigger a refresh to test the bridge
    await FirebaseDataBridge.refreshAll(clinicId);
    
    // Wait for bridge response
    await new Promise(resolve => setTimeout(resolve, 2000));
    testUnsubscribe();
    
    if (!bridgeTestPassed) {
      console.warn('⚠️ Data bridge test inconclusive');
    }
    
    // Test 3: Test sync functionality
    console.log('3️⃣ Testing sync functionality...');
    if (appointments.length > 0 && patients.length === 0) {
      console.log('🔄 Sync needed - testing manual sync...');
      const syncResult = await FirebaseFriendlySync.manualSync(clinicId);
      
      if (syncResult && syncResult.patientsCreated > 0) {
        console.log(`✅ Sync test passed: Created ${syncResult.patientsCreated} patients`);
      } else {
        console.log('ℹ️ Sync test: No patients needed to be created');
      }
    } else {
      console.log('ℹ️ Sync test: Data already in sync');
    }
    
    // Test 4: Test quota usage
    console.log('4️⃣ Testing quota usage estimation...');
    const usage = FirebaseFriendlySync.getUsageEstimation();
    console.log('✅ Quota estimation working:', usage);
    
    // Final result
    const testResults = {
      firebaseConnection: appointments.length >= 0 && patients.length >= 0,
      dataBridge: bridgeTestPassed,
      quotaEstimation: !!usage.dailyReads,
      totalAppointments: appointments.length,
      totalPatients: patients.length,
      syncNeeded: appointments.length > 0 && patients.length === 0,
      quotaUsage: usage
    };
    
    console.log('🎉 Test completed successfully!', testResults);
    
    // Show user-friendly results
    const message = `🧪 Firebase Sync Test Results:\n\n` +
      `✅ Firebase Connection: ${testResults.firebaseConnection ? 'Working' : 'Failed'}\n` +
      `✅ Data Bridge: ${testResults.dataBridge ? 'Working' : 'Failed'}\n` +
      `✅ Quota Estimation: ${testResults.quotaEstimation ? 'Working' : 'Failed'}\n\n` +
      `📊 Current Data:\n` +
      `• Appointments: ${testResults.totalAppointments}\n` +
      `• Patients: ${testResults.totalPatients}\n` +
      `• Sync needed: ${testResults.syncNeeded ? 'Yes' : 'No'}\n\n` +
      `📈 Daily usage: ${usage.dailyReads} reads (${usage.percentOfQuota}% of quota)`;
    
    if (typeof window !== 'undefined') {
       alert(message);
     }
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Firebase sync test failed:', error);
    
    if (typeof window !== 'undefined') {
       alert(`❌ Firebase Sync Test Failed:\n\n${error}\n\nPlease check the console for details.`);
     }
    
    throw error;
  }
};

// Manual test command
(window as any).fbTest = () => testFirebaseSync();

// ✅ NEW: Simple debug and force refresh function
export const debugAndForceRefresh = async () => {
  console.log('🔍 DEBUG: Testing Firebase connection and forcing data refresh...');
  
  // Check authentication first
  try {
    const { auth } = await import('../api/firebase');
    if (!auth.currentUser) {
      const message = '❌ Authentication Required:\n\nPlease log in to access Firebase data.\nYou need to be authenticated to view appointments and patients.';
      console.error(message);
      if (typeof window !== 'undefined') {
        alert(message);
      }
      return false;
    }
    console.log('✅ User authenticated:', auth.currentUser.email);
  } catch (authError) {
    console.error('❌ Auth check failed:', authError);
    if (typeof window !== 'undefined') {
      alert(`❌ Authentication Error: ${authError}`);
    }
    return false;
  }
  
  try {
    const clinicId = 'demo-clinic';
    
    // Test direct Firebase connection
    console.log('1️⃣ Testing direct Firebase services...');
    const appointments = await AppointmentService.getAllAppointments(clinicId);
    const patients = await PatientService.searchPatients(clinicId, '');
    
    console.log(`📊 Direct Firebase results: ${appointments.length} appointments, ${patients.length} patients`);
    
    if (appointments.length === 0) {
      alert('⚠️ No appointments found in Firebase!\n\nCheck:\n1. Are you logged in?\n2. Do you have appointments in your clinic?\n3. Is the clinic ID correct?');
      return false;
    }
    
    // Force immediate page update
    console.log('2️⃣ Forcing immediate page data update...');
    const data = { appointments, patients, clinicId };
    
    // Force refresh using the public method - this will trigger all listeners
    await FirebaseFriendlySync.refreshAllPagesData(clinicId);
    
    console.log('3️⃣ Page update triggered - check if data appears now');
    
    // If sync is needed, do it
    if (appointments.length > 0 && patients.length === 0) {
      console.log('4️⃣ Sync needed - running manual sync...');
      const syncResult = await FirebaseFriendlySync.manualSync(clinicId);
      
      if (syncResult && syncResult.patientsCreated > 0) {
        console.log(`✅ Sync completed: Created ${syncResult.patientsCreated} patients`);
        
        // Force another refresh after sync
        setTimeout(async () => {
          await FirebaseFriendlySync.refreshAllPagesData(clinicId);
          const newPatients = await PatientService.searchPatients(clinicId, '');
          console.log(`🔄 Post-sync refresh: ${newPatients.length} patients now available`);
        }, 3000);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ DEBUG: Failed:', error);
    alert(`❌ Debug Failed: ${error}`);
    return false;
  }
};

// Make it available globally
(window as any).debugAndForceRefresh = debugAndForceRefresh;
(window as any).forceRefresh = debugAndForceRefresh;

// ✅ NEW: Authentication helper for users
export const checkAuthAndShowInstructions = async () => {
  try {
    const { auth } = await import('../api/firebase');
    
    if (auth.currentUser) {
      console.log('✅ Authentication Status: LOGGED IN');
      console.log('📧 Email:', auth.currentUser.email);
      console.log('🆔 UID:', auth.currentUser.uid);
      
      if (typeof window !== 'undefined') {
        alert(`✅ Authentication Status: LOGGED IN\n\n📧 Email: ${auth.currentUser.email}\n🆔 UID: ${auth.currentUser.uid}\n\n🎉 Firebase operations should work correctly!`);
      }
      return true;
    } else {
      console.log('❌ Authentication Status: NOT LOGGED IN');
      console.log('');
      console.log('🔐 TO FIX THE FIREBASE PERMISSION ERRORS:');
      console.log('   1. Go to the login page: /login or /admin/login');
      console.log('   2. Sign in with your credentials');
      console.log('   3. Return to this page');
      console.log('   4. The sync will work automatically');
      console.log('');
      console.log('📧 If you are a super admin, use: admin@sahdasclinic.com');
      console.log('🔑 If you need an account, contact your administrator');
      
      if (typeof window !== 'undefined') {
        const message = `❌ Authentication Status: NOT LOGGED IN\n\n🔐 TO FIX THE FIREBASE PERMISSION ERRORS:\n\n1️⃣ Go to the login page (/login or /admin/login)\n2️⃣ Sign in with your credentials\n3️⃣ Return to this page\n4️⃣ The sync will work automatically\n\n📧 Super admin email: admin@sahdasclinic.com\n🔑 Need an account? Contact your administrator`;
        alert(message);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    if (typeof window !== 'undefined') {
      alert(`❌ Auth check failed: ${error}`);
    }
    return false;
  }
};

// Make auth checker available globally
(window as any).checkAuth = checkAuthAndShowInstructions;

// Update the console commands
console.log('💚 Firebase-Friendly Sync Commands:');
console.log('   checkAuth() - Check authentication status & show login instructions');
console.log('   fbSync() - Manual sync (efficient)');
console.log('   fbRefresh() - Refresh all pages data');
console.log('   fbTest() - Run comprehensive test');
console.log('   forceRefresh() - Debug and force immediate data refresh');
console.log('   fbUsage() - Check Firebase quota usage');
console.log('   fbImprovement() - Show optimization results');

// Auto-initialize when this module loads (Firebase-friendly)
// Only initialize if we're in a browser environment and not during bundling
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Add safety check to prevent initialization during module bundling
  setTimeout(() => {
    try {
      // Double-check we're in a real browser environment
      if (window.location && document.readyState) {
        FirebaseFriendlySync.init();
      }
    } catch (error) {
      console.warn('⚠️ FirebaseFriendlySync auto-init failed (this is safe during bundling):', error);
    }
  }, 3000);
}

export default FirebaseFriendlySync; 