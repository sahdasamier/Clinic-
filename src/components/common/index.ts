/**
 * Common Components Exports
 * Shared UI components used across features
 */

// Basic UI components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Modal } from './Modal';
export { default as Loader } from './Loader';
export { default as ResponsiveTable } from './ResponsiveTable';

// Form components
export { default as FileUploadComponent } from './forms/FileUploadComponent';

// Status indicators
export { default as PaymentStatusIndicator } from '../PaymentStatusIndicator';
export { default as OfflineStatusIndicator } from '../OfflineStatusIndicator';

// Specialized components
export { default as ErrorBoundary } from '../ErrorBoundary';
export { default as VATSettings } from '../VATSettings';
export { default as PermissionsManager } from '../PermissionsManager';

// Medical/Healthcare specific
export { default as EnhancedMedicalConditionSelector } from '../EnhancedMedicalConditionSelector';
export { default as EnhancedMedicalRequirementSelector } from '../EnhancedMedicalRequirementSelector';
export { default as EnhancedMedicationSelector } from '../EnhancedMedicationSelector';
export { default as AvailableTimeSlotsSelector } from '../AvailableTimeSlotsSelector';

// Firebase/System components
export { default as FirebaseHealthCheck } from '../FirebaseHealthCheck';
export { default as FirebaseServiceInitializer } from '../FirebaseServiceInitializer';
export { default as BlazePlanInitializer } from '../BlazePlanInitializer';