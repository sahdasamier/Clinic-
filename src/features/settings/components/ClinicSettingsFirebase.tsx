import React from 'react';
import { useTranslation } from 'react-i18next';
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
  Switch,
  FormControlLabel,
  Slider,
  CircularProgress,
  InputAdornment,
  Chip,
  Alert
} from '@mui/material';
import {
  Business,
  Phone,
  Email,
  LocationOn,
  Web,
  Language,
  Schedule,
  AccessTime,
  Payment,
  Notifications,
  Save,
  CloudSync,
  WifiOff,
  Refresh
} from '@mui/icons-material';
import { useFirebaseForm } from '../../../hooks/useFirebaseForm';
import { FIREBASE_COLLECTIONS } from '../../../types/firebase';
import { commonValidationRules } from '../../../utils/validation';
import { getTextFieldValidationProps } from '../../../theme/validationTheme';

interface ClinicSettingsFirebaseProps {
  clinicId?: string;
}

const ClinicSettingsFirebase: React.FC<ClinicSettingsFirebaseProps> = ({ clinicId }) => {
  const { t } = useTranslation();

  // ✅ Use Firebase-enabled clinic settings hook
  const {
    data: formData,
    updateField,
    errors,
    isValid,
    isLoading,
    isSaving,
    isDirty,
    isOnline,
    lastSynced,
    saveData,
    saveLocally,
    resetForm,
    syncWithFirebase
  } = useFirebaseForm({
    collection: FIREBASE_COLLECTIONS.CLINICS,
    documentId: clinicId,
    initialData: {
      name: '',
      address: '',
      phone: '',
      email: '',
      workingHours: '',
      timezone: '',
      licenseNumber: '',
      website: '',
      description: '',
      appointmentDuration: 30,
      breakBetweenAppointments: 15,
      advanceBookingLimit: 30,
      allowOnlineBooking: false,
      requirePaymentAtBooking: false,
      sendReminders: false
    },
    validationRules: {
      name: { required: true, minLength: 2, maxLength: 100 },
      address: { required: true, minLength: 10, maxLength: 200 },
      phone: commonValidationRules.phone,
      email: commonValidationRules.email,
      workingHours: { required: true, maxLength: 100 },
      timezone: { required: true },
      licenseNumber: { required: true, minLength: 5, maxLength: 20 },
      website: { 
        custom: (value: string) => {
          if (value && !/^https?:\/\/.+/.test(value)) {
            return 'Please enter a valid URL (http:// or https://)';
          }
          return true;
        }
      },
      description: { maxLength: 500 },
      appointmentDuration: { 
        required: true,
        custom: (value: number) => {
          if (value < 15 || value > 120) {
            return 'Appointment duration must be between 15 and 120 minutes';
          }
          return true;
        }
      },
      breakBetweenAppointments: { 
        custom: (value: number) => {
          if (value < 0 || value > 60) {
            return 'Break time must be between 0 and 60 minutes';
          }
          return true;
        }
      },
      advanceBookingLimit: { 
        required: true,
        custom: (value: number) => {
          if (value < 1 || value > 365) {
            return 'Advance booking limit must be between 1 and 365 days';
          }
          return true;
        }
      },
      allowOnlineBooking: { required: true },
      requirePaymentAtBooking: { required: true },
      sendReminders: { required: true }
    },
    enableRealTimeSync: true
  });

  const timezones = [
    'UTC',
    'Africa/Cairo',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Dubai',
    'Asia/Tokyo'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveData();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        color: 'white',
        borderRadius: 4
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <Business sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Clinic Settings
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  🏥 Configure your clinic information and preferences
                </Typography>
              </Box>
            </Box>

            {/* Firebase Status Indicators */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isOnline ? (
                  <Chip
                    icon={<CloudSync />}
                    label="Online"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                  />
                ) : (
                  <Chip
                    icon={<WifiOff />}
                    label="Offline"
                    variant="outlined"
                    color="warning"
                    sx={{ color: 'white', borderColor: 'rgba(255,193,7,0.5)' }}
                  />
                )}
              </Box>
              {lastSynced && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Last synced: {lastSynced.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          Loading clinic settings from cloud...
        </Alert>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <WifiOff sx={{ mr: 1 }} />
          You're offline. Changes will be saved locally and synced when you're back online.
          <Button
            size="small"
            onClick={syncWithFirebase}
            sx={{ ml: 2 }}
            startIcon={<Refresh />}
          >
            Try to sync now
          </Button>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  🏢 Basic Information
                </Typography>

                <Grid container spacing={3}>
                  {/* Clinic Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...getTextFieldValidationProps(errors.name, isValid)}
                      fullWidth
                      label="Clinic Name"
                      value={formData.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* License Number */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...getTextFieldValidationProps(errors.licenseNumber, isValid)}
                      fullWidth
                      label="License Number"
                      value={formData.licenseNumber || ''}
                      onChange={(e) => updateField('licenseNumber', e.target.value)}
                      required
                    />
                  </Grid>

                  {/* Address */}
                  <Grid item xs={12}>
                    <TextField
                      {...getTextFieldValidationProps(errors.address, isValid)}
                      fullWidth
                      label="Clinic Address"
                      multiline
                      rows={3}
                      value={formData.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Phone and Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...getTextFieldValidationProps(errors.phone, isValid)}
                      fullWidth
                      label="Clinic Phone"
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      {...getTextFieldValidationProps(errors.email, isValid)}
                      fullWidth
                      label="Clinic Email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Website */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...getTextFieldValidationProps(errors.website, isValid)}
                      fullWidth
                      label="Website"
                      value={formData.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Web sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Timezone */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.timezone}>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={formData.timezone || ''}
                        label="Timezone"
                        onChange={(e) => updateField('timezone', e.target.value)}
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <Language sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        }
                      >
                        {timezones.map((tz) => (
                          <MenuItem key={tz} value={tz}>
                            {tz}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.timezone && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.timezone}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      {...getTextFieldValidationProps(errors.description, isValid)}
                      fullWidth
                      label="Clinic Description"
                      multiline
                      rows={4}
                      value={formData.description || ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Describe your clinic services and specialties"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointment Settings */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  📅 Appointment Settings
                </Typography>

                <Grid container spacing={3}>
                  {/* Working Hours */}
                  <Grid item xs={12}>
                    <TextField
                      {...getTextFieldValidationProps(errors.workingHours, isValid)}
                      fullWidth
                      label="Working Hours"
                      value={formData.workingHours || ''}
                      onChange={(e) => updateField('workingHours', e.target.value)}
                      required
                      placeholder="Monday-Friday: 9:00 AM - 5:00 PM"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Schedule sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Appointment Duration */}
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>
                      Appointment Duration: {formData.appointmentDuration || 30} minutes
                    </Typography>
                    <Slider
                      value={formData.appointmentDuration || 30}
                      onChange={(_, value) => updateField('appointmentDuration', value as number)}
                      min={15}
                      max={120}
                      step={15}
                      marks={[
                        { value: 15, label: '15min' },
                        { value: 30, label: '30min' },
                        { value: 60, label: '1hr' },
                        { value: 120, label: '2hr' }
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Grid>

                  {/* Break Between Appointments */}
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>
                      Break Between Appointments: {formData.breakBetweenAppointments || 15} minutes
                    </Typography>
                    <Slider
                      value={formData.breakBetweenAppointments || 15}
                      onChange={(_, value) => updateField('breakBetweenAppointments', value as number)}
                      min={0}
                      max={60}
                      step={5}
                      marks={[
                        { value: 0, label: '0min' },
                        { value: 15, label: '15min' },
                        { value: 30, label: '30min' },
                        { value: 60, label: '1hr' }
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Grid>

                  {/* Advance Booking Limit */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...getTextFieldValidationProps(errors.advanceBookingLimit, isValid)}
                      fullWidth
                      label="Advance Booking Limit (Days)"
                      type="number"
                      value={formData.advanceBookingLimit || 30}
                      onChange={(e) => updateField('advanceBookingLimit', parseInt(e.target.value) || 30)}
                      required
                      inputProps={{ min: 1, max: 365 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTime sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Preferences */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  ⚙️ Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.allowOnlineBooking || false}
                          onChange={(e) => updateField('allowOnlineBooking', e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Language />
                          Allow Online Booking
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.requirePaymentAtBooking || false}
                          onChange={(e) => updateField('requirePaymentAtBooking', e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Payment />
                          Require Payment at Booking
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.sendReminders || false}
                          onChange={(e) => updateField('sendReminders', e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Notifications />
                          Send Appointment Reminders
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={isLoading || isSaving}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Reset
              </Button>
              
              {!isOnline && (
                <Button
                  variant="outlined"
                  onClick={saveLocally}
                  disabled={!isValid || isSaving}
                  startIcon={<Save />}
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  Save Offline
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  px: 4,
                  minWidth: 140
                }}
              >
                {isSaving ? 'Saving...' : isOnline ? 'Save Settings' : 'Save When Online'}
              </Button>
            </Box>
          </Grid>

          {/* Status Indicators */}
          {isDirty && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                💾 Changes are automatically saved as drafts
              </Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </Container>
  );
};

export default ClinicSettingsFirebase; 