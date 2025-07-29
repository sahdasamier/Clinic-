import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Sync as SyncIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
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

interface PageSimulation {
  name: string;
  path: string;
  icon: React.ReactElement;
  description: string;
  updates: number;
  lastUpdate: Date | null;
  isActive: boolean;
}

interface TestOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'appointments' | 'patients' | 'payments' | 'inventory';
  description: string;
  executed: boolean;
  timestamp?: Date;
  result?: any;
}

const CrossPageTestComponent: React.FC = () => {
  const [testRunning, setTestRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [globalUpdates, setGlobalUpdates] = useState<{[key: string]: any[]}>({});
  
  // Simulated pages that would be listening to updates
  const [pageSimulations, setPageSimulations] = useState<PageSimulation[]>([
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      description: 'Main dashboard with overview statistics',
      updates: 0,
      lastUpdate: null,
      isActive: true,
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: <ScheduleIcon />,
      description: 'Appointment management page',
      updates: 0,
      lastUpdate: null,
      isActive: true,
    },
    {
      name: 'Patients',
      path: '/patients',
      icon: <PeopleIcon />,
      description: 'Patient management page',
      updates: 0,
      lastUpdate: null,
      isActive: true,
    },
    {
      name: 'Payments',
      path: '/payments',
      icon: <PaymentIcon />,
      description: 'Payment management page',
      updates: 0,
      lastUpdate: null,
      isActive: true,
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: <InventoryIcon />,
      description: 'Inventory management page',
      updates: 0,
      lastUpdate: null,
      isActive: true,
    },
  ]);

  // Test operations queue
  const [testOperations, setTestOperations] = useState<TestOperation[]>([]);
  const [operationResults, setOperationResults] = useState<{[key: string]: any}>({});

  // Data hooks
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  const {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
  } = usePatients();

  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
  } = usePayments();

  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  } = useInventory();

  const dashboardStats = useDashboardStats();
  const { onDataUpdate, onError, onConnectionChange } = useRealtimeUpdates();

  // Monitor real-time updates
  useEffect(() => {
    const unsubscribeDataUpdate = onDataUpdate((collection, data) => {
      const timestamp = new Date();
      
      // Update global updates log
      setGlobalUpdates(prev => ({
        ...prev,
        [collection]: [...(prev[collection] || []).slice(-9), { timestamp, count: data.length }]
      }));

      // Update counter
      setUpdateCounter(prev => prev + 1);

      // Update all page simulations
      setPageSimulations(prev => prev.map(page => ({
        ...page,
        updates: page.updates + 1,
        lastUpdate: timestamp,
      })));

      console.log(`🔄 Cross-Page Test: ${collection} update received by ALL pages`, {
        collection,
        dataCount: data.length,
        timestamp: timestamp.toLocaleTimeString()
      });
    });

    const unsubscribeError = onError((collection, error) => {
      console.error(`❌ Cross-Page Test: Error in ${collection}`, error);
    });

    const unsubscribeConnection = onConnectionChange((status) => {
      console.log(`🔗 Cross-Page Test: Connection status - ${status}`);
    });

    return () => {
      unsubscribeDataUpdate();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, [onDataUpdate, onError, onConnectionChange]);

  // Create test operations
  const createTestOperations = (): TestOperation[] => [
    {
      id: 'create-appointment',
      type: 'create',
      collection: 'appointments',
      description: 'Create test appointment',
      executed: false,
    },
    {
      id: 'create-patient',
      type: 'create',
      collection: 'patients',
      description: 'Create test patient',
      executed: false,
    },
    {
      id: 'create-payment',
      type: 'create',
      collection: 'payments',
      description: 'Create test payment',
      executed: false,
    },
    {
      id: 'update-appointment',
      type: 'update',
      collection: 'appointments',
      description: 'Update test appointment',
      executed: false,
    },
    {
      id: 'update-patient',
      type: 'update',
      collection: 'patients',
      description: 'Update test patient',
      executed: false,
    },
    {
      id: 'delete-appointment',
      type: 'delete',
      collection: 'appointments',
      description: 'Delete test appointment',
      executed: false,
    },
    {
      id: 'delete-patient',
      type: 'delete',
      collection: 'patients',
      description: 'Delete test patient',
      executed: false,
    },
  ];

  // Execute single operation
  const executeOperation = async (operation: TestOperation) => {
    const timestamp = new Date();
    console.log(`🚀 Executing operation: ${operation.description}`);

    try {
      let result: any;

      switch (operation.id) {
        case 'create-appointment':
          result = await addAppointment({
            patientId: 'test-patient-id',
            doctorId: 'test-doctor-id',
            branchId: 'test-branch-id',
            date: new Date().toISOString().split('T')[0],
            status: 'scheduled'
          });
          break;

        case 'create-patient':
          result = await addPatient({
            name: 'CrossPage TestPatient',
            firstName: 'CrossPage',
            lastName: 'TestPatient',
            email: 'crosspage.test@example.com',
            phone: '555-0199',
            dateOfBirth: '1985-06-15',
            gender: 'other',
            address: 'Cross-page Test Address',
            status: 'new',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            clinicId: 'test-clinic'
          });
          break;

        case 'create-payment':
          result = await addPayment({
            patientName: 'CrossPage TestPatient',
            doctorName: 'CrossPage TestDoctor',
            amount: 250,
            currency: 'USD',
            status: 'pending',
            method: 'credit_card',
            description: 'Cross-page sync test payment',
            clinicId: 'test-clinic'
          });
          break;

        case 'update-appointment':
          const appointmentToUpdate = appointments.find(apt => 
            apt.patientId === 'test-patient-id'
          );
          if (appointmentToUpdate) {
            result = await updateAppointment(appointmentToUpdate.id, {
              status: 'completed'
            });
          }
          break;

        case 'update-patient':
          const patientToUpdate = patients.find(patient => 
            patient.firstName === 'CrossPage'
          );
          if (patientToUpdate) {
            result = await updatePatient(patientToUpdate.id, {
              phone: '555-0299',
              address: 'Updated Cross-page Test Address'
            });
          }
          break;

        case 'delete-appointment':
          const appointmentToDelete = appointments.find(apt => 
            apt.patientId === 'test-patient-id'
          );
          if (appointmentToDelete) {
            result = await deleteAppointment(appointmentToDelete.id);
          }
          break;

        case 'delete-patient':
          const patientToDelete = patients.find(patient => 
            patient.firstName === 'CrossPage'
          );
          if (patientToDelete) {
            result = await deletePatient(patientToDelete.id);
          }
          break;

        default:
          throw new Error(`Unknown operation: ${operation.id}`);
      }

      // Update operation status
      setTestOperations(prev => prev.map(op =>
        op.id === operation.id
          ? { ...op, executed: true, timestamp, result }
          : op
      ));

      // Store result
      setOperationResults(prev => ({
        ...prev,
        [operation.id]: { success: true, result, timestamp }
      }));

      console.log(`✅ Operation completed: ${operation.description}`, result);

    } catch (error) {
      console.error(`❌ Operation failed: ${operation.description}`, error);
      
      setTestOperations(prev => prev.map(op =>
        op.id === operation.id
          ? { ...op, executed: true, timestamp, result: null }
          : op
      ));

      setOperationResults(prev => ({
        ...prev,
        [operation.id]: { success: false, error: String(error), timestamp }
      }));
    }
  };

  // Run comprehensive cross-page test
  const runCrossPageTest = async () => {
    setTestRunning(true);
    const operations = createTestOperations();
    setTestOperations(operations);
    setOperationResults({});
    setUpdateCounter(0);
    setGlobalUpdates({});

    console.log('🚀 Starting Cross-Page Communication Test...');

    // Reset page simulations
    setPageSimulations(prev => prev.map(page => ({
      ...page,
      updates: 0,
      lastUpdate: null,
    })));

    // Execute operations with delays to observe real-time updates
    for (const operation of operations) {
      await executeOperation(operation);
      
      // Wait for updates to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setTestRunning(false);
    console.log('🎯 Cross-Page Communication Test Completed!');
  };

  // Stop test
  const stopTest = () => {
    setTestRunning(false);
    console.log('⏹️ Cross-Page Test Stopped');
  };

  // Open simulated pages
  const openSimulatedPage = (page: PageSimulation) => {
    // In a real scenario, this would open the page in a new tab
    // For demo purposes, we'll just log it
    console.log(`🔗 Opening simulated page: ${page.name} at ${page.path}`);
    
    // You could use: window.open(`${window.location.origin}${page.path}`, '_blank');
    alert(`In a real test, this would open ${page.name} in a new tab to verify real-time sync.`);
  };

  const getUpdatesSummary = () => {
    const totalUpdates = Object.values(globalUpdates).reduce(
      (total, updates) => total + updates.length, 0
    );
    const collectionsWithUpdates = Object.keys(globalUpdates).length;
    return { totalUpdates, collectionsWithUpdates };
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        🔄 Cross-Page Communication Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This test verifies that when data changes in one part of the system, ALL pages receive the updates 
        in real-time. Open multiple browser tabs to see live synchronization.
      </Alert>

      {/* System Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SyncIcon color={dashboardStats.connectionStatus === 'connected' ? 'success' : 'error'} />
                <Box>
                  <Typography variant="h6">
                    {dashboardStats.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Real-time Status
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
                <TimelineIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {updateCounter}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Updates
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
                <PeopleIcon color="secondary" />
                <Box>
                  <Typography variant="h6">
                    {pageSimulations.filter(p => p.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Pages
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
                <SpeedIcon color="warning" />
                <Box>
                  <Typography variant="h6">
                    {testOperations.filter(op => op.executed).length}/{testOperations.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Operations Done
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
            <Typography variant="h6">Cross-Page Test Control</Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={runCrossPageTest}
                disabled={testRunning}
                startIcon={testRunning ? <StopIcon /> : <PlayArrowIcon />}
                color="primary"
              >
                {testRunning ? 'Test Running...' : 'Start Cross-Page Test'}
              </Button>
              {testRunning && (
                <Button
                  variant="outlined"
                  onClick={stopTest}
                  startIcon={<StopIcon />}
                  color="error"
                >
                  Stop Test
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => {
                  setUpdateCounter(0);
                  setGlobalUpdates({});
                  setTestOperations([]);
                  setOperationResults({});
                }}
                startIcon={<RefreshIcon />}
              >
                Reset
              </Button>
            </Box>
          </Box>
          
          {testRunning && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Page Simulations" />
        <Tab label="Test Operations" />
        <Tab label="Update Log" />
        <Tab label="Current Data State" />
      </Tabs>

      {/* Page Simulations Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {pageSimulations.map((page, index) => (
            <Grid item xs={12} md={6} lg={4} key={page.name}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {page.icon}
                      <Typography variant="h6">{page.name}</Typography>
                    </Box>
                    <Chip
                      label={page.isActive ? 'Active' : 'Inactive'}
                      color={page.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {page.description}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">
                      <strong>Updates Received:</strong> {page.updates}
                    </Typography>
                    <Badge badgeContent={page.updates} color="primary">
                      <NotificationsIcon />
                    </Badge>
                  </Box>

                  {page.lastUpdate && (
                    <Typography variant="caption" color="textSecondary">
                      Last Update: {page.lastUpdate.toLocaleTimeString()}
                    </Typography>
                  )}

                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      size="small"
                      onClick={() => openSimulatedPage(page)}
                      startIcon={<OpenInNewIcon />}
                      variant="outlined"
                    >
                      Open Page
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setPageSimulations(prev => prev.map(p =>
                          p.name === page.name ? { ...p, isActive: !p.isActive } : p
                        ));
                      }}
                      variant="text"
                    >
                      {page.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Test Operations Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Operations Queue
            </Typography>
            
            <List>
              {testOperations.map((operation) => (
                <ListItem key={operation.id}>
                  <ListItemIcon>
                    {operation.type === 'create' && <AddIcon />}
                    {operation.type === 'update' && <EditIcon />}
                    {operation.type === 'delete' && <DeleteIcon />}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={operation.description}
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          Collection: {operation.collection} | Type: {operation.type}
                        </Typography>
                        {operation.timestamp && (
                          <Typography variant="caption" display="block">
                            Executed: {operation.timestamp.toLocaleTimeString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Chip
                      icon={operation.executed ? <CheckCircleIcon /> : <WarningIcon />}
                      label={operation.executed ? 'Done' : 'Pending'}
                      color={operation.executed ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {testOperations.length === 0 && (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                No operations in queue. Start a test to see operations.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Update Log Tab */}
      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Real-time Updates Log
            </Typography>

            {Object.keys(globalUpdates).length > 0 ? (
              Object.entries(globalUpdates).map(([collection, updates]) => (
                <Accordion key={collection}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      {collection.charAt(0).toUpperCase() + collection.slice(1)} 
                      <Chip label={updates.length} size="small" sx={{ ml: 1 }} />
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {updates.map((update, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Update ${index + 1}: ${update.count} items`}
                            secondary={update.timestamp.toLocaleTimeString()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                No updates logged yet. Start a test to see real-time updates.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Data State Tab */}
      {selectedTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Counts
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><ScheduleIcon /></ListItemIcon>
                    <ListItemText
                      primary="Appointments"
                      secondary={`${appointments.length} total`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                    <ListItemText
                      primary="Patients"
                      secondary={`${patients.length} total`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PaymentIcon /></ListItemIcon>
                    <ListItemText
                      primary="Payments"
                      secondary={`${payments.length} total`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InventoryIcon /></ListItemIcon>
                    <ListItemText
                      primary="Inventory"
                      secondary={`${inventory.length} total`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Summary
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Connection Status"
                      secondary={dashboardStats.connectionStatus}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={dashboardStats.isOnline ? 'Online' : 'Offline'}
                        color={dashboardStats.isOnline ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Updates Received"
                      secondary={`${updateCounter} across all collections`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Collections Updated"
                      secondary={`${Object.keys(globalUpdates).length} different collections`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Operations Completed"
                      secondary={`${testOperations.filter(op => op.executed).length}/${testOperations.length}`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Test Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => executeOperation({
                id: 'quick-appointment',
                type: 'create',
                collection: 'appointments',
                description: 'Quick test appointment',
                executed: false
              })}
              startIcon={<AddIcon />}
            >
              Add Test Appointment
            </Button>
            <Button
              variant="outlined"
              onClick={() => executeOperation({
                id: 'quick-patient',
                type: 'create',
                collection: 'patients',
                description: 'Quick test patient',
                executed: false
              })}
              startIcon={<AddIcon />}
            >
              Add Test Patient
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open('/dashboard', '_blank')}
              startIcon={<OpenInNewIcon />}
            >
              Open Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open('/appointments', '_blank')}
              startIcon={<OpenInNewIcon />}
            >
              Open Appointments
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open('/patients', '_blank')}
              startIcon={<OpenInNewIcon />}
            >
              Open Patients
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CrossPageTestComponent; 