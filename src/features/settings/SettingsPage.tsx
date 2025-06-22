import React, { useState, useRef, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { AuthContext } from '../../app/AuthProvider';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
  Chip,
  FormHelperText,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  LocalHospital,
  Settings,
  Security,
  Notifications,
  Storage,
  Save,
  Edit,
  CloudUpload,
  Visibility,
  VisibilityOff,
  Add,
  Close,
  Info,
  Business,
  People,
  Schedule,
  Shield,
  Lock,
  History,
  Backup,
  Download,
  Help,
  Check,
  Warning,
  MedicalServices,
  Payment,
  Palette,
  Delete,
  Email,
  Phone,
} from '@mui/icons-material';

import ClinicPaymentSettingsComponent from './components/ClinicPaymentSettings';

import { sendSupportEmail, sendFeedbackEmail, getSetupInstructions, type SupportEmailData } from '../../services/emailService';



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});

  // Insurance Provider interface
  interface InsuranceProvider {
    id: number;
    name: string;
    enabled: boolean;
  }


  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // File upload refs
  const profileImageRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loginHistoryDialogOpen, setLoginHistoryDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  // ✅ STEP 2: Fixed Profile state that loads from localStorage
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicProfile');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ Loaded profile from localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Failed to parse profile data:', error);
    }
    
    console.log('ℹ️ Using default profile values');
    return {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      emergencyContact: '',
      dateOfBirth: '',
      gender: '',
      experience: '',
      licenseNumber: '',
      medicalSchool: '',
      residency: '',
      certifications: '',
      languages: '',
      consultationFee: '',
      bio: '',
      workingDays: '',
      workingHours: '',
      lunchBreak: '',
      status: 'available',
      profileImage: '',
    };
  });

  // ✅ STEP 2: Fixed Clinic settings that loads from localStorage
  const [clinicSettings, setClinicSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicSettings');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ Loaded clinic settings from localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Failed to parse clinic settings:', error);
    }
    
    console.log('ℹ️ Using default clinic settings');
    return {
      name: '',
      address: '',
      phone: '',
      email: '',
      workingHours: '',
      timezone: '',
      licenseNumber: '',
      website: '',
      specialization: '',
      logo: '',
      tagline: '',
      primaryColor: '#1976d2',
      secondaryColor: '#2e7d32',
      description: '',
      appointmentDuration: 30,
      breakBetweenAppointments: 15,
      advanceBookingLimit: 30,
      allowOnlineBooking: false,
      requirePaymentAtBooking: false,
      sendReminders: false,
      insuranceProviders: [
        { id: 1, name: 'Global Health Insurance', enabled: true },
        { id: 2, name: 'National Insurance', enabled: true },
        { id: 3, name: 'Private Medical Insurance', enabled: false }
      ],
    };
  });

  // ✅ STEP 2: Fixed Preferences that loads from localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ Loaded preferences from localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Failed to parse preferences:', error);
    }
    
    console.log('ℹ️ Using default preferences');
    return {
      language: i18n.language,
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      autoBackup: true,
      twoFactorAuth: false,
    };
  });



  // ✅ Payment Methods with localStorage persistence
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicPaymentMethods');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ Loaded payment methods from localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Failed to parse payment methods:', error);
    }
    
    console.log('ℹ️ Using default payment methods');
    return {
      cash: true,
      cards: true,
      bankTransfer: false,
      digitalWallets: false,
    };
  });

  // ✅ Services with localStorage persistence
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicServices');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ Loaded services from localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Failed to parse services:', error);
    }
    
    console.log('ℹ️ Using default services');
    return {
      consultation: true,
      checkups: true,
      vaccinations: false,
      labTests: false,
      radiology: false,
    };
  });

  // ✅ Appointment Settings with localStorage persistence
  const [appointmentSettings, setAppointmentSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicAppointmentSettings');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ Loaded appointment settings from localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Failed to parse appointment settings:', error);
    }
    
    console.log('ℹ️ Using default appointment settings');
    return {
      onlineBooking: true,
      paymentRequired: false,
      reminders: true,
    };
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility states
  const [passwordVisibility, setPasswordVisibility] = useState({
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    role: '',
    specialization: '',
  });

  const [credentialsForm, setCredentialsForm] = useState({
    licenseNumber: profile.licenseNumber || '',
    medicalSchool: profile.medicalSchool || '',
    residency: profile.residency || '',
    certifications: profile.certifications || '',
    experience: profile.experience || '',
  });

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date: '',
    issuer: '',
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    supportType: 'general',
  });

  // Insurance provider management
  const [insuranceDialog, setInsuranceDialog] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<{ id: number; name: string } | null>(null);
  const [newInsuranceName, setNewInsuranceName] = useState('');





  // 🔍 STEP 1: Enhanced Debug - Check What's Actually Saved
  useEffect(() => {
    console.log('🔍 DEBUGGING DATA PERSISTENCE:');
    console.log('Profile data in localStorage:', localStorage.getItem('clinicProfile'));
    console.log('Clinic settings in localStorage:', localStorage.getItem('clinicSettings'));
    console.log('Preferences in localStorage:', localStorage.getItem('userPreferences'));
    console.log('Services in localStorage:', localStorage.getItem('clinicServices'));
    console.log('Payment methods in localStorage:', localStorage.getItem('clinicPaymentMethods'));
    console.log('Appointment settings in localStorage:', localStorage.getItem('clinicAppointmentSettings'));
    console.log('Current profile state:', profile);
    console.log('Current clinic settings state:', clinicSettings);
    console.log('Current preferences state:', preferences);
    console.log('Current services state:', services);
    console.log('Current payment methods state:', paymentMethods);
    console.log('Current appointment settings state:', appointmentSettings);
  }, [profile, clinicSettings, preferences, services, paymentMethods, appointmentSettings]);

  // 🎯 Auto-Save Profile Data (Debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profile.name && profile.email) { // Only if basic data exists
        localStorage.setItem('clinicProfile', JSON.stringify(profile));
        console.log('🔄 Auto-saved profile data');
      }
    }, 2000); // 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [profile]);

  // 🎯 Auto-Save Clinic Settings Data (Debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (clinicSettings.name && clinicSettings.address) { // Only if basic data exists
        localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
        console.log('🔄 Auto-saved clinic settings data');
      }
    }, 2000); // 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [clinicSettings]);

  // 🎯 Auto-Save Preferences Data (Immediate)
  useEffect(() => {
    if (preferences.language) { // Only if basic data exists
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      console.log('🔄 Auto-saved preferences data');
    }
  }, [preferences]);

  // 🎯 Auto-Save Services Data (Immediate)
  useEffect(() => {
    localStorage.setItem('clinicServices', JSON.stringify(services));
    console.log('🔄 Auto-saved services data');
  }, [services]);

  // 🎯 Auto-Save Payment Methods Data (Immediate)
  useEffect(() => {
    localStorage.setItem('clinicPaymentMethods', JSON.stringify(paymentMethods));
    console.log('🔄 Auto-saved payment methods data');
  }, [paymentMethods]);

  // 🎯 Auto-Save Appointment Settings Data (Immediate)
  useEffect(() => {
    localStorage.setItem('clinicAppointmentSettings', JSON.stringify(appointmentSettings));
    console.log('🔄 Auto-saved appointment settings data');
  }, [appointmentSettings]);

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (formData: any, requiredFields: string[]) => {
    const newErrors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setErrors({});
  };

  const handleLanguageChange = (lang: string) => {
    setPreferences({ ...preferences, language: lang });
    i18n.changeLanguage(lang);
    document.documentElement.dir = i18n.dir();
    showSnackbar('Language updated successfully', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Password visibility handlers
  const togglePasswordVisibility = (field: 'showCurrentPassword' | 'showNewPassword' | 'showConfirmPassword') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo' | 'document') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = type === 'document' ? 
      ['application/pdf', 'image/jpeg', 'image/png'] : 
      ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!validTypes.includes(file.type)) {
      showSnackbar('Invalid file type. Please upload a valid image or PDF.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showSnackbar('File size too large. Please upload a file smaller than 5MB.', 'error');
      return;
    }

    // Simulate file upload
    setLoading(true);
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(file);
      if (type === 'profile') {
        setProfile({ ...profile, profileImage: fileUrl });
        showSnackbar('Profile image uploaded successfully', 'success');
      } else if (type === 'logo') {
        setClinicSettings({ ...clinicSettings, logo: fileUrl });
        showSnackbar('Logo uploaded successfully', 'success');
      }
      setLoading(false);
    }, 2000);
  };

  // ✅ STEP 4: Enhanced Save Profile Function with Debug Logging (Testing Mode)
  const handleSaveProfile = async () => {
    console.log('🔄 Save Profile button clicked!');
    console.log('📋 Profile data to save:', profile);
    
    // ✅ FIX: Remove specialization from required fields temporarily for testing
    const requiredFields = ['name', 'email', 'phone']; // removed 'specialization'
    if (!validateForm(profile, requiredFields)) {
      console.log('❌ Validation failed!');
      console.log('💡 Missing required fields. Check that name, email, and phone are filled.');
      return;
    }

    console.log('✅ Validation passed!');
    setLoading(true);
    try {
      console.log('💾 Attempting to save profile to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('clinicProfile', JSON.stringify(profile));
      
      // Verify it was saved
      const saved = localStorage.getItem('clinicProfile');
      console.log('✅ Verification - Profile data in localStorage:', saved);
      
      showSnackbar('Profile saved successfully', 'success');
    } catch (error) {
      console.error('❌ Save error:', error);
      showSnackbar('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed Clinic Settings Save Function
  const handleSaveClinicSettings = async () => {
    console.log('🔄 Save Clinic Settings button clicked!');
    console.log('📋 Clinic settings data to save:', clinicSettings);
    
    const requiredFields = ['name', 'address', 'phone', 'email'];
    if (!validateForm(clinicSettings, requiredFields)) {
      console.log('❌ Clinic settings validation failed!');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Attempting to save clinic settings to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
      
      // Verify it was saved
      const saved = localStorage.getItem('clinicSettings');
      console.log('✅ Verification - Clinic settings data in localStorage:', saved);
      
      showSnackbar('Clinic settings saved successfully', 'success');
    } catch (error) {
      console.error('❌ Clinic settings save error:', error);
      showSnackbar('Failed to save clinic settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed Preferences Save Function
  const handleSavePreferences = async () => {
    console.log('🔄 Save Preferences button clicked!');
    console.log('📋 Preferences data to save:', preferences);
    
    setLoading(true);
    try {
      console.log('💾 Attempting to save preferences to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // Verify it was saved
      const saved = localStorage.getItem('userPreferences');
      console.log('✅ Verification - Preferences data in localStorage:', saved);
      
      showSnackbar('Preferences saved successfully', 'success');
    } catch (error) {
      console.error('❌ Preferences save error:', error);
      showSnackbar('Failed to save preferences. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Services Save Function
  const handleSaveServices = async () => {
    console.log('🔄 Save Services button clicked!');
    console.log('📋 Services data to save:', services);
    
    setLoading(true);
    try {
      console.log('💾 Attempting to save services to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('clinicServices', JSON.stringify(services));
      
      // Verify it was saved
      const saved = localStorage.getItem('clinicServices');
      console.log('✅ Verification - Services data in localStorage:', saved);
      
      showSnackbar('Services & Specializations saved successfully', 'success');
    } catch (error) {
      console.error('❌ Services save error:', error);
      showSnackbar('Failed to save services. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Payment Methods Save Function
  const handleSavePaymentMethods = async () => {
    console.log('🔄 Save Payment Methods button clicked!');
    console.log('📋 Payment methods data to save:', paymentMethods);
    
    setLoading(true);
    try {
      console.log('💾 Attempting to save payment methods to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('clinicPaymentMethods', JSON.stringify(paymentMethods));
      
      // Verify it was saved
      const saved = localStorage.getItem('clinicPaymentMethods');
      console.log('✅ Verification - Payment methods data in localStorage:', saved);
      
      showSnackbar('Payment methods saved successfully', 'success');
    } catch (error) {
      console.error('❌ Payment methods save error:', error);
      showSnackbar('Failed to save payment methods. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Appointment Settings Save Function
  const handleSaveAppointmentSettings = async () => {
    console.log('🔄 Save Appointment Settings button clicked!');
    console.log('📋 Appointment settings data to save:', appointmentSettings);
    
    setLoading(true);
    try {
      console.log('💾 Attempting to save appointment settings to localStorage...');
      
      // Save to localStorage
      localStorage.setItem('clinicAppointmentSettings', JSON.stringify(appointmentSettings));
      
      // Verify it was saved
      const saved = localStorage.getItem('clinicAppointmentSettings');
      console.log('✅ Verification - Appointment settings data in localStorage:', saved);
      
      showSnackbar('Appointment settings saved successfully', 'success');
    } catch (error) {
      console.error('❌ Appointment settings save error:', error);
      showSnackbar('Failed to save appointment settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🛡️ Comprehensive Data Validation Helper
  const validateCompleteData = () => {
    const issues = [];
    
    // Check profile data
    if (!profile.name || !profile.email || !profile.phone) {
      issues.push('Profile missing required fields');
    }
    
    // Check clinic settings
    if (!clinicSettings.name || !clinicSettings.address) {
      issues.push('Clinic settings incomplete');
    }
    
    // Check preferences
    if (!preferences.language) {
      issues.push('Preferences incomplete');
    }
    
    return issues;
  };

  // 🚀 Save All Data Function
  const handleSaveAll = async () => {
    const issues = validateCompleteData();
    
    if (issues.length > 0) {
      console.warn('⚠️ Data validation issues:', issues);
      showSnackbar(`Please complete: ${issues.join(', ')}`, 'warning');
      return;
    }
    
    console.log('🔄 Saving all data...');
    // Save all data
    await handleSaveProfile();
    await handleSaveClinicSettings();
    await handleSavePreferences();
    await handleSaveServices();
    await handleSavePaymentMethods();
    await handleSaveAppointmentSettings();
    
    console.log('✅ All data saved successfully!');
    showSnackbar('All settings saved successfully!', 'success');
  };

  const handleChangePassword = async () => {
    const requiredFields = ['currentPassword', 'newPassword', 'confirmPassword'];
    if (!validateForm(passwordForm, requiredFields)) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: t('passwords_do_not_match') });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrors({ newPassword: t('password_min_length') });
      return;
    }

    if (!user) {
      showSnackbar(t('user_not_authenticated'), 'error');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // First, reauthenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Then update the password
      await updatePassword(user, passwordForm.newPassword);
      
      // Success - close dialog and reset form
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordVisibility({ showCurrentPassword: false, showNewPassword: false, showConfirmPassword: false });
      setErrors({});
      showSnackbar(t('password_changed_successfully'), 'success');
    } catch (error: any) {
      console.error('Password change error:', error);
      
      // Handle different error types
      if (error.code === 'auth/wrong-password') {
        setErrors({ currentPassword: t('current_password_incorrect') });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ newPassword: t('password_too_weak') });
      } else if (error.code === 'auth/requires-recent-login') {
        showSnackbar(t('requires_recent_login'), 'error');
      } else {
        showSnackbar(t('failed_to_change_password'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    const requiredFields = ['name', 'email', 'role'];
    if (!validateForm(newStaffForm, requiredFields)) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStaffDialogOpen(false);
      setNewStaffForm({ name: '', email: '', role: '', specialization: '' });
      showSnackbar('Staff member added successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to add staff member. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    const requiredFields = ['licenseNumber'];
    if (!validateForm(credentialsForm, requiredFields)) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update profile with new credentials
      setProfile((prev: any) => ({
        ...prev,
        licenseNumber: credentialsForm.licenseNumber,
        medicalSchool: credentialsForm.medicalSchool,
        residency: credentialsForm.residency,
        certifications: credentialsForm.certifications,
        experience: credentialsForm.experience,
      }));
      
      setCredentialsDialogOpen(false);
      showSnackbar('Credentials updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContactForm = async () => {
    const requiredFields = ['name', 'email', 'subject', 'message'];
    if (!validateForm(contactForm, requiredFields)) return;
  
    setLoading(true);
    try {
      // Generate ticket info
      const ticketId = `TICKET-${Date.now().toString().slice(-6)}`;
      const submittedAt = new Date().toLocaleString();
      
      // Prepare email data
      const emailData: SupportEmailData = {
        fullName: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
        supportType: contactForm.supportType,
        ticketId,
        submittedAt,
        browserInfo: navigator.userAgent
      };
  
      // Try to send email using EmailJS service
      const emailSent = await sendSupportEmail(emailData);
  
      if (emailSent) {
        // ✅ EMAIL SENT SUCCESSFULLY
        setConfirmMessage(`
  ✅ Message sent successfully!
  
  📧 Your support request has been sent to our team
  📋 Support Ticket: ${ticketId}
  🕒 Submitted: ${submittedAt}
  
  We'll respond to your email within 24 hours during business days.
  For urgent matters, you can also contact us via WhatsApp
        `);
        showSnackbar('Message sent successfully to drsuperclinic@gmail.com!', 'success');
      } else {
        // ❌ EMAIL FAILED - Show fallback options
        setConfirmMessage(`
  🔧 EmailJS Setup Required
  
  ${getSetupInstructions()}
  
  📧 Meanwhile, please send your support request manually:
  
  TO: drsuperclinic@gmail.com
  SUBJECT: ClinicCare Support: [${contactForm.supportType.toUpperCase()}] ${contactForm.subject}
  
  Support Ticket: ${ticketId}
  Submitted: ${submittedAt}
  
  From: ${contactForm.name}
  Email: ${contactForm.email}
  Support Type: ${contactForm.supportType}
  
  Message:
  ${contactForm.message}
  
  ---
  Browser: ${navigator.userAgent}
  Sent via ClinicCare Contact Form
  
  📱 OR WhatsApp: +201147299675
        `);
        showSnackbar('EmailJS not configured. Please see setup instructions above.', 'warning');
      }
      
      setConfirmAction(() => {
        setConfirmDialogOpen(false);
        if (emailSent) {
          // If email was sent successfully, just close the dialog
          showSnackbar('Thank you for contacting us!', 'success');
        } else {
          // If email failed, copy email to clipboard as backup
          navigator.clipboard.writeText('drsuperclinic@gmail.com').then(() => {
            showSnackbar('Support email copied to clipboard', 'info');
          }).catch(() => {
            // Silent fail for clipboard
          });
        }
      });
      
      setConfirmDialogOpen(true);
      
      // Reset form only if email was sent successfully
      if (emailSent) {
        setContactForm({
          name: '',
          email: '',
          subject: '',
          message: '',
          supportType: 'general',
        });
      }
      
    } catch (error) {
      console.error('Contact form error:', error);
      showSnackbar('Failed to process your request. Please try contacting us directly.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async () => {
    const requiredFields = ['title', 'description', 'date'];
    if (!validateForm(achievementForm, requiredFields)) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAchievementDialogOpen(false);
      setAchievementForm({ title: '', description: '', date: '', issuer: '' });
      showSnackbar('Achievement added successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to add achievement. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        // Create comprehensive clinic data export
        const exportData = {
          exportInfo: {
            timestamp: new Date().toISOString(),
            clinicName: clinicSettings.name,
            exportedBy: profile.name,
            version: 'ClinicCare v1.0.0'
          },
          profile: profile,
          clinicSettings: clinicSettings,
          preferences: preferences,
          paymentMethods: paymentMethods,
          services: services,
          appointmentSettings: appointmentSettings,
          systemInfo: {
            totalPatients: 0,
            appointmentsThisMonth: 0,
            lastBackup: new Date().toISOString(),
            licenseStatus: t('not_specified')
          }
        };

        // Create JSON export
        const jsonContent = JSON.stringify(exportData, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        
        // Create CSV export for key data
        const csvData = [
          ['Category', 'Field', 'Value'],
          ['Profile', 'Name', profile.name],
          ['Profile', 'Email', profile.email],
          ['Profile', 'Phone', profile.phone],
          ['Profile', 'Specialization', profile.specialization],
          ['Profile', 'License Number', profile.licenseNumber || ''],
          ['Profile', 'Experience', profile.experience || ''],
          ['Clinic', 'Name', clinicSettings.name],
          ['Clinic', 'Address', clinicSettings.address],
          ['Clinic', 'Phone', clinicSettings.phone],
          ['Clinic', 'Email', clinicSettings.email],
          ['Clinic', 'Working Hours', clinicSettings.workingHours],
          ['Clinic', 'Timezone', clinicSettings.timezone],
          ['Statistics', 'Total Patients', '0'],
          ['Statistics', 'Monthly Appointments', '0'],
          ['System', 'Export Date', new Date().toLocaleDateString()],
          ['System', 'Export Time', new Date().toLocaleTimeString()]
        ];
        
        const csvContent = csvData.map(row => 
          row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);

        // Download JSON file
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `clinic_data_${new Date().toISOString().split('T')[0]}.json`;
        jsonLink.click();
        
        // Download CSV file
        setTimeout(() => {
          const csvLink = document.createElement('a');
          csvLink.href = csvUrl;
          csvLink.download = `clinic_data_${new Date().toISOString().split('T')[0]}.csv`;
          csvLink.click();
          
          // Cleanup
          URL.revokeObjectURL(jsonUrl);
          URL.revokeObjectURL(csvUrl);
        }, 100);

      setLoading(false);
        showSnackbar('Complete clinic data exported successfully (JSON & CSV formats)', 'success');
      } catch (error) {
        setLoading(false);
        showSnackbar('Failed to export data. Please try again.', 'error');
      }
    }, 2000);
  };

  // Insurance provider management functions
  const handleAddInsurance = () => {
    if (!newInsuranceName.trim()) return;
    
    const newInsurance = {
      id: Date.now(),
      name: newInsuranceName.trim(),
      enabled: true
    };
    
    setClinicSettings({
      ...clinicSettings,
      insuranceProviders: [...clinicSettings.insuranceProviders, newInsurance]
    });
    
    setNewInsuranceName('');
    setInsuranceDialog(false);
    showSnackbar('Insurance provider added successfully', 'success');
  };

  const handleEditInsurance = () => {
    if (!newInsuranceName.trim() || !editingInsurance) return;
    
    setClinicSettings({
      ...clinicSettings,
      insuranceProviders: clinicSettings.insuranceProviders.map((provider: InsuranceProvider) =>
        provider.id === editingInsurance.id
          ? { ...provider, name: newInsuranceName.trim() }
          : provider
      )
    });
    
    setNewInsuranceName('');
    setEditingInsurance(null);
    setInsuranceDialog(false);
    showSnackbar('Insurance provider updated successfully', 'success');
  };

  const handleDeleteInsurance = (id: number) => {
    setClinicSettings({
      ...clinicSettings,
      insuranceProviders: clinicSettings.insuranceProviders.filter((provider: InsuranceProvider) => provider.id !== id)
    });
    showSnackbar('Insurance provider removed successfully', 'success');
  };

  const handleToggleInsurance = (id: number) => {
    setClinicSettings({
      ...clinicSettings,
      insuranceProviders: clinicSettings.insuranceProviders.map((provider: InsuranceProvider) =>
        provider.id === id
          ? { ...provider, enabled: !provider.enabled }
          : provider
      )
    });
  };

  const openInsuranceDialog = (insurance?: { id: number; name: string }) => {
    if (insurance) {
      setEditingInsurance(insurance);
      setNewInsuranceName(insurance.name);
    } else {
      setEditingInsurance(null);
      setNewInsuranceName('');
    }
    setInsuranceDialog(true);
  };

  const closeInsuranceDialog = () => {
    setInsuranceDialog(false);
    setEditingInsurance(null);
    setNewInsuranceName('');
  };

  const handleResetForm = (formType: 'profile' | 'clinic' | 'preferences') => {
    setConfirmMessage(`Are you sure you want to reset ${formType} settings? All unsaved changes will be lost.`);
    setConfirmAction(() => () => {
      if (formType === 'profile') {
        setProfile({
          name: '',
          email: '',
          phone: '',
          specialization: '',
          emergencyContact: '',
          dateOfBirth: '',
          gender: '',
          experience: '',
          licenseNumber: '',
          medicalSchool: '',
          residency: '',
          certifications: '',
          languages: '',
          consultationFee: '',
          bio: '',
          workingDays: '',
          workingHours: '',
          lunchBreak: '',
          status: 'available',
          profileImage: '',
        });
      } else     if (formType === 'clinic') {
      setClinicSettings({
        name: '',
        address: '',
        phone: '',
        email: '',
        workingHours: '',
        timezone: '',
        licenseNumber: '',
        website: '',
        specialization: '',
        logo: '',
        tagline: '',
        primaryColor: '#1976d2',
        secondaryColor: '#2e7d32',
        description: '',
        appointmentDuration: 30,
        breakBetweenAppointments: 15,
        advanceBookingLimit: 30,
        allowOnlineBooking: false,
        requirePaymentAtBooking: false,
        sendReminders: false,
      });
      }
      setErrors({});
      showSnackbar(`${formType} settings reset successfully`, 'success');
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', md: 'center' }, 
              justifyContent: 'space-between', 
              position: 'relative', 
              zIndex: 1,
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 3, md: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                <Box
                  sx={{
                    width: { xs: 48, sm: 56, md: 64 },
                    height: { xs: 48, sm: 56, md: 64 },
                    borderRadius: { xs: '16px', md: '20px' },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: { xs: 2, sm: 2.5, md: 3 },
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    flexShrink: 0
                  }}
                >
                  <Settings sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h3"
                    sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      mb: { xs: 0.5, md: 1 },
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {t('settings')}
                  </Typography>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    ⚙️ {t('manage_profile_clinic_settings')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Decorative Elements */}
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
          </Box>

          {/* Mobile Settings Navigation - Above Content */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <CardContent sx={{ p: 2, overflowX: 'auto' }}>
                <Tabs
                  orientation="horizontal"
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    minHeight: 'auto',
                    '& .MuiTabs-scrollButtons': {
                      '&.Mui-disabled': {
                        opacity: 0.3,
                      },
                    },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      minHeight: 70,
                      minWidth: 85,
                      maxWidth: 110,
                      justifyContent: 'center',
                      alignItems: 'center',
                      px: 1,
                      py: 1.5,
                      margin: '0 2px',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      color: 'grey.700',
                      border: '2px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        color: 'primary.main',
                        transform: 'translateY(-2px)',
                        borderColor: 'rgba(59, 130, 246, 0.2)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        color: 'primary.main',
                        fontWeight: 700,
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)',
                        borderColor: 'primary.main',
                        '& .MuiSvgIcon-root': {
                          color: 'primary.main'
                        }
                      },
                      '& .MuiTab-iconWrapper': {
                        marginRight: 0,
                        marginBottom: 0.5
                      }
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    },
                  }}
                >
                  <Tab 
                    label={t('profile')} 
                    icon={<Person sx={{ fontSize: 18 }} />}
                    iconPosition="top"
                  />
                  <Tab 
                    label={t('clinic')} 
                    icon={<LocalHospital sx={{ fontSize: 18 }} />}
                    iconPosition="top"
                  />
                  <Tab 
                    label={t('payments')} 
                    icon={<Payment sx={{ fontSize: 18 }} />}
                    iconPosition="top"
                  />

                  <Tab 
                    label={t('security')} 
                    icon={<Security sx={{ fontSize: 18 }} />}
                    iconPosition="top"
                  />
                  <Tab 
                    label={t('system')} 
                    icon={<Storage sx={{ fontSize: 18 }} />}
                    iconPosition="top"
                  />
                </Tabs>
              </CardContent>
            </Card>
          </Box>

          <Grid container spacing={3}>
                         {/* Desktop Settings Navigation - Sidebar */}
             <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
               <Card sx={{ 
                 borderRadius: 4, 
                 boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 4px 25px rgba(0,0,0,0.07)',
                 border: 'none',
                 overflow: 'hidden',
                 background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
               }}>
                 <CardContent sx={{ p: 2 }}>
                   <Tabs
                     orientation="vertical"
                     value={tabValue}
                     onChange={handleTabChange}
                     variant="standard"
                     sx={{ 
                       minHeight: 400,
                       '& .MuiTab-root': {
                         textTransform: 'none',
                         fontWeight: 600,
                         fontSize: '1rem',
                         minHeight: 68,
                         justifyContent: 'flex-start',
                         alignItems: 'center',
                         px: 4,
                         py: 2.5,
                         margin: '0 12px',
                         borderRadius: 3,
                         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                         position: 'relative',
                         overflow: 'hidden',
                         color: 'grey.700',
                         '&::before': {
                           content: '""',
                           position: 'absolute',
                           left: 0,
                           top: 0,
                           bottom: 0,
                           width: '4px',
                           backgroundColor: 'transparent',
                           transition: 'all 0.3s ease'
                         },
                         '&:hover': {
                           backgroundColor: 'rgba(59, 130, 246, 0.08)',
                           color: 'primary.main',
                           transform: 'translateX(4px)',
                           '&::before': {
                             backgroundColor: 'primary.light'
                           }
                         },
                         '&.Mui-selected': {
                           backgroundColor: 'rgba(59, 130, 246, 0.12)',
                           color: 'primary.main',
                           fontWeight: 700,
                           transform: 'translateX(8px)',
                           boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)',
                           '&::before': {
                             backgroundColor: 'primary.main',
                             width: '6px'
                           },
                           '& .MuiSvgIcon-root': {
                             color: 'primary.main'
                           }
                         },
                         '& .MuiTab-iconWrapper': {
                           marginRight: 2,
                           marginBottom: 0
                         }
                       },
                       '& .MuiTabs-indicator': {
                         display: 'none'
                       },
                     }}
                   >
                     <Tab 
                       label={t('profile_management')} 
                       icon={<Person sx={{ fontSize: 26 }} />}
                       iconPosition="start"
                     />
                     <Tab 
                       label={t('clinic_settings_tab')} 
                       icon={<LocalHospital sx={{ fontSize: 26 }} />}
                       iconPosition="start"
                     />
                     <Tab 
                       label={t('payment_settings')} 
                       icon={<Payment sx={{ fontSize: 26 }} />}
                       iconPosition="start"
                     />

                     <Tab 
                       label={t('security_privacy')} 
                       icon={<Security sx={{ fontSize: 26 }} />}
                       iconPosition="start"
                     />
                     <Tab 
                       label={t('system_settings')} 
                       icon={<Storage sx={{ fontSize: 26 }} />}
                       iconPosition="start"
                     />
                   </Tabs>
                 </CardContent>
               </Card>
             </Grid>

            {/* Settings Content */}
            <Grid item xs={12} md={9}>
              {/* Profile Settings */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  {/* Profile Info Card - Now Full Width */}
                  <Grid item xs={12}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: { xs: 3, md: 5 },
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            gap: { xs: 2, md: 3 },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}>
                            <Box sx={{
                              p: { xs: 2, md: 2.5 },
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                            }}>
                              <Person sx={{ fontSize: { xs: 28, md: 32 } }} />
                            </Box>
                            <Box>
                              <Typography variant="h3" sx={{ 
                                fontWeight: 900, 
                                color: 'grey.800',
                                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                mb: 0.5
                              }}>
                                {t('profile_information')}
                              </Typography>
                              <Typography variant="body1" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500,
                                fontSize: { xs: '0.9rem', md: '1rem' }
                              }}>
                                {t('manage_personal_professional_details')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Card Content */}
                        <Box sx={{ p: { xs: 3, md: 6 } }}>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'center', sm: 'flex-start' }, 
                          mb: 4,
                          gap: { xs: 2, sm: 0 },
                          textAlign: { xs: 'center', sm: 'left' }
                        }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={profile.profileImage}
                              sx={{
                                width: { xs: 100, md: 120 },
                                height: { xs: 100, md: 120 },
                                mr: { xs: 0, sm: 3 },
                                mb: { xs: 2, sm: 0 },
                                backgroundColor: 'primary.main',
                                fontSize: { xs: '2.2rem', md: '2.8rem' },
                                border: '4px solid white',
                                boxShadow: 3,
                              }}
                            >
                              {profile.name.split(' ').map((n: string) => n[0]).join('')}
                            </Avatar>
                            <IconButton
                              onClick={() => profileImageRef.current?.click()}
                              sx={{
                                position: 'absolute',
                                bottom: { xs: 8, sm: 0 },
                                right: { xs: 8, sm: 20 },
                                backgroundColor: 'primary.main',
                                color: 'white',
                                width: { xs: 35, md: 40 },
                                height: { xs: 35, md: 40 },
                                '&:hover': { backgroundColor: 'primary.dark' },
                                boxShadow: 2,
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <input
                              type="file"
                              ref={profileImageRef}
                              style={{ display: 'none' }}
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'profile')}
                            />
                          </Box>
                          <Box>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 700, 
                              mb: 1,
                              fontSize: { xs: '1.5rem', md: '2rem' }
                            }}>
                              {profile.name}
                            </Typography>
                            <Typography variant="h6" color="primary.main" sx={{ 
                              mb: 1,
                              fontSize: { xs: '1rem', md: '1.25rem' }
                            }}>
                              {profile.specialization}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ 
                              mb: { xs: 3, sm: 2 },
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }}>
                              {profile.email}
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 2, 
                              mb: 3,
                              alignItems: { xs: 'center', sm: 'flex-start' }
                            }}>
                              <Button 
                                variant="contained" 
                                size="medium" 
                                startIcon={isEditingProfile ? <Close /> : <Edit />}
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                sx={{ 
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 3,
                                  py: 1,
                                  boxShadow: 2,
                                  fontSize: { xs: '0.9rem', md: '1rem' }
                                }}
                              >
                                {isEditingProfile ? t('cancel_edit') : t('edit_profile')}
                              </Button>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 2,
                              alignItems: { xs: 'center', sm: 'flex-start' }
                            }}>
                              <Chip 
                                label={t('available')} 
                                color="success" 
                                size="small"
                                icon={<Check fontSize="small" />}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{
                                fontSize: { xs: '0.8rem', md: '0.875rem' }
                              }}>
                                {t('last_updated')}: {t('hours_ago', { count: 2 })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Profile Information Display/Edit */}
                        {!isEditingProfile ? (
                          // Display Mode - Show profile information
                          <Box>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600, 
                              mb: 3,
                              fontSize: { xs: '1.1rem', md: '1.25rem' }
                            }}>
                              {t('profile_information')}
                            </Typography>
                            
                            {/* Basic Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                mb: 2, 
                                color: 'primary.main',
                                fontSize: { xs: '1rem', md: '1.1rem' }
                              }}>
                                {t('basic_information')}
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('full_name')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.name || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('email_address')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.email || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('phone_number')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.phone || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('emergency_contact')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.emergencyContact || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('date_of_birth')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.dateOfBirth || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('gender')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500, 
                                      textTransform: 'capitalize',
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.gender || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* Professional Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                mb: 2, 
                                color: 'primary.main',
                                fontSize: { xs: '1rem', md: '1.1rem' }
                              }}>
                                {t('professional_information')}
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('primary_specialization')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.specialization || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('years_of_experience')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.experience ? t('years_text', { count: Number(profile.experience) }) : t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('medical_license_number')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.licenseNumber || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('medical_school')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.medicalSchool || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('residency')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.residency || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      mb: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}>
                                      {t('board_certifications')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 500,
                                      fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}>
                                      {profile.certifications || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Box>
                        ) : (
                          // Edit Mode - Show editable form
                          <Box>
                        
                        {/* Basic Information */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          {t('basic_information')}
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('full_name')}
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                  error={!!errors.name}
                                  helperText={errors.name}
                                  required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('email_address')}
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                  error={!!errors.email}
                                  helperText={errors.email}
                                  required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('phone_number')}
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                  error={!!errors.phone}
                                  helperText={errors.phone}
                                  required
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('emergency_contact')}
                                  value={profile.emergencyContact}
                                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                  placeholder="+20 10 XXXX XXXX"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('date_of_birth')}
                              type="date"
                                  value={profile.dateOfBirth}
                                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>{t('gender')}</InputLabel>
                                  <Select 
                                    label={t('gender')}
                                    value={profile.gender}
                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                  >
                                <MenuItem value="male">{t('male')}</MenuItem>
                                <MenuItem value="female">{t('female')}</MenuItem>
                                <MenuItem value="other">{t('other')}</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* Professional Information */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          {t('professional_information')}
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                              <InputLabel>{t('primary_specialization')}</InputLabel>
                              <Select
                                value={profile.specialization}
                                label={t('primary_specialization')}
                                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                    error={!!errors.specialization}
                              >
                                <MenuItem value="General Practitioner">General Practitioner</MenuItem>
                                <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                                <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                                <MenuItem value="Pediatrician">Pediatrician</MenuItem>
                                <MenuItem value="Neurologist">Neurologist</MenuItem>
                                <MenuItem value="Orthopedic Surgeon">Orthopedic Surgeon</MenuItem>
                                <MenuItem value="Ophthalmologist">Ophthalmologist</MenuItem>
                                <MenuItem value="Psychiatrist">Psychiatrist</MenuItem>
                                <MenuItem value="Gynecologist">Gynecologist</MenuItem>
                                <MenuItem value="Urologist">Urologist</MenuItem>
                              </Select>
                                  {errors.specialization && <FormHelperText error>{errors.specialization}</FormHelperText>}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('years_of_experience')}
                              type="number"
                                  value={profile.experience}
                                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                              placeholder="8"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('medical_license_number')}
                                  value={profile.licenseNumber}
                                  onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                                  placeholder={t('enter_license_number')}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('medical_school')}
                                  value={profile.medicalSchool}
                                  onChange={(e) => setProfile({ ...profile, medicalSchool: e.target.value })}
                                  placeholder="Cairo University Faculty of Medicine"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('residency')}
                                  value={profile.residency}
                                  onChange={(e) => setProfile({ ...profile, residency: e.target.value })}
                                  placeholder="Kasr Al Ainy Hospital"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('board_certifications')}
                                  value={profile.certifications}
                                  onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                                  placeholder={t('enter_medical_authority')}
                            />
                          </Grid>
                        </Grid>

                        {/* Languages & Bio */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          {t('languages_bio')}
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('languages_spoken')}
                                  value={profile.languages}
                                  onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                              placeholder="English, Arabic, Hindi"
                              helperText="Separate languages with commas"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('consultation_fee')}
                              type="number"
                                  value={profile.consultationFee}
                                  onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                                  placeholder="500"
                              InputProps={{
                                startAdornment: (
                                  <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                                        EGP
                                  </Typography>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label={t('professional_bio')}
                              multiline
                              rows={4}
                                  value={profile.bio}
                                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                              placeholder={t('bio_placeholder')}
                              helperText="This information will be visible to patients on your profile"
                            />
                          </Grid>
                        </Grid>

                        {/* Availability Settings */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          {t('availability_settings')}
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('working_days')}
                                  value={profile.workingDays}
                                  onChange={(e) => setProfile({ ...profile, workingDays: e.target.value })}
                              placeholder="Monday - Friday"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('working_hours')}
                                  value={profile.workingHours}
                                  onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                              placeholder="9:00 AM - 6:00 PM"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={t('lunch_break')}
                                  value={profile.lunchBreak}
                                  onChange={(e) => setProfile({ ...profile, lunchBreak: e.target.value })}
                              placeholder="1:00 PM - 2:00 PM"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>{t('status')}</InputLabel>
                                  <Select 
                                    label={t('status')} 
                                    value={profile.status}
                                    onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                                  >
                                <MenuItem value="available">{t('available')}</MenuItem>
                                <MenuItem value="busy">{t('busy')}</MenuItem>
                                <MenuItem value="vacation">{t('vacation')}</MenuItem>
                                <MenuItem value="emergency">{t('emergency_only')}</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                            <Box sx={{ 
                              mt: 5, 
                              pt: 4,
                              borderTop: 1,
                              borderColor: 'grey.200',
                              display: 'flex', 
                              gap: 3,
                              justifyContent: 'flex-end'
                            }}>
                              <Button 
                                variant="outlined"
                                onClick={() => {
                                  handleResetForm('profile');
                                  setIsEditingProfile(false);
                                }}
                                disabled={loading}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 4,
                                  py: 1.5,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2
                                  }
                                }}
                              >
                            {t('cancel')}
                          </Button>
                              <Button 
                                variant="contained" 
                                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                onClick={async () => {
                                  await handleSaveProfile();
                                  if (!Object.keys(errors).length) {
                                    setIsEditingProfile(false);
                                  }
                                }}
                                disabled={loading}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 4,
                                  py: 1.5,
                                  boxShadow: 3,
                                  '&:hover': {
                                    boxShadow: 6
                                  }
                                }}
                              >
                                {loading ? t('saving_profile') : t('save_changes')}
                          </Button>
                            </Box>
                          </Box>
                        )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Profile Statistics & Achievements Section */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      {/* Profile Statistics Card */}
                      <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                          overflow: 'hidden',
                          height: '100%'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: 4,
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(147, 197, 253, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2.5
                          }}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                            }}>
                              <Business sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: 'grey.800',
                                fontSize: '1.3rem',
                                mb: 0.2
                              }}>
                                {t('profile_statistics')}
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                {t('performance_overview')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                        <List sx={{ p: 0 }}>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <People color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={t('total_patients')}
                              secondary="0"
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <Schedule color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={t('appointments_this_month')}
                              secondary="0"
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <Business color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={t('years_of_experience')}
                              secondary={profile.experience || "0"}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemIcon>
                                    <Check color="primary" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={t('successful_treatments')}
                                    secondary="0"
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                        </List>
                        </Box>
                      </CardContent>
                    </Card>
                      </Grid>

                      {/* Achievements & Certifications Card */}
                      <Grid item xs={12} md={6}>
                    <Card sx={{ 
                          borderRadius: 4, 
                          boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                          border: 'none',
                          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                          overflow: 'hidden',
                          height: '100%'
                        }}>
                          <CardContent sx={{ p: 0 }}>
                            {/* Card Header */}
                            <Box sx={{ 
                              p: 4,
                              background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                              position: 'relative',
                              borderBottom: '1px solid rgba(252, 211, 77, 0.3)',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                              }
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2.5
                              }}>
                                <Box sx={{
                                  p: 2,
                                  borderRadius: 3,
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  color: 'white',
                                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                                }}>
                                  <Check sx={{ fontSize: 24 }} />
                                </Box>
                                <Box>
                                  <Typography variant="h6" sx={{ 
                                    fontWeight: 800, 
                                    color: 'grey.800',
                                    fontSize: '1.3rem',
                                    mb: 0.2
                                  }}>
                                    {t('achievements_certifications')}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: 'grey.600',
                                    fontWeight: 500
                                  }}>
                                    {t('awards_recognitions')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            {/* Card Content */}
                            <Box sx={{ p: 4 }}>
                              <List sx={{ p: 0 }}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary={t('board_certified')}
                                    secondary={profile.certifications || t('not_specified')}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary={t('excellence_award')}
                                    secondary={t('not_specified')}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary={t('medical_school')}
                                    secondary={profile.medicalSchool || t('not_specified')}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary={t('professional_member')}
                                    secondary={t('not_specified')}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                              </List>
                              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'grey.200' }}>
                                <Button 
                                  variant="contained" 
                                  size="medium" 
                                  fullWidth 
                                  startIcon={<Add />}
                                  onClick={() => setAchievementDialogOpen(true)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    boxShadow: 2,
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                      boxShadow: 4
                                    }
                                  }}
                                >
                                  {t('add_achievement')}
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Professional Information & Quick Actions */}
                  <Grid item xs={12}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: 4,
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(134, 239, 172, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                            }}>
                              <Shield sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: 'grey.800',
                                fontSize: '1.3rem',
                                mb: 0.2
                              }}>
                                  {t('professional_information_actions')}
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                  {t('license_details_quick_actions')}
                              </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                          <Grid container spacing={4}>
                            {/* License Information */}
                            <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('license_number')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {profile.licenseNumber || t('not_specified')}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('registration_date')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {t('not_specified')}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('department')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {profile.specialization}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('license_status')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'success.main',
                                mr: 1,
                              }}
                            />
                            <Typography variant="body1" fontWeight={600} color="text.secondary">
                              {t('not_specified')}
                            </Typography>
                          </Box>
                        </Box>
                            </Grid>

                            {/* Quick Actions */}
                            <Grid item xs={12} md={6}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center' }}>
                          <Button 
                            variant="contained" 
                            size="medium" 
                            fullWidth 
                            onClick={() => {
                              setCredentialsForm({
                                licenseNumber: profile.licenseNumber || '',
                                medicalSchool: profile.medicalSchool || '',
                                residency: profile.residency || '',
                                certifications: profile.certifications || '',
                                experience: profile.experience || '',
                              });
                              setCredentialsDialogOpen(true);
                            }}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              py: 1.5,
                              boxShadow: 2
                            }}
                          >
                          {t('update_credentials')}
                        </Button>
                          <Button 
                            variant="outlined" 
                            size="medium" 
                            fullWidth
                            onClick={() => setCertificateDialogOpen(true)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              py: 1.5,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                          {t('view_certificate')}
                        </Button>
                        </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Clinic Settings */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {/* Basic Clinic Information */}
                  <Grid item xs={12}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: 5,
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(147, 197, 253, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Box sx={{
                              p: 2.5,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                            }}>
                              <LocalHospital sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                              <Typography variant="h3" sx={{ 
                                fontWeight: 900, 
                                color: 'grey.800',
                                fontSize: '2rem',
                                mb: 0.5
                              }}>
                          {t('basic_clinic_information')}
                        </Typography>
                              <Typography variant="body1" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                {t('view_clinic_core_details')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Card Content */}
                        <Box sx={{ p: 6 }}>
                          {/* Clinic Logo and Header Info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar
                                src={clinicSettings.logo}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  mr: 3,
                                  backgroundColor: 'primary.main',
                                  fontSize: '2.2rem',
                                  border: '4px solid white',
                                  boxShadow: 3,
                                }}
                              >
                                {clinicSettings.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </Avatar>
                            </Box>
                            <Box>
                              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {clinicSettings.name}
                              </Typography>
                              <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                                {clinicSettings.specialization === 'general' ? 'General Medicine' : 
                                 clinicSettings.specialization === 'family' ? 'Family Medicine' :
                                 clinicSettings.specialization === 'internal' ? 'Internal Medicine' :
                                 clinicSettings.specialization === 'pediatrics' ? 'Pediatrics' :
                                 clinicSettings.specialization === 'cardiology' ? 'Cardiology' : 'General Medicine'}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {clinicSettings.email}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Chip 
                                  label={t('status_unknown')} 
                                  color="success" 
                                  size="small"
                                  icon={<Check fontSize="small" />}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {t('licensed_medical_facility')}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 4 }} />

                          {/* Clinic Information Display */}
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                              {t('clinic_information')}
                            </Typography>
                            
                            {/* Basic Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                {t('basic_information')}
                              </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      {t('clinic_name')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.name || 'Not specified'}
                                    </Typography>
                                  </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      License Number
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.licenseNumber || t('not_specified')}
                                    </Typography>
                                  </Box>
                          </Grid>
                          <Grid item xs={12}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Address
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                                      {clinicSettings.address || 'Not specified'}
                                    </Typography>
                                  </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Phone Number
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.phone || 'Not specified'}
                                    </Typography>
                                  </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Email Address
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.email || 'Not specified'}
                                    </Typography>
                                  </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Website
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.website || 'Not specified'}
                                    </Typography>
                                  </Box>
                          </Grid>
                              </Grid>
                            </Box>

                            {/* Operation Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                {t('operation_information')}
                              </Typography>
                              <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Working Hours
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.workingHours || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Timezone
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.timezone || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Primary Specialization
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.specialization || t('not_specified')}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      License Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          backgroundColor: 'success.main',
                                          mr: 1,
                                        }}
                                      />
                                      <Typography variant="body1" fontWeight={500} color="success.main">
                                        {t('active_valid')}
                                      </Typography>
                                    </Box>
                                  </Box>
                          </Grid>
                              </Grid>
                            </Box>

                            
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  

                  {/* Services & Specializations */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: 4,
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(134, 239, 172, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2.5
                          }}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                            }}>
                              <MedicalServices sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: 'grey.800',
                                fontSize: '1.3rem',
                                mb: 0.2
                              }}>
                          Services & Specializations
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                Configure offered services
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Primary Specialization</InputLabel>
                          <Select 
                            label="Primary Specialization"
                            value={clinicSettings.specialization}
                            onChange={(e) => setClinicSettings({ ...clinicSettings, specialization: e.target.value })}
                          >
                            <MenuItem value="general">General Medicine</MenuItem>
                            <MenuItem value="family">Family Medicine</MenuItem>
                            <MenuItem value="internal">Internal Medicine</MenuItem>
                            <MenuItem value="pediatrics">Pediatrics</MenuItem>
                            <MenuItem value="cardiology">Cardiology</MenuItem>
                          </Select>
                        </FormControl>

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Services Offered
                        </Typography>
                        
                        <List sx={{ p: 0 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={services.consultation}
                                  onChange={(e) => setServices({ ...services, consultation: e.target.checked })}
                                />
                              }
                              label="General Consultation"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={services.checkups}
                                  onChange={(e) => setServices({ ...services, checkups: e.target.checked })}
                                />
                              }
                              label="Health Check-ups"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={services.vaccinations}
                                  onChange={(e) => setServices({ ...services, vaccinations: e.target.checked })}
                                />
                              }
                              label="Vaccinations"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={services.labTests}
                                  onChange={(e) => setServices({ ...services, labTests: e.target.checked })}
                                />
                              }
                              label="Laboratory Tests"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={services.radiology}
                                  onChange={(e) => setServices({ ...services, radiology: e.target.checked })}
                                />
                              }
                              label="Radiology Services"
                            />
                          </ListItem>
                        </List>
                        
                        {/* Save Button */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSaveServices}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '1rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)'
                              }
                            }}
                          >
                            {loading ? 'Saving...' : 'Save Services'}
                          </Button>
                        </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Insurance & Payment */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: 4,
                          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(252, 211, 77, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2.5
                          }}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                            }}>
                              <Payment sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: 'grey.800',
                                fontSize: '1.3rem',
                                mb: 0.2
                              }}>
                          Insurance & Payment
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                Payment & insurance options
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Accepted Insurance Providers
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => openInsuranceDialog()}
                            sx={{ textTransform: 'none' }}
                          >
                            Add Provider
                          </Button>
                        </Box>
                        
                        <List sx={{ p: 0, mb: 2 }}>
                          {clinicSettings.insuranceProviders && clinicSettings.insuranceProviders.length > 0 ? (
                            clinicSettings.insuranceProviders.map((provider: InsuranceProvider) => (
                              <ListItem 
                                key={provider.id} 
                                sx={{ 
                                  px: 0, 
                                  py: 0.5, 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Switch 
                                      checked={provider.enabled}
                                      onChange={() => handleToggleInsurance(provider.id)}
                                    />
                                  }
                                  label={provider.name}
                                  sx={{ flexGrow: 1 }}
                                />
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => openInsuranceDialog(provider)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteInsurance(provider.id)}
                                    sx={{ p: 0.5, color: 'error.main' }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </ListItem>
                            ))
                          ) : (
                            <ListItem sx={{ px: 0, py: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No insurance providers added yet. Click "Add Provider" to add one.
                              </Typography>
                            </ListItem>
                          )}
                        </List>

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Payment Methods
                        </Typography>
                        
                        <List sx={{ p: 0 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={paymentMethods.cash}
                                  onChange={(e) => setPaymentMethods({ ...paymentMethods, cash: e.target.checked })}
                                />
                              }
                              label="Cash"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={paymentMethods.cards}
                                  onChange={(e) => setPaymentMethods({ ...paymentMethods, cards: e.target.checked })}
                                />
                              }
                              label="Credit/Debit Cards"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={paymentMethods.bankTransfer}
                                  onChange={(e) => setPaymentMethods({ ...paymentMethods, bankTransfer: e.target.checked })}
                                />
                              }
                              label="Bank Transfer"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={paymentMethods.digitalWallets}
                                  onChange={(e) => setPaymentMethods({ ...paymentMethods, digitalWallets: e.target.checked })}
                                />
                              }
                              label="Digital Wallets"
                            />
                          </ListItem>
                        </List>
                        
                        {/* Save Button */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSavePaymentMethods}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '1rem',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 12px 35px rgba(245, 158, 11, 0.4)'
                              }
                            }}
                          >
                            {loading ? 'Saving...' : 'Save Payment Settings'}
                          </Button>
                        </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                 
                     

                  {/* Appointment Settings */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 0 }}>
                        {/* Card Header */}
                        <Box sx={{ 
                          p: 4,
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(147, 197, 253, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2.5
                          }}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                            }}>
                              <Schedule sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: 'grey.800',
                                fontSize: '1.3rem',
                                mb: 0.2
                              }}>
                          Appointment Settings
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                Configure appointment rules
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Default Appointment Duration"
                              type="number"
                              value={clinicSettings.appointmentDuration}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, appointmentDuration: parseInt(e.target.value) || 30 })}
                              InputProps={{
                                endAdornment: (
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    minutes
                                  </Typography>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Break Between Appointments"
                              type="number"
                              value={clinicSettings.breakBetweenAppointments}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, breakBetweenAppointments: parseInt(e.target.value) || 15 })}
                              InputProps={{
                                endAdornment: (
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    minutes
                                  </Typography>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Advance Booking Limit"
                              type="number"
                              value={clinicSettings.advanceBookingLimit}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, advanceBookingLimit: parseInt(e.target.value) || 30 })}
                              InputProps={{
                                endAdornment: (
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    days
                                  </Typography>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={clinicSettings.allowOnlineBooking}
                                  onChange={(e) => setClinicSettings({ ...clinicSettings, allowOnlineBooking: e.target.checked })}
                                />
                              }
                              label="Allow Online Booking"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={clinicSettings.requirePaymentAtBooking}
                                  onChange={(e) => setClinicSettings({ ...clinicSettings, requirePaymentAtBooking: e.target.checked })}
                                />
                              }
                              label="Require Payment at Booking"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={clinicSettings.sendReminders}
                                  onChange={(e) => setClinicSettings({ ...clinicSettings, sendReminders: e.target.checked })}
                                />
                              }
                              label="Send Reminder Notifications"
                            />
                          </Grid>
                          
                          {/* Save Button */}
                          <Grid item xs={12}>
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSaveAppointmentSettings}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
                                sx={{
                                  py: 1.5,
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  fontSize: '1rem',
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)'
                                  }
                                }}
                              >
                                {loading ? 'Saving...' : 'Save Appointment Settings'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                 

                  {/* Save Button */}
                  <Grid item xs={12}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                      border: 'none',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined"
                            onClick={() => handleResetForm('clinic')}
                            disabled={loading}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 4,
                              py: 1.5,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                            Reset Changes
                      </Button>
                          <Button 
                            variant="contained" 
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            onClick={handleSaveClinicSettings}
                            disabled={loading}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 4,
                              py: 1.5,
                              boxShadow: 3,
                              '&:hover': {
                                boxShadow: 6
                              }
                            }}
                          >
                            {loading ? 'Saving Clinic Settings...' : 'Save Clinic Settings'}
                      </Button>
                    </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Payment Settings */}
              <TabPanel value={tabValue} index={2}>
                <ClinicPaymentSettingsComponent />
              </TabPanel>

              {/* Security Settings */}
              <TabPanel value={tabValue} index={3}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                  border: 'none',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Card Header */}
                    <Box sx={{ 
                      p: 5,
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      position: 'relative',
                      borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                                                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                        }}>
                          <Security sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 900, 
                            color: 'grey.800',
                            fontSize: '2rem',
                            mb: 0.5
                          }}>
                            Security Settings
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: 'grey.600',
                            fontWeight: 500
                          }}>
                            Protect your account with advanced security features
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 6 }}>
                      <List>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <Lock color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Change Password"
                            secondary="Update your password regularly for better security"
                          />
                          <ListItemSecondaryAction>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => setPasswordDialogOpen(true)}
                            >
                              Change
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* System Settings */}
              <TabPanel value={tabValue} index={4}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                  border: 'none',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Card Header */}
                    <Box sx={{ 
                      p: 5,
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                      position: 'relative',
                      borderBottom: '1px solid rgba(252, 165, 165, 0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
                        }}>
                          <Security sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 900, 
                            color: 'grey.800',
                            fontSize: '2rem',
                            mb: 0.5
                          }}>
                      Security Settings
                    </Typography>
                          <Typography variant="body1" sx={{ 
                            color: 'grey.600',
                            fontWeight: 500
                          }}>
                            Protect your account with advanced security features
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 6 }}>
                    

                    <List>
                      
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Lock color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Change Password"
                          secondary="Update your password regularly for better security"
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setPasswordDialogOpen(true)}
                          >
                            Change
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                     
                    </List>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* System Settings */}
              <TabPanel value={tabValue} index={4}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: '0 12px 50px rgba(0,0,0,0.12), 0 6px 30px rgba(0,0,0,0.08)',
                  border: 'none',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Card Header */}
                    <Box sx={{ 
                      p: 5,
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      position: 'relative',
                      borderBottom: '1px solid rgba(134, 239, 172, 0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                        }}>
                          <Storage sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 900, 
                            color: 'grey.800',
                            fontSize: '2rem',
                            mb: 0.5
                          }}>
                      System Settings
                    </Typography>
                          <Typography variant="body1" sx={{ 
                            color: 'grey.600',
                            fontWeight: 500
                          }}>
                            Manage system preferences and data operations
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 6 }}>
                    <List>
                      <ListItem>
                        
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Download color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Data Export"
                          secondary="Export your clinic data for backup or migration"
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={loading ? <CircularProgress size={16} /> : <Download />}
                            onClick={handleExportData}
                            disabled={loading}
                          >
                            {loading ? 'Exporting...' : 'Export'}
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      {/* <ListItem>
                        <ListItemIcon>
                          <Delete color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Clear All Data"
                          secondary="Remove all patients, appointments, payments, and notifications (cannot be undone)"
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => {
                              setConfirmMessage('Are you sure you want to clear ALL clinic data? This will remove all patients, appointments, payments, and notifications. This action cannot be undone.');
                              setConfirmAction(() => () => {
                                // Clear all localStorage data
                                localStorage.removeItem('clinic_patients_data');
                                localStorage.removeItem('clinic_appointments_data');
                                localStorage.removeItem('clinic_payments_data');
                                localStorage.removeItem('clinic_notifications_data');
                                localStorage.removeItem('clinic_inventory_data');
                                
                                // Trigger application-wide data clearing
                                window.dispatchEvent(new CustomEvent('userDataCleared'));
                                
                                // Show success message
                                showSnackbar('All clinic data cleared successfully! The application will refresh.', 'success');
                                
                                // Refresh the page after a short delay
                                setTimeout(() => {
                                  window.location.reload();
                                }, 2000);
                              });
                              setConfirmDialogOpen(true);
                            }}
                          >
                            Clear All
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem> */}
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Help color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Help & Support"
                          secondary="Get help and contact our support team"
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setHelpDialogOpen(true)}
                          >
                            Get Help
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>

                    
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
            </Grid>
          </Grid>

          {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock color="primary" />
              <Typography variant="h6">{t('change_password')}</Typography>
            </Box>
            <IconButton onClick={() => setPasswordDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('enter_current_password_and_new_password')}
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('current_password')}
                type={passwordVisibility.showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showCurrentPassword')}
                        edge="end"
                        size="small"
                      >
                        {passwordVisibility.showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('new_password')}
                type={passwordVisibility.showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                error={!!errors.newPassword}
                helperText={errors.newPassword || t('password_min_length')}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showNewPassword')}
                        edge="end"
                        size="small"
                      >
                        {passwordVisibility.showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('confirm_new_password')}
                type={passwordVisibility.showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('showConfirmPassword')}
                        edge="end"
                        size="small"
                      >
                        {passwordVisibility.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => {
            setPasswordDialogOpen(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordVisibility({ showCurrentPassword: false, showNewPassword: false, showConfirmPassword: false });
            setErrors({});
          }} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Lock />}
          >
            {loading ? t('updating_password') : t('change_password')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login History Dialog */}
      <Dialog open={loginHistoryDialogOpen} onClose={() => setLoginHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Login History</Typography>
            <IconButton onClick={() => setLoginHistoryDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {loginHistory.length > 0 ? (
              loginHistory.map((login, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <History color={login.status === 'Success' ? 'primary' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{login.device}</Typography>
                          <Chip 
                            label={login.status} 
                            size="small" 
                            color={login.status === 'Success' ? 'success' : 'error'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {login.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {login.location}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < loginHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No login history available
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={staffDialogOpen} onClose={() => setStaffDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Add Staff Member</Typography>
            <IconButton onClick={() => setStaffDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={newStaffForm.name}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={newStaffForm.email}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newStaffForm.role}
                  label="Role"
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  error={!!errors.role}
                >
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  <MenuItem value="technician">Technician</MenuItem>
                </Select>
                {errors.role && <FormHelperText error>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Specialization"
                value={newStaffForm.specialization}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, specialization: e.target.value })}
                placeholder="Optional"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setStaffDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddStaff}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Add />}
          >
            {loading ? 'Adding...' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            <Typography variant="h6">Confirm Action</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">{confirmMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="warning" 
            onClick={confirmAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Certificate Dialog */}
      <Dialog open={certificateDialogOpen} onClose={() => setCertificateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Medical License Certificate</Typography>
            <IconButton onClick={() => setCertificateDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 4,
                backgroundColor: 'grey.50',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Shield sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Medical License Certificate
              </Typography>
                                                           <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                 License Number: {profile.licenseNumber || t('not_specified')}
               </Typography>
               <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                 Issued by: {t('medical_authority')}
               </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={t('status_unknown')} color="primary" />
                <Chip label="Verified" color="primary" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                {t('validity_not_specified')}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={() => showSnackbar('Certificate downloaded successfully', 'success')}
          >
            Download PDF
          </Button>
          <Button onClick={() => setCertificateDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Credentials Dialog */}
      <Dialog open={credentialsDialogOpen} onClose={() => setCredentialsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Update Professional Credentials</Typography>
            <IconButton onClick={() => setCredentialsDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medical License Number"
                value={credentialsForm.licenseNumber}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, licenseNumber: e.target.value })}
                error={!!errors.licenseNumber}
                helperText={errors.licenseNumber}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={credentialsForm.experience}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, experience: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('medical_school')}
                value={credentialsForm.medicalSchool}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, medicalSchool: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Residency Program"
                value={credentialsForm.residency}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, residency: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Board Certifications"
                multiline
                rows={3}
                value={credentialsForm.certifications}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, certifications: e.target.value })}
                placeholder="List your board certifications, separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCredentialsDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateCredentials}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          >
            {loading ? 'Updating...' : 'Update Credentials'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Achievement Dialog */}
      <Dialog open={achievementDialogOpen} onClose={() => setAchievementDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Add Achievement</Typography>
            <IconButton onClick={() => setAchievementDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Achievement Title"
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
                placeholder={t('enter_achievement_title')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date Received"
                type="date"
                value={achievementForm.date}
                onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
                         <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Issuing Organization"
                 value={achievementForm.issuer}
                 onChange={(e) => setAchievementForm({ ...achievementForm, issuer: e.target.value })}
                 placeholder={t('enter_issuing_organization')}
               />
             </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Describe the achievement and its significance..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAchievementDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddAchievement}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Add />}
          >
            {loading ? 'Adding...' : 'Add Achievement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Help color="primary" />
              <Typography variant="h6">Help & Support Center</Typography>
            </Box>
            <IconButton onClick={() => setHelpDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Quick Contact Info */}
            <Box sx={{ mb: 4, p: 3, backgroundColor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🆘 Need Immediate Help?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>💬 WhatsApp Support</Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="contained"
                    sx={{ 
                      mt: 1, 
                      backgroundColor: 'white', 
                      color: 'primary.main', 
                      '&:hover': { backgroundColor: 'grey.100' } 
                    }}
                    onClick={() => {
                      const message = encodeURIComponent('Hello! I need support with ClinicCare system. Please assist me with my inquiry.');
                      window.open(`https://wa.me/201147299675?text=${message}`);
                      showSnackbar('Opening WhatsApp support...', 'success');
                    }}
                  >
                    💬 Chat Now
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>📧 Email Support:</Typography>
                  </Box>
                  <Typography variant="body2">drsuperclinic@gmail.com</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Contact Support Form */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              💬 Contact Support
            </Typography>
            
            <Card sx={{ p: 3, mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
                Send us a message and we'll get back to you soon
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Support Type</InputLabel>
                    <Select
                      value={contactForm.supportType}
                      label="Support Type"
                      onChange={(e) => setContactForm({ ...contactForm, supportType: e.target.value })}
                    >
                      <MenuItem value="general">General Support</MenuItem>
                      <MenuItem value="technical">Technical Support</MenuItem>
                      <MenuItem value="billing">Billing Support</MenuItem>
                      <MenuItem value="feature">Feature Request</MenuItem>
                      <MenuItem value="bug">Bug Report</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    error={!!errors.message}
                    helperText={errors.message}
                    placeholder="Please describe your issue or question in detail..."
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmitContactForm}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={16} /> : <Help />}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setContactForm({
                        name: '',
                        email: '',
                        subject: '',
                        message: '',
                        supportType: 'general',
                      })}
                      disabled={loading}
                    >
                      Clear Form
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            {/* FAQ Section */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📋 Frequently Asked Questions
            </Typography>
            
            <List sx={{ mb: 4 }}>
              
              
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, px: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  ❓ How do I update my medical license information?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Go to Profile Management → Professional Information & Actions and click "Update Credentials" to modify your license details.
                </Typography>
              </ListItem>
              <Divider />
              
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, px: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  ❓ How do I change my password?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visit Security & Privacy settings and click "Change" next to the Password option for secure password management.
                </Typography>
              </ListItem>
            </List>

            {/* WhatsApp Support */}
            <Box sx={{ mt: 4, mb: 4, p: 3, backgroundColor: 'success.light', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.contrastText' }}>
                💬 WhatsApp Support
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'success.contrastText' }}>
                Get instant help through WhatsApp! Our support team is available 24/7 to assist you with any questions or issues.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    size="large"
                    sx={{ 
                      backgroundColor: 'white', 
                      color: 'success.main', 
                      py: 2,
                      '&:hover': { backgroundColor: 'grey.100' } 
                    }}
                    onClick={() => {
                      const message = encodeURIComponent('Hello! I need technical support with ClinicCare system. Please help me resolve my issue.');
                      window.open(`https://wa.me/201147299675?text=${message}`);
                      showSnackbar('Opening WhatsApp for technical support...', 'success');
                    }}
                  >
                    🔧 Technical Support
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    size="large"
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white', 
                      py: 2,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                    }}
                    onClick={() => {
                      const message = encodeURIComponent('Hello! I have a general question about ClinicCare. Could you please assist me?');
                      window.open(`https://wa.me/201147299675?text=${message}`);
                      showSnackbar('Opening WhatsApp for general support...', 'success');
                    }}
                  >
                    💬 General Support
                  </Button>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'success.contrastText', textAlign: 'center' }}>
                  💡 <strong>Pro Tip:</strong> Send screenshots and detailed descriptions for faster resolution!
                </Typography>
              </Box>
            </Box>


          </Box>
            {/* Feedback Section */}
            <Box sx={{ mt: 4, p: 3, backgroundColor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'warning.contrastText' }}>
                📝 Share Your Feedback
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'warning.contrastText' }}>
                Help us improve ClinicCare by sharing your experience and suggestions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ backgroundColor: 'white', color: 'warning.main', '&:hover': { backgroundColor: 'grey.100' } }}
                    onClick={async () => {
                      // Use EmailJS to send feedback email
                      const feedbackSent = await sendFeedbackEmail({
                        name: profile.name || 'User',
                        email: profile.email || '',
                        feedback: 'User requested to send feedback via the feedback button. Please follow up with them for their detailed feedback.',
                        rating: 'Pending'
                      });

                      if (feedbackSent) {
                        setConfirmMessage(`
✅ Feedback request sent successfully!

📧 We've notified our team at drsuperclinic@gmail.com
📱 You can also reach us via WhatsApp: +201147299675

We'd love to hear about:
• Your overall experience with ClinicCare
• Features you find most helpful
• Areas for improvement
• Suggestions for new features
• Technical performance feedback
• User interface comments

We'll reach out to you soon for your detailed feedback!
                        `);
                        showSnackbar('Feedback request sent to drsuperclinic@gmail.com!', 'success');
                      } else {
                        setConfirmMessage(`
📝 We'd love to hear from you!

Please send your feedback directly to:

📧 Email: drsuperclinic@gmail.com
📱 WhatsApp: +201147299675

Include these details in your message:
• Overall experience rating
• Features you find most helpful
• Areas for improvement
• Suggestions for new features
• Technical performance feedback
• User interface comments

Your feedback helps us improve ClinicCare for everyone!
                        `);
                        showSnackbar('Please send feedback using the contact details above', 'info');
                      }

                      setConfirmAction(() => {
                        setConfirmDialogOpen(false);
                        // Copy email to clipboard for convenience
                        navigator.clipboard.writeText('drsuperclinic@gmail.com').then(() => {
                          showSnackbar('Support email copied to clipboard', 'info');
                        }).catch(() => {
                          // Silent fail for clipboard
                        });
                      });
                      setConfirmDialogOpen(true);
                    }}
                  >
                    📧 Send Feedback
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => {
                      showSnackbar('Thank you for your interest in providing feedback!', 'success');
                      setTimeout(() => {
                        showSnackbar('Survey feature coming soon. Please use email feedback for now.', 'info');
                      }, 2000);
                    }}
                  >
                    📊 Quick Survey
                  </Button>
                </Grid>
              </Grid>
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setHelpDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insurance Provider Dialog */}
      <Dialog open={insuranceDialog} onClose={closeInsuranceDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {editingInsurance ? 'Edit Insurance Provider' : 'Add Insurance Provider'}
            </Typography>
            <IconButton onClick={closeInsuranceDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Insurance Provider Name"
              value={newInsuranceName}
              onChange={(e) => setNewInsuranceName(e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield, Aetna, Cigna"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingInsurance ? handleEditInsurance() : handleAddInsurance();
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Enter the name of the insurance provider that your clinic accepts.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeInsuranceDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={editingInsurance ? handleEditInsurance : handleAddInsurance}
            disabled={!newInsuranceName.trim()}
            startIcon={editingInsurance ? <Edit /> : <Add />}
          >
            {editingInsurance ? 'Update' : 'Add'} Provider
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Container>
  );
};

export default SettingsPage; 