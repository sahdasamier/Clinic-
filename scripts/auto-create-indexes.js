#!/usr/bin/env node

/**
 * Automated Firestore Index Creator
 * This script automatically creates all required indexes for real-time functionality
 */

const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');

// Initialize Firebase Admin
const serviceAccount = require('../path/to/service-account-key.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'clinic-d9c0a'
});

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/datastore']
});

async function createFirestoreIndexes() {
  console.log('🚀 Starting Automated Firestore Index Creation...');
  console.log('===============================================');

  const projectId = 'clinic-d9c0a';
  const indexes = [
    // Appointments - Real-time Listener
    {
      collection: 'appointments',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Appointments - Fetch with isActive
    {
      collection: 'appointments',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Patients - Real-time Listener
    {
      collection: 'patients',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Patients - Fetch with isActive
    {
      collection: 'patients',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Payments - Real-time Listener
    {
      collection: 'payments',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Payments - Fetch with isActive
    {
      collection: 'payments',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Notifications - Real-time Listener
    {
      collection: 'notifications',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Notifications - Fetch with isActive
    {
      collection: 'notifications',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Inventory - Real-time Listener
    {
      collection: 'laboratoryRadiology',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'name', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Inventory - Fetch with isActive
    {
      collection: 'laboratoryRadiology',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'name', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Clinics - Real-time Listener
    {
      collection: 'clinics',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'name', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    },
    // Clinics - Fetch with isActive
    {
      collection: 'clinics',
      fields: [
        { fieldPath: 'clinicId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'name', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    }
  ];

  try {
    const authClient = await auth.getClient();
    let successCount = 0;
    let existsCount = 0;

    for (const indexDef of indexes) {
      try {
        console.log(`📋 Creating index for ${indexDef.collection}...`);
        
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${indexDef.collection}/indexes`;
        
        const indexBody = {
          queryScope: 'COLLECTION',
          fields: indexDef.fields.map(field => ({
            fieldPath: field.fieldPath,
            order: field.order
          }))
        };

        const response = await authClient.request({
          url: url,
          method: 'POST',
          data: indexBody
        });

        console.log(`✅ Index created for ${indexDef.collection}`);
        successCount++;
        
      } catch (error) {
        if (error.status === 409) {
          console.log(`ℹ️  Index already exists for ${indexDef.collection}`);
          existsCount++;
        } else {
          console.error(`❌ Failed to create index for ${indexDef.collection}:`, error.message);
        }
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 INDEX CREATION SUMMARY:');
    console.log(`✅ Created: ${successCount} new indexes`);
    console.log(`ℹ️  Already existed: ${existsCount} indexes`);
    console.log(`📊 Total processed: ${indexes.length} indexes`);
    console.log('\n⏳ Indexes will be ready in 5-10 minutes');
    console.log('🔄 Refresh your app to see real-time data working!');

  } catch (error) {
    console.error('❌ Failed to create indexes:', error);
    console.log('\n🔗 Fallback: Use the direct links from the previous script output');
  }
}

// Alternative: Use direct HTTP requests without service account
async function createIndexesViaHTTP() {
  console.log('🌐 Creating indexes via HTTP (no service account needed)...');
  
  const indexes = [
    'appointments?field_1=clinicId&dir_1=ASCENDING&field_2=date&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING',
    'patients?field_1=clinicId&dir_1=ASCENDING&field_2=createdAt&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING',
    'payments?field_1=clinicId&dir_1=ASCENDING&field_2=createdAt&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING',
    'notifications?field_1=clinicId&dir_1=ASCENDING&field_2=createdAt&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING',
    'laboratoryRadiology?field_1=clinicId&dir_1=ASCENDING&field_2=name&dir_2=ASCENDING&field_3=__name__&dir_3=ASCENDING',
    'clinics?field_1=clinicId&dir_1=ASCENDING&field_2=name&dir_2=ASCENDING&field_3=__name__&dir_3=ASCENDING'
  ];

  console.log('🔗 Open these URLs to create indexes automatically:');
  console.log('');
  
  indexes.forEach((indexQuery, i) => {
    const url = `https://console.firebase.google.com/project/clinic-d9c0a/firestore/indexes?create_composite=true&collection=${indexQuery}`;
    console.log(`${i + 1}. ${indexQuery.split('?')[0]}: ${url}`);
    console.log('');
  });
}

// Run the appropriate method
if (process.argv.includes('--http')) {
  createIndexesViaHTTP();
} else {
  createFirestoreIndexes().catch(error => {
    console.error('❌ Admin SDK method failed:', error.message);
    console.log('\n🔄 Falling back to HTTP method...\n');
    createIndexesViaHTTP();
  });
} 