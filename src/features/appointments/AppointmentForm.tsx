import React, { useState, useEffect } from 'react';
import { usePersistentForm } from '../../hooks/usePersistentForm';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  InputAdornment,
  Snackbar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AccessTime,
  MedicalServices,
  Notes,
  CheckCircle,
  Phone,
  LocationOn
} from '@mui/icons-material';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import { createAppointment, type AppointmentFormData as ApiAppointmentFormData } from '../../api/appointments';
import { getDoctorsByClinic } from '../../api/doctorPatients';
import { UserData } from '../../api/auth';
import { testPaymentNotificationSystem } from '../../utils/paymentUtils';

interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: number;
  doctor: string;
  location: string;
  priority: string;
  notes: string;
}

const AppointmentForm: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useUser();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<UserData[]>([]);
  // ✅ Use persistent form hook for data persistence
  const defaultFormData: AppointmentFormData = {
    patientName: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    duration: 30,
    doctor: '',
    location: '',
    priority: 'normal',
    notes: ''
  };

  const { 
    formData, 
    updateField, 
    handleSave, 
    resetForm: clearForm, 
    isDirty,
    lastSaved 
  } = usePersistentForm('appointmentForm', defaultFormData, { 
    autoSave: true, 
    autoSaveDelay: 2000 
  });

  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});

  useEffect(() => {
    const loadDoctors = async () => {
      if (!userProfile?.clinicId) return;
      
      try {
        const doctors = await getDoctorsByClinic(userProfile.clinicId);
        setDoctors(doctors);
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    loadDoctors();
  }, [userProfile?.clinicId]);

  const steps = [
    {
      label: t('patient_information'),
      icon: <Person />
    },
    {
      label: t('appointment_details'),
      icon: <CalendarToday />
    },
    {
      label: t('additional_information'),
      icon: <Notes />
    },
    {
      label: t('confirmation'),
      icon: <CheckCircle />
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<AppointmentFormData> = {};
    
    switch (step) {
      case 0:
        if (!formData.patientName) newErrors.patientName = t('patient_name_required');
        if (!formData.patientPhone) newErrors.patientPhone = t('phone_required');
        break;
      case 1:
        if (!formData.appointmentDate) newErrors.appointmentDate = t('date_required');
        if (!formData.appointmentTime) newErrors.appointmentTime = t('time_required');
        if (!formData.appointmentType) newErrors.appointmentType = t('type_required');
        if (!formData.doctor) newErrors.doctor = t('doctor_required');
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
 
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
 
  const handleSubmit = async () => {
    if (!validateStep(activeStep - 1)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert form data to API format
      const appointmentData: ApiAppointmentFormData = {
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        doctorName: formData.doctor,
        date: formData.appointmentDate,
        time: formData.appointmentTime,
        type: formData.appointmentType,
        duration: formData.duration,
        location: formData.location,
        priority: formData.priority as 'normal' | 'high' | 'urgent',
        notes: formData.notes
      };

      const createdAppointment = await createAppointment(appointmentData);
      setSuccess(true);
      
      console.log('✅ Appointment created successfully');
      
      // ✅ Reset form using persistent form hook
      clearForm();
      setActiveStep(0);
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError(error instanceof Error ? error.message : 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };
 
  const updateFormData = (field: keyof AppointmentFormData, value: string | number) => {
    updateField(field, value);
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
 
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('patient_info_step_description')}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('patient_name')}
                value={formData.patientName}
                onChange={(e) => updateFormData('patientName', e.target.value)}
                error={!!errors.patientName}
                helperText={errors.patientName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('phone_number')}
                value={formData.patientPhone}
                onChange={(e) => updateFormData('patientPhone', e.target.value)}
                error={!!errors.patientPhone}
                helperText={errors.patientPhone}
                required
                placeholder={t('phone_placeholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              />
            </Grid>
          </Grid>
        );
 
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('appointment_details_step_description')}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('appointment_date')}
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => updateFormData('appointmentDate', e.target.value)}
                error={!!errors.appointmentDate}
                helperText={errors.appointmentDate}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('appointment_time')}
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => updateFormData('appointmentTime', e.target.value)}
                error={!!errors.appointmentTime}
                helperText={errors.appointmentTime}
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={!!errors.appointmentType}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              >
                <InputLabel>{t('appointment_type')}</InputLabel>
                <Select
                  value={formData.appointmentType}
                  label={t('appointment_type')}
                  onChange={(e) => updateFormData('appointmentType', e.target.value)}
                  required
                >
                  <MenuItem value="consultation">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MedicalServices fontSize="small" color="primary" />
                      {t('consultation')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="check_up">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" color="success" />
                      {t('check_up')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="follow_up">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="warning" />
                      {t('follow_up')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="surgery_consultation">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MedicalServices fontSize="small" color="error" />
                      {t('surgery_consultation')}
                    </Box>
                  </MenuItem>
                </Select>
                {errors.appointmentType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.appointmentType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={!!errors.doctor}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              >
                <InputLabel>{t('doctor')}</InputLabel>
                <Select
                  value={formData.doctor}
                  label={t('doctor')}
                  onChange={(e) => updateFormData('doctor', e.target.value)}
                  required
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={`${doctor.firstName} ${doctor.lastName}`}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.role})
                    </MenuItem>
                  ))}
                </Select>
                {errors.doctor && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.doctor}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              >
                <InputLabel>{t('duration')}</InputLabel>
                <Select
                  value={formData.duration}
                  label={t('duration')}
                  onChange={(e) => updateFormData('duration', Number(e.target.value))}
                >
                  <MenuItem value={15}>{t('duration_minutes', { minutes: 15 })}</MenuItem>
                  <MenuItem value={30}>{t('duration_minutes', { minutes: 30 })}</MenuItem>
                  <MenuItem value={45}>{t('duration_minutes', { minutes: 45 })}</MenuItem>
                  <MenuItem value={60}>{t('duration_hour', { hours: 1 })}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
 
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('additional_info_step_description')}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('location_room')}
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder={t('location_placeholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              >
                <InputLabel>{t('priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  label={t('priority')}
                  onChange={(e) => updateFormData('priority', e.target.value)}
                >
                  <MenuItem value="normal">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🟢 {t('normal')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🟡 {t('high_priority')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="urgent">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔴 {t('urgent')}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('additional_notes')}
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder={t('notes_placeholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Notes sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3 
                  }
                }}
              />
            </Grid>
          </Grid>
        );
 
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                {t('confirmation_step_description')}
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                  📅 {t('appointment_summary')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('patient_name')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.patientName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('phone_number')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.patientPhone}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('appointment_date')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(formData.appointmentDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('appointment_time')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.appointmentTime}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('appointment_type')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {t(formData.appointmentType)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('doctor')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.doctor.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('duration')}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.duration} {t('minutes')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('priority')}
                      </Typography>
                      <Chip
                        label={t(formData.priority)}
                        size="small"
                        color={formData.priority === 'urgent' ? 'error' : formData.priority === 'high' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  {formData.location && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('location')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formData.location}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {formData.notes && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('notes')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formData.notes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );
 
      default:
        return null;
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                  <CalendarToday sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {t('book_edit_appointment')}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    📝 {t('appointment_form_description')}
                  </Typography>
                  
                  {/* ✅ Data persistence status indicator */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDirty ? (
                      <Chip
                        label="⏳ Auto-saving..."
                        size="small"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                      />
                    ) : lastSaved ? (
                      <Chip
                        label="✅ Saved"
                        size="small"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                      />
                    ) : null}
                  </Box>
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
 
          {/* Stepper Form */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      icon={step.icon}
                      sx={{
                        '& .MuiStepLabel-iconContainer': {
                          '& .MuiSvgIcon-root': {
                            color: activeStep >= index ? 'primary.main' : 'text.secondary',
                            fontSize: '1.5rem'
                          }
                        }
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mt: 2, mb: 4 }}>
                        {renderStepContent(index)}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          variant="outlined"
                          sx={{ borderRadius: 3 }}
                        >
                          {t('back')}
                        </Button>
                        {index === steps.length - 1 ? (
                          <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ 
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              px: 4
                            }}
                          >
                            {loading ? (
                              <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                {t('saving')}
                              </>
                            ) : (
                              t('save_appointment')
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ 
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}
                          >
                            {t('next')}
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Container>
      </Box>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {t('appointment_saved_successfully')}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error || t('appointment_save_failed')}
        </Alert>
      </Snackbar>

      {/* Test Payment Notification Button */}
      <Tooltip title="Test Payment Notification System" placement="left">
        <Button
          variant="contained"
          onClick={() => testPaymentNotificationSystem()}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            borderRadius: '50%',
            width: 64,
            height: 64,
            minWidth: 64,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
            zIndex: 1000,
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 48px rgba(16, 185, 129, 0.6)',
            },
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🔔
        </Button>
      </Tooltip>
    </Box>
  );
 };
 
 export default AppointmentForm;