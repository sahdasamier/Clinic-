// Validation utilities for form validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  missingFields: string[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Validation functions
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  // Remove spaces, dashes, parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return PHONE_REGEX.test(cleanPhone) && cleanPhone.length >= 10;
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return !!(value && value.length >= minLength);
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return !value || value.length <= maxLength;
};

export const validateDate = (date: string): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const validateFutureDate = (date: string): boolean => {
  if (!validateDate(date)) return false;
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj >= today;
};

export const validateTime = (time: string): boolean => {
  if (!time) return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Field validation rules
export interface FieldValidationRule {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  minLength?: number;
  maxLength?: number;
  futureDate?: boolean;
  time?: boolean;
  custom?: (value: any, formData?: any) => boolean | string;
}

export const validateField = (
  fieldName: string,
  value: any,
  rules: FieldValidationRule,
  customMessages: Record<string, string> = {},
  formData?: any
): string | null => {
  // Required validation
  if (rules.required && !validateRequired(value)) {
    return customMessages[`${fieldName}_required`] || 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!validateRequired(value)) {
    return null;
  }

  // Email validation
  if (rules.email && !validateEmail(value)) {
    return customMessages[`${fieldName}_email`] || 'Please enter a valid email address';
  }

  // Phone validation
  if (rules.phone && !validatePhone(value)) {
    return customMessages[`${fieldName}_phone`] || 'Please enter a valid phone number';
  }

  // Min length validation
  if (rules.minLength && !validateMinLength(value, rules.minLength)) {
    return customMessages[`${fieldName}_minLength`] || `Minimum ${rules.minLength} characters required`;
  }

  // Max length validation
  if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
    return customMessages[`${fieldName}_maxLength`] || `Maximum ${rules.maxLength} characters allowed`;
  }

  // Future date validation
  if (rules.futureDate && !validateFutureDate(value)) {
    return customMessages[`${fieldName}_futureDate`] || 'Please select a future date';
  }

  // Time validation
  if (rules.time && !validateTime(value)) {
    return customMessages[`${fieldName}_time`] || 'Please enter a valid time';
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(value, formData);
    if (typeof customResult === 'string') {
      return customResult;
    }
    if (customResult === false) {
      return customMessages[`${fieldName}_custom`] || 'Invalid value';
    }
  }

  return null;
};

export const validateForm = <T extends Record<string, any>>(
  formData: T,
  validationRules: Record<keyof T, FieldValidationRule>,
  customMessages: Record<string, string> = {}
): ValidationResult => {
  const errors: Record<string, string> = {};
  const missingFields: string[] = [];

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const error = validateField(fieldName, fieldValue, rules, customMessages, formData);
    
    if (error) {
      errors[fieldName] = error;
      if (rules.required && !validateRequired(fieldValue)) {
        missingFields.push(fieldName);
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingFields
  };
};

// Common validation rule presets
export const commonValidationRules = {
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  name: { required: true, minLength: 2, maxLength: 50 },
  appointmentDate: { required: true, futureDate: true },
  appointmentTime: { required: true, time: true },
  notes: { maxLength: 500 }
} as const; 