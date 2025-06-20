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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  CalendarToday,
  People,
  CheckCircle,
  Schedule,
  PersonAdd,
  Warning,
  Payment,
  Inventory,
  Call,
  Edit,
  Visibility,
} from '@mui/icons-material';
import Header from '../../components/navBar';
import Sidebar from '../../components/Sidebar';
import {
  receptionistDashboardTodayAppointments,
  receptionistDashboardPaymentsDue,
  receptionistDashboardInventoryAlerts,
} from '../../data/mockData';



const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const ReceptionistDashboard: React.FC = () => {
  const { t } = useTranslation();
  
  // State management for dashboard data
  const [todayAppointments, setTodayAppointments] = useState(receptionistDashboardTodayAppointments);
  const [paymentsDue, setPaymentsDue] = useState(receptionistDashboardPaymentsDue);
  const [inventoryAlerts, setInventoryAlerts] = useState(receptionistDashboardInventoryAlerts);

  // Reset functionality
  useEffect(() => {
    const handleUserDataCleared = () => {
      // Reset to default data
      setTodayAppointments(receptionistDashboardTodayAppointments);
      setPaymentsDue(receptionistDashboardPaymentsDue);
      setInventoryAlerts(receptionistDashboardInventoryAlerts);
      console.log('✅ Receptionist Dashboard reset to default state');
    };

    window.addEventListener('userDataCleared', handleUserDataCleared);
    
    return () => {
      window.removeEventListener('userDataCleared', handleUserDataCleared);
    };
  }, []);

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'success';
      case 'waiting':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'scheduled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              {t('receptionist_dashboard')} 📋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('manage_appointments_payments')}
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('appointments_today')}
                value="12"
                icon={<CalendarToday />}
                color="#3B82F6"
                subtitle={`4 ${t('pending_checkin')}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('walk_ins_today')}
                value="3"
                icon={<PersonAdd />}
                color="#10B981"
                subtitle={`2 ${t('waiting')}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('payments_due')}
                value="8"
                icon={<Payment />}
                color="#F59E0B"
                subtitle={`$1,250 ${t('total')}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('inventory_alerts')}
                value="5"
                icon={<Warning />}
                color="#EF4444"
                subtitle={t('low_stock_items')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Today's Appointments */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('todays_appointments')}
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<CalendarToday />}>
                      {t('view_calendar')}
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>{t('time')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('table_actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {todayAppointments.map((appointment) => (
                          <TableRow key={appointment.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {appointment.time}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    mr: 1.5,
                                    backgroundColor: 'primary.main',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {appointment.avatar}
                                </Avatar>
                                <Typography variant="body2">{appointment.patient}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.doctor}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t(appointment.status.replace('-', '_'))}
                                color={getAppointmentStatusColor(appointment.status) as any}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <Call fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar with Payments and Inventory */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Payments Due */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {t('payments_due')}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {paymentsDue.map((payment) => (
                        <ListItem key={payment.id} sx={{ px: 0, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: 'warning.main' }}>
                              <Payment fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={payment.patient}
                            secondary={payment.dueDate}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              {payment.amount}
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Button variant="text" size="small" fullWidth sx={{ mt: 1 }}>
                      {t('view_all_payments')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Inventory Alerts */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {t('inventory_alerts')}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {inventoryAlerts.map((item) => (
                        <ListItem key={item.id} sx={{ px: 0, py: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: item.status === 'critical' ? 'error.main' : 'warning.main', mr: 1.5 }}>
                              <Inventory fontSize="small" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {item.item}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.stock} {t('left')} ({t('min')}: {item.minStock})
                              </Typography>
                            </Box>
                            <Chip
                              label={t(item.status)}
                              size="small"
                              color={item.status === 'critical' ? 'error' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(item.stock / item.minStock) * 100}
                            sx={{ width: '100%', height: 4, borderRadius: 2 }}
                            color={item.status === 'critical' ? 'error' : 'warning'}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button variant="text" size="small" fullWidth sx={{ mt: 1 }}>
                      {t('manage_inventory')}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ReceptionistDashboard; 