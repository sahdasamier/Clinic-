import React from 'react';
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
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

// Mock data for doctor dashboard
const patientsData = [
  { name: 'Mon', patients: 15 },
  { name: 'Tue', patients: 22 },
  { name: 'Wed', patients: 18 },
  { name: 'Thu', patients: 25 },
  { name: 'Fri', patients: 20 },
  { name: 'Sat', patients: 12 },
  { name: 'Sun', patients: 8 },
];

const myPatients = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    age: 45,
    condition: 'Diabetes',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-20',
    avatar: 'AR',
    status: 'stable',
  },
  {
    id: 2,
    name: 'Fatima Hassan',
    age: 32,
    condition: 'Hypertension',
    lastVisit: '2024-01-08',
    nextAppointment: '2024-01-18',
    avatar: 'FH',
    status: 'monitoring',
  },
  {
    id: 3,
    name: 'Mohammed Ali',
    age: 28,
    condition: 'Asthma',
    lastVisit: '2024-01-05',
    nextAppointment: '2024-01-15',
    avatar: 'MA',
    status: 'follow-up',
  },
];

const todaysAppointments = [
  {
    id: 1,
    time: '09:00',
    patient: 'Omar Khalil',
    type: 'Consultation',
    duration: '30 min',
    avatar: 'OK',
  },
  {
    id: 2,
    time: '10:00',
    patient: 'Sara Ahmed',
    type: 'Follow-up',
    duration: '20 min',
    avatar: 'SA',
  },
  {
    id: 3,
    time: '11:00',
    patient: 'Ali Hassan',
    type: 'Check-up',
    duration: '45 min',
    avatar: 'AH',
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
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Good morning, Dr. Ahmed! 👨‍⚕️
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have 8 appointments today and 3 follow-ups pending.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Patients"
                value="8"
                icon={<People />}
                color="#3B82F6"
                change="+2"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Treatments"
                value="24"
                icon={<MedicalServices />}
                color="#10B981"
                change="+3"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed Consultations"
                value="156"
                icon={<CheckCircle />}
                color="#F59E0B"
                change="+12%"
                trend="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Reports to Review"
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
                      Weekly Patient Overview
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<TrendingUp />}>
                      View Analytics
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
                      My Patients
                    </Typography>
                    <Button variant="contained" size="small" startIcon={<Add />}>
                      Add Patient
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Last Visit</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                                    Next: {patient.nextAppointment}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{patient.age} years</Typography>
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
                        Today's Schedule
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
                      View Full Schedule
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
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add />}
                        sx={{ textTransform: 'none' }}
                      >
                        Add New Patient
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Schedule />}
                        sx={{ textTransform: 'none' }}
                      >
                        Schedule Appointment
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Assignment />}
                        sx={{ textTransform: 'none' }}
                      >
                        Create Prescription
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<MedicalServices />}
                        sx={{ textTransform: 'none' }}
                      >
                        Medical Records
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Recent Activity
                    </Typography>
                    <List sx={{ p: 0 }}>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: 'success.main' }}>
                            <CheckCircle fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Consultation completed"
                          secondary="Ahmed Al-Rashid • 2 hours ago"
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: 'info.main' }}>
                            <Assignment fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Lab report reviewed"
                          secondary="Fatima Hassan • 4 hours ago"
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: 'warning.main' }}>
                            <Schedule fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Follow-up scheduled"
                          secondary="Mohammed Ali • 6 hours ago"
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    </List>
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

export default DoctorDashboard; 