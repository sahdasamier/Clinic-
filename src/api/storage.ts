import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  StorageReference
} from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

export interface UploadResult {
  url: string;
  fileName: string;
  fullPath: string;
  size: number;
  contentType: string;
}

export const StorageService = {
  // Upload patient documents (PDFs, images, etc.)
  uploadPatientDocument: async (
    patientId: string, 
    file: File, 
    category: 'medical_records' | 'lab_results' | 'prescriptions' | 'insurance' | 'images'
  ): Promise<UploadResult> => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fileRef = ref(storage, `patients/${patientId}/documents/${category}/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
      url,
      fileName,
      fullPath: snapshot.ref.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || 'application/octet-stream'
    };
  },

  // Upload medical images with automatic resizing
  uploadMedicalImage: async (patientId: string, file: File): Promise<UploadResult> => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fileRef = ref(storage, `patients/${patientId}/images/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
      url,
      fileName,
      fullPath: snapshot.ref.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || 'image/jpeg'
    };
  },

  // Upload prescription PDFs
  uploadPrescription: async (appointmentId: string, file: File): Promise<UploadResult> => {
    const timestamp = Date.now();
    const fileName = `prescription_${timestamp}_${file.name}`;
    const fileRef = ref(storage, `prescriptions/${appointmentId}/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
      url,
      fileName,
      fullPath: snapshot.ref.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || 'application/pdf'
    };
  },

  // Upload clinic documents (licenses, certificates, etc.)
  uploadClinicDocument: async (
    clinicId: string, 
    file: File, 
    type: 'license' | 'certificate' | 'insurance' | 'other'
  ): Promise<UploadResult> => {
    const timestamp = Date.now();
    const fileName = `${type}_${timestamp}_${file.name}`;
    const fileRef = ref(storage, `clinics/${clinicId}/${type}/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
      url,
      fileName,
      fullPath: snapshot.ref.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || 'application/octet-stream'
    };
  },

  // Upload clinic profile images/logos
  uploadClinicLogo: async (clinicId: string, file: File): Promise<UploadResult> => {
    const fileName = `logo_${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `clinics/${clinicId}/branding/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
      url,
      fileName,
      fullPath: snapshot.ref.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || 'image/jpeg'
    };
  },

  // Upload patient profile pictures
  uploadPatientAvatar: async (patientId: string, file: File): Promise<UploadResult> => {
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `patients/${patientId}/avatar/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const metadata = await getMetadata(snapshot.ref);
    
    return {
      url,
      fileName,
      fullPath: snapshot.ref.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || 'image/jpeg'
    };
  },

  // List all files for a patient
  listPatientFiles: async (patientId: string, category?: string): Promise<StorageReference[]> => {
    const basePath = category 
      ? `patients/${patientId}/documents/${category}/`
      : `patients/${patientId}/`;
    const listRef = ref(storage, basePath);
    const result = await listAll(listRef);
    return result.items;
  },

  // Delete a file
  deleteFile: async (fullPath: string): Promise<void> => {
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
  },

  // Get file metadata
  getFileMetadata: async (fullPath: string) => {
    const fileRef = ref(storage, fullPath);
    return await getMetadata(fileRef);
  },

  // Generate download URL for existing file
  getDownloadUrl: async (fullPath: string): Promise<string> => {
    const fileRef = ref(storage, fullPath);
    return await getDownloadURL(fileRef);
  },

  // Helper function to format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to validate file type
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  // Helper function to validate file size (in MB)
  validateFileSize: (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
};

// Common file type constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_MEDICAL_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, 'text/plain'];

// File size limits (in MB)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5,      // 5MB for images
  DOCUMENT: 10,  // 10MB for documents
  MEDICAL: 15    // 15MB for medical files
}; 