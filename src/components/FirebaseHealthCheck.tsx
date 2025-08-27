import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useGlobalData } from '../contexts/GlobalDataContext';
import MedicalRequirementsService from '../services/MedicalRequirementsService';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error' | 'loading';
  message: string;
  details?: string;
}

const FirebaseHealthCheck: React.FC = () => {
  const { userProfile } = useUser();
  const { connectionStatus, onDataUpdate, onConnectionChange, onError } = useGlobalData();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'loading', message: 'Checking Firebase health...' });
  const [localStorageTest, setLocalStorageTest] = useState<any>(null);

  // Test localStorage persistence for medical requirements
  const testLocalStoragePersistence = async () => {
    if (!userProfile?.clinicId) return;
    
    try {
      console.log('🧪 Testing localStorage persistence for medical requirements...');
      
      // Test data
      const testData = {
        id: 'test-' + Date.now(),
        clinicId: userProfile.clinicId,
        patientId: 'test-patient',
        patientName: 'Test Patient',
        requirementType: 'lab' as const,
        title: 'Test Lab Requirement',
        description: 'Test description',
        category: 'test',
        priority: 'normal' as const,
        status: 'pending' as const,
        workflow_stage: 'ordered' as const,
        dateOrdered: new Date().toISOString(),
        orderedBy: 'Test User',
        orderedByRole: 'doctor',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Test localStorage save
      const key = `clinic_medical_requirements_data_${userProfile.clinicId}`;
      localStorage.setItem(key, JSON.stringify({
        data: [testData],
        lastUpdated: new Date().toISOString(),
        clinicId: userProfile.clinicId
      }));
      
      // Test localStorage load
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : null;
      
      setLocalStorageTest({
        saved: testData,
        loaded: parsed,
        success: parsed && parsed.data && parsed.data.length > 0
      });
      
      console.log('✅ localStorage persistence test completed:', parsed);
      
      // Clean up test data
      localStorage.removeItem(key);
      
    } catch (error) {
      console.error('❌ localStorage persistence test failed:', error);
      setLocalStorageTest({ error: error.message });
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check connection status
        if (connectionStatus === 'connected') {
          setHealthStatus({
            status: 'healthy',
            message: 'Firebase connection is healthy',
            details: 'Real-time listeners are working properly'
          });
        } else if (connectionStatus === 'reconnecting') {
          setHealthStatus({
            status: 'warning',
            message: 'Firebase is reconnecting',
            details: 'Attempting to restore connection...'
          });
        } else if (connectionStatus === 'disconnected') {
          setHealthStatus({
            status: 'error',
            message: 'Firebase connection lost',
            details: 'Real-time listeners are not working'
          });
        } else {
          setHealthStatus({
            status: 'loading',
            message: 'Checking Firebase status...'
          });
        }
      } catch (error) {
        setHealthStatus({
          status: 'error',
          message: 'Health check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    checkHealth();
  }, [connectionStatus]);

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'healthy': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'healthy': return 'success.main';
      case 'warning': return 'warning.main';
      case 'error': return 'error.main';
      default: return 'info.main';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ ml: 1, color: getStatusColor() }}>
          Firebase Health Check
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        {healthStatus.message}
      </Typography>
      
      {healthStatus.details && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {healthStatus.details}
        </Typography>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Connection Status: <strong>{connectionStatus}</strong>
        </Typography>
      </Box>
      
      {/* localStorage Persistence Test */}
      <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          localStorage Persistence Test
        </Typography>
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testLocalStoragePersistence}
          sx={{ mb: 2 }}
        >
          Test localStorage
        </Button>
        
        {localStorageTest && (
          <Box sx={{ mt: 1 }}>
            {localStorageTest.success ? (
              <Alert severity="success" sx={{ mb: 1 }}>
                localStorage persistence test passed
              </Alert>
            ) : localStorageTest.error ? (
              <Alert severity="error" sx={{ mb: 1 }}>
                localStorage persistence test failed: {localStorageTest.error}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 1 }}>
                localStorage persistence test completed
              </Alert>
            )}
            
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
              {JSON.stringify(localStorageTest, null, 2)}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Real-time Status */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Real-time Listeners:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['appointments', 'patients', 'payments', 'laboratoryRadiology', 'notifications'].map((collection) => (
            <Box
              key={collection}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: connectionStatus === 'connected' ? 'success.light' : 'error.light',
                color: connectionStatus === 'connected' ? 'success.contrastText' : 'error.contrastText',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {collection}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default FirebaseHealthCheck; 