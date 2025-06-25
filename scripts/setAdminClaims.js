#!/usr/bin/env node

/**
 * Script to set Firebase Auth custom claims for super admin users
 * This provides server-side verification of admin status that cannot be faked
 * 
 * Usage: node scripts/setAdminClaims.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to download this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://clinic-d9c0a-default-rtdb.firebaseio.com"
});

// Super admin emails
const SUPER_ADMIN_EMAILS = [
  'admin@sahdasclinic.com',
  'sahdasamier013@gmail.com'
];

async function setAdminClaims() {
  console.log('🔧 Setting Firebase Auth custom claims for super admins...');
  
  try {
    for (const email of SUPER_ADMIN_EMAILS) {
      try {
        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Set admin custom claim
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          admin: true,
          role: 'super_admin',
          created: Date.now()
        });
        
        console.log(`✅ Set admin claims for: ${email}`);
        
        // Verify the claims were set
        const updatedUser = await admin.auth().getUser(userRecord.uid);
        console.log(`   Claims: ${JSON.stringify(updatedUser.customClaims)}`);
        
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`⚠️  User not found: ${email} - They need to sign up first`);
        } else {
          console.error(`❌ Error setting claims for ${email}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Admin claims setup complete!');
    console.log('\nNext steps:');
    console.log('1. Admin users should sign out and sign back in to refresh their tokens');
    console.log('2. The new secure Firestore rules will now use these custom claims');
    console.log('3. Client-side admin checks will continue to work as before');
    
  } catch (error) {
    console.error('❌ Failed to set admin claims:', error);
  }
}

// Helper function to remove admin claims (for testing)
async function removeAdminClaims() {
  console.log('🔧 Removing Firebase Auth custom claims...');
  
  for (const email of SUPER_ADMIN_EMAILS) {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(userRecord.uid, null);
      console.log(`✅ Removed admin claims for: ${email}`);
    } catch (error) {
      console.error(`❌ Error removing claims for ${email}:`, error.message);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--remove')) {
  removeAdminClaims();
} else {
  setAdminClaims();
}

module.exports = { setAdminClaims, removeAdminClaims }; 