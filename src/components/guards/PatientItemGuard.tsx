import React from 'react';
import { Box, Typography, Paper, Button, Card, CardContent } from '@mui/material';
import { Lock, VisibilityOff, ContactSupport } from '@mui/icons-material';
import { useUser } from '@store/auth';

interface PatientItemGuardProps {
  children: React.ReactNode;
  patient: {
    id: string;
    doctorId?: string;
    name?: string;
  };
  showBlurOverlay?: boolean;
}

const PatientItemGuard: React.FC<PatientItemGuardProps> = ({
  children,
  patient,
  showBlurOverlay = true
}) => {
  const { userProfile } = useUser();

  // Allow access for non-doctors or admins
  if (!userProfile || userProfile.role !== 'doctor') {
    return <>{children}</>;
  }

  // Check if the current doctor is assigned to this patient
  const isPatientAssignedToCurrentDoctor = patient.doctorId === userProfile.id;

  // If patient is assigned to current doctor, show normally
  if (isPatientAssignedToCurrentDoctor) {
    return <>{children}</>;
  }

  // If patient is not assigned to current doctor, show blurred content
  if (!showBlurOverlay) {
    // Return null or empty content if no blur overlay should be shown
    return null;
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '60px' }}>
      {/* Blurred background content */}
      <Box 
        sx={{ 
          filter: 'blur(4px)', 
          opacity: 0.3,
          pointerEvents: 'none',
          userSelect: 'none',
          overflow: 'hidden'
        }}
      >
        {children}
      </Box>
      
      {/* Overlay with restriction message */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Paper 
          sx={{ 
            p: 2, 
            mx: 2,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            maxWidth: '300px'
          }}
        >
          <VisibilityOff sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Patient not assigned to you
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default PatientItemGuard; 