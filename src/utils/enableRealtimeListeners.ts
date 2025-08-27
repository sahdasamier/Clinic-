/**
 * Utility to re-enable real-time listeners once Firebase indexes are ready
 * Run this in browser console after creating the required Firestore indexes
 */

/**
 * Re-enable real-time listeners for laboratoryRadiology and notifications
 * Call this function after creating the Firebase indexes
 */
export const enableAllRealtimeListeners = () => {
  console.log('🔄 Re-enabling real-time listeners...');
  
  // Trigger a page refresh to reinitialize with updated settings
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

/**
 * Check if Firebase indexes are ready by testing a query
 */
export const checkFirebaseIndexes = async () => {
  try {
    console.log('🔍 Checking Firebase indexes...');
    
    // This will be available globally after imports are loaded
    if (typeof window !== 'undefined' && (window as any).debugPatientDoctorAssignment) {
      const result = await (window as any).debugPatientDoctorAssignment();
      
      if (result && result.issues.length === 0) {
        console.log('✅ All Firebase indexes appear to be working!');
        console.log('You can now refresh the page to enable all real-time listeners.');
        return true;
      } else {
        console.log('⚠️ Some issues remain. Indexes may still be building...');
        return false;
      }
    } else {
      console.log('⚠️ Debug functions not available yet. Try again in a moment.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking indexes:', error);
    return false;
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).enableAllRealtimeListeners = enableAllRealtimeListeners;
  (window as any).checkFirebaseIndexes = checkFirebaseIndexes;
  
  console.log('🛠️ Real-time listener utilities loaded:');
  console.log('   • enableAllRealtimeListeners() - Re-enable all listeners');
  console.log('   • checkFirebaseIndexes() - Test if indexes are ready');
}

export default { enableAllRealtimeListeners, checkFirebaseIndexes }; 