// Export all services from a central location
export { AppointmentService } from './AppointmentService';
export { InventoryService } from './InventoryService';
export { PatientService } from './PatientService';
export { ScheduleService } from './ScheduleService';
export { PaymentService } from './PaymentService';
export { PaymentNotificationService } from './paymentNotificationService';

// Re-export types from services that provide them
export type { Appointment } from './AppointmentService';
export type { InventoryItem } from './InventoryService';
export type { Patient } from './PatientService';
export type { DoctorSchedule, TimeSlot } from './ScheduleService';
export type { Payment } from './PaymentService';

// Re-export common types and utilities
export type ServiceCallback<T> = (data: T) => void;
export type ServiceUnsubscribe = () => void;

// Common service patterns and utilities
export const ServiceUtils = {
  // Generate a unique ID
  generateId: (): string => crypto.randomUUID(),
  
  // Format date to YYYY-MM-DD
  formatDate: (date: Date): string => date.toISOString().split('T')[0],
  
  // Get today's date in YYYY-MM-DD format
  getToday: (): string => new Date().toISOString().split('T')[0],
  
  // Calculate age from birth date
  calculateAge: (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },
  
  // Format time to HH:MM
  formatTime: (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  },
  
  // Parse time string to minutes since midnight
  parseTimeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },
  
  // Convert minutes since midnight to HH:MM format
  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },
  
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate phone format (basic)
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },
  
  // Generate avatar initials from name
  generateAvatar: (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  },
  
  // Handle Firestore errors gracefully
  handleFirestoreError: (error: any, context: string): void => {
    console.error(`❌ Firestore error in ${context}:`, error);
    
    // You can extend this to show user-friendly messages
    // or integrate with your notification system
    if (error.code === 'permission-denied') {
      console.warn('Permission denied - check Firestore rules');
    } else if (error.code === 'offline') {
      console.warn('Device is offline');
    } else if (error.code === 'unavailable') {
      console.warn('Firestore service unavailable');
    }
  },
  
  // Create a safe listener that handles errors
  createSafeListener: <T>(
    listenerFn: (callback: ServiceCallback<T>) => ServiceUnsubscribe,
    callback: ServiceCallback<T>,
    errorHandler?: (error: any) => void
  ): ServiceUnsubscribe => {
    try {
      return listenerFn((data: T) => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in listener callback:', error);
          errorHandler?.(error);
        }
      });
    } catch (error) {
      console.error('❌ Error setting up listener:', error);
      errorHandler?.(error);
      return () => {}; // Return no-op unsubscribe function
    }
  }
};

// Example service integration patterns
export const ServicePatterns = {
  // Standard pattern for components using services
  useServiceData: <T>(
    serviceFn: (callback: ServiceCallback<T>) => ServiceUnsubscribe,
    initialData: T
  ) => {
    // This would typically be in a React hook
    console.log('Service pattern example - integrate with your state management');
    
    // Example implementation:
    // const [data, setData] = useState(initialData);
    // 
    // useEffect(() => {
    //   const unsubscribe = serviceFn(setData);
    //   return unsubscribe;
    // }, []);
    // 
    // return data;
  },
  
  // Pattern for handling async operations with loading states
  withLoadingState: async <T>(
    operation: () => Promise<T>,
    onLoading?: (loading: boolean) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      onLoading?.(true);
      const result = await operation();
      onLoading?.(false);
      return result;
    } catch (error) {
      onLoading?.(false);
      onError?.(error);
      ServiceUtils.handleFirestoreError(error, 'async operation');
      return null;
    }
  }
};

// Service configuration
export const ServiceConfig = {
  // Default pagination limits
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  
  // Cache settings
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Validation rules
  VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_PHONE_LENGTH: 10,
    MAX_PHONE_LENGTH: 15,
  }
};

// Default export for easy access
export default {
  ServiceUtils,
  ServicePatterns,
  ServiceConfig
}; 