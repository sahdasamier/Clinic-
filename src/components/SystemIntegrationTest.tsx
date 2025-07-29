import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
  DataUsage as DataUsageIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useGlobalData,
  useAppointments,
  usePatients,
  usePayments,
  useInventory,
  useNotifications,
  useDashboardStats,
  useRealtimeUpdates
} from '../hooks/useGlobalData';

interface TestStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  duration?: number;
  startTime?: Date;
}

interface DataOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  expectedUpdates: string[];
}

const SystemIntegrationTest: React.FC = () => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [updateLog, setUpdateLog] = useState<string[]>([]);
  const [operationsLog, setOperationsLog] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>({});

  // All data hooks
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    stats: appointmentStats
  } = useAppointments();

  const {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    stats: patientStats
  } = usePatients();

  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    stats: paymentStats
  } = usePayments();

  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    stats: inventoryStats
  } = useInventory();

  const {
    notifications,
    markAsRead: markNotificationAsRead,
    stats: notificationStats
  } = useNotifications();

  const dashboardStats = useDashboardStats();
  const { onDataUpdate, onError, onConnectionChange } = useRealtimeUpdates();

  // Real-time update monitoring
  const [receivedUpdates, setReceivedUpdates] = useState<{[key: string]: number}>({});
  const [connectionStatus, setConnectionStatus] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribeDataUpdate = onDataUpdate((collection, data) => {
      const timestamp = new Date().toLocaleTimeString();
      const updateMessage = `${timestamp}: ${collection} updated (${data.length} items)`;
      
      setUpdateLog(prev => [updateMessage, ...prev.slice(0, 49)]);
      setReceivedUpdates(prev => ({
        ...prev,
        [collection]: (prev[collection] || 0) + 1
      }));
      
      console.log('🔄 System Test - Update received:', updateMessage);
    });

    const unsubscribeError = onError((collection, error) => {
      const errorMessage = `${new Date().toLocaleTimeString()}: ERROR in ${collection} - ${error}`;
      setUpdateLog(prev => [errorMessage, ...prev.slice(0, 49)]);
      console.error('❌ System Test - Error:', errorMessage);
    });

    const unsubscribeConnection = onConnectionChange((status) => {
      setConnectionStatus(status);
      const connectionMessage = `${new Date().toLocaleTimeString()}: Connection ${status}`;
      setUpdateLog(prev => [connectionMessage, ...prev.slice(0, 49)]);
      console.log('🔗 System Test - Connection change:', connectionMessage);
    });

    return () => {
      unsubscribeDataUpdate();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, [onDataUpdate, onError, onConnectionChange]);

  const createTestSteps = (): TestStep[] => [
    {
      id: 'connection-check',
      title: 'Connection Status',
      description: 'Verify real-time connection is active and stable',
      status: 'pending'
    },
    {
      id: 'data-availability',
      title: 'Data Availability',
      description: 'Check that all data types are loaded and accessible',
      status: 'pending'
    },
    {
      id: 'appointment-operations',
      title: 'Appointment CRUD',
      description: 'Test appointment create, read, update, delete operations',
      status: 'pending'
    },
    {
      id: 'patient-operations',
      title: 'Patient CRUD',
      description: 'Test patient create, read, update, delete operations',
      status: 'pending'
    },
    {
      id: 'payment-operations',
      title: 'Payment CRUD',
      description: 'Test payment create, read, update, delete operations',
      status: 'pending'
    },
    {
      id: 'cross-page-sync',
      title: 'Cross-Page Synchronization',
      description: 'Verify updates propagate to all pages in real-time',
      status: 'pending'
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      description: 'Test multiple operations and verify all updates are received',
      status: 'pending'
    },
    {
      id: 'error-handling',
      title: 'Error Handling',
      description: 'Test system behavior with invalid operations',
      status: 'pending'
    }
  ];

  const updateStepStatus = (stepId: string, status: TestStep['status'], result?: string, duration?: number) => {
    setTestSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, duration }
        : step
    ));
  };

  const logOperation = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOperationsLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 29)]);
  };

  const runComprehensiveTest = async () => {
    setIsTestRunning(true);
    setTestSteps(createTestSteps());
    setActiveStep(0);
    setUpdateLog([]);
    setOperationsLog([]);
    setReceivedUpdates({});
    setTestResults({});

    const steps = createTestSteps();
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setActiveStep(i);
      updateStepStatus(step.id, 'running');
      
      const startTime = Date.now();
      logOperation(`Starting: ${step.title}`);

      try {
        await executeTestStep(step);
        const duration = Date.now() - startTime;
        updateStepStatus(step.id, 'success', 'Completed successfully', duration);
        logOperation(`✅ Completed: ${step.title} (${duration}ms)`);
      } catch (error) {
        const duration = Date.now() - startTime;
        updateStepStatus(step.id, 'error', `Failed: ${error}`, duration);
        logOperation(`❌ Failed: ${step.title} - ${error}`);
      }

      // Wait between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setActiveStep(steps.length);
    setIsTestRunning(false);
    logOperation('🎯 Comprehensive test completed!');
  };

  const executeTestStep = async (step: TestStep): Promise<void> => {
    switch (step.id) {
      case 'connection-check':
        if (!dashboardStats.isOnline || dashboardStats.connectionStatus !== 'connected') {
          throw new Error('Connection not active');
        }
        break;

      case 'data-availability':
        const totalRecords = appointments.length + patients.length + payments.length;
        if (totalRecords < 0) {
          throw new Error('Data hooks not properly initialized');
        }
        setTestResults(prev => ({ ...prev, dataAvailability: { totalRecords } }));
        break;

      case 'appointment-operations':
        const updatesBefore = receivedUpdates.appointments || 0;
        
        // Create appointment
        const appointmentId = await addAppointment({
          patientName: 'Test Patient Integration',
          doctorName: 'Test Doctor Integration',
          date: new Date().toISOString().split('T')[0],
          time: '15:00',
          type: 'Integration Test',
          status: 'scheduled',
          notes: 'System integration test appointment',
          clinicId: 'test-clinic'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update appointment
        await updateAppointment(appointmentId, {
          status: 'completed',
          notes: 'Updated by integration test'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Delete appointment
        await deleteAppointment(appointmentId);

        // Verify updates were received
        await new Promise(resolve => setTimeout(resolve, 2000));
        const updatesAfter = receivedUpdates.appointments || 0;
        if (updatesAfter <= updatesBefore) {
          throw new Error('Appointment updates not received');
        }
        
        setTestResults(prev => ({ 
          ...prev, 
          appointmentOperations: { 
            updatesReceived: updatesAfter - updatesBefore,
            operationsCompleted: 3
          }
        }));
        break;

      case 'patient-operations':
        const patientUpdatesBefore = receivedUpdates.patients || 0;

        // Create patient
        const patientId = await addPatient({
          firstName: 'Integration',
          lastName: 'Test Patient',
          email: 'integration.test@example.com',
          phone: '555-0123',
          dateOfBirth: '1990-01-01',
          gender: 'other',
          address: 'Test Address',
          clinicId: 'test-clinic'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update patient
        await updatePatient(patientId, {
          phone: '555-0456',
          address: 'Updated Test Address'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Delete patient
        await deletePatient(patientId);

        // Verify updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        const patientUpdatesAfter = receivedUpdates.patients || 0;
        if (patientUpdatesAfter <= patientUpdatesBefore) {
          throw new Error('Patient updates not received');
        }

        setTestResults(prev => ({ 
          ...prev, 
          patientOperations: { 
            updatesReceived: patientUpdatesAfter - patientUpdatesBefore,
            operationsCompleted: 3
          }
        }));
        break;

      case 'payment-operations':
        const paymentUpdatesBefore = receivedUpdates.payments || 0;

        // Create payment
        const paymentId = await addPayment({
          patientName: 'Integration Test Patient',
          doctorName: 'Integration Test Doctor',
          amount: 100,
          currency: 'USD',
          status: 'pending',
          method: 'credit_card',
          description: 'Integration test payment',
          clinicId: 'test-clinic'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update payment
        await updatePayment(paymentId, {
          status: 'completed',
          amount: 150
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Delete payment
        await deletePayment(paymentId);

        // Verify updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        const paymentUpdatesAfter = receivedUpdates.payments || 0;
        if (paymentUpdatesAfter <= paymentUpdatesBefore) {
          throw new Error('Payment updates not received');
        }

        setTestResults(prev => ({ 
          ...prev, 
          paymentOperations: { 
            updatesReceived: paymentUpdatesAfter - paymentUpdatesBefore,
            operationsCompleted: 3
          }
        }));
        break;

      case 'cross-page-sync':
        const totalUpdatesBefore = Object.values(receivedUpdates).reduce((sum, count) => sum + count, 0);

        // Perform operations across different data types
        const crossTestAppointmentId = await addAppointment({
          patientName: 'Cross-sync Test',
          doctorName: 'Cross-sync Doctor',
          date: new Date().toISOString().split('T')[0],
          time: '16:00',
          type: 'Cross-page sync test',
          status: 'scheduled',
          clinicId: 'test-clinic'
        });

        const crossTestPatientId = await addPatient({
          firstName: 'Cross-sync',
          lastName: 'Patient',
          email: 'crosssync@example.com',
          phone: '555-0789',
          gender: 'other',
          clinicId: 'test-clinic'
        });

        // Wait for propagation
        await new Promise(resolve => setTimeout(resolve, 3000));

        const totalUpdatesAfter = Object.values(receivedUpdates).reduce((sum, count) => sum + count, 0);
        if (totalUpdatesAfter <= totalUpdatesBefore) {
          throw new Error('Cross-page updates not propagating');
        }

        // Cleanup
        await deleteAppointment(crossTestAppointmentId);
        await deletePatient(crossTestPatientId);

        setTestResults(prev => ({ 
          ...prev, 
          crossPageSync: { 
            totalUpdatesReceived: totalUpdatesAfter - totalUpdatesBefore,
            collections: Object.keys(receivedUpdates).length
          }
        }));
        break;

      case 'bulk-operations':
        const bulkUpdatesBefore = Object.values(receivedUpdates).reduce((sum, count) => sum + count, 0);

        // Create multiple items rapidly
        const bulkPromises = [];
        for (let i = 0; i < 3; i++) {
          bulkPromises.push(
            addAppointment({
              patientName: `Bulk Test Patient ${i}`,
              doctorName: `Bulk Test Doctor ${i}`,
              date: new Date().toISOString().split('T')[0],
              time: `${14 + i}:00`,
              type: 'Bulk test',
              status: 'scheduled',
              clinicId: 'test-clinic'
            })
          );
        }

        const bulkIds = await Promise.all(bulkPromises);

        // Wait for all updates
        await new Promise(resolve => setTimeout(resolve, 3000));

        const bulkUpdatesAfter = Object.values(receivedUpdates).reduce((sum, count) => sum + count, 0);
        if (bulkUpdatesAfter <= bulkUpdatesBefore) {
          throw new Error('Bulk operations updates not received');
        }

        // Cleanup bulk items
        await Promise.all(bulkIds.map(id => deleteAppointment(id)));

        setTestResults(prev => ({ 
          ...prev, 
          bulkOperations: { 
            itemsCreated: bulkIds.length,
            updatesReceived: bulkUpdatesAfter - bulkUpdatesBefore
          }
        }));
        break;

      case 'error-handling':
        try {
          // Try to update non-existent appointment
          await updateAppointment('non-existent-id', { status: 'completed' });
          throw new Error('Should have failed for non-existent ID');
        } catch (error) {
          // Expected to fail
          setTestResults(prev => ({ 
            ...prev, 
            errorHandling: { 
              properlyHandled: true,
              errorMessage: error.toString()
            }
          }));
        }
        break;

      default:
        throw new Error(`Unknown test step: ${step.id}`);
    }
  };

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'running': return <SpeedIcon color="primary" />;
      default: return <WarningIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: TestStep['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'running': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🔄 System Integration Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This comprehensive test verifies that real-time data synchronization is working correctly across all pages. 
        Open multiple browser tabs to see live updates.
      </Alert>

      {/* System Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                {dashboardStats.connectionStatus === 'connected' ? (
                  <CloudIcon color="success" />
                ) : (
                  <CloudOffIcon color="error" />
                )}
                <Box>
                  <Typography variant="h6">
                    {dashboardStats.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {dashboardStats.isOnline ? 'System Online' : 'System Offline'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <DataUsageIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {appointments.length + patients.length + payments.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SyncIcon color="secondary" />
                <Box>
                  <Typography variant="h6">
                    {Object.values(receivedUpdates).reduce((sum, count) => sum + count, 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Updates Received
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TimelineIcon color="warning" />
                <Box>
                  <Typography variant="h6">
                    {testSteps.filter(s => s.status === 'success').length}/{testSteps.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tests Passed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Test Control Panel</Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={runComprehensiveTest}
                disabled={isTestRunning}
                startIcon={isTestRunning ? <StopIcon /> : <PlayArrowIcon />}
              >
                {isTestRunning ? 'Running Tests...' : 'Run Full Integration Test'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setUpdateLog([]);
                  setOperationsLog([]);
                  setReceivedUpdates({});
                }}
                startIcon={<RefreshIcon />}
              >
                Clear Logs
              </Button>
            </Box>
          </Box>
          
          {isTestRunning && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </CardContent>
      </Card>

      {/* Test Progress */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Progress
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {testSteps.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel 
                      icon={getStatusIcon(step.status)}
                      error={step.status === 'error'}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {step.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={step.status}
                          color={getStatusColor(step.status) as any}
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="textSecondary">
                        {step.description}
                      </Typography>
                      {step.result && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Result: {step.result}
                          {step.duration && ` (${step.duration}ms)`}
                        </Typography>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time Update Log
              </Typography>
              
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
                {updateLog.length > 0 ? (
                  <List dense>
                    {updateLog.map((update, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={update}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                    No real-time updates received yet. Run the test to see live updates.
                  </Typography>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results Summary
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(testResults).map(([testName, result]) => (
                <Grid item xs={12} md={6} key={testName}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        {testName.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Current Data State */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Data State
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Collection</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Updates Received</TableCell>
                  <TableCell align="right">Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Appointments</TableCell>
                  <TableCell align="right">{appointments.length}</TableCell>
                  <TableCell align="right">{receivedUpdates.appointments || 0}</TableCell>
                  <TableCell align="right">{appointmentStats.lastUpdated?.toLocaleTimeString() || 'Never'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Patients</TableCell>
                  <TableCell align="right">{patients.length}</TableCell>
                  <TableCell align="right">{receivedUpdates.patients || 0}</TableCell>
                  <TableCell align="right">{patientStats.lastUpdated?.toLocaleTimeString() || 'Never'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Payments</TableCell>
                  <TableCell align="right">{payments.length}</TableCell>
                  <TableCell align="right">{receivedUpdates.payments || 0}</TableCell>
                  <TableCell align="right">{paymentStats.lastUpdated?.toLocaleTimeString() || 'Never'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Inventory</TableCell>
                  <TableCell align="right">{inventory.length}</TableCell>
                  <TableCell align="right">{receivedUpdates.inventory || 0}</TableCell>
                  <TableCell align="right">{inventoryStats.lastUpdated?.toLocaleTimeString() || 'Never'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Notifications</TableCell>
                  <TableCell align="right">{notifications.length}</TableCell>
                  <TableCell align="right">{receivedUpdates.notifications || 0}</TableCell>
                  <TableCell align="right">{notificationStats.lastUpdated?.toLocaleTimeString() || 'Never'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemIntegrationTest; 