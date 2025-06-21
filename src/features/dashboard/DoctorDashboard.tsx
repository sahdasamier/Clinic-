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
  Divider,
  Paper,
} from '@mui/material';
import {
  CalendarToday,
  People,
  CheckCircle,
  Schedule,
  PersonAdd,
  MedicalServices,
  Assignment,
  TrendingUp,
  AccessTime,
  Phone,
  Email,
  Visibility,
  Edit,
  Add,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';


import {
  doctorDashboardPatientsData,
  doctorDashboardMyPatients,
  doctorDashboardTodaysAppointments,
  doctorDashboardRecentActivity,
} from '../../data/mockData';



const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
}> = ({ title, value, icon, color, change, trend }) => (
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

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation();
  
  // State management for dashboard data
  const [patientsData, setPatientsData] = useState(doctorDashboardPatientsData);
  const [myPatients, setMyPatients] = useState(doctorDashboardMyPatients);
  const [todaysAppointments, setTodaysAppointments] = useState(doctorDashboardTodaysAppointments);
  const [recentActivity, setRecentActivity] = useState(doctorDashboardRecentActivity);

  // Reset functionality
  useEffect(() => {
    const handleUserDataCleared = () => {
      // Reset to default data
      setPatientsData(doctorDashboardPatientsData);
      setMyPatients(doctorDashboardMyPatients);
      setTodaysAppointments(doctorDashboardTodaysAppointments);
      setRecentActivity(doctorDashboardRecentActivity);
      console.log('✅ Doctor Dashboard reset to default state');
    };

    window.addEventListener('userDataCleared', handleUserDataCleared);
    
    return () => {
      window.removeEventListener('userDataCleared', handleUserDataCleared);
    };
  }, []);

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'success';
      case 'monitoring':
        return 'warning';
      case 'follow-up':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              {t('good_morning_doctor')} 👨‍⚕️
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('appointments_and_followups')}
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('todays_patients')}
                value="8"
                icon={<People />}
                color="#3B82F6"
                change="+2"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('active_treatments')}
                value="24"
                icon={<MedicalServices />}
                color="#10B981"
                change="+3"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('completed_consultations')}
                value="156"
                icon={<CheckCircle />}
                color="#F59E0B"
                change="+12%"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('reports_to_review')}
                value="5"
                icon={<Assignment />}
                color="#8B5CF6"
                change="-2"
                trend="down"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Patient Analytics */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('weekly_patient_overview')}
                    </Typography>
                                          <Button variant="outlined" size="small" startIcon={<TrendingUp />}>
                        {t('view_analytics')}
                      </Button>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patientsData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="patients" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              {/* My Patients */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('my_patients')}
                    </Typography>
                    <Button variant="contained" size="small" startIcon={<Add />}>
                      {t('add_patient')}
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('patient_age')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('patient_condition')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('table_actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myPatients.map((patient) => (
                          <TableRow key={patient.id} hover>
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
                                  {patient.avatar}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('next')}: {patient.nextAppointment}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{patient.age} {t('years')}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {patient.condition}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{patient.lastVisit}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={patient.status}
                                color={getPatientStatusColor(patient.status) as any}
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
                                <Phone fontSize="small" />
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

            {/* Right Sidebar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Today's Schedule */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t('todays_schedule')}
                      </Typography>
                      <IconButton size="small">
                        <CalendarToday fontSize="small" />
                      </IconButton>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {todaysAppointments.map((appointment, index) => (
                        <React.Fragment key={appointment.id}>
                          <ListItem sx={{ px: 0, py: 1.5 }}>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: 'primary.main',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {appointment.avatar}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={appointment.patient}
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {appointment.type} • {appointment.duration}
                                  </Typography>
                                </Box>
                              }
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {appointment.time}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < todaysAppointments.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                    <Button variant="text" size="small" fullWidth sx={{ mt: 2 }}>
                      {t('view_full_schedule')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {t('quick_actions')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add />}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('add_new_patient')}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Schedule />}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('schedule_appointment')}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Assignment />}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('create_prescription')}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<MedicalServices />}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('medical_records_quick_action')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {t('recent_activity')}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {recentActivity.map((activity) => (
                        <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: activity.color }}>
                              {activity.icon === 'CheckCircle' && <CheckCircle fontSize="small" />}
                              {activity.icon === 'Assignment' && <Assignment fontSize="small" />}
                              {activity.icon === 'Schedule' && <Schedule fontSize="small" />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={t(activity.type)}
                            secondary={`${activity.patient} • ${activity.timeAgo} ${t('hours_ago')}`}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
  );
};

export default DoctorDashboard; 