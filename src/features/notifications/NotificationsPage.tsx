import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Tabs,
  Tab,
  Badge,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  Paper,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Schedule,
  Payment,
  Warning,
  Info,
  CheckCircle,
  Delete,
  MarkEmailRead,
  Settings,
  Circle,
  Refresh,
  Sync,
  Star,
  FiberManualRecord,
  Tune,
  NotificationsNone,
  AutoAwesome,
} from '@mui/icons-material';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Notification, NotificationSettings } from '../../types/models';
import { notificationsApi, notificationSettingsApi } from '../../api/notifications';
import { useNotifications } from '../../contexts/NotificationContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return <Schedule />;
    case 'payment':
      return <Payment />;
    case 'inventory':
      return <Warning />;
    case 'system':
      return <Info />;
    default:
      return <Notifications />;
  }
};

const getPriorityColor = (type: string) => {
  switch (type) {
    case 'appointment':
      return {
        main: '#3B82F6',
        light: '#EBF8FF',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
    case 'payment':
      return {
        main: '#10B981',
        light: '#F0FDF4',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
      };
    case 'inventory':
      return {
        main: '#F59E0B',
        light: '#FFFBEB',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      };
    case 'system':
      return {
        main: '#8B5CF6',
        light: '#FAF5FF',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
    default:
      return {
        main: '#6B7280',
        light: '#F9FAFB',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
  }
};

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Helper function to translate notification titles and messages
  const translateNotificationText = (text: string, isMessage: boolean = false): string => {
    // Check if it's a translation key
    if (!text.includes(' ') && text.includes('_')) {
      // For messages with parameters (format: "key|||param1|||param2|||param3")
      if (isMessage && text.includes('|||')) {
        const parts = text.split('|||');
        const key = parts[0];
        const params = parts.slice(1);
        
        if (key === 'low_stock_message') {
          return t('low_stock_message', { 
            itemName: params[0], 
            quantity: params[1], 
            minQuantity: params[2] 
          });
        } else if (key === 'out_of_stock_message') {
          return t('out_of_stock_message', { 
            itemName: params[0], 
            supplier: params[1] 
          });
        }
        return text; // Fallback if key not found
      }
      
      // Simple translation key
      return t(text);
    }
    
    // Return original text if not a translation key
    return text;
  };
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead: contextMarkAsRead, 
    markAllAsRead: contextMarkAllAsRead, 
    deleteNotification: contextDeleteNotification, 
    refreshNotifications: contextRefreshNotifications 
  } = useNotifications();
  
  const [tabValue, setTabValue] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    appointments: true,
    payments: true,
    inventory: true,
    system: true,
  });
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(4); // Show 4 notifications initially
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Mock user data - replace with actual user context
  const currentUser = {
    id: 'user-1',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await notificationSettingsApi.get(currentUser.id);
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      showSnackbar(t('failed_to_load_settings'), 'error');
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await contextRefreshNotifications();
      setDisplayCount(4); // Reset display count when refreshing
      showSnackbar(
        t('notifications_refreshed', { total: notifications.length, unread: unreadCount }), 
        'success'
      );
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      showSnackbar(t('failed_to_refresh_notifications'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setDisplayCount(4); // Reset display count when switching tabs
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setUpdating(true);
      await contextMarkAsRead(id);
      showSnackbar(t('notification_marked_as_read'));
    } catch (error) {
      console.error('Error marking as read:', error);
      showSnackbar(t('failed_to_mark_as_read'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setUpdating(true);
      await contextDeleteNotification(id);
      showSnackbar(t('notification_deleted'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar(t('failed_to_delete_notification'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setUpdating(true);
      await contextMarkAllAsRead();
      showSnackbar(t('all_notifications_marked_as_read'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      showSnackbar(t('failed_to_mark_all_as_read'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setUpdating(true);
      await notificationsApi.clearAll(currentUser.clinicId, currentUser.branchId);
      // Note: We would need to add clearAll to the context if we want to use it
      showSnackbar(t('all_notifications_cleared'));
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showSnackbar(t('failed_to_clear_notifications'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      await notificationSettingsApi.update(currentUser.id, notificationSettings);
      showSnackbar(t('settings_saved_successfully'));
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar(t('failed_to_save_settings'), 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      setUpdating(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const remainingNotifications = notifications.length - displayCount;
      const notificationsToLoad = Math.min(4, remainingNotifications);
      const newDisplayCount = displayCount + notificationsToLoad;
      
      setDisplayCount(newDisplayCount);
      
      showSnackbar(t('loaded_more_notifications', { count: notificationsToLoad }), 'success');
    } catch (error) {
      console.error('Error loading more:', error);
      showSnackbar(t('failed_to_load_more'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getNotificationsByType = (type?: string) => {
    if (!type) return notifications;
    return notifications.filter(n => n.type === type);
  };

  const renderNotificationList = (notificationList: Notification[]) => {
    const displayedNotifications = notificationList.slice(0, displayCount);
    
    return (
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {notificationList.length === 0 ? (
        <Fade in timeout={800}>
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3Ccircle cx="53" cy="7" r="7"/%3E%3Ccircle cx="7" cy="53" r="7"/%3E%3Ccircle cx="53" cy="53" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <NotificationsNone sx={{ fontSize: 64, mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {t('no_notifications_found')}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 400, mx: 'auto' }}>
                {t('all_caught_up')}
              </Typography>
            </Box>
          </Box>
        </Fade>
              ) : (
          <Stack spacing={2}>
            {displayedNotifications.map((notification, index) => {
            const colors = getPriorityColor(notification.type);
            const isExpanded = expandedNotification === notification.id;
            
            return (
              <Zoom
                key={notification.id}
                in={true}
                timeout={300 + index * 50}
                style={{ transformOrigin: '0 0 0' }}
              >
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 3,
                    border: notification.read ? '1px solid #E5E7EB' : `2px solid ${colors.main}`,
                    background: notification.read 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                      : `linear-gradient(135deg, ${colors.light} 0%, #ffffff 100%)`,
                    boxShadow: notification.read 
                      ? '0 2px 4px rgba(0,0,0,0.05)'
                      : `0 8px 25px ${colors.main}25`,
                    transform: notification.read ? 'none' : 'translateY(-2px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: notification.read 
                        ? '0 8px 25px rgba(0,0,0,0.1)'
                        : `0 12px 35px ${colors.main}35`,
                    },
                    '&::before': !notification.read ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: colors.gradient,
                    } : {},
                  }}
                  onClick={() => setExpandedNotification(isExpanded ? null : notification.id)}
                >
                  <CardContent sx={{ p: 3, pb: isExpanded ? 2 : 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Icon Avatar */}
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: colors.gradient,
                          boxShadow: `0 4px 14px ${colors.main}25`,
                          '& svg': { fontSize: 24 }
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: notification.read ? 500 : 700,
                              fontSize: '1.1rem',
                              color: notification.read ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {translateNotificationText(notification.title)}
                          </Typography>
                          {!notification.read && (
                            <FiberManualRecord 
                              sx={{ 
                                fontSize: 8, 
                                color: colors.main,
                                animation: 'pulse 2s infinite'
                              }} 
                            />
                          )}
                        </Box>

                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'text.secondary',
                            mb: 1,
                            lineHeight: 1.5,
                            fontWeight: notification.read ? 400 : 500
                          }}
                        >
                          {translateNotificationText(notification.message, true)}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip
                            label={notification.time}
                            size="small"
                            sx={{
                              backgroundColor: colors.light,
                              color: colors.main,
                              fontWeight: 600,
                              border: `1px solid ${colors.main}20`,
                            }}
                          />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {!notification.read && (
                              <Tooltip title={t('mark_as_read')} placement="top">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  disabled={updating}
                                  sx={{
                                    color: colors.main,
                                    backgroundColor: colors.light,
                                    '&:hover': {
                                      backgroundColor: colors.main,
                                      color: 'white',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <MarkEmailRead fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title={t('delete_notification')} placement="top">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                                disabled={updating}
                                sx={{
                                  color: '#EF4444',
                                  backgroundColor: '#FEF2F2',
                                  '&:hover': {
                                    backgroundColor: '#EF4444',
                                    color: 'white',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <Slide direction="down" in={isExpanded} mountOnEnter unmountOnExit>
                            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <strong>{t('type')}:</strong> {t(`notification_${notification.type}_type`)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>{t('created_at')}:</strong> {new Date(notification.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Slide>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            );
          })}
                  </Stack>
        )}
      </Box>
    );
  };

  // Loading skeleton component
  const renderLoadingSkeleton = () => (
    <Box sx={{ px: 3 }}>
      <Stack spacing={2}>
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
            {/* Header Skeleton */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                  <Skeleton variant="text" width={200} height={40} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
              </Box>
              <Skeleton variant="text" width={400} height={24} />
            </Box>
            
            {/* Tabs Skeleton */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4].map((item) => (
                    <Skeleton key={item} variant="rectangular" width={120} height={48} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              </Box>
              {renderLoadingSkeleton()}
            </Card>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '300px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 0,
      }
    }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Enhanced Header Section */}
          <Fade in timeout={600}>
            <Box sx={{ mb: 6 }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      <NotificationsActive sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800, 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.5
                        }}
                      >
                        {t('notifications')}
                        
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {t('realtime_updates')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title={t('refresh_from_all_data')}>
                      <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        size="large"
                        sx={{
                          background: refreshing 
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          width: 56,
                          height: 56,
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6c5ce7 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {refreshing ? (
                          <AutoAwesome className="animate-spin" sx={{ fontSize: 28 }} />
                        ) : (
                          <Refresh sx={{ fontSize: 28 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                
                {refreshing && (
                  <Slide direction="down" in={refreshing} mountOnEnter unmountOnExit>
                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: '#667eea15' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} sx={{ color: '#667eea' }} />
                        <Typography variant="body1" sx={{ color: '#667eea', fontWeight: 600 }}>
                          {t('refreshing_from_all_modules')}
                        </Typography>
                      </Box>
                    </Box>
                  </Slide>
                )}
              </Paper>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {/* Main Notifications */}
            <Grid item xs={12} lg={8}>
              <Fade in timeout={800}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Enhanced Tabs */}
                    <Box sx={{ 
                      borderBottom: 1, 
                      borderColor: 'divider', 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      px: 3, 
                      pt: 2 
                    }}>
                      <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            minWidth: 'auto',
                            px: 3,
                            py: 2,
                            borderRadius: 2,
                            mx: 0.5,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.05)',
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white !important',
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                            }
                          },
                          '& .MuiTabs-indicator': {
                            display: 'none'
                          },
                        }}
                      >
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <NotificationsActive fontSize="small" />
                              <span>{t('notification_type_all')}</span>
                              <Chip 
                                label={notifications.length} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'inherit'
                                }}
                              />
                            </Box>
                          }
                        />
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule fontSize="small" />
                              <span>{t('notification_type_appointment')}</span>
                              <Chip 
                                label={getNotificationsByType('appointment').length} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'inherit'
                                }}
                              />
                            </Box>
                          }
                        />
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Payment fontSize="small" />
                              <span>{t('notification_type_payment')}</span>
                              <Chip 
                                label={getNotificationsByType('payment').length} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'inherit'
                                }}
                              />
                            </Box>
                          }
                        />
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Warning fontSize="small" />
                              <span>{t('notification_type_inventory')}</span>
                              <Chip 
                                label={getNotificationsByType('inventory').length} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'inherit'
                                }}
                              />
                            </Box>
                          }
                        />
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Info fontSize="small" />
                              <span>{t('notification_type_system')}</span>
                              <Chip 
                                label={getNotificationsByType('system').length} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'inherit'
                                }}
                              />
                            </Box>
                          }
                        />
                      </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                      {renderNotificationList(notifications)}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                      {renderNotificationList(getNotificationsByType('appointment'))}
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                      {renderNotificationList(getNotificationsByType('payment'))}
                    </TabPanel>

                    <TabPanel value={tabValue} index={3}>
                      {renderNotificationList(getNotificationsByType('inventory'))}
                    </TabPanel>

                    <TabPanel value={tabValue} index={4}>
                      {renderNotificationList(getNotificationsByType('system'))}
                    </TabPanel>

                    {/* Load More Button - only show if there are more notifications */}
                    {notifications.length > displayCount && (
                      <Box sx={{ p: 3, pt: 2 }}>
                        <Button 
                          variant="outlined" 
                          fullWidth
                          onClick={handleLoadMore}
                          disabled={updating}
                          startIcon={updating ? <CircularProgress size={16} /> : null}
                          sx={{
                            borderRadius: 3,
                            py: 1.5,
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#5a67d8',
                              backgroundColor: '#667eea10',
                            }
                          }}
                        >
                          {updating 
                            ? t('loading_more') 
                            : t('load_more_notifications')
                          }
                        </Button>
                      </Box>
                    )}
                    
                    {/* Show completion message when all notifications are displayed */}
                    {notifications.length > 0 && notifications.length <= displayCount && (
                      <Box sx={{ p: 3, pt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {t('all_notifications_loaded', { count: notifications.length })}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Notification Settings & Actions */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                {/* Notification Settings */}
                <Zoom in timeout={1000}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ 
                        p: 3, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Tune sx={{ mr: 2, fontSize: 28 }} />
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {t('notification_settings')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          {t('customize_notification_preferences')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                          {[
                            { key: 'appointments', label: t('appointment_notifications'), icon: <Schedule />, color: '#3B82F6' },
                            { key: 'payments', label: t('payment_notifications'), icon: <Payment />, color: '#10B981' },
                            { key: 'inventory', label: t('inventory_alerts'), icon: <Warning />, color: '#F59E0B' },
                            { key: 'system', label: t('system_updates'), icon: <Info />, color: '#8B5CF6' }
                          ].map((setting) => (
                            <Box 
                              key={setting.key}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: notificationSettings[setting.key as keyof NotificationSettings] 
                                  ? `${setting.color}10` 
                                  : 'transparent',
                                border: `1px solid ${notificationSettings[setting.key as keyof NotificationSettings] 
                                  ? `${setting.color}30` 
                                  : 'transparent'}`,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    backgroundColor: setting.color,
                                    '& svg': { fontSize: 20 }
                                  }}
                                >
                                  {setting.icon}
                                </Avatar>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {setting.label}
                                </Typography>
                              </Box>
                              <Switch
                                checked={notificationSettings[setting.key as keyof NotificationSettings]}
                                onChange={(e) => setNotificationSettings({
                                  ...notificationSettings,
                                  [setting.key]: e.target.checked
                                })}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: setting.color,
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: setting.color,
                                  },
                                }}
                              />
                            </Box>
                          ))}
                        </Stack>
                        
                        <Button 
                          variant="contained" 
                          fullWidth 
                          size="large"
                          sx={{ 
                            mt: 4,
                            borderRadius: 3,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6c5ce7 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                          onClick={handleSaveSettings}
                          disabled={settingsLoading}
                          startIcon={settingsLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Settings />}
                        >
                          {settingsLoading ? t('loading') : t('save_settings')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>

                {/* Quick Actions */}
                <Zoom in timeout={1200}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ 
                        p: 3, 
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        color: 'white'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AutoAwesome sx={{ mr: 2, fontSize: 28 }} />
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {t('quick_actions')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          {t('manage_all_notifications')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ p: 3 }}>
                        <Stack spacing={2}>
                          <Button 
                            variant="outlined" 
                            fullWidth 
                            size="large"
                            startIcon={refreshing ? <CircularProgress size={20} /> : <Sync />}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            sx={{
                              borderRadius: 3,
                              py: 1.5,
                              borderColor: '#667eea',
                              color: '#667eea',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#5a67d8',
                                backgroundColor: '#667eea15',
                                transform: 'translateY(-1px)',
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {refreshing ? t('refreshing') : t('refresh_all_data')}
                          </Button>
                          
                          <Button 
                            variant="outlined" 
                            fullWidth 
                            size="large"
                            startIcon={updating ? <CircularProgress size={20} /> : <MarkEmailRead />}
                            onClick={handleMarkAllAsRead}
                            disabled={updating || unreadCount === 0}
                            sx={{
                              borderRadius: 3,
                              py: 1.5,
                              borderColor: '#10B981',
                              color: '#10B981',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#059669',
                                backgroundColor: '#10B98115',
                                transform: 'translateY(-1px)',
                              },
                              '&:disabled': {
                                borderColor: '#D1D5DB',
                                color: '#9CA3AF',
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {updating ? t('processing') : `${t('mark_all_as_read')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                          </Button>
                          
                          <Button 
                            variant="outlined" 
                            fullWidth 
                            size="large"
                            startIcon={updating ? <CircularProgress size={20} /> : <Delete />}
                            onClick={handleClearAll}
                            disabled={updating || notifications.length === 0}
                            sx={{
                              borderRadius: 3,
                              py: 1.5,
                              borderColor: '#EF4444',
                              color: '#EF4444',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#DC2626',
                                backgroundColor: '#EF444415',
                                transform: 'translateY(-1px)',
                              },
                              '&:disabled': {
                                borderColor: '#D1D5DB',
                                color: '#9CA3AF',
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {updating ? t('processing') : t('clear_all_with_count', { count: notifications.length })}
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>


              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add custom CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default NotificationsPage; 