import { Clinic } from '../types/models';

// Define features available for each subscription plan
export const SUBSCRIPTION_FEATURES = {
  basic: [
    'patients',
    'appointments',
    'basic_reports'
  ],
  premium: [
    'patients',
    'appointments', 
    'payments',
    'inventory',
    'advanced_reports',
    'notifications'
  ],
  enterprise: [
    'patients',
    'appointments',
    'payments', 
    'inventory',
    'advanced_reports',
    'notifications',
    'api_access',
    'custom_integrations',
    'bulk_operations',
    'audit_logs'
  ]
};

// Define user limits for each plan
export const SUBSCRIPTION_LIMITS = {
  basic: { maxUsers: 10, maxPatients: 500 },
  premium: { maxUsers: 50, maxPatients: 2000 },
  enterprise: { maxUsers: 999, maxPatients: 999999 }
};

// Check if a feature is available for a subscription plan
export const hasFeatureAccess = (plan: string, feature: string): boolean => {
  const planFeatures = SUBSCRIPTION_FEATURES[plan as keyof typeof SUBSCRIPTION_FEATURES];
  return planFeatures ? planFeatures.includes(feature) : false;
};

// Check if clinic can add more users
export const canAddUser = (clinic: Clinic, currentUserCount: number): boolean => {
  return currentUserCount < clinic.settings.maxUsers;
};

// Get remaining user slots
export const getRemainingUserSlots = (clinic: Clinic, currentUserCount: number): number => {
  return Math.max(0, clinic.settings.maxUsers - currentUserCount);
};

// Get plan display information
export const getPlanInfo = (plan: string) => {
  const planKey = plan as keyof typeof SUBSCRIPTION_FEATURES;
  
  switch (planKey) {
    case 'basic':
      return {
        name: 'Basic',
        color: 'default',
        features: SUBSCRIPTION_FEATURES.basic,
        limits: SUBSCRIPTION_LIMITS.basic,
        description: 'Essential features for small clinics'
      };
    case 'premium':
      return {
        name: 'Premium', 
        color: 'primary',
        features: SUBSCRIPTION_FEATURES.premium,
        limits: SUBSCRIPTION_LIMITS.premium,
        description: 'Advanced features for growing clinics'
      };
    case 'enterprise':
      return {
        name: 'Enterprise',
        color: 'secondary', 
        features: SUBSCRIPTION_FEATURES.enterprise,
        limits: SUBSCRIPTION_LIMITS.enterprise,
        description: 'Complete solution for large clinic networks'
      };
    default:
      return {
        name: 'Unknown',
        color: 'default',
        features: [],
        limits: { maxUsers: 0, maxPatients: 0 },
        description: 'Unknown plan'
      };
  }
};

// Validate if user count is within plan limits
export const validateUserLimit = (plan: string, customMaxUsers: number, currentUserCount: number): {
  isValid: boolean;
  message?: string;
} => {
  const planLimits = SUBSCRIPTION_LIMITS[plan as keyof typeof SUBSCRIPTION_LIMITS];
  
  if (!planLimits) {
    return { isValid: false, message: 'Invalid subscription plan' };
  }
  
  if (customMaxUsers > planLimits.maxUsers) {
    return { 
      isValid: false, 
      message: `${plan} plan supports maximum ${planLimits.maxUsers} users` 
    };
  }
  
  if (currentUserCount >= customMaxUsers) {
    return {
      isValid: false,
      message: `Cannot add user. Limit of ${customMaxUsers} users reached.`
    };
  }
  
  return { isValid: true };
}; 