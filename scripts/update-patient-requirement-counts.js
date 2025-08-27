#!/usr/bin/env node

/**
 * Script to update existing patient documents with medical requirement counts
 * This script helps migrate existing data to include the new pendingRequirementsCount and hasPendingRequirements fields
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where 
} = require('firebase/firestore');

// Firebase configuration - update with your config
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Calculate pending requirements count for a patient
 */
function calculatePendingRequirementsCount(medicalRequirements = []) {
  return medicalRequirements.filter(req => req.status === 'pending').length;
}

/**
 * Update a single patient's requirement counts
 */
async function updatePatientRequirementCounts(patientId, patientData) {
  try {
    const pendingCount = calculatePendingRequirementsCount(patientData.medicalRequirements);
    
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      pendingRequirementsCount: pendingCount,
      hasPendingRequirements: pendingCount > 0,
      updatedAt: new Date()
    });
    
    console.log(`✅ Updated patient ${patientId}: ${pendingCount} pending requirements`);
    return { patientId, pendingCount, success: true };
  } catch (error) {
    console.error(`❌ Failed to update patient ${patientId}:`, error.message);
    return { patientId, pendingCount: 0, success: false, error: error.message };
  }
}

/**
 * Update all patients in a clinic with requirement counts
 */
async function updateAllPatientsInClinic(clinicId) {
  try {
    console.log(`🔄 Starting requirement count update for clinic: ${clinicId}`);
    
    // Get all patients in the clinic
    const patientsQuery = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${patients.length} patients to update`);
    
    // Update each patient
    const results = [];
    for (const patient of patients) {
      const result = await updatePatientRequirementCounts(patient.id, patient);
      results.push(result);
      
      // Small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalPending = results.reduce((sum, r) => sum + (r.pendingCount || 0), 0);
    
    console.log(`\n📈 Update Summary:`);
    console.log(`✅ Successful updates: ${successful}`);
    console.log(`❌ Failed updates: ${failed}`);
    console.log(`📋 Total pending requirements: ${totalPending}`);
    
    if (failed > 0) {
      console.log(`\n❌ Failed patient IDs:`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.patientId}: ${r.error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error updating patients:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Get clinic ID from command line arguments
    const clinicId = process.argv[2];
    
    if (!clinicId) {
      console.error('❌ Please provide a clinic ID as an argument');
      console.log('Usage: node update-patient-requirement-counts.js <clinic-id>');
      process.exit(1);
    }
    
    console.log(`🚀 Starting patient requirement count update for clinic: ${clinicId}`);
    console.log('⚠️  This will update all patient documents in the specified clinic');
    
    // Confirm before proceeding
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Do you want to continue? (y/N): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
    
    // Proceed with update
    await updateAllPatientsInClinic(clinicId);
    
    console.log('\n🎉 Patient requirement count update completed successfully!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  updatePatientRequirementCounts,
  updateAllPatientsInClinic,
  calculatePendingRequirementsCount
}; 