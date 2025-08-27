import React, { useState } from 'react';
import { Button, Box, Typography, TextField, Alert, Paper } from '@mui/material';
import RequirementCountManager from '../utils/requirementCountManager';
import PatientService from '../services/PatientService';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
}

const RequirementCountTester: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (success: boolean, message: string) => {
    const result: TestResult = {
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testIncrementCount = async () => {
    if (!patientId.trim()) {
      addTestResult(false, 'Please enter a patient ID');
      return;
    }

    setLoading(true);
    try {
      await RequirementCountManager.handleRequirementAdded(patientId);
      addTestResult(true, `✅ Incremented requirement count for patient: ${patientId}`);
    } catch (error) {
      addTestResult(false, `❌ Failed to increment count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDecrementCount = async () => {
    if (!patientId.trim()) {
      addTestResult(false, 'Please enter a patient ID');
      return;
    }

    setLoading(true);
    try {
      await PatientService.updateRequirementCounts(patientId, false);
      addTestResult(true, `✅ Decremented requirement count for patient: ${patientId}`);
    } catch (error) {
      addTestResult(false, `❌ Failed to decrement count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testStatusChange = async () => {
    if (!patientId.trim()) {
      addTestResult(false, 'Please enter a patient ID');
      return;
    }

    setLoading(true);
    try {
      // Test status change from pending to completed
      await RequirementCountManager.handleRequirementStatusChange(patientId, 'pending', 'completed');
      addTestResult(true, `✅ Tested status change from pending to completed for patient: ${patientId}`);
    } catch (error) {
      addTestResult(false, `❌ Failed to test status change: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSetSpecificCount = async () => {
    if (!patientId.trim()) {
      addTestResult(false, 'Please enter a patient ID');
      return;
    }

    setLoading(true);
    try {
      const count = Math.floor(Math.random() * 10) + 1; // Random count 1-10
      await PatientService.setRequirementCount(patientId, count);
      addTestResult(true, `✅ Set requirement count to ${count} for patient: ${patientId}`);
    } catch (error) {
      addTestResult(false, `❌ Failed to set count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRecalculateCounts = async () => {
    if (!patientId.trim()) {
      addTestResult(false, 'Please enter a patient ID');
      return;
    }

    setLoading(true);
    try {
      await RequirementCountManager.recalculatePatientRequirementCounts(patientId);
      addTestResult(true, `✅ Recalculated requirement counts for patient: ${patientId}`);
    } catch (error) {
      addTestResult(false, `❌ Failed to recalculate counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Medical Requirement Count Tester
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test the medical requirement counting system functionality. Enter a patient ID and test various operations.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter patient ID to test"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={testIncrementCount}
            disabled={loading || !patientId.trim()}
            color="success"
          >
            Test Increment
          </Button>
          
          <Button
            variant="contained"
            onClick={testDecrementCount}
            disabled={loading || !patientId.trim()}
            color="warning"
          >
            Test Decrement
          </Button>
          
          <Button
            variant="contained"
            onClick={testStatusChange}
            disabled={loading || !patientId.trim()}
            color="info"
          >
            Test Status Change
          </Button>
          
          <Button
            variant="contained"
            onClick={testSetSpecificCount}
            disabled={loading || !patientId.trim()}
            color="secondary"
          >
            Test Set Count
          </Button>
          
          <Button
            variant="contained"
            onClick={testRecalculateCounts}
            disabled={loading || !patientId.trim()}
            color="primary"
          >
            Test Recalculate
          </Button>
        </Box>
      </Box>

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Processing... Please wait.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Test Results</Typography>
        <Button onClick={clearResults} size="small" variant="outlined">
          Clear Results
        </Button>
      </Box>

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {testResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No test results yet. Run a test to see results here.
          </Typography>
        ) : (
          testResults.map((result, index) => (
            <Alert
              key={index}
              severity={result.success ? 'success' : 'error'}
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">
                {result.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {result.timestamp}
              </Typography>
            </Alert>
          ))
        )}
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          How it works:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li><strong>Increment:</strong> Adds 1 to pendingRequirementsCount and sets hasPendingRequirements to true</li>
            <li><strong>Decrement:</strong> Subtracts 1 from pendingRequirementsCount and updates hasPendingRequirements if count reaches 0</li>
            <li><strong>Status Change:</strong> Tests the logic for handling requirement status transitions</li>
            <li><strong>Set Count:</strong> Sets a specific count value (useful for data migration)</li>
            <li><strong>Recalculate:</strong> Recalculates counts from the patient's medicalRequirements array</li>
          </ul>
        </Typography>
      </Box>
    </Paper>
  );
};

export default RequirementCountTester; 