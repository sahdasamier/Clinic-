import { useState, useEffect, useCallback, useContext } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../app/AuthProvider';
import { 
  FirebaseFormOptions, 
  FirebaseFormReturn, 
  ValidationResult,
  FirebaseError,
  SyncStatus
} from '../types/firebase';

/**
 * Reusable Firebase form hook
 * Implements Firebase as primary storage with robust error handling
 */
export const useFirebaseForm = <T extends Record<string, any>>(
  options: FirebaseFormOptions<T>
): FirebaseFormReturn<T> => {
  const { user } = useContext(AuthContext);
  const {
    collection,
    documentId,
    initialData,
    validationRules,
    enableRealTimeSync = false,
    enableAutoSave = false,
    autoSaveDelay = 2000,
    onSaveSuccess,
    onSaveError,
    onLoadSuccess,
    onLoadError
  } = options;

  // Get document ID (use provided or default to user.uid)
  const getDocumentId = useCallback(() => {
    return documentId || user?.uid || 'anonymous';
  }, [documentId, user?.uid]);

  // State management
  const [data, setData] = useState<T>(initialData);
  const [originalData, setOriginalData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Computed properties
  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);
  const hasUnsavedChanges = isDirty;
  const isValid = Object.keys(errors).length === 0;

  // Online/offline monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Validation functions
  const validateField = useCallback((field: keyof T): boolean => {
    const rule = validationRules[field];
    if (!rule) return true;

    const value = data[field];
    let error = '';

    // Required validation
    if (rule.required && (!value || String(value).trim() === '')) {
      error = `${String(field)} is required`;
    }
    // Min length validation
    else if (rule.minLength && String(value).length < rule.minLength) {
      error = `${String(field)} must be at least ${rule.minLength} characters`;
    }
    // Max length validation
    else if (rule.maxLength && String(value).length > rule.maxLength) {
      error = `${String(field)} must not exceed ${rule.maxLength} characters`;
    }
    // Email validation
    else if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      error = `${String(field)} must be a valid email address`;
    }
    // Phone validation
    else if (rule.phone && value && !/^[\+]?[1-9][\d]{0,15}$/.test(String(value).replace(/\s/g, ''))) {
      error = `${String(field)} must be a valid phone number`;
    }
    // Pattern validation
    else if (rule.pattern && value && !rule.pattern.test(String(value))) {
      error = `${String(field)} format is invalid`;
    }
    // Custom validation
    else if (rule.custom && value) {
      const customResult = rule.custom(value, data);
      if (customResult !== true) {
        error = typeof customResult === 'string' ? customResult : `${String(field)} is invalid`;
      }
    }

    // Update errors state
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[String(field)] = error;
      } else {
        delete newErrors[String(field)];
      }
      return newErrors;
    });

    return !error;
  }, [data, validationRules]);

  const validateForm = useCallback((): boolean => {
    const validationResults = Object.keys(validationRules).map(field => 
      validateField(field as keyof T)
    );
    return validationResults.every(result => result);
  }, [validationRules, validateField]);

  // Firebase error handling
  const handleFirebaseError = useCallback((error: any): FirebaseError => {
    console.error('Firebase operation failed:', error);
    
    return {
      code: error.code || 'unknown',
      message: error.message || 'An unknown error occurred',
      isNetworkError: error.code === 'unavailable' || error.code === 'deadline-exceeded',
      isAuthError: error.code === 'unauthenticated' || error.code === 'permission-denied',
      isPermissionError: error.code === 'permission-denied'
    };
  }, []);

  // Load data from Firebase
  const loadFromFirebase = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn('Cannot load from Firebase: User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, collection, getDocumentId());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const firebaseData = { 
          id: docSnap.id, 
          ...docSnap.data() 
        } as unknown as T;
        
        console.log('✅ Data loaded from Firebase:', firebaseData);
        
        setData(firebaseData);
        setOriginalData(firebaseData);
        setLastSynced(new Date());
        
        onLoadSuccess?.(firebaseData);
      } else {
        console.log('📝 No Firebase data found, using initial data');
        setOriginalData(initialData);
      }
    } catch (error) {
      const firebaseError = handleFirebaseError(error);
      console.error('❌ Failed to load from Firebase:', firebaseError);
      onLoadError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, collection, getDocumentId, initialData, onLoadSuccess, onLoadError, handleFirebaseError]);

  // Save data to Firebase
  const saveData = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      console.warn('Form validation failed, cannot save');
      return false;
    }

    if (!user) {
      console.warn('Cannot save to Firebase: User not authenticated');
      return false;
    }

    setIsSaving(true);
    
    try {
      const docRef = doc(db, collection, getDocumentId());
      const saveData = {
        ...data,
        updatedAt: serverTimestamp(),
        ...(user && { updatedBy: user.uid }),
        // Add createdAt and createdBy only for new documents
        ...(isDirty && !originalData.id ? { 
          createdAt: serverTimestamp(),
          createdBy: user.uid 
        } : {})
      };

      await setDoc(docRef, saveData, { merge: true });
      
      console.log('✅ Data saved to Firebase successfully');
      
      const updatedData = { ...data, id: getDocumentId() } as T;
      setOriginalData(updatedData);
      setLastSaved(new Date());
      setLastSynced(new Date());
      
      onSaveSuccess?.(updatedData);
      return true;
    } catch (error) {
      const firebaseError = handleFirebaseError(error);
      console.error('❌ Failed to save to Firebase:', firebaseError);
      onSaveError?.(error as Error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, validateForm, user, collection, getDocumentId, isDirty, originalData.id, onSaveSuccess, onSaveError, handleFirebaseError]);

  // Sync with Firebase (manual)
  const syncWithFirebase = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      console.warn('Cannot sync: Device is offline');
      return;
    }

    await loadFromFirebase();
  }, [isOnline, loadFromFirebase]);

  // Update field
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when updating
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[String(field)];
      return newErrors;
    });
  }, []);

  // Update multiple fields
  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  // Set entire data
  const setDataWrapper = useCallback((newData: T) => {
    setData(newData);
    setErrors({});
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setData(originalData);
    setErrors({});
  }, [originalData]);

  // Local save (placeholder - will be implemented in persistent hook)
  const saveLocally = useCallback(() => {
    console.log('Local save not implemented in base hook');
  }, []);

  // Clear local storage (placeholder)
  const clearLocalStorage = useCallback(() => {
    console.log('Clear local storage not implemented in base hook');
  }, []);

  // Error management
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [String(field)]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[String(field)];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!enableAutoSave || !isDirty || isSaving) return;

    const autoSaveTimer = setTimeout(async () => {
      if (isValid && isOnline) {
        console.log('🔄 Auto-saving to Firebase...');
        await saveData();
      }
    }, autoSaveDelay);

    return () => clearTimeout(autoSaveTimer);
  }, [enableAutoSave, isDirty, isSaving, isValid, isOnline, autoSaveDelay, saveData]);

  // Real-time sync effect
  useEffect(() => {
    if (!enableRealTimeSync || !user) return;

    const docRef = doc(db, collection, getDocumentId());
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists() && !isDirty) {
          const realtimeData = { 
            id: docSnap.id, 
            ...docSnap.data() 
          } as unknown as T;
          
          console.log('🔄 Real-time update from Firebase:', realtimeData);
          setData(realtimeData);
          setOriginalData(realtimeData);
          setLastSynced(new Date());
        }
      },
      (error) => {
        console.error('Real-time sync error:', error);
      }
    );

    return unsubscribe;
  }, [enableRealTimeSync, user, collection, getDocumentId, isDirty]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadFromFirebase();
    }
  }, [user, loadFromFirebase]);

  return {
    // State
    data,
    originalData,
    isLoading,
    isSaving,
    isDirty,
    isOnline,
    isValid,
    errors,
    lastSaved,
    lastSynced,
    hasUnsavedChanges,
    
    // Actions
    updateField,
    updateData,
    setData: setDataWrapper,
    resetForm,
    validateForm,
    validateField,
    saveData,
    saveLocally,
    loadFromFirebase,
    syncWithFirebase,
    clearLocalStorage,
    setFieldError,
    clearFieldError,
    clearAllErrors
  };
}; 