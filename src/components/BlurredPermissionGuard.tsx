import React from 'react';
import { useUser } from '../contexts/UserContext';
import { hasPermission, getUserPermissions } from '../types/permissions';
import { PermissionKey, PermissionLevel } from '../types/permissions';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Backdrop,
  Card,
  CardContent
} from '@mui/material';
import { 
  Lock, 
  ContactSupport, 
  VisibilityOff 
} from '@mui/icons-material';

interface BlurredPermissionGuardProps {
  children: React.ReactNode;
  feature: PermissionKey;
  level?: PermissionLevel;
  fallback?: React.ReactNode;
}

const BlurredPermissionGuard: React.FC<BlurredPermissionGuardProps> = ({
  children,
  feature,
  level = 'read',
  fallback,
}) => {
  const { userProfile, isAdmin } = useUser();

  // Super admins have access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user has required permissions
  const hasAccess = userProfile 
    ? hasPermission(getUserPermissions(userProfile), feature, level)
    : false;

  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show blurred content with access denied overlay
  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: '400px' }}>
      {/* Blurred background content */}
      <Box 
        sx={{ 
          filter: 'blur(8px)', 
          opacity: 0.3,
          pointerEvents: 'none',
          userSelect: 'none',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {children}
      </Box>
      
      {/* Access denied overlay */}
      <Backdrop
        open={true}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card 
          sx={{ 
            maxWidth: 450,
            mx: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                }
              }}
            >
              <Lock sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Access Restricted
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <VisibilityOff sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Content Hidden
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
              You don't have permission to access this feature. The content has been blurred for privacy. 
              Contact your administrator if you need access.
            </Typography>

            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                <strong>Required Permission:</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {level} access to {feature.replace(/_/g, ' ')}
              </Typography>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<ContactSupport />}
                onClick={() => {
                  window.open('mailto:admin@sahdasclinic.com?subject=Access Request&body=I need access to: ' + feature, '_blank');
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Request Access
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Backdrop>
    </Box>
  );
};

export default BlurredPermissionGuard; 