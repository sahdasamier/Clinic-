/**
 * Modern Firebase Storage v9+ Configuration
 * File upload and management utilities
 */

import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type FirebaseStorage,
  type StorageReference,
  type UploadResult,
  type UploadTask
} from 'firebase/storage';
import { getFirebaseApp } from './config';

let storageInstance: FirebaseStorage | null = null;

/**
 * Initializes and returns Firebase Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (storageInstance) {
    return storageInstance;
  }

  try {
    const app = getFirebaseApp();
    storageInstance = getStorage(app);

    // Setup emulator in development
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_STORAGE_EMULATOR === 'true') {
      const emulatorHost = import.meta.env.VITE_STORAGE_EMULATOR_HOST || 'localhost';
      const emulatorPort = parseInt(import.meta.env.VITE_STORAGE_EMULATOR_PORT || '9199');
      
      try {
        connectStorageEmulator(storageInstance, emulatorHost, emulatorPort);
        console.debug(`🔧 Connected to Storage emulator at ${emulatorHost}:${emulatorPort}`);
      } catch (emulatorError) {
        console.warn('⚠️ Failed to connect to Storage emulator:', emulatorError);
      }
    }

    console.debug('📁 Firebase Storage initialized');
    return storageInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Storage:', error);
    throw error;
  }
}

/**
 * Checks if Storage is initialized
 */
export function isStorageReady(): boolean {
  return storageInstance !== null;
}

/**
 * Storage service functions
 */
export const storageService = {
  /**
   * Get a reference to a file
   */
  getRef(path: string): StorageReference {
    const storage = getFirebaseStorage();
    return ref(storage, path);
  },

  /**
   * Upload a file (simple upload for small files)
   */
  async uploadFile(path: string, file: File | Blob): Promise<UploadResult> {
    try {
      const storage = getFirebaseStorage();
      const fileRef = ref(storage, path);
      const result = await uploadBytes(fileRef, file);
      console.debug(`📁 File uploaded to ${path}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to upload file to ${path}:`, error);
      throw error;
    }
  },

  /**
   * Upload a file with progress tracking (for large files)
   */
  uploadFileWithProgress(path: string, file: File | Blob): UploadTask {
    const storage = getFirebaseStorage();
    const fileRef = ref(storage, path);
    return uploadBytesResumable(fileRef, file);
  },

  /**
   * Get download URL for a file
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storage = getFirebaseStorage();
      const fileRef = ref(storage, path);
      const url = await getDownloadURL(fileRef);
      console.debug(`🔗 Got download URL for ${path}`);
      return url;
    } catch (error) {
      console.error(`❌ Failed to get download URL for ${path}:`, error);
      throw error;
    }
  },

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storage = getFirebaseStorage();
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      console.debug(`🗑️ File deleted: ${path}`);
    } catch (error) {
      console.error(`❌ Failed to delete file ${path}:`, error);
      throw error;
    }
  },

  /**
   * List all files in a directory
   */
  async listFiles(path: string): Promise<StorageReference[]> {
    try {
      const storage = getFirebaseStorage();
      const dirRef = ref(storage, path);
      const result = await listAll(dirRef);
      console.debug(`📂 Listed ${result.items.length} files in ${path}`);
      return result.items;
    } catch (error) {
      console.error(`❌ Failed to list files in ${path}:`, error);
      throw error;
    }
  },

  /**
   * Upload patient document
   */
  async uploadPatientDocument(patientId: string, file: File, category: string): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const path = `patients/${patientId}/documents/${category}/${fileName}`;
    
    await this.uploadFile(path, file);
    return await this.getDownloadURL(path);
  },

  /**
   * Upload clinic logo
   */
  async uploadClinicLogo(clinicId: string, file: File): Promise<string> {
    const fileName = `logo_${Date.now()}.${file.name.split('.').pop()}`;
    const path = `clinics/${clinicId}/logo/${fileName}`;
    
    await this.uploadFile(path, file);
    return await this.getDownloadURL(path);
  }
};