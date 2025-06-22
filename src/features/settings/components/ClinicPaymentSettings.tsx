import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  loadClinicPaymentSettings,
  saveClinicPaymentSettings,
  loadVATSettings
} from '../../../utils/paymentUtils';
import {
  AppointmentTypeSettings,
  ClinicPaymentSettings,
  paymentMethods,
  paymentCategories
} from '../../../data/mockData';

const ClinicPaymentSettingsComponent: React.FC = () => {
  const { t } = useTranslation();
  
  // State management
  const [settings, setSettings] = useState<ClinicPaymentSettings>(() => {
    console.log('🔄 Loading clinic payment settings...');
    const loadedSettings = loadClinicPaymentSettings();
    console.log('✅ Loaded settings:', loadedSettings);
    return loadedSettings;
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentTypeSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Form state for appointment type editing
  const [appointmentTypeForm, setAppointmentTypeForm] = useState<AppointmentTypeSettings>({
    type: '',
    cost: 0,
    currency: 'EGP',
    description: '',
    category: 'consultation',
    includeVAT: true
  });

  // Load VAT settings for display
  const [vatSettings] = useState(() => loadVATSettings());

  // Auto-save when settings change (with debounce)
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        console.log('🔄 Auto-saving settings...');
        saveClinicPaymentSettings(settings);
        console.log('✅ Settings auto-saved:', settings);
        setIsDirty(false);
        
        // Verify save by reloading
        const verification = loadClinicPaymentSettings();
        console.log('🔍 Verification - Settings in localStorage:', verification);
      }, 2000); // 2 seconds after user stops changing settings

      return () => clearTimeout(timeoutId);
    }
  }, [settings, isDirty]);

  // Handle settings change
  const handleSettingsChange = (field: keyof ClinicPaymentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Handle appointment type form change
  const handleAppointmentTypeFormChange = (field: keyof AppointmentTypeSettings, value: any) => {
    setAppointmentTypeForm(prev => ({ ...prev, [field]: value }));
  };

  // Save settings
  const handleSaveSettings = () => {
    try {
      console.log('🔄 Manual save button clicked, saving settings...');
      saveClinicPaymentSettings(settings);
      setIsDirty(false);
      console.log('✅ Clinic payment settings saved successfully');
      
      // Verify save by reloading from localStorage
      const verification = loadClinicPaymentSettings();
      console.log('🔍 Verification after manual save:', verification);
      
      // Show success feedback
      alert('✅ Payment settings saved successfully!');
    } catch (error) {
      console.error('❌ Error saving clinic payment settings:', error);
      alert('❌ Failed to save settings. Please try again.');
    }
  };

  // Open edit dialog for appointment type
  const handleEditAppointmentType = (appointmentType: AppointmentTypeSettings | null = null) => {
    if (appointmentType) {
      setAppointmentTypeForm({ ...appointmentType });
      setSelectedAppointmentType(appointmentType);
      setIsEditing(true);
    } else {
      setAppointmentTypeForm({
        type: '',
        cost: 0,
        currency: 'EGP',
        description: '',
        category: 'consultation',
        includeVAT: true
      });
      setSelectedAppointmentType(null);
      setIsEditing(false);
    }
    setEditDialogOpen(true);
  };

  // Save appointment type
  const handleSaveAppointmentType = () => {
    if (!appointmentTypeForm.type.trim() || appointmentTypeForm.cost <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedAppointmentTypes: AppointmentTypeSettings[];

    if (isEditing && selectedAppointmentType) {
      // Update existing
      updatedAppointmentTypes = settings.appointmentTypes.map(type =>
        type.type === selectedAppointmentType.type ? appointmentTypeForm : type
      );
    } else {
      // Add new
      const existingType = settings.appointmentTypes.find(
        type => type.type.toLowerCase() === appointmentTypeForm.type.toLowerCase()
      );
      
      if (existingType) {
        alert('Appointment type already exists');
        return;
      }
      
      updatedAppointmentTypes = [...settings.appointmentTypes, appointmentTypeForm];
    }

    setSettings(prev => ({ ...prev, appointmentTypes: updatedAppointmentTypes }));
    setIsDirty(true);
    setEditDialogOpen(false);
  };

  // Delete appointment type
  const handleDeleteAppointmentType = (appointmentType: AppointmentTypeSettings) => {
    if (window.confirm(`Are you sure you want to delete "${appointmentType.type}"?`)) {
      const updatedAppointmentTypes = settings.appointmentTypes.filter(
        type => type.type !== appointmentType.type
      );
      setSettings(prev => ({ ...prev, appointmentTypes: updatedAppointmentTypes }));
      setIsDirty(true);
    }
  };

  // Calculate amount with VAT for display
  const calculateDisplayAmount = (baseAmount: number, includeVAT: boolean) => {
    if (!includeVAT || !vatSettings.enabled) {
      return baseAmount;
    }
    return baseAmount + (baseAmount * vatSettings.rate / 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t('clinic_payment_settings')}
        </Typography>
        {isDirty && (
          <Chip 
            label={t('unsaved_changes')} 
            color="warning" 
            size="small" 
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {/* Debug Info for Testing */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Debug Info:</strong> Settings loaded: {settings.appointmentTypes.length} appointment types, 
          Auto-payment: {settings.autoCreatePaymentOnCompletion ? 'Enabled' : 'Disabled'}, 
          Default method: {settings.defaultPaymentMethod}
        </Typography>
      </Alert>

      

      {/* Appointment Types Settings */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('appointment_types_and_costs')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleEditAppointmentType()}
            >
              {t('Add Appointment type')}
            </Button>
          </Box>

          {vatSettings.enabled && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('vat_enabled_notice', { rate: vatSettings.rate })}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('appointment_type')}</TableCell>
                  <TableCell>{t('base_cost')}</TableCell>
                  <TableCell>{t('final_cost')}</TableCell>
                  <TableCell>{t('category')}</TableCell>
                  <TableCell>{t('description')}</TableCell>
                  <TableCell>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.appointmentTypes.map((appointmentType) => (
                  <TableRow key={appointmentType.type}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {appointmentType.type}
                        </Typography>
                        {appointmentType.includeVAT && vatSettings.enabled && (
                          <Chip label="VAT" size="small" color="info" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {appointmentType.cost} {appointmentType.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {calculateDisplayAmount(appointmentType.cost, appointmentType.includeVAT).toFixed(2)} {appointmentType.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(appointmentType.category)} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {appointmentType.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={t('edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAppointmentType(appointmentType)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAppointmentType(appointmentType)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isDirty && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              console.log('🔍 Current settings state:', settings);
              const stored = localStorage.getItem('clinic_payment_settings');
              console.log('🔍 Raw localStorage data:', stored);
              if (stored) {
                const parsed = JSON.parse(stored);
                console.log('🔍 Parsed localStorage data:', parsed);
              }
              alert('Check console for detailed debug information');
            }}
          >
            Debug Info
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            {t('save_settings')}
          </Button>
        </Box>
      )}

      {/* Edit Appointment Type Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? t('edit_appointment_type') : t('add_appointment_type')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
           
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('cost')}
                value={appointmentTypeForm.cost}
                onChange={(e) => handleAppointmentTypeFormChange('cost', parseFloat(e.target.value) || 0)}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('currency')}
                value={appointmentTypeForm.currency}
                onChange={(e) => handleAppointmentTypeFormChange('currency', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('category')}</InputLabel>
                <Select
                  value={appointmentTypeForm.category}
                  onChange={(e) => handleAppointmentTypeFormChange('category', e.target.value)}
                  label={t('category')}
                >
                  {paymentCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {t(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('description')}
                value={appointmentTypeForm.description}
                onChange={(e) => handleAppointmentTypeFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={appointmentTypeForm.includeVAT}
                    onChange={(e) => handleAppointmentTypeFormChange('includeVAT', e.target.checked)}
                  />
                }
                label={t('include_vat')}
              />
              {appointmentTypeForm.includeVAT && vatSettings.enabled && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {t('final_cost_with_vat', { 
                    amount: calculateDisplayAmount(appointmentTypeForm.cost, true).toFixed(2),
                    currency: appointmentTypeForm.currency,
                    rate: vatSettings.rate
                  })}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveAppointmentType} variant="contained" startIcon={<SaveIcon />}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicPaymentSettingsComponent; 