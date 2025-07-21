// ✅ OPTIMIZED FIREBASE STATUS COMPONENT
// Shows real-time status of optimized Firebase services and sync

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Storage as StorageIcon,
  Sync as SyncIcon,
  Speed as SpeedIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { 
  useOptimizedFirebase, 
  useOptimizedSync, 
  useFirebaseConnection,
  useOfflineSync
} from '../hooks/useOptimizedFirebase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const OptimizedFirebaseStatus: React.FC = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  const {
    isReady,
    isLoading,
    error,
    firestore,
    auth,
    storage,
    analytics,
    messaging,
    functions
  } = useOptimizedFirebase();

  const {
    isInitialized,
    status,
    clearCache,
    cleanup
  } = useOptimizedSync(userProfile?.clinicId || 'demo-clinic', user?.uid);

  const {
    isConnected,
    lastSyncTime,
    status: connectionStatus
  } = useFirebaseConnection();

  const {
    queueSize,
    isProcessing,
    hasOfflineOperations
  } = useOfflineSync();

  function getServiceStatus(service: any, serviceName: string) {
    if (service === null) return { status: 'disabled', color: 'default' as const };
    if (service === undefined) return { status: 'error', color: 'error' as const };
    return { status: 'active', color: 'success' as const };
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Initializing Optimized Firebase...
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography variant="h6">Firebase Initialization Error</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Overview Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Optimized Firebase Status
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                {isConnected ? <CloudIcon color="success" /> : <CloudOffIcon color="error" />}
                <Typography variant="body2">
                  Connection: <Chip 
                    label={connectionStatus} 
                    color={isConnected ? 'success' : 'error'} 
                    size="small" 
                  />
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <SyncIcon color={isInitialized ? 'success' : 'disabled'} />
                <Typography variant="body2">
                  Sync: <Chip 
                    label={isInitialized ? 'Active' : 'Inactive'} 
                    color={isInitialized ? 'success' : 'default'} 
                    size="small" 
                  />
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <StorageIcon color={status.cacheSize > 0 ? 'primary' : 'disabled'} />
                <Typography variant="body2">
                  Cache: <Chip 
                    label={`${status.cacheSize} items`} 
                    color={status.cacheSize > 0 ? 'primary' : 'default'} 
                    size="small" 
                  />
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <SpeedIcon color={hasOfflineOperations ? 'warning' : 'success'} />
                <Typography variant="body2">
                  Queue: <Chip 
                    label={`${queueSize} pending`} 
                    color={hasOfflineOperations ? 'warning' : 'success'} 
                    size="small" 
                  />
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {lastSyncTime && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Last sync: {lastSyncTime.toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Detailed Status Accordions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Firebase Services Status</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemIcon>
                {getServiceStatus(firestore, 'Firestore').color === 'success' ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Firestore" 
                secondary={
                  <Chip 
                    label={getServiceStatus(firestore, 'Firestore').status} 
                    color={getServiceStatus(firestore, 'Firestore').color} 
                    size="small" 
                  />
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {getServiceStatus(auth, 'Auth').color === 'success' ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Authentication" 
                secondary={
                  <Chip 
                    label={getServiceStatus(auth, 'Auth').status} 
                    color={getServiceStatus(auth, 'Auth').color} 
                    size="small" 
                  />
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {getServiceStatus(storage, 'Storage').color === 'success' ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Cloud Storage" 
                secondary={
                  <Chip 
                    label={getServiceStatus(storage, 'Storage').status} 
                    color={getServiceStatus(storage, 'Storage').color} 
                    size="small" 
                  />
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {getServiceStatus(analytics, 'Analytics').color === 'success' ? 
                  <CheckCircleIcon color="success" /> : 
                  getServiceStatus(analytics, 'Analytics').color === 'default' ?
                  <WarningIcon color="warning" /> :
                  <ErrorIcon color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Analytics" 
                secondary={
                  <Chip 
                    label={getServiceStatus(analytics, 'Analytics').status} 
                    color={getServiceStatus(analytics, 'Analytics').color} 
                    size="small" 
                  />
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {getServiceStatus(messaging, 'Messaging').color === 'success' ? 
                  <CheckCircleIcon color="success" /> : 
                  getServiceStatus(messaging, 'Messaging').color === 'default' ?
                  <WarningIcon color="warning" /> :
                  <ErrorIcon color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Cloud Messaging" 
                secondary={
                  <Chip 
                    label={getServiceStatus(messaging, 'Messaging').status} 
                    color={getServiceStatus(messaging, 'Messaging').color} 
                    size="small" 
                  />
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                {getServiceStatus(functions, 'Functions').color === 'success' ? 
                  <CheckCircleIcon color="success" /> : 
                  <ErrorIcon color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Cloud Functions" 
                secondary={
                  <Chip 
                    label={getServiceStatus(functions, 'Functions').status} 
                    color={getServiceStatus(functions, 'Functions').color} 
                    size="small" 
                  />
                }
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Sync Performance Metrics */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Sync Performance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Real-time Listeners</Typography>
              <Typography variant="h4" color="primary">{status.activeListeners}</Typography>
              <Typography variant="caption" color="textSecondary">
                Active connections to Firestore
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Pending Operations</Typography>
              <Typography variant="h4" color={status.pendingOperations > 0 ? 'warning.main' : 'success.main'}>
                {status.pendingOperations}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Operations in progress
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Cache Size</Typography>
              <Typography variant="h4" color="info.main">{status.cacheSize}</Typography>
              <Typography variant="caption" color="textSecondary">
                Cached data items
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Offline Queue</Typography>
              <Typography variant="h4" color={status.offlineQueueSize > 0 ? 'error.main' : 'success.main'}>
                {status.offlineQueueSize}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Operations waiting for connection
              </Typography>
            </Grid>
          </Grid>
          
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Processing offline operations...
                </Typography>
                <LinearProgress sx={{ mt: 1 }} />
              </Alert>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Actions */}
      {process.env.NODE_ENV === 'development' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Developer Actions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label="Clear Cache" 
                onClick={clearCache}
                clickable
                color="warning"
                variant="outlined"
              />
              <Chip 
                label="Cleanup Sync" 
                onClick={cleanup}
                clickable
                color="error"
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Development tools for testing optimized Firebase functionality
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default OptimizedFirebaseStatus; 