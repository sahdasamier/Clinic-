import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Badge,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import {
  useAppointments,
  usePatients,
  usePayments,
  useInventory,
  useNotifications,
  useDashboardStats,
  useRealtimeUpdates,
} from '../hooks/useGlobalData';

// Stats card component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
  subtitle?: string;
  badge?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  loading = false,
  subtitle,
  badge,
}) => (
  <Card sx={{ height: '100%', position: 'relative' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box>
          {badge !== undefined ? (
            <Badge badgeContent={badge} color="error">
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Connection status component
const ConnectionStatus: React.FC<{ status: string; isOnline: boolean }> = ({
  status,
  isOnline,
}) => {
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        color: 'error' as const,
        icon: <CloudOffIcon />,
        text: 'Offline - Using cached data',
      };
    }

    switch (status) {
      case 'connected':
        return {
          color: 'success' as const,
          icon: <CloudDoneIcon />,
          text: 'Connected - Real-time sync active',
        };
      case 'reconnecting':
        return {
          color: 'warning' as const,
          icon: <CircularProgress size={16} />,
          text: 'Reconnecting...',
        };
      default:
        return {
          color: 'error' as const,
          icon: <ErrorIcon />,
          text: 'Disconnected',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Chip
      icon={statusInfo.icon}
      label={statusInfo.text}
      color={statusInfo.color}
      variant="outlined"
      size="small"
    />
  );
};

// Main dashboard component
const RealtimeDataDashboard: React.FC = () => {
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<string[]>([]);

  // Use all the specialized hooks
  const {
    appointments,
    stats: appointmentStats,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments();

  const {
    patients,
    stats: patientStats,
    loading: patientsLoading,
    error: patientsError,
  } = usePatients();

  const {
    payments,
    stats: paymentStats,
    loading: paymentsLoading,
    error: paymentsError,
  } = usePayments();

  const {
    laboratoryRadiology,
    stats: laboratoryRadiologyStats,
    loading: laboratoryRadiologyLoading,
    error: laboratoryRadiologyError,
  } = useInventory();

  const {
    notifications,
    stats: notificationStats,
    loading: notificationsLoading,
    error: notificationsError,
  } = useNotifications({ unreadOnly: false });

  const dashboardStats = useDashboardStats();
  const { onDataUpdate, onError, onConnectionChange } = useRealtimeUpdates();

  // Set up real-time update listeners
  useEffect(() => {
    const unsubscribeDataUpdate = onDataUpdate((collection, data) => {
      setUpdateCount(prev => prev + 1);
      setLastUpdate(new Date());
      setRecentUpdates(prev => [
        `${collection}: ${data.length} items updated`,
        ...prev.slice(0, 4) // Keep only the last 5 updates
      ]);
      console.log(`📡 Real-time update received: ${collection} (${data.length} items)`);
    });

    const unsubscribeError = onError((collection, error) => {
      console.error(`❌ Real-time error for ${collection}:`, error);
      setRecentUpdates(prev => [
        `❌ Error in ${collection}: ${error}`,
        ...prev.slice(0, 4)
      ]);
    });

    const unsubscribeConnection = onConnectionChange((status) => {
      console.log(`🔄 Connection status changed: ${status}`);
      setRecentUpdates(prev => [
        `🔄 Connection: ${status}`,
        ...prev.slice(0, 4)
      ]);
    });

    return () => {
      unsubscribeDataUpdate();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, [onDataUpdate, onError, onConnectionChange]);

  // Check for any errors
  const hasErrors = appointmentsError || patientsError || paymentsError || laboratoryRadiologyError || notificationsError;
  const isLoading = appointmentsLoading || patientsLoading || paymentsLoading || laboratoryRadiologyLoading || notificationsLoading;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Real-time Data Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <ConnectionStatus 
            status={dashboardStats.connectionStatus} 
            isOnline={dashboardStats.isOnline} 
          />
          <Tooltip title="Manual refresh">
            <IconButton color="primary" disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error alerts */}
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Some data collections have errors. Check console for details.
        </Alert>
      )}

      {/* Update info */}
      <Box mb={3}>
        <Typography variant="body2" color="textSecondary">
          Updates received: {updateCount} | Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
        </Typography>
        {recentUpdates.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="textSecondary">
              Recent updates:
            </Typography>
            {recentUpdates.map((update, index) => (
              <Typography key={index} variant="caption" display="block" color="textSecondary">
                • {update}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Appointments"
            value={appointmentStats.total}
            subtitle={`${appointmentStats.today} today, ${appointmentStats.upcoming} upcoming`}
            icon={<EventIcon fontSize="large" />}
            color="primary"
            loading={appointmentsLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Patients"
            value={patientStats.total}
            subtitle={`${patientStats.newThisMonth} new this month`}
            icon={<PeopleIcon fontSize="large" />}
            color="secondary"
            loading={patientsLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Revenue"
            value={`$${paymentStats.totalAmount.toLocaleString()}`}
            subtitle={`$${paymentStats.thisMonthAmount.toLocaleString()} this month`}
            icon={<PaymentIcon fontSize="large" />}
            color="success"
            loading={paymentsLoading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Inventory"
            value={laboratoryRadiologyStats.total}
            subtitle={`$${laboratoryRadiologyStats.totalValue.toLocaleString()} total value`}
            icon={<InventoryIcon fontSize="large" />}
            color="warning"
            loading={laboratoryRadiologyLoading}
            badge={laboratoryRadiologyStats.lowStock + laboratoryRadiologyStats.outOfStock}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            title="Notifications"
            value={notificationStats.total}
            subtitle={`${notificationStats.unread} unread`}
            icon={<NotificationsIcon fontSize="large" />}
            color="error"
            loading={notificationsLoading}
            badge={notificationStats.unread}
          />
        </Grid>
      </Grid>

      {/* Detailed stats */}
      <Grid container spacing={3}>
        {/* Appointments breakdown */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointments Breakdown
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Today:</Typography>
                  <Chip label={appointmentStats.today} size="small" color="primary" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">This Week:</Typography>
                  <Chip label={appointmentStats.thisWeek} size="small" color="secondary" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Completed:</Typography>
                  <Chip label={appointmentStats.completed} size="small" color="success" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Cancelled:</Typography>
                  <Chip label={appointmentStats.cancelled} size="small" color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory alerts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Alerts
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Low Stock:</Typography>
                  <Chip 
                    label={laboratoryRadiologyStats.lowStock} 
                    size="small" 
                    color="warning"
                    icon={<WarningIcon />} 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Out of Stock:</Typography>
                  <Chip 
                    label={laboratoryRadiologyStats.outOfStock} 
                    size="small" 
                    color="error"
                    icon={<ErrorIcon />} 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Categories:</Typography>
                  <Typography variant="body2">{laboratoryRadiologyStats.categories.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Today's Revenue:</Typography>
                  <Typography variant="body2" color="success.main">
                    ${paymentStats.todayAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Pending:</Typography>
                  <Typography variant="body2" color="warning.main">
                    ${paymentStats.pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Average Payment:</Typography>
                  <Typography variant="body2">
                    ${paymentStats.averageAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealtimeDataDashboard; 