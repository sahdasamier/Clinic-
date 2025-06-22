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
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Message,
  CalendarToday,
  PersonAdd,
  People,
  LocationOn,
  Male,
  Female,
  WhatsApp,
  NoteAdd,
  Assignment,
  LocalPharmacy,
  History,
  AttachFile,
  Save,
  Close,
  MedicalServices,
  Assignment as AssignmentIcon,
  PictureAsPdf,
  Image,
  Description,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';



import { 
  organizeAppointmentsByCompletion, 
  getPatientsOrganizedByAppointmentStatus,
  sendAppointmentDataToPatients,
  PatientWithAppointments,
  forceSyncAllPatients
} from '../../utils/appointmentPatientSync';
import {
  initialPatients,
  defaultNewPatientData,
  defaultMedicalHistoryData,
  defaultMedicationData,
  defaultAppointmentData,
  patientStatusOptions,
  bloodTypeOptions,
  genderOptions,
  commonConditions,
  commonMedications,
  type Patient,
  type MedicalHistory,
  type Medication,
  type VisitNote,
  type VitalSign,
  type Document,
} from '../../data/mockData';

// EXPORT: Storage key for patient data
export const PATIENTS_STORAGE_KEY = 'clinic_patients_data';

// EXPORT: Load patients from localStorage
export const loadPatientsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.warn('Error loading patients from localStorage:', error);
  }
  
  // Return default data if no stored data exists
  return initialPatients;
};

// EXPORT: Save patients to localStorage
export const savePatientsToStorage = (patients: any[]) => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    console.warn('Error saving patients to localStorage:', error);
  }
};

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
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}





const PatientListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, initialized } = useAuth();

  // Helper function to translate patient status and conditions
  const translatePatientData = (text: string) => {
    return t(text.toLowerCase()) || text;
  };
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState({
    gender: '',
    ageRange: '',
    condition: '',
    status: ''
  });
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [patientProfileOpen, setPatientProfileOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [profileTab, setProfileTab] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', duration: '' });
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editMedicationOpen, setEditMedicationOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [editNoteOpen, setEditNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  // ✅ Initialize patients from localStorage FIRST
  const [patients, setPatients] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log('✅ PatientListPage: Loaded patients from localStorage on init:', parsedData.length);
          return parsedData;
        }
      }
    } catch (error) {
      console.error('❌ PatientListPage: Error loading from localStorage:', error);
    }
    console.log('ℹ️ PatientListPage: Using default patients');
    return initialPatients;
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [organizedAppointmentData, setOrganizedAppointmentData] = useState<any>(null);
  const [patientsWithAppointments, setPatientsWithAppointments] = useState<PatientWithAppointments[]>([]);
  const [patientOrganizationMode, setPatientOrganizationMode] = useState<'reservation' | 'completion' | 'all'>('all');

  // Load data from localStorage on component mount - wait for auth
  React.useEffect(() => {
    // Wait for auth to be initialized and user to be available
    if (!initialized || authLoading || !user) {
      console.log('🔄 PatientListPage: Waiting for auth initialization...', {
        initialized,
        authLoading,
        hasUser: !!user
      });
      return;
    }

    console.log('✅ PatientListPage: Auth initialized, loading patient data...');
    setDataLoading(true);

    try {
      const loadedPatients = loadPatientsFromStorage();
      setPatients(loadedPatients);
      setIsDataLoaded(true);
      console.log('✅ PatientListPage: Patient data loaded successfully');
      
      // Force sync all patients with their appointment data
      setTimeout(() => {
        forceSyncAllPatients();
      }, 500);
    } catch (error) {
      console.error('❌ PatientListPage: Error loading patient data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [initialized, authLoading, user]);

  // Save data to localStorage whenever patients change
  React.useEffect(() => {
    if (isDataLoaded && patients.length > 0) {
      savePatientsToStorage(patients);
    }
  }, [patients, isDataLoaded]);

  // Load organized appointment data - wait for auth and patient data
  React.useEffect(() => {
    // Wait for auth to be initialized and patient data to be loaded
    if (!initialized || authLoading || !user || !isDataLoaded) {
      console.log('🔄 PatientListPage: Waiting for auth and patient data before loading organized data...', {
        initialized,
        authLoading,
        hasUser: !!user,
        isDataLoaded
      });
      return;
    }

    const loadOrganizedData = () => {
      console.log('🔄 PatientListPage: Loading organized appointment data...');
      try {
        const organizedData = organizeAppointmentsByCompletion();
        const organizedPatients = getPatientsOrganizedByAppointmentStatus();
        
        setOrganizedAppointmentData(organizedData);
        setPatientsWithAppointments(organizedPatients.allPatients);
        
        console.log('✅ PatientListPage: Organized appointment data loaded:', {
          completedAppointments: organizedData.completed.length,
          notCompletedAppointments: organizedData.notCompleted.length,
          totalPatients: organizedPatients.allPatients.length,
          patientsWithCompleted: organizedPatients.patientsWithCompleted.length,
          patientsWithPending: organizedPatients.patientsWithPending.length
        });
      } catch (error) {
        console.error('❌ PatientListPage: Error loading organized appointment data:', error);
      }
    };

    loadOrganizedData();

    // Listen for appointment-patient sync events
    const handleSync = () => {
      console.log('🔄 Received appointment sync event, reloading data...');
      loadOrganizedData();
      
      // Also reload patient data to reflect sync changes
      const updatedPatients = loadPatientsFromStorage();
      setPatients(updatedPatients);
      console.log('✅ Patient data reloaded after sync');
    };

    // Listen for user data clearing
    const handleUserDataCleared = () => {
      // Reset to default state
      setPatients(initialPatients);
      setTabValue(0);
      setSearchQuery('');
      setActiveFilters({
        gender: '',
        ageRange: '',
        condition: '',
        status: ''
      });
      setNewPatientData(defaultNewPatientData);
      setNewMedicalHistory(defaultMedicalHistoryData);
      setNewTreatmentMedication(defaultMedicationData);
      setAppointmentData(defaultAppointmentData);
      setSelectedPatient(null);
      setEditingPatient(null);
      setEditingMedication(null);
      setEditingNote(null);
      setPendingMedication(null);
      setAppointmentPatient(null);
      setStatusEditPatient(null);
      setViewingDocument(null);
      
      // Close all dialogs
      setAddPatientOpen(false);
      setPatientProfileOpen(false);
      setEditPatientOpen(false);
      setEditMedicationOpen(false);
      setEditNoteOpen(false);
      setUploadDocumentOpen(false);
      setDocumentViewerOpen(false);
      setAddMedicalHistoryOpen(false);
      setMedicationDetailsPopup(false);
      setScheduleAppointmentOpen(false);
      
      // Reset form states
      setProfileTab(0);
      setNewNote('');
      setNewMedication(defaultMedicationData);
      setDocumentTitle('');
      setSelectedFile(null);
      setTreatmentType('existing');
      setSelectedMedication('');
      setViewMode('table');
      setPatientOrganizationMode('all');
      
      // Reset filter anchors
      setFilterAnchor(null);
      setStatusMenuAnchor(null);
      
      // Clear organized data
      setOrganizedAppointmentData(null);
      setPatientsWithAppointments([]);
      
      console.log('✅ Patient data reset to default state');
    };

    // Listen for mobile FAB action
    const handleOpenAddPatient = () => {
      setAddPatientOpen(true);
    };

    window.addEventListener('appointmentPatientSync', handleSync);
    window.addEventListener('userDataCleared', handleUserDataCleared);
    window.addEventListener('openAddPatient', handleOpenAddPatient);
    
    return () => {
      window.removeEventListener('appointmentPatientSync', handleSync);
      window.removeEventListener('userDataCleared', handleUserDataCleared);
      window.removeEventListener('openAddPatient', handleOpenAddPatient);
    };
  }, [initialized, authLoading, user, isDataLoaded]);
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  const [addMedicalHistoryOpen, setAddMedicalHistoryOpen] = useState(false);
  const [newMedicalHistory, setNewMedicalHistory] = useState(defaultMedicalHistoryData);
  const [treatmentType, setTreatmentType] = useState<'existing' | 'new' | 'custom'>('existing');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [newTreatmentMedication, setNewTreatmentMedication] = useState(defaultMedicationData);
  const [medicationDetailsPopup, setMedicationDetailsPopup] = useState(false);
  const [pendingMedication, setPendingMedication] = useState<any>(null);
  const [editLastVisitOpen, setEditLastVisitOpen] = useState(false);
  const [editLastVisitPatient, setEditLastVisitPatient] = useState<any>(null);
  const [newLastVisitDate, setNewLastVisitDate] = useState('');
  const [scheduleAppointmentOpen, setScheduleAppointmentOpen] = useState(false);
  const [appointmentPatient, setAppointmentPatient] = useState<any>(null);
  const [appointmentData, setAppointmentData] = useState(defaultAppointmentData);
  const [statusEditPatient, setStatusEditPatient] = useState<any>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  
  // New Patient Form State - Initialize from localStorage
  const [newPatientData, setNewPatientData] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_new_patient_form');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ PatientListPage: Loaded new patient form from localStorage');
        return { ...defaultNewPatientData, ...parsedData };
      }
    } catch (error) {
      console.error('❌ PatientListPage: Error loading new patient form:', error);
    }
    return defaultNewPatientData;
  });

  // Save new patient form data to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('clinic_new_patient_form', JSON.stringify(newPatientData));
      console.log('✅ PatientListPage: Saved new patient form to localStorage');
    } catch (error) {
      console.error('❌ PatientListPage: Error saving new patient form:', error);
    }
  }, [newPatientData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleWhatsAppMessage = (phoneNumber: string, patientName: string) => {
    // Remove any non-digit characters and format the phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    // Create WhatsApp message with pre-filled text
    const message = `Hello ${patientName}, this is from ClinicCare Medical Center. How can we assist you today?`;
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppAll = () => {
    // Get all filtered patients with valid phone numbers
    const patientsWithPhones = filteredPatients.filter(patient => 
      patient.phone && patient.phone.trim() !== ''
    );
    
    if (patientsWithPhones.length === 0) {
      alert('No patients with valid phone numbers found.');
      return;
    }

    // Create a general message for all patients
    const generalMessage = 'Hello! This is a message from ClinicCare Medical Center. We hope you are doing well. Please feel free to contact us if you need any assistance.';
    const encodedMessage = encodeURIComponent(generalMessage);
    
    // Open WhatsApp for each patient in a new tab with a slight delay to avoid browser blocking
    patientsWithPhones.forEach((patient, index) => {
      setTimeout(() => {
        const cleanPhoneNumber = patient.phone.replace(/\D/g, '');
        const personalizedMessage = `Hello ${patient.name}! This is a message from ClinicCare Medical Center. We hope you are doing well. Please feel free to contact us if you need any assistance.`;
        const personalizedEncodedMessage = encodeURIComponent(personalizedMessage);
        const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${personalizedEncodedMessage}`;
        window.open(whatsappUrl, '_blank');
      }, index * 1000); // 1 second delay between each patient to avoid overwhelming the browser
    });
    
    // Show confirmation message
    alert(`Opening WhatsApp for ${patientsWithPhones.length} patients. Please allow pop-ups if prompted.`);
  };

  const handleOpenPatientProfile = (patient: any) => {
    setSelectedPatient(patient);
    setPatientProfileOpen(true);
    setProfileTab(0);
    // Set smart default for treatment type based on existing medications
    const hasExistingMedications = patient.medications && patient.medications.length > 0;
    setTreatmentType(hasExistingMedications ? 'existing' : 'new');
  };

  const handleClosePatientProfile = () => {
    setPatientProfileOpen(false);
    setSelectedPatient(null);
    setNewNote('');
    setNewMedication(defaultMedicationData);
  };

  const handleProfileTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setProfileTab(newValue);
  };

  const handleAddNote = () => {
    if (newNote.trim() && selectedPatient) {
      const newVisitNote = {
        date: new Date().toISOString().split('T')[0],
        note: newNote,
        doctor: ''
      };
      
      // Update patients array
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedPatient = {
            ...patient,
            visitNotes: [...(patient.visitNotes || []), newVisitNote]
          };
          setSelectedPatient(updatedPatient); // Update selected patient
          return updatedPatient;
        }
        return patient;
      });
      
      setPatients(updatedPatients);
      setNewNote('');
    }
  };

  const handleAddMedication = () => {
    if (newMedication.name.trim() && selectedPatient) {
      const medication = {
        ...newMedication,
        prescribed: new Date().toISOString().split('T')[0]
      };
      
      // Update patients array
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedPatient = {
            ...patient,
            medications: [...(patient.medications || []), medication]
          };
          setSelectedPatient(updatedPatient); // Update selected patient
          return updatedPatient;
        }
        return patient;
      });
      
      setPatients(updatedPatients as any);
      setNewMedication(defaultMedicationData);
    }
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatient({ ...patient });
    setEditPatientOpen(true);
  };

  const handleSavePatientEdit = () => {
    if (editingPatient) {
      // Update the patients array
      const updatedPatients = patients.map(patient => 
        patient.id === editingPatient.id ? { ...editingPatient } : patient
      );
      
      setPatients(updatedPatients);
      setSelectedPatient({ ...editingPatient });
      setEditPatientOpen(false);
      setEditingPatient(null);
    }
  };

  const handleEditMedication = (medication: any, index: number) => {
    setEditingMedication({ ...medication, index });
    setEditMedicationOpen(true);
  };

  const handleSaveMedicationEdit = () => {
    if (editingMedication && selectedPatient) {
      // Update patients array
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedMedications = [...(patient.medications || [])];
          updatedMedications[editingMedication.index] = {
            name: editingMedication.name,
            dosage: editingMedication.dosage,
            frequency: editingMedication.frequency,
            duration: editingMedication.duration,
            prescribedBy: editingMedication.prescribedBy || editingMedication.prescribed ,
            status: editingMedication.status || 'Active',
            dateStarted: editingMedication.dateStarted || new Date().toISOString().split('T')[0],
            id: editingMedication.id || Date.now()
          };
          const updatedPatient = {
            ...patient,
            medications: updatedMedications
          };
          setSelectedPatient(updatedPatient);
          return updatedPatient;
        }
        return patient;
      });
      
      setPatients(updatedPatients as any);
      setEditMedicationOpen(false);
      setEditingMedication(null);
    }
  };

  const handleEditNote = (note: any, index: number) => {
    setEditingNote({ ...note, index });
    setEditNoteOpen(true);
  };

  const handleSaveNoteEdit = () => {
    if (editingNote && selectedPatient) {
      // Update patients array
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedNotes = [...(patient.visitNotes || [])];
          updatedNotes[editingNote.index] = {
            date: editingNote.date,
            note: editingNote.note,
            doctor: editingNote.doctor
          };
          const updatedPatient = {
            ...patient,
            visitNotes: updatedNotes
          };
          setSelectedPatient(updatedPatient);
          return updatedPatient;
        }
        return patient;
      });
      
      setPatients(updatedPatients);
      setEditNoteOpen(false);
      setEditingNote(null);
    }
  };

  const handleDeleteMedication = (index: number) => {
    if (selectedPatient && window.confirm('Are you sure you want to delete this medication?')) {
      // Update patients array
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedMedications = [...(patient.medications || [])];
          updatedMedications.splice(index, 1);
          const updatedPatient = {
            ...patient,
            medications: updatedMedications
          };
          setSelectedPatient(updatedPatient);
          return updatedPatient;
        }
        return patient;
      });
      
      setPatients(updatedPatients);
    }
  };

  const handleUploadDocument = () => {
    if (selectedFile && documentTitle.trim() && selectedPatient) {
      // Create file URL for viewing
      const fileUrl = URL.createObjectURL(selectedFile);
      
      const newDocument = {
        id: Date.now(),
        title: documentTitle,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadDate: new Date().toISOString().split('T')[0],
        type: selectedFile.type.includes('image') ? 'image' : 
              selectedFile.type.includes('pdf') ? 'pdf' : 'document',
        fileType: selectedFile.type,
        fileUrl: fileUrl // Store the blob URL for viewing
      };

      // Update patients array
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          const updatedPatient = {
            ...patient,
            documents: [...(patient.documents || []), newDocument]
          };
          setSelectedPatient(updatedPatient);
          return updatedPatient;
        }
        return patient;
      });

      setPatients(updatedPatients as any);
      setUploadDocumentOpen(false);
      setSelectedFile(null);
      setDocumentTitle('');
    }
  };

  const handleAddNewPatient = () => {
    if (!newPatientData.name.trim() || !newPatientData.phone.trim()) {
      alert('Please fill in at least the name and phone number');
      return;
    }

    const newPatient = {
      id: patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1,
      name: newPatientData.name,
      phone: newPatientData.phone,
      email: newPatientData.email || `${newPatientData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      age: parseInt(newPatientData.age) || 30,
      gender: newPatientData.gender || 'Unknown',
      address: newPatientData.address || 'Address not provided',
      emergencyContact: newPatientData.emergencyContact || 'Not provided',
      bloodType: newPatientData.bloodType || 'Unknown',
      condition: newPatientData.condition || 'Initial consultation',
      status: newPatientData.status || 'new',
      avatar: newPatientData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      lastVisit: 'N/A',
      nextAppointment: 'Not scheduled',
      allergies: [],
      medicalHistory: [],
      medications: [],
      visitNotes: [],
      vitalSigns: [],
      documents: [],
    };
    
    setPatients([...patients, newPatient]);
    setAddPatientOpen(false);
    
    // Reset form data
    setNewPatientData(defaultNewPatientData);
    
    // Show success message
    console.log('New patient added:', newPatient);
  };

  const handleCompleteMedicationDetails = (medicationDetails: any) => {
    if (!pendingMedication || !selectedPatient) return;

    // Update the medication in the patient's medications list
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        const updatedMedications = patient.medications?.map((med: any) => 
          med.id === pendingMedication.id 
            ? { 
                ...med, 
                dosage: medicationDetails.dosage || med.dosage,
                frequency: medicationDetails.frequency || med.frequency,
                duration: medicationDetails.duration || med.duration,
                notes: medicationDetails.notes || ''
              }
            : med
        );
        
        return { ...patient, medications: updatedMedications };
      }
      return patient;
    });

    setPatients(updatedPatients);

    // Update selectedPatient separately to ensure UI updates immediately
    const updatedSelectedPatient = {
      ...selectedPatient,
      medications: selectedPatient.medications?.map((med: any) => 
        med.id === pendingMedication.id 
          ? { 
              ...med, 
              dosage: medicationDetails.dosage || med.dosage,
              frequency: medicationDetails.frequency || med.frequency,
              duration: medicationDetails.duration || med.duration,
              notes: medicationDetails.notes || ''
            }
          : med
      )
    };
    setSelectedPatient(updatedSelectedPatient);

    setMedicationDetailsPopup(false);
    setPendingMedication(null);
  };

  const handleSkipMedicationDetails = () => {
    setMedicationDetailsPopup(false);
    setPendingMedication(null);
  };

  const handleScheduleAppointment = (patient: any) => {
    setAppointmentPatient(patient);
    setAppointmentData({
      date: '',
      time: '',
      type: 'Follow-up',
      duration: '30',
      notes: '',
      priority: 'Normal'
    });
    setScheduleAppointmentOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!appointmentData.date || !appointmentData.time || !appointmentPatient) {
      alert('Please fill in the date and time');
      return;
    }

    // Create actual appointment record for appointment page
    const appointmentDateTime = `${appointmentData.date} ${appointmentData.time}`;
    const appointmentDisplay = new Date(`${appointmentData.date}T${appointmentData.time}`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create real appointment record that will appear in appointment page
    const newAppointmentRecord = {
      id: Date.now() + Math.random(), // Unique ID
      patient: appointmentPatient.name,
      patientAvatar: appointmentPatient.name.charAt(0).toUpperCase(),
      doctor: 'Dr. Ahmad', // You can make this dynamic
      date: appointmentData.date,
      time: appointmentData.time,
      timeSlot: appointmentData.time,
      type: appointmentData.type || 'Follow-up',
      duration: parseInt(appointmentData.duration) || 30,
      priority: appointmentData.priority?.toLowerCase() || 'normal',
      location: 'Main Clinic', // You can make this dynamic
      notes: appointmentData.notes || '',
      phone: appointmentPatient.phone || '',
      status: 'confirmed',
      completed: false,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      // Additional fields for compatibility
      patientId: appointmentPatient.id,
      scheduledFromPatientPage: true
    };

    // Load existing appointments and add the new one
    const existingAppointments = JSON.parse(localStorage.getItem('clinic_appointments_data') || '[]');
    const updatedAppointments = [...existingAppointments, newAppointmentRecord];
    localStorage.setItem('clinic_appointments_data', JSON.stringify(updatedAppointments));

    // Update patient's appointment display (today or next)
    const appointmentDate = appointmentData.date;
    const today = new Date().toISOString().split('T')[0];
    const isToday = appointmentDate === today;
    
    const updatedPatients = patients.map(patient => 
      patient.id === appointmentPatient.id 
        ? { 
            ...patient, 
            todayAppointment: isToday ? `Today ${appointmentData.time}` : patient.todayAppointment,
            nextAppointment: isToday ? patient.nextAppointment : appointmentDisplay,
            appointmentDetails: {
              ...appointmentData,
              dateTime: appointmentDateTime,
              scheduledOn: new Date().toISOString()
            }
          }
        : patient
    );

    setPatients(updatedPatients);

    // Update selectedPatient if it's the same patient
    if (selectedPatient?.id === appointmentPatient.id) {
      setSelectedPatient({
        ...selectedPatient,
        todayAppointment: isToday ? `Today ${appointmentData.time}` : selectedPatient.todayAppointment,
        nextAppointment: isToday ? selectedPatient.nextAppointment : appointmentDisplay,
        appointmentDetails: {
          ...appointmentData,
          dateTime: appointmentDateTime,
          scheduledOn: new Date().toISOString()
        }
      });
    }

    // Sync patient appointment fields immediately
    import('../../utils/appointmentPatientSync').then(({ updatePatientAppointmentFields }) => {
      updatePatientAppointmentFields(appointmentPatient.name);
    });

    // Dispatch event to notify appointment page of the new appointment
    window.dispatchEvent(new CustomEvent('appointmentPatientSync', {
      detail: { 
        timestamp: new Date().toISOString(),
        newAppointment: newAppointmentRecord,
        patientName: appointmentPatient.name
      }
    }));

    setScheduleAppointmentOpen(false);
    setAppointmentPatient(null);
    alert(`Appointment scheduled for ${appointmentPatient.name} on ${appointmentDisplay}`);
  };

  const handleQuickStatusEdit = (patient: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setStatusEditPatient(patient);
    setStatusMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!statusEditPatient) return;

    const updatedPatients = patients.map(patient => 
      patient.id === statusEditPatient.id 
        ? { ...patient, status: newStatus }
        : patient
    );

    setPatients(updatedPatients);

    // Update selectedPatient if it's the same patient
    if (selectedPatient?.id === statusEditPatient.id) {
      setSelectedPatient({
        ...selectedPatient,
        status: newStatus
      });
    }

    setStatusMenuAnchor(null);
    setStatusEditPatient(null);
  };

  const handleViewDocument = (document: any) => {
    setViewingDocument(document);
    setDocumentViewerOpen(true);
  };

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false);
    setViewingDocument(null);
  };

  const handleAddMedicalHistory = () => {
    if (!newMedicalHistory.condition.trim() || !selectedPatient) {
      alert('Please fill in the condition field');
      return;
    }

    let treatmentText = '';
    let newMedicationCreated = null;
    
    // Handle different treatment types
    if (treatmentType === 'existing' && selectedMedication) {
      const medication = selectedPatient?.medications?.find((m: any) => m.name === selectedMedication);
      treatmentText = medication ? `${medication.name} - ${medication.dosage}, ${medication.frequency}` : selectedMedication;
    } else if (treatmentType === 'new') {
      if (!newTreatmentMedication.name.trim()) {
        alert('Please enter the medication name');
        return;
      }

      // Create medication with basic info initially
      const newMedication = {
        id: Date.now(),
        name: newTreatmentMedication.name,
        dosage: newTreatmentMedication.dosage.trim() || '⚠️ Pending',
        frequency: newTreatmentMedication.frequency.trim() || '⚠️ Pending',
        duration: newTreatmentMedication.duration.trim() || '⚠️ Pending',
        status: 'Active' as const,
        prescribedBy: '',
        dateStarted: new Date().toISOString().split('T')[0]
      };

      // Add medication to patient's list
      const updatedPatients = patients.map(p => 
        p.id === selectedPatient?.id 
          ? { ...p, medications: [...(p.medications || []), newMedication] }
          : p
      );
      setPatients(updatedPatients);

      // Update selectedPatient to reflect the new medication immediately
      const updatedSelectedPatient = {
        ...selectedPatient,
        medications: [...(selectedPatient.medications || []), newMedication]
      };
      setSelectedPatient(updatedSelectedPatient);



      // Store the new medication for popup
      newMedicationCreated = newMedication;
      
      treatmentText = `${newTreatmentMedication.name} (Added to medications - details pending completion)`;
    } else if (treatmentType === 'custom') {
      if (!newMedicalHistory.treatment.trim()) {
        alert('Please enter the custom treatment details');
        return;
      }
      treatmentText = newMedicalHistory.treatment;
    } else if (treatmentType === 'existing' && !selectedMedication) {
      alert('Please select a medication from the dropdown or choose a different treatment type');
      return;
    }

    if (!treatmentText) {
      alert('Please specify a treatment');
      return;
    }

    const medicalHistoryEntry = {
      date: newMedicalHistory.date,
      condition: newMedicalHistory.condition,
      treatment: treatmentText,
      doctor: newMedicalHistory.doctor,
      notes: newMedicalHistory.notes
    };
    
    // Update patients array with medical history
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        const updatedPatient = {
          ...patient,
          medicalHistory: [...(patient.medicalHistory || []), medicalHistoryEntry]
        };
        setSelectedPatient(updatedPatient); // Update selected patient
        return updatedPatient;
      }
      return patient;
    });
    
    setPatients(updatedPatients);

    // Reset all form states
    setAddMedicalHistoryOpen(false);
    setNewMedicalHistory({
      date: new Date().toISOString().split('T')[0],
      condition: '',
      treatment: '',
      doctor: '',
      notes: ''
    });
    setTreatmentType('existing');
    setSelectedMedication('');
    setNewTreatmentMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: ''
    });

    // Show medication details popup if we created a new medication
    if (newMedicationCreated) {
      setPendingMedication(newMedicationCreated);
      setTimeout(() => {
        setMedicationDetailsPopup(true);
      }, 200); // Small delay to ensure dialog transition
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'follow-up':
        return 'warning';
      case 'old':
        return 'success';
      case 'admitted':
        return 'secondary';
      case 'transferred':
        return 'secondary';
      case 'discharged':
        return 'default';
      default:
        return 'default';
    }
  };

  const getFilteredPatients = () => {
    let filtered = patients;

    // Apply organization mode filtering first
    if (patientOrganizationMode === 'reservation' && organizedAppointmentData) {
      // Filter patients based on appointment reservation status
      const organizedPatients = getPatientsOrganizedByAppointmentStatus();
      const patientsWithReservations = organizedPatients.patientsWithPending.concat(organizedPatients.patientsWithCompleted);
      const patientsWithoutReservations = organizedPatients.patientsWithNoAppointments;
      
      // Show patients grouped by reservation status - with reservations first
      filtered = [
        ...patientsWithReservations.map(p => ({ 
          ...p, 
          _organizationGroup: 'With Appointments',
          _appointmentCount: p.appointmentData?.totalAppointments || 0
        })),
        ...patientsWithoutReservations.map(p => ({ 
          ...p, 
          _organizationGroup: 'No Appointments',
          _appointmentCount: 0
        }))
      ];
    } else if (patientOrganizationMode === 'completion' && organizedAppointmentData) {
      // Filter patients based on appointment completion status
      const organizedPatients = getPatientsOrganizedByAppointmentStatus();
      
      // Show patients grouped by completion status - completed first
      filtered = [
        ...organizedPatients.patientsWithCompleted.map(p => ({ 
          ...p, 
          _organizationGroup: 'With Completed Appointments',
          _completedCount: p.appointmentData?.completed?.length || 0
        })),
        ...organizedPatients.patientsWithPending.map(p => ({ 
          ...p, 
          _organizationGroup: 'With Pending Appointments',
          _pendingCount: p.appointmentData?.notCompleted?.length || 0
        })),
        ...organizedPatients.patientsWithNoAppointments.map(p => ({ 
          ...p, 
          _organizationGroup: 'No Appointments',
          _completedCount: 0,
          _pendingCount: 0
        }))
      ];
    }

    // Now apply filters to the organized list
    filtered = filtered.filter(patient => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchQuery.toLowerCase());

      // Gender filter
      const matchesGender = activeFilters.gender === '' || 
        patient.gender.toLowerCase() === activeFilters.gender.toLowerCase();

      // Age range filter
      const matchesAge = activeFilters.ageRange === '' || (() => {
        const age = patient.age;
        switch (activeFilters.ageRange) {
          case '18-30': return age >= 18 && age <= 30;
          case '31-50': return age >= 31 && age <= 50;
          case '51-65': return age >= 51 && age <= 65;
          case '65+': return age > 65;
          default: return true;
        }
      })();

      // Condition filter
      const matchesCondition = activeFilters.condition === '' ||
        patient.condition.toLowerCase().includes(activeFilters.condition.toLowerCase());

      // Status filter
      const matchesStatus = activeFilters.status === '' ||
        patient.status === activeFilters.status;

      return matchesSearch && matchesGender && matchesAge && matchesCondition && matchesStatus;
    });

    // Apply tab-specific filtering (skip for appointment data tab)
    if (tabValue !== 7) {
      switch (tabValue) {
        case 1: // New patients
          filtered = filtered.filter(patient => patient.status === 'new');
          break;
        case 2: // Follow-up patients
          filtered = filtered.filter(patient => patient.status === 'follow-up');
          break;
        case 3: // Old patients
          filtered = filtered.filter(patient => patient.status === 'old');
          break;
        case 4: // Under Observation patients
          filtered = filtered.filter(patient => patient.status === 'admitted');
          break;
        case 5: // Transferred patients
          filtered = filtered.filter(patient => patient.status === 'transferred');
          break;
        case 6: // Discharged patients
          filtered = filtered.filter(patient => patient.status === 'discharged');
          break;
        default: // All patients
          break;
      }
    }

    return filtered;
  };

  const filteredPatients = getFilteredPatients();

  const handleFilterSelect = (filterType: string, filterValue: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: filterValue
    }));
    setFilterAnchor(null);
  };

  const clearAllFilters = () => {
    setActiveFilters({
      gender: '',
      ageRange: '',
      condition: '',
      status: ''
    });
    setSearchQuery('');
    setFilterAnchor(null);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== '').length + (searchQuery ? 1 : 0);
  };

  // Check if patient was received/registered today
  const isReceivedToday = (patient: any) => {
    if (!patient.createdAt && !patient.registrationDate) return false;
    
    const patientDate = new Date(patient.createdAt || patient.registrationDate);
    const today = new Date();
    
    return patientDate.toDateString() === today.toDateString();
  };

  // Get formatted received date
  const getReceivedDate = (patient: any) => {
    if (!patient.createdAt && !patient.registrationDate) return null;
    
    const patientDate = new Date(patient.createdAt || patient.registrationDate);
    return patientDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle last visit editing
  const handleEditLastVisit = (patient: any) => {
    setEditLastVisitPatient(patient);
    setNewLastVisitDate(patient.lastVisit ? 
      new Date(patient.lastVisit).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0]
    );
    setEditLastVisitOpen(true);
  };

  const handleSaveLastVisit = () => {
    if (!editLastVisitPatient || !newLastVisitDate) return;

    const formattedDate = new Date(newLastVisitDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const updatedPatients = patients.map(patient => 
      patient.id === editLastVisitPatient.id 
        ? { ...patient, lastVisit: formattedDate }
        : patient
    );

    setPatients(updatedPatients);

    // Update selectedPatient if it's the same patient
    if (selectedPatient?.id === editLastVisitPatient.id) {
      setSelectedPatient({
        ...selectedPatient,
        lastVisit: formattedDate
      });
    }

    // Sync appointment data
    import('../../utils/appointmentPatientSync').then(({ updatePatientAppointmentFields }) => {
      updatePatientAppointmentFields(editLastVisitPatient.name);
    });

    setEditLastVisitOpen(false);
    setEditLastVisitPatient(null);
    setNewLastVisitDate('');
  };

  // Show loading spinner while data is loading
  if (dataLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            gap: 2
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="textSecondary">
            Loading patient data...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we load your patient information
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Enhanced Unified Header Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.25)',
          }}>
            

            {/* Responsive Main Header Content */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' }, 
              justifyContent: 'space-between', 
              gap: { xs: 3, md: 0 },
              position: 'relative', 
              zIndex: 2 
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
                  <People sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />
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
                    {t('patient_management')}
                  </Typography>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    🩺 {t('patient dashboard ')}
                  </Typography>
                </Box>
              </Box>
              
              {/* Responsive Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.5, sm: 2 },
                width: { xs: '100%', md: 'auto' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppAll}
                  size="medium"
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(37, 211, 102, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: 'rgba(37, 211, 102, 0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(37, 211, 102, 0.25)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('whatsapp_all')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Schedule />}
                  onClick={() => {
                    // Force sync appointments to patients
                    const syncedPatients = sendAppointmentDataToPatients();
                    setPatients(syncedPatients);
                    
                    // Refresh organized data
                    const organizedData = organizeAppointmentsByCompletion();
                    const organizedPatients = getPatientsOrganizedByAppointmentStatus();
                    setOrganizedAppointmentData(organizedData);
                    setPatientsWithAppointments(organizedPatients.allPatients);
                    
                    console.log('🔄 Manual sync completed!');
                  }}
                  size="medium"
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(33, 150, 243, 0.25)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('sync_appointments')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setAddPatientOpen(true)}
                  size="medium"
                  sx={{ 
                    borderRadius: { xs: 2, md: 3 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.5, sm: 1.5 },
                    minHeight: { xs: 48, md: 'auto' },
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {t('add_new_patient')}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    Add Patient
                  </Box>
                </Button>
              </Box>
            </Box>
            
            {/* Decorative background elements */}
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
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              zIndex: 1,
            }} />
          </Box>





          {/* Enhanced Main Content */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
                            {/* Enhanced Search and Filters - Improved Layout */}
              <Box sx={{ 
                p: 4, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%)'
              }}>
                {/* Search Row */}
                <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                  <Grid item xs={12} lg={8}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        placeholder={`🔍 ${t('search_patients_placeholder')}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search sx={{ color: 'primary.main', fontSize: 24 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 4,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                              border: '2px solid #667eea',
                              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                            }
                          },
                          '& .MuiInputBase-input': {
                            padding: '16px 14px',
                            fontSize: '1rem',
                            fontWeight: 500,
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                      <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={(e) => setFilterAnchor(e.currentTarget)}
                        sx={{ 
                          borderRadius: 3,
                          fontWeight: 600,
                          backgroundColor: 'white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          minWidth: 120,
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                          },
                          transition: 'all 0.3s ease',
                          ...(getActiveFilterCount() > 0 && {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                            }
                          })
                        }}
                      >
                        🔽 {t('filter')}
                        {getActiveFilterCount() > 0 && (
                          <Chip
                            label={getActiveFilterCount()}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              color: 'primary.main',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          />
                        )}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                {/* Controls Row */}
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} lg={8}>
                    {/* Enhanced Organization Mode Controls */}
                    <Card sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      p: 2, 
                      backgroundColor: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'text.primary',
                          minWidth: 'fit-content',
                          mr: 1
                        }}
                      >
                        📊 {t('organize')}:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant={patientOrganizationMode === 'all' ? 'contained' : 'outlined'}
                          onClick={() => setPatientOrganizationMode('all')}
                          startIcon={<People />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 2,
                            minWidth: 'fit-content',
                            ...(patientOrganizationMode === 'all' && {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            }),
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {t('all')}
                        </Button>
                        <Button
                          size="small"
                          variant={patientOrganizationMode === 'reservation' ? 'contained' : 'outlined'}
                          onClick={() => setPatientOrganizationMode('reservation')}
                          startIcon={<CalendarToday />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 2,
                            minWidth: 'fit-content',
                            ...(patientOrganizationMode === 'reservation' && {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            }),
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {t('reservations')}
                        </Button>
                        <Button
                          size="small"
                          variant={patientOrganizationMode === 'completion' ? 'contained' : 'outlined'}
                          onClick={() => setPatientOrganizationMode('completion')}
                          startIcon={<CheckCircle />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 2,
                            minWidth: 'fit-content',
                            ...(patientOrganizationMode === 'completion' && {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            }),
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {t('completion')}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} lg={4}>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                      {/* Enhanced View Mode Controls */}
                      <Card sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        p: 1.5, 
                        backgroundColor: 'white',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Button
                          size="small"
                          variant={viewMode === 'table' ? 'contained' : 'outlined'}
                          onClick={() => setViewMode('table')}
                          startIcon={<Assignment />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 2,
                            minWidth: 'fit-content',
                            ...(viewMode === 'table' && {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            }),
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {t('table')}
                        </Button>
                        <Button
                          size="small"
                          variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                          onClick={() => setViewMode('cards')}
                          startIcon={<MedicalServices />}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 2,
                            minWidth: 'fit-content',
                            ...(viewMode === 'cards' && {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            }),
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {t('cards')}
                        </Button>
                      </Card>
                    </Box>
                  </Grid>
                </Grid>

                {/* Active Filters Display */}
                {getActiveFilterCount() > 0 && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                      {t('active_filters')}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {searchQuery && (
                        <Chip
                          label={`${t('search')}: "${searchQuery}"`}
                          size="small"
                          onDelete={() => setSearchQuery('')}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {activeFilters.gender && (
                        <Chip
                          label={`${t('gender')}: ${activeFilters.gender}`}
                          size="small"
                          onDelete={() => handleFilterSelect('gender', '')}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {activeFilters.ageRange && (
                        <Chip
                          label={`${t('age')}: ${activeFilters.ageRange}`}
                          size="small"
                          onDelete={() => handleFilterSelect('ageRange', '')}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {activeFilters.status && (
                        <Chip
                          label={`${t('status')}: ${activeFilters.status}`}
                          size="small"
                          onDelete={() => handleFilterSelect('status', '')}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {activeFilters.condition && (
                        <Chip
                          label={`${t('condition')}: ${activeFilters.condition}`}
                          size="small"
                          onDelete={() => handleFilterSelect('condition', '')}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      <Button
                        size="small"
                        onClick={clearAllFilters}
                        sx={{ 
                          fontSize: '0.75rem',
                          color: 'error.main',
                          '&:hover': { backgroundColor: 'error.light', color: 'white' }
                        }}
                      >
                        {t('clear_all')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Enhanced Organization Summary */}
              {patientOrganizationMode !== 'all' && organizedAppointmentData && (
                <Box sx={{ 
                  px: 4, 
                  py: 3, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'primary.main' }}>
                    📊 {t('organization_summary')} - {patientOrganizationMode === 'reservation' ? t('by_reservation_status') : t('by_completion_status')}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '2px solid #4caf50',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main', mb: 1 }}>
                          {patientOrganizationMode === 'reservation' ? 
                            getPatientsOrganizedByAppointmentStatus().patientsWithPending.concat(getPatientsOrganizedByAppointmentStatus().patientsWithCompleted).length :
                            getPatientsOrganizedByAppointmentStatus().patientsWithCompleted.length
                          }
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {patientOrganizationMode === 'reservation' ? `📅 ${t('with_appointments')}` : `✅ ${t('with_completed')}`}
                        </Typography>
                        <Box sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }} />
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '2px solid #ff9800',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', mb: 1 }}>
                          {patientOrganizationMode === 'reservation' ? 
                            getPatientsOrganizedByAppointmentStatus().patientsWithNoAppointments.length :
                            getPatientsOrganizedByAppointmentStatus().patientsWithPending.length
                          }
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {patientOrganizationMode === 'reservation' ? `❌ ${t('no_appointments')}` : `⏳ ${t('with_pending')}`}
                        </Typography>
                        <Box sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        }} />
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '2px solid #2196f3',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                          {patientOrganizationMode === 'completion' ? 
                            getPatientsOrganizedByAppointmentStatus().patientsWithNoAppointments.length :
                            organizedAppointmentData.completed.length + organizedAppointmentData.notCompleted.length
                          }
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {patientOrganizationMode === 'completion' ? `🚫 ${t('no_appointments')}` : `📊 ${t('total_appointments')}`}
                        </Typography>
                        <Box sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        }} />
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Results Summary */}
              {(getActiveFilterCount() > 0 || searchQuery) && (
                <Box sx={{ px: 3, py: 2, backgroundColor: '#f8f9fa', borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('showing_patients')} {filteredPatients.length} {t('of_patients')} {patients.length} {t('patients')}
                    {getActiveFilterCount() > 0 && ` ${t('with')} ${getActiveFilterCount()} ${t('filters_applied')}`}
                    {patientOrganizationMode !== 'all' && ` • ${t('organized_by')} ${patientOrganizationMode}`}
                  </Typography>
                </Box>
              )}

              {/* Enhanced Tabs */}
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                px: 4, 
                py: 2,
                background: 'linear-gradient(to right, #fafbfc, #f8f9fa)'
              }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  variant="scrollable" 
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      borderRadius: 3,
                      margin: '0 4px',
                      minHeight: 48,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'white',
                        color: 'primary.main',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    }
                  }}
                >
                  <Tab 
                    label={`👥 ${t('all patients')} (${filteredPatients.length})`} 
                    icon={<People />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`🆕 ${t('new')} (${filteredPatients.filter(p => p.status === 'new').length})`} 
                    icon={<PersonAdd />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`📋 ${t('follow-up')} (${filteredPatients.filter(p => p.status === 'follow-up').length})`} 
                    icon={<Assignment />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`👴 ${t('old')} (${filteredPatients.filter(p => p.status === 'old').length})`} 
                    icon={<History />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`🏥 ${t('under observation')} (${filteredPatients.filter(p => p.status === 'admitted').length})`} 
                    icon={<MedicalServices />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`↗️ ${t('transferred')} (${filteredPatients.filter(p => p.status === 'transferred').length})`} 
                    icon={<LocationOn />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`✅ ${t('discharged')} (${filteredPatients.filter(p => p.status === 'discharged').length})`} 
                    icon={<CheckCircle />}
                    iconPosition="start"
                  />
                  <Tab 
                    label={`📅 ${t('appointment data')} (${organizedAppointmentData ? organizedAppointmentData.completed.length + organizedAppointmentData.notCompleted.length : 0})`} 
                    icon={<CalendarToday />} 
                    iconPosition="start"
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 700,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                      }
                    }}
                  />
                </Tabs>
              </Box>

              {/* Patient List - Table View */}
              {viewMode === 'table' && (
                <>
                  {/* All Patients Tab */}
                  <TabPanel value={tabValue} index={0}>
                    {/* Organization Mode Info */}
                    {patientOrganizationMode !== 'all' && (
                      <Alert severity="info" sx={{ m: 3, mb: 2 }}>
                        <Typography variant="body2">
                                                  {t('organized_by_text')} {patientOrganizationMode === 'reservation' ? t('appointment_reservations') : t('appointment_completion_status')}. 
                        {patientOrganizationMode === 'reservation' && ` ${t('patients_with_appointments_listed_first')}`}
                        {patientOrganizationMode === 'completion' && ` ${t('patients_with_completed_listed_first')}`}
                        </Typography>
                      </Alert>
                    )}
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Today's Appointment</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 && getActiveFilterCount() > 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <FilterList sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    {t('no_patients_match_filters')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {t('try_adjusting_criteria')}
                                  </Typography>
                                  <Button 
                                    variant="outlined" 
                                    onClick={clearAllFilters}
                                    startIcon={<FilterList />}
                                  >
                                    {t('clear_all_filters')}
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    {t('no_patients_found')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {t('add_first_patient')}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {patient.avatar}
                                  </Avatar>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography 
                                        variant="body2" 
                                        fontWeight={600}
                                        sx={{ 
                                          color: 'primary.main', 
                                          cursor: 'pointer',
                                          '&:hover': { textDecoration: 'underline' }
                                        }}
                                        onClick={() => handleOpenPatientProfile(patient)}
                                      >
                                        {patient.name}
                                      </Typography>
                                      {isReceivedToday(patient) && (
                                        <Chip
                                          label="Today"
                                          size="small"
                                          color="success"
                                          variant="filled"
                                          sx={{ 
                                            fontSize: '0.65rem', 
                                            height: 18,
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            fontWeight: 600
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.gender}, {patient.age} years
                                    </Typography>
                                    {getReceivedDate(patient) && !isReceivedToday(patient) && (
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Registered: {getReceivedDate(patient)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{patient.phone}</Typography>
                                    <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">{patient.lastVisit}</Typography>
                                  <Tooltip title="Edit Last Visit Date" arrow>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleEditLastVisit(patient)}
                                      sx={{ p: 0.5 }}
                                    >
                                      <Edit sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  {patient.todayAppointment ? (
                                    <Typography variant="body2" color="success.main" fontWeight={600}>
                                      {patient.todayAppointment}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No appointment today
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                                    {patient.nextAppointment || 'Not scheduled'}
                                  </Typography>
                                  {patient.appointmentDetails?.scheduledOn && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Scheduled: {new Date(patient.appointmentDetails.scheduledOn).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Medical Notes & History">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Patient Info">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send WhatsApp Message">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Schedule Appointment">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleScheduleAppointment(patient)}
                                    >
                                      <CalendarToday fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* New Patients Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    {t('no_new_patients')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {t('all_new_patients_appear')}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {patient.avatar}
                                  </Avatar>
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight={600}
                                      sx={{ 
                                        color: 'primary.main', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      {patient.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.gender}, {patient.age} years
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{patient.phone}</Typography>
                                    <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{patient.lastVisit}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {patient.nextAppointment}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Medical Notes & History">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Patient Info">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send WhatsApp Message">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Schedule Appointment">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleScheduleAppointment(patient)}
                                    >
                                      <CalendarToday fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Follow-up Patients Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    {t('no_follow_up_patients')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {t('follow_up_patients_appear')}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {patient.avatar}
                                  </Avatar>
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight={600}
                                      sx={{ 
                                        color: 'primary.main', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      {patient.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.gender}, {patient.age} years
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{patient.phone}</Typography>
                                    <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{patient.lastVisit}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {patient.nextAppointment}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Medical Notes & History">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Patient Info">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send WhatsApp Message">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Schedule Appointment">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleScheduleAppointment(patient)}
                                    >
                                      <CalendarToday fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Old Patients Tab */}
                  <TabPanel value={tabValue} index={3}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPatients.length === 0 && getActiveFilterCount() > 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                              <Box>
                                <FilterList sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No patients match your filters
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Try adjusting your search criteria or clearing some filters
                                </Typography>
                                <Button 
                                  variant="outlined" 
                                  onClick={clearAllFilters}
                                  startIcon={<FilterList />}
                                >
                                  Clear All Filters
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : filteredPatients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                              <Box>
                                <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No patients found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Add your first patient to get started
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPatients.map((patient) => (
                          <TableRow key={patient.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={600}
                                    sx={{ 
                                      color: 'primary.main', 
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="body2">{patient.phone}</Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {patient.email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{patient.lastVisit}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary.main" fontWeight={600}>
                                {patient.nextAppointment}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Click to change status" arrow>
                                <Chip
                                  label={translatePatientData(patient.status)}
                                  color={getStatusColor(patient.status) as any}
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => handleQuickStatusEdit(patient, e)}
                                  sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': { 
                                      backgroundColor: 'primary.light',
                                      transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient Info">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                  {/* Under Observation Patients Tab */}
                  <TabPanel value={tabValue} index={4}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No patients under observation
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Patients admitted for observation or delivery will appear here
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {patient.avatar}
                                  </Avatar>
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight={600}
                                      sx={{ 
                                        color: 'primary.main', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      {patient.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.gender}, {patient.age} years
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{patient.phone}</Typography>
                                    <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{patient.lastVisit}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {patient.nextAppointment}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Medical Notes & History">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Patient Info">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send WhatsApp Message">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Schedule Appointment">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleScheduleAppointment(patient)}
                                    >
                                      <CalendarToday fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Transferred Patients Tab */}
                  <TabPanel value={tabValue} index={5}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No transferred patients
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Patients transferred to other facilities will appear here
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {patient.avatar}
                                  </Avatar>
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight={600}
                                      sx={{ 
                                        color: 'primary.main', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      {patient.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.gender}, {patient.age} years
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{patient.phone}</Typography>
                                    <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{patient.lastVisit}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {patient.nextAppointment}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Medical Notes & History">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Patient Info">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send WhatsApp Message">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Schedule Appointment">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleScheduleAppointment(patient)}
                                    >
                                      <CalendarToday fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Discharged Patients Tab */}
                  <TabPanel value={tabValue} index={6}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                <Box>
                                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No discharged patients
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Discharged patients will appear here
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPatients.map((patient) => (
                            <TableRow key={patient.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {patient.avatar}
                                  </Avatar>
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight={600}
                                      sx={{ 
                                        color: 'primary.main', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                      }}
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      {patient.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.gender}, {patient.age} years
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2">{patient.phone}</Typography>
                                    <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {patient.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{patient.lastVisit}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {patient.nextAppointment}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{translatePatientData(patient.condition)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Medical Notes & History">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenPatientProfile(patient)}
                                    >
                                      <Assignment fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Patient Info">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send WhatsApp Message">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Schedule Appointment">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleScheduleAppointment(patient)}
                                    >
                                      <CalendarToday fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Appointment Data Tab */}
                  <TabPanel value={tabValue} index={7}>
                    {organizedAppointmentData ? (
                      <Box sx={{ p: 3 }}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            {t('appointment_data_organized_by_completion')}
                          </Typography>
                        </Alert>

                        {/* Summary Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 3, backgroundColor: '#e8f5e8' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
                                  Completed Appointments
                                </Typography>
                              </Box>
                              <Typography variant="h3" sx={{ fontWeight: 800, color: '#4caf50', mb: 1 }}>
                                {organizedAppointmentData.completed.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('successfully_completed_appointments')}
                              </Typography>
                            </Card>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 3, backgroundColor: '#fff3e0' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Schedule sx={{ color: '#ff9800', mr: 1 }} />
                                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>
                                  {t('pending_not_completed')}
                                </Typography>
                              </Box>
                              <Typography variant="h3" sx={{ fontWeight: 800, color: '#ff9800', mb: 1 }}>
                                {organizedAppointmentData.notCompleted.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('appointments_awaiting_completion')}
                              </Typography>
                            </Card>
                          </Grid>
                        </Grid>

                        {/* Completed Appointments Table */}
                        <Card sx={{ mb: 4 }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4caf50' }}>
                              ✅ {t('completed_appointments')} ({organizedAppointmentData.completed.length})
                            </Typography>
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('date')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('time')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('type')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('duration')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {organizedAppointmentData.completed.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          {t('no_completed_appointments_found')}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    organizedAppointmentData.completed.map((appointment: any) => (
                                      <TableRow key={appointment.id} hover>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.75rem' }}>
                                              {appointment.patientAvatar || appointment.patient.substring(0, 2).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>
                                              {appointment.patient}
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.date}</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.time}</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.doctor}</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip label={appointment.type} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.duration || 30} min</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={t('completed')} 
                                            color="success" 
                                            size="small"
                                            icon={<CheckCircle />}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>

                        {/* Not Completed Appointments Table */}
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ff9800' }}>
                              ⏳ {t('pending_not_completed')} ({organizedAppointmentData.notCompleted.length})
                            </Typography>
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('date')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('time')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('type')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('duration')}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {organizedAppointmentData.notCompleted.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          {t('no_pending_appointments_found')}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    organizedAppointmentData.notCompleted.map((appointment: any) => (
                                      <TableRow key={appointment.id} hover>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.75rem' }}>
                                              {appointment.patientAvatar || appointment.patient.substring(0, 2).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>
                                              {appointment.patient}
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.date}</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.time}</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.doctor}</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip label={appointment.type} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">{appointment.duration || 30} min</Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={appointment.status} 
                                            color={appointment.status === 'confirmed' ? 'primary' : appointment.status === 'pending' ? 'warning' : 'error'} 
                                            size="small"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Box>
                    ) : (
                      <Box sx={{ p: 6, textAlign: 'center' }}>
                        <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                          {t('loading_appointment_data')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {t('syncing_appointment_data')}
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>
                </>
              )}

              {/* Patient List - Cards View */}
              {viewMode === 'cards' && (
                <>
                  {/* All Patients Tab */}
                  <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 && getActiveFilterCount() > 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <FilterList sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No patients match your filters
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Try adjusting your search criteria or clearing some filters
                            </Typography>
                            <Button 
                              variant="contained" 
                              onClick={clearAllFilters}
                              startIcon={<FilterList />}
                            >
                              Clear All Filters
                            </Button>
                          </Card>
                        </Grid>
                      ) : filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No patients found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Add your first patient to get started
                            </Typography>
                            <Button 
                              variant="contained" 
                              onClick={() => setAddPatientOpen(true)}
                              startIcon={<PersonAdd />}
                              sx={{
                                minHeight: { xs: 48, md: 'auto' },
                                px: { xs: 3, md: 4 },
                                py: { xs: 1.5, md: 1.5 },
                                fontSize: { xs: '0.9rem', md: '1rem' },
                                borderRadius: { xs: 2, md: 1 },
                                fontWeight: 600
                              }}
                            >
                              Add New Patient
                            </Button>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* New Patients Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No new patients found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              All new patients will appear here
                            </Typography>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Follow-up Patients Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No follow-up patients found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Patients requiring follow-up will appear here
                            </Typography>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Old Patients Tab */}
                  <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No old patients found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Established patients will appear here
                            </Typography>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Under Observation Patients Tab */}
                  <TabPanel value={tabValue} index={4}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No patients under observation
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Patients admitted for observation or delivery will appear here
                            </Typography>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Transferred Patients Tab */}
                  <TabPanel value={tabValue} index={5}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No transferred patients
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Patients transferred to other facilities will appear here
                            </Typography>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Discharged Patients Tab */}
                  <TabPanel value={tabValue} index={6}>
                    <Grid container spacing={3} sx={{ p: 3 }}>
                      {filteredPatients.length === 0 ? (
                        <Grid item xs={12}>
                          <Card sx={{ p: 6, textAlign: 'center' }}>
                            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                              No discharged patients
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              Discharged patients will appear here
                            </Typography>
                          </Card>
                        </Grid>
                      ) : (
                        filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                          <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    backgroundColor: 'primary.main',
                                  }}
                                >
                                  {patient.avatar}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    {patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {patient.gender}, {patient.age} years
                                  </Typography>
                                </Box>
                                <Tooltip title="Click to change status" arrow>
                                  <Chip
                                    label={translatePatientData(patient.status)}
                                    color={getStatusColor(patient.status) as any}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => handleQuickStatusEdit(patient, e)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {patient.phone}
                                  </Typography>
                                  <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Condition: {translatePatientData(patient.condition)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Last Visit: {patient.lastVisit}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  Next: {patient.nextAppointment}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Tooltip title="Medical Notes & History">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenPatientProfile(patient)}
                                  >
                                    <Assignment fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send WhatsApp Message">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleWhatsAppMessage(patient.phone, patient.name)}
                                    sx={{ color: '#25D366' }}
                                  >
                                    <WhatsApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Schedule Appointment">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleScheduleAppointment(patient)}
                                  >
                                    <CalendarToday fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Patient">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        ))
                      )}
                    </Grid>
                  </TabPanel>

                  {/* Appointment Data Tab - Cards View */}
                  <TabPanel value={tabValue} index={7}>
                    {organizedAppointmentData ? (
                      <Box sx={{ p: 3 }}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            {t('appointment_data_organized_by_completion')}
                          </Typography>
                        </Alert>

                        {/* Summary Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 3, backgroundColor: '#e8f5e8' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
                                  Completed Appointments
                                </Typography>
                              </Box>
                              <Typography variant="h3" sx={{ fontWeight: 800, color: '#4caf50', mb: 1 }}>
                                {organizedAppointmentData.completed.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('successfully_completed_appointments')}
                              </Typography>
                            </Card>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 3, backgroundColor: '#fff3e0' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Schedule sx={{ color: '#ff9800', mr: 1 }} />
                                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>
                                  {t('pending_not_completed')}
                                </Typography>
                              </Box>
                              <Typography variant="h3" sx={{ fontWeight: 800, color: '#ff9800', mb: 1 }}>
                                {organizedAppointmentData.notCompleted.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('appointments_awaiting_completion')}
                              </Typography>
                            </Card>
                          </Grid>
                        </Grid>

                        {/* Completed Appointments Cards */}
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4caf50' }}>
                          ✅ Completed Appointments ({organizedAppointmentData.completed.length})
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                          {organizedAppointmentData.completed.length === 0 ? (
                            <Grid item xs={12}>
                              <Card sx={{ p: 4, textAlign: 'center' }}>
                                <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No completed appointments
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Completed appointments will appear here
                                </Typography>
                              </Card>
                            </Grid>
                          ) : (
                            organizedAppointmentData.completed.map((appointment: any) => (
                              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                                <Card sx={{ height: '100%', border: '2px solid #e8f5e8' }}>
                                  <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Avatar sx={{ width: 40, height: 40, mr: 2, backgroundColor: '#4caf50' }}>
                                        {appointment.patientAvatar || appointment.patient.substring(0, 2).toUpperCase()}
                                      </Avatar>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                          {appointment.patient}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {appointment.date} at {appointment.time}
                                        </Typography>
                                      </Box>
                                      <Chip 
                                        label={t('completed')} 
                                        color="success" 
                                        size="small"
                                        icon={<CheckCircle />}
                                      />
                                    </Box>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Doctor: {appointment.doctor}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Type: {appointment.type}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Duration: {appointment.duration || 30} minutes
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))
                          )}
                        </Grid>

                        {/* Not Completed Appointments Cards */}
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ff9800' }}>
                          ⏳ {t('pending_not_completed')} Appointments ({organizedAppointmentData.notCompleted.length})
                        </Typography>
                        <Grid container spacing={3}>
                          {organizedAppointmentData.notCompleted.length === 0 ? (
                            <Grid item xs={12}>
                              <Card sx={{ p: 4, textAlign: 'center' }}>
                                <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No pending appointments
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Pending appointments will appear here
                                </Typography>
                              </Card>
                            </Grid>
                          ) : (
                            organizedAppointmentData.notCompleted.map((appointment: any) => (
                              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                                <Card sx={{ height: '100%', border: '2px solid #fff3e0' }}>
                                  <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Avatar sx={{ width: 40, height: 40, mr: 2, backgroundColor: '#ff9800' }}>
                                        {appointment.patientAvatar || appointment.patient.substring(0, 2).toUpperCase()}
                                      </Avatar>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                          {appointment.patient}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {appointment.date} at {appointment.time}
                                        </Typography>
                                      </Box>
                                      <Chip 
                                        label={appointment.status} 
                                        color={appointment.status === 'confirmed' ? 'primary' : appointment.status === 'pending' ? 'warning' : 'error'} 
                                        size="small"
                                      />
                                    </Box>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Doctor: {appointment.doctor}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Type: {appointment.type}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Duration: {appointment.duration || 30} minutes
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))
                          )}
                        </Grid>
                      </Box>
                    ) : (
                      <Box sx={{ p: 6, textAlign: 'center' }}>
                        <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                          {t('loading_appointment_data')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {t('syncing_appointment_data')}
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>
                </>
              )}
            </CardContent>
          </Card>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
            PaperProps={{
              sx: { minWidth: 250, maxHeight: 500 }
            }}
          >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filter Patients
                </Typography>
                {getActiveFilterCount() > 0 && (
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
              {getActiveFilterCount() > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {getActiveFilterCount()} filter(s) active • {filteredPatients.length} patient(s) found
                </Typography>
              )}
            </Box>

            {/* Gender Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Gender
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('gender', '')}
                selected={activeFilters.gender === ''}
                dense
              >
                All Genders
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('gender', 'Male')}
                selected={activeFilters.gender === 'Male'}
                dense
              >
                Male Patients
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('gender', 'Female')}
                selected={activeFilters.gender === 'Female'}
                dense
              >
                Female Patients
              </MenuItem>
            </Box>

            {/* Age Range Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Age Range
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('ageRange', '')}
                selected={activeFilters.ageRange === ''}
                dense
              >
                All Ages
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('ageRange', '18-30')}
                selected={activeFilters.ageRange === '18-30'}
                dense
              >
                18-30 years
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('ageRange', '31-50')}
                selected={activeFilters.ageRange === '31-50'}
                dense
              >
                31-50 years
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('ageRange', '51-65')}
                selected={activeFilters.ageRange === '51-65'}
                dense
              >
                51-65 years
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('ageRange', '65+')}
                selected={activeFilters.ageRange === '65+'}
                dense
              >
                65+ years
              </MenuItem>
            </Box>

            {/* Status Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Status
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('status', '')}
                selected={activeFilters.status === ''}
                dense
              >
                All Statuses
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'old')}
                selected={activeFilters.status === 'old'}
                dense
              >
                Old Patients
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'new')}
                selected={activeFilters.status === 'new'}
                dense
              >
                New Patients
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'follow-up')}
                selected={activeFilters.status === 'follow-up'}
                dense
              >
                                      {t('follow-up')}
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'admitted')}
                selected={activeFilters.status === 'admitted'}
                dense
              >
                                      {t('under observation')}
              </MenuItem>
            </Box>

            {/* Common Conditions Filter */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Common Conditions
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('condition', '')}
                selected={activeFilters.condition === ''}
                dense
              >
                All Conditions
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('condition', 'Diabetes')}
                selected={activeFilters.condition === 'Diabetes'}
                dense
              >
                Diabetes
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('condition', 'Hypertension')}
                selected={activeFilters.condition === 'Hypertension'}
                dense
              >
                Hypertension
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('condition', 'Asthma')}
                selected={activeFilters.condition === 'Asthma'}
                dense
              >
                Asthma
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('condition', 'Routine')}
                selected={activeFilters.condition === 'Routine'}
                dense
              >
                Routine Checkup
              </MenuItem>
            </Box>
          </Menu>

          {/* Patient Profile Dialog */}
          <Dialog
            open={patientProfileOpen}
            onClose={handleClosePatientProfile}
            maxWidth="lg"
            fullWidth
            sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
          >
            {selectedPatient && (
              <>
                <DialogTitle sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          backgroundColor: 'primary.main',
                          fontSize: '1.5rem',
                        }}
                      >
                        {selectedPatient.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {selectedPatient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedPatient.gender}, {selectedPatient.age} years • Patient ID: {selectedPatient.id}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<WhatsApp />}
                        onClick={() => handleWhatsAppMessage(selectedPatient.phone, selectedPatient.name)}
                        sx={{ color: '#25D366', borderColor: '#25D366' }}
                      >
                        WhatsApp
                      </Button>
                      <IconButton onClick={handleClosePatientProfile}>
                        <Close />
                      </IconButton>
                    </Box>
                  </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={profileTab} onChange={handleProfileTabChange}>
                                              <Tab label={t('overview')} icon={<Visibility />} iconPosition="start" />
                      <Tab label={t('medical_history')} icon={<History />} iconPosition="start" />
                                              <Tab label={t('medications')} icon={<LocalPharmacy />} iconPosition="start" />
                                              <Tab label={t('visit_notes')} icon={<NoteAdd />} iconPosition="start" />
                                              <Tab label={t('documents')} icon={<AttachFile />} iconPosition="start" />
                    </Tabs>
                  </Box>

                  {/* Overview Tab */}
                  {profileTab === 0 && (
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Basic Information
                              </Typography>
                              <List sx={{ p: 0 }}>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary={t('phone')} secondary={selectedPatient.phone} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary={t('email')} secondary={selectedPatient.email} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary={t('address')} secondary={selectedPatient.address} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary={t('emergency_contact')} secondary={selectedPatient.emergencyContact} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary={t('blood_type')} secondary={selectedPatient.bloodType} />
                                </ListItem>
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Medical Summary
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Current Condition</Typography>
                                <Typography variant="body1" fontWeight={600}>{translatePatientData(selectedPatient.condition)}</Typography>
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Allergies</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  {selectedPatient.allergies?.map((allergy: string, index: number) => (
                                    <Chip key={index} label={allergy} size="small" color="warning" variant="outlined" />
                                  ))}
                                </Box>
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Last Visit</Typography>
                                <Typography variant="body1" fontWeight={600}>{selectedPatient.lastVisit}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">Next Appointment</Typography>
                                <Typography variant="body1" fontWeight={600} color="primary.main">
                                  {selectedPatient.nextAppointment}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        {selectedPatient.vitalSigns && (
                          <Grid item xs={12}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                  Latest Vital Signs
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.50', borderRadius: 2 }}>
                                      <Typography variant="h6" color="primary.main">
                                        {selectedPatient.vitalSigns[0]?.bp}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Blood Pressure
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.50', borderRadius: 2 }}>
                                      <Typography variant="h6" color="success.main">
                                        {selectedPatient.vitalSigns[0]?.pulse}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Pulse (BPM)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.50', borderRadius: 2 }}>
                                      <Typography variant="h6" color="warning.main">
                                        {selectedPatient.vitalSigns[0]?.weight}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Weight
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'info.50', borderRadius: 2 }}>
                                      <Typography variant="h6" color="info.main">
                                        {selectedPatient.vitalSigns[0]?.height}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Height
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Medical History Tab */}
                  {profileTab === 1 && (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Medical History
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            startIcon={<Add />}
                            onClick={() => {
                              // Set smart default for treatment type based on existing medications
                              const hasExistingMedications = selectedPatient?.medications && selectedPatient.medications.length > 0;
                              setTreatmentType(hasExistingMedications ? 'existing' : 'new');
                              setSelectedMedication('');
                              setNewTreatmentMedication({
                                name: '',
                                dosage: '',
                                frequency: '',
                                duration: ''
                              });
                              setAddMedicalHistoryOpen(true);
                            }}
                          >
                            Add Medical History
                          </Button>
                          <Button 
                            variant="text" 
                            size="small"
                            color="primary"
                            onClick={() => {
                              // Test popup manually
                              setPendingMedication({
                                id: 999,
                                name: 'Test Medication',
                                dosage: '⚠️ Pending',
                                frequency: '⚠️ Pending',
                                duration: '⚠️ Pending'
                              });
                              setMedicationDetailsPopup(true);
                            }}
                          >
                            Test Popup
                          </Button>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          {selectedPatient.medicalHistory?.length > 0 ? (
                            selectedPatient.medicalHistory.map((history: any, index: number) => (
                              <Card key={index} sx={{ mb: 2 }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {history.condition}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        {history.date}
                                      </Typography>
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => {
                                          // Edit medical history functionality can be added here
                                          console.log('Edit medical history:', history);
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Treatment:</strong> {history.treatment}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Doctor:</strong> {history.doctor}
                                  </Typography>
                                  {history.notes && (
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Notes:</strong> {history.notes}
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <Card sx={{ p: 4, textAlign: 'center' }}>
                              <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                No Medical History
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Click "Add Medical History" to record the patient's medical background
                              </Typography>
                            </Card>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Quick Add Medical History
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                  fullWidth
                                  label="Date"
                                  type="date"
                                  value={newMedicalHistory.date}
                                  onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, date: e.target.value })}
                                  InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                  fullWidth
                                  label="Medical Condition"
                                  value={newMedicalHistory.condition}
                                  onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, condition: e.target.value })}
                                  placeholder="e.g., Diabetes Type 2, Hypertension"
                                />
                                <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
                                  Treatment: {treatmentType === 'existing' ? 'Select from medications' : treatmentType === 'new' ? 'Add new medication' : 'Custom treatment'}
                                </Typography>
                                {treatmentType === 'existing' && (
                                  <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Select Medication</InputLabel>
                                    <Select
                                      value={selectedMedication}
                                      onChange={(e) => {
                                        if (e.target.value === '__ADD_NEW__') {
                                          setTreatmentType('new');
                                          setSelectedMedication('');
                                        } else {
                                          setSelectedMedication(e.target.value);
                                        }
                                      }}
                                      label="Select Medication"
                                      size="small"
                                    >
                                      {selectedPatient?.medications?.length > 0 && (
                                        selectedPatient.medications.map((medication: any) => (
                                          <MenuItem key={medication.id} value={medication.name}>
                                            <Box>
                                              <Typography variant="body2">{medication.name}</Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {medication.dosage}, {medication.frequency}
                                              </Typography>
                                            </Box>
                                          </MenuItem>
                                        ))
                                      )}
                                      <MenuItem value="__ADD_NEW__" sx={{ borderTop: '1px solid #e0e0e0', mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                          <Add sx={{ fontSize: 16, mr: 1 }} />
                                          <Typography variant="body2" fontWeight={600}>
                                            Add New...
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                      {selectedPatient?.medications?.length === 0 && (
                                        <MenuItem disabled>
                                          <Typography variant="caption" color="text.secondary">
                                            No medications. Click "Add New..." to create one.
                                          </Typography>
                                        </MenuItem>
                                      )}
                                    </Select>
                                  </FormControl>
                                )}
                                {treatmentType === 'new' && (
                                  <TextField
                                    fullWidth
                                    label="New Medication Name"
                                    value={newTreatmentMedication.name}
                                    onChange={(e) => setNewTreatmentMedication({ ...newTreatmentMedication, name: e.target.value })}
                                    placeholder="e.g., Metformin"
                                    size="small"
                                    sx={{ mb: 2 }}
                                  />
                                )}
                                {treatmentType === 'custom' && (
                                  <TextField
                                    fullWidth
                                    label="Treatment"
                                    value={newMedicalHistory.treatment}
                                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, treatment: e.target.value })}
                                    placeholder="e.g., Surgery, Physical therapy"
                                    size="small"
                                    sx={{ mb: 2 }}
                                  />
                                )}
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    const hasExistingMedications = selectedPatient?.medications && selectedPatient.medications.length > 0;
                                    if (treatmentType === 'existing') {
                                      setTreatmentType('new');
                                    } else if (treatmentType === 'new') {
                                      setTreatmentType('custom');
                                    } else {
                                      setTreatmentType(hasExistingMedications ? 'existing' : 'new');
                                    }
                                  }}
                                  sx={{ mb: 2 }}
                                >
                                  Switch to {treatmentType === 'existing' ? 'New Medication' : treatmentType === 'new' ? 'Custom Treatment' : 'Existing Medication'}
                                </Button>
                                <TextField
                                  fullWidth
                                  label="Doctor"
                                  value={newMedicalHistory.doctor}
                                  onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, doctor: e.target.value })}
                                  size="small"
                                />
                                <TextField
                                  fullWidth
                                  label="Additional Notes"
                                  multiline
                                  rows={2}
                                  value={newMedicalHistory.notes}
                                  onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, notes: e.target.value })}
                                  placeholder="Additional information..."
                                  size="small"
                                />
                                <Button
                                  variant="contained"
                                  startIcon={<Save />}
                                  onClick={handleAddMedicalHistory}
                                  disabled={
                                    !newMedicalHistory.condition.trim() ||
                                    (treatmentType === 'existing' && !selectedMedication) ||
                                    (treatmentType === 'new' && !newTreatmentMedication.name.trim()) ||
                                    (treatmentType === 'custom' && !newMedicalHistory.treatment.trim())
                                  }
                                >
                                  Add to Medical History
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Medications Tab */}
                  {profileTab === 2 && (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Current Medications ({selectedPatient.medications?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="text" 
                            size="small"
                            onClick={() => {
                              // Refresh selected patient data
                              const currentPatient = patients.find(p => p.id === selectedPatient.id);
                              if (currentPatient) {
                                setSelectedPatient(currentPatient);
 
                              }
                            }}
                          >
                            🔄 Refresh
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<Add />}
                            onClick={() => {
                              // Open add medication form
                              setNewMedication({ name: '', dosage: '', frequency: '', duration: '' });
                              // You could open a dialog here or switch to add mode
                            }}
                          >
                            Add Medication
                          </Button>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          {selectedPatient.medications?.length > 0 ? (
                            selectedPatient.medications.map((medication: any, index: number) => (
                              <Card key={index} sx={{ mb: 2 }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {medication.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {medication.dosage} • {medication.frequency}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Prescribed: {medication.dateStarted || medication.prescribed || 'Unknown'}
                                      </Typography>
                                      {medication.duration && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                          Duration: {medication.duration}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleEditMedication(medication, index)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteMedication(index)}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <Card sx={{ p: 4, textAlign: 'center' }}>
                              <LocalPharmacy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                No Medications
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                No medications have been prescribed yet. Add medications via Medical History or use the "Add Medication" button.
                              </Typography>
                            </Card>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Add New Medication
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                  fullWidth
                                  label="Medication Name"
                                  value={newMedication.name}
                                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                                />
                                <TextField
                                  fullWidth
                                  label="Dosage"
                                  value={newMedication.dosage}
                                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                />
                                <TextField
                                  fullWidth
                                  label="Frequency"
                                  value={newMedication.frequency}
                                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                />
                                <TextField
                                  fullWidth
                                  label="Duration"
                                  value={newMedication.duration}
                                  onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                                />
                                <Button
                                  variant="contained"
                                  startIcon={<Save />}
                                  onClick={handleAddMedication}
                                  disabled={!newMedication.name.trim()}
                                >
                                  Add Medication
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Visit Notes Tab */}
                  {profileTab === 3 && (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Visit Notes
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          {selectedPatient.visitNotes?.map((note: any, index: number) => (
                            <Card key={index} sx={{ mb: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {note.date} • {note.doctor}
                                  </Typography>
                                                                     <IconButton 
                                     size="small" 
                                     color="primary"
                                     onClick={() => handleEditNote(note, index)}
                                   >
                                     <Edit fontSize="small" />
                                   </IconButton>
                                </Box>
                                <Typography variant="body1">
                                  {note.note}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Add New Note
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={6}
                                  label="Visit Notes"
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  placeholder="Enter detailed notes about the patient's visit, symptoms, diagnosis, and treatment plan..."
                                />
                                <Button
                                  variant="contained"
                                  startIcon={<Save />}
                                  onClick={handleAddNote}
                                  disabled={!newNote.trim()}
                                >
                                  Save Note
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Documents Tab */}
                  {profileTab === 4 && (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Medical Documents
                        </Typography>
                                                 <Button 
                           variant="outlined" 
                           startIcon={<AttachFile />}
                           onClick={() => setUploadDocumentOpen(true)}
                         >
                           Upload Document
                         </Button>
                      </Box>
                      
                                             <Grid container spacing={2}>
                         {/* Default documents */}
                         <Grid item xs={12} sm={6} md={4}>
                           <Card 
                             sx={{ p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                             onClick={() => alert('Sample document - No file available for preview')}
                           >
                             <MedicalServices sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                             <Typography variant="body2" fontWeight={600}>Lab Results</Typography>
                             <Typography variant="caption" color="text.secondary">Blood Test - Jan 15, 2024</Typography>
                           </Card>
                         </Grid>
                         <Grid item xs={12} sm={6} md={4}>
                           <Card 
                             sx={{ p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                             onClick={() => alert('Sample document - No file available for preview')}
                           >
                             <AssignmentIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                             <Typography variant="body2" fontWeight={600}>X-Ray Report</Typography>
                             <Typography variant="caption" color="text.secondary">Chest X-Ray - Dec 10, 2023</Typography>
                           </Card>
                         </Grid>
                         <Grid item xs={12} sm={6} md={4}>
                           <Card 
                             sx={{ p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                             onClick={() => alert('Sample document - No file available for preview')}
                           >
                             <AttachFile sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                             <Typography variant="body2" fontWeight={600}>Insurance Card</Typography>
                             <Typography variant="caption" color="text.secondary">Egyptian General Insurance</Typography>
                           </Card>
                         </Grid>
                         
                         {/* Uploaded documents */}
                         {selectedPatient.documents?.map((doc: any) => (
                           <Grid item xs={12} sm={6} md={4} key={doc.id}>
                             <Card 
                               sx={{ p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                               onClick={() => handleViewDocument(doc)}
                             >
                               {doc.type === 'image' ? (
                                 <Box sx={{ mb: 2 }}>
                                   <img 
                                     src={doc.fileUrl} 
                                     alt={doc.title}
                                     style={{ 
                                       width: 48, 
                                       height: 48, 
                                       objectFit: 'cover', 
                                       borderRadius: 4,
                                       border: '2px solid #e0e0e0'
                                     }}
                                   />
                                 </Box>
                               ) : doc.type === 'pdf' ? (
                                 <PictureAsPdf sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                               ) : doc.fileType?.includes('text') ? (
                                 <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                               ) : (
                                 <AttachFile sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                               )}
                               <Typography variant="body2" fontWeight={600}>{doc.title}</Typography>
                               <Typography variant="caption" color="text.secondary">
                                 {doc.fileName} • {doc.uploadDate}
                               </Typography>
                             </Card>
                           </Grid>
                         ))}
                       </Grid>
                    </Box>
                  )}
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Enhanced Add Patient Dialog */}
          <Dialog
            open={addPatientOpen}
            onClose={() => {
              setAddPatientOpen(false);
              // Reset form when closing
              setNewPatientData({
                name: '',
                phone: '',
                email: '',
                age: '',
                gender: '',
                address: '',
                emergencyContact: '',
                bloodType: '',
                condition: '',
                status: 'new'
              });
            }}
            maxWidth="lg"
            fullWidth
            sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              ➕ Add New Patient
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Basic Information Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Chip 
                      label="👤 Basic Information" 
                      sx={{ 
                        fontWeight: 600, 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        '& .MuiChip-label': { px: 3 }
                      }} 
                    />
                  </Divider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Full Name *" 
                    value={newPatientData.name}
                    onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                    required
                    error={!newPatientData.name.trim()}
                    helperText={!newPatientData.name.trim() ? "Name is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Phone Number *" 
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    required
                    error={!newPatientData.phone.trim()}
                    helperText={!newPatientData.phone.trim() ? "Phone number is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    placeholder="patient@example.com"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Age" 
                    type="number" 
                    value={newPatientData.age}
                    onChange={(e) => setNewPatientData({ ...newPatientData, age: e.target.value })}
                    inputProps={{ min: 0, max: 150 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select 
                      label="Gender"
                      value={newPatientData.gender}
                      onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(option.key)}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">{t('other')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Blood Type" 
                    value={newPatientData.bloodType}
                    onChange={(e) => setNewPatientData({ ...newPatientData, bloodType: e.target.value })}
                    placeholder="e.g., A+, B-, O+, AB-"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Address" 
                    multiline 
                    rows={2}
                    value={newPatientData.address}
                    onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                    placeholder="Patient's full address..."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Emergency Contact" 
                    value={newPatientData.emergencyContact}
                    onChange={(e) => setNewPatientData({ ...newPatientData, emergencyContact: e.target.value })}
                    placeholder="Name and phone number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Initial Condition" 
                    value={newPatientData.condition}
                    onChange={(e) => setNewPatientData({ ...newPatientData, condition: e.target.value })}
                    placeholder="e.g., Routine checkup, Follow-up visit"
                  />
                </Grid>


              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
              <Button 
                onClick={() => {
                  setAddPatientOpen(false);
                  // Reset form when canceling
                  setNewPatientData(defaultNewPatientData);
                }}
                sx={{ borderRadius: 3 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddNewPatient}
                disabled={!newPatientData.name.trim() || !newPatientData.phone.trim()}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Add Patient
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Patient Dialog */}
          <Dialog
            open={editPatientOpen}
            onClose={() => setEditPatientOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Full Name" 
                    value={editingPatient?.name || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Phone Number" 
                    value={editingPatient?.phone || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    value={editingPatient?.email || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Age" 
                    type="number" 
                    value={editingPatient?.age || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, age: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select 
                      label="Gender"
                      value={editingPatient?.gender || ''}
                      onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(option.key)}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">{t('other')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Blood Type" 
                    value={editingPatient?.bloodType || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bloodType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Address" 
                    multiline 
                    rows={2} 
                    value={editingPatient?.address || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Emergency Contact" 
                    value={editingPatient?.emergencyContact || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, emergencyContact: e.target.value })}
                  />
                </Grid>
                

                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Current Condition" 
                    value={editingPatient?.condition || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, condition: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status"
                      value={editingPatient?.status || ''}
                      onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value })}
                    >
                      <MenuItem value="new">{t('new')}</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="follow-up">{t('follow-up')}</MenuItem>
                                              <MenuItem value="admitted">{t('under observation')}</MenuItem>
                        <MenuItem value="transferred">{t('transferred')}</MenuItem>
                        <MenuItem value="discharged">{t('discharged')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditPatientOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSavePatientEdit}>
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Medication Dialog */}
          <Dialog
            open={editMedicationOpen}
            onClose={() => setEditMedicationOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Medication Name" 
                    value={editingMedication?.name || ''}
                    onChange={(e) => setEditingMedication({ ...editingMedication, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Dosage" 
                    value={editingMedication?.dosage || ''}
                    onChange={(e) => setEditingMedication({ ...editingMedication, dosage: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Frequency" 
                    value={editingMedication?.frequency || ''}
                    onChange={(e) => setEditingMedication({ ...editingMedication, frequency: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Duration" 
                    value={editingMedication?.duration || ''}
                    onChange={(e) => setEditingMedication({ ...editingMedication, duration: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditMedicationOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveMedicationEdit}>
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Note Dialog */}
          <Dialog
            open={editNoteOpen}
            onClose={() => setEditNoteOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Edit Visit Note</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Date" 
                    type="date"
                    value={editingNote?.date || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Doctor" 
                    value={editingNote?.doctor || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, doctor: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Visit Notes" 
                    multiline 
                    rows={6} 
                    value={editingNote?.note || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                    placeholder="Enter detailed notes about the patient's visit, symptoms, diagnosis, and treatment plan..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditNoteOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveNoteEdit}>
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Upload Document Dialog */}
          <Dialog
            open={uploadDocumentOpen}
            onClose={() => setUploadDocumentOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Upload Document</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Document Title" 
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g., Lab Report, X-Ray, Prescription"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    border: '2px dashed #ccc', 
                    borderRadius: 2, 
                    p: 3, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}>
                    <input
                      type="file"
                      hidden
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                      <AttachFile sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body1">
                        {selectedFile ? selectedFile.name : 'Click to upload file'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supports PDF, Images, Word documents
                      </Typography>
                    </label>
                  </Box>
                </Grid>
                {selectedFile && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>File:</strong> {selectedFile.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {selectedFile.type}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setUploadDocumentOpen(false);
                setSelectedFile(null);
                setDocumentTitle('');
              }}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUploadDocument}
                disabled={!selectedFile || !documentTitle.trim()}
              >
                Upload Document
              </Button>
            </DialogActions>
          </Dialog>

          {/* Document Viewer Dialog */}
          <Dialog
            open={documentViewerOpen}
            onClose={handleCloseDocumentViewer}
            maxWidth="lg"
            fullWidth
            sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
          >
            {viewingDocument && (
              <>
                <DialogTitle sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {viewingDocument.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {viewingDocument.fileName} • {viewingDocument.uploadDate} • {(viewingDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AttachFile />}
                        onClick={() => {
                          // Create download link
                          const link = document.createElement('a');
                          link.href = viewingDocument.fileUrl;
                          link.download = viewingDocument.fileName;
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                      <IconButton onClick={handleCloseDocumentViewer}>
                        <Close />
                      </IconButton>
                    </Box>
                  </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3, overflow: 'hidden' }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2
                  }}>
                    {viewingDocument.type === 'image' ? (
                      // Image Preview
                      <img
                        src={viewingDocument.fileUrl}
                        alt={viewingDocument.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 8
                        }}
                      />
                    ) : viewingDocument.type === 'pdf' ? (
                      // PDF Preview
                      <Box sx={{ width: '100%', height: '100%' }}>
                        <iframe
                          src={viewingDocument.fileUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 'none', borderRadius: 8 }}
                          title={viewingDocument.title}
                        />
                      </Box>
                    ) : viewingDocument.fileType?.includes('text') ? (
                      // Text file preview
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        p: 3, 
                        backgroundColor: 'white',
                        borderRadius: 2,
                        overflow: 'auto'
                      }}>
                        <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                          {/* Text content would be loaded here */}
                          Loading text content...
                        </Typography>
                      </Box>
                    ) : (
                      // Unsupported file type
                      <Box sx={{ textAlign: 'center', p: 4 }}>
                        <AttachFile sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Preview not available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          This file type cannot be previewed in the browser.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AttachFile />}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = viewingDocument.fileUrl;
                            link.download = viewingDocument.fileName;
                            link.click();
                          }}
                        >
                          Download to View
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* Document Information */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Document Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          File Name
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {viewingDocument.fileName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          File Size
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {(viewingDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Upload Date
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {viewingDocument.uploadDate}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          File Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {viewingDocument.fileType || 'Unknown'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Add Medical History Dialog */}
          <Dialog
            open={addMedicalHistoryOpen}
            onClose={() => setAddMedicalHistoryOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Add Medical History Entry</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Date of Diagnosis/Treatment" 
                    type="date"
                    value={newMedicalHistory.date}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Attending Doctor" 
                    value={newMedicalHistory.doctor}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, doctor: e.target.value })}
                    placeholder=""
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Medical Condition" 
                    value={newMedicalHistory.condition}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, condition: e.target.value })}
                    placeholder="e.g., Diabetes Type 2, Hypertension, Asthma, Heart Disease"
                    helperText="Enter the diagnosed medical condition"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Treatment/Medication
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                      <RadioGroup
                        value={treatmentType}
                        onChange={(e) => setTreatmentType(e.target.value as 'existing' | 'new' | 'custom')}
                        row
                      >
                        <FormControlLabel 
                          value="existing" 
                          control={<Radio />} 
                          label="Select from existing medications" 
                        />
                        <FormControlLabel 
                          value="new" 
                          control={<Radio />} 
                          label="Add new medication" 
                        />
                        <FormControlLabel 
                          value="custom" 
                          control={<Radio />} 
                          label="Custom treatment" 
                        />
                      </RadioGroup>
                    </FormControl>

                    {treatmentType === 'existing' && (
                      <Box>
                        <FormControl fullWidth>
                          <InputLabel>Select Medication</InputLabel>
                          <Select
                            value={selectedMedication}
                            onChange={(e) => {
                              if (e.target.value === '__ADD_NEW__') {
                                setTreatmentType('new');
                                setSelectedMedication('');
                              } else {
                                setSelectedMedication(e.target.value);
                              }
                            }}
                            label="Select Medication"
                          >
                            {selectedPatient?.medications?.length > 0 && (
                              selectedPatient.medications.map((medication: any) => (
                                <MenuItem key={medication.id} value={medication.name}>
                                  <Box>
                                    <Typography variant="body2">{medication.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {medication.dosage}, {medication.frequency}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))
                            )}
                            <MenuItem value="__ADD_NEW__" sx={{ borderTop: '1px solid #e0e0e0', mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                <Add sx={{ fontSize: 18, mr: 1 }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Add New Medication...
                                </Typography>
                              </Box>
                            </MenuItem>
                            {selectedPatient?.medications?.length === 0 && (
                              <MenuItem disabled>
                                <Typography variant="caption" color="text.secondary">
                                  No medications found. Click "Add New Medication..." to create one.
                                </Typography>
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                    )}

                    {treatmentType === 'new' && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField 
                            fullWidth 
                            label="Medication Name *" 
                            value={newTreatmentMedication.name}
                            onChange={(e) => setNewTreatmentMedication({ ...newTreatmentMedication, name: e.target.value })}
                            placeholder="e.g., Metformin, Aspirin, Insulin"
                            helperText="Required: Enter the medication name"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField 
                            fullWidth 
                            label="Dosage (Optional)" 
                            value={newTreatmentMedication.dosage}
                            onChange={(e) => setNewTreatmentMedication({ ...newTreatmentMedication, dosage: e.target.value })}
                            placeholder="e.g., 500mg, 10ml"
                            helperText="Can be completed later"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField 
                            fullWidth 
                            label="Frequency (Optional)" 
                            value={newTreatmentMedication.frequency}
                            onChange={(e) => setNewTreatmentMedication({ ...newTreatmentMedication, frequency: e.target.value })}
                            placeholder="e.g., Twice daily, Once daily"
                            helperText="Can be completed later"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField 
                            fullWidth 
                            label="Duration (Optional)" 
                            value={newTreatmentMedication.duration}
                            onChange={(e) => setNewTreatmentMedication({ ...newTreatmentMedication, duration: e.target.value })}
                            placeholder="e.g., 30 days, 3 months"
                            helperText="Can be completed later"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Alert severity="success" sx={{ mt: 1 }}>
                            <strong>Quick Add Mode:</strong> Just enter the medication name and submit. 
                            You'll get a popup to complete the dosage and frequency details afterward.
                          </Alert>
                        </Grid>
                      </Grid>
                    )}

                    {treatmentType === 'custom' && (
                      <TextField 
                        fullWidth 
                        label="Custom Treatment" 
                        value={newMedicalHistory.treatment}
                        onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, treatment: e.target.value })}
                        placeholder="e.g., Lifestyle changes, Surgery, Physical therapy"
                        helperText="Describe non-medication treatments, procedures, or interventions"
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Additional Notes" 
                    multiline 
                    rows={4}
                    value={newMedicalHistory.notes}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, notes: e.target.value })}
                    placeholder="Additional information about the condition, treatment response, complications, follow-up requirements, etc."
                    helperText="Optional: Add any relevant additional information"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Important:</strong> This medical history will be permanently added to the patient's record. 
                      Please ensure all information is accurate and complete.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setAddMedicalHistoryOpen(false);
                setNewMedicalHistory({
                  date: new Date().toISOString().split('T')[0],
                  condition: '',
                  treatment: '',
                  doctor: '',
                  notes: ''
                });
              }}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddMedicalHistory}
                disabled={
                  !newMedicalHistory.condition.trim() ||
                  (treatmentType === 'existing' && !selectedMedication) ||
                  (treatmentType === 'new' && !newTreatmentMedication.name.trim()) ||
                  (treatmentType === 'custom' && !newMedicalHistory.treatment.trim())
                }
                startIcon={<Save />}
              >
                Add to Medical History
              </Button>
            </DialogActions>
          </Dialog>

          {/* Complete Medication Details Popup */}
          <Dialog
            open={medicationDetailsPopup}
            onClose={handleSkipMedicationDetails}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Complete Medication Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pendingMedication?.name} has been added to medical history. Please complete the medication details.
                  </Typography>
                </Box>
                <IconButton onClick={handleSkipMedicationDetails}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  This medication has been automatically added to the patient's medications list. 
                  Complete the details below for proper dosing and tracking.
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medication Name"
                      value={pendingMedication?.name || ''}
                      disabled
                      sx={{ backgroundColor: '#f5f5f5' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Dosage *"
                      placeholder="e.g., 500mg, 10ml, 1 tablet"
                      defaultValue=""
                      id="dosage-input"
                      helperText="Enter the strength/amount per dose"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Frequency *"
                      placeholder="e.g., Twice daily, Every 8 hours"
                      defaultValue=""
                      id="frequency-input"
                      helperText="How often should it be taken"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Duration"
                      placeholder="e.g., 30 days, 3 months"
                      defaultValue=""
                      id="duration-input"
                      helperText="How long to continue (optional)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      multiline
                      rows={3}
                      placeholder="Special instructions, side effects to watch for, timing with meals, etc."
                      defaultValue=""
                      id="notes-input"
                      helperText="Optional: Any special instructions or notes"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={handleSkipMedicationDetails}
                color="inherit"
              >
                Skip for Now
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => {
                  const dosageInput = document.getElementById('dosage-input') as HTMLInputElement;
                  const frequencyInput = document.getElementById('frequency-input') as HTMLInputElement;
                  const durationInput = document.getElementById('duration-input') as HTMLInputElement;
                  const notesInput = document.getElementById('notes-input') as HTMLInputElement;
                  
                  if (!dosageInput?.value.trim() || !frequencyInput?.value.trim()) {
                    alert('Please enter at least the dosage and frequency');
                    return;
                  }
                  
                  const medicationDetails = {
                    dosage: dosageInput.value.trim(),
                    frequency: frequencyInput.value.trim(),
                    duration: durationInput.value.trim() || 'As needed',
                    notes: notesInput.value.trim()
                  };
                  
                  handleCompleteMedicationDetails(medicationDetails);
                }}
              >
                Complete Medication Details
              </Button>
                         </DialogActions>
           </Dialog>

          {/* Schedule Appointment Dialog */}
          <Dialog
            open={scheduleAppointmentOpen}
            onClose={() => setScheduleAppointmentOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Schedule Appointment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointmentPatient?.name} • {appointmentPatient?.phone}
                  </Typography>
                </Box>
                <IconButton onClick={() => setScheduleAppointmentOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Appointment Date"
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    helperText="Select appointment date"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Appointment Time"
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    helperText="Select appointment time"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Appointment Type</InputLabel>
                    <Select
                      value={appointmentData.type}
                      onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value })}
                      label="Appointment Type"
                    >
                      <MenuItem value="Follow-up">Follow-up</MenuItem>
                      <MenuItem value="Consultation">Initial Consultation</MenuItem>
                      <MenuItem value="Check-up">Regular Check-up</MenuItem>
                      <MenuItem value="Emergency">Emergency</MenuItem>
                      <MenuItem value="Lab Review">Lab Results Review</MenuItem>
                      <MenuItem value="Procedure">Medical Procedure</MenuItem>
                      <MenuItem value="Vaccination">Vaccination</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Duration (minutes)</InputLabel>
                    <Select
                      value={appointmentData.duration}
                      onChange={(e) => setAppointmentData({ ...appointmentData, duration: e.target.value })}
                      label="Duration (minutes)"
                    >
                      <MenuItem value="15">15 minutes</MenuItem>
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="45">45 minutes</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                      <MenuItem value="90">1.5 hours</MenuItem>
                      <MenuItem value="120">2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={appointmentData.priority}
                      onChange={(e) => setAppointmentData({ ...appointmentData, priority: e.target.value })}
                      label="Priority"
                    >
                      <MenuItem value="Low">Low Priority</MenuItem>
                      <MenuItem value="Normal">Normal Priority</MenuItem>
                      <MenuItem value="High">High Priority</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2 }}>
                    <CalendarToday color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Current appointment: {appointmentPatient?.nextAppointment || 'Not scheduled'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Appointment Notes"
                    multiline
                    rows={3}
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                    placeholder="Reason for visit, special instructions, or additional notes..."
                    helperText="Optional: Add any relevant notes for the appointment"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Appointment Summary:</strong> {appointmentData.type} appointment for {appointmentData.duration} minutes
                      {appointmentData.date && appointmentData.time && (
                        <span> scheduled on {new Date(`${appointmentData.date}T${appointmentData.time}`).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      )}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={() => setScheduleAppointmentOpen(false)}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<CalendarToday />}
                onClick={handleSaveAppointment}
                disabled={!appointmentData.date || !appointmentData.time}
              >
                Schedule Appointment
              </Button>
                         </DialogActions>
           </Dialog>

          {/* Edit Last Visit Dialog */}
          <Dialog
            open={editLastVisitOpen}
            onClose={() => setEditLastVisitOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Edit Last Visit Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editLastVisitPatient?.name}
                  </Typography>
                </Box>
                <IconButton onClick={() => setEditLastVisitOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Select the date of the patient's last visit. You can choose any past date up to today.
                  </Typography>
                </Alert>
                
                <TextField
                  fullWidth
                  label="Last Visit Date"
                  type="date"
                  value={newLastVisitDate}
                  onChange={(e) => setNewLastVisitDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ 
                    max: new Date().toISOString().split('T')[0] // Prevent future dates
                  }}
                  helperText="Select the date when the patient last visited the clinic"
                />
                
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Current Last Visit:</strong> {editLastVisitPatient?.lastVisit || 'Not set'}
                  </Typography>
                  {newLastVisitDate && (
                    <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                      <strong>New Last Visit:</strong> {new Date(newLastVisitDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={() => setEditLastVisitOpen(false)}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveLastVisit}
                disabled={!newLastVisitDate}
              >
                Save Last Visit Date
              </Button>
            </DialogActions>
          </Dialog>

          {/* Quick Status Edit Menu */}
          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={() => {
              setStatusMenuAnchor(null);
              setStatusEditPatient(null);
            }}
            PaperProps={{
              sx: { minWidth: 200 }
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Change Status
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {statusEditPatient?.name}
              </Typography>
            </Box>
            
            <MenuItem 
              onClick={() => handleStatusChange('new')}
              selected={statusEditPatient?.status === 'new'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="New" 
                  color="info" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">New Patient</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('old')}
              selected={statusEditPatient?.status === 'old'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Old" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Old Patient</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('follow-up')}
              selected={statusEditPatient?.status === 'follow-up'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Follow-up" 
                  color="warning" 
                  size="small" 
                  variant="outlined" 
                />
                                      <Typography variant="body2">{t('follow-up')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('admitted')}
              selected={statusEditPatient?.status === 'admitted'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                                      label={t('under observation')} 
                  color="secondary" 
                  size="small" 
                  variant="outlined" 
                />
                                      <Typography variant="body2">{t('under observation')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('transferred')}
              selected={statusEditPatient?.status === 'transferred'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                                      label={t('transferred')} 
                  color="secondary" 
                  size="small" 
                  variant="outlined" 
                />
                                      <Typography variant="body2">{t('transferred')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('discharged')}
              selected={statusEditPatient?.status === 'discharged'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                                      label={t('discharged')} 
                  color="default" 
                  size="small" 
                  variant="outlined" 
                />
                                      <Typography variant="body2">{t('discharged')}</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Container>
  );
};

export default PatientListPage;

// Export the initialPatients for backwards compatibility
export { initialPatients } from '../../data/mockData'; 