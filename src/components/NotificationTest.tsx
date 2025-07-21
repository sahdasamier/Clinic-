import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Chip
} from '@mui/material';
import {
  Notifications,
  Analytics,
  CloudUpload,
  Storage,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useBlazePlanFeatures } from '../hooks/useBlazePlanFeatures';

const NotificationTest: React.FC = () => {
  const blazeFeatures = useBlazePlanFeatures();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAnalytics = () => {
    try {
      blazeFeatures.analytics.trackEvent('test_event', {
        test_parameter: 'analytics_test',
        timestamp: new Date().toISOString()
      });
      addTestResult('✅ Analytics event tracked successfully');
    } catch (error) {
      addTestResult(`❌ Analytics test failed: ${error}`);
    }
  };

  const testPageView = () => {
    try {
      blazeFeatures.analytics.trackPageView('Test Page View', {
        test_context: 'blaze_features_test'
      });
      addTestResult('✅ Page view tracked successfully');
    } catch (error) {
      addTestResult(`❌ Page view test failed: ${error}`);
    }
  };

  const testNotificationPermission = async () => {
    try {
      const granted = await blazeFeatures.messaging.requestPermission();
      if (granted) {
        addTestResult('✅ Notification permission granted');
      } else {
        addTestResult('⚠️ Notification permission denied');
      }
    } catch (error) {
      addTestResult(`❌ Notification permission test failed: ${error}`);
    }
  };

  const testBrowserNotification = () => {
    try {
      blazeFeatures.messaging.sendNotification('appointment_reminder', {
        doctor: 'Dr. Smith',
        time: '10:00 AM',
        date: new Date().toLocaleDateString()
      });
      addTestResult('✅ Browser notification sent');
    } catch (error) {
      addTestResult(`❌ Browser notification failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔥 Firebase Blaze Plan Features Test
      </Typography>

      {/* Feature Status Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Feature Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={blazeFeatures.analytics.initialized ? <CheckCircle /> : <Warning />}
              label={`Analytics: ${blazeFeatures.analytics.initialized ? 'Ready' : 'Loading'}`}
              color={blazeFeatures.analytics.initialized ? 'success' : 'warning'}
            />
            <Chip
              icon={blazeFeatures.messaging.initialized ? <CheckCircle /> : <Warning />}
              label={`Messaging: ${blazeFeatures.messaging.initialized ? 'Ready' : 'Loading'}`}
              color={blazeFeatures.messaging.initialized ? 'success' : 'warning'}
            />
            <Chip
              icon={blazeFeatures.storage.initialized ? <CheckCircle /> : <Warning />}
              label={`Storage: ${blazeFeatures.storage.initialized ? 'Ready' : 'Loading'}`}
              color={blazeFeatures.storage.initialized ? 'success' : 'warning'}
            />
            <Chip
              icon={blazeFeatures.functions.initialized ? <CheckCircle /> : <Warning />}
              label={`Functions: ${blazeFeatures.functions.initialized ? 'Ready' : 'Loading'}`}
              color={blazeFeatures.functions.initialized ? 'success' : 'warning'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Analytics Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Analytics sx={{ mr: 1 }} />
            Analytics Tests
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={testAnalytics}
              disabled={!blazeFeatures.analytics.initialized}
            >
              Test Custom Event
            </Button>
            <Button
              variant="contained"
              onClick={testPageView}
              disabled={!blazeFeatures.analytics.initialized}
            >
              Test Page View
            </Button>
          </Box>
          {!blazeFeatures.analytics.initialized && (
            <Alert severity="info">Analytics is initializing...</Alert>
          )}
        </CardContent>
      </Card>

      {/* Messaging Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Notifications sx={{ mr: 1 }} />
            Push Notifications Tests
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={testNotificationPermission}
              disabled={!blazeFeatures.messaging.initialized}
            >
              Request Permission
            </Button>
            <Button
              variant="contained"
              onClick={testBrowserNotification}
              disabled={!blazeFeatures.messaging.initialized}
            >
              Test Notification
            </Button>
          </Box>
          {blazeFeatures.messaging.token && (
            <Alert severity="success">
              FCM Token: {blazeFeatures.messaging.token.substring(0, 20)}...
            </Alert>
          )}
          {!blazeFeatures.messaging.initialized && (
            <Alert severity="info">Messaging is initializing...</Alert>
          )}
        </CardContent>
      </Card>

      {/* Storage Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Storage sx={{ mr: 1 }} />
            Storage Status
          </Typography>
          {blazeFeatures.storage.initialized ? (
            <Alert severity="success">
              Storage service is ready. Use FileUploadComponent for testing file uploads.
            </Alert>
          ) : (
            <Alert severity="info">Storage service is initializing...</Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Test Results</Typography>
            <Button onClick={clearResults} variant="outlined" size="small">
              Clear Results
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {testResults.length === 0 ? (
            <Typography color="text.secondary">No tests run yet</Typography>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {testResults.map((result, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    mb: 0.5,
                    color: result.includes('✅') ? 'success.main' : 
                           result.includes('❌') ? 'error.main' : 'warning.main'
                  }}
                >
                  {result}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationTest; 