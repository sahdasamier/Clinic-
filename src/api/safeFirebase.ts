// ✅ SAFE FIREBASE WRAPPERS - GUARANTEED TO WORK
// These functions ensure Firebase gets the actual Firestore instance

import { 
  collection as firebaseCollection,
  doc as firebaseDoc,
  query as firebaseQuery,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type Query
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from './firebaseOptimized';

// ✅ SAFE: Guaranteed to return actual Firestore instance
export const getSafeFirestore = (): Firestore => {
  if (!firebaseManager.isReady()) {
    throw new Error('🔥 Firebase not ready - please wait for initialization to complete');
  }
  return getOptimizedFirestore();
};

// ✅ SAFE: Collection wrapper that always works
export const collection = (firestore: any, path: string, ...pathSegments: string[]): CollectionReference => {
  // If passed our proxy or function, get the actual instance
  const actualFirestore = typeof firestore === 'function' ? firestore() : 
                         (firestore?.constructor?.name === 'Object' ? getSafeFirestore() : firestore);
  
  return firebaseCollection(actualFirestore, path, ...pathSegments);
};

// ✅ SAFE: Document wrapper
export const doc = (firestore: any, path: string, ...pathSegments: string[]): DocumentReference => {
  const actualFirestore = typeof firestore === 'function' ? firestore() : 
                         (firestore?.constructor?.name === 'Object' ? getSafeFirestore() : firestore);
  
  return firebaseDoc(actualFirestore, path, ...pathSegments);
};

// ✅ SAFE: Query wrapper
export const query = (query: Query, ...queryConstraints: any[]): Query => {
  return firebaseQuery(query, ...queryConstraints);
};

// ✅ CONVENIENCE: Direct collection function that doesn't need db parameter
export const getCollection = (path: string, ...pathSegments: string[]): CollectionReference => {
  return collection(getSafeFirestore(), path, ...pathSegments);
};

// ✅ CONVENIENCE: Direct doc function that doesn't need db parameter
export const getDoc = (path: string, ...pathSegments: string[]): DocumentReference => {
  return doc(getSafeFirestore(), path, ...pathSegments);
};

// ✅ DIRECT EXPORT: Safe database instance
export const db = getSafeFirestore; 