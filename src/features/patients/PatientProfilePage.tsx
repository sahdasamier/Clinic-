import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import { Patient, PatientService } from '../../services/PatientService';
import { Appointment, AppointmentService } from '../../services/AppointmentService';
import { useUser } from '../../contexts/UserContext';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Paper, Grid, Chip, Tabs, Tab, Avatar } from '@mui/material';

// Placeholder Tab Components - these will be fleshed out later or integrated directly
const ProfileTabContent: React.FC<{ patient: Patient | null }> = ({ patient }) => {
  if (!patient) return <Typography>Patient details not available.</Typography>;
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{patient.name}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Typography><strong>Age:</strong> {patient.age || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography><strong>Gender:</strong> {patient.gender || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography><strong>Phone:</strong> {patient.phone || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {patient.email || 'N/A'}</Typography></Grid>
        <Grid item xs={12}><Typography><strong>Address:</strong> {patient.address || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography><strong>Condition:</strong> {patient.condition || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography><strong>Status:</strong> {patient.status || 'N/A'}</Typography></Grid>
        <Grid item xs={12} sm={6}><Typography><strong>Blood Type:</strong> {patient.bloodType || 'N/A'}</Typography></Grid>
        <Grid item xs={12}><Typography><strong>Emergency Contact:</strong> {patient.emergencyContact || 'N/A'}</Typography></Grid>
        {patient.allergies && patient.allergies.length > 0 && (
          <Grid item xs={12}>
            <Typography><strong>Allergies:</strong> {patient.allergies.join(', ')}</Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

const VisitsTabContent: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  if (!appointments.length) return <Typography>No visit history available.</Typography>;
  return (
    <List>
      {appointments.map(appt => (
        <ListItem key={appt.id} divider>
          <ListItemText
            primary={`${appt.type} with ${appt.doctor} on ${appt.date} at ${appt.time}`}
            secondary={`Status: ${appt.status} - Notes: ${appt.notes || 'N/A'}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

const DoctorNotesTab: React.FC = () => {
  const { t } = useTranslation();
  // This will be replaced with dynamic notes fetching and adding later
  const notes = [
    { id: 1, text: 'Patient reported feeling better.', date: '2024-07-15' },
    { id: 2, text: 'Prescribed medication for flu symptoms.', date: '2024-07-10' },
  ];

  return (
    <div>
      <Typography variant="h6" gutterBottom>{t('add_note')}</Typography>
      <form>
        <textarea
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md" // Will replace with MUI TextField later
          placeholder={t('enter_note')}
        ></textarea>
        <button // Will replace with MUI Button later
          type="submit"
          className="mt-2 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary"
        >
          {t('save_note')}
        </button>
      </form>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>{t('notes')}</Typography>
      <div className="space-y-4">
        {notes.map(note => (
          <Paper key={note.id} sx={{ p: 2, mb: 1 }}>
            <Typography>{note.text}</Typography>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>{note.date}</Typography>
          </Paper>
        ))}
      </div>
    </div>
  );
};

const PatientProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { patientId } = useParams<{ patientId: string }>();
  const { userProfile } = useUser();

  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loadingPatient, setLoadingPatient] = useState<boolean>(true);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // MUI Tabs use numerical index

  useEffect(() => {
    if (patientId) {
      setLoadingPatient(true);
      setError(null);
      PatientService.getPatientById(patientId)
        .then(patientData => {
          if (patientData) {
            setCurrentPatient(patientData);
          } else {
            setError("Patient not found.");
          }
          setLoadingPatient(false);
        })
        .catch(err => {
          console.error("Error fetching patient details:", err);
          setError("Failed to load patient details.");
          setLoadingPatient(false);
        });
    } else {
      setError("No patient ID provided.");
      setLoadingPatient(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId && userProfile?.clinicId) {
      setLoadingAppointments(true);
      const unsubscribe = AppointmentService.listenAppointmentsByPatient(
        userProfile.clinicId,
        patientId,
        (appointments) => {
          setPatientAppointments(appointments);
          setLoadingAppointments(false);
        }
        // Removed error callback from listenAppointmentsByPatient as it's not standard for onSnapshot
        // Errors are typically handled in the third argument of onSnapshot
      );
      // Need to handle potential errors from the listener setup itself if AppointmentService.listenAppointmentsByPatient supports it.
      // For now, assuming errors are caught by the onSnapshot error handler if implemented within the service.
      return () => unsubscribe();
    } else if (patientId && !userProfile?.clinicId) {
        setError("Clinic ID not available to fetch appointments.");
        setLoadingAppointments(false);
    }
  }, [patientId, userProfile?.clinicId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabsConfig = [
    { id: 'profile', label: t('profile'), component: <ProfileTabContent patient={currentPatient} /> },
    { id: 'visits', label: t('visits'), component: <VisitsTabContent appointments={patientAppointments} /> },
    { id: 'doctor_notes', label: t('doctor_notes'), component: <DoctorNotesTab /> }, // Placeholder
    // Add more tabs like Medications, Documents later
  ];

  if (loadingPatient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading patient profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{m:2}}>{error}</Alert>;
  }

  if (!currentPatient) {
    return <Alert severity="warning" sx={{m:2}}>No patient data to display. Patient might not exist or ID is missing.</Alert>;
  }

  return (
    <div className="flex h-screen bg-background"> {/* Tailwind class, ensure it's defined or use sx prop */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6"> {/* Tailwind classes */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {currentPatient.avatar ? (
              <Avatar src={currentPatient.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
            ) : (
              <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                {currentPatient.name ? currentPatient.name.charAt(0).toUpperCase() : '?'}
              </Avatar>
            )}
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {currentPatient.name || t('patient_profile')}
            </Typography>
          </Box>

          <Paper elevation={1} sx={{ width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Patient profile tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {tabsConfig.map((tab, index) => (
                <Tab key={tab.id} label={tab.label} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
              ))}
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tabsConfig.map((tab, index) => (
                <div
                  key={tab.id}
                  role="tabpanel"
                  hidden={activeTab !== index}
                  id={`tabpanel-${index}`}
                  aria-labelledby={`tab-${index}`}
                >
                  {activeTab === index && tab.component}
                </div>
              ))}
               {loadingAppointments && activeTab === 1 && <CircularProgress sx={{mt: 2}} />}
            </Box>
          </Paper>
        </main>
      </div>
    </div>
  );
};

export default PatientProfilePage;