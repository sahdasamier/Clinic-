// Script to set admin claims for the current user
// This will help resolve the "Missing or insufficient permissions" error

import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

console.log('🔧 Setting up admin claims for current user...');

async function setupAdminClaims() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ Found authenticated user:', user.email);
    
    // Call the setAdminClaims function
    const functions = getFunctions();
    const setAdminClaims = httpsCallable(functions, 'setAdminClaims');
    
    const result = await setAdminClaims({
      uid: user.uid,
      admin: true,
      clinicId: 'demo-clinic',
      role: 'management'
    });
    
    console.log('✅ Admin claims set successfully:', result.data);
    
    // Force token refresh to get new claims
    await user.getIdToken(true);
    
    console.log('✅ Token refreshed with new claims');
    console.log('🔄 Please try completing the medical requirement order again');
    
  } catch (error) {
    console.error('❌ Error setting admin claims:', error);
    
    // Fallback: try to set claims via direct function call
    try {
      console.log('🔄 Trying alternative method...');
      
      const functions = getFunctions();
      const setAdminClaims = httpsCallable(functions, 'setAdminClaims');
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const result = await setAdminClaims({
          uid: user.uid,
          admin: true,
          clinicId: 'demo-clinic',
          role: 'management'
        });
        
        console.log('✅ Alternative method successful:', result.data);
      }
    } catch (fallbackError) {
      console.error('❌ Alternative method also failed:', fallbackError);
      console.log('💡 You may need to manually set admin claims in Firebase Console');
    }
  }
}

// Export for use in browser console
window.setupAdminClaims = setupAdminClaims;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  console.log('🔧 Admin claims setup script loaded. Run window.setupAdminClaims() to set admin permissions.');
}
