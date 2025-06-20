import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../api/firebase';
import { useUser } from '../contexts/UserContext';
import { hasActiveClinicAccess } from '../utils/clinicUtils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
} from '@mui/material';
import {
  Block,
  ExitToApp,
} from '@mui/icons-material';

interface ClinicAccessGuardProps {
  children: React.ReactNode;
}

const ClinicAccessGuard: React.FC<ClinicAccessGuardProps> = ({ children }) => {
  const { userProfile, isAdmin, loading } = useUser();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setChecking(true);
      
      try {
        console.log('🔍 ClinicAccessGuard Debug:');
        console.log('  isAdmin:', isAdmin);
        console.log('  userProfile:', userProfile);
        console.log('  loading:', loading);
        
        // Super admins ALWAYS have access - no further checks needed
        if (isAdmin) {
          console.log('  ✅ Admin access granted - bypassing all clinic checks');
          setHasAccess(true);
          setChecking(false);
          return;
        }

        // For non-admin users, check clinic access
        if (userProfile && userProfile.email) {
          const access = await hasActiveClinicAccess(userProfile.email, userProfile.clinicId);
          setHasAccess(access);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking clinic access:', error);
        // If checking fails but user is admin, still allow access
        if (isAdmin) {
          console.log('  ✅ Admin access granted despite error');
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkAccess();
    }
  }, [userProfile, isAdmin, loading]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Still loading user data
  if (loading || checking) {
    return <>{children}</>;
  }

  // Super admin always has access
  if (isAdmin) {
    return <>{children}</>;
  }

  // No access - clinic is disabled
  if (hasAccess === false) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CardContent>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'error.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Block sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" gutterBottom color="error">
                Access Suspended
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Your clinic's access has been temporarily suspended. 
                Please contact your administrator for more information.
              </Typography>

              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Possible reasons:</strong>
                  <br />• Subscription payment pending
                  <br />• Account under review
                  <br />• Administrative suspension
                </Typography>
              </Alert>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSignOut}
                startIcon={<ExitToApp />}
                size="large"
              >
                Sign Out
              </Button>
              
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Contact support: admin@sahdasclinic.com
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Has access - render children
  return <>{children}</>;
};

export default ClinicAccessGuard; 