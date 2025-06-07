import React, { useState } from 'react';
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
} from '@mui/icons-material';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const notifications = [
  {
    id: 1,
    type: 'appointment',
    title: 'New Appointment Scheduled',
    message: 'Ahmed Al-Rashid has booked an appointment for tomorrow at 10:00 AM',
    time: '2 minutes ago',
    read: false,
    icon: <Schedule />,
    color: '#3B82F6',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of $150 received from Fatima Hassan',
    time: '1 hour ago',
    read: false,
    icon: <Payment />,
    color: '#10B981',
  },
  {
    id: 3,
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'Bandages are running low. Only 5 units left in stock',
    time: '3 hours ago',
    read: true,
    icon: <Warning />,
    color: '#F59E0B',
  },
  {
    id: 4,
    type: 'system',
    title: 'System Update',
    message: 'New features have been added to the patient management system',
    time: '1 day ago',
    read: true,
    icon: <Info />,
    color: '#8B5CF6',
  },
];

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    appointments: true,
    payments: true,
    inventory: true,
    system: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationsByType = (type?: string) => {
    if (!type) return notifications;
    return notifications.filter(n => n.type === type);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsActive sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {t('notifications')}
              </Typography>
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
                  <Circle sx={{ color: 'transparent' }} />
                </Badge>
              )}
            </Box>
            <Typography variant="body1" color="text.secondary">
              Stay updated with appointments, payments, and system alerts
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Main Notifications */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                      <Tab 
                        label={`All (${notifications.length})`} 
                        icon={<Badge badgeContent={unreadCount} color="error"><Notifications /></Badge>}
                        iconPosition="start"
                      />
                      <Tab 
                        label="Appointments" 
                        icon={<Schedule />}
                        iconPosition="start"
                      />
                      <Tab 
                        label="Payments" 
                        icon={<Payment />}
                        iconPosition="start"
                      />
                      <Tab 
                        label="Inventory" 
                        icon={<Warning />}
                        iconPosition="start"
                      />
                    </Tabs>
                  </Box>

                  <TabPanel value={tabValue} index={0}>
                    <List sx={{ px: 3 }}>
                      {notifications.map((notification, index) => (
                        <React.Fragment key={notification.id}>
                          <ListItem 
                            sx={{ 
                              px: 0, 
                              py: 2,
                              backgroundColor: notification.read ? 'transparent' : 'action.hover',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ backgroundColor: notification.color }}>
                                {notification.icon}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={notification.title}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {notification.message}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {notification.time}
                                  </Typography>
                                </Box>
                              }
                              primaryTypographyProps={{ 
                                fontWeight: notification.read ? 500 : 600,
                                variant: 'body1'
                              }}
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {!notification.read && (
                                  <IconButton size="small" title="Mark as read">
                                    <MarkEmailRead fontSize="small" />
                                  </IconButton>
                                )}
                                <IconButton size="small" color="error" title="Delete">
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < notifications.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <List sx={{ px: 3 }}>
                      {getNotificationsByType('appointment').map((notification) => (
                        <ListItem key={notification.id} sx={{ px: 0, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: notification.color }}>
                              {notification.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.title}
                            secondary={notification.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    <List sx={{ px: 3 }}>
                      {getNotificationsByType('payment').map((notification) => (
                        <ListItem key={notification.id} sx={{ px: 0, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: notification.color }}>
                              {notification.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.title}
                            secondary={notification.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TabPanel>

                  <TabPanel value={tabValue} index={3}>
                    <List sx={{ px: 3 }}>
                      {getNotificationsByType('inventory').map((notification) => (
                        <ListItem key={notification.id} sx={{ px: 0, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: notification.color }}>
                              {notification.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.title}
                            secondary={notification.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TabPanel>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button variant="outlined" fullWidth>
                      Load More Notifications
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notification Settings */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Settings sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notification Settings
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.appointments}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            appointments: e.target.checked
                          })}
                        />
                      }
                      label="Appointment Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.payments}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            payments: e.target.checked
                          })}
                        />
                      }
                      label="Payment Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.inventory}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            inventory: e.target.checked
                          })}
                        />
                      }
                      label="Inventory Alerts"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.system}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            system: e.target.checked
                          })}
                        />
                      }
                      label="System Updates"
                    />
                  </Box>
                  
                  <Button variant="contained" fullWidth sx={{ mt: 3 }}>
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="outlined" fullWidth startIcon={<MarkEmailRead />}>
                      Mark All as Read
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<Delete />}>
                      Clear All Notifications
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default NotificationsPage; 