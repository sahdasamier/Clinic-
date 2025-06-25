import { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  getUserPermissions, 
  hasPermission, 
  PermissionKey, 
  PermissionLevel,
  DEFAULT_PERMISSIONS 
} from '../types/permissions';

interface UsePermissionsReturn {
  // Basic permission checking
  hasPermission: (feature: PermissionKey, level?: PermissionLevel) => boolean;
  getPermissionLevel: (feature: PermissionKey) => PermissionLevel;
  
  // Bulk permission checking
  hasAnyPermission: (features: PermissionKey[], level?: PermissionLevel) => boolean;
  hasAllPermissions: (features: PermissionKey[], level?: PermissionLevel) => boolean;
  
  // Role and access information
  userPermissions: Record<PermissionKey, PermissionLevel> | null;
  isAdmin: boolean;
  userRole: string | null;
  
  // Permission filtering
  filterByPermission: <T extends { permission?: PermissionKey; minLevel?: PermissionLevel }>(
    items: T[],
    defaultLevel?: PermissionLevel
  ) => T[];
  
  // Access level helpers
  canRead: (feature: PermissionKey) => boolean;
  canWrite: (feature: PermissionKey) => boolean;
  canDelete: (feature: PermissionKey) => boolean;
  
  // Feature group access
  getCoreAccess: () => PermissionKey[];
  getBusinessAccess: () => PermissionKey[];
  getAdvancedAccess: () => PermissionKey[];
  getAdminAccess: () => PermissionKey[];
  
  // Permission summary
  getAccessSummary: () => {
    total: number;
    byLevel: Record<PermissionLevel, number>;
    accessible: PermissionKey[];
    restricted: PermissionKey[];
  };
  
  // Loading state
  loading: boolean;
}

/**
 * Comprehensive hook for client-side permission management
 * Provides real-time permission checking and utilities
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { userProfile, isAdmin, loading } = useUser();

  // Get user permissions with memoization
  const userPermissions = useMemo(() => {
    if (isAdmin) {
      // Super admins have full access to everything
      return Object.keys(DEFAULT_PERMISSIONS.management).reduce((acc, key) => {
        acc[key as PermissionKey] = 'full';
        return acc;
      }, {} as Record<PermissionKey, PermissionLevel>);
    }
    
    if (!userProfile) return null;
    
    return getUserPermissions(userProfile);
  }, [userProfile, isAdmin]);

  // Permission feature groups
  const permissionGroups = useMemo(() => ({
    core: ['dashboard', 'patients', 'appointments'] as PermissionKey[],
    business: ['payments', 'inventory', 'reports'] as PermissionKey[],
    advanced: ['doctor_scheduling', 'notifications', 'settings'] as PermissionKey[],
    admin: ['user_management', 'clinic_settings'] as PermissionKey[],
  }), []);

  // Basic permission checking
  const checkPermission = (feature: PermissionKey, level: PermissionLevel = 'read'): boolean => {
    if (isAdmin) return true;
    if (!userPermissions) return false;
    
    return hasPermission(userPermissions, feature, level);
  };

  // Get permission level for a feature
  const getPermissionLevel = (feature: PermissionKey): PermissionLevel => {
    if (isAdmin) return 'full';
    if (!userPermissions) return 'none';
    
    return userPermissions[feature] || 'none';
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (features: PermissionKey[], level: PermissionLevel = 'read'): boolean => {
    return features.some(feature => checkPermission(feature, level));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (features: PermissionKey[], level: PermissionLevel = 'read'): boolean => {
    return features.every(feature => checkPermission(feature, level));
  };

  // Filter items based on permission requirements
  const filterByPermission = <T extends { permission?: PermissionKey; minLevel?: PermissionLevel }>(
    items: T[],
    defaultLevel: PermissionLevel = 'read'
  ): T[] => {
    return items.filter(item => {
      if (!item.permission) return true; // No permission requirement
      return checkPermission(item.permission, item.minLevel || defaultLevel);
    });
  };

  // Quick access level checks
  const canRead = (feature: PermissionKey): boolean => checkPermission(feature, 'read');
  const canWrite = (feature: PermissionKey): boolean => checkPermission(feature, 'write');
  const canDelete = (feature: PermissionKey): boolean => checkPermission(feature, 'full');

  // Feature group access
  const getCoreAccess = (): PermissionKey[] => {
    return permissionGroups.core.filter(feature => checkPermission(feature));
  };

  const getBusinessAccess = (): PermissionKey[] => {
    return permissionGroups.business.filter(feature => checkPermission(feature));
  };

  const getAdvancedAccess = (): PermissionKey[] => {
    return permissionGroups.advanced.filter(feature => checkPermission(feature));
  };

  const getAdminAccess = (): PermissionKey[] => {
    return permissionGroups.admin.filter(feature => checkPermission(feature));
  };

  // Comprehensive access summary
  const getAccessSummary = () => {
    if (!userPermissions) {
      return {
        total: 0,
        byLevel: { none: 0, read: 0, write: 0, full: 0 } as Record<PermissionLevel, number>,
        accessible: [] as PermissionKey[],
        restricted: [] as PermissionKey[],
      };
    }

    const allFeatures = Object.keys(userPermissions) as PermissionKey[];
    const accessible = allFeatures.filter(feature => checkPermission(feature));
    const restricted = allFeatures.filter(feature => !checkPermission(feature));

    const byLevel = allFeatures.reduce((acc, feature) => {
      const level = getPermissionLevel(feature);
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<PermissionLevel, number>);

    return {
      total: allFeatures.length,
      byLevel: {
        none: byLevel.none || 0,
        read: byLevel.read || 0,
        write: byLevel.write || 0,
        full: byLevel.full || 0,
      },
      accessible,
      restricted,
    };
  };

  return {
    // Basic permission checking
    hasPermission: checkPermission,
    getPermissionLevel,
    
    // Bulk permission checking
    hasAnyPermission,
    hasAllPermissions,
    
    // Role and access information
    userPermissions,
    isAdmin,
    userRole: userProfile?.role || null,
    
    // Permission filtering
    filterByPermission,
    
    // Access level helpers
    canRead,
    canWrite,
    canDelete,
    
    // Feature group access
    getCoreAccess,
    getBusinessAccess,
    getAdvancedAccess,
    getAdminAccess,
    
    // Permission summary
    getAccessSummary,
    
    // Loading state
    loading,
  };
};

/**
 * Hook for permission-aware component rendering
 * Simplifies conditional rendering based on permissions
 */
export const usePermissionGuard = (
  feature: PermissionKey,
  level: PermissionLevel = 'read'
) => {
  const { hasPermission, loading, isAdmin } = usePermissions();
  
  const canAccess = hasPermission(feature, level);
  const isLoading = loading;
  
  return {
    canAccess,
    isLoading,
    isAdmin,
    render: (component: React.ReactNode) => canAccess ? component : null,
    renderWithFallback: (
      component: React.ReactNode,
      fallback: React.ReactNode = null
    ) => canAccess ? component : fallback,
  };
};

/**
 * Hook for permission-aware navigation
 * Provides navigation utilities that respect user permissions
 */
export const usePermissionNavigation = () => {
  const { hasPermission, filterByPermission } = usePermissions();
  
  const filterNavItems = <T extends { permission?: PermissionKey; minLevel?: PermissionLevel }>(
    navItems: T[]
  ) => filterByPermission(navItems);
  
  const canNavigateTo = (feature: PermissionKey, level: PermissionLevel = 'read') => {
    return hasPermission(feature, level);
  };
  
  return {
    filterNavItems,
    canNavigateTo,
    hasPermission,
  };
};

export default usePermissions; 