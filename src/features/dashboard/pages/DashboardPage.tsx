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
import RevenueProfitTrendWidget from '@features/dashboard/widgets/RevenueProfitTrendWidget';
import PatientConfirmationWidget from '@features/dashboard/widgets/PatientConfirmationWidget';
import BudgetProfitSummaryCard from '@features/dashboard/widgets/BudgetProfitSummaryCard';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@store/auth';
import { useUser } from '@store/auth';

// ✅ NEW: Use the new real-time data hooks with error boundaries
import { 
  useGlobalData, 
  useAppointments, 
  usePatients, 
  usePayments, 
  useDashboardStats,
  useRealtimeUpdates 
} from '@hooks/useGlobalData';

// Enhanced Professional Color Palette with Modern Gradients
const colorPalette = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  background: '#f5f5f5',
  // Enhanced vibrant gradient colors
  gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
  gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)',
  gradient3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)',
  gradient4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #43e97b 100%)',
  gradient5: 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #fa709a 100%)',
  gradient6: 'linear-gradient(135deg, #30cfd0 0%, #330867 50%, #30cfd0 100%)',
  // New premium gradients
  premiumBlue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  premiumPink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  premiumCyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  premiumGreen: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
};

// Error boundary component for Firebase errors
const FirebaseErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error | ErrorEvent) => void;
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

    const handleWindowError = (event: ErrorEvent) => {
      if (event.message?.includes('FIRESTORE') || 
          event.message?.includes('Firebase') ||
          event.message?.includes('INTERNAL ASSERTION FAILED')) {
        handleError(new Error(`Firebase Error: ${event.message}`));
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
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
  const handleFirebaseError = (error: Error | ErrorEvent) => {
    console.error('🚨 Dashboard Firebase Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    setFirebaseError(message);
    
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

      // ✅ CORRECT: Calculate revenue only from PAID payments
      const paidPayments = safePayments.filter(p => p?.status === 'paid');
      const thisMonthPaidPayments = thisMonthPayments.filter(p => p?.status === 'paid');
      
      // ✅ CORRECT: Use paidAmount if available, otherwise amount
      const totalRevenue = paidPayments.reduce((sum, payment) => {
        const amount = payment?.paidAmount || payment?.amount || 0;
        return sum + amount;
      }, 0);
      
      const thisMonthRevenue = thisMonthPaidPayments.reduce((sum, payment) => {
        const amount = payment?.paidAmount || payment?.amount || 0;
        return sum + amount;
      }, 0);
      
      // ✅ CORRECT: Calculate confirmed appointments (confirmed OR completed OR checked-in)
      const confirmedAppointments = safeAppointments.filter(apt => {
        const status = apt?.status?.toLowerCase();
        return status === 'confirmed' || status === 'completed' || status === 'checked-in';
      }).length;
      
      // ✅ CORRECT: Calculate pending appointments (pending OR scheduled)
      const pendingAppointments = safeAppointments.filter(apt => {
        const status = apt?.status?.toLowerCase();
        return status === 'pending' || status === 'scheduled';
      }).length;

      return {
        totalPatients: safePatients.length,
        totalAppointments: safeAppointments.length,
        todayAppointments: todayAppointments.length,
        completedAppointments: safeAppointments.filter(apt => apt?.status === 'completed').length,
        confirmedAppointments: confirmedAppointments,
        pendingAppointments: pendingAppointments,
        totalRevenue: totalRevenue,
        thisMonthRevenue: thisMonthRevenue,
        averageRevenue: paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0,
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

  // ✅ ENHANCED: Improved user check - allow if user exists, even without userProfile
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('dashboard.userRequired')}
          </Typography>
          <Typography variant="body2">
            Please sign in to access the dashboard. If you're already signed in, please wait a moment for your profile to load.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // ✅ ENHANCED: Show dashboard even if userProfile is still loading
  // This prevents the "userRequired" error for authenticated users
  if (!userProfile) {
    console.log('ℹ️ Dashboard: User authenticated but profile still loading, showing dashboard anyway');
    // Continue to show dashboard - userProfile will load in background
  }

  return (
    <FirebaseErrorBoundary onError={handleFirebaseError}>
      <Container maxWidth="xl" sx={{ 
        mt: 4, 
        mb: 4,
        background: 'linear-gradient(135deg, rgba(248,250,252,0.6) 0%, rgba(255,255,255,0.4) 50%, rgba(240,247,255,0.6) 100%)',
        borderRadius: 4,
        p: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)',
          borderRadius: 4,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        }
      }}>
        {/* Enhanced Header matching Patient Page styling exactly */}
        <Box sx={{ 
          mb: 4, 
          p: 4,
          background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
          borderRadius: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.25)',
        }}>
          {/* Responsive Main Header Content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' }, 
            justifyContent: 'space-between', 
            gap: { xs: 3, md: 0 },
            position: 'relative', 
            zIndex: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56, md: 64 },
                  height: { xs: 48, sm: 56, md: 64 },
                  borderRadius: { xs: '16px', md: '20px' },
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: { xs: 2, sm: 2.5, md: 3 },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  flexShrink: 0
                }}
              >
                <Analytics sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h3"
                  sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    mb: { xs: 0.5, md: 1 },
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  {t('Dashboard')}
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 400,
                    fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                  }}
                >
                  📊 Welcome back! Here's your clinic overview
                </Typography>
              </Box>
            </Box>
            
            {/* Responsive Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              width: { xs: '100%', md: 'auto' }
            }}>
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
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
                size="small"
              />
              
              {/* Last Update */}
              {lastUpdate && (
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' }
                }}>
                  Last update: {lastUpdate.toLocaleTimeString()}
                </Typography>
              )}

              {/* Manual Refresh */}
              <Tooltip title={firebaseError ? "Restart Firebase Connection" : "Refresh Data"}>
                <span>
                  <IconButton 
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(255,255,255,0.5)',
                      }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
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

        {/* Enhanced Key Metrics Cards with Beautiful Gradients */}
        <FirebaseErrorBoundary>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Patients */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: colorPalette.gradient1,
                color: 'white',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: '0 24px 48px rgba(102, 126, 234, 0.5), 0 0 0 1px rgba(255,255,255,0.2)',
                  '&::before': {
                    opacity: 1,
                  }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" component="div" sx={{ opacity: 0.95, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                        {t('dashboard.totalPatients')}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 900, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        {dashboardMetrics.totalPatients}
                      </Typography>
                      <Chip 
                        label={`+${dashboardMetrics.newPatientsThisMonth} this month`}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    <Box sx={{
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 3,
                      p: 2.5,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: 'rgba(255,255,255,0.35)',
                      }
                    }}>
                      <People sx={{ fontSize: 52, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                    </Box>
                    </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Appointments */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: colorPalette.gradient2,
                color: 'white',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: '0 24px 48px rgba(245, 87, 108, 0.5), 0 0 0 1px rgba(255,255,255,0.2)',
                  '&::before': {
                    opacity: 1,
                  }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" component="div" sx={{ opacity: 0.95, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                        {t('dashboard.todayAppointments')}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 900, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        {dashboardMetrics.todayAppointments}
                      </Typography>
                      <Chip 
                        label={`${dashboardMetrics.totalAppointments} total`}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    <Box sx={{
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 3,
                      p: 2.5,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(-5deg)',
                        background: 'rgba(255,255,255,0.35)',
                      }
                    }}>
                      <CalendarToday sx={{ fontSize: 52, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                    </Box>
                </Box>
                </CardContent>
              </Card>
          </Grid>

            {/* Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: colorPalette.gradient4,
                color: 'white',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: '0 24px 48px rgba(67, 233, 123, 0.5), 0 0 0 1px rgba(255,255,255,0.2)',
                  '&::before': {
                    opacity: 1,
                  }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" component="div" sx={{ opacity: 0.95, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                        {t('dashboard.totalRevenue')}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 900, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        ${dashboardMetrics.totalRevenue.toLocaleString()}
                      </Typography>
                      <Chip 
                        label={`$${dashboardMetrics.thisMonthRevenue.toLocaleString()} this month`}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    <Box sx={{
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 3,
                      p: 2.5,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: 'rgba(255,255,255,0.35)',
                      }
                    }}>
                      <TrendingUp sx={{ fontSize: 52, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                    </Box>
                </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Completion Rate */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: colorPalette.gradient3,
                color: 'white',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: '0 24px 48px rgba(79, 172, 254, 0.5), 0 0 0 1px rgba(255,255,255,0.2)',
                  '&::before': {
                    opacity: 1,
                  }
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" component="div" sx={{ opacity: 0.95, mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                        {t('dashboard.completionRate')}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 900, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                        {dashboardMetrics.totalAppointments > 0 
                          ? Math.round((dashboardMetrics.completedAppointments / dashboardMetrics.totalAppointments) * 100)
                          : 0}%
                      </Typography>
                      <Chip 
                        label={`${dashboardMetrics.completedAppointments} completed`}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.25)', 
                          color: 'white',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    <Box sx={{
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 3,
                      p: 2.5,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(-5deg)',
                        background: 'rgba(255,255,255,0.35)',
                      }
                    }}>
                      <CheckCircle sx={{ fontSize: 52, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                    </Box>
                </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </FirebaseErrorBoundary>

        {/* Analytics Widgets Section with Enhanced Design */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            mb: 3,
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)',
            border: '1px solid rgba(9, 9, 121, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}>
              <Box sx={{
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                border: '1px solid rgba(9, 9, 121, 0.2)'
              }}>
                <Analytics sx={{ fontSize: 28, background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
              </Box>
              Financial & Patient Analytics
            </Typography>
          </Box>
          
          {/* Budget & Profit Summary Card */}
          <FirebaseErrorBoundary>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <BudgetProfitSummaryCard payments={payments as any || []} />
              </Grid>
            </Grid>
          </FirebaseErrorBoundary>
          
          <FirebaseErrorBoundary>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Revenue & Profit Trend Widget */}
              <Grid item xs={12}>
                <RevenueProfitTrendWidget 
                  payments={payments as any || []} 
                  colorPalette={colorPalette}
                />
              </Grid>
            </Grid>
          </FirebaseErrorBoundary>

          {/* Patient Confirmation Widget */}
        <FirebaseErrorBoundary>
            <Grid container spacing={3}>
            <Grid item xs={12}>
                <PatientConfirmationWidget 
                  appointments={appointments as any || []}
                  patients={patients || []}
                />
            </Grid>
          </Grid>
        </FirebaseErrorBoundary>
        </Box>

        {/* Recent Activity Section with Enhanced Design */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            mb: 3,
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)',
            border: '1px solid rgba(9, 9, 121, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}>
              <Box sx={{
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                border: '1px solid rgba(9, 9, 121, 0.2)'
              }}>
                <Timeline sx={{ fontSize: 28, background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
              </Box>
              Recent Activity
            </Typography>
          </Box>
          
        <FirebaseErrorBoundary>
          <Grid container spacing={3}>
            {/* Recent Appointments */}
            <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(9, 9, 121, 0.15)',
                  boxShadow: '0 8px 32px rgba(9, 9, 121, 0.12), 0 0 0 1px rgba(255,255,255,0.5) inset',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(240, 98, 146, 1) 0%, rgba(245, 87, 108, 1) 100%)',
                    opacity: 0.8,
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 48px rgba(240, 98, 146, 0.2), 0 0 0 1px rgba(255,255,255,0.6) inset',
                    border: '1px solid rgba(240, 98, 146, 0.3)',
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(240, 98, 146, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
                        border: '1px solid rgba(245, 87, 108, 0.25)',
                        boxShadow: '0 2px 8px rgba(240, 98, 146, 0.1)'
                      }}>
                        <CalendarToday sx={{ 
                          fontSize: 24,
                          background: 'linear-gradient(90deg, rgba(240, 98, 146, 1) 0%, rgba(245, 87, 108, 1) 100%)',
                          color: 'transparent',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(90deg, rgba(240, 98, 146, 1) 0%, rgba(245, 87, 108, 1) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                    Recent Appointments
                    </Typography>
                    </Box>
                  <TableContainer>
                    <Table size="small" sx={{
                      '& .MuiTableHead-root': {
                        background: 'linear-gradient(135deg, rgba(240, 98, 146, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%)',
                      },
                      '& .MuiTableCell-head': {
                        fontWeight: 700,
                        color: 'rgba(9, 9, 121, 0.8)',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid rgba(240, 98, 146, 0.2)',
                      },
                      '& .MuiTableRow-root': {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(240, 98, 146, 0.03) 0%, rgba(245, 87, 108, 0.03) 100%)',
                          transform: 'scale(1.01)',
                        }
                      },
                      '& .MuiTableCell-body': {
                        borderBottom: '1px solid rgba(240, 98, 146, 0.1)',
                      }
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(appointments || []).slice(0, 5).map((appointment: any) => (
                          <TableRow key={appointment?.id || Math.random()}>
                            <TableCell sx={{ fontWeight: 600 }}>{appointment?.patientName || appointment?.patient || appointment?.patientId || 'Unknown'}</TableCell>
                            <TableCell>
                              {appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={appointment?.status || 'unknown'} 
                                color={
                                  appointment?.status === 'completed' || appointment?.status === 'confirmed' ? 'success' :
                                  appointment?.status === 'cancelled' ? 'error' : 'default'
                                }
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!appointments || appointments.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
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
                <Card sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(9, 9, 121, 0.15)',
                  boxShadow: '0 8px 32px rgba(9, 9, 121, 0.12), 0 0 0 1px rgba(255,255,255,0.5) inset',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(67, 233, 123, 1) 0%, rgba(56, 249, 215, 1) 100%)',
                    opacity: 0.8,
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 48px rgba(67, 233, 123, 0.2), 0 0 0 1px rgba(255,255,255,0.6) inset',
                    border: '1px solid rgba(67, 233, 123, 0.3)',
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(56, 249, 215, 0.15) 100%)',
                        border: '1px solid rgba(67, 233, 123, 0.25)',
                        boxShadow: '0 2px 8px rgba(67, 233, 123, 0.1)'
                      }}>
                        <TrendingUp sx={{ 
                          fontSize: 24,
                          background: 'linear-gradient(90deg, rgba(67, 233, 123, 1) 0%, rgba(56, 249, 215, 1) 100%)',
                          color: 'transparent',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(90deg, rgba(67, 233, 123, 1) 0%, rgba(56, 249, 215, 1) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                    Recent Payments
                              </Typography>
                    </Box>
                  <TableContainer>
                    <Table size="small" sx={{
                      '& .MuiTableHead-root': {
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.05) 0%, rgba(56, 249, 215, 0.05) 100%)',
                      },
                      '& .MuiTableCell-head': {
                        fontWeight: 700,
                        color: 'rgba(9, 9, 121, 0.8)',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid rgba(67, 233, 123, 0.2)',
                      },
                      '& .MuiTableRow-root': {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.03) 0%, rgba(56, 249, 215, 0.03) 100%)',
                          transform: 'scale(1.01)',
                        }
                      },
                      '& .MuiTableCell-body': {
                        borderBottom: '1px solid rgba(67, 233, 123, 0.1)',
                      }
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(payments || []).slice(0, 5).map((payment: any) => (
                          <TableRow key={payment?.id || Math.random()}>
                            <TableCell sx={{ fontWeight: 600 }}>{payment?.patientName || payment?.patient || payment?.patientId || 'Unknown'}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'rgba(67, 233, 123, 1)' }}>${((payment?.paidAmount || payment?.amount || 0)).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={payment?.status || 'unknown'} 
                                color={payment?.status === 'paid' ? 'success' : payment?.status === 'overdue' ? 'error' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!payments || payments.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
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
        </Box>

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