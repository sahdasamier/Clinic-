import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { hasPermission, getUserPermissions, PermissionKey, PermissionLevel } from '../types/permissions';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Fade,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Lock,
  Home,
  ArrowBack,
  ContactSupport,
  Security,
  Warning,
} from '@mui/icons-material';

interface EnhancedRouteGuardProps {
  children: React.ReactNode;
  feature: PermissionKey;
  level?: PermissionLevel;
  redirectTo?: string;
  showUnauthorized?: boolean;
}

const EnhancedRouteGuard: React.FC<EnhancedRouteGuardProps> = ({
  children,
  feature,
  level = 'read',
  redirectTo = '/dashboard',
  showUnauthorized = true,
}) => {
  const { userProfile, isAdmin, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // Super admins have access to everything
    if (isAdmin) {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    // Check user permissions
    if (userProfile) {
      const userPermissions = getUserPermissions(userProfile);
      const access = hasPermission(userPermissions, feature, level);
      setHasAccess(access);
      
      // If no access and redirect is enabled, navigate away
      if (!access && !showUnauthorized) {
        // Store attempted location for potential future access
        sessionStorage.setItem('lastAttemptedRoute', location.pathname);
        navigate(redirectTo, { replace: true });
      }
    } else {
      setHasAccess(false);
    }
    
    setChecking(false);
  }, [userProfile, isAdmin, loading, feature, level, navigate, location.pathname, redirectTo, showUnauthorized]);

  // Show loading state
  if (loading || checking) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Checking permissions...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Super admin or has access - show content
  if (isAdmin || hasAccess) {
    return <>{children}</>;
  }

  // No access and showing unauthorized page
  if (!hasAccess && showUnauthorized) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Fade in={true} timeout={600}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {/* Unauthorized Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '3px solid #fca5a5',
                }}
              >
                <Lock sx={{ fontSize: 40, color: '#dc2626' }} />
              </Box>

              {/* Main Message */}
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1f2937' }}>
                Access Restricted
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, color: '#6b7280', lineHeight: 1.6 }}>
                You don't have permission to access this feature. Your current role provides 
                limited access to maintain security and data integrity.
              </Typography>

              {/* Permission Details */}
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  textAlign: 'left',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  border: '1px solid #93c5fd',
                  '& .MuiAlert-icon': {
                    color: '#2563eb'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Permission Requirements:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • <strong>Feature:</strong> {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • <strong>Required Level:</strong> {level.charAt(0).toUpperCase() + level.slice(1)}
                </Typography>
                {userProfile && (
                  <>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • <strong>Your Role:</strong> {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Your Access:</strong> {getUserPermissions(userProfile)[feature] || 'None'}
                    </Typography>
                  </>
                )}
              </Alert>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Home />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    }
                  }}
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(-1)}
                  sx={{
                    borderColor: '#6b7280',
                    color: '#6b7280',
                    '&:hover': {
                      borderColor: '#374151',
                      color: '#374151',
                      background: 'rgba(107, 114, 128, 0.05)',
                    }
                  }}
                >
                  Go Back
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ContactSupport />}
                  onClick={() => {
                    const subject = `Access Request - ${feature.replace(/_/g, ' ')}`;
                    const body = `Hello,\n\nI would like to request access to the ${feature.replace(/_/g, ' ')} feature.\n\nCurrent Role: ${userProfile?.role}\nRequired Permission: ${level}\n\nThank you!`;
                    window.open(`mailto:admin@sahdasclinic.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                  }}
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      color: '#059669',
                      background: 'rgba(16, 185, 129, 0.05)',
                    }
                  }}
                >
                  Request Access
                </Button>
              </Box>

              {/* Help Text */}
              <Box 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
                  <Security sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />
                  Security Notice
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', lineHeight: 1.4 }}>
                  This restriction helps protect sensitive clinic data and ensures compliance with 
                  privacy regulations. Contact your administrator to discuss expanding your access permissions.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    );
  }

  // No access and not showing unauthorized (will redirect)
  return null;
};

export default EnhancedRouteGuard; 