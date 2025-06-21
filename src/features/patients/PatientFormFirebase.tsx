import React, { useContext } from 'react';
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
  CircularProgress,
  InputAdornment,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Save,
  CloudSync,
  WifiOff,
  Refresh,
  CloudOff,
  Warning,
  CheckCircle,
  History
} from '@mui/icons-material';
import { useFirebaseForm } from '../../hooks/useFirebaseForm';
import { FIREBASE_COLLECTIONS } from '../../types/firebase';
import { commonValidationRules } from '../../utils/validation';
import { getTextFieldValidationProps } from '../../theme/validationTheme';

interface PatientFormFirebaseProps {
  patientId?: string; // For editing existing patient
  onSaveSuccess?: (patient: any) => void;
  onCancel?: () => void;
}

const PatientFormFirebase: React.FC<PatientFormFirebaseProps> = ({ 
  patientId, 
  onSaveSuccess, 
  onCancel 
}) => {
  const { t } = useTranslation();

  // Use persistent Firebase form hook
  const {
    data: patientData,
    updateField,
    errors,
    isValid,
    isLoading,
    isSaving,
    isDirty,
    isOnline,
    lastSynced,
    hasUnsavedChanges,
    saveData,
    saveLocally,
    syncWithFirebase,
    resetForm,
    clearLocalStorage,
    validateForm
  } = useFirebaseForm({
    collection: FIREBASE_COLLECTIONS.PATIENTS,
    documentId: patientId,
    initialData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      medicalHistory: ''
    },
    validationRules: {
      firstName: commonValidationRules.name,
      lastName: commonValidationRules.name,
      email: commonValidationRules.email,
      phone: commonValidationRules.phone,
      medicalHistory: { maxLength: 2000 }
    },
    enableRealTimeSync: false
  });

  const isEditing = !!patientId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.warn('Form validation failed');
      return;
    }

    const success = await saveData();
    if (success) {
      console.log('Patient saved successfully');
      onSaveSuccess?.(patientData);
    }
  };

  const handleSaveOffline = () => {
    if (validateForm()) {
      saveLocally();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section with Status */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
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
                <Person sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {isEditing ? 'Edit Patient' : 'Add New Patient'}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  👤 {isEditing ? 'Update patient information' : 'Enter patient details below'}
                </Typography>
              </Box>
            </Box>

            {/* Status Indicators */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Online/Offline Status */}
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

                {/* Unsaved Changes Indicator */}
                {hasUnsavedChanges && (
                  <Chip
                    icon={<Warning />}
                    label="Unsaved"
                    variant="outlined"
                    color="warning"
                    sx={{ color: 'white', borderColor: 'rgba(255,193,7,0.5)' }}
                  />
                )}

                {/* Sync Status */}
                {lastSynced && !hasUnsavedChanges && (
                  <Chip
                    icon={<CheckCircle />}
                    label="Synced"
                    variant="outlined"
                    color="success"
                    sx={{ color: 'white', borderColor: 'rgba(76,175,80,0.5)' }}
                  />
                )}
              </Box>

              {/* Last Sync Time */}
              {lastSynced && (
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <History sx={{ fontSize: 14 }} />
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
          Loading patient data from cloud...
        </Alert>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button
              size="small"
              onClick={syncWithFirebase}
              startIcon={<Refresh />}
              color="inherit"
            >
              Try to sync
            </Button>
          }
        >
          <CloudOff sx={{ mr: 1 }} />
          You're offline. Changes will be saved locally and synced when you're back online.
        </Alert>
      )}

      {/* Form */}
      <Card sx={{ 
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Patient Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  📝 Patient Information
                </Typography>
              </Grid>

              {/* First Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  {...getTextFieldValidationProps(errors.firstName, isValid)}
                  fullWidth
                  label="First Name *"
                  value={patientData.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText={errors.firstName || 'Enter patient\'s first name'}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  {...getTextFieldValidationProps(errors.lastName, isValid)}
                  fullWidth
                  label="Last Name *"
                  value={patientData.lastName || ''}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText={errors.lastName || 'Enter patient\'s last name'}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  {...getTextFieldValidationProps(errors.email, isValid)}
                  fullWidth
                  label="Email Address *"
                  type="email"
                  value={patientData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText={errors.email || 'Enter a valid email address'}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  {...getTextFieldValidationProps(errors.phone, isValid)}
                  fullWidth
                  label="Phone Number *"
                  value={patientData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  placeholder="+1 (555) 123-4567"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText={errors.phone || 'Enter phone number with country code'}
                />
              </Grid>

              {/* Medical History */}
              <Grid item xs={12}>
                <TextField
                  {...getTextFieldValidationProps(errors.medicalHistory, isValid)}
                  fullWidth
                  label="Medical History"
                  multiline
                  rows={6}
                  value={patientData.medicalHistory || ''}
                  onChange={(e) => updateField('medicalHistory', e.target.value)}
                  placeholder="Enter patient's medical history, allergies, current medications, previous surgeries, etc."
                  helperText={errors.medicalHistory || `${(patientData.medicalHistory || '').length}/2000 characters`}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {/* Cancel Button */}
                  {onCancel && (
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      disabled={isSaving}
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Cancel
                    </Button>
                  )}

                  {/* Reset Button */}
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    disabled={isLoading || isSaving || !isDirty}
                    sx={{ borderRadius: 3, px: 4 }}
                  >
                    Reset
                  </Button>

                  {/* Save Offline Button (when offline) */}
                  {!isOnline && (
                    <Button
                      variant="outlined"
                      onClick={handleSaveOffline}
                      disabled={!isValid || isSaving}
                      startIcon={<Save />}
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Save Offline
                    </Button>
                  )}

                  {/* Main Save Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || isSaving}
                    startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                    sx={{ 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      px: 4,
                      minWidth: 140
                    }}
                  >
                    {isSaving ? 'Saving...' : isOnline ? 'Save Patient' : 'Save When Online'}
                  </Button>
                </Box>
              </Grid>

              {/* Status Footer */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box>
                    {isDirty && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        💾 Changes are automatically saved as drafts
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Clear Cache Button */}
                    <Tooltip title="Clear all local data">
                      <IconButton
                        size="small"
                        onClick={clearLocalStorage}
                        disabled={isSaving}
                      >
                        <CloudOff fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Manual Sync Button */}
                    <Tooltip title="Sync with cloud">
                      <IconButton
                        size="small"
                        onClick={syncWithFirebase}
                        disabled={!isOnline || isSaving}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PatientFormFirebase; 