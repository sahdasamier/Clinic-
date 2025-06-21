import { useState, useEffect } from 'react';

export const usePersistentForm = <T extends Record<string, any>>(
  formKey: string,
  initialValues: T
) => {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`form_${formKey}`);
      return saved ? { ...initialValues, ...JSON.parse(saved) } : initialValues;
    } catch {
      return initialValues;
    }
  });

  // Auto-save to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`form_${formKey}`, JSON.stringify(formData));
      } catch (error) {
        console.warn('Failed to save form data:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, formKey]);

  const updateForm = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialValues);
    localStorage.removeItem(`form_${formKey}`);
  };

  const clearCache = () => {
    localStorage.removeItem(`form_${formKey}`);
  };

  return {
    formData,
    setFormData,
    updateForm,
    resetForm,
    clearCache
  };
}; 