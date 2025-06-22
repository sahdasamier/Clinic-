import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import { getDoctorsByClinic } from '../../api/doctorPatients';
import { UserData } from '../../api/auth';
import { createAppointment } from '../../api/appointments';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  Add,
  Event,
  Schedule,
  Person
} from '@mui/icons-material';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  clinicId?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, isEdit = false, clinicId }) => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<UserData[]>([]);
  const [appointmentData, setAppointmentData] = useState({
    patientName: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    doctor: '',
    duration: 30,
    notes: ''
  });

  // Load doctors when modal opens
  useEffect(() => {
    const loadDoctors = async () => {
      if (!clinicId || !isOpen) return;
      
      try {
        const doctorsData = await getDoctorsByClinic(clinicId);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    
    loadDoctors();
  }, [clinicId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appointmentPayload = {
        patientName: appointmentData.patientName,
        patientPhone: '', // Could add phone field if needed
        doctorName: appointmentData.doctor,
        date: appointmentData.appointmentDate,
        time: appointmentData.appointmentTime,
        type: appointmentData.appointmentType,
        duration: appointmentData.duration,
        location: '', // Could add location field if needed
        priority: 'normal' as const,
        notes: appointmentData.notes
      };

      await createAppointment(appointmentPayload);
      console.log('✅ Appointment created successfully');
      
      // Reset form
      setAppointmentData({
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: '',
        doctor: '',
        duration: 30,
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      // Could add snackbar notification here
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarToday sx={{ color: 'primary.main' }} />
          <Typography variant="h6">
            {isEdit ? t('edit_appointment') : t('create_appointment')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('patient_name')}
                value={appointmentData.patientName}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, patientName: e.target.value }))}
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('appointment_date')}
                type="date"
                value={appointmentData.appointmentDate}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('appointment_time')}
                type="time"
                value={appointmentData.appointmentTime}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('appointment_type')}</InputLabel>
                <Select
                  value={appointmentData.appointmentType}
                  label={t('appointment_type')}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, appointmentType: e.target.value }))}
                  required
                >
                  <MenuItem value="consultation">{t('consultation')}</MenuItem>
                  <MenuItem value="check_up">{t('check_up')}</MenuItem>
                  <MenuItem value="follow_up">{t('follow_up')}</MenuItem>
                  <MenuItem value="surgery_consultation">{t('surgery_consultation')}</MenuItem>
                  <MenuItem value="emergency">{t('emergency')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('doctor')}</InputLabel>
                <Select
                  value={appointmentData.doctor}
                  label={t('doctor')}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, doctor: e.target.value }))}
                  required
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={`${doctor.firstName} ${doctor.lastName}`}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('duration')}</InputLabel>
                <Select
                  value={appointmentData.duration}
                  label={t('duration')}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                >
                  <MenuItem value={15}>{t('duration_minutes', { minutes: 15 })}</MenuItem>
                  <MenuItem value={30}>{t('duration_minutes', { minutes: 30 })}</MenuItem>
                  <MenuItem value={45}>{t('duration_minutes', { minutes: 45 })}</MenuItem>
                  <MenuItem value={60}>{t('duration_hour', { hours: 1 })}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('notes')}
                multiline
                rows={3}
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('appointment_notes_placeholder')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          {t('cancel')}
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 4
          }}
        >
          {t('save_appointment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
 };
 
 const AppointmentCalendarPage: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
 
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
              <Box sx={{ display: 'flex', items: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '20px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Event sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {t('appointment_calendar')}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      📅 {t('calendar_view_description')}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setModalOpen(true)}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('create_appointment')}
                </Button>
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
 
          {/* Calendar Container */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center', minHeight: 400 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 300
              }}>
                <CalendarToday sx={{ 
                  fontSize: 80, 
                  color: 'primary.main', 
                  mb: 3,
                  opacity: 0.7
                }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {t('calendar_coming_soon')}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                  {t('calendar_description')}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3, maxWidth: 500 }}>
                  <Typography variant="body2">
                    {t('calendar_integration_note')}
                  </Typography>
                </Alert>
 
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip 
                    label={t('monthly_view')} 
                    variant="outlined" 
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  />
                  <Chip 
                    label={t('weekly_view')} 
                    variant="outlined" 
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  />
                  <Chip 
                    label={t('daily_view')} 
                    variant="outlined" 
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  />
                  <Chip 
                    label={t('agenda_view')} 
                    variant="outlined" 
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
        
        <AppointmentModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)}
          clinicId={userProfile?.clinicId}
        />
      </Box>
    </Box>
  );
 };
 
 export default AppointmentCalendarPage;