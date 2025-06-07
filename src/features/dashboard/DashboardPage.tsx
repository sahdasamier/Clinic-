import React from 'react';
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
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  CalendarToday,
  CheckCircle,
  Schedule,
  PersonAdd,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { useTranslation } from 'react-i18next';

// Mock data for charts
const appointmentData = [
  { name: 'Mon', appointments: 12 },
  { name: 'Tue', appointments: 19 },
  { name: 'Wed', appointments: 15 },
  { name: 'Thu', appointments: 22 },
  { name: 'Fri', appointments: 18 },
  { name: 'Sat', appointments: 8 },
  { name: 'Sun', appointments: 5 },
];

const pieData = [
  { name: 'Completed', value: 65, color: '#10B981' },
  { name: 'Pending', value: 20, color: '#F59E0B' },
  { name: 'Cancelled', value: 15, color: '#EF4444' },
];

const upcomingAppointments = [
  {
    id: 1,
    patient: 'Ahmed Al-Rashid',
    time: '10:00 AM',
    status: 'confirmed',
    avatar: 'AR',
    type: 'General Checkup',
  },
  {
    id: 2,
    patient: 'Fatima Hassan',
    time: '11:30 AM', 
    status: 'pending',
    avatar: 'FH',
    type: 'Consultation',
  },
  {
    id: 3,
    patient: 'Mohammed Ali',
    time: '02:00 PM',
    status: 'confirmed',
    avatar: 'MA',
    type: 'Follow-up',
  },
  {
    id: 4,
    patient: 'Sara Ahmed',
    time: '03:30 PM', 
    status: 'pending',
    avatar: 'SA',
    type: 'Dental Checkup',
  },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
}> = ({ title, value, icon, color, change, trend }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
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
        {change && (
          <Chip
            size="small"
            label={change}
            sx={{
              backgroundColor: trend === 'up' ? '#10B98115' : '#EF444415',
              color: trend === 'up' ? '#10B981' : '#EF4444',
              fontWeight: 600,
            }}
          />
        )}
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
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
              {t('welcome_back')} Dr. Ahmed! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('dashboard_subtitle')} Here's what's happening at your clinic today.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('appointments_today')}
                value="21"
                icon={<CalendarToday />}
                color="#3B82F6"
                change="+12%"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('new_patients')}
                value="3"
                icon={<PersonAdd />}
                color="#10B981"
                change="+5%"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('completed_appointments')}
                value="18"
                icon={<CheckCircle />}
                color="#F59E0B"
                change="-3%"
                trend="down"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('total_revenue')}
                value="$2,450"
                icon={<TrendingUp />}
                color="#8B5CF6"
                change="+8%"
                trend="up"
              />
            </Grid>
          </Grid>

          {/* Charts and Tables Row */}
          <Grid container spacing={3}>
            {/* Appointments Chart */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    {t('weekly_appointments')}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="appointments" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Distribution */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    {t('appointment_status')}
                  </Typography>
                  <Box sx={{ height: 200, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box>
                    {pieData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Appointments */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('upcoming_appointments')}
                    </Typography>
                    <Chip label={`${upcomingAppointments.length} ${t('appointments')}`} variant="outlined" />
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('time')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('type')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingAppointments.map((appointment) => (
                          <TableRow key={appointment.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {appointment.avatar}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>
                                  {appointment.patient}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Schedule sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                                <Typography variant="body2">{appointment.time}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.type}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t(appointment.status)}
                                color={getStatusColor(appointment.status) as any}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage; 