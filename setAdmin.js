// setAdmin.js - Set admin custom claims for user accounts
import {initializeApp, cert} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert('./serviceAccountKey.json') // download from Firebase > Project Settings > Service accounts
});

// 🔄 Replace with your actual admin email(s)
const adminEmails = [
  'admin@sahdasclinic.com', // Your admin email
  // 'another-admin@example.com', // Add more admin emails as needed
];

async function setAdminClaims() {
  console.log('🔧 Setting admin custom claims...\n');
  
  for (const email of adminEmails) {
    try {
      // First, get the user by email to find their UID
      console.log(`🔍 Looking up user: ${email}`);
      const user = await getAuth().getUserByEmail(email);
      const uid = user.uid;
      
      console.log(`✅ Found user UID: ${uid}`);
      
      // Set admin custom claim
      await getAuth().setCustomUserClaims(uid, {
        admin: true,
        role: 'super_admin',
        grantedAt: Date.now()
      });
      
      // Verify the claim was set
      const updatedUser = await getAuth().getUser(uid);
      
      console.log(`✅ Admin claim set for: ${email}`);
      console.log(`   UID: ${uid}`);
      console.log(`   Claims: ${JSON.stringify(updatedUser.customClaims)}\n`);
      
    } catch (error) {
      console.error(`❌ Failed to set admin claim for: ${email}`);
      console.error(`   Error: ${error.message}\n`);
      
      if (error.code === 'auth/user-not-found') {
        console.log(`   💡 User ${email} needs to sign up to your app first\n`);
      }
    }
  }
  
  console.log('🎉 Admin setup complete!');
  console.log('\n⚠️  IMPORTANT NEXT STEPS:');
  console.log('1. Admin users must sign out and sign back in to your app');
  console.log('2. Or call currentUser.getIdToken(true) to force token refresh');
  console.log('3. Test admin functionality in your app');
  console.log('4. Navigate to admin panel and run Firebase Health Check');
  
  process.exit(0);
}

setAdminClaims().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 