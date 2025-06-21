import { useState, useEffect, useCallback } from 'react';

export interface PersistentFormOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  validateOnSave?: boolean;
}

export const usePersistentForm = <T extends Record<string, any>>(
  storageKey: string, 
  defaultValues: T,
  options: PersistentFormOptions = {}
) => {
  const { autoSave = false, autoSaveDelay = 2000, validateOnSave = false } = options;

  // ✅ Initialize state with localStorage data
  const [formData, setFormData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log(`✅ Loaded ${storageKey} from localStorage:`, parsedData);
        return { ...defaultValues, ...parsedData };
      }
    } catch (error) {
      console.error(`❌ Failed to parse ${storageKey} from localStorage:`, error);
    }
    
    console.log(`ℹ️ Using default values for ${storageKey}`);
    return defaultValues;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save to localStorage
  const saveToStorage = useCallback((data: T = formData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setLastSaved(new Date());
      setIsDirty(false);
      console.log(`✅ Saved ${storageKey} to localStorage:`, data);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save ${storageKey}:`, error);
      return false;
    }
  }, [storageKey, formData]);

  // Enhanced setFormData that tracks dirty state
  const updateFormData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      setIsDirty(JSON.stringify(newData) !== JSON.stringify(prev));
      return newData;
    });
  }, []);

  // Update a single field
  const updateField = useCallback((field: keyof T, value: any) => {
    updateFormData({ [field]: value } as Partial<T>);
  }, [updateFormData]);

  // Clear storage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setIsDirty(false);
      setLastSaved(null);
      console.log(`🗑️ Cleared ${storageKey} from localStorage`);
    } catch (error) {
      console.error(`❌ Failed to clear ${storageKey}:`, error);
    }
  }, [storageKey]);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setFormData(defaultValues);
    setIsDirty(false);
  }, [defaultValues]);

  // Validate form data
  const validateForm = useCallback((validationRules?: Record<keyof T, any>) => {
    if (!validateOnSave || !validationRules) return true;
    
    // Add your validation logic here
    // This is a placeholder for the validation system
    console.log('🔍 Validating form data:', formData);
    return true;
  }, [formData, validateOnSave]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      saveToStorage();
      console.log(`🔄 Auto-saved ${storageKey}`);
    }, autoSaveDelay);

    return () => clearTimeout(autoSaveTimer);
  }, [autoSave, isDirty, autoSaveDelay, saveToStorage, storageKey]);

  // Enhanced save function with validation
  const handleSave = useCallback(async (validationRules?: Record<keyof T, any>) => {
    console.log(`🔄 Save button clicked for ${storageKey}!`);
    console.log('📋 Data to save:', formData);
    
    if (validateOnSave && validationRules) {
      const isValid = validateForm(validationRules);
      if (!isValid) {
        console.log('❌ Validation failed!');
        return false;
      }
    }

    console.log('✅ Validation passed!');
    const success = saveToStorage();
    
    if (success) {
      // Verify it was saved
      const saved = localStorage.getItem(storageKey);
      console.log('✅ Verification - Data in localStorage:', saved);
    }
    
    return success;
  }, [formData, storageKey, validateForm, validateOnSave, saveToStorage]);

  return {
    // Data
    formData,
    isDirty,
    lastSaved,
    
    // Actions
    setFormData: updateFormData,
    updateField,
    saveToStorage,
    clearStorage,
    resetForm,
    handleSave,
    validateForm
  };
}; 