// ✅ DIRECT FIREBASE ACCESS - COMPLETELY BYPASSES PROXY ISSUES
// This file provides direct access to Firebase services without any proxy or wrapper layers

import { 
  collection as firebaseCollection,
  doc as firebaseDoc,
  query as firebaseQuery,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
  orderBy,
  limit,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type Query
} from 'firebase/firestore';

import { getOptimizedFirestore, firebaseManager } from './../firebase/legacy-compat';

// ✅ WAIT FOR FIREBASE TO BE READY
const waitForFirebase = async (maxRetries = 20): Promise<Firestore> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    if (firebaseManager.isReady()) {
      return getOptimizedFirestore();
    }
    
    await new Promise(resolve => setTimeout(resolve, 250));
    retries++;
  }
  
  throw new Error('🔥 Firebase initialization timeout after 5 seconds');
};

// ✅ GUARANTEED SAFE FIREBASE OPERATIONS
export const safeFirestore = {
  // Get database instance
  async getDb(): Promise<Firestore> {
    return await waitForFirebase();
  },

  // Collection operations
  async collection(path: string, ...pathSegments: string[]): Promise<CollectionReference> {
    const db = await this.getDb();
    return firebaseCollection(db, path, ...pathSegments);
  },

  // Document operations
  async doc(path: string, ...pathSegments: string[]): Promise<DocumentReference> {
    const db = await this.getDb();
    return firebaseDoc(db, path, ...pathSegments);
  },

  // Query operations
  async query(collectionRef: CollectionReference, ...constraints: any[]): Promise<Query> {
    return firebaseQuery(collectionRef, ...constraints);
  },

  // Firestore operations
  async getDocs(queryOrCollection: Query | CollectionReference) {
    return await getDocs(queryOrCollection);
  },

  async addDoc(collectionRef: CollectionReference, data: any) {
    return await addDoc(collectionRef, data);
  },

  async setDoc(docRef: DocumentReference, data: any, options?: any) {
    return await setDoc(docRef, data, options);
  },

  async updateDoc(docRef: DocumentReference, data: any) {
    return await updateDoc(docRef, data);
  },

  async deleteDoc(docRef: DocumentReference) {
    return await deleteDoc(docRef);
  },

  // Real-time listeners
  onSnapshot(queryOrDoc: any, callback: any, errorCallback?: any) {
    return onSnapshot(queryOrDoc, callback, errorCallback);
  },

  // Query constraints
  where(field: string, operator: any, value: any) {
    return where(field, operator, value);
  },

  orderBy(field: string, direction?: 'asc' | 'desc') {
    return orderBy(field, direction);
  },

  limit(limitCount: number) {
    return limit(limitCount);
  }
};

// ✅ CONVENIENCE FUNCTIONS FOR COMMON OPERATIONS
export const firebaseUtils = {
  // Get users collection
  async getUsersCollection() {
    return await safeFirestore.collection('users');
  },

  // Get appointments collection
  async getAppointmentsCollection() {
    return await safeFirestore.collection('appointments');
  },

  // Get patients collection
  async getPatientsCollection() {
    return await safeFirestore.collection('patients');
  },

  // Get payments collection
  async getPaymentsCollection() {
    return await safeFirestore.collection('payments');
  },

  // Get clinics collection
  async getClinicsCollection() {
    return await safeFirestore.collection('clinics');
  },

  // Safe query builder for users
  async createUsersQuery(clinicId: string, role?: string, isActive = true) {
    const usersCollection = await this.getUsersCollection();
    const constraints = [
      safeFirestore.where('clinicId', '==', clinicId),
      safeFirestore.where('isActive', '==', isActive)
    ];
    
    if (role) {
      constraints.push(safeFirestore.where('role', '==', role));
    }
    
    return await safeFirestore.query(usersCollection, ...constraints);
  }
};

// ✅ EXPORT DIRECT FIREBASE INSTANCE (GUARANTEED TO WORK)
export const getFirebaseDb = async () => {
  return await waitForFirebase();
};

// ✅ DIRECT EXPORTS THAT BYPASS ALL PROXY ISSUES
export {
  firebaseCollection as collection,
  firebaseDoc as doc, 
  firebaseQuery as query,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
  orderBy,
  limit
}; 