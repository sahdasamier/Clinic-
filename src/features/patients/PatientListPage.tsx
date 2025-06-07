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
} from '@mui/material';
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
  Chat,
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
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const initialPatients = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    age: 45,
    gender: 'Male',
    phone: '+971 50 123 4567',
    email: 'ahmed.rashid@email.com',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-01-25',
    condition: 'Diabetes',
    status: 'active',
    avatar: 'AR',
    address: 'Dubai, UAE',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Shellfish'],
    emergencyContact: 'Sara Al-Rashid (+971 50 987 6543)',
    medicalHistory: [
      { date: '2024-01-15', condition: 'Diabetes Type 2', treatment: 'Metformin 500mg twice daily', doctor: 'Dr. Ahmed Ali' },
      { date: '2023-12-10', condition: 'Hypertension', treatment: 'Lisinopril 10mg daily', doctor: 'Dr. Ahmed Ali' },
    ],
    medications: [
      { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '3 months', status: 'Active', prescribedBy: 'Dr. Ahmed Ali', dateStarted: '2024-01-15' },
      { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', status: 'Active', prescribedBy: 'Dr. Ahmed Ali', dateStarted: '2023-12-10' },
    ],
    visitNotes: [
      { date: '2024-01-15', note: 'Patient reports good glucose control. HbA1c improved to 7.2%. Continue current medication.', doctor: 'Dr. Ahmed Ali' },
      { date: '2023-12-10', note: 'Blood pressure elevated. Started on ACE inhibitor. Follow up in 6 weeks.', doctor: 'Dr. Ahmed Ali' },
    ],
    vitalSigns: [
      { date: '2024-01-15', bp: '130/85', pulse: '72', weight: '78kg', height: '175cm' },
    ],
    documents: [],
  },
  {
    id: 2,
    name: 'Fatima Hassan',
    age: 32,
    gender: 'Female',
    phone: '+971 50 234 5678',
    email: 'fatima.hassan@email.com',
    lastVisit: '2024-01-12',
    nextAppointment: '2024-01-22',
    condition: 'Hypertension',
    status: 'active',
    avatar: 'FH',
    address: 'Abu Dhabi, UAE',
    bloodType: 'O+',
    allergies: ['Aspirin'],
    emergencyContact: 'Hassan Ali (+971 50 876 5432)',
    medicalHistory: [
      { date: '2024-01-12', condition: 'Hypertension', treatment: 'Amlodipine 5mg daily', doctor: 'Dr. Ahmed Ali' },
      { date: '2023-11-15', condition: 'Migraine', treatment: 'Sumatriptan as needed', doctor: 'Dr. Ahmed Ali' },
    ],
    medications: [
      { id: 1, name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', status: 'Active', prescribedBy: 'Dr. Ahmed Ali', dateStarted: '2024-01-12' },
    ],
    visitNotes: [
      { date: '2024-01-12', note: 'Blood pressure well controlled. Patient reports no side effects. Continue current medication. Follow up in 3 months.', doctor: 'Dr. Ahmed Ali' },
      { date: '2023-11-15', note: 'Patient presented with severe headache. Diagnosed with migraine. Prescribed sumatriptan for acute episodes.', doctor: 'Dr. Ahmed Ali' },
    ],
    vitalSigns: [
      { date: '2024-01-12', bp: '125/80', pulse: '68', weight: '65kg', height: '162cm' },
    ],
    documents: [],
  },
  {
    id: 3,
    name: 'Mohammed Ali',
    age: 28,
    gender: 'Male',
    phone: '+971 50 345 6789',
    email: 'mohammed.ali@email.com',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-20',
    condition: 'Asthma',
    status: 'follow-up',
    avatar: 'MA',
    address: 'Sharjah, UAE',
    bloodType: 'B+',
    allergies: [],
    emergencyContact: 'Ali Hassan (+971 50 765 4321)',
    medicalHistory: [],
    medications: [],
    visitNotes: [],
    vitalSigns: [],
    documents: [],
  },
  {
    id: 4,
    name: 'Sara Ahmed',
    age: 38,
    gender: 'Female',
    phone: '+971 50 456 7890',
    email: 'sara.ahmed@email.com',
    lastVisit: '2024-01-08',
    nextAppointment: '2024-01-18',
    condition: 'Routine Checkup',
    status: 'new',
    avatar: 'SA',
    address: 'Ajman, UAE',
    bloodType: 'AB+',
    allergies: [],
    emergencyContact: 'Ahmed Sara (+971 50 654 3210)',
    medicalHistory: [],
    medications: [],
    visitNotes: [],
    vitalSigns: [],
    documents: [],
  },
];



const PatientListPage: React.FC = () => {
  const { t } = useTranslation();
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
  const [patients, setPatients] = useState(initialPatients);
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  const [addMedicalHistoryOpen, setAddMedicalHistoryOpen] = useState(false);
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    date: new Date().toISOString().split('T')[0],
    condition: '',
    treatment: '',
    doctor: 'Dr. Ahmed Ali',
    notes: ''
  });
  const [treatmentType, setTreatmentType] = useState<'existing' | 'new' | 'custom'>('existing');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [newTreatmentMedication, setNewTreatmentMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });
  const [medicationDetailsPopup, setMedicationDetailsPopup] = useState(false);
  const [pendingMedication, setPendingMedication] = useState<any>(null);
  const [scheduleAppointmentOpen, setScheduleAppointmentOpen] = useState(false);
  const [appointmentPatient, setAppointmentPatient] = useState<any>(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    type: 'Follow-up',
    duration: '30',
    notes: '',
    priority: 'Normal'
  });
  const [statusEditPatient, setStatusEditPatient] = useState<any>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

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
    setNewMedication({ name: '', dosage: '', frequency: '', duration: '' });
  };

  const handleProfileTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setProfileTab(newValue);
  };

  const handleAddNote = () => {
    if (newNote.trim() && selectedPatient) {
      const newVisitNote = {
        date: new Date().toISOString().split('T')[0],
        note: newNote,
        doctor: 'Dr. Ahmed Ali'
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
      
      setPatients(updatedPatients);
      setNewMedication({ name: '', dosage: '', frequency: '', duration: '' });
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
            prescribed: editingMedication.prescribed
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
      
      setPatients(updatedPatients);
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

      setPatients(updatedPatients);
      setUploadDocumentOpen(false);
      setSelectedFile(null);
      setDocumentTitle('');
    }
  };

  const handleAddNewPatient = (newPatientData: any) => {
    const newPatient = {
      ...newPatientData,
      id: Math.max(...patients.map(p => p.id)) + 1,
      avatar: newPatientData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      status: 'new',
      lastVisit: 'N/A',
      nextAppointment: 'Not scheduled',
      condition: newPatientData.condition || 'Initial consultation',
      visitNotes: [],
      medications: [],
      medicalHistory: [],
      vitalSigns: [],
      documents: [],
      allergies: []
    };

    setPatients([...patients, newPatient]);
    setAddPatientOpen(false);
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

    // Update patient's next appointment
    const appointmentDateTime = `${appointmentData.date} ${appointmentData.time}`;
    const appointmentDisplay = new Date(`${appointmentData.date}T${appointmentData.time}`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedPatients = patients.map(patient => 
      patient.id === appointmentPatient.id 
        ? { 
            ...patient, 
            nextAppointment: appointmentDisplay,
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
        nextAppointment: appointmentDisplay,
        appointmentDetails: {
          ...appointmentData,
          dateTime: appointmentDateTime,
          scheduledOn: new Date().toISOString()
        }
      });
    }

    setScheduleAppointmentOpen(false);
    setAppointmentPatient(null);
    alert(`Appointment scheduled for ${appointmentPatient.name} on ${appointmentDisplay}`);
  };

  const handleQuickStatusEdit = (patient: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setStatusEditPatient(patient);
    setStatusMenuAnchor(event.currentTarget);
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
      const medication = selectedPatient?.medications?.find(m => m.name === selectedMedication);
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
        prescribedBy: 'Dr. Ahmed Ali',
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
      doctor: 'Dr. Ahmed Ali',
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
      case 'active':
        return 'success';
      case 'follow-up':
        return 'warning';
      case 'new':
        return 'info';
      case 'inactive':
        return 'default';
      case 'transferred':
        return 'secondary';
      case 'discharged':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredPatients = patients.filter(patient => {
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

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {t('patients')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage and track all patient information
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<WhatsApp />}
                  sx={{ borderRadius: 3, color: '#25D366', borderColor: '#25D366' }}
                >
                  WhatsApp All
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setAddPatientOpen(true)}
                  sx={{ borderRadius: 3 }}
                >
                  Add New Patient
                </Button>
              </Box>
            </Box>
          </Box>



          {/* Main Content */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Search and Filters */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Search patients by name, email, phone, or condition..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    
                    {/* Active Filters Display */}
                    {getActiveFilterCount() > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {searchQuery && (
                          <Chip
                            label={`Search: "${searchQuery}"`}
                            size="small"
                            onDelete={() => setSearchQuery('')}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {activeFilters.gender && (
                          <Chip
                            label={`Gender: ${activeFilters.gender}`}
                            size="small"
                            onDelete={() => handleFilterSelect('gender', '')}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {activeFilters.ageRange && (
                          <Chip
                            label={`Age: ${activeFilters.ageRange}`}
                            size="small"
                            onDelete={() => handleFilterSelect('ageRange', '')}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {activeFilters.status && (
                          <Chip
                            label={`Status: ${activeFilters.status}`}
                            size="small"
                            onDelete={() => handleFilterSelect('status', '')}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {activeFilters.condition && (
                          <Chip
                            label={`Condition: ${activeFilters.condition}`}
                            size="small"
                            onDelete={() => handleFilterSelect('condition', '')}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={(e) => setFilterAnchor(e.currentTarget)}
                        sx={{ 
                          position: 'relative',
                          ...(getActiveFilterCount() > 0 && {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark'
                            }
                          })
                        }}
                      >
                        Filter
                        {getActiveFilterCount() > 0 && (
                          <Chip
                            label={getActiveFilterCount()}
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              backgroundColor: 'white',
                              color: 'primary.main',
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('table')}
                      >
                        Table
                      </Button>
                      <Button
                        variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('cards')}
                      >
                        Cards
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Results Summary */}
              {(getActiveFilterCount() > 0 || searchQuery) && (
                <Box sx={{ px: 3, py: 2, backgroundColor: '#f8f9fa', borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredPatients.length} of {patients.length} patients
                    {getActiveFilterCount() > 0 && ` with ${getActiveFilterCount()} filter(s) applied`}
                  </Typography>
                </Box>
              )}

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label={`All Patients (${filteredPatients.length})`} />
                  <Tab label={`Active (${filteredPatients.filter(p => p.status === 'active').length})`} />
                  <Tab label={`New (${filteredPatients.filter(p => p.status === 'new').length})`} />
                  <Tab label={`Follow-up (${filteredPatients.filter(p => p.status === 'follow-up').length})`} />
                </Tabs>
              </Box>

              {/* Patient List - Table View */}
              {viewMode === 'table' && (
                <TabPanel value={tabValue} index={0}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Last Visit</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Next Appointment</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                              <Typography variant="body2">{patient.condition}</Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Click to change status" arrow>
                                <Chip
                                  label={patient.status}
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
              )}

              {/* Patient List - Cards View */}
              {viewMode === 'cards' && (
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
                                  label={patient.status}
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
                                Condition: {patient.condition}
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
                onClick={() => handleFilterSelect('status', 'active')}
                selected={activeFilters.status === 'active'}
                dense
              >
                Active Patients
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
                Follow-up Required
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
                      <Tab label="Overview" icon={<Visibility />} iconPosition="start" />
                      <Tab label="Medical History" icon={<History />} iconPosition="start" />
                      <Tab label="Medications" icon={<LocalPharmacy />} iconPosition="start" />
                      <Tab label="Visit Notes" icon={<NoteAdd />} iconPosition="start" />
                      <Tab label="Documents" icon={<AttachFile />} iconPosition="start" />
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
                                  <ListItemText primary="Phone" secondary={selectedPatient.phone} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary="Email" secondary={selectedPatient.email} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary="Address" secondary={selectedPatient.address} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary="Emergency Contact" secondary={selectedPatient.emergencyContact} />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemText primary="Blood Type" secondary={selectedPatient.bloodType} />
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
                                <Typography variant="body1" fontWeight={600}>{selectedPatient.condition}</Typography>
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
                                            {medication.name} - {medication.dosage}
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
                             <Typography variant="caption" color="text.secondary">Dubai Health Insurance</Typography>
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

          {/* Add Patient Dialog */}
          <Dialog
            open={addPatientOpen}
            onClose={() => setAddPatientOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Full Name" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone Number" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Age" type="number" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select label="Gender">
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Emergency Contact" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Medical History" multiline rows={3} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddPatientOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  // Get form data (you would normally get this from form state)
                  const formData = {
                    name: 'New Patient', // This should come from form
                    phone: '+971 50 XXX XXXX',
                    email: 'patient@email.com',
                    age: 30,
                    gender: 'Male',
                    address: 'Dubai, UAE',
                    emergencyContact: 'Emergency Contact',
                    bloodType: 'O+',
                    condition: 'Initial consultation'
                  };
                  handleAddNewPatient(formData);
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
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
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
                      <MenuItem value="new">New Patient</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="follow-up">Follow-up Required</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="transferred">Transferred</MenuItem>
                      <MenuItem value="discharged">Discharged</MenuItem>
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
                    placeholder="Dr. Ahmed Ali"
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
                  doctor: 'Dr. Ahmed Ali',
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
              onClick={() => handleStatusChange('active')}
              selected={statusEditPatient?.status === 'active'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Active" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Active Patient</Typography>
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
                <Typography variant="body2">Follow-up Required</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('inactive')}
              selected={statusEditPatient?.status === 'inactive'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Inactive" 
                  color="default" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Inactive Patient</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('transferred')}
              selected={statusEditPatient?.status === 'transferred'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Transferred" 
                  color="secondary" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Transferred</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('discharged')}
              selected={statusEditPatient?.status === 'discharged'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Discharged" 
                  color="default" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Discharged</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Container>
      </Box>
    </Box>
  );
};

export default PatientListPage; 