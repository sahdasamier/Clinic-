import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot, 
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  Timestamp
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';

// Import already-initialized Firebase instances from api/firebase.ts
import { auth, firestore as db } from '../api/firebase';

// Firestore collection references
export const COLLECTIONS = {
  USERS: 'users',
  CLINICS: 'clinics', 
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  MEDICAL_RECORDS: 'medicalRecords',
  SETTINGS: 'settings',
  STAFF: 'staff'
} as const;

// Export the instances for backward compatibility
export { db, auth };

// Firebase utility types
export interface FirebaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

export interface FirebaseSaveOptions {
  merge?: boolean;
  retryCount?: number;
  offlineFirst?: boolean;
}

// Enhanced Firebase service class
export class FirebaseService {
  private static instance: FirebaseService;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      enableNetwork(db).catch(console.error);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      disableNetwork(db).catch(console.error);
    });
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Get document with error handling
  async getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get document ${documentId} from ${collectionName}:`, error);
      throw error;
    }
  }

  // Save document with metadata
  async saveDocument<T extends Record<string, any>>(
    collectionName: string, 
    documentId: string, 
    data: T, 
    options: FirebaseSaveOptions = {}
  ): Promise<void> {
    const { merge = true, retryCount = 3 } = options;
    const user = this.getCurrentUser();
    
    const documentData = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(user && { updatedBy: user.uid }),
      // Add createdAt and createdBy only for new documents
      ...(merge ? {} : { 
        createdAt: serverTimestamp(),
        ...(user && { createdBy: user.uid })
      })
    };

    const attemptSave = async (attempts: number): Promise<void> => {
      try {
        const docRef = doc(db, collectionName, documentId);
        await setDoc(docRef, documentData, { merge });
      } catch (error) {
        if (attempts > 0 && this.isRetryableError(error)) {
          console.warn(`Save attempt failed, retrying... (${attempts} attempts left)`);
          await this.delay(1000);
          return attemptSave(attempts - 1);
        }
        throw error;
      }
    };

    return attemptSave(retryCount);
  }

  // Update specific fields
  async updateDocument(
    collectionName: string, 
    documentId: string, 
    updates: Record<string, any>
  ): Promise<void> {
    try {
      const user = this.getCurrentUser();
      const docRef = doc(db, collectionName, documentId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        ...(user && { updatedBy: user.uid })
      });
    } catch (error) {
      console.error(`Failed to update document ${documentId}:`, error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete document ${documentId}:`, error);
      throw error;
    }
  }

  // Query documents with filters
  async queryDocuments<T>(
    collectionName: string,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderByField?: string,
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q: any = collection(db, collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as T[];
    } catch (error) {
      console.error(`Failed to query ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener
  subscribeToDocument<T>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, collectionName, documentId);
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Subscription error for ${documentId}:`, error);
        errorCallback?.(error);
      }
    );
  }

  // Helper methods
  private isRetryableError(error: any): boolean {
    return error?.code === 'unavailable' || 
           error?.code === 'deadline-exceeded' ||
           error?.message?.includes('network');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check online status
  isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();

// Authentication helpers
export const authHelpers = {
  // Monitor auth state
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Sign up
  signUp: async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign out
  signOut: async () => {
    return signOut(auth);
  },

  // Get current user
  getCurrentUser: () => auth.currentUser
};

// Firestore timestamp helpers
export const timestampHelpers = {
  // Create server timestamp
  serverTimestamp: () => serverTimestamp(),
  
  // Convert timestamp to date
  toDate: (timestamp: Timestamp) => timestamp.toDate(),
  
  // Create timestamp from date
  fromDate: (date: Date) => Timestamp.fromDate(date),
  
  // Get current timestamp
  now: () => Timestamp.now()
};

export default firebaseService; 