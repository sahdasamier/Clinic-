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
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../../contexts/UserContext'; // To get clinicId
import {
  ClinicConfig,
  updatePaymentSettings,
  listenToClinicConfig,
  ensureClinicConfigExists,
  // updateVatSettings, // If VAT settings are also managed here
} from '../../../services/ClinicConfigService'; // Firestore service
import {
  AppointmentTypeSettings,
  ClinicPaymentSettings,
  // paymentMethods, // May come from settings or remain static
  paymentCategories, // May come from settings or remain static
  defaultClinicPaymentSettings, // Fallback
  VATSettings, // For type, though VAT settings might be managed elsewhere or via ClinicConfigService
  defaultVATSettings,
} from '../../../data/mockData'; // For interfaces and defaults


const ClinicPaymentSettingsComponent: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile } = useUser();
  const clinicId = userProfile?.clinicId;

  // State management
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentTypeSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for appointment type editing
  const [appointmentTypeForm, setAppointmentTypeForm] = useState<AppointmentTypeSettings>({
    type: '',
    cost: 0,
    currency: 'EGP', // Default, should ideally come from clinic settings
    description: '',
    category: 'consultation',
    includeVAT: true, // Default, should ideally come from clinic settings
  });

  // Derived settings for easier access
  const paymentSettings = clinicConfig?.paymentSettings || defaultClinicPaymentSettings;
  const vatSettings = clinicConfig?.vatSettings || defaultVATSettings;


  // Load and listen to clinic configuration from Firestore
  useEffect(() => {
    if (!clinicId) {
      setIsLoading(false);
      setError("Clinic ID not found. Cannot load settings.");
      return () => {}; // Return a no-op cleanup
    }

    setIsLoading(true);
    let unsubscribe: (() => void) | undefined;

    const initializeAndListen = async () => {
      try {
        await ensureClinicConfigExists(clinicId);
        unsubscribe = listenToClinicConfig(clinicId, (config) => {
          if (config) {
            setClinicConfig(config);
            setError(null);
          } else {
            setError("Failed to load clinic configuration.");
            // Fallback to prevent total crash, component will show error.
            setClinicConfig(prev => prev || { id: clinicId, paymentSettings: defaultClinicPaymentSettings, vatSettings: defaultVATSettings });
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Error ensuring/listening to clinic config:", err);
        setError("Error initializing clinic settings.");
        setIsLoading(false);
      }
    };

    initializeAndListen();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [clinicId]);


  // Handle appointment type form change
  const handleAppointmentTypeFormChange = (field: keyof AppointmentTypeSettings, value: any) => {
    setAppointmentTypeForm(prev => ({ ...prev, [field]: value }));
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
        currency: paymentSettings.appointmentTypes[0]?.currency || 'EGP', // Use currency from existing or default
        description: '',
        category: 'consultation',
        includeVAT: paymentSettings.includeVATByDefault,
      });
      setSelectedAppointmentType(null);
      setIsEditing(false);
    }
    setEditDialogOpen(true);
  };

  // Save appointment type (add or update)
  const handleSaveAppointmentType = async () => {
    if (!clinicId || !clinicConfig) {
      alert("Clinic configuration not loaded. Cannot save.");
      return;
    }
    if (!appointmentTypeForm.type.trim() || appointmentTypeForm.cost <= 0) {
      alert('Please fill in appointment type name and a valid cost.');
      return;
    }

    setIsSaving(true);
    let updatedAppointmentTypes: AppointmentTypeSettings[];
    const currentPaymentSettings = clinicConfig.paymentSettings;

    if (isEditing && selectedAppointmentType) {
      // Update existing
      updatedAppointmentTypes = currentPaymentSettings.appointmentTypes.map(type =>
        type.type === selectedAppointmentType.type ? appointmentTypeForm : type
      );
    } else {
      // Add new
      const existingType = currentPaymentSettings.appointmentTypes.find(
        type => type.type.toLowerCase() === appointmentTypeForm.type.toLowerCase()
      );
      if (existingType) {
        alert('Appointment type with this name already exists.');
        setIsSaving(false);
        return;
      }
      updatedAppointmentTypes = [...currentPaymentSettings.appointmentTypes, appointmentTypeForm];
    }

    const newPaymentSettings: ClinicPaymentSettings = {
      ...currentPaymentSettings,
      appointmentTypes: updatedAppointmentTypes,
    };

    try {
      await updatePaymentSettings(clinicId, newPaymentSettings);
      // No need to call setClinicConfig here, listener will update it
      setEditDialogOpen(false);
      alert('Appointment type saved successfully!');
    } catch (e) {
      console.error("Error saving appointment type:", e);
      alert('Failed to save appointment type. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete appointment type
  const handleDeleteAppointmentType = async (appointmentTypeToDelete: AppointmentTypeSettings) => {
    if (!clinicId || !clinicConfig) {
      alert("Clinic configuration not loaded. Cannot delete.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${appointmentTypeToDelete.type}"?`)) {
      setIsSaving(true);
      const currentPaymentSettings = clinicConfig.paymentSettings;
      const updatedAppointmentTypes = currentPaymentSettings.appointmentTypes.filter(
        type => type.type !== appointmentTypeToDelete.type
      );
      const newPaymentSettings: ClinicPaymentSettings = {
        ...currentPaymentSettings,
        appointmentTypes: updatedAppointmentTypes,
      };
      try {
        await updatePaymentSettings(clinicId, newPaymentSettings);
        // Listener will update state
        alert('Appointment type deleted successfully!');
      } catch (e) {
        console.error("Error deleting appointment type:", e);
        alert('Failed to delete appointment type. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Calculate amount with VAT for display
  const calculateDisplayAmount = (baseAmount: number, includeVATSetting: boolean) => {
    if (!includeVATSetting || !vatSettings.enabled) {
      return baseAmount;
    }
    return baseAmount + (baseAmount * vatSettings.rate / 100);
  };


  if (isLoading) {
    return <Typography sx={{p:3}}>Loading clinic settings...</Typography>;
  }

  if (error) {
    return <Alert severity="error" sx={{m:3}}>{error}</Alert>;
  }

  if (!clinicConfig) {
     return <Alert severity="warning" sx={{m:3}}>Clinic settings not yet available. Please try again shortly.</Alert>;
  }


  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t('clinic_payment_settings')}
        </Typography>
        {isSaving && (
          <Chip 
            label={t('saving...')}
            color="info"
            size="small" 
            icon={<CloudUploadIcon />}
            sx={{ ml: 2 }}
          />
        )}
         {!isSaving && clinicId && ( // Simple indicator of connection status
          <Tooltip title="Settings are synced with the cloud">
            <CloudUploadIcon color="success" sx={{ ml: 2 }} />
          </Tooltip>
        )}
        {!clinicId && (
           <Tooltip title="Clinic ID missing, settings cannot be saved to cloud">
            <CloudOffIcon color="error" sx={{ ml: 2 }} />
          </Tooltip>
        )}
      </Box>

      {/* Debug Info for Testing - Can be removed later */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Debug Info:</strong> Loaded from Firestore. {paymentSettings.appointmentTypes.length} appointment types.
          VAT Enabled: {vatSettings.enabled ? `Yes (${vatSettings.rate}%)` : 'No'}.
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
              disabled={isSaving || !clinicId}
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
              console.log('🔍 localStorage persistence disabled - no storage data to check');
              alert('Check console for current in-memory settings state');
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