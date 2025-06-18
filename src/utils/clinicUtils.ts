import { query, where, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { isSuperAdmin } from './adminConfig';

// Get clinic-specific query for a collection
export const getClinicQuery = (collectionName: string, userEmail: string, clinicId?: string) => {
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
};

// Add clinic ID to new documents
export const addClinicId = (data: any, clinicId: string) => {
  return {
    ...data,
    clinicId,
  };
};

// Check if current user can access a specific clinic's data
export const canAccessClinic = (userEmail: string, userClinicId: string, targetClinicId: string): boolean => {
  // Super admins can access any clinic
  if (isSuperAdmin(userEmail)) {
    return true;
  }
  
  // Regular users can only access their own clinic
  return userClinicId === targetClinicId;
};

// Check if a clinic is active
export const isClinicActive = async (clinicId: string): Promise<boolean> => {
  try {
    const clinicDoc = await getDoc(doc(db, 'clinics', clinicId));
    if (clinicDoc.exists()) {
      const clinicData = clinicDoc.data();
      return clinicData.isActive === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking clinic status:', error);
    return false;
  }
};

// Check if user's clinic is active and they should have access
export const hasActiveClinicAccess = async (userEmail: string, clinicId?: string): Promise<boolean> => {
  // Super admins always have access
  if (isSuperAdmin(userEmail)) {
    return true;
  }

  // If no clinic ID, no access
  if (!clinicId) {
    return false;
  }

  // Check if clinic is active
  return await isClinicActive(clinicId);
};

// Filter array data by clinic (for when we can't use Firestore queries)
export const filterByClinic = <T extends { clinicId: string }>(
  data: T[], 
  userEmail: string, 
  userClinicId?: string
): T[] => {
  // Super admins see all data
  if (isSuperAdmin(userEmail)) {
    return data;
  }
  
  // Regular users only see their clinic's data
  if (userClinicId) {
    return data.filter(item => item.clinicId === userClinicId);
  }
  
  return [];
}; 