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
import { useAuth } from '@store/auth';
import { useUser } from '@store/auth';
import {
  loadClinicPaymentSettings,
  saveClinicPaymentSettings,
  loadVATSettings
} from '@utils/paymentUtils';
import { PAYMENT_METHODS, PAYMENT_CATEGORIES } from '@config/constants';
import { PaymentService, AppointmentService } from '@/services';
import FirebaseFriendlySync, { FirebaseDataBridge } from '@utils/firebaseFriendlySync';

// Type definitions
interface AppointmentTypeSettings {
  type: string;
  cost: number;
  currency: string;
  description: string;
  category: string;
  includeVAT: boolean;
}

interface ClinicPaymentSettings {
  autoCreatePaymentOnCompletion: boolean;
  defaultPaymentMethod: string;
  defaultPaymentDueDays: number;
  appointmentTypes: AppointmentTypeSettings[];
  paymentMethods: {
    cash: boolean;
    card: boolean;
    insurance: boolean;
    bank: boolean;
  };
}

// Use constants instead of mockData
const paymentMethods = PAYMENT_METHODS;
const paymentCategories = PAYMENT_CATEGORIES;

const ClinicPaymentSettingsComponent: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, initialized } = useAuth();
  const { userProfile } = useUser();
  
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

  // ✅ NEW: Direct Firebase connection test for settings page
  React.useEffect(() => {
    if (!initialized || authLoading || !user || !userProfile) return;

    console.log('🔄 SETTINGS: Testing Firebase connection for payment settings...');
    
    const testFirebaseConnection = async () => {
      try {
        const clinicId = userProfile.clinicId || 'demo-clinic';
        
        // Test Firebase services
        console.log('💰 Testing PaymentService connection...');
        const testPayments = await PaymentService.getPayments(clinicId);
        console.log(`💰 Settings page - Firebase payments: ${testPayments.length}`);
        
        console.log('📅 Testing AppointmentService connection...');
        const testAppointments = await AppointmentService.getAllAppointments(clinicId);
        console.log(`📅 Settings page - Firebase appointments: ${testAppointments.length}`);
        
        console.log(`🎯 SETTINGS FIREBASE TEST: ${testPayments.length} payments, ${testAppointments.length} appointments connected`);
        
      } catch (error) {
        console.error('❌ SETTINGS: Firebase connection failed:', error);
      }
    };
    
    testFirebaseConnection();
  }, [initialized, authLoading, user, userProfile]);

  // ✅ Firebase Data Bridge (for real-time data awareness)
  React.useEffect(() => {
    if (!initialized || authLoading || !user || !userProfile) return;

    console.log('💚 Settings: Setting up Firebase Data Bridge...');

    // Subscribe to real-time data changes
    const unsubscribe = FirebaseDataBridge.subscribe((data) => {
      console.log('💚 Settings Data Bridge Update:', {
        appointments: data.appointments?.length || 0,
        patients: data.patients?.length || 0
      });
      
      // Settings page can be aware of data changes for better UX
      console.log('💚 Settings: Data updated in other pages');
    });

    // Cleanup on unmount
    return () => {
      console.log('💚 Cleaning up Settings Firebase Data Bridge...');
      unsubscribe();
    };
  }, [initialized, authLoading, user, userProfile]);

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

          <TableContainer sx={{ 
            borderRadius: 3,
            border: '1px solid rgba(9, 9, 121, 0.1)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(9, 9, 121, 0.08)'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)'
                }}>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>{t('appointment_type')}</TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>{t('base_cost')}</TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>{t('final_cost')}</TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>{t('category')}</TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>{t('description')}</TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.appointmentTypes.map((appointmentType) => (
                  <TableRow key={appointmentType.type} sx={{
                    background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.02) 0%, rgba(0, 212, 255, 0.02) 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%)',
                      transform: 'translateX(2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <TableCell sx={{ borderColor: 'rgba(9, 9, 121, 0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {appointmentType.type}
                        </Typography>
                        {appointmentType.includeVAT && vatSettings.enabled && (
                          <Chip 
                            label="VAT" 
                            size="small" 
                            sx={{
                              background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
                              color: 'rgba(9, 9, 121, 1)',
                              border: '1px solid rgba(9, 9, 121, 0.3)',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(9, 9, 121, 0.1)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {appointmentType.cost} {appointmentType.currency}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(9, 9, 121, 0.1)' }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {calculateDisplayAmount(appointmentType.cost, appointmentType.includeVAT).toFixed(2)} {appointmentType.currency}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(9, 9, 121, 0.1)' }}>
                      <Chip 
                        label={t(appointmentType.category)} 
                        size="small" 
                        variant="outlined"
                        sx={{
                          borderColor: 'rgba(9, 9, 121, 0.3)',
                          color: 'rgba(9, 9, 121, 1)',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(9, 9, 121, 0.1)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {appointmentType.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(9, 9, 121, 0.1)' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={t('edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAppointmentType(appointmentType)}
                            sx={{
                              background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(9, 9, 121, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(90deg,rgba(2, 0, 36, 0.9) 0%, rgba(9, 9, 121, 0.9) 35%, rgba(0, 212, 255, 0.9) 100%)',
                                transform: 'scale(1.1)',
                                boxShadow: '0 4px 12px rgba(9, 9, 121, 0.4)',
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAppointmentType(appointmentType)}
                            sx={{
                              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(244, 67, 54, 0.7) 100%)',
                              color: 'white',
                              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(244, 67, 54, 0.9) 100%)',
                                transform: 'scale(1.1)',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                              },
                              transition: 'all 0.3s ease'
                            }}
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
                  {PAYMENT_CATEGORIES.map(category => (
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

// ✅ NEW: Add debug functionality to window object for Settings page
if (typeof window !== 'undefined') {
  // Debug and force refresh function for settings
  (window as any).debugSettingsAndForceRefresh = async () => {
    console.log('🔍 SETTINGS DEBUG: Starting comprehensive settings data test...');
    
    try {
      // Test Firebase services directly
      console.log('🔄 Testing PaymentService from settings...');
      const testPayments = await PaymentService.getPayments('demo-clinic');
      console.log(`💰 Settings - PaymentService test: ${testPayments.length} payments found`);
      
      console.log('🔄 Testing AppointmentService from settings...');
      const testAppointments = await AppointmentService.getAllAppointments('demo-clinic');
      console.log(`📅 Settings - AppointmentService test: ${testAppointments.length} appointments found`);
      
      // Test Firebase Data Bridge
      console.log('🔄 Testing Firebase Data Bridge from Settings...');
      FirebaseDataBridge.refreshAll('demo-clinic');
      
      // Test payment settings
      console.log('🔄 Testing payment settings persistence...');
      const currentSettings = loadClinicPaymentSettings();
      console.log('💰 Current settings:', currentSettings);
      
      // Show results
      const totalData = testPayments.length + testAppointments.length;
      console.log(`🎯 SETTINGS DEBUG COMPLETE: ${totalData} total records, ${currentSettings.appointmentTypes.length} appointment types`);
      
      alert(`✅ Settings Debug Results:\n\n💰 Payments: ${testPayments.length}\n📅 Appointments: ${testAppointments.length}\n⚙️ Appointment Types: ${currentSettings.appointmentTypes.length}\n\n🎯 Total: ${totalData} records\n\nCheck console for detailed logs.`);
      
    } catch (error) {
      console.error('❌ SETTINGS DEBUG ERROR:', error);
      alert(`❌ Settings Debug Failed:\n\n${error}\n\nCheck console for details.`);
    }
  };

  // Add all other global debug commands for settings
  (window as any).settingsTest = (window as any).debugSettingsAndForceRefresh;
  (window as any).settingsSync = () => FirebaseDataBridge.refreshAll('demo-clinic');
  (window as any).settingsRefresh = () => {
    console.log('🔄 Refreshing settings data via Firebase Data Bridge...');
    FirebaseDataBridge.refreshAll('demo-clinic');
  };
  
  // Add console command info
  console.log(`
  🎯 SETTINGS PAGE DEBUG COMMANDS AVAILABLE:
  
  • settingsTest() - Complete settings data test
  • debugSettingsAndForceRefresh() - Same as above
  • settingsSync() - Sync data via Firebase Data Bridge  
  • settingsRefresh() - Force refresh all data
  
  💡 Type any of these commands in the console to test settings page data flow!
  `);
} 