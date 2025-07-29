import { 
  collection, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from './firebaseOptimized';

// Helper to get safe database reference
const getDb = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  return getOptimizedFirestore();
};

export const getAllPatients = async (clinicId: string) => {
  const q = query(collection(getDb(), "clinics", clinicId, "patients"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Add create, update, delete, etc. 