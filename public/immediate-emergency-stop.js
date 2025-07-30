/**
 * 🚨 IMMEDIATE EMERGENCY STOP SCRIPT 🚨
 * 
 * COPY AND PASTE THIS INTO YOUR BROWSER CONSOLE RIGHT NOW
 * Then run: emergencyStopNow()
 */

console.error('🚨🚨🚨 FIREBASE EMERGENCY STOP SCRIPT LOADED 🚨🚨🚨');

window.emergencyStopNow = function() {
  console.error('🚨 EXECUTING IMMEDIATE EMERGENCY STOP');
  
  try {
    // Stop all timers and intervals
    for (let i = 1; i < 99999; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    console.error('✅ Cleared all timers and intervals');
    
    // Reset Firebase manager instances
    window._firebaseRealtimeManagerInstances = 0;
    console.error('✅ Reset Firebase manager instances');
    
    // Kill any Firebase SDK operations
    if (window.firebase) {
      try {
        // Disable network immediately
        if (window.firebase.firestore) {
          window.firebase.firestore().disableNetwork();
        }
      } catch (e) {
        console.error('Could not disable Firebase network:', e);
      }
    }
    
    // Override console.error to catch assertion errors
    const originalError = console.error;
    let errorCount = 0;
    
    window._originalConsoleError = originalError;
    console.error = function(...args) {
      const message = args.join(' ');
      
      if (message.includes('INTERNAL ASSERTION FAILED') || 
          message.includes('Unexpected state') ||
          message.includes('b815') || 
          message.includes('ca9')) {
        errorCount++;
        
        if (errorCount > 5) {
          console.log('🛑 TOO MANY ASSERTION ERRORS - FORCING PAGE RELOAD');
          window.location.reload();
          return;
        }
        
        console.log(`🚨 Assertion error #${errorCount} caught and suppressed`);
        return; // Don't log assertion errors
      }
      
      return originalError.apply(console, args);
    };
    
    console.error('✅ Set up assertion error suppression');
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
      console.error('✅ Forced garbage collection');
    }
    
    console.error('🎉 EMERGENCY STOP COMPLETED - Assertion errors should be suppressed');
    console.error('🔄 If errors continue, the page will auto-reload');
    
  } catch (error) {
    console.error('❌ Emergency stop failed:', error);
  }
};

window.forceReload = function() {
  console.error('🔄 FORCING PAGE RELOAD...');
  window.location.reload();
};

window.checkErrorStatus = function() {
  console.log('📊 ERROR STATUS CHECK:');
  console.log('- Firebase Manager Instances:', window._firebaseRealtimeManagerInstances || 0);
  console.log('- Console errors overridden:', !!window._originalConsoleError);
  console.log('- Original console.error available:', !!window._originalConsoleError);
};

console.error('');
console.error('🚨 EMERGENCY COMMANDS AVAILABLE:');
console.error('  emergencyStopNow()  - Stop all Firebase operations immediately');
console.error('  forceReload()       - Force page reload');
console.error('  checkErrorStatus()  - Check current error status');
console.error('');
console.error('🛑 RUN emergencyStopNow() RIGHT NOW to stop assertion errors!');
console.error(''); 