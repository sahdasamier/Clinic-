import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  People,
  CalendarToday,
  CheckCircle,
  LocalHospital,
  Analytics,
  MedicalServices,
  Timeline,
  Assignment,
  Groups,
  ShowChart,
  Refresh,
  AccessTime,
  Warning,
  ErrorOutline,
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
} from 'recharts';

// Import the new Revenue & Profit Trend Widget
import RevenueProfitTrendWidget from './widgets/RevenueProfitTrendWidget';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

// ✅ NEW: Use the new real-time data hooks with error boundaries
import { 
  useGlobalData, 
  useAppointments, 
  usePatients, 
  usePayments, 
  useDashboardStats,
  useRealtimeUpdates 
} from '../../hooks/useGlobalData';

// Professional Color Palette
const colorPalette = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  background: '#f5f5f5'
};

// Error boundary component for Firebase errors
const FirebaseErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, fallback, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    console.error('🚨 Firebase Error Boundary:', error);
    setHasError(true);
    setError(error);
    if (onError) onError(error);
  };

  const handleRetry = () => {
    setHasError(false);
    setError(null);
  };

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('FIRESTORE') || 
          event.reason?.message?.includes('Firebase') ||
          event.reason?.message?.includes('INTERNAL ASSERTION FAILED')) {
        event.preventDefault();
        handleError(new Error(`Firebase Error: ${event.reason.message}`));
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('FIRESTORE') || 
          event.message?.includes('Firebase') ||
          event.message?.includes('INTERNAL ASSERTION FAILED')) {
        handleError(new Error(`Firebase Error: ${event.message}`));
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return fallback || (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRetry}>
            Retry
          </Button>
        }
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" component="div">
            <ErrorOutline sx={{ mr: 1, verticalAlign: 'middle' }} />
            Firebase Connection Issue
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            There was an issue connecting to the database. Using cached data where available.
          </Typography>
          {error && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', fontFamily: 'monospace' }}>
              {error.message}
            </Typography>
          )}
        </Box>
      </Alert>
    );
  }

  return <>{children}</>;
};

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, initialized } = useAuth();
  const { userProfile } = useUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // ✅ Enhanced error handling for Firebase hooks
  const {
    appointments = [],
    loading: appointmentsLoading = false,
    error: appointmentsError,
    stats: appointmentStats = {}
  } = useAppointments() || {};

  const {
    patients = [],
    loading: patientsLoading = false,
    error: patientsError,
    stats: patientStats = {}
  } = usePatients() || {};

  const {
    payments = [],
    loading: paymentsLoading = false,
    error: paymentsError,
    stats: paymentStats = {}
  } = usePayments() || {};

  const dashboardStats = useDashboardStats() || { 
    connectionStatus: 'disconnected', 
    isOnline: navigator.onLine 
  };

  const { onDataUpdate, onConnectionChange, forceRestartManager } = useRealtimeUpdates() || {
    onDataUpdate: () => () => {},
    onConnectionChange: () => () => {},
    forceRestartManager: async () => {}
  };

  // ✅ Enhanced real-time update notifications with error handling
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [connectionRetries, setConnectionRetries] = useState(0);

  // ✅ Firebase error handler
  const handleFirebaseError = (error: Error) => {
    console.error('🚨 Dashboard Firebase Error:', error);
    setFirebaseError(error.message);
    
    // Auto-retry logic
    if (connectionRetries < 3) {
      setTimeout(() => {
        setConnectionRetries(prev => prev + 1);
        setFirebaseError(null);
        console.log(`🔄 Auto-retry ${connectionRetries + 1}/3 for Firebase connection`);
      }, 5000 * (connectionRetries + 1)); // Exponential backoff
    }
  };

  // ✅ Enhanced real-time listeners with error boundaries
  useEffect(() => {
    if (!onDataUpdate || !onConnectionChange) return;

    try {
      const unsubscribeDataUpdate = onDataUpdate((collection, data) => {
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
        setFirebaseError(null); // Clear errors on successful update
        setConnectionRetries(0); // Reset retry counter
        console.log(`📊 Dashboard: Real-time update - ${collection} (${data.length} items)`);
      });

      const unsubscribeConnection = onConnectionChange((status) => {
        console.log(`🔄 Dashboard: Connection status - ${status}`);
        if (status === 'connected') {
          setFirebaseError(null);
          setConnectionRetries(0);
        }
      });

      return () => {
        unsubscribeDataUpdate();
        unsubscribeConnection();
      };
    } catch (error) {
      console.error('❌ Error setting up dashboard listeners:', error);
      handleFirebaseError(error as Error);
    }
  }, [onDataUpdate, onConnectionChange, connectionRetries]);

  // Safe loading state
  const isLoading = authLoading || !initialized || appointmentsLoading || patientsLoading || paymentsLoading;

  // Safe error state
  const hasErrors = appointmentsError || patientsError || paymentsError || firebaseError;

  // ✅ Enhanced debug logging with error protection
  useEffect(() => {
    try {
      console.log('🎯 DASHBOARD (ENHANCED SYSTEM): Data state', {
        user: !!user,
        userProfile: !!userProfile,
        appointmentsCount: appointments?.length || 0,
        patientsCount: patients?.length || 0,
        paymentsCount: payments?.length || 0,
        connectionStatus: dashboardStats?.connectionStatus || 'unknown',
        isOnline: dashboardStats?.isOnline ?? navigator.onLine,
        lastUpdate: lastUpdate?.toLocaleTimeString(),
        updateCount,
        hasErrors: !!hasErrors,
        firebaseError: !!firebaseError,
        connectionRetries
      });
    } catch (error) {
      console.warn('⚠️ Error in dashboard debug logging:', error);
    }
  }, [user, userProfile, appointments, patients, payments, dashboardStats, lastUpdate, updateCount, hasErrors, firebaseError, connectionRetries]);

  // ✅ Safe dashboard metrics calculation with fallbacks
  const dashboardMetrics = useMemo(() => {
    try {
      const today = new Date().toDateString();
      const thisMonth = new Date();
      thisMonth.setDate(1);

      const safeAppointments = Array.isArray(appointments) ? appointments : [];
      const safePatients = Array.isArray(patients) ? patients : [];
      const safePayments = Array.isArray(payments) ? payments : [];

      const todayAppointments = safeAppointments.filter(apt => 
        apt?.date && new Date(apt.date).toDateString() === today
      );

      const thisMonthPayments = safePayments.filter(payment => 
        payment?.createdAt && new Date(payment.createdAt) >= thisMonth
      );

      return {
        totalPatients: safePatients.length,
        totalAppointments: safeAppointments.length,
        todayAppointments: todayAppointments.length,
        completedAppointments: safeAppointments.filter(apt => apt?.status === 'completed').length,
        pendingAppointments: safeAppointments.filter(apt => apt?.status === 'scheduled').length,
        totalRevenue: safePayments.reduce((sum, payment) => sum + (payment?.amount || 0), 0),
        thisMonthRevenue: thisMonthPayments.reduce((sum, payment) => sum + (payment?.amount || 0), 0),
        averageRevenue: safePayments.length > 0 ? safePayments.reduce((sum, payment) => sum + (payment?.amount || 0), 0) / safePayments.length : 0,
        newPatientsThisMonth: safePatients.filter(patient => {
          if (!patient?.createdAt) return false;
          const createdDate = new Date(patient.createdAt);
          return createdDate >= thisMonth;
        }).length
      };
    } catch (error) {
      console.error('❌ Error calculating dashboard metrics:', error);
      // Return safe fallback metrics
      return {
        totalPatients: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        averageRevenue: 0,
        newPatientsThisMonth: 0
      };
    }
  }, [appointments, patients, payments]);

  // Enhanced manual refresh with Firebase restart capability
  const handleManualRefresh = async () => {
    try {
      setRefreshKey(prev => prev + 1);
      
      // If there are persistent errors, try restarting the Firebase manager
      if (firebaseError && connectionRetries > 2) {
        console.log('🔄 Attempting to restart Firebase manager due to persistent errors...');
        if (forceRestartManager) {
          await forceRestartManager();
          setFirebaseError(null);
          setConnectionRetries(0);
        }
      }
    } catch (error) {
      console.error('❌ Error during manual refresh:', error);
      handleFirebaseError(error as Error);
    }
  };

  // Early return for authentication loading
  if (!initialized || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {t('dashboard.loading')}
        </Typography>
      </Box>
    );
  }

  // Early return for missing user
  if (!user || !userProfile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          {t('dashboard.userRequired')}
        </Alert>
      </Container>
    );
  }

  return (
    <FirebaseErrorBoundary onError={handleFirebaseError}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header with enhanced real-time status */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('dashboard.title')}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Connection Status */}
            <Chip
              icon={
                dashboardStats?.connectionStatus === 'connected' ? 
                  <CheckCircle /> : 
                  <Warning />
              }
              label={
                dashboardStats?.isOnline ? 
                  `Connected - ${updateCount} updates` : 
                  'Offline'
              }
              color={
                dashboardStats?.connectionStatus === 'connected' ? 'success' : 'warning'
              }
              variant="outlined"
              size="small"
            />
            
            {/* Last Update */}
            {lastUpdate && (
              <Typography variant="caption" color="textSecondary">
                Last update: {lastUpdate.toLocaleTimeString()}
              </Typography>
            )}

            {/* Manual Refresh */}
            <Tooltip title={firebaseError ? "Restart Firebase Connection" : "Refresh Data"}>
              <IconButton 
                onClick={handleManualRefresh}
                disabled={isLoading}
                color={firebaseError ? "error" : "default"}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Enhanced Error Display */}
        {hasErrors && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleManualRefresh}>
                {connectionRetries > 2 ? "Restart Firebase" : "Retry"}
              </Button>
            }
          >
            <Typography variant="subtitle2" gutterBottom>
              Data loading errors detected. Some information may be incomplete.
            </Typography>
            {appointmentsError && <Typography variant="body2">Appointments: {appointmentsError}</Typography>}
            {patientsError && <Typography variant="body2">Patients: {patientsError}</Typography>}
            {paymentsError && <Typography variant="body2">Payments: {paymentsError}</Typography>}
            {firebaseError && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                Firebase: {firebaseError} {connectionRetries > 0 && `(Retry ${connectionRetries}/3)`}
              </Typography>
            )}
          </Alert>
        )}

        {/* Loading Progress */}
        {isLoading && (
          <LinearProgress sx={{ mb: 3 }} />
        )}

        {/* Key Metrics Cards with Error Boundaries */}
        <FirebaseErrorBoundary>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Patients */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: colorPalette.primary, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" component="div">
                        {t('dashboard.totalPatients')}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {dashboardMetrics.totalPatients}
                      </Typography>
                      <Typography variant="body2">
                        +{dashboardMetrics.newPatientsThisMonth} this month
                      </Typography>
                    </Box>
                    <People fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Appointments */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: colorPalette.secondary, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" component="div">
                        {t('dashboard.todayAppointments')}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {dashboardMetrics.todayAppointments}
                      </Typography>
                      <Typography variant="body2">
                        {dashboardMetrics.totalAppointments} total
                      </Typography>
                    </Box>
                    <CalendarToday fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: colorPalette.success, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" component="div">
                        {t('dashboard.totalRevenue')}
                      </Typography>
                      <Typography variant="h4" component="div">
                        ${dashboardMetrics.totalRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        ${dashboardMetrics.thisMonthRevenue.toLocaleString()} this month
                      </Typography>
                    </Box>
                    <TrendingUp fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Completion Rate */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: colorPalette.info, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" component="div">
                        {t('dashboard.completionRate')}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {dashboardMetrics.totalAppointments > 0 
                          ? Math.round((dashboardMetrics.completedAppointments / dashboardMetrics.totalAppointments) * 100)
                          : 0}%
                      </Typography>
                      <Typography variant="body2">
                        {dashboardMetrics.completedAppointments} completed
                      </Typography>
                    </Box>
                    <CheckCircle fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </FirebaseErrorBoundary>

        {/* Revenue & Profit Trend Widget with Error Boundary */}
        <FirebaseErrorBoundary>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <RevenueProfitTrendWidget payments={payments || []} />
            </Grid>
          </Grid>
        </FirebaseErrorBoundary>

        {/* Real-time Data Tables with Error Boundaries */}
        <FirebaseErrorBoundary>
          <Grid container spacing={3}>
            {/* Recent Appointments */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Appointments
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(appointments || []).slice(0, 5).map((appointment) => (
                          <TableRow key={appointment?.id || Math.random()}>
                            <TableCell>{appointment?.patientName || 'Unknown'}</TableCell>
                            <TableCell>
                              {appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={appointment?.status || 'unknown'} 
                                color={
                                  appointment?.status === 'completed' ? 'success' :
                                  appointment?.status === 'cancelled' ? 'error' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!appointments || appointments.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No appointments available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Payments */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Payments
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(payments || []).slice(0, 5).map((payment) => (
                          <TableRow key={payment?.id || Math.random()}>
                            <TableCell>{payment?.patientName || 'Unknown'}</TableCell>
                            <TableCell>${payment?.amount?.toLocaleString() || '0'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={payment?.status || 'unknown'} 
                                color={payment?.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!payments || payments.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Typography variant="body2" color="textSecondary">
                                No payments available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </FirebaseErrorBoundary>

        {/* Enhanced Debug Information (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Box mt={4}>
            <Alert 
              severity={hasErrors ? "warning" : "info"}
              action={
                forceRestartManager && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => forceRestartManager()}
                  >
                    Restart Firebase
                  </Button>
                )
              }
            >
              <Typography variant="body2">
                <strong>Debug Info:</strong> Enhanced real-time system | 
                Appointments: {appointments?.length || 0} | 
                Patients: {patients?.length || 0} | 
                Payments: {payments?.length || 0} | 
                Connection: {dashboardStats?.connectionStatus || 'unknown'} | 
                Updates: {updateCount} | 
                Errors: {hasErrors ? 'Yes' : 'No'} | 
                Retries: {connectionRetries}
              </Typography>
            </Alert>
          </Box>
        )}
      </Container>
    </FirebaseErrorBoundary>
  );
};

export default DashboardPage; 