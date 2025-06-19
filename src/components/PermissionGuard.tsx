import React from 'react';
import { useUser } from '../contexts/UserContext';
import { hasPermission, getUserPermissions } from '../types/permissions';
import { PermissionKey, PermissionLevel } from '../types/permissions';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Lock, ContactSupport } from '@mui/icons-material';

interface PermissionGuardProps {
  children: React.ReactNode;
  feature: PermissionKey;
  level?: PermissionLevel;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  feature,
  level = 'read',
  fallback,
  showFallback = true,
}) => {
  const { userProfile, isAdmin } = useUser();

  // Super admins have access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user has required permissions
  if (userProfile) {
    const userPermissions = getUserPermissions(userProfile);
    const hasAccess = hasPermission(userPermissions, feature, level);

    if (hasAccess) {
      return <>{children}</>;
    }
  }

  // If no access and fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // If showFallback is false, render nothing
  if (!showFallback) {
    return null;
  }

  // Default access denied message
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 400,
          backgroundColor: 'background.paper',
        }}
      >
        <Lock color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Access Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You don't have permission to access this feature. Contact your administrator if you need access.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Required: {level} access to {feature.replace('_', ' ')}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ContactSupport />}
            size="small"
            onClick={() => {
              // You could implement a help/contact feature here
              window.open('mailto:admin@sahdasclinic.com?subject=Access Request', '_blank');
            }}
          >
            Request Access
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PermissionGuard; 