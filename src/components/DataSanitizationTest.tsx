import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import MedicalRequirementsService from '../services/MedicalRequirementsService';
import { useUser } from '../contexts/UserContext';

const DataSanitizationTest: React.FC = () => {
  const { userProfile } = useUser();
  const [testResult, setTestResult] = useState<any>(null);
  const [testData, setTestData] = useState({
    patientId: 'test-patient-123',
    patientName: 'Test Patient',
    patientAge: undefined as number | undefined,
    patientGender: '',
    patientPhone: '',
    patientEmail: '',
    requirementType: 'lab',
    title: 'Test Lab Requirement',
    description: 'Test description for lab requirement',
    priority: 'normal',
    orderedBy: 'Test Doctor',
    dueDate: '',
    estimatedTime: '',
    preparations: [] as string[]
  });

  const testDataSanitization = async () => {
    if (!userProfile?.clinicId) {
      setTestResult({ error: 'No clinic ID available' });
      return;
    }

    try {
      console.log('🧪 Testing data sanitization...');
      console.log('📋 Original test data:', testData);

      // Test the validation
      const validation = MedicalRequirementsService.validateOrderData(testData);
      console.log('✅ Validation result:', validation);

      if (!validation.isValid) {
        setTestResult({ 
          error: 'Validation failed', 
          validationErrors: validation.errors,
          originalData: testData 
        });
        return;
      }

      // Test creating an order (this will trigger sanitization)
      const orderId = await MedicalRequirementsService.createOrder(
        userProfile.clinicId,
        testData
      );

      setTestResult({
        success: true,
        orderId,
        message: 'Order created successfully with sanitized data',
        originalData: testData
      });

      console.log('✅ Data sanitization test completed successfully');

    } catch (error) {
      console.error('❌ Data sanitization test failed:', error);
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        originalData: testData
      });
    }
  };

  const resetTest = () => {
    setTestResult(null);
    setTestData({
      patientId: 'test-patient-123',
      patientName: 'Test Patient',
      patientAge: undefined,
      patientGender: '',
      patientPhone: '',
      patientEmail: '',
      requirementType: 'lab',
      title: 'Test Lab Requirement',
      description: 'Test description for lab requirement',
      priority: 'normal',
      orderedBy: 'Test Doctor',
      dueDate: '',
      estimatedTime: '',
      preparations: []
    });
  };

  const updateTestData = (field: string, value: any) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧪 Data Sanitization Test
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        This component tests the data sanitization functionality to ensure undefined values are properly handled before sending to Firebase.
      </Typography>

      {/* Test Data Form */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Test Data Configuration:
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Patient ID"
            value={testData.patientId}
            onChange={(e) => updateTestData('patientId', e.target.value)}
            size="small"
          />
          
          <TextField
            label="Patient Name"
            value={testData.patientName}
            onChange={(e) => updateTestData('patientName', e.target.value)}
            size="small"
          />
          
          <TextField
            label="Patient Age"
            type="number"
            value={testData.patientAge || ''}
            onChange={(e) => updateTestData('patientAge', e.target.value ? Number(e.target.value) : undefined)}
            size="small"
            placeholder="Leave empty to test undefined"
          />
          
          <TextField
            label="Patient Gender"
            value={testData.patientGender}
            onChange={(e) => updateTestData('patientGender', e.target.value)}
            size="small"
            placeholder="Leave empty to test undefined"
          />
          
          <TextField
            label="Patient Phone"
            value={testData.patientPhone}
            onChange={(e) => updateTestData('patientPhone', e.target.value)}
            size="small"
            placeholder="Leave empty to test undefined"
          />
          
          <TextField
            label="Patient Email"
            value={testData.patientEmail}
            onChange={(e) => updateTestData('patientEmail', e.target.value)}
            size="small"
            placeholder="Leave empty to test undefined"
          />
          
          <TextField
            label="Title"
            value={testData.title}
            onChange={(e) => updateTestData('title', e.target.value)}
            size="small"
          />
          
          <TextField
            label="Description"
            value={testData.description}
            onChange={(e) => updateTestData('description', e.target.value)}
            size="small"
          />
          
          <FormControl size="small">
            <InputLabel>Requirement Type</InputLabel>
            <Select
              value={testData.requirementType}
              onChange={(e) => updateTestData('requirementType', e.target.value)}
              label="Requirement Type"
            >
              <MenuItem value="lab">Laboratory</MenuItem>
              <MenuItem value="imaging">Imaging</MenuItem>
              <MenuItem value="consultation">Consultation</MenuItem>
              <MenuItem value="procedure">Procedure</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={testData.priority}
              onChange={(e) => updateTestData('priority', e.target.value)}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Test Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testDataSanitization}
          disabled={!userProfile?.clinicId}
        >
          Test Data Sanitization
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={resetTest}
        >
          Reset Test
        </Button>
      </Box>

      {/* Test Results */}
      {testResult && (
        <Box sx={{ mt: 2 }}>
          {testResult.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {testResult.message}
            </Alert>
          ) : testResult.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {testResult.error}
            </Alert>
          ) : null}
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Test Results:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'grey.50', 
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}>
            <pre>{JSON.stringify(testResult, null, 2)}</pre>
          </Box>
        </Box>
      )}

      {/* Instructions */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          How to Test:
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          1. Configure test data with some undefined/empty values<br/>
          2. Click "Test Data Sanitization"<br/>
          3. Check console for sanitization logs<br/>
          4. Verify that undefined values are removed before Firebase submission
        </Typography>
      </Box>
    </Paper>
  );
};

export default DataSanitizationTest; 