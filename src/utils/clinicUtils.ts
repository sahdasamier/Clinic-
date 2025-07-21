import { query, where, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { isSuperAdmin } from './adminConfig';
import { ensureDemoClinicActive } from '../scripts/initFirestore';

// Get clinic-specific query for a collection
export function getClinicQuery(collectionName: string, userEmail: string, clinicId?: string) {
  const baseCollection = collection(db, collectionName);
  
  // Super admins can see all data
  if (isSuperAdmin(userEmail)) {
    return baseCollection;
  }
  
  // Regular users only see their clinic's data
  if (clinicId) {
    return query(baseCollection, where('clinicId', '==', clinicId));
  }
  
  // Fallback to empty query if no clinic ID
  return query(baseCollection, where('clinicId', '==', 'no-clinic'));
}

// Add clinic ID to new documents
export function addClinicId(data: any, clinicId: string) {
  return {
    ...data,
    clinicId,
  };
}

// Check if current user can access a specific clinic's data
export function canAccessClinic(userEmail: string, userClinicId: string, targetClinicId: string): boolean {
  // Super admins can access any clinic
  if (isSuperAdmin(userEmail)) {
    return true;
  }
  
  // Regular users can only access their own clinic
  return userClinicId === targetClinicId;
}

// Check if a clinic is active
export async function isClinicActive(clinicId: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking clinic status for ID: ${clinicId}`);
    const clinicDoc = await getDoc(doc(db, 'clinics', clinicId));
    
    if (clinicDoc.exists()) {
      const clinicData = clinicDoc.data();
      console.log(`📊 Clinic data for ${clinicId}:`, {
        name: clinicData.name,
        isActive: clinicData.isActive,
        settings: clinicData.settings
      });
      return clinicData.isActive === true;
    } else {
      console.warn(`⚠️ Clinic ${clinicId} does not exist in database`);
      
      // If it's the demo clinic and doesn't exist, try to create it
      if (clinicId === 'demo-clinic') {
        console.log('🔧 Demo clinic missing, attempting to create...');
        await ensureDemoClinicActive();
        
        // Check again after creation
        const retryDoc = await getDoc(doc(db, 'clinics', clinicId));
        if (retryDoc.exists()) {
          const retryData = retryDoc.data();
          console.log('✅ Demo clinic created successfully');
          return retryData.isActive === true;
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking clinic status for ${clinicId}:`, error);
    return false;
  }
}

// Check if user's clinic is active and they should have access
export async function hasActiveClinicAccess(userEmail: string, clinicId?: string): Promise<boolean> {
  console.log(`🔐 Checking clinic access for user: ${userEmail}, clinicId: ${clinicId}`);
  
  // Super admins always have access
  if (isSuperAdmin(userEmail)) {
    console.log(`👑 User ${userEmail} is super admin - access granted`);
    return true;
  }

  // If no clinic ID, no access
  if (!clinicId) {
    console.warn(`⚠️ User ${userEmail} has no clinic ID - access denied`);
    return false;
  }

  // Special handling for demo clinic - be more permissive
  if (clinicId === 'demo-clinic') {
    console.log('🏥 Demo clinic detected, ensuring it exists...');
    try {
      await ensureDemoClinicActive();
    } catch (error) {
      console.error('❌ Failed to ensure demo clinic is active:', error);
    }
  }

  // Check if clinic is active
  const isActive = await isClinicActive(clinicId);
  console.log(`🏥 Clinic ${clinicId} active status: ${isActive}`);
  
  if (!isActive) {
    console.warn(`❌ Access denied for ${userEmail} - clinic ${clinicId} is not active`);
  } else {
    console.log(`✅ Access granted for ${userEmail} - clinic ${clinicId} is active`);
  }
  
  return isActive;
}

// Manual function to fix clinic access issues (for debugging)
export async function fixClinicAccess(clinicId: string = 'demo-clinic'): Promise<boolean> {
  console.log(`🔧 Manually fixing clinic access for: ${clinicId}`);
  
  try {
    if (clinicId === 'demo-clinic') {
      await ensureDemoClinicActive();
      console.log('✅ Demo clinic access fixed');
      return true;
    } else {
      // For other clinics, just check if they exist and are active
      const isActive = await isClinicActive(clinicId);
      console.log(`🏥 Clinic ${clinicId} status: ${isActive ? 'active' : 'inactive'}`);
      return isActive;
    }
  } catch (error) {
    console.error(`❌ Error fixing clinic access for ${clinicId}:`, error);
    return false;
  }
}

// Filter array data by clinic (for when we can't use Firestore queries)
export function filterByClinic<T extends { clinicId: string }>(
  data: T[], 
  userEmail: string, 
  userClinicId?: string
): T[] {
  // Super admins see all data
  if (isSuperAdmin(userEmail)) {
    return data;
  }
  
  // Regular users only see their clinic's data
  if (userClinicId) {
    return data.filter(item => item.clinicId === userClinicId);
  }
  
  return [];
} 