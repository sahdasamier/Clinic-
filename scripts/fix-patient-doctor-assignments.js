const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require('firebase/firestore');

// Firebase config - Update with your project config
const firebaseConfig = {
  // Add your Firebase config here or load from environment
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixPatientDoctorAssignments() {
  console.log('🏥 Starting patient-doctor assignment fix...');

  try {
    // Step 1: Get all clinics
    const clinicsSnapshot = await getDocs(collection(db, 'clinics'));
    console.log(`📋 Found ${clinicsSnapshot.size} clinics`);

    for (const clinicDoc of clinicsSnapshot.docs) {
      const clinicId = clinicDoc.id;
      const clinicData = clinicDoc.data();
      console.log(`\n🏥 Processing clinic: ${clinicData.name || clinicId}`);

      // Step 2: Get all doctors for this clinic
      const doctorsQuery = query(
        collection(db, 'users'),
        where('clinicId', '==', clinicId),
        where('role', '==', 'doctor'),
        where('isActive', '==', true)
      );
      const doctorsSnapshot = await getDocs(doctorsQuery);
      const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`👨‍⚕️ Found ${doctors.length} doctors in this clinic`);
      
      if (doctors.length === 0) {
        console.log('⚠️ No doctors found, skipping this clinic');
        continue;
      }

      // Step 3: Get all patients for this clinic
      const patientsQuery = query(
        collection(db, 'patients'),
        where('clinicId', '==', clinicId),
        where('isActive', '==', true)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`👥 Found ${patients.length} patients in this clinic`);

      // Step 4: Fix patients without proper doctor assignments
      let fixedCount = 0;
      let skippedCount = 0;

      for (const patient of patients) {
        // Check if patient needs doctor assignment
        const needsAssignment = !patient.doctor && !patient.doctorId && !patient.doctorName;
        
        if (needsAssignment) {
          // Assign to first available doctor (or implement more sophisticated logic)
          const assignedDoctor = doctors[0];
          
          const updateData = {
            doctor: assignedDoctor.id,
            doctorId: assignedDoctor.id,
            doctorName: `${assignedDoctor.firstName || 'Dr.'} ${assignedDoctor.lastName || 'Unknown'}`,
            updatedAt: new Date()
          };

          try {
            await updateDoc(doc(db, 'patients', patient.id), updateData);
            console.log(`✅ Fixed: ${patient.name || patient.id} → ${updateData.doctorName}`);
            fixedCount++;
          } catch (error) {
            console.error(`❌ Failed to fix ${patient.name || patient.id}:`, error.message);
          }
        } else {
          // Patient already has doctor assignment
          const currentDoctor = patient.doctorName || patient.doctor || patient.doctorId || 'Unknown';
          console.log(`✓ Skipped: ${patient.name || patient.id} (already assigned to ${currentDoctor})`);
          skippedCount++;
        }
      }

      console.log(`\n📊 Clinic ${clinicData.name || clinicId} Summary:`);
      console.log(`   ✅ Fixed: ${fixedCount} patients`);
      console.log(`   ✓ Skipped: ${skippedCount} patients (already assigned)`);
    }

    console.log('\n🎉 Patient-doctor assignment fix completed!');
  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

// Alternative function to fix specific clinic
async function fixClinicPatientDoctorAssignments(clinicId) {
  console.log(`🏥 Fixing patient-doctor assignments for clinic: ${clinicId}`);

  try {
    // Get doctors for this clinic
    const doctorsQuery = query(
      collection(db, 'users'),
      where('clinicId', '==', clinicId),
      where('role', '==', 'doctor'),
      where('isActive', '==', true)
    );
    const doctorsSnapshot = await getDocs(doctorsQuery);
    const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found for this clinic');
      return;
    }

    console.log(`👨‍⚕️ Available doctors:`, doctors.map(d => `${d.firstName} ${d.lastName} (${d.id})`));

    // Get patients for this clinic
    const patientsQuery = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`👥 Found ${patients.length} patients`);

    let fixedCount = 0;
    const defaultDoctor = doctors[0]; // Assign all to first doctor

    for (const patient of patients) {
      const needsAssignment = !patient.doctor && !patient.doctorId && !patient.doctorName;
      
      if (needsAssignment) {
        const updateData = {
          doctor: defaultDoctor.id,
          doctorId: defaultDoctor.id,
          doctorName: `${defaultDoctor.firstName || 'Dr.'} ${defaultDoctor.lastName || 'Unknown'}`,
          updatedAt: new Date()
        };

        try {
          await updateDoc(doc(db, 'patients', patient.id), updateData);
          console.log(`✅ ${patient.name || patient.id} → ${updateData.doctorName}`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Failed to fix ${patient.name || patient.id}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} patients for clinic ${clinicId}`);
  } catch (error) {
    console.error('❌ Error during clinic fix:', error);
  }
}

// Run the fix
if (require.main === module) {
  const clinicId = process.argv[2];
  
  if (clinicId) {
    console.log(`🎯 Running fix for specific clinic: ${clinicId}`);
    fixClinicPatientDoctorAssignments(clinicId);
  } else {
    console.log('🌍 Running fix for all clinics');
    fixPatientDoctorAssignments();
  }
}

module.exports = { fixPatientDoctorAssignments, fixClinicPatientDoctorAssignments }; 