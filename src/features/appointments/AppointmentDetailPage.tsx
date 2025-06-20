import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  LocalHospital,
  LocationOn,
  Phone,
  Edit,
  Print,
  Share,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';

const AppointmentDetailPage: React.FC = () => {
  const { t } = useTranslation();

  // Sample appointment data
  const appointment = {
    id: 1,
    patient: 'Ali Ahmed',
    patientAvatar: 'AA',
    date: '2024-07-20',
    time: '10:30 AM',
    doctor: 'Dr. Smith',
    status: 'confirmed' as const,
    type: 'consultation',
    priority: 'normal' as const,
    duration: 30,
    location: 'Room 101',
    phone: '+971 50 123 4567',
    notes: 'Patient is coming for a regular check-up. Previous history of diabetes.',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-16T14:30:00Z'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F59E0B';
      case 'urgent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'rescheduled': return <Schedule />;
      default: return <AccessTime />;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Card sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      fontSize: '2rem',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {appointment.patientAvatar}
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {t('appointment_details')}
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>
                      {appointment.patient}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        icon={getStatusIcon(appointment.status)}
                        label={t(appointment.status)}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          borderRadius: 2
                        }}
                      />
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {t('appointment_id')}: #{appointment.id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Tooltip title={t('edit_appointment')}>
                    <IconButton
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('print_details')}>
                    <IconButton
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <Print />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('share_appointment')}>
                    <IconButton
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <Share />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
            <Box sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 1,
            }} />
          </Card>

          <Grid container spacing={4}>
            {/* Main Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ color: 'primary.main' }} />
                    {t('appointment_information')}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Person sx={{ color: 'primary.main', mr: 2 }} />
                          <Typography variant="h6" color="primary.main" fontWeight={600}>
                            {t('patient_information')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {appointment.patient}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone fontSize="small" />
                          {appointment.phone}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3, backgroundColor: '#f0f7ff', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarToday sx={{ color: 'info.main', mr: 2 }} />
                          <Typography variant="h6" color="info.main" fontWeight={600}>
                            {t('date_time')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {new Date(appointment.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" />
                          {appointment.time} ({appointment.duration} {t('minutes')})
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3, backgroundColor: '#f0fff4', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocalHospital sx={{ color: 'success.main', mr: 2 }} />
                          <Typography variant="h6" color="success.main" fontWeight={600}>
                            {t('medical_details')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {appointment.doctor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(appointment.type)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3, backgroundColor: '#fff7ed', borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationOn sx={{ color: 'warning.main', mr: 2 }} />
                          <Typography variant="h6" color="warning.main" fontWeight={600}>
                            {t('location_priority')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {appointment.location}
                        </Typography>
                        <Chip
                          label={t(appointment.priority)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: getPriorityColor(appointment.priority),
                            color: getPriorityColor(appointment.priority)
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  {/* Notes Section */}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {t('appointment_notes')}
                    </Typography>
                    <Paper sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {appointment.notes || t('no_notes_available')}
                      </Typography>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status & Actions */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                {/* Status Card */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        {t('current_status')}
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Chip
                          icon={getStatusIcon(appointment.status)}
                          label={t(appointment.status)}
                          color={getStatusColor(appointment.status) as any}
                          size="medium"
                          sx={{ 
                            fontSize: '1rem',
                            fontWeight: 600,
                            px: 2,
                            py: 1
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('status_description', { status: t(appointment.status) })}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          startIcon={<CheckCircle />}
                          sx={{ 
                            borderRadius: 3,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          {t('mark_as_completed')}
                        </Button>
                        <Button 
                          variant="outlined" 
                          fullWidth
                          startIcon={<Edit />}
                          sx={{ borderRadius: 3, py: 1.5 }}
                        >
                          {t('reschedule')}
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          fullWidth
                          startIcon={<Cancel />}
                          sx={{ borderRadius: 3, py: 1.5 }}
                        >
                          {t('cancel_appointment')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Timeline Card */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        {t('appointment_timeline')}
                      </Typography>
                      
                      <Box sx={{ position: 'relative', pl: 3 }}>
                        {/* Timeline line */}
                        <Box sx={{
                          position: 'absolute',
                          left: 8,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          backgroundColor: 'primary.main',
                          opacity: 0.3
                        }} />
                        
                        {/* Timeline items */}
                        <Box sx={{ position: 'relative', mb: 3 }}>
                          <Box sx={{
                            position: 'absolute',
                            left: -11,
                            top: 0,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: 'success.main',
                            border: '3px solid white',
                            boxShadow: '0 0 0 2px #4CAF50'
                          }} />
                          <Typography variant="body2" fontWeight={600}>
                            {t('appointment_created')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(appointment.createdAt).toLocaleDateString()} {new Date(appointment.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>

                        <Box sx={{ position: 'relative', mb: 3 }}>
                          <Box sx={{
                            position: 'absolute',
                            left: -11,
                            top: 0,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: 'info.main',
                            border: '3px solid white',
                            boxShadow: '0 0 0 2px #2196F3'
                          }} />
                          <Typography variant="body2" fontWeight={600}>
                            {t('last_updated')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(appointment.updatedAt).toLocaleDateString()} {new Date(appointment.updatedAt).toLocaleTimeString()}
                          </Typography>
                        </Box>

                        <Box sx={{ position: 'relative' }}>
                          <Box sx={{
                            position: 'absolute',
                            left: -11,
                            top: 0,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: 'warning.main',
                            border: '3px solid white',
                            boxShadow: '0 0 0 2px #FF9800'
                          }} />
                          <Typography variant="body2" fontWeight={600}>
                            {t('upcoming_appointment')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.date} {t('at')} {appointment.time}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AppointmentDetailPage;