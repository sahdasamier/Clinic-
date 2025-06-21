import React, { useState } from 'react';
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
  InputAdornment,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Business,
  Phone,
  Email,
  LocationOn,
  Save
} from '@mui/icons-material';
import { usePersistentForm } from '../../hooks/usePersistentForm';

interface ClinicFormData {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  specialty: string;
  workingHours: string;
  description: string;
  website: string;
}

const ClinicForm: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Use persistent form hook for data persistence
  const defaultFormData: ClinicFormData = {
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    specialty: '',
    workingHours: '',
    description: '',
    website: ''
  };

  const { 
    formData, 
    updateField, 
    handleSave, 
    resetForm, 
    isDirty,
    lastSaved 
  } = usePersistentForm('clinicForm', defaultFormData, { 
    autoSave: true, 
    autoSaveDelay: 2000 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Save clinic clicked!');
    console.log('📋 Clinic data to save:', formData);
    
    // Basic validation
    if (!formData.clinicName || !formData.clinicAddress || !formData.clinicPhone || !formData.clinicEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save using persistent form hook
      const success = await handleSave();
      
      if (success) {
        setSuccess(true);
        console.log('✅ Clinic saved successfully');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setError('Failed to save clinic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Card sx={{ 
          mb: 4, 
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          color: 'white',
          borderRadius: 4
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Business sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </Box>
            
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              Clinic Registration
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
              🏥 Set up your clinic profile
            </Typography>
            
            {/* ✅ Data persistence status indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
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
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Clinic Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clinic Name *"
                    value={formData.clinicName}
                    onChange={(e) => updateField('clinicName', e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter your clinic's official name"
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clinic Address *"
                    multiline
                    rows={3}
                    value={formData.clinicAddress}
                    onChange={(e) => updateField('clinicAddress', e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Full address including street, city, and postal code"
                  />
                </Grid>

                {/* Phone and Email */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={formData.clinicPhone}
                    onChange={(e) => updateField('clinicPhone', e.target.value)}
                    required
                    placeholder="+1 (555) 123-4567"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Main contact number"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    value={formData.clinicEmail}
                    onChange={(e) => updateField('clinicEmail', e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Primary email address"
                  />
                </Grid>

                {/* Specialty and Working Hours */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Specialty"
                    value={formData.specialty}
                    onChange={(e) => updateField('specialty', e.target.value)}
                    placeholder="e.g., General Practice, Cardiology"
                    helperText="Primary medical specialty"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Working Hours"
                    value={formData.workingHours}
                    onChange={(e) => updateField('workingHours', e.target.value)}
                    placeholder="Mon-Fri 9:00 AM - 5:00 PM"
                    helperText="Operating hours"
                  />
                </Grid>

                {/* Website */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.yourclinic.com"
                    helperText="Clinic website URL (optional)"
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Brief description of your clinic and services"
                    helperText={`${formData.description.length}/500 characters`}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                      disabled={loading}
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Reset
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !formData.clinicName || !formData.clinicAddress || !formData.clinicPhone || !formData.clinicEmail}
                      startIcon={loading ? null : <Save />}
                      sx={{ 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                        px: 4,
                        minWidth: 160
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Clinic'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Clinic registered successfully! 🎉
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
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClinicForm; 