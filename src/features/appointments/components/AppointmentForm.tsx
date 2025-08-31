import React, { useState, useEffect } from 'react';
import { usePersistentForm } from '@hooks/usePersistentForm';
import { useTranslation } from 'react-i18next';
import { useUser } from '@store/auth';
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
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AccessTime,
  MedicalServices,
  Notes,
  CheckCircle,
  Phone,
  LocationOn,
  Add,
  PersonAdd
} from '@mui/icons-material';
import { NavBar } from '@components/NavBar';
import { Sidebar } from '@components/Sidebar';
import AvailableTimeSlotsSelector from './AvailableTimeSlotsSelector';
import { createAppointment, type AppointmentFormData as ApiAppointmentFormData } from '@lib/api/appointments';
import { getDoctorsByClinic } from '@lib/api/doctorPatients';
import { UserData } from '@lib/api/auth';
import { testPaymentNotificationSystem } from '@utils/paymentUtils';
import { AppointmentValidationService, ValidationResult } from '@/services/AppointmentValidationService';
import { PatientService, Patient } from '@/services/PatientService';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [showCustomPatient, setShowCustomPatient] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [timeSlotReservation, setTimeSlotReservation] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  // ✅ Use persistent form hook for data persistence
  const defaultFormData: AppointmentFormData = {
    patientName: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    duration: 20,
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

  // ✅ NEW: Real-time appointment validation
  const validateAppointmentRealTime = async () => {
    if (!formData.doctor || !formData.appointmentDate || !formData.appointmentTime || !formData.patientName) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      // Find doctor ID
      const selectedDoctor = doctors.find(d => `${d.firstName} ${d.lastName}` === formData.doctor);
      if (!selectedDoctor) {
        setValidationResult(null);
        return;
      }

      const validationOptions = {
        doctorId: selectedDoctor.id,
        date: formData.appointmentDate,
        timeSlot: formData.appointmentTime,
        duration: formData.duration,
        patientName: formData.patientName,
        appointmentType: formData.appointmentType
      };

      const result = await AppointmentValidationService.validateAppointmentDetails(validationOptions);
      setValidationResult(result);

      // If validation passes and we don't have a reservation, create one
      if (result.isValid && !timeSlotReservation) {
        const reservationId = AppointmentValidationService.reserveTimeSlot(validationOptions);
        setTimeSlotReservation(reservationId);
        
        // Auto-release reservation after 4 minutes to give 1 minute buffer
        setTimeout(() => {
          if (timeSlotReservation === reservationId) {
            AppointmentValidationService.releaseReservation(reservationId);
            setTimeSlotReservation(null);
          }
        }, 4 * 60 * 1000);
      }

    } catch (error) {
      console.error('Error validating appointment:', error);
      setValidationResult({
        isValid: false,
        errors: ['Validation failed'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Real-time validation when key fields change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (formData.doctor && formData.appointmentDate && formData.appointmentTime && formData.patientName) {
        validateAppointmentRealTime();
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(debounceTimer);
  }, [formData.doctor, formData.appointmentDate, formData.appointmentTime, formData.patientName, formData.duration, formData.appointmentType]);

  // Cleanup reservation on component unmount
  useEffect(() => {
    return () => {
      if (timeSlotReservation) {
        AppointmentValidationService.releaseReservation(timeSlotReservation);
      }
    };
  }, []);

  // ✅ DEBUG: Expose patient loading for console testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugAppointmentForm = {
        patients: () => patients,
        reloadPatients: async () => {
          if (!userProfile?.clinicId) return;
          setIsLoadingPatients(true);
          try {
            const patients = await PatientService.searchPatients(userProfile.clinicId, '');
            console.log('🔄 Manual reload - Patients loaded:', patients.length);
            setPatients(patients);
          } catch (error) {
            console.error('❌ Manual reload failed:', error);
          }
          setIsLoadingPatients(false);
        },
        formData: () => formData,
        showCustomPatient: () => showCustomPatient
      };
    }
  }, [patients, formData, showCustomPatient, userProfile?.clinicId]);

  useEffect(() => {
    const loadDoctorsAndPatients = async () => {
      if (!userProfile?.clinicId) return;
      
      try {
        console.log('🔍 AppointmentForm: Loading doctors and patients for clinic:', userProfile.clinicId);
        
        // Load doctors
        const doctors = await getDoctorsByClinic(userProfile.clinicId);
        console.log('🏥 AppointmentForm: Loaded doctors:', doctors);
        setDoctors(doctors);

        // Load patients
        setIsLoadingPatients(true);
        const patients = await PatientService.searchPatients(userProfile.clinicId, '');
        console.log('👥 AppointmentForm: Loaded patients:', patients.length, patients.map(p => ({ name: p.name, phone: p.phone })));
        setPatients(patients);
        setIsLoadingPatients(false);
      } catch (error) {
        console.error('Error loading doctors and patients:', error);
        setIsLoadingPatients(false);
      }
    };
    loadDoctorsAndPatients();
  }, [userProfile?.clinicId]);

  // Reset time slot when doctor or date changes
  useEffect(() => {
    if (formData.doctor && formData.appointmentDate) {
      updateFormData('appointmentTime', '');
    }
  }, [formData.doctor, formData.appointmentDate]);

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
      // ✅ ENHANCED: Final validation before creating appointment
      const selectedDoctor = doctors.find(d => `${d.firstName} ${d.lastName}` === formData.doctor);
      if (!selectedDoctor) {
        throw new Error('Selected doctor not found');
      }

      const validationOptions = {
        doctorId: selectedDoctor.id,
        date: formData.appointmentDate,
        timeSlot: formData.appointmentTime,
        duration: formData.duration,
        patientName: formData.patientName,
        appointmentType: formData.appointmentType
      };

      console.log('🔍 FINAL VALIDATION before appointment creation:', validationOptions);

      const finalValidation = await AppointmentValidationService.validateAppointmentDetails(validationOptions);
      
      if (!finalValidation.isValid) {
        const errorMessage = finalValidation.errors.join(', ');
        const warningMessage = finalValidation.warnings.length > 0 ? '\n\nWarnings: ' + finalValidation.warnings.join(', ') : '';
        
        if (finalValidation.conflictDetails?.suggestedAlternatives) {
          const alternatives = finalValidation.conflictDetails.suggestedAlternatives;
          const altMessage = alternatives.length > 0 ? `\n\nSuggested alternatives: ${alternatives.join(', ')}` : '';
          throw new Error(errorMessage + warningMessage + altMessage);
        } else {
          throw new Error(errorMessage + warningMessage);
        }
      }

      console.log('✅ VALIDATION PASSED - Creating appointment');

      // ✅ ENHANCED: Ensure patient exists before creating appointment
      const { AppointmentService } = await import('@/services/AppointmentService');
      const patientId = await AppointmentService.ensurePatientExists(
        userProfile?.clinicId || 'demo-clinic',
        formData.patientName,
        formData.patientPhone
      );

      // Convert form data to API format
      const appointmentData: ApiAppointmentFormData = {
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientId: patientId, // ✅ Include the actual patient ID
        doctorName: formData.doctor,
        doctorId: selectedDoctor.id, // ✅ Include doctor ID for validation
        date: formData.appointmentDate,
        time: formData.appointmentTime,
        type: formData.appointmentType,
        duration: formData.duration,
        location: formData.location,
        priority: formData.priority as 'normal' | 'high' | 'urgent',
        notes: formData.notes,
        clinicId: userProfile?.clinicId || 'demo-clinic' // ✅ FIXED: Include clinicId
      };

      const createdAppointment = await createAppointment(appointmentData);
      
      // ✅ Release time slot reservation after successful creation
      if (timeSlotReservation) {
        AppointmentValidationService.releaseReservation(timeSlotReservation);
        setTimeSlotReservation(null);
      }
      
      setSuccess(true);
      
      // ✅ ENHANCED: Trigger automatic cross-page sync
      import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.appointment(createdAppointment, 'create');
        if (patientId) {
          triggerAutomaticSync.patient({ 
            id: patientId, 
            name: formData.patientName,
            phone: formData.patientPhone 
          }, 'update');
        }
      });
      
      console.log('✅ Appointment created successfully');
      
      // ✅ Reset form using persistent form hook
      clearForm();
      setActiveStep(0);
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save appointment';
      
      // ✅ Enhanced error handling for conflict scenarios
      if (errorMessage.includes('Conflict') || errorMessage.includes('conflicts with')) {
        setError(`🚫 Appointment Conflict Detected\n\n${errorMessage}\n\nPlease select a different time slot.`);
      } else {
        setError(errorMessage);
      }
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
              {/* ✅ Patient summary */}
              {patients.length > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    📋 <strong>{patients.length} existing patients</strong> found in your clinic. Select from dropdown or add a new patient.
                  </Typography>
                </Alert>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {/* ✅ ENHANCED: Patient dropdown with existing patients + option to add new */}
              {isLoadingPatients ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading patients...</Typography>
                </Box>
              ) : (
                <FormControl fullWidth error={!!errors.patientName}>
                  <InputLabel>{t('patient_name')} *</InputLabel>
                  <Select
                    value={showCustomPatient ? 'custom' : (patients.find(p => p.name === formData.patientName) ? formData.patientName : 'custom')}
                    label={`${t('patient_name')} *`}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomPatient(true);
                        updateFormData('patientName', '');
                        updateFormData('patientPhone', '');
                      } else {
                        setShowCustomPatient(false);
                        const selectedPatient = patients.find(p => p.name === e.target.value);
                        updateFormData('patientName', e.target.value);
                        updateFormData('patientPhone', selectedPatient?.phone || '');
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Person sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 3 
                      }
                    }}
                  >
                    <MenuItem value="custom">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                        <PersonAdd fontSize="small" />
                        <Typography variant="body2">Add New Patient</Typography>
                      </Box>
                    </MenuItem>
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box>
                            <Typography variant="body1">{patient.name}</Typography>
                            {patient.phone && (
                              <Typography variant="caption" color="text.secondary">
                                📱 {patient.phone}
                              </Typography>
                            )}
                          </Box>
                          {patient.dateOfBirth && (
                            <Chip 
                              label={`Age: ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}`}
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.patientName && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {errors.patientName}
                    </Typography>
                  )}
                </FormControl>
              )}
              
              {/* ✅ Custom patient name input (shown when "Add New Patient" is selected) */}
              {showCustomPatient && (
                <TextField
                  fullWidth
                  label="New Patient Name"
                  value={formData.patientName}
                  onChange={(e) => updateFormData('patientName', e.target.value)}
                  error={!!errors.patientName}
                  helperText={errors.patientName}
                  required
                  placeholder="Enter patient name"
                  sx={{ 
                    mt: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 3,
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('phone_number')}
                value={formData.patientPhone}
                onChange={(e) => updateFormData('patientPhone', e.target.value)}
                error={!!errors.patientPhone}
                helperText={errors.patientPhone || (!showCustomPatient && formData.patientPhone && patients.find(p => p.name === formData.patientName) ? '📱 Auto-filled from selected patient' : '')}
                required
                placeholder={showCustomPatient ? "Enter patient phone number" : (formData.patientPhone ? formData.patientPhone : t('phone_placeholder'))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    backgroundColor: (!showCustomPatient && formData.patientPhone && patients.find(p => p.name === formData.patientName)) ? 'rgba(76, 175, 80, 0.04)' : undefined
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
            <Grid item xs={12}>
              {/* Available Time Slots Selector */}
              <AvailableTimeSlotsSelector
                doctorId={doctors.find(d => `${d.firstName} ${d.lastName}` === formData.doctor)?.id}
                date={formData.appointmentDate}
                duration={formData.duration}
                selectedTimeSlot={formData.appointmentTime}
                onTimeSlotSelect={(timeSlot) => {
                  updateFormData('appointmentTime', timeSlot);
                  // Trigger immediate validation after time slot selection
                  setTimeout(() => validateAppointmentRealTime(), 100);
                }}
              />
              {errors.appointmentTime && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.appointmentTime}
                </Alert>
              )}
              
              {/* ✅ NEW: Real-time Validation Status Indicator */}
              {(formData.doctor && formData.appointmentDate && formData.appointmentTime && formData.patientName) && (
                <Box sx={{ mt: 2 }}>
                  {isValidating ? (
                    <Alert 
                      severity="info" 
                      icon={<CircularProgress size={20} />}
                      sx={{ 
                        '& .MuiAlert-icon': { alignItems: 'center' }
                      }}
                    >
                      <Typography variant="body2">
                        🔍 Validating appointment slot...
                      </Typography>
                    </Alert>
                  ) : validationResult ? (
                    validationResult.isReservedSlot ? (
                      // ✅ ENHANCED: Special handling for reserved slots
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          ⏰ Time slot is reserved
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          This time slot is already booked by another patient. Please select a different time.
                        </Typography>
                        {validationResult.conflictDetails?.conflictingAppointment && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                            📅 Reserved for: {validationResult.conflictDetails.conflictingAppointment.patient || 'Unknown Patient'}
                          </Typography>
                        )}
                        {validationResult.conflictDetails?.suggestedAlternatives && validationResult.conflictDetails.suggestedAlternatives.length > 0 && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                              💡 Available alternatives:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {validationResult.conflictDetails.suggestedAlternatives.map((timeSlot, index) => {
                                const [hours, minutes] = timeSlot.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, minutes);
                                const displayTime = date.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                });
                                
                                return (
                                  <Chip
                                    key={index}
                                    label={displayTime}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => updateFormData('appointmentTime', timeSlot)}
                                    sx={{
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText'
                                      }
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        )}
                      </Alert>
                    ) : validationResult.isValid ? (
                      <Alert severity="success" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          ✅ Time slot is available!
                        </Typography>
                        {timeSlotReservation && (
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                            🔒 Time slot reserved for 5 minutes
                          </Typography>
                        )}
                        {validationResult.warnings.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              ⚠️ Warnings:
                            </Typography>
                            {validationResult.warnings.map((warning, index) => (
                              <Typography key={index} variant="caption" sx={{ display: 'block', ml: 1 }}>
                                • {warning}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          ❌ Appointment conflicts detected:
                        </Typography>
                        {validationResult.errors.map((error, index) => (
                          <Typography key={index} variant="body2" sx={{ display: 'block', ml: 1 }}>
                            • {error}
                          </Typography>
                        ))}
                        {validationResult.conflictDetails?.suggestedAlternatives && validationResult.conflictDetails.suggestedAlternatives.length > 0 && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                              💡 Suggested alternatives:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {validationResult.conflictDetails.suggestedAlternatives.map((timeSlot, index) => {
                                const [hours, minutes] = timeSlot.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, minutes);
                                const displayTime = date.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                });
                                
                                return (
                                  <Chip
                                    key={index}
                                    label={displayTime}
                                    size="small"
                                    clickable
                                    onClick={() => updateFormData('appointmentTime', timeSlot)}
                                    sx={{ 
                                      backgroundColor: 'primary.light',
                                      color: 'primary.contrastText',
                                      '&:hover': {
                                        backgroundColor: 'primary.main'
                                      }
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        )}
                      </Alert>
                    )
                  ) : null}
                </Box>
              )}
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
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={20}>20 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
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
        <NavBar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Card sx={{ 
            mb: 4, 
            background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
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
            background: 'linear-gradient(120deg, rgba(2, 0, 36, 0.03) 0%, rgba(9, 9, 121, 0.05) 35%, rgba(0, 212, 255, 0.03) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(9, 9, 121, 0.08)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(9, 9, 121, 0.1)',
            overflow: 'hidden',
            '&:hover': {
              background: 'linear-gradient(120deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)',
              boxShadow: '0 12px 40px rgba(9, 9, 121, 0.15)',
            },
            transition: 'all 0.3s ease',
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
                            disabled={loading || (validationResult && (!validationResult.isValid || validationResult.isReservedSlot)) || isValidating}
                            sx={{ 
                              borderRadius: 3,
                                              background: validationResult && (!validationResult.isValid || validationResult.isReservedSlot)
                  ? validationResult.isReservedSlot 
                    ? 'linear-gradient(90deg, rgba(255, 193, 7, 1) 0%, rgba(255, 152, 0, 1) 100%)'  // Orange for reserved
                    : 'linear-gradient(90deg, rgba(244, 67, 54, 1) 0%, rgba(198, 40, 40, 1) 100%)'  // Red for errors
                  : 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                              px: 4,
                              position: 'relative',
                              overflow: 'hidden',
                                                '&:disabled': {
                    background: validationResult && (!validationResult.isValid || validationResult.isReservedSlot)
                      ? validationResult.isReservedSlot
                        ? 'linear-gradient(90deg, rgba(255, 193, 7, 0.5) 0%, rgba(255, 152, 0, 0.5) 100%)'  // Orange for reserved
                        : 'linear-gradient(90deg, rgba(244, 67, 54, 0.5) 0%, rgba(198, 40, 40, 0.5) 100%)'  // Red for errors
                      : undefined
                  }
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
                              background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)'
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