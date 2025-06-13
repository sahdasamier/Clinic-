import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@mui/icons-material';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

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
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});
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

  // Form states
  const [profile, setProfile] = useState({
    name: 'Dr. Ahmed Ali',
    email: 'ahmed.ali@clinic.com',
    phone: '+20 10 1234 5678',
    specialization: 'General Practitioner',
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
  
  const [clinicSettings, setClinicSettings] = useState({
    name: 'مركز الرعاية الطبية - ClinicCare Medical Center',
    address: '15 شارع النيل، وسط البلد، القاهرة، مصر',
    phone: '+20 2 2345 6789',
    email: 'info@cliniccare.com.eg',
    workingHours: '9:00 AM - 6:00 PM',
    timezone: 'Africa/Cairo',
    licenseNumber: '',
    website: '',
    specialization: 'general',
    logo: '',
    tagline: '',
    primaryColor: '#1E3A8A',
    secondaryColor: '#10B981',
    description: '',
    appointmentDuration: 30,
    breakBetweenAppointments: 15,
    advanceBookingLimit: 30,
    allowOnlineBooking: true,
    requirePaymentAtBooking: false,
    sendReminders: true,
  });

  const [preferences, setPreferences] = useState({
    language: i18n.language,
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    autoBackup: true,
    twoFactorAuth: false,
  });

  const [insuranceProviders, setInsuranceProviders] = useState({
    egyptianInsurance: true,
    deltaInsurance: true,
    orientalInsurance: false,
    mohapInsurance: false,
    allianzEgypt: false,
  });

  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    cards: true,
    bankTransfer: false,
    digitalWallets: false,
  });

  const [services, setServices] = useState({
    consultation: true,
    checkups: true,
    vaccinations: false,
    labTests: false,
    radiology: false,
  });

  const [appointmentSettings, setAppointmentSettings] = useState({
    onlineBooking: true,
    paymentRequired: false,
    reminders: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

  const handleSaveProfile = async () => {
    const requiredFields = ['name', 'email', 'phone', 'specialization'];
    if (!validateForm(profile, requiredFields)) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to localStorage as fallback
      localStorage.setItem('clinicProfile', JSON.stringify(profile));
      showSnackbar('Profile saved successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClinicSettings = async () => {
    const requiredFields = ['name', 'address', 'phone', 'email'];
    if (!validateForm(clinicSettings, requiredFields)) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
      showSnackbar('Clinic settings saved successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to save clinic settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      showSnackbar('Preferences saved successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to save preferences. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const requiredFields = ['currentPassword', 'newPassword', 'confirmPassword'];
    if (!validateForm(passwordForm, requiredFields)) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSnackbar('Password changed successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to change password. Please try again.', 'error');
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
      setProfile(prev => ({
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
          insuranceProviders: insuranceProviders,
          paymentMethods: paymentMethods,
          services: services,
          appointmentSettings: appointmentSettings,
          systemInfo: {
            totalPatients: 156,
            appointmentsThisMonth: 89,
            lastBackup: new Date().toISOString(),
            licenseStatus: 'Active'
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
          ['Statistics', 'Total Patients', '156'],
          ['Statistics', 'Monthly Appointments', '89'],
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

  const handleResetForm = (formType: 'profile' | 'clinic' | 'preferences') => {
    setConfirmMessage(`Are you sure you want to reset ${formType} settings? All unsaved changes will be lost.`);
    setConfirmAction(() => () => {
      if (formType === 'profile') {
        setProfile({
          name: 'Dr. Ahmed Ali',
          email: 'ahmed.ali@clinic.com',
          phone: '+20 10 1234 5678',
          specialization: 'General Practitioner',
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
      } else if (formType === 'clinic') {
        setClinicSettings({
          name: 'مركز الرعاية الطبية - ClinicCare Medical Center',
          address: '15 شارع النيل، وسط البلد، القاهرة، مصر',
          phone: '+20 2 2345 6789',
          email: 'info@cliniccare.com.eg',
          workingHours: '9:00 AM - 6:00 PM',
          timezone: 'Africa/Cairo',
          licenseNumber: '',
          website: '',
          specialization: 'general',
          logo: '',
          tagline: '',
          primaryColor: '#1E3A8A',
          secondaryColor: '#10B981',
          description: '',
          appointmentDuration: 30,
          breakBetweenAppointments: 15,
          advanceBookingLimit: 30,
          allowOnlineBooking: true,
          requirePaymentAtBooking: false,
          sendReminders: true,
        });
      }
      setErrors({});
      showSnackbar(`${formType} settings reset successfully`, 'success');
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const mockLoginHistory = [
    { date: '2024-01-15 10:30:00', location: 'Cairo, Egypt', device: 'Chrome on Windows', status: 'Success' },
    { date: '2024-01-14 09:15:00', location: 'Cairo, Egypt', device: 'Safari on iPhone', status: 'Success' },
    { date: '2024-01-13 14:20:00', location: 'Cairo, Egypt', device: 'Chrome on Windows', status: 'Success' },
    { date: '2024-01-12 11:45:00', location: 'Alexandria, Egypt', device: 'Firefox on Mac', status: 'Failed' },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Header />
        <Container maxWidth="xl" sx={{ 
          mt: 3, 
          mb: 4, 
          flex: 1, 
          overflow: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header Section */}
          <Box sx={{ 
            mb: 6, 
            p: 6, 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
            borderRadius: 4,
            color: 'white',
            boxShadow: '0 20px 60px rgba(30, 58, 138, 0.3), 0 8px 25px rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
            },
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  mr: 4
                }}>
                  <Settings sx={{ fontSize: 48, opacity: 0.95 }} />
                </Box>
                <Box>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 900, 
                    mb: 1,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    background: 'linear-gradient(45deg, #ffffff 30%, #e0f2fe 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                {t('settings')}
              </Typography>
                  <Typography variant="h5" sx={{ 
                    opacity: 0.95, 
                    fontWeight: 500,
                    maxWidth: '600px',
                    lineHeight: 1.4
                  }}>
              Manage your profile, clinic settings, and system preferences
            </Typography>
                </Box>
              </Box>
              <Box sx={{
                display: { xs: 'none', md: 'block' },
                opacity: 0.1
              }}>
                <LocalHospital sx={{ fontSize: 120 }} />
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Settings Navigation */}
            <Grid item xs={12} md={3}>
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 4px 25px rgba(0,0,0,0.07)',
                border: 'none',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 5,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        mr: 2
                      }}>
                        <Settings sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 800, 
                        color: 'white',
                        fontSize: '1.4rem'
                      }}>
                        Settings Menu
                    </Typography>
                  </Box>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.85)', 
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}>
                      Configure your clinic & preferences
                    </Typography>
                  </Box>
                  <Box sx={{ py: 2 }}>
                  <Tabs
                    orientation="vertical"
                    value={tabValue}
                    onChange={handleTabChange}
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
                        }
                      }}
                  >
                    <Tab 
                        label="Profile Management" 
                        icon={<Person sx={{ fontSize: 26 }} />}
                      iconPosition="start"
                    />
                    <Tab 
                      label="Clinic Settings" 
                        icon={<LocalHospital sx={{ fontSize: 26 }} />}
                      iconPosition="start"
                    />
                    <Tab 
                      label="Notifications" 
                        icon={<Notifications sx={{ fontSize: 26 }} />}
                      iconPosition="start"
                    />
                    <Tab 
                        label="Security & Privacy" 
                        icon={<Security sx={{ fontSize: 26 }} />}
                      iconPosition="start"
                    />
                    <Tab 
                        label="System Settings" 
                        icon={<Storage sx={{ fontSize: 26 }} />}
                      iconPosition="start"
                    />
                  </Tabs>
                  </Box>
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
                          p: 5,
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
                              <Person sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                              <Typography variant="h3" sx={{ 
                                fontWeight: 900, 
                                color: 'grey.800',
                                fontSize: '2rem',
                                mb: 0.5
                              }}>
                          Profile Information
                        </Typography>
                              <Typography variant="body1" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                Manage your personal and professional details
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Card Content */}
                        <Box sx={{ p: 6 }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={profile.profileImage}
                              sx={{
                                width: 120,
                                height: 120,
                                mr: 3,
                                backgroundColor: 'primary.main',
                                fontSize: '2.8rem',
                                border: '4px solid white',
                                boxShadow: 3,
                              }}
                            >
                              {profile.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <IconButton
                              onClick={() => profileImageRef.current?.click()}
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 20,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                width: 40,
                                height: 40,
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
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                              {profile.name}
                            </Typography>
                            <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                              {profile.specialization}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                              {profile.email}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                                  boxShadow: 2
                                }}
                              >
                                {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                              </Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Chip 
                                label="Available" 
                                color="success" 
                                size="small"
                                icon={<Check fontSize="small" />}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Last updated: 2 hours ago
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Profile Information Display/Edit */}
                        {!isEditingProfile ? (
                          // Display Mode - Show profile information
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                              Profile Information
                            </Typography>
                            
                            {/* Basic Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                Basic Information
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Full Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.name || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Email Address
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.email || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Phone Number
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.phone || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Emergency Contact
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.emergencyContact || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Date of Birth
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.dateOfBirth || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Gender
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                      {profile.gender || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* Professional Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                Professional Information
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Primary Specialization
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.specialization || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Years of Experience
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.experience ? `${profile.experience} years` : 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Medical License Number
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.licenseNumber || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Medical School
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.medicalSchool || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Residency
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.residency || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Board Certifications
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.certifications || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* Languages & Bio Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                Languages & Bio
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Languages Spoken
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.languages || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Consultation Fee
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.consultationFee ? `EGP ${profile.consultationFee}` : 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Professional Bio
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                                      {profile.bio || 'No bio available'}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* Availability Settings Display */}
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                Availability Settings
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Working Days
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.workingDays || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Working Hours
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.workingHours || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Lunch Break
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {profile.lunchBreak || 'Not specified'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Current Status
                                    </Typography>
                                    <Chip 
                                      label={profile.status?.charAt(0).toUpperCase() + profile.status?.slice(1) || 'Available'} 
                                      color={profile.status === 'available' ? 'success' : profile.status === 'busy' ? 'warning' : profile.status === 'vacation' ? 'info' : 'default'}
                                      size="small"
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Box>
                        ) : (
                          // Edit Mode - Show form fields
                          <div id="profile-form">
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                              Edit Profile Information
                            </Typography>

                        {/* Basic Information */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          Basic Information
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
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
                              label="Email Address"
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
                              label="Phone Number"
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
                              label="Emergency Contact"
                                  value={profile.emergencyContact}
                                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                  placeholder="+20 10 XXXX XXXX"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date of Birth"
                              type="date"
                                  value={profile.dateOfBirth}
                                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Gender</InputLabel>
                                  <Select 
                                    label="Gender"
                                    value={profile.gender}
                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                  >
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* Professional Information */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          Professional Information
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                              <InputLabel>Primary Specialization</InputLabel>
                              <Select
                                value={profile.specialization}
                                label="Primary Specialization"
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
                              label="Years of Experience"
                              type="number"
                                  value={profile.experience}
                                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                              placeholder="8"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Medical License Number"
                                  value={profile.licenseNumber}
                                  onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                                  placeholder="EG-12345-MED"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Medical School"
                                  value={profile.medicalSchool}
                                  onChange={(e) => setProfile({ ...profile, medicalSchool: e.target.value })}
                                  placeholder="Cairo University Faculty of Medicine"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Residency"
                                  value={profile.residency}
                                  onChange={(e) => setProfile({ ...profile, residency: e.target.value })}
                                  placeholder="Kasr Al Ainy Hospital"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Board Certifications"
                                  value={profile.certifications}
                                  onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                                  placeholder="Egyptian Medical Syndicate Board"
                            />
                          </Grid>
                        </Grid>

                        {/* Languages & Bio */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          Languages & Bio
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Languages Spoken"
                                  value={profile.languages}
                                  onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                              placeholder="English, Arabic, Hindi"
                              helperText="Separate languages with commas"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Consultation Fee"
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
                              label="Professional Bio"
                              multiline
                              rows={4}
                                  value={profile.bio}
                                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                              placeholder="Dr. Ahmed Ali is a board-certified General Practitioner with over 8 years of experience in providing comprehensive healthcare services. He specializes in preventive medicine, chronic disease management, and patient education."
                              helperText="This information will be visible to patients on your profile"
                            />
                          </Grid>
                        </Grid>

                        {/* Availability Settings */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                          Availability Settings
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Working Days"
                                  value={profile.workingDays}
                                  onChange={(e) => setProfile({ ...profile, workingDays: e.target.value })}
                              placeholder="Monday - Friday"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Working Hours"
                                  value={profile.workingHours}
                                  onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                              placeholder="9:00 AM - 6:00 PM"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Lunch Break"
                                  value={profile.lunchBreak}
                                  onChange={(e) => setProfile({ ...profile, lunchBreak: e.target.value })}
                              placeholder="1:00 PM - 2:00 PM"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Status</InputLabel>
                                  <Select 
                                    label="Status" 
                                    value={profile.status}
                                    onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                                  >
                                <MenuItem value="available">Available</MenuItem>
                                <MenuItem value="busy">Busy</MenuItem>
                                <MenuItem value="vacation">On Vacation</MenuItem>
                                <MenuItem value="emergency">Emergency Only</MenuItem>
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
                            Cancel
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
                                {loading ? 'Saving Profile...' : 'Save Changes'}
                          </Button>
                            </Box>
                          </div>
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
                                Profile Statistics
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                Performance overview
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
                              primary="Total Patients"
                              secondary="156"
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <Schedule color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Appointments This Month"
                              secondary="89"
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <Business color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Years of Experience"
                              secondary={profile.experience || "8"}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemIcon>
                                    <Check color="primary" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary="Successful Treatments"
                                    secondary="1,247"
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
                                    Achievements & Certifications
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: 'grey.600',
                                    fontWeight: 500
                                  }}>
                                    Awards and recognitions
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            {/* Card Content */}
                            <Box sx={{ p: 4 }}>
                              <List sx={{ p: 0 }}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary="Board Certified"
                                    secondary={profile.certifications || "Egyptian Medical Syndicate Board"}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary="Excellence Award"
                                    secondary="Best Doctor 2023 - Egyptian Medical Syndicate"
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary="Medical School"
                                    secondary={profile.medicalSchool || "Cairo University Faculty of Medicine"}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <ListItemText
                                    primary="Professional Member"
                                    secondary="Egyptian Medical Syndicate - Member #12345"
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
                                  Add Achievement
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
                                  Professional Information & Actions
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                  License details and quick actions
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
                            License Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {profile.licenseNumber || 'EG-12345-MED'}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Registration Date
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            January 15, 2016
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Department
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {profile.specialization}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
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
                            <Typography variant="body1" fontWeight={600} color="success.main">
                              Active
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
                          Update Credentials
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
                          View Certificate
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
                          Basic Clinic Information
                        </Typography>
                              <Typography variant="body1" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                View your clinic's core details and information
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
                                {clinicSettings.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                                  label="Active" 
                                  color="success" 
                                  size="small"
                                  icon={<Check fontSize="small" />}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  Licensed Medical Facility
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 4 }} />

                          {/* Clinic Information Display */}
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                              Clinic Information
                            </Typography>
                            
                            {/* Basic Information Display */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                Basic Information
                              </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Clinic Name
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
                                      {clinicSettings.licenseNumber || 'EG-CL-2024-001'}
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
                                Operation Information
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
                                      {clinicSettings.timezone === 'Africa/Cairo' ? 'Africa/Cairo (GMT+2)' :
                                       clinicSettings.timezone === 'Asia/Riyadh' ? 'Asia/Riyadh (GMT+3)' :
                                       clinicSettings.timezone === 'Asia/Dubai' ? 'Asia/Dubai (GMT+4)' :
                                       clinicSettings.timezone === 'Europe/London' ? 'Europe/London (GMT)' :
                                       clinicSettings.timezone === 'America/New_York' ? 'America/New_York (GMT-5)' :
                                       clinicSettings.timezone}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Primary Specialization
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {clinicSettings.specialization === 'general' ? 'General Medicine' : 
                                       clinicSettings.specialization === 'family' ? 'Family Medicine' :
                                       clinicSettings.specialization === 'internal' ? 'Internal Medicine' :
                                       clinicSettings.specialization === 'pediatrics' ? 'Pediatrics' :
                                       clinicSettings.specialization === 'cardiology' ? 'Cardiology' : 'General Medicine'}
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
                                        Active & Valid
                                      </Typography>
                                    </Box>
                                  </Box>
                          </Grid>
                              </Grid>
                            </Box>

                            {/* Additional Information */}
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                Additional Information
                              </Typography>
                              <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Establishment Date
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      January 2016
                                    </Typography>
                                  </Box>
                          </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Facility Type
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      Private Medical Clinic
                                    </Typography>
                                  </Box>
                        </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                      Clinic Description
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                                      {clinicSettings.description || 'A modern medical facility providing comprehensive healthcare services with state-of-the-art equipment and experienced medical professionals.'}
                                    </Typography>
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

                        <Button 
                          variant="text" 
                          size="small" 
                          fullWidth
                          startIcon={<Add />}
                          onClick={() => showSnackbar('Custom service form opened', 'info')}
                        >
                          Add Custom Service
                        </Button>
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
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Accepted Insurance Providers
                        </Typography>
                        
                        <List sx={{ p: 0, mb: 2 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={insuranceProviders.egyptianInsurance}
                                  onChange={(e) => setInsuranceProviders({ ...insuranceProviders, egyptianInsurance: e.target.checked })}
                                />
                              }
                              label="Egyptian General Insurance Company"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={insuranceProviders.deltaInsurance}
                                  onChange={(e) => setInsuranceProviders({ ...insuranceProviders, deltaInsurance: e.target.checked })}
                                />
                              }
                              label="Delta Insurance Company"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={insuranceProviders.orientalInsurance}
                                  onChange={(e) => setInsuranceProviders({ ...insuranceProviders, orientalInsurance: e.target.checked })}
                                />
                              }
                              label="Oriental Insurance Company"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={insuranceProviders.mohapInsurance}
                                  onChange={(e) => setInsuranceProviders({ ...insuranceProviders, mohapInsurance: e.target.checked })}
                                />
                              }
                              label="Mohap Insurance"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={insuranceProviders.allianzEgypt}
                                  onChange={(e) => setInsuranceProviders({ ...insuranceProviders, allianzEgypt: e.target.checked })}
                                />
                              }
                              label="Allianz Egypt"
                            />
                          </ListItem>
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
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Staff Management */}
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
                          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(244, 114, 182, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)'
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
                                background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                                color: 'white',
                                boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)'
                              }}>
                                <People sx={{ fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 800, 
                                  color: 'grey.800',
                                  fontSize: '1.3rem',
                                  mb: 0.2
                                }}>
                            Staff Management
                          </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: 'grey.600',
                                  fontWeight: 500
                                }}>
                                  Manage clinic team members
                                </Typography>
                              </Box>
                            </Box>
                            <Button 
                              variant="contained" 
                              size="medium" 
                              startIcon={<Person />}
                              onClick={() => setStaffDialogOpen(true)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1.5,
                                boxShadow: 2,
                                background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
                                  boxShadow: 4
                                }
                              }}
                            >
                            Add Staff Member
                          </Button>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                        <Grid container spacing={2}>
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
                        </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Clinic Branding */}
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
                          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                          position: 'relative',
                          borderBottom: '1px solid rgba(196, 181, 253, 0.3)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
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
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                            }}>
                              <Palette sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: 'grey.800',
                                fontSize: '1.3rem',
                                mb: 0.2
                              }}>
                          Clinic Branding
                        </Typography>
                              <Typography variant="body2" sx={{ 
                                color: 'grey.600',
                                fontWeight: 500
                              }}>
                                Customize your clinic's visual identity
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Card Content */}
                        <Box sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Avatar
                            src={clinicSettings.logo}
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 2,
                              backgroundColor: 'primary.main',
                              fontSize: '1.5rem',
                            }}
                          >
                            {clinicSettings.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={loading ? <CircularProgress size={16} /> : <CloudUpload />}
                            onClick={() => logoUploadRef.current?.click()}
                            disabled={loading}
                          >
                            {loading ? 'Uploading...' : 'Upload Logo'}
                          </Button>
                          <input
                            type="file"
                            ref={logoUploadRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Clinic Tagline"
                              value={clinicSettings.tagline}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, tagline: e.target.value })}
                              placeholder="صحتك أولويتنا - Your Health, Our Priority"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Primary Color"
                              value={clinicSettings.primaryColor}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, primaryColor: e.target.value })}
                              type="color"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Secondary Color"
                              value={clinicSettings.secondaryColor}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, secondaryColor: e.target.value })}
                              type="color"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Clinic Description"
                              multiline
                              rows={3}
                              value={clinicSettings.description}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, description: e.target.value })}
                              placeholder="Providing comprehensive healthcare services with a focus on patient care and satisfaction."
                            />
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

              {/* Notification Settings */}
              <TabPanel value={tabValue} index={2}>
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
                          <Notifications sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 900, 
                            color: 'grey.800',
                            fontSize: '2rem',
                            mb: 0.5
                          }}>
                      Notification Preferences
                    </Typography>
                          <Typography variant="body1" sx={{ 
                            color: 'grey.600',
                            fontWeight: 500
                          }}>
                            Configure how you receive alerts and updates
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 6 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notification Methods
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.notifications.email}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, email: e.target.checked }
                            })}
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.notifications.sms}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, sms: e.target.checked }
                            })}
                          />
                        }
                        label="SMS Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.notifications.push}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, push: e.target.checked }
                            })}
                          />
                        }
                        label="Push Notifications"
                      />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Language & Region
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>{t('language')}</InputLabel>
                        <Select
                          value={preferences.language}
                              label={t('language')}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="ar">العربية</MenuItem>
                        </Select>
                      </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Theme</InputLabel>
                            <Select
                              value={preferences.theme}
                              label="Theme"
                              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                            >
                              <MenuItem value="light">Light</MenuItem>
                              <MenuItem value="dark">Dark</MenuItem>
                              <MenuItem value="auto">Auto</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Button 
                        variant="contained" 
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleSavePreferences}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </Box>
                    </Box>
                  </CardContent>
                </Card>
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
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Keep your account secure by enabling two-factor authentication and using a strong password.
                    </Alert>

                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Shield color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Add an extra layer of security to your account"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.twoFactorAuth}
                            onChange={(e) => setPreferences({ ...preferences, twoFactorAuth: e.target.checked })}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
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
                      <ListItem>
                        <ListItemIcon>
                          <History color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Login History"
                          secondary="View recent login activity for your account"
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setLoginHistoryDialogOpen(true)}
                          >
                            View
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
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
                        <ListItemIcon>
                          <Backup color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Auto Backup"
                          secondary="Automatically backup your data daily"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.autoBackup}
                            onChange={(e) => setPreferences({ ...preferences, autoBackup: e.target.checked })}
                          />
                        </ListItemSecondaryAction>
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

                    <Alert severity="warning" sx={{ mt: 3 }}>
                      <Typography variant="body2">
                        System Version: ClinicCare v1.0.0 | Last Updated: January 2024
                      </Typography>
                    </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Change Password</Typography>
            <IconButton onClick={() => setPasswordDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                error={!!errors.newPassword}
                helperText={errors.newPassword || 'Password must be at least 6 characters long'}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Lock />}
          >
            {loading ? 'Changing...' : 'Change Password'}
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
            {mockLoginHistory.map((login, index) => (
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
                {index < mockLoginHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
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
                 License Number: {profile.licenseNumber || 'EG-12345-MED'}
               </Typography>
               <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                 Issued by: Egyptian Medical Syndicate
               </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Active" color="success" />
                <Chip label="Verified" color="primary" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Valid until: December 31, 2025
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
                label="Medical School"
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
                placeholder="e.g., Best Doctor Award 2024"
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
                 placeholder="e.g., Egyptian Medical Syndicate"
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
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>📞 Phone Support:</Typography>
                  </Box>
                  <Typography variant="body2">+201147299675 (24/7)</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>📧 Email Support:</Typography>
                  </Box>
                  <Typography variant="body2">drsuperclinic@gmail.com</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* FAQ Section */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📋 Frequently Asked Questions
            </Typography>
            
            <List sx={{ mb: 4 }}>
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, px: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  ❓ How do I backup my clinic data?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Go to System Settings → Auto Backup to enable automatic daily backups, or use the Data Export feature to manually backup your data.
                </Typography>
              </ListItem>
              <Divider />
              
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, px: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  ❓ How do I add new staff members?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Navigate to Clinic Settings → Staff Management and click "Add Staff Member" to invite new team members to your clinic system.
                </Typography>
              </ListItem>
              <Divider />
              
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

            {/* Emergency Contact */}
            <Box sx={{ mb: 4, p: 3, backgroundColor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🚨 Emergency Support
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                For critical system issues affecting patient care or data security:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="small"
                  sx={{ backgroundColor: 'white', color: 'error.main', '&:hover': { backgroundColor: 'grey.100' } }}
                  onClick={() => {
                    window.open('tel:+201147299675');
                    showSnackbar('Calling emergency support...', 'warning');
                  }}
                >
                  📞 Call Emergency Line
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                  onClick={() => {
                    const subject = encodeURIComponent('URGENT - Emergency Support Required');
                    const body = encodeURIComponent(`
🚨 EMERGENCY SUPPORT REQUEST 🚨

Urgency Level: HIGH
Date/Time: ${new Date().toLocaleString()}

Issue Description:
[Describe the critical issue affecting patient care or system security]

Impact:
[How is this affecting your clinic operations?]

Immediate Actions Needed:
[What support do you need right away?]

Contact Information:
Phone: [Your immediate contact number]
                    `);
                    window.open(`mailto:drsuperclinic@gmail.com?subject=${subject}&body=${body}`);
                    showSnackbar('Opening emergency email...', 'warning');
                  }}
                >
                  📧 Emergency Email
                </Button>
              </Box>
            </Box>

            {/* Contact Options */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📞 Contact Support
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <Business sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Technical Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get help with system issues, bugs, or technical difficulties. Please include screenshots of the issue in your email
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    onClick={() => {
                      const subject = encodeURIComponent('Technical Support - Please attach screenshots');
                      const body = encodeURIComponent(`
Dear Support Team,

I need technical assistance with the following issue:

Issue Description:
[Please describe the problem you're experiencing]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

System Information:
- Browser: ${navigator.userAgent}
- Date: ${new Date().toLocaleDateString()}
- Time: ${new Date().toLocaleTimeString()}

Please find attached screenshots of the issue.

Best regards,
Dr. Clinic User
                      `);
                      window.open(`mailto:drsuperclinic@gmail.com?subject=${subject}&body=${body}`);
                      showSnackbar('Opening email client with template...', 'success');
                    }}
                  >
                    Email Tech Support
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <People sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    General Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Questions about features, billing, or general clinic management. Please include screenshots of any issues in your email
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    onClick={() => {
                      const subject = encodeURIComponent('General Support - Please attach screenshots if applicable');
                      const body = encodeURIComponent(`
Dear Support Team,

I have a question/inquiry regarding:

Topic: [e.g., Billing, Features, Account Management, etc.]

Question/Issue:
[Please describe your question or concern in detail]

What I'm trying to accomplish:
[Describe what you're trying to do]

Additional Information:
[Any relevant details that might help us assist you better]

Contact Information:
- Name: [Your Name]
- Clinic: [Your Clinic Name]
- Phone: [Your Phone Number]
- Preferred Contact Method: [Email/Phone]

System Information:
- Date: ${new Date().toLocaleDateString()}
- Time: ${new Date().toLocaleTimeString()}

Please attach screenshots if your inquiry involves any visual elements or specific screens.

Thank you for your assistance.

Best regards,
Dr. Clinic User
                      `);
                      window.open(`mailto:drsuperclinic@gmail.com?subject=${subject}&body=${body}`);
                      showSnackbar('Opening email client with template...', 'success');
                    }}
                  >
                    Email General Support
                  </Button>
                </Card>
              </Grid>
            </Grid>

            {/* Live Chat Support */}
            <Box sx={{ mt: 4, mb: 4, p: 3, backgroundColor: 'success.light', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.contrastText' }}>
                💬 Live Chat Support
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'success.contrastText' }}>
                Get instant help from our support team. Available Monday-Friday, 9 AM - 6 PM (GMT+2)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    sx={{ backgroundColor: 'white', color: 'success.main', '&:hover': { backgroundColor: 'grey.100' } }}
                    onClick={() => {
                      // Simulate opening live chat
                      showSnackbar('Opening live chat window...', 'info');
                      setTimeout(() => {
                        showSnackbar('Live chat is currently unavailable. Please use email support.', 'warning');
                      }, 2000);
                    }}
                  >
                    💬 Start Live Chat
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => {
                      window.open('https://wa.me/+201147299675?text=Hello, I need support with ClinicCare system');
                      showSnackbar('Opening WhatsApp...', 'info');
                    }}
                  >
                    📱 WhatsApp Support
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => {
                      showSnackbar('Checking support availability...', 'info');
                      setTimeout(() => {
                        const isAvailable = new Date().getHours() >= 9 && new Date().getHours() < 18;
                        if (isAvailable) {
                          showSnackbar('Support team is online and ready to help!', 'success');
                        } else {
                          showSnackbar('Support team is offline. Please email us or try during business hours.', 'warning');
                        }
                      }, 1000);
                    }}
                  >
                    🟢 Check Availability
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Additional Resources */}
            <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                📚 Additional Resources
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Documentation"
                    secondary="Complete guides and tutorials for using ClinicCare"
                  />
                  <Button 
                    size="small" 
                    variant="text"
                    onClick={() => {
                      showSnackbar('Opening user documentation...', 'info');
                      // Simulate opening documentation
                      setTimeout(() => {
                        showSnackbar('Documentation is being prepared. Please contact support for immediate help.', 'warning');
                      }, 1500);
                    }}
                  >
                    View Docs
                  </Button>
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <Visibility color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Video Tutorials"
                    secondary="Step-by-step video guides for common tasks"
                  />
                  <Button 
                    size="small" 
                    variant="text"
                    onClick={() => {
                      showSnackbar('Loading video tutorials...', 'info');
                      setTimeout(() => {
                        showSnackbar('Video tutorials are coming soon! Contact support for personalized guidance.', 'info');
                      }, 1500);
                    }}
                  >
                    Watch Videos
                  </Button>
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <History color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Status"
                    secondary="Check our system status and maintenance updates"
                  />
                  <Button 
                    size="small" 
                    variant="text"
                    onClick={() => {
                      showSnackbar('Checking system status...', 'info');
                      setTimeout(() => {
                        const status = Math.random() > 0.2 ? 'operational' : 'maintenance';
                        if (status === 'operational') {
                          showSnackbar('✅ All systems operational', 'success');
                        } else {
                          showSnackbar('🔧 System maintenance in progress. Some features may be temporarily unavailable.', 'warning');
                        }
                      }, 2000);
                    }}
                  >
                    Check Status
                  </Button>
                </ListItem>
              </List>
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
                    onClick={() => {
                      const subject = encodeURIComponent('ClinicCare Feedback & Suggestions');
                      const body = encodeURIComponent(`
Dear ClinicCare Team,

I would like to share my feedback about the system:

Overall Experience: [Excellent/Good/Average/Poor]

What I like most:
[Please share what features you find most helpful]

Areas for improvement:
[What could be better or what features are missing?]

Suggestions:
[Any new features or improvements you'd like to see]

Technical Performance:
[How is the system performance, speed, reliability?]

User Interface:
[Is the interface easy to use and navigate?]

Additional Comments:
[Any other feedback you'd like to share]

Thank you for your time and for helping us improve!

Best regards,
[Your Name]
[Your Clinic Name]
                      `);
                      window.open(`mailto:drsuperclinic@gmail.com?subject=${subject}&body=${body}`);
                      showSnackbar('Opening feedback email...', 'success');
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
          <Button 
            variant="contained" 
            startIcon={<Help />}
            onClick={() => {
              window.open('tel:+201147299675');
              showSnackbar('Calling support hotline...', 'info');
            }}
          >
            Call Support Now
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
    </Box>
  );
};

export default SettingsPage; 