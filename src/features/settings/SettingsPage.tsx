import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Settings,
  Person,
  Security,
  Notifications,
  Language,
  Palette,
  Storage,
  Help,
  Info,
  Edit,
  Save,
  Backup,
  Shield,
  LocalHospital,
  Business,
  Schedule,
  Phone,
  Email,
  LocationOn,
  People,
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
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState({
    name: 'Dr. Ahmed Ali',
    email: 'ahmed.ali@clinic.com',
    phone: '+971 50 123 4567',
    specialization: 'General Practitioner',
  });
  
  const [clinicSettings, setClinicSettings] = useState({
    name: 'ClinicCare Medical Center',
    address: '123 Health Street, Dubai, UAE',
    phone: '+971 4 123 4567',
    email: 'info@cliniccare.com',
    workingHours: '9:00 AM - 6:00 PM',
    timezone: 'Asia/Dubai',
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLanguageChange = (lang: string) => {
    setPreferences({ ...preferences, language: lang });
    i18n.changeLanguage(lang);
    document.documentElement.dir = i18n.dir();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Settings sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {t('settings')}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Manage your profile, clinic settings, and system preferences
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Settings Navigation */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Settings
                    </Typography>
                  </Box>
                  <Tabs
                    orientation="vertical"
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{ minHeight: 400 }}
                  >
                    <Tab 
                      label="Profile" 
                      icon={<Person />}
                      iconPosition="start"
                      sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                    />
                    <Tab 
                      label="Clinic Settings" 
                      icon={<LocalHospital />}
                      iconPosition="start"
                      sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                    />
                    <Tab 
                      label="Notifications" 
                      icon={<Notifications />}
                      iconPosition="start"
                      sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                    />
                    <Tab 
                      label="Security" 
                      icon={<Security />}
                      iconPosition="start"
                      sx={{ justifyContent: 'flex-start', minHeight: 48 }}
                    />
                    <Tab 
                      label="System" 
                      icon={<Storage />}
                      iconPosition="start"
                      sx={{ justifyContent: 'flex-start', minHeight: 48 }}
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
                  {/* Profile Info Card */}
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                          Profile Information
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
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
                              DA
                            </Avatar>
                            <IconButton
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
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Button variant="contained" size="small" startIcon={<Edit />}>
                                Edit Profile
                              </Button>
                              <Button variant="outlined" size="small">
                                View Public Profile
                              </Button>
                              <Button variant="text" size="small">
                                Preview
                              </Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                ● Available
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Last updated: 2 hours ago
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Basic Information */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Basic Information
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Emergency Contact"
                              placeholder="+971 50 XXX XXXX"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date of Birth"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Gender</InputLabel>
                              <Select label="Gender">
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        {/* Professional Information */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Professional Information
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Primary Specialization</InputLabel>
                              <Select
                                value={profile.specialization}
                                label="Primary Specialization"
                                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
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
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Years of Experience"
                              type="number"
                              placeholder="8"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Medical License Number"
                              placeholder="MD-12345-UAE"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Medical School"
                              placeholder="University of Dubai Medical School"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Residency"
                              placeholder="Dubai Hospital"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Board Certifications"
                              placeholder="American Board of Internal Medicine"
                            />
                          </Grid>
                        </Grid>

                        {/* Languages & Bio */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Languages & Bio
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Languages Spoken"
                              placeholder="English, Arabic, Hindi"
                              helperText="Separate languages with commas"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Consultation Fee"
                              type="number"
                              placeholder="250"
                              InputProps={{
                                startAdornment: (
                                  <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                                    AED
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
                              placeholder="Dr. Ahmed Ali is a board-certified General Practitioner with over 8 years of experience in providing comprehensive healthcare services. He specializes in preventive medicine, chronic disease management, and patient education."
                              helperText="This information will be visible to patients on your profile"
                            />
                          </Grid>
                        </Grid>

                        {/* Availability Settings */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Availability Settings
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Working Days"
                              placeholder="Monday - Friday"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Working Hours"
                              placeholder="9:00 AM - 6:00 PM"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Lunch Break"
                              placeholder="1:00 PM - 2:00 PM"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Status</InputLabel>
                              <Select label="Status" defaultValue="available">
                                <MenuItem value="available">Available</MenuItem>
                                <MenuItem value="busy">Busy</MenuItem>
                                <MenuItem value="vacation">On Vacation</MenuItem>
                                <MenuItem value="emergency">Emergency Only</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                          <Button variant="contained" startIcon={<Save />}>
                            Save Changes
                          </Button>
                          <Button variant="outlined">
                            Cancel
                          </Button>
                          <Button variant="text" startIcon={<Edit />}>
                            Upload Documents
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Quick Stats Card */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Profile Stats
                        </Typography>
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
                              secondary="8"
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>

                    {/* Professional Info Card */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Professional Information
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            License Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            MD-12345-UAE
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
                            General Medicine
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
                        <Divider sx={{ my: 2 }} />
                        <Button variant="outlined" size="small" fullWidth sx={{ mb: 1 }}>
                          Update Credentials
                        </Button>
                        <Button variant="text" size="small" fullWidth>
                          View Certificate
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Achievements Card */}
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Achievements & Certifications
                        </Typography>
                        <List sx={{ p: 0 }}>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemText
                              primary="Board Certified"
                              secondary="American Board of Internal Medicine"
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemText
                              primary="Excellence Award"
                              secondary="Best Doctor 2023 - Dubai Health Authority"
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemText
                              primary="Research Publication"
                              secondary="Preventive Medicine Journal - 2022"
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        </List>
                        <Button variant="text" size="small" fullWidth sx={{ mt: 1 }}>
                          Add Achievement
                        </Button>
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
                    <Card>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                          Basic Clinic Information
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Clinic Name"
                              value={clinicSettings.name}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="License Number"
                              placeholder="CL-2024-001"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Address"
                              multiline
                              rows={2}
                              value={clinicSettings.address}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              value={clinicSettings.phone}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Email"
                              value={clinicSettings.email}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Website"
                              placeholder="www.cliniccare.com"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Working Hours"
                              value={clinicSettings.workingHours}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, workingHours: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Timezone</InputLabel>
                              <Select
                                value={clinicSettings.timezone}
                                label="Timezone"
                                onChange={(e) => setClinicSettings({ ...clinicSettings, timezone: e.target.value })}
                              >
                                <MenuItem value="Asia/Dubai">Asia/Dubai (GMT+4)</MenuItem>
                                <MenuItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</MenuItem>
                                <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                                <MenuItem value="America/New_York">America/New_York (GMT-5)</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Services & Specializations */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Services & Specializations
                        </Typography>
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Primary Specialization</InputLabel>
                          <Select label="Primary Specialization">
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
                              control={<Switch defaultChecked />}
                              label="General Consultation"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Health Check-ups"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Vaccinations"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Laboratory Tests"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Radiology Services"
                            />
                          </ListItem>
                        </List>

                        <Button variant="text" size="small" fullWidth>
                          Add Custom Service
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Insurance & Payment */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Insurance & Payment
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Accepted Insurance Providers
                        </Typography>
                        
                        <List sx={{ p: 0, mb: 2 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Dubai Health Insurance"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Oman Insurance Company"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Al Sagr National Insurance"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Abu Dhabi National Insurance"
                            />
                          </ListItem>
                        </List>

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Payment Methods
                        </Typography>
                        
                        <List sx={{ p: 0 }}>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Cash"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Credit/Debit Cards"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Bank Transfer"
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Digital Wallets"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Staff Management */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Staff Management
                          </Typography>
                          <Button variant="outlined" size="small" startIcon={<Person />}>
                            Add Staff Member
                          </Button>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, mx: 'auto', mb: 1, backgroundColor: 'primary.main' }}>
                                  DA
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>Dr. Ahmed Ali</Typography>
                                <Typography variant="caption" color="text.secondary">Head Doctor</Typography>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                  <IconButton size="small" color="primary">
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary">
                                    <Info fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, mx: 'auto', mb: 1, backgroundColor: 'secondary.main' }}>
                                  SM
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>Sara Mohammed</Typography>
                                <Typography variant="caption" color="text.secondary">Nurse</Typography>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                  <IconButton size="small" color="primary">
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary">
                                    <Info fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, mx: 'auto', mb: 1, backgroundColor: 'success.main' }}>
                                  MK
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>Mai Khalil</Typography>
                                <Typography variant="caption" color="text.secondary">Receptionist</Typography>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                  <IconButton size="small" color="primary">
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary">
                                    <Info fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, mx: 'auto', mb: 1, backgroundColor: 'warning.main' }}>
                                  AH
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>Ali Hassan</Typography>
                                <Typography variant="caption" color="text.secondary">Pharmacist</Typography>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                  <IconButton size="small" color="primary">
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary">
                                    <Info fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Appointment Settings */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Appointment Settings
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Default Appointment Duration"
                              type="number"
                              placeholder="30"
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
                              placeholder="15"
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
                              placeholder="30"
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
                              control={<Switch defaultChecked />}
                              label="Allow Online Booking"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch />}
                              label="Require Payment at Booking"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch defaultChecked />}
                              label="Send Reminder Notifications"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Clinic Branding */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Clinic Branding
                        </Typography>
                        
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 2,
                              backgroundColor: 'primary.main',
                              fontSize: '1.5rem',
                            }}
                          >
                            CC
                          </Avatar>
                          <Button variant="outlined" size="small">
                            Upload Logo
                          </Button>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Clinic Tagline"
                              placeholder="Your Health, Our Priority"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Primary Color"
                              placeholder="#1E3A8A"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Secondary Color"
                              placeholder="#10B981"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Clinic Description"
                              multiline
                              rows={3}
                              placeholder="Providing comprehensive healthcare services with a focus on patient care and satisfaction."
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Save Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button variant="outlined">
                        Cancel
                      </Button>
                      <Button variant="contained" startIcon={<Save />}>
                        Save Clinic Settings
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Notification Settings */}
              <TabPanel value={tabValue} index={2}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                      Notification Preferences
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Notification Methods
                      </Typography>
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

                    <Divider sx={{ my: 3 }} />

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Language & Region
                      </Typography>
                      <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={preferences.language}
                          label="Language"
                          onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="ar">العربية</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Button variant="contained" startIcon={<Save />}>
                        Save Preferences
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Security Settings */}
              <TabPanel value={tabValue} index={3}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                      Security Settings
                    </Typography>

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
                          <Security color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Change Password"
                          secondary="Update your password regularly for better security"
                        />
                        <ListItemSecondaryAction>
                          <Button variant="outlined" size="small">
                            Change
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Info color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Login History"
                          secondary="View recent login activity for your account"
                        />
                        <ListItemSecondaryAction>
                          <Button variant="outlined" size="small">
                            View
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* System Settings */}
              <TabPanel value={tabValue} index={4}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                      System Settings
                    </Typography>

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
                          <Storage color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Data Export"
                          secondary="Export your clinic data for backup or migration"
                        />
                        <ListItemSecondaryAction>
                          <Button variant="outlined" size="small">
                            Export
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
                          <Button variant="outlined" size="small">
                            Contact
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>

                    <Alert severity="warning" sx={{ mt: 3 }}>
                      <Typography variant="body2">
                        System Version: ClinicCare v1.0.0 | Last Updated: January 2024
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </TabPanel>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default SettingsPage; 