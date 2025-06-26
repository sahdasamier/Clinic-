import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  PlayArrow,
  ExpandMore,
  ExpandLess,
  Refresh,
} from '@mui/icons-material';
import { auth, db, firebaseConfig } from '../api/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, limit, query, doc, setDoc } from 'firebase/firestore';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'info';
  message: string;
  details?: string;
}

const FirebaseHealthCheck: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{passed: number; failed: number; warnings: number} | null>(null);
  const [expanded, setExpanded] = useState(false);

  const addResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setResults(prev => [...prev, { name, status, message, details }]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'failed': return <Error sx={{ color: 'error.main' }} />;
      case 'warning': return <Warning sx={{ color: 'warning.main' }} />;
      case 'info': return <Info sx={{ color: 'info.main' }} />;
    }
  };

  const runHealthCheck = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      // Test 1: Firebase App Initialization
      try {
        const app = auth.app;
        addResult(
          'Firebase App',
          'passed',
          `Initialized: ${app.name}`,
          `Project ID: ${app.options.projectId}`
        );
      } catch (error: any) {
        addResult('Firebase App', 'failed', 'Initialization failed', error.message);
      }

      // Test 2: Authentication Service
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          addResult(
            'Authentication',
            'passed',
            `User logged in: ${currentUser.email}`,
            `UID: ${currentUser.uid}`
          );

          // Test admin claims
          try {
            const idTokenResult = await currentUser.getIdTokenResult();
            const isAdmin = idTokenResult.claims.admin === true;
            addResult(
              'Admin Claims',
              isAdmin ? 'passed' : 'info',
              isAdmin ? 'Admin privileges verified' : 'Regular user (no admin claims)',
              `Claims: ${JSON.stringify(idTokenResult.claims, null, 2)}`
            );
          } catch (error: any) {
            addResult('Admin Claims', 'warning', 'Could not verify claims', error.message);
          }
        } else {
          addResult('Authentication', 'info', 'No user currently logged in');
        }
      } catch (error: any) {
        addResult('Authentication', 'failed', 'Auth service unavailable', error.message);
      }

      // Test 3: Firestore Connection
      try {
        const clinicsQuery = query(collection(db, 'clinics'), limit(1));
        const snapshot = await getDocs(clinicsQuery);
        addResult(
          'Firestore',
          'passed',
          `Database connected`,
          `Found ${snapshot.size} clinic document(s)`
        );
      } catch (error: any) {
        addResult('Firestore', 'failed', 'Database connection failed', error.message);
      }

      // Test 4: Security Rules (try unauthorized write)
      try {
        // This should fail for non-admin users
        await setDoc(doc(db, 'users', 'security-test'), {
          test: 'unauthorized-write-attempt',
          timestamp: new Date()
        });
        
        // If we get here, either user is admin or security rules are weak
        if (auth.currentUser) {
          const idTokenResult = await auth.currentUser.getIdTokenResult();
          if (idTokenResult.claims.admin === true) {
            addResult('Security Rules', 'passed', 'Admin write access confirmed');
          } else {
            addResult('Security Rules', 'failed', 'SECURITY BREACH: Regular user can write!');
          }
        }
      } catch (error: any) {
        // This is expected for non-admin users
        if (error.code === 'permission-denied') {
          addResult('Security Rules', 'passed', 'Unauthorized write blocked (good!)');
        } else {
          addResult('Security Rules', 'warning', 'Unexpected security test error', error.message);
        }
      }

      // Test 5: Secondary App Creation
      try {
        const secondaryAppName = `HealthCheck-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);
        
        addResult(
          'Secondary App',
          'passed',
          'Created successfully',
          `App name: ${secondaryApp.name}`
        );

        // Clean up
        await deleteApp(secondaryApp);
        addResult('Secondary App Cleanup', 'passed', 'Cleanup successful');
      } catch (error: any) {
        addResult('Secondary App', 'failed', 'Creation/cleanup failed', error.message);
      }

      // Test 6: Network Performance
      try {
        const startTime = performance.now();
        await getDocs(query(collection(db, 'clinics'), limit(1)));
        const responseTime = performance.now() - startTime;
        
        const status = responseTime < 1000 ? 'passed' : responseTime < 3000 ? 'warning' : 'failed';
        addResult(
          'Performance',
          status,
          `Response time: ${responseTime.toFixed(0)}ms`,
          responseTime < 1000 ? 'Excellent' : responseTime < 3000 ? 'Acceptable' : 'Slow connection'
        );
      } catch (error: any) {
        addResult('Performance', 'failed', 'Performance test failed', error.message);
      }

    } catch (error: any) {
      addResult('Health Check', 'failed', 'Unexpected error during health check', error.message);
    }

    // Calculate summary
    setIsRunning(false);
  };

  React.useEffect(() => {
    if (results.length > 0) {
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const warnings = results.filter(r => r.status === 'warning').length;
      setSummary({ passed, failed, warnings });
    }
  }, [results]);

  const getSeverityFromStatus = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🔥 Firebase Health Check
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
              onClick={runHealthCheck}
              disabled={isRunning}
              sx={{ backgroundColor: '#7C3AED' }}
            >
              {isRunning ? 'Running...' : 'Run Health Check'}
            </Button>
            {results.length > 0 && (
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
        </Box>

        {summary && (
          <Alert 
            severity={summary.failed > 0 ? 'error' : summary.warnings > 0 ? 'warning' : 'success'}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Health Check Results: {summary.passed} passed, {summary.failed} failed, {summary.warnings} warnings
            </Typography>
            <Typography variant="body2">
              {summary.failed === 0 && summary.warnings === 0 
                ? '🎉 All Firebase services are working correctly!' 
                : summary.failed > 0 
                ? '⚠️ Critical issues found. Check details below.'
                : 'ℹ️ Minor issues detected. Review warnings below.'}
            </Typography>
          </Alert>
        )}

        <Collapse in={expanded && results.length > 0}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Detailed Results:
          </Typography>
          <List dense>
            {results.map((result, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getStatusIcon(result.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {result.name}: {result.message}
                    </Typography>
                  }
                  secondary={result.details && (
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      {result.details}
                    </Typography>
                  )}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>

        {!expanded && results.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Click the expand button to see detailed results
          </Typography>
        )}

        {results.length === 0 && !isRunning && (
          <Alert severity="info">
            Click "Run Health Check" to verify all Firebase services are working correctly.
            This will test authentication, database connectivity, security rules, and admin features.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseHealthCheck; 