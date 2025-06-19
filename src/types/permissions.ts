// Available pages/features in the system
export type PermissionKey = 
  | 'dashboard'
  | 'patients'
  | 'appointments' 
  | 'payments'
  | 'inventory'
  | 'reports'
  | 'settings'
  | 'notifications'
  | 'doctor_scheduling'
  | 'patient_details'
  | 'appointment_calendar'
  | 'payment_management'
  | 'inventory_management'
  | 'user_management'
  | 'clinic_settings';

// Permission levels
export type PermissionLevel = 'none' | 'read' | 'write' | 'full';

// User permissions structure
export type UserPermissions = {
  [K in PermissionKey]: PermissionLevel;
};

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  management: {
    dashboard: 'full',
    patients: 'full',
    appointments: 'full',
    payments: 'full',
    inventory: 'full',
    reports: 'full',
    settings: 'full',
    notifications: 'full',
    doctor_scheduling: 'full',
    patient_details: 'full',
    appointment_calendar: 'full',
    payment_management: 'full',
    inventory_management: 'full',
    user_management: 'write',
    clinic_settings: 'write'
  },
  doctor: {
    dashboard: 'full',
    patients: 'full',
    appointments: 'full',
    payments: 'read',
    inventory: 'read',
    reports: 'read',
    settings: 'read',
    notifications: 'full',
    doctor_scheduling: 'full',
    patient_details: 'full',
    appointment_calendar: 'full',
    payment_management: 'none',
    inventory_management: 'none',
    user_management: 'none',
    clinic_settings: 'none'
  },
  receptionist: {
    dashboard: 'read',
    patients: 'write',
    appointments: 'full',
    payments: 'write',
    inventory: 'read',
    reports: 'read',
    settings: 'none',
    notifications: 'read',
    doctor_scheduling: 'read',
    patient_details: 'write',
    appointment_calendar: 'write',
    payment_management: 'write',
    inventory_management: 'none',
    user_management: 'none',
    clinic_settings: 'none'
  }
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  dashboard: 'Main dashboard and overview',
  patients: 'Patient management and records',
  appointments: 'Appointment scheduling and management',
  payments: 'Payment processing and billing',
  inventory: 'Inventory and supplies management',
  reports: 'Reports and analytics',
  settings: 'System settings and configuration',
  notifications: 'Notifications and alerts',
  doctor_scheduling: 'Doctor scheduling and availability',
  patient_details: 'Detailed patient information',
  appointment_calendar: 'Calendar view and scheduling',
  payment_management: 'Advanced payment features',
  inventory_management: 'Inventory control and ordering',
  user_management: 'User management within clinic',
  clinic_settings: 'Clinic-specific settings'
};

// Permission level descriptions
export const PERMISSION_LEVEL_DESCRIPTIONS: Record<PermissionLevel, string> = {
  none: 'No access - Feature is hidden',
  read: 'View only - Can see but not modify',
  write: 'Edit access - Can view and modify',
  full: 'Full access - All capabilities including delete'
};

// Check if user has permission for a specific action
export const hasPermission = (
  userPermissions: UserPermissions, 
  feature: PermissionKey, 
  requiredLevel: PermissionLevel = 'read'
): boolean => {
  const userLevel = userPermissions[feature];
  
  if (userLevel === 'none') return false;
  if (requiredLevel === 'none') return true;
  if (userLevel === 'full') return true;
  
  const levels: PermissionLevel[] = ['none', 'read', 'write', 'full'];
  const userLevelIndex = levels.indexOf(userLevel);
  const requiredLevelIndex = levels.indexOf(requiredLevel);
  
  return userLevelIndex >= requiredLevelIndex;
};

// Get permissions for a user (with role fallback)
export const getUserPermissions = (user: any): UserPermissions => {
  // If user has custom permissions, use those
  if (user.permissions) {
    return user.permissions;
  }
  
  // Otherwise, use default permissions for their role
  return DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS.receptionist;
}; 