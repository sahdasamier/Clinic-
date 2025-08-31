import React, { useState, useContext, useEffect } from 'react';
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
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { getOptimizedFirestore } from '@lib/firebase/legacy-compat';
import { useAuth } from '@store/auth';
import { useUser } from '@store/auth';
import EnhancedMedicalConditionSelector from '../components/EnhancedMedicalConditionSelector';
import EnhancedMedicationSelector from '@components/EnhancedMedicationSelector';
import EnhancedMedicalRequirementSelector from '../components/EnhancedMedicalRequirementSelector';
// PDF generation temporarily disabled - jspdf dependency removed
import MedicalRequirementsService from '@/services/MedicalRequirementsService';

// ✅ NEW: Use the new real-time data hooks instead of legacy systems
import {
  useGlobalData,
  usePatients,
  useAppointments,
  useRealtimeUpdates,
  useDashboardStats
} from '@hooks/useGlobalData';

// DoctorPatientAssignment component removed - functionality integrated directly
import { usePatientsGuard } from '@hooks/usePatientGuard';
import AvailableTimeSlotsSelector from '@features/appointments/components/AvailableTimeSlotsSelector';
import { getPatientsByDoctor } from '@lib/api/doctorPatients';
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
  Refresh,
  Science,
  LocalHospital,
  Bloodtype,
  CloudUpload,
  InsertDriveFile,
  Download,
} from '@mui/icons-material';



import { 
  PatientService,
  AppointmentService,
  PaymentService,
  ServiceUtils,
  type Patient,
  type Appointment
} from '@/services';
import { globalDataSync } from '@utils/globalDataSync';
// AutoSyncIndicator component removed - sync functionality integrated directly
import { calculateAllPatientsAppointmentFields } from '@utils/patientAppointmentCalculator';

import FirebaseFriendlySync, { FirebaseDataBridge } from '@utils/firebaseFriendlySync';
// Legacy utility commented out for clean build
// import { updatePatientAppointmentFields } from '@utils/appointmentPatientSync';

// Patient constants and interfaces
const defaultNewPatientData = {
  name: '',
  email: '',
  phone: '',
  age: 0,
  gender: '',
  address: '',
  bloodType: '',
  allergies: [],
  condition: '',
  status: 'new',
  emergencyContact: '',
  doctor: '',
  doctorId: '',
  doctorName: ''
};

const defaultMedicalHistoryData = {
  date: new Date().toISOString().split('T')[0],
  condition: '',
  treatment: '',
  doctor: '',
  notes: ''
};

const defaultMedicationData = {
  name: '',
  dosage: '',
  frequency: '',
  dateStarted: new Date().toISOString().split('T')[0],
  status: 'Active' as const,
  duration: ''
};

const defaultAppointmentData = {
  patient: '',
  doctor: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  type: 'consultation',
  duration: '20',
  priority: 'Normal',
  notes: ''
};

const patientStatusOptions = ['new', 'old', 'follow-up', 'admitted', 'transferred', 'discharged'];
const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genderOptions = [
  { value: 'male', key: 'male' },
  { value: 'female', key: 'female' },
  { value: 'other', key: 'other' }
];
const commonConditions = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis'];
const commonMedications = ['Aspirin', 'Metformin', 'Lisinopril', 'Albuterol', 'Ibuprofen'];

// Medical record interfaces
interface MedicalHistory {
  id: string;
  date: string;
  condition: string;
  treatment: string;
  doctor: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  dateStarted: string;
  status: 'Active' | 'Discontinued';
  duration?: string;
}

interface VisitNote {
  id: string;
  date: string;
  doctor: string;
  notes: string;
  visitType: string;
}

interface VitalSign {
  id: string;
  date: string;
  height: number;
  weight: number;
  bloodPressure: string;
  temperature: number;
  heartRate: number;
}

interface Document {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  type: string;
}

// Legacy storage key - no longer used
export const PATIENTS_STORAGE_KEY = 'clinic_patients_data';

// Legacy functions - now use Firestore services instead
export const loadPatientsFromStorage = (): Patient[] => {
  console.warn('⚠️ loadPatientsFromStorage is deprecated - use PatientService.listenPatients instead');
  return [];
};

export const savePatientsToStorage = (patients: Patient[]) => {
  console.warn('⚠️ savePatientsToStorage is deprecated - use PatientService methods instead');
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
  const { userProfile } = useUser();

  // ✅ NEW: Use real-time data hooks
  const {
    patients,
    loading: patientsLoading,
    error: patientsError,
    addPatient,
    updatePatient,
    deletePatient,
    stats: patientStats
  } = usePatients();

  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError
  } = useAppointments();

  const dashboardStats = useDashboardStats();
  const { onDataUpdate, onConnectionChange } = useRealtimeUpdates();

  // ✅ NEW: Real-time update notifications
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // ✅ NEW: Enhanced patients with calculated appointment fields
  const [enhancedPatients, setEnhancedPatients] = useState<any[]>([]);

  // ✅ Patient guard for doctor restrictions
  const patientsGuardMap = usePatientsGuard(enhancedPatients);

  // Helper function to translate patient status and conditions
  const translatePatientData = (text: string) => {
    if (!text || typeof text !== 'string') {
      return text || 'Unknown';
    }
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
  // ✅ Firebase real-time data states (now handled by hooks)
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [patientOrganizationMode, setPatientOrganizationMode] = useState<'reservation' | 'completion' | 'all'>('all');
  
  // Document upload related states
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [shouldNavigateToDocuments, setShouldNavigateToDocuments] = useState(false);
  
  // Enhanced medical documents states
  const [addRequirementOpen, setAddRequirementOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'normal',
    dueDate: '',
    status: 'pending',
    estimatedTime: '',
    preparations: []
  });
  const [documentsTab, setDocumentsTab] = useState(0);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRequirementForUpload, setSelectedRequirementForUpload] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedDocumentsForShare, setSelectedDocumentsForShare] = useState<any[]>([]);
  const [whatsappMessage, setWhatsappMessage] = useState(''); // 0: Requirements, 1: Completed Documents
  
  // ✅ ENHANCED: Improved data loading logic with timeout fallback
  useEffect(() => {
    if (!initialized || authLoading || !user || !userProfile) {
      setIsDataLoaded(false);
      return;
    }

    console.log('🔄 PatientList: Checking data loading status', {
      patientsLoading,
      appointmentsLoading,
      patientsCount: patients.length,
      appointmentsCount: appointments.length,
      patientsError,
      appointmentsError
    });

    // ✅ ENHANCED: Set data as loaded if either:
    // 1. Both patients and appointments are not loading
    // 2. We have some data (even if still loading)
    // 3. There are errors (don't block forever)
    const shouldShowData = !patientsLoading || !appointmentsLoading || 
                          patients.length > 0 || appointments.length > 0 ||
                          patientsError || appointmentsError;

    if (shouldShowData) {
      setIsDataLoaded(true);
      console.log('✅ PatientList: Data ready to display');
    }

    // ✅ ENHANCED: Timeout fallback - show page after 5 seconds regardless
    const timeoutId = setTimeout(() => {
      if (!isDataLoaded) {
        console.log('⏰ PatientList: Timeout reached, showing page anyway');
        setIsDataLoaded(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [initialized, authLoading, user, userProfile, patientsLoading, appointmentsLoading, 
      patients.length, appointments.length, patientsError, appointmentsError, isDataLoaded]);

  // ✅ ENHANCED: Force data loaded after user profile is available
  useEffect(() => {
    if (userProfile && !isDataLoaded) {
      console.log('✅ PatientList: User profile available, enabling page');
      setIsDataLoaded(true);
    }
  }, [userProfile, isDataLoaded]);

  // Clear states when dialog closes
  useEffect(() => {
    if (!documentViewerOpen) {
      setPdfDataUrl('');
      setIsGeneratingPdf(false);
    }
  }, [documentViewerOpen]);

  // ✅ Doctor name resolution (like dashboard)
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

  // ✅ Helper function to check if a string is a Firebase ID
  const isFirebaseId = (str: string): boolean => {
    return !!(str && str.length >= 20 && /^[a-zA-Z0-9]+$/.test(str));
  };

  // ✅ Doctor name resolution function (exact copy from appointment page)
  const getPatientDoctorName = (patient: any): string => {
    console.log('🔍 PATIENT DOCTOR RESOLUTION:', {
      patientName: patient.name,
      doctorField: patient.doctor,
      doctorNameField: patient.doctorName,
      doctorIdField: patient.doctorId,
      availableDoctorsCount: availableDoctors.length,
      allPatientFields: Object.keys(patient), // Debug: see all available fields
      patientData: patient // Debug: see full patient object
    });

    // ✅ PRIORITY 1: Check if doctor field contains a valid Firebase ID first (like appointments)
    if (patient.doctor && isFirebaseId(patient.doctor)) {
      const doctor = availableDoctors.find(d => d.id === patient.doctor);
      if (doctor) {
        const resolvedName = `${doctor.firstName} ${doctor.lastName}`;
        console.log('✅ PATIENT PRIORITY 1 SUCCESS: Resolved doctor field Firebase ID to name:', {
          id: patient.doctor,
          resolvedName: resolvedName
        });
        return resolvedName;
      } else {
        console.log('❌ PATIENT PRIORITY 1 FAILED: doctor field Firebase ID not found:', patient.doctor);
      }
    }

    // ✅ PRIORITY 2: Check if doctor field has a readable name (not an ID)
    if (patient.doctor && patient.doctor.length < 50 && !isFirebaseId(patient.doctor)) {
      console.log('✅ PATIENT PRIORITY 2 SUCCESS: Using doctor field as name:', patient.doctor);
      return patient.doctor;
    }

    // ✅ PRIORITY 3: Check doctorName field (direct name)
    if (patient.doctorName && patient.doctorName.trim()) {
      console.log('✅ PATIENT PRIORITY 3 SUCCESS: Found doctorName field:', patient.doctorName);
      return patient.doctorName;
    }
    
    // ✅ PRIORITY 4: Check doctorId field for Firebase ID resolution (only as fallback)
    if (patient.doctorId && isFirebaseId(patient.doctorId)) {
      const doctor = availableDoctors.find(d => d.id === patient.doctorId);
      if (doctor) {
        const resolvedName = `${doctor.firstName} ${doctor.lastName}`;
        console.log('✅ PATIENT PRIORITY 4 SUCCESS: Resolved doctorId field Firebase ID to name:', {
          id: patient.doctorId,
          resolvedName: resolvedName
        });
        return resolvedName;
      } else {
        console.log('❌ PATIENT PRIORITY 4 FAILED: doctorId field Firebase ID not found:', patient.doctorId);
      }
    }

    // ✅ PRIORITY 5: Use doctorId as name if it's not a Firebase ID
    if (patient.doctorId && !isFirebaseId(patient.doctorId)) {
      console.log('✅ PATIENT PRIORITY 5 SUCCESS: Using doctorId field as name:', patient.doctorId);
      return patient.doctorId;
    }
    
    // ✅ FALLBACK: Use whatever is in doctor field
    if (patient.doctor) {
      console.log('✅ PATIENT FALLBACK: Using doctor field as final attempt:', patient.doctor);
      return patient.doctor;
    }

    console.log('❌ PATIENT ALL PRIORITIES FAILED: No doctor information found');
    return 'Not Assigned';
  };

  // ✅ Real-time Firestore listener for doctors (same as dashboard)
  useEffect(() => {
    const clinicId = userProfile?.clinicId;
    
    if (!clinicId) {
      console.log('🔄 PatientList: Waiting for clinicId...');
      return;
    }

    console.log('🔄 PatientList: Setting up real-time doctor listener for clinic:', clinicId);

        // ✅ Use direct Firebase access
    const setupListener = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore');
        const { getOptimizedFirestore } = await import('@lib/firebase/legacy-compat');
        const db = await getOptimizedFirestore();
        
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('clinicId', '==', clinicId),
          where('role', '==', 'doctor'),
          where('isActive', '==', true)
        );

          const unsub = onSnapshot(q, (snap: any) => {
      const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
      setAvailableDoctors(list);
      console.log('✅ PatientList: Real-time doctors updated:', {
        count: list.length,
        doctors: list.map((d: any) => ({
          id: d.id,
          firstName: d.firstName || 'Unknown',
          lastName: d.lastName || 'Doctor',
          fullName: `${d.firstName || 'Unknown'} ${d.lastName || 'Doctor'}`,
          email: d.email || 'No email'
        }))
      });
    }, (error: any) => {
      console.error('❌ PatientList: Error in doctor listener:', error);
      setAvailableDoctors([]);
    });

        return () => {
          console.log('🔄 PatientList: Cleaning up doctor listener');
          unsub();
        };
      } catch (error) {
        console.error('❌ PatientList: Failed to setup Firebase listener:', error);
        setAvailableDoctors([]);
        return () => {}; // Return empty cleanup function
      }
    };
    
    setupListener();
  }, [userProfile?.clinicId]);

  // ✅ NEW: Medical requirements state and fetching
  const [patientRequirements, setPatientRequirements] = useState<Map<string, number>>(new Map());

  // ✅ NEW: Snackbar state for notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to get medical requirements count for a patient
  const getMedicalRequirementsCount = (patientId: string): number => {
    // ✅ FIXED: First try to get count from patient's embedded medicalRequirements array
    const patient = enhancedPatients.find(p => p.id === patientId);
    if (patient && patient.medicalRequirements && Array.isArray(patient.medicalRequirements)) {
      const embeddedCount = patient.medicalRequirements.filter((req: any) => req.status === 'pending').length;
      if (embeddedCount > 0) {
        console.log(`📊 Patient ${patientId}: ${embeddedCount} pending requirements from embedded array`);
        return embeddedCount;
      }
    }
    
    // Fall back to the state map
    const count = patientRequirements.get(patientId);
    if (count === undefined || count === null) {
      console.debug(`🔍 No medical requirements count found for patient ${patientId}, defaulting to 0 (normal condition)`);
      console.debug('🔍 Current patientRequirements state:', Array.from(patientRequirements.entries()));
      return 0;
    }
    console.log(`📊 Patient ${patientId}: ${count} medical requirements from state map`);
    return count;
  };

  // ✅ ENHANCED: Real-time medical requirements listener with immediate sync
  useEffect(() => {
    if (!userProfile?.clinicId) return;

    console.log('🔄 Setting up real-time medical requirements listener...');

    // Initial fetch
    const fetchMedicalRequirements = async () => {
      if (enhancedPatients.length === 0) return;

      try {
        const requirementsMap = new Map<string, number>();
        
        // Fetch requirements for each patient
        console.log(`🔄 Fetching requirements for ${enhancedPatients.length} patients...`);
        
        const fetchPromises = enhancedPatients.map(async (patient) => {
          try {
            // ✅ OPTIMIZED: Use dedicated method for pending requirements
            const requirements = await MedicalRequirementsService.getPendingOrdersByPatient(
              userProfile.clinicId,
              patient.id
            );
            const count = requirements.length; // Already filtered for pending only
            requirementsMap.set(patient.id, count);
            console.log(`✅ Patient ${patient.name} (${patient.id}): ${count} pending requirements`);
            return { patientId: patient.id, count, success: true };
          } catch (error) {
            console.error(`❌ Error fetching requirements for patient ${patient.name} (${patient.id}):`, error);
            requirementsMap.set(patient.id, 0);
            return { patientId: patient.id, count: 0, success: false, error };
          }
        });
        
        const results = await Promise.allSettled(fetchPromises);
        console.log('📊 Fetch results:', results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return { patientId: enhancedPatients[index]?.id, success: false, error: result.reason };
          }
        }));

        setPatientRequirements(requirementsMap);
        console.log('✅ Medical requirements loaded for all patients');
      } catch (error) {
        console.error('❌ Error fetching medical requirements:', error);
      }
    };

    fetchMedicalRequirements();

            // ✅ FIXED: Set up real-time Firestore listener for medical requirements using correct collection
        const setupRealtimeListener = async () => {
          try {
            const { collection, query, where, onSnapshot } = await import('firebase/firestore');
            const { getOptimizedFirestore } = await import('@lib/firebase/legacy-compat');
            const db = await getOptimizedFirestore();
            if (!db) throw new Error('Firestore not initialized');
            
            // ✅ FIXED: Use the correct collection name 'medicalRequirementOrders'
            const requirementsCollection = collection(db, 'medicalRequirementOrders');
            
            // ✅ ENHANCED: Query only active orders for this clinic
            const q = query(
              requirementsCollection,
              where('clinicId', '==', userProfile.clinicId),
              where('isActive', '==', true)
            );
            
            const unsubscribe = onSnapshot(q, (snapshot: any) => {
              try {
                console.log('🔄 Medical requirements collection changed, updating counts...');
                console.log(`📊 Snapshot contains ${snapshot.docs.length} documents`);
                
                // Recalculate requirements count for all patients
                const requirementsMap = new Map<string, number>();
                
                // Group requirements by patient ID - ONLY COUNT PENDING ORDERS
                snapshot.docs.forEach((doc: any) => {
                  try {
                    const data = doc.data();
                    if (data.isActive && data.patientId && data.status === 'pending') {
                      const currentCount = requirementsMap.get(data.patientId) || 0;
                      requirementsMap.set(data.patientId, currentCount + 1);
                      console.log(`📋 Patient ${data.patientId}: ${currentCount + 1} pending requirements`);
                    }
                  } catch (docError) {
                    console.error('❌ Error processing document:', docError, doc);
                  }
                });

                // Ensure all current patients have entries (even if 0)
                enhancedPatients.forEach(patient => {
                  if (!requirementsMap.has(patient.id)) {
                    requirementsMap.set(patient.id, 0);
                  }
                });

                setPatientRequirements(requirementsMap);
                console.log('✅ Real-time medical requirements updated:', Array.from(requirementsMap.entries()));
              } catch (snapshotError) {
                console.error('❌ Error processing snapshot:', snapshotError);
              }
            }, (error: any) => {
              console.error('❌ Error in medical requirements real-time listener:', error);
            });

        return unsubscribe;
      } catch (error) {
        console.error('❌ Failed to setup real-time listener:', error);
        return null;
      }
    };

    // Setup listener and cleanup
    let unsubscribe: (() => void) | null = null;
    
    // Add delay to ensure Firebase is fully initialized
    setTimeout(async () => {
      try {
        const unsub = await setupRealtimeListener();
        if (unsub) {
          unsubscribe = unsub;
          console.log('✅ Real-time listener setup completed successfully');
        } else {
          console.warn('⚠️ Real-time listener setup returned null, falling back to manual fetch');
          fetchMedicalRequirements();
        }
      } catch (error) {
        console.error('❌ Failed to setup real-time listener:', error);
        // Fallback to one-time fetch
        fetchMedicalRequirements();
      }
    }, 1000);

    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up medical requirements real-time listener');
        unsubscribe();
      }
    };
  }, [userProfile?.clinicId, enhancedPatients.length]);

  // ✅ ADDED: Fallback periodic refresh as backup to real-time listener
  useEffect(() => {
    if (!userProfile?.clinicId || enhancedPatients.length === 0) return;

    const intervalId = setInterval(async () => {
      try {
        console.log('🔄 Fallback: Periodic refresh of medical requirements counts...');
        const countsMap = await MedicalRequirementsService.getAllPatientRequirementsCounts(userProfile.clinicId);
        setPatientRequirements(countsMap);
        console.log('✅ Fallback refresh completed');
      } catch (error) {
        console.warn('⚠️ Fallback refresh failed:', error);
      }
    }, 30000); // Refresh every 30 seconds as backup

    return () => {
      clearInterval(intervalId);
      console.log('🔄 Fallback periodic refresh stopped');
    };
  }, [userProfile?.clinicId, enhancedPatients.length]);

  // ✅ NEW: Listen for medical requirement creation events from patient profile
  useEffect(() => {
    const handleMedicalRequirementAdded = (event: CustomEvent) => {
      const { patientId, requirementData } = event.detail;
      console.log('📋 Medical requirement added, updating count for patient:', patientId);
      
      // Immediately update the count for this patient
      const currentCount = patientRequirements.get(patientId) || 0;
      const newRequirements = new Map(patientRequirements);
      newRequirements.set(patientId, currentCount + 1);
      setPatientRequirements(newRequirements);
      
      console.log(`✅ Updated requirements count for patient ${patientId}: ${currentCount} → ${currentCount + 1}`);
    };

    const handleMedicalRequirementUpdated = (event: CustomEvent) => {
      const { patientId } = event.detail;
      console.log('📋 Medical requirement updated, refreshing count for patient:', patientId);
      
      // Refresh count for this specific patient
      if (userProfile?.clinicId) {
        MedicalRequirementsService.getPendingOrdersByPatient(userProfile.clinicId, patientId)
          .then(requirements => {
            const newRequirements = new Map(patientRequirements);
            const pendingCount = requirements.length; // Already filtered for pending only
            newRequirements.set(patientId, pendingCount);
            setPatientRequirements(newRequirements);
            console.log(`✅ Refreshed requirements count for patient ${patientId}: ${pendingCount} pending`);
          })
          .catch(error => {
            console.error('❌ Error refreshing requirements count:', error);
          });
      }
    };

    // ✅ ADDED: Listen for count refresh events
    const handleMedicalRequirementCountRefreshed = (event: CustomEvent) => {
      const { patientId, count } = event.detail;
      console.log(`📋 Medical requirement count refreshed for patient ${patientId}: ${count}`);
      
      setPatientRequirements(prev => {
        const newMap = new Map(prev);
        newMap.set(patientId, count);
        return newMap;
      });
    };

    const handleAllMedicalRequirementCountsRefreshed = (event: CustomEvent) => {
      const { counts } = event.detail;
      console.log('📋 All medical requirement counts refreshed:', counts);
      
      const newMap = new Map();
      Object.entries(counts).forEach(([patientId, count]) => {
        newMap.set(patientId, count as number);
      });
      
      setPatientRequirements(newMap);
    };

    // Add event listeners
    window.addEventListener('medicalRequirementAdded', handleMedicalRequirementAdded as EventListener);
    window.addEventListener('medicalRequirementUpdated', handleMedicalRequirementUpdated as EventListener);
    window.addEventListener('medicalRequirementCountRefreshed', handleMedicalRequirementCountRefreshed as EventListener);
    window.addEventListener('allMedicalRequirementCountsRefreshed', handleAllMedicalRequirementCountsRefreshed as EventListener);

    return () => {
      window.removeEventListener('medicalRequirementAdded', handleMedicalRequirementAdded as EventListener);
      window.removeEventListener('medicalRequirementUpdated', handleMedicalRequirementUpdated as EventListener);
      window.removeEventListener('medicalRequirementCountRefreshed', handleMedicalRequirementCountRefreshed as EventListener);
      window.removeEventListener('allMedicalRequirementCountsRefreshed', handleAllMedicalRequirementCountsRefreshed as EventListener);
    };
  }, [patientRequirements, userProfile?.clinicId]);

  // ✅ ADDED: Manual refresh function for debugging
  const manualRefreshMedicalRequirementsCounts = async () => {
    if (!userProfile?.clinicId) {
      console.error('❌ No clinic ID available for manual refresh');
      return;
    }
    
    try {
      console.log('🔄 Manual refresh of medical requirements counts started...');
      
      // Force refresh all counts
      await MedicalRequirementsService.forceRefreshAllCounts(userProfile.clinicId);
      
      // Also refresh the local state
      const countsMap = await MedicalRequirementsService.getAllPatientRequirementsCounts(userProfile.clinicId);
      setPatientRequirements(countsMap);
      
      console.log('✅ Manual refresh completed successfully');
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Medical requirements counts refreshed successfully',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to refresh medical requirements counts',
        severity: 'error'
      });
    }
  };

  // ✅ ADDED: Debug function to check current state
  const debugMedicalRequirementsState = () => {
    console.log('🔍 DEBUG: Current medical requirements state:', {
      patientRequirements: Array.from(patientRequirements.entries()),
      totalPatients: enhancedPatients.length,
      clinicId: userProfile?.clinicId,
      samplePatients: enhancedPatients.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        requirementsCount: patientRequirements.get(p.id) || 0
      }))
    });
  };

  // ✅ ADDED: Function to check if medical requirements data is being fetched correctly
  const checkMedicalRequirementsData = async () => {
    if (!userProfile?.clinicId) {
      console.error('❌ No clinic ID available for data check');
      return;
    }
    
    try {
      console.log('🔍 Checking medical requirements data...');
      
      // Check if we have patients
      if (enhancedPatients.length === 0) {
        console.warn('⚠️ No patients available for requirements check');
        return;
      }
      
      // Check a sample patient
      const samplePatient = enhancedPatients[0];
      console.log('🔍 Sample patient:', {
        id: samplePatient.id,
        name: samplePatient.name
      });
      
      // ✅ OPTIMIZED: Use dedicated method for pending requirements
      const requirements = await MedicalRequirementsService.getPendingOrdersByPatient(
        userProfile.clinicId,
        samplePatient.id
      );
      console.log(`✅ Sample patient requirements: ${requirements.length} pending`, requirements);
      
      // Check if the count matches our state
      const storedCount = patientRequirements.get(samplePatient.id) || 0;
      console.log(`📊 Stored count vs actual pending count: ${storedCount} vs ${requirements.length}`);
      
      if (storedCount !== requirements.length) {
        console.warn('⚠️ Count mismatch detected! Updating state...');
        const newRequirements = new Map(patientRequirements);
        newRequirements.set(samplePatient.id, requirements.length);
        setPatientRequirements(newRequirements);
      }
      
      // Check all patients
      const allCounts = await MedicalRequirementsService.getAllPatientRequirementsCounts(userProfile.clinicId);
      console.log('📊 All patient counts from service:', allCounts);
      
      // Update our state with the service data
      const newRequirements = new Map();
      Object.entries(allCounts).forEach(([patientId, count]) => {
        newRequirements.set(patientId, count as number);
      });
      setPatientRequirements(newRequirements);
      
      console.log('✅ Medical requirements data check completed');
      
    } catch (error) {
      console.error('❌ Error checking medical requirements data:', error);
    }
  };

  // ✅ ADDED: Force immediate refresh and debug
  const forceRefreshAndDebug = async () => {
    console.log('🚀 FORCE REFRESH AND DEBUG STARTED');
    
    // Clear current state
    setPatientRequirements(new Map());
    console.log('🧹 Cleared current patient requirements state');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force refresh
    await manualRefreshMedicalRequirementsCounts();
    
    // Debug current state
    debugMedicalRequirementsState();
    
    console.log('🚀 FORCE REFRESH AND DEBUG COMPLETED');
  };

  // ✅ ADDED: Expose function to window for console debugging
  useEffect(() => {
    (window as any).refreshMedicalRequirementsCounts = manualRefreshMedicalRequirementsCounts;
    (window as any).forceRefreshAndDebug = forceRefreshAndDebug;
    (window as any).debugMedicalRequirements = () => {
      console.log('🔍 MEDICAL REQUIREMENTS DEBUG:', {
        patientRequirements: Array.from(patientRequirements.entries()),
        totalPatients: enhancedPatients.length,
        clinicId: userProfile?.clinicId,
        userRole: userProfile?.role,
        patientRequirementsSize: patientRequirements.size,
        samplePatientData: enhancedPatients.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          requirementsCount: patientRequirements.get(p.id) || 0
        }))
      });
    };
    (window as any).debugMedicalRequirementsState = debugMedicalRequirementsState;
    (window as any).checkMedicalRequirementsData = checkMedicalRequirementsData;
    
    (window as any).testMedicalRequirementsConnection = async () => {
      if (!userProfile?.clinicId) {
        console.error('❌ No clinic ID available');
        return;
      }
      
      try {
        console.log('🧪 Testing medical requirements connection...');
        
        // Test 1: Check if service is available
        console.log('✅ MedicalRequirementsService available:', !!MedicalRequirementsService);
        
        // Test 2: Try to get orders by clinic
        const clinicOrders = await MedicalRequirementsService.getOrdersByClinic(userProfile.clinicId);
        console.log('✅ Clinic orders fetched:', clinicOrders.length);
        
        // Test 3: Check specific patient requirements
        if (enhancedPatients.length > 0) {
          const testPatient = enhancedPatients[0];
          // ✅ OPTIMIZED: Use dedicated method for pending requirements
          const patientRequirements = await MedicalRequirementsService.getPendingOrdersByPatient(
            userProfile.clinicId, 
            testPatient.id
          );
          console.log(`✅ Patient ${testPatient.name} requirements: ${patientRequirements.length} pending`);
        }
        
        // Test 4: Check localStorage backup
        const localStorageKey = `clinic_medical_requirements_data_${userProfile.clinicId}`;
        const localStorageData = localStorage.getItem(localStorageKey);
        console.log('✅ LocalStorage backup:', localStorageData ? 'Available' : 'Not found');
        
        console.log('🎉 Medical requirements connection test completed!');
      } catch (error) {
        console.error('❌ Medical requirements connection test failed:', error);
      }
    };
    console.log('🔧 Debug functions exposed to window.refreshMedicalRequirementsCounts and window.debugMedicalRequirements');
    
    return () => {
      delete (window as any).refreshMedicalRequirementsCounts;
      delete (window as any).debugMedicalRequirements;
      delete (window as any).debugMedicalRequirementsState;
      delete (window as any).testMedicalRequirementsConnection;
    };
  }, [userProfile?.clinicId, patientRequirements, enhancedPatients]);

  // ✅ Enhanced Debug and Fix Functions
  useEffect(() => {
    // Step 1: Check function availability
    (window as any).checkPatientDoctorFunctions = () => {
      console.log('🔍 STEP 1: Function availability check:', {
        debugFunction: typeof (window as any).debugPatientDoctorResolution,
        quickFixFunction: typeof (window as any).quickFixPatientDoctors,
        manualFixFunction: typeof (window as any).manualFixPatientDoctors
      });
    };

    // Step 2: Enhanced debug function with full patient data
    (window as any).debugPatientDoctorResolution = () => {
      console.log('🔍 STEP 2: PATIENT DOCTOR RESOLUTION DEBUG:', {
        totalPatients: patients.length,
        availableDoctors: availableDoctors.length,
        clinicId: userProfile?.clinicId,
        userRole: userProfile?.role,
        doctorList: availableDoctors.map(d => ({
          id: d.id,
          firstName: d.firstName,
          lastName: d.lastName,
          fullName: `${d.firstName || 'Unknown'} ${d.lastName || 'Doctor'}`,
          email: d.email
        })),
        patientFullData: patients.map(patient => ({
          id: patient.id,
          name: patient.name,
          allFields: Object.keys(patient),
          doctorRelatedFields: {
            doctor: (patient as any).doctor,
            doctorId: (patient as any).doctorId, 
            doctorName: (patient as any).doctorName
          },
          fullPatientObject: patient,
          resolvedName: getPatientDoctorName(patient)
        }))
      });
      
      const stats = {
        patientsWithDoctors: patients.filter(p => getPatientDoctorName(p) !== 'Not Assigned').length,
        patientsWithoutDoctors: patients.filter(p => getPatientDoctorName(p) === 'Not Assigned').length,
        totalPatients: patients.length,
        canRunQuickFix: !!(userProfile?.clinicId && availableDoctors.length > 0)
      };
      
      console.log('📊 PATIENT-DOCTOR STATISTICS:', stats);
      return stats;
    };

    // Step 3: Enhanced quick fix function with better error handling
    (window as any).quickFixPatientDoctors = async () => {
      console.log('🔧 STEP 3: Quick fix starting...');
      
      if (!userProfile?.clinicId) {
        console.error('❌ No clinic ID available. UserProfile:', userProfile);
        return { error: 'No clinic ID' };
      }
      
      if (availableDoctors.length === 0) {
        console.error('❌ No doctors available. Available doctors:', availableDoctors);
        return { error: 'No doctors available' };
      }

      if (patients.length === 0) {
        console.error('❌ No patients available. Patients:', patients);
        return { error: 'No patients available' };
      }

      console.log('🔧 Pre-fix analysis:', {
        clinicId: userProfile.clinicId,
        doctorCount: availableDoctors.length,
        patientCount: patients.length,
        firstDoctor: availableDoctors[0]
      });

      let fixedCount = 0;
      const errors = [];

      for (const patient of patients) {
        // Only fix patients that have no doctor information
        if (!(patient as any).doctor && !(patient as any).doctorName && !(patient as any).doctorId) {
          try {
            // Assign to first available doctor as default
            const defaultDoctor = availableDoctors[0];
            console.log(`🔄 Fixing patient ${patient.name} (ID: ${patient.id})...`);
            
            const updateData = {
              doctor: defaultDoctor.id,
              doctorName: `${defaultDoctor.firstName} ${defaultDoctor.lastName}`,
              doctorId: defaultDoctor.id
            };
            
            console.log('Update data:', updateData);
            
            await PatientService.updatePatient(patient.id, updateData);
            fixedCount++;
            console.log(`✅ Fixed patient ${patient.name} -> ${defaultDoctor.firstName} ${defaultDoctor.lastName}`);
          } catch (error) {
            console.error(`❌ Failed to fix patient ${patient.name}:`, error);
            errors.push({ patient: patient.name, error: error instanceof Error ? error.message : String(error) });
          }
        } else {
          console.log(`⏭️ Skipping patient ${patient.name} - already has doctor info:`, {
            doctor: (patient as any).doctor,
            doctorName: (patient as any).doctorName,
            doctorId: (patient as any).doctorId
          });
        }
      }

      const result = {
        fixedCount,
        totalPatients: patients.length,
        errors,
        success: fixedCount > 0 && errors.length === 0
      };

      console.log(`🎯 Quick fix completed:`, result);
      
      // Force refresh data after 2 seconds
      setTimeout(() => {
        console.log('🔄 Refreshing page data...');
        window.location.reload();
      }, 2000);
      
      return result;
    };

    // Step 4: Manual fix function for specific patients
    (window as any).manualFixPatientDoctors = async (patientNames: string[] = [], doctorId: string | null = null) => {
      console.log('🔧 STEP 4: Manual fix starting...', { patientNames, doctorId });
      
      const targetDoctor = doctorId ? 
        availableDoctors.find(d => d.id === doctorId) : 
        availableDoctors[0];
        
      if (!targetDoctor) {
        console.error('❌ No target doctor found');
        return { error: 'No target doctor' };
      }

      const targetPatients = patientNames.length > 0 ? 
        patients.filter(p => patientNames.includes(p.name)) : 
        patients.filter(p => !(p as any).doctor && !(p as any).doctorName && !(p as any).doctorId);

      console.log('Manual fix targets:', {
        doctor: targetDoctor,
        patients: targetPatients.map(p => ({ id: p.id, name: p.name }))
      });

      let fixedCount = 0;
      for (const patient of targetPatients) {
        try {
          await PatientService.updatePatient(patient.id, {
            doctor: targetDoctor.id,
            doctorName: `${targetDoctor.firstName} ${targetDoctor.lastName}`,
            doctorId: targetDoctor.id
          });
          fixedCount++;
          console.log(`✅ Manually fixed ${patient.name} -> ${targetDoctor.firstName} ${targetDoctor.lastName}`);
        } catch (error) {
          console.error(`❌ Failed to manually fix ${patient.name}:`, error);
        }
      }

      return { fixedCount, targetPatients: targetPatients.length };
    };

    // Step 5: Data structure checker
    (window as any).checkPatientDataStructure = () => {
      console.log('🔍 STEP 5: Patient data structure check:', {
        samplePatient: patients[0] || 'No patients',
        patientKeys: patients[0] ? Object.keys(patients[0]) : [],
        doctorKeys: availableDoctors[0] ? Object.keys(availableDoctors[0]) : [],
        globalPatients: (window as any).patients || 'Not available',
        globalDoctors: (window as any).availableDoctors || 'Not available'
      });
    };

    // ✅ NEW: Direct Fix Function
    (window as any).directFixPatientDoctors = async () => {
      console.log('🚀 DIRECT FIX: Starting immediate doctor assignment...');
      
      if (!userProfile?.clinicId) {
        console.error('❌ No clinic ID available');
        return { error: 'No clinic ID' };
      }
      
      if (availableDoctors.length === 0) {
        console.error('❌ No doctors available');
        return { error: 'No doctors available' };
      }

      if (patients.length === 0) {
        console.error('❌ No patients available');
        return { error: 'No patients available' };
      }

      console.log('🔧 Starting direct fix with:', {
        clinicId: userProfile.clinicId,
        availableDoctors: availableDoctors.length,
        patients: patients.length,
        patientsWithoutDoctors: patients.filter(p => !(p as any).doctor && !(p as any).doctorName && !(p as any).doctorId).length
      });

      let fixedCount = 0;
      const errors = [];

      // Use first available doctor as default
      const defaultDoctor = availableDoctors[0];
      console.log('🎯 Using default doctor:', {
        id: defaultDoctor.id,
        firstName: defaultDoctor.firstName,
        lastName: defaultDoctor.lastName
      });

      for (const patient of patients) {
        // Only fix patients that have no doctor information
        const hasDoctor = (patient as any).doctor || (patient as any).doctorName || (patient as any).doctorId;
        
        if (!hasDoctor) {
          try {
            console.log(`🔄 Fixing patient: ${patient.name} (ID: ${patient.id})`);
            
            const updateData = {
              doctor: defaultDoctor.id,
              doctorName: `${defaultDoctor.firstName} ${defaultDoctor.lastName}`,
              doctorId: defaultDoctor.id,
              _lastDoctorSync: new Date().toISOString(),
              _doctorSyncSource: 'direct_fix'
            };
            
            console.log('📝 Update data:', updateData);
            
            await PatientService.updatePatient(patient.id, updateData);
            fixedCount++;
            console.log(`✅ Fixed patient "${patient.name}" -> ${defaultDoctor.firstName} ${defaultDoctor.lastName}`);
          } catch (error) {
            console.error(`❌ Failed to fix patient "${patient.name}":`, error);
            errors.push({ patient: patient.name, error: error instanceof Error ? error.message : String(error) });
          }
        } else {
          console.log(`⏭️ Skipping patient "${patient.name}" - already has doctor info:`, {
            doctor: (patient as any).doctor,
            doctorName: (patient as any).doctorName,
            doctorId: (patient as any).doctorId
          });
        }
      }

      const result = {
        fixedCount,
        totalPatients: patients.length,
        errors,
        success: fixedCount > 0 && errors.length === 0
      };

      console.log(`🎯 Direct fix completed:`, result);
      
      if (fixedCount > 0) {
        // Force refresh data after 2 seconds
        setTimeout(() => {
          console.log('🔄 Refreshing page data...');
          window.location.reload();
        }, 2000);
      }
      
      return result;
    };

    // Auto-expose data for debugging
    (window as any).patients = patients;
    (window as any).availableDoctors = availableDoctors;
    (window as any).userProfile = userProfile;

    // Auto-run basic checks
    if (patients.length > 0 && availableDoctors.length > 0) {
      console.log('🔧 Auto-running patient doctor resolution debug...');
      setTimeout(() => {
        console.log('='.repeat(50));
        console.log('🚀 AUTOMATIC PATIENT-DOCTOR DEBUG SESSION');
        console.log('='.repeat(50));
        (window as any).checkPatientDoctorFunctions();
        (window as any).debugPatientDoctorResolution();
        (window as any).checkPatientDataStructure();
        console.log('='.repeat(50));
        console.log('💡 Available functions:');
        console.log('1. debugPatientDoctorResolution() - Full debug info');
        console.log('2. quickFixPatientDoctors() - Auto-assign doctors');
        console.log('3. manualFixPatientDoctors([patientNames], doctorId) - Manual assign');
        console.log('4. checkPatientDataStructure() - Check data structure');
        console.log('5. directFixPatientDoctors() - Direct fix');
        console.log('='.repeat(50));
      }, 1000);
    }

    console.log('🔧 Enhanced patient doctor debug tools loaded');
  }, [patients, availableDoctors, getPatientDoctorName, userProfile]);

  // ✅ NEW: Direct Firebase connection test with fallback
  React.useEffect(() => {
    if (!initialized || authLoading || !user || !userProfile) return;

    console.log('🔄 DIRECT TEST: Fetching Firebase data directly...');
    
    const testFirebaseConnection = async () => {
      try {
        const clinicId = userProfile.clinicId || 'demo-clinic';
        
        // Direct fetch from Firebase services
        console.log('📋 Fetching appointments directly...');
        const directAppointments = await AppointmentService.getAllAppointments(clinicId);
        console.log(`📋 Direct fetch: Found ${directAppointments.length} appointments`);
        
        console.log('👥 Fetching patients directly...');
        const directPatients = await PatientService.searchPatients(clinicId, '');
        console.log(`👥 Direct fetch: Found ${directPatients.length} patients`);
        
        // Update states directly - Note: These are read-only from hooks, so just log
        if (directAppointments.length > 0) {
          console.log('✅ Found appointments directly from Firebase:', directAppointments.length);
        }
        
        if (directPatients.length > 0) {
          console.log('✅ Found patients directly from Firebase:', directPatients.length);
        }
        
        setIsDataLoaded(true);
        
        // Show immediate results
        console.log(`🎯 DIRECT TEST RESULTS: ${directAppointments.length} appointments, ${directPatients.length} patients`);
        
        // If we have appointments but no patients, trigger sync
        if (directAppointments.length > 0 && directPatients.length === 0) {
          console.log('🔄 DIRECT TEST: Sync needed - triggering immediate sync...');
          setTimeout(() => {
            syncAppointmentsToPatients();
          }, 2000);
        }
        
      } catch (error) {
        console.error('❌ DIRECT TEST: Firebase connection failed:', error);
        
        // Show error to user
        setTimeout(() => {
          console.error(`❌ Firebase Connection Test Failed: ${error}`);
        }, 1000);
      }
    };
    
    // Run direct test
    testFirebaseConnection();
  }, []);

  // ✅ NEW: Listen for real-time updates
  useEffect(() => {
    const unsubscribeDataUpdate = onDataUpdate((collection, data) => {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      console.log(`👥 Patients: Real-time update - ${collection} (${data.length} items)`);
    });

    const unsubscribeConnection = onConnectionChange((status) => {
      console.log(`🔄 Patients: Connection status - ${status}`);
    });

    return () => {
      unsubscribeDataUpdate();
      unsubscribeConnection();
    };
  }, [onDataUpdate, onConnectionChange]);

  // ✅ NEW: Calculate appointment fields when patient or appointment data changes
  useEffect(() => {
    if (patients.length > 0 && appointments.length >= 0) {
      console.log('🔄 Calculating patient appointment fields...', {
        patientsCount: patients.length,
        appointmentsCount: appointments.length
      });
      
      const patientsWithAppointments = calculateAllPatientsAppointmentFields(patients, appointments);
      setEnhancedPatients(patientsWithAppointments);
      
      console.log('✅ Patient appointment fields calculated:', {
        enhancedPatientsCount: patientsWithAppointments.length,
        samplePatient: patientsWithAppointments[0] ? {
          name: patientsWithAppointments[0].name,
          todayAppointment: patientsWithAppointments[0].todayAppointment,
          nextAppointment: patientsWithAppointments[0].nextAppointment,
          lastVisit: patientsWithAppointments[0].lastVisit,
          completedVisitsCount: patientsWithAppointments[0].allCompletedVisits?.length || 0
        } : 'No patients'
      });
    } else {
      setEnhancedPatients(patients);
    }
  }, [patients, appointments]);

  // ✅ NEW: Listen for appointment completion events and force recalculation
  useEffect(() => {
    const handleAppointmentCompleted = (event: CustomEvent) => {
      console.log('👥 Patient page: Appointment completed, forcing recalculation...', event.detail);
      
      // Force immediate recalculation with current data
      if (patients.length > 0 && appointments.length >= 0) {
        const patientsWithAppointments = calculateAllPatientsAppointmentFields(patients, appointments);
        setEnhancedPatients(patientsWithAppointments);
        
        console.log('✅ Patient appointment fields recalculated after completion');
      }
    };

    const handleRescheduled = (event: CustomEvent) => {
      console.log('👥 Patient page: Appointment rescheduled, forcing recalculation...', event.detail);
      
      // Force immediate recalculation with current data
      if (patients.length > 0 && appointments.length >= 0) {
        const patientsWithAppointments = calculateAllPatientsAppointmentFields(patients, appointments);
        setEnhancedPatients(patientsWithAppointments);
        
        console.log('✅ Patient appointment fields recalculated after rescheduling');
      }
    };

    window.addEventListener('appointmentCompleted', handleAppointmentCompleted as EventListener);
    window.addEventListener('appointmentRescheduled', handleRescheduled as EventListener);

    return () => {
      window.removeEventListener('appointmentCompleted', handleAppointmentCompleted as EventListener);
      window.removeEventListener('appointmentRescheduled', handleRescheduled as EventListener);
    };
  }, [patients, appointments]);

  // ✅ NEW: Debug logging for new system
  useEffect(() => {
    console.log('👥 PATIENTS (NEW SYSTEM): Data state', {
      user: !!user,
      userProfile: !!userProfile,
      patientsCount: patients.length,
      appointmentsCount: appointments.length,
      connectionStatus: dashboardStats.connectionStatus,
      isOnline: dashboardStats.isOnline,
      lastUpdate: lastUpdate?.toLocaleTimeString(),
      updateCount
    });
  }, [user, userProfile, patients.length, appointments.length, dashboardStats, lastUpdate, updateCount]);

  // ✅ NEW: Listen for appointment payment status changes from appointment page
  useEffect(() => {
    const handleAppointmentPaymentStatusChange = (event: CustomEvent) => {
      console.log('💚 Patient page: Appointment payment status changed:', event.detail);
      
      // Force refresh to get updated appointment data
      FirebaseDataBridge.refreshAll(userProfile?.clinicId ?? 'demo-clinic');
      
      // Show notification about the change
      const { patient, oldStatus, newStatus } = event.detail;
      console.log(`💰 Patient page: ${patient}'s appointment payment status changed from ${oldStatus} to ${newStatus}`);
    };

    // ✅ NEW: Listen for appointment completion events
    const handleAppointmentCompletion = (event: CustomEvent) => {
      console.log('💚 Patient page: Appointment completed with payment:', event.detail);
      
      // Force refresh to get updated appointment and payment data
      FirebaseDataBridge.refreshAll(userProfile?.clinicId ?? 'demo-clinic');
      
      const { appointment, payment, revenue } = event.detail;
      console.log(`💰 Patient page: ${appointment.patient} completed appointment, revenue: ${revenue}`);
    };

    // ✅ NEW: Listen for payment status changes from payment page
    const handlePaymentStatusChange = (event: CustomEvent) => {
      console.log('💚 Patient page: Payment status changed:', event.detail);
      
      // Force refresh to get updated data
      FirebaseDataBridge.refreshAll(userProfile?.clinicId ?? 'demo-clinic');
      
      const { patient, oldStatus, newStatus, invoiceId } = event.detail;
      console.log(`💰 Patient page synced: ${patient}'s payment ${invoiceId} status ${oldStatus} → ${newStatus}`);
    };

    // ✅ NEW: Listen for appointment payment status sync events
    const handleAppointmentPaymentStatusSync = (event: CustomEvent) => {
      console.log('💚 Patient page: Payment status synced:', event.detail);
      
      // Force refresh to get updated patient data
      FirebaseDataBridge.refreshAll(userProfile?.clinicId ?? 'demo-clinic');
      
      const { appointmentId, patient, paymentId, newStatus } = event.detail;
      console.log(`💰 Patient page synced: Patient ${patient} payment ${paymentId} status → ${newStatus}`);
    };

    // Add event listeners
    window.addEventListener('appointmentPaymentStatusChanged', handleAppointmentPaymentStatusChange as EventListener);
    window.addEventListener('appointmentCompletedWithPayment', handleAppointmentCompletion as EventListener);
    window.addEventListener('paymentStatusChanged', handlePaymentStatusChange as EventListener);
    window.addEventListener('appointmentPaymentStatusSynced', handleAppointmentPaymentStatusSync as EventListener);

    // Cleanup on unmount
    return () => {
      console.log('💚 Cleaning up event listeners...');
      window.removeEventListener('appointmentPaymentStatusChanged', handleAppointmentPaymentStatusChange as EventListener);
      window.removeEventListener('appointmentCompletedWithPayment', handleAppointmentCompletion as EventListener);
      window.removeEventListener('paymentStatusChanged', handlePaymentStatusChange as EventListener);
      window.removeEventListener('appointmentPaymentStatusSynced', handleAppointmentPaymentStatusSync as EventListener);
    };
  }, []);

  // ✅ Listen for global events and cleanup
  React.useEffect(() => {
    // Listen for user data clearing
    const handleUserDataCleared = () => {
      // Reset to default state
      setEnhancedPatients([]);
      // setAppointments is not available - appointments come from useAppointments hook
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
      
      console.log('✅ Patient data reset to default state');
    };

    // Listen for mobile FAB action
    const handleOpenAddPatient = () => {
      setAddPatientOpen(true);
    };

    window.addEventListener('userDataCleared', handleUserDataCleared);
    window.addEventListener('openAddPatient', handleOpenAddPatient);
    
    return () => {
      window.removeEventListener('userDataCleared', handleUserDataCleared);
      window.removeEventListener('openAddPatient', handleOpenAddPatient);
    };
  }, []);
  
  // ✅ TEMPORARILY DISABLED: Automatic real-time sync listeners to fix hooks error
  // Automatic sync still works through Firebase real-time listeners and direct triggers
  // TODO: Re-enable after fixing hooks issue
  /*
  useEffect(() => {
    console.log('🔄 PatientList: Setting up automatic sync listeners');

    const handleAppointmentUpdate = (event: CustomEvent) => {
      console.log('📋 PatientList: Appointment updated automatically, refreshing patient data');
    };

    const handlePaymentUpdate = (event: CustomEvent) => {
      console.log('💰 PatientList: Payment updated automatically, refreshing patient data');
    };

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('🔄 PatientList: Force refresh triggered automatically');
      setIsDataLoaded(true);
    };

    const handlePatientRefresh = (event: CustomEvent) => {
      console.log('👥 PatientList: Patient data refresh triggered automatically');
      setIsDataLoaded(true);
    };

    window.addEventListener('appointmentUpdated', handleAppointmentUpdate);
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    window.addEventListener('forceDataRefresh', handleForceRefresh);
    window.addEventListener('refreshPatientData', handlePatientRefresh);

    return () => {
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdate);
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      window.removeEventListener('forceDataRefresh', handleForceRefresh);
      window.removeEventListener('refreshPatientData', handlePatientRefresh);
    };
  }, []);
  */

  // ✅ ENHANCED: Automatic sync when patient data changes
  useEffect(() => {
    if (patients.length > 0 && appointments.length > 0) {
      console.log('🔄 PatientList: Data available, triggering automatic sync check');
      // Trigger automatic cross-page sync
      import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.all();
      });
    }
  }, [patients.length, appointments.length]);

  // ✅ NEW: Handle navigation to Documents tab after upload dialog closes
  useEffect(() => {
    if (shouldNavigateToDocuments && !uploadDocumentOpen) {
      console.log('🔄 Upload dialog closed, navigating to Documents tab');
      setProfileTab(4); // Navigate to Documents tab
      setShouldNavigateToDocuments(false); // Reset flag
      
      // Show success message after navigation
      setTimeout(() => {
        setDocumentUploadSuccess(true);
        console.log('✅ Successfully navigated to Documents tab and showing success message');
      }, 200);
    }
  }, [shouldNavigateToDocuments, uploadDocumentOpen]);

  // ✅ NEW: Enhanced document type management
  const [predefinedDocumentTypes, setPredefinedDocumentTypes] = useState([
    'Lab Report',
    'X-Ray',
    'CT Scan',
    'MRI Scan',
    'Blood Test',
    'Prescription',
    'Medical Certificate',
    'Insurance Document',
    'Vaccination Record',
    'Ultrasound',
    'ECG Report',
    'Pathology Report'
  ]);
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // ✅ NEW: Success message state
  const [documentUploadSuccess, setDocumentUploadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

  // Reset appointment time when doctor or date changes
  useEffect(() => {
    if (appointmentData.doctor || appointmentData.date) {
      setAppointmentData(prev => ({ ...prev, time: '' }));
    }
  }, [appointmentData.doctor, appointmentData.date]);
  
  // 🆕 Doctor-Patient Assignment State
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentPatient, setAssignmentPatient] = useState<any>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  
  // ✅ Sync state for appointment-patient synchronization
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [syncResults, setSyncResults] = useState<any>(null);
  
  // New Patient Form State - UI state only (no localStorage persistence)
  const [newPatientData, setNewPatientData] = useState(defaultNewPatientData);

  // Removed: localStorage save for new patient form - keeping UI state only

  // ✅ FIXED: Add missing variables and functions that were removed during localStorage cleanup
  const [organizedAppointmentData, setOrganizedAppointmentData] = useState<any>(null);
  const [patientsWithAppointments, setPatientsWithAppointments] = useState<any[]>([]);

  // Dummy implementation of missing functions  
  const getPatientsOrganizedByAppointmentStatus = () => {
    return {
      patientsWithPending: patients.filter((p: any) => p.status === 'new' || p.status === 'follow-up'),
      patientsWithCompleted: patients.filter((p: any) => p.status === 'old'),
      patientsWithNoAppointments: patients.filter((p: any) => p.status === 'discharged'),
      allPatients: patients
    };
  };

  // ✅ OLD DUMMY FUNCTIONS REMOVED - Now using Firebase-friendly sync

  const initialPatients = patients;

  // ✅ Firebase-friendly sync function
  const syncAppointmentsToPatients = async () => {
    const clinicId = userProfile?.clinicId || 'demo-clinic';
    console.log('💚 Using Firebase-friendly sync for clinic:', clinicId);

    setSyncStatus('syncing');
    setSyncResults(null);

    try {
      console.log('💚 Starting Firebase-friendly sync...');
      
      // Use Firebase-friendly sync to minimize quota usage
      const results = await FirebaseFriendlySync.manualSync(clinicId);
      
      if (!results) {
        setSyncStatus('completed');
        console.log('💚 Sync completed - no sync needed or no appointments found.');
        return;
      }
      
      setSyncResults(results);
      setSyncStatus('completed');
      
      console.log('✅ Firebase-friendly sync completed:', results);
      
      // Show success message
      
    } catch (error) {
      console.error('❌ Firebase-friendly sync failed:', error);
      setSyncStatus('error');
              console.error('Sync failed. Please try again later.');
    } finally {
      // Ensure status is not left in syncing state if early returned
      if (syncStatus === 'syncing') {
        setSyncStatus('completed');
      }
    }
  };

  // ✅ FIREBASE-FRIENDLY AUTO-SYNC: Only run once when needed
  React.useEffect(() => {
    if (!initialized || authLoading || !user || !userProfile) return;
    
    // Only run sync once when we clearly have the issue and page is loaded
    if (isDataLoaded && appointments.length > 0 && patients.length === 0 && syncStatus === 'idle') {
      console.log(`💚 FIREBASE-FRIENDLY: Detected ${appointments.length} appointments but ${patients.length} patients. Running one-time sync...`);
      
      // Only run once with a delay to let Firebase-friendly service handle it
      setTimeout(() => {
        // Check if the Firebase-friendly service hasn't already handled it
        if (patients.length === 0) {
          console.log('💚 Manual trigger needed for Firebase-friendly sync');
          syncAppointmentsToPatients();
        } else {
          console.log('💚 Firebase-friendly service already handled the sync');
        }
      }, 8000); // Wait for auto-service to try first
    }
  }, [initialized, authLoading, user, userProfile, isDataLoaded, appointments.length, patients.length, syncStatus]);

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
      console.warn('No patients with valid phone numbers found.');
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
    console.log(`Opening WhatsApp for ${patientsWithPhones.length} patients.`);
  };

  const handleOpenPatientProfile = (patient: Patient) => {
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

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedPatient) return;

    try {
      const newVisitNote = {
        date: ServiceUtils.getToday(),
        doctor: 'Current Doctor',
        notes: newNote,
        visitType: 'General Visit'
      };
      
      const updatedVisitNotes = [...(selectedPatient.visitNotes || []), newVisitNote];
      
      // ✅ NEW: Use Firestore service instead of manual state update
      await PatientService.updatePatient(selectedPatient.id, {
        visitNotes: updatedVisitNotes
      });
      
      // ✅ State updates automatically via real-time listener!
      setNewNote('');
      console.log('✅ Visit note added successfully');
    } catch (error) {
      console.error('❌ Error adding visit note:', error);
      console.error('Failed to add visit note. Please try again.');
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.name.trim() || !selectedPatient) return;

    try {
      const medication = {
        name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        dateStarted: ServiceUtils.getToday(),
        status: 'Active' as const
      };
      
      const updatedMedications = [...(selectedPatient.medications || []), medication];
      
      // ✅ Immediately update the selectedPatient state for instant UI update
      const updatedSelectedPatient = {
        ...selectedPatient,
        medications: updatedMedications
      };
      setSelectedPatient(updatedSelectedPatient);
      
      // ✅ NEW: Use Firestore service to persist changes
      await PatientService.updatePatient(selectedPatient.id, {
        medications: updatedMedications
      });
      
      // ✅ Reset form
      setNewMedication(defaultMedicationData);
      console.log('✅ Medication added successfully');
    } catch (error) {
      console.error('❌ Error adding medication:', error);
      console.error('Failed to add medication. Please try again.');
    }
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatient({ ...patient });
    setEditPatientOpen(true);
  };

  const handleSavePatientEdit = async () => {
    if (!editingPatient) return;

    try {
      // ✅ NEW: Use Firestore service instead of manual state update
      await PatientService.updatePatient(editingPatient.id, editingPatient);
      
      // ✅ ENHANCED: Trigger automatic cross-page sync
      import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.patient(editingPatient, 'update');
      });
      
      // ✅ State updates automatically via real-time listener!
      setEditPatientOpen(false);
      setEditingPatient(null);
      console.log('✅ Patient updated successfully');
      
      // ✅ ENHANCED: Show success message
      console.log(`Patient "${editingPatient.name}" updated successfully!`);
    } catch (error) {
      console.error('❌ Error updating patient:', error);
      console.error('Failed to update patient. Please try again.');
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
            status: editingMedication.status || 'Active',
            dateStarted: editingMedication.dateStarted || new Date().toISOString().split('T')[0],
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
      
      setEnhancedPatients(updatedPatients as any);
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
            notes: editingNote.note,
            doctor: editingNote.doctor,
            visitType: 'follow-up' // Add required visitType field
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
      
      setEnhancedPatients(updatedPatients);
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
      
      setEnhancedPatients(updatedPatients);
    }
  };

  const handleUploadDocument = async () => {
    console.log('🔄 handleUploadDocument called:', { 
      hasFile: !!selectedFile, 
      hasTitle: !!documentTitle.trim(), 
      hasPatient: !!selectedPatient,
      title: documentTitle 
    });
    
    if (selectedFile && documentTitle.trim() && selectedPatient) {
      // ✅ ENHANCED: Handle custom document type addition
      let finalDocumentTitle = documentTitle;
      
      // If "Other" was selected and custom type was provided, add it to predefined types
      if (documentTitle === 'Other' && customDocumentType.trim()) {
        finalDocumentTitle = customDocumentType.trim();
        
        // Add custom type to predefined list if not already present
        if (!predefinedDocumentTypes.includes(finalDocumentTitle)) {
          setPredefinedDocumentTypes(prev => [...prev, finalDocumentTitle].sort());
          console.log(`✅ Added new document type: ${finalDocumentTitle}`);
        }
      }
      
      // Create file URL for viewing
      const fileUrl = URL.createObjectURL(selectedFile);
      
      const newDocument = {
        id: Date.now(),
        title: finalDocumentTitle,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadDate: new Date().toISOString().split('T')[0],
        type: selectedFile.type.includes('image') ? 'image' : 
              selectedFile.type.includes('pdf') ? 'pdf' : 'document',
        fileType: selectedFile.type,
        fileUrl: fileUrl // Store the blob URL for viewing
      };

      // Update the specific patient with the new document
      const updatedPatientData = {
        ...selectedPatient,
        documents: [...(selectedPatient.documents || []), newDocument]
      };
      
      // Update patient in Firebase through the service
      await updatePatient(selectedPatient.id, updatedPatientData);
      setSelectedPatient(updatedPatientData);
      
      // ✅ IMPROVED: Set success message
      setSuccessMessage(`📄 "${finalDocumentTitle}" uploaded successfully! You are now viewing Medical Documents.`);
      
      // ✅ IMPROVED: Trigger navigation after dialog closes
      setShouldNavigateToDocuments(true);
      
      // ✅ IMPROVED: Close upload dialog (this will trigger the useEffect for navigation)
      setUploadDocumentOpen(false);
      setSelectedFile(null);
      setDocumentTitle('');
      setCustomDocumentType('');
      setShowCustomInput(false);
      
      console.log(`📁 Upload completed: ${finalDocumentTitle} for patient ${selectedPatient.name}. Dialog will close and navigate to Documents tab.`);
      
      console.log(`✅ Document uploaded: ${finalDocumentTitle} for patient ${selectedPatient.name}`);
    }
  };

  // ✅ NEW: Handle upload for medical requirement documents
  const handleUploadRequirementDocument = async () => {
    console.log('🔄 handleUploadRequirementDocument called:', { 
      hasFiles: uploadedFiles.length > 0,
      hasRequirement: !!selectedRequirementForUpload,
      hasPatient: !!selectedPatient
    });
    
    if (uploadedFiles.length > 0 && selectedRequirementForUpload && selectedPatient) {
      try {
        // Create file URLs for viewing
        const uploadedDocuments = uploadedFiles.map((file, index) => ({
          id: `doc-${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toISOString().split('T')[0],
          type: file.type,
          size: file.size,
          category: 'completed_result' as const,
          uploadedBy: userProfile?.firstName + ' ' + userProfile?.lastName || 'Staff'
        }));

        // Update the specific requirement with the uploaded documents
        const updatedRequirements = selectedPatient.medicalRequirements?.map((req: any) => {
          if (req.id === selectedRequirementForUpload.id) {
            return {
              ...req,
              status: 'completed',
              completedDate: new Date().toISOString().split('T')[0],
              uploadedFiles: uploadedDocuments
            };
          }
          return req;
        }) || [];

        // Update patient with the modified requirements
        const updatedPatientData = {
          ...selectedPatient,
          medicalRequirements: updatedRequirements
        };
        
        // Update patient in Firebase through the service
        await updatePatient(selectedPatient.id, updatedPatientData);
        setSelectedPatient(updatedPatientData);
        
        // ✅ Also update in the enhanced patients list
        const updatedPatients = enhancedPatients.map(patient => 
          patient.id === selectedPatient.id ? updatedPatientData : patient
        );
        setEnhancedPatients(updatedPatients);
        
        // ✅ IMPROVED: Set success message
        setSuccessMessage(`📄 Documents uploaded successfully for "${selectedRequirementForUpload.title}"!`);
        
        // ✅ Close upload dialog
        setUploadDialogOpen(false);
        setUploadedFiles([]);
        setSelectedRequirementForUpload(null);
        
        console.log(`📁 Upload completed for requirement: ${selectedRequirementForUpload.title}`);
      } catch (error) {
        console.error('❌ Error uploading requirement documents:', error);
        setSnackbar({
          open: true,
          message: 'Failed to upload documents. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const handleAddNewPatient = async () => {
    if (!newPatientData.name.trim() || !newPatientData.phone.trim()) {
      console.warn('Please fill in at least the name and phone number');
      return;
    }

    if (!userProfile?.clinicId) {
      console.error('Unable to determine clinic. Please try again.');
      return;
    }

    try {
      const patientData = {
        name: newPatientData.name,
        phone: newPatientData.phone,
        email: newPatientData.email || `${newPatientData.name ? newPatientData.name.toLowerCase().replace(/\s+/g, '.') : 'patient'}@example.com`,
        age: newPatientData.age || 30,
        gender: (newPatientData.gender as 'male' | 'female' | 'other') || 'other',
        address: newPatientData.address || 'Address not provided',
        bloodType: newPatientData.bloodType || 'Unknown',
        condition: newPatientData.condition || 'Initial consultation',
        status: (newPatientData.status as 'new' | 'old' | 'follow-up') || 'new',
        emergencyContact: newPatientData.emergencyContact || 'Not provided',
        doctor: newPatientData.doctor || '',
        doctorId: newPatientData.doctorId || '',
        doctorName: newPatientData.doctorName || '',
        isActive: true,
        allergies: [],
        medications: [],
        visitNotes: [],
        vitalSigns: []
      };

      // ✅ NEW: Use Firestore service instead of manual state update
      await PatientService.createPatient(userProfile.clinicId, patientData);
      
      setAddPatientOpen(false);
      setNewPatientData(defaultNewPatientData);
      
      console.log('✅ New patient created successfully');
      
      // ✅ ENHANCED: Trigger automatic cross-page sync
      import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.patient(patientData, 'create');
      });
      
      console.log('Patient added successfully!');
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      console.error('Failed to add patient. Please try again.');
    }
  };

  const handleCompleteMedicationDetails = (medicationDetails: any) => {
    if (!pendingMedication || !selectedPatient) return;

    // Update the medication in the patient's medications list
    const updatedPatients = enhancedPatients.map(patient => {
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

    setEnhancedPatients(updatedPatients);

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
      patient: '',
      date: '',
      time: '',
      doctor: '',
      type: 'Follow-up',
      duration: '20',
      notes: '',
      priority: 'Normal'
    });
    setScheduleAppointmentOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!appointmentData.date || !appointmentData.time || !appointmentData.doctor || !appointmentPatient || !userProfile?.clinicId) {
      console.warn('Please fill in the date, time, and select a doctor');
      return;
    }

    try {
      const appointmentTime = appointmentData.time?.trim();
      
      // ✅ Use selected doctor from form
      const selectedDoctor = availableDoctors.find(d => d.id === appointmentData.doctor);
      if (!selectedDoctor) {
        console.error('Selected doctor not found. Please select a valid doctor.');
        return;
      }

      const doctorName = `${selectedDoctor.firstName} ${selectedDoctor.lastName}`;
      const doctorId = selectedDoctor.id;

      console.log('✅ Using selected doctor for appointment:', { doctorName, doctorId });
      
      // ✅ NEW: Create appointment using Firestore service with correct doctor info
      const newAppointmentData = {
        patient: appointmentPatient.name,
        patientId: appointmentPatient.id,
        doctor: doctorName,
        doctorId: doctorId,
        date: appointmentData.date,
        time: appointmentTime,
        timeSlot: appointmentTime,
        type: (appointmentData.type as 'consultation' | 'follow-up' | 'surgery' | 'emergency') || 'follow-up',
        duration: parseInt(appointmentData.duration) || 20,
        priority: (appointmentData.priority?.toLowerCase() as 'normal' | 'high' | 'urgent') || 'normal',
        location: 'Main Clinic',
        notes: appointmentData.notes || '',
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        isActive: true,
        isAvailableSlot: false  // ✅ FIXED: Explicitly mark as reserved appointment
      };

      const newAppointment = await AppointmentService.createAppointment(userProfile.clinicId, newAppointmentData);
      
      // ✅ NEW: Create payment automatically using Firestore service
      try {
        const paymentData = {
          patientId: appointmentPatient.id,
          patient: appointmentPatient.name,
          appointmentId: newAppointment,
          amount: 100, // Default amount - could be dynamic
          date: appointmentData.date,
          invoiceDate: appointmentData.date,
          dueDate: appointmentData.date,
          description: `Appointment on ${appointmentData.date} at ${appointmentTime}`,
          status: 'pending' as const,
          method: 'cash' as const,
          currency: 'USD',
          isActive: true
        };
        
        await PaymentService.createPayment(userProfile.clinicId, paymentData);
        console.log('✅ Auto-payment created for appointment');
      } catch (paymentError) {
        console.error('❌ Error creating auto-payment:', paymentError);
      }

      setScheduleAppointmentOpen(false);
      setAppointmentPatient(null);
      
      // ✅ ENHANCED: Trigger automatic cross-page sync to update appointment fields
      import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.appointment({ 
          ...newAppointmentData, 
          id: newAppointment,
          createdAt: new Date().toISOString() // Ensure creation date is tracked
        }, 'create');
        triggerAutomaticSync.patient({ 
          ...appointmentPatient, 
          lastUpdate: new Date().toISOString()
        }, 'update');
      });
      
      // ✅ State updates automatically via real-time listeners!
      console.log(`✅ Appointment scheduled successfully for ${appointmentPatient.name}!`);
      console.log('✅ Appointment created via Firestore service with tracked input date');

    } catch (error) {
      console.error('❌ Error saving appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error scheduling appointment: ${errorMessage}. Please try again.`);
    }
  };

  const handleQuickStatusEdit = (patient: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setStatusEditPatient(patient);
    setStatusMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!statusEditPatient) return;

    try {
      console.log(`🔄 Updating patient status: ${statusEditPatient.name} → ${newStatus}`);
      
      // ✅ FIXED: Update patient status in Firebase
      await updatePatient(statusEditPatient.id, { status: newStatus as Patient['status'] });
      
      // Update selectedPatient if it's the same patient
      if (selectedPatient?.id === statusEditPatient.id) {
        setSelectedPatient({
          ...selectedPatient,
          status: newStatus
        });
      }

      console.log(`✅ Patient status updated successfully: ${statusEditPatient.name} → ${newStatus}`);
      
      // ✅ ENHANCED: Trigger cross-page sync to update appointment and other pages
      import('@utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.patient({ 
          ...statusEditPatient, 
          status: newStatus 
        }, 'update');
      });

      setStatusMenuAnchor(null);
      setStatusEditPatient(null);
      
    } catch (error) {
      console.error('❌ Error updating patient status:', error);
      console.error(`Error updating patient status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      console.warn('Please fill in the condition field');
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
        console.warn('Please enter the medication name');
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
      const updatedPatients = enhancedPatients.map(p => 
        p.id === selectedPatient?.id 
          ? { ...p, medications: [...(p.medications || []), newMedication] }
          : p
      );
      setEnhancedPatients(updatedPatients);

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
        console.warn('Please enter the custom treatment details');
        return;
      }
      treatmentText = newMedicalHistory.treatment;
    } else if (treatmentType === 'existing' && !selectedMedication) {
              console.warn('Please select a medication from the dropdown or choose a different treatment type');
      return;
    }

    if (!treatmentText) {
      console.warn('Please specify a treatment');
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
    const updatedPatients = enhancedPatients.map(patient => {
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
    
    setEnhancedPatients(updatedPatients);

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
    setNewTreatmentMedication(defaultMedicationData);

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

  /**
   * Get priority badge for a patient based on their appointment status
   */
  const getPriorityBadge = (patient: any) => {
    const appointmentData = patient.appointmentData || { completed: [], notCompleted: [], totalAppointments: 0 };
    
    // Get today's date for comparison
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    // Check if patient has today's appointment
    const hasTodayAppointment = patient.todayAppointment && patient.todayAppointment !== 'No appointment today';
    
    if (hasTodayAppointment) {
      // Check if today's appointment is completed/paid
      const todayCompletedAppointment = appointmentData.completed?.find((apt: any) => {
        const appointmentDate = new Date(apt.date);
        const aptDateString = appointmentDate.getFullYear() + '-' + 
          String(appointmentDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(appointmentDate.getDate()).padStart(2, '0');
        return aptDateString === todayString;
      });
      
      if (todayCompletedAppointment) {
        // Get completion time for display using same logic as priority calculation
        let completionTime = null;
        
        // Try to get completion time from different sources
        if (todayCompletedAppointment.updatedAt) {
          completionTime = new Date(todayCompletedAppointment.updatedAt);
        } else if (todayCompletedAppointment.createdAt) {
          const createdAt = new Date(todayCompletedAppointment.createdAt);
          const createdDateString = createdAt.getFullYear() + '-' + 
            String(createdAt.getMonth() + 1).padStart(2, '0') + '-' + 
            String(createdAt.getDate()).padStart(2, '0');
          if (createdDateString === todayString) {
            completionTime = createdAt;
          }
        }
        
        // Note: Payment completion time lookup removed - localStorage persistence disabled
        // Using appointment data only for completion time
        
        const timeDisplay = completionTime ? 
          ` (${completionTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})` : '';
        
        return {
          label: `PAID${timeDisplay}`,
          color: 'error',
          icon: '🔴',
          description: `Today's appointment is PAID/COMPLETED${completionTime ? ` at ${completionTime.toLocaleTimeString()}` : ''} - Ready for Doctor (Highest Priority - Earlier payment = Higher priority)`,
          style: { fontWeight: 'bold', border: '2px solid' }
        };
      }
      // Note: No badge for unpaid today appointments - let them blend in normally
    }
    
    // Only show badge for patients with completed appointments (high activity)
    if (appointmentData.completed && appointmentData.completed.length > 0) {
      const hasRecentCompletion = appointmentData.completed.some((apt: any) => {
        const daysDiff = Math.floor((new Date().getTime() - new Date(apt.date).getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30; // Completed in last 30 days
      });
      
      if (hasRecentCompletion || appointmentData.completed.length >= 3) {
        return {
          label: 'Active',
          color: 'success',
          icon: '🟢',
          description: `${appointmentData.completed.length} completed appointments`
        };
      }
    }
    
    return null; // Only show badges for important statuses
  };

  const getFilteredPatients = () => {
    let filtered = enhancedPatients;

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
        (patient.name && patient.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.condition && patient.condition.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.phone && patient.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      // Gender filter
      const matchesGender = activeFilters.gender === '' || 
        (patient.gender && patient.gender.toLowerCase() === activeFilters.gender.toLowerCase());

      // Age range filter
      const matchesAge = activeFilters.ageRange === '' || (() => {
        const age = patient.age;
        if (age === undefined || age === null) return true;
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
        (patient.condition && patient.condition.toLowerCase().includes(activeFilters.condition.toLowerCase()));

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

    // 🎯 PRIORITY SORTING: Sort by appointment completion status
    const sortedFiltered = sortPatientsByAppointmentPriority(filtered);
    
    // Debug: Log the sorting applied (simplified to avoid hoisting issues)
    if (sortedFiltered.length > 0) {
      console.log('🎯 Patients sorted by appointment priority:', {
        totalPatients: sortedFiltered.length,
        topPatients: sortedFiltered.slice(0, 5).map(p => ({
          name: p.name,
          priority: calculateAppointmentPriority(p.appointmentData || {}, p),
          todayAppointment: p.todayAppointment,
          completedCount: p.appointmentData?.completed?.length || 0,
          pendingCount: p.appointmentData?.notCompleted?.length || 0
        }))
      });
    }

    return sortedFiltered;
  };

  /**
   * Sort patients by appointment completion priority
   * Priority order: Completed appointments → Pending appointments → No appointments
   */
  const sortPatientsByAppointmentPriority = (patients: any[]) => {
    return patients.sort((a, b) => {
      // Get appointment data for both patients
      const aAppointmentData = a.appointmentData || { completed: [], notCompleted: [], totalAppointments: 0 };
      const bAppointmentData = b.appointmentData || { completed: [], notCompleted: [], totalAppointments: 0 };
      
      // Calculate priority scores
      const aPriority = calculateAppointmentPriority(aAppointmentData, a);
      const bPriority = calculateAppointmentPriority(bAppointmentData, b);
      
      // Sort by priority (higher priority first)
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // If same priority, sort by most recent activity
      const aRecentActivity = getRecentActivity(aAppointmentData, a);
      const bRecentActivity = getRecentActivity(bAppointmentData, b);
      
      return bRecentActivity - aRecentActivity;
    });
  };

  /**
   * Calculate appointment priority score for a patient
   */
  const calculateAppointmentPriority = (appointmentData: any, patient: any) => {
    let priority = 0;
    
    // Get today's date for comparison
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    // 🔴 HIGHEST PRIORITY: Patients with TODAY'S appointment that is COMPLETED (PAID)
    const hasTodayAppointment = patient.todayAppointment && patient.todayAppointment !== 'No appointment today';
    if (hasTodayAppointment) {
      // Check if today's appointment is completed/paid
      const todayCompletedAppointment = appointmentData.completed?.find((apt: any) => {
        const appointmentDate = new Date(apt.date);
        const aptDateString = appointmentDate.getFullYear() + '-' + 
          String(appointmentDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(appointmentDate.getDate()).padStart(2, '0');
        return aptDateString === todayString;
      });
      
      if (todayCompletedAppointment) {
        priority += 10000; // ABSOLUTE HIGHEST PRIORITY BASE for today's paid appointments
        
        // 🎯 CRITICAL: Add completion time bonus - earlier completion = higher priority
        // This ensures patients who paid first are seen first (ready to enter doctor)
        
        // Try to get completion time from different sources
        let completionTime = null;
        
        // 1. Check if appointment has updatedAt (when it was marked as completed)
        if (todayCompletedAppointment.updatedAt) {
          completionTime = new Date(todayCompletedAppointment.updatedAt);
        }
        // 2. Check if appointment has createdAt and it's today (completed on creation)
        else if (todayCompletedAppointment.createdAt) {
          const createdAt = new Date(todayCompletedAppointment.createdAt);
          const createdDateString = createdAt.getFullYear() + '-' + 
            String(createdAt.getMonth() + 1).padStart(2, '0') + '-' + 
            String(createdAt.getDate()).padStart(2, '0');
          if (createdDateString === todayString) {
            completionTime = createdAt;
          }
        }
        // 3. Payment lookup removed - localStorage persistence disabled
        // Using appointment data only for completion time
        
        if (completionTime) {
          // Convert to minutes since midnight for easier comparison
          const completionMinutes = completionTime.getHours() * 60 + completionTime.getMinutes();
          // Earlier completion gets higher priority (subtract from max minutes in day)
          const timePriority = 1440 - completionMinutes; // 1440 = 24 hours * 60 minutes
          priority += timePriority;
          console.log(`🔴 PAID TODAY (${completionTime.toLocaleTimeString()}): ${patient.name} - Priority: ${priority}`);
        } else {
          // If no completion time, still high priority but lower than those with times
          priority += 500;
          console.log(`🔴 PAID TODAY (no time): ${patient.name} - Priority: ${priority}`);
        }
      } else {
        priority += 5000; // High priority for today's unpaid appointments (but lower than paid)
        console.log(`🟡 UNPAID TODAY: ${patient.name} - Priority: ${priority}`);
      }
    }
    
    // ✅ HIGH PRIORITY: Patients with completed appointments (recent activity)
    if (appointmentData.completed && appointmentData.completed.length > 0) {
      priority += 1000; // Base score for having completed appointments
      priority += appointmentData.completed.length * 10; // Extra points per completed appointment
      
      // Extra priority for recent completions
      const recentCompletions = appointmentData.completed.filter((apt: any) => {
        const appointmentDate = new Date(apt.date);
        const daysDiff = Math.floor((new Date().getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30; // Completed in last 30 days
      });
      priority += recentCompletions.length * 50;
    }
    
    // 🟡 MEDIUM PRIORITY: Patients with pending appointments (need attention)
    if (appointmentData.notCompleted && appointmentData.notCompleted.length > 0) {
      priority += 500; // Base score for having pending appointments
      priority += appointmentData.notCompleted.length * 20; // Extra points per pending appointment
      
      // Extra priority for upcoming appointments
      const upcomingAppointments = appointmentData.notCompleted.filter((apt: any) => {
        const appointmentDate = new Date(apt.date);
        const daysDiff = Math.floor((appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 7; // Upcoming in next 7 days
      });
      priority += upcomingAppointments.length * 30;
    }
    
    // 🟠 SPECIAL PRIORITY: Manually set last visits
    if (patient.lastVisit && !appointmentData.completed?.some((apt: any) => apt.date === patient.lastVisit)) {
      priority += 800; // High priority for manual last visits
    }
    
    // ⚪ LOW PRIORITY: Patients with no appointments
    if (appointmentData.totalAppointments === 0) {
      priority += 100; // Base score for having no appointments
    }
    
    return priority;
  };

  /**
   * Get recent activity timestamp for tie-breaking
   */
  const getRecentActivity = (appointmentData: any, patient: any) => {
    let mostRecentTime = 0;
    
    // Check most recent completed appointment
    if (appointmentData.completed && appointmentData.completed.length > 0) {
      const recentCompleted = Math.max(...appointmentData.completed.map((apt: any) => new Date(apt.date).getTime()));
      mostRecentTime = Math.max(mostRecentTime, recentCompleted);
    }
    
    // Check most recent pending appointment
    if (appointmentData.notCompleted && appointmentData.notCompleted.length > 0) {
      const recentPending = Math.max(...appointmentData.notCompleted.map((apt: any) => new Date(apt.date).getTime()));
      mostRecentTime = Math.max(mostRecentTime, recentPending);
    }
    
    // Check patient registration/update time
    if (patient.createdAt) {
      mostRecentTime = Math.max(mostRecentTime, new Date(patient.createdAt).getTime());
    }
    
    return mostRecentTime;
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

    setEnhancedPatients(updatedPatients);

    // Update selectedPatient if it's the same patient
    if (selectedPatient?.id === editLastVisitPatient.id) {
      setSelectedPatient({
        ...selectedPatient,
        lastVisit: formattedDate
      });
    }

    // Sync appointment data
    // Legacy function commented out for clean build
    // updatePatientAppointmentFields(editLastVisitPatient.name);

    setEditLastVisitOpen(false);
    setEditLastVisitPatient(null);
    setNewLastVisitDate('');
  };

  // 🆕 Doctor-Patient Assignment Handlers
  const handleOpenAssignment = (patient: any) => {
    setAssignmentPatient(patient);
    setAssignmentDialogOpen(true);
  };

  const handleCloseAssignment = () => {
    setAssignmentDialogOpen(false);
    setAssignmentPatient(null);
  };

  const handleAssignmentChange = async () => {
    // Reload patient data after assignment changes
    if (isDoctor && userProfile) {
      try {
        const updatedPatients = await getPatientsByDoctor(userProfile.id, userProfile.clinicId);
        setDoctorPatients(updatedPatients);
        setEnhancedPatients(updatedPatients);
        console.log('✅ Patient data refreshed after assignment change');
      } catch (error) {
        console.error('❌ Error refreshing patient data after assignment:', error);
      }
    } else {
      // For management, use default patients (localStorage removed)
      setEnhancedPatients(initialPatients);
    }
  };

  // Show loading spinner while data is loading
  if (!isDataLoaded) {
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
    <React.Fragment>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Enhanced Unified Header Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
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
                {/* Sync indicator functionality integrated directly */}



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
                              border: '2px solid rgba(9, 9, 121, 1)',
                              boxShadow: '0 8px 32px rgba(9, 9, 121, 0.3)',
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
                            background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                            color: 'white',
                            border: 'none',
                            '&:hover': {
                              background: 'linear-gradient(90deg,rgba(2, 0, 36, 0.9) 0%, rgba(9, 9, 121, 0.9) 35%, rgba(0, 212, 255, 0.9) 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 8px 32px rgba(9, 9, 121, 0.4)',
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
                      {/* Debug Button for Medical Requirements */}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={forceRefreshAndDebug}
                        startIcon={<Refresh />}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          px: 2,
                          minWidth: 'fit-content',
                          borderColor: 'warning.main',
                          color: 'warning.main',
                          '&:hover': {
                            borderColor: 'warning.dark',
                            backgroundColor: 'warning.light',
                            color: 'warning.dark',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        🔧 Debug MR
                      </Button>
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
                              background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                              boxShadow: '0 4px 16px rgba(9, 9, 121, 0.4)',
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
                              background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
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
                              background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
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
                  
                  {/* ✅ NEW: Medical Requirements Refresh Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={manualRefreshMedicalRequirementsCounts}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 600,
                          backgroundColor: 'white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          minWidth: 200,
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          },
                          transition: 'all 0.3s ease',
                          color: 'primary.main'
                        }}
                      >
                        🔄 Refresh Medical Requirements Counts
                      </Button>
                      
                      {/* ✅ NEW: Test Connection Button */}
                      <Button
                        variant="outlined"
                        startIcon={<Science />}
                        onClick={checkMedicalRequirementsData}
                        sx={{
                          ml: 2,
                          borderRadius: 3,
                          fontWeight: 600,
                          backgroundColor: 'white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          minWidth: 180,
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                          },
                          transition: 'all 0.3s ease',
                          color: 'success.main'
                        }}
                      >
                        🧪 Test Connection
                      </Button>
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
                        background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
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

                    {/* 🎯 PRIORITY SORTING INFO */}
                    {filteredPatients.length > 0 && (
                      <Alert severity="success" sx={{ m: 3, mb: 2 }}>
                        <Typography variant="body2">
                          🎯 <strong>Smart Priority Sorting:</strong> Patients are sorted by appointment activity - 
                          <strong style={{ color: '#d32f2f' }}>🔴 Today's appointments</strong> appear first, followed by 
                          <strong style={{ color: '#2e7d32' }}>🟢 Active patients</strong> (with completed appointments), 
                          <strong style={{ color: '#ed6c02' }}>🟡 Upcoming appointments</strong>, and 
                          <strong style={{ color: '#1976d2' }}>🔵 Scheduled patients</strong>. 
                          This helps you focus on the most important patients first based on real appointment data.
                        </Typography>
                      </Alert>
                    )}
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('contact')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Today's Appointment</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Medical Requirements</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 && getActiveFilterCount() > 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
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
                              <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
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
                            filteredPatients.map((patient) => {
                              const patientGuard = patientsGuardMap.get(patient.id);
                              return (
                            <TableRow key={patient.id} hover {...(patientGuard?.tableRowProps || {})}>
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
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
                                      
                                      {/* 🎯 PRIORITY BADGE based on appointment status */}
                                      {(() => {
                                        const priorityBadge = getPriorityBadge(patient);
                                        return priorityBadge ? (
                                          <Tooltip title={priorityBadge.description} arrow>
                                            <Chip
                                              label={`${priorityBadge.icon} ${priorityBadge.label}`}
                                              size="small"
                                              color={priorityBadge.color as any}
                                              variant="outlined"
                                              sx={{ 
                                                fontSize: '0.65rem', 
                                                height: 20,
                                                fontWeight: 600,
                                                border: '1.5px solid',
                                                ...priorityBadge.style,
                                              }}
                                            />
                                          </Tooltip>
                                        ) : null;
                                      })()}
                                      
                                      {/* Existing "Today" registration badge */}
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
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {getPatientDoctorName(patient)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {patient.allCompletedVisits && patient.allCompletedVisits.length > 0 ? (
                                    <Box>
                                      <Typography variant="body2" fontWeight={600} color="primary.main">
                                        {patient.allCompletedVisits[0].formattedDate} (Latest)
                                      </Typography>
                                      {patient.allCompletedVisits.length > 1 && (
                                        <Typography variant="caption" color="text.secondary">
                                          +{patient.allCompletedVisits.length - 1} more completed visits
                                        </Typography>
                                      )}
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {patient.allCompletedVisits[0].type} with {patient.allCompletedVisits[0].doctor}
                                      </Typography>
                                    </Box>
                                  ) : patient.lastVisit ? (
                                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                                      {patient.lastVisit}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No visits yet
                                    </Typography>
                                  )}
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
                                {(() => {
                                  // ✅ ENHANCED: Check if patient has pendingRequirementsCount field first
                                  let requirementsCount = 0;
                                  
                                  if (patient.pendingRequirementsCount !== undefined && patient.pendingRequirementsCount !== null) {
                                    // Use the field directly from patient object if available
                                    requirementsCount = patient.pendingRequirementsCount;
                                  } else {
                                    // Fall back to the existing method using the state map
                                    requirementsCount = getMedicalRequirementsCount(patient.id);
                                  }
                                  
                                  return requirementsCount > 0 ? (
                                    <Chip
                                      label={`Yes (${requirementsCount})`}
                                      color="primary"
                                      size="small"
                                      variant="filled"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: '#2196f3',
                                        color: 'white'
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No
                                    </Typography>
                                  );
                                })()}
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
                            )})
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
                            <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('last_visit')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('next_appointment')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('condition')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Medical Requirements</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPatients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6 }}>
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
                            filteredPatients.map((patient) => {
                              const patientGuard = patientsGuardMap.get(patient.id);
                              return (
                            <TableRow key={patient.id} hover {...(patientGuard?.tableRowProps || {})}>
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
                                {(() => {
                                  // ✅ ENHANCED: Check if patient has pendingRequirementsCount field first
                                  let requirementsCount = 0;
                                  
                                  if (patient.pendingRequirementsCount !== undefined && patient.pendingRequirementsCount !== null) {
                                    // Use the field directly from patient object if available
                                    requirementsCount = patient.pendingRequirementsCount;
                                  } else {
                                    // Fall back to the existing method using the state map
                                    requirementsCount = getMedicalRequirementsCount(patient.id);
                                  }
                                  
                                  return requirementsCount > 0 ? (
                                    <Chip
                                      label={`Yes (${requirementsCount})`}
                                      color="primary"
                                      size="small"
                                      variant="filled"
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: '#2196f3',
                                        color: 'white'
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No
                                    </Typography>
                                  );
                                })()}
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
                            )})
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
                            <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
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
                          <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
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
                            <TableCell sx={{ fontWeight: 600 }}>{t('doctor')}</TableCell>
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
                                          <Typography variant="body2">{appointment.duration || 20} min</Typography>
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
                                          <Typography variant="body2">{appointment.duration || 20} min</Typography>
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
                                  Doctor: {getPatientDoctorName(patient)}
                                </Typography>
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
                                  Doctor: {getPatientDoctorName(patient)}
                                </Typography>
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
                                        Duration: {appointment.duration || 20} minutes
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
                                        Duration: {appointment.duration || 20} minutes
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
                              {selectedPatient.allCompletedVisits && selectedPatient.allCompletedVisits.length > 0 ? (
                              <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    All Completed Visits ({selectedPatient.allCompletedVisits.length})
                                  </Typography>
                                  <Box sx={{ maxHeight: 150, overflowY: 'auto', mt: 1, p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                                    {selectedPatient.allCompletedVisits.map((visit: any, index: number) => {
                                      // Check if this is a past appointment (auto-completed) or explicitly completed
                                      const visitDate = new Date(visit.date);
                                      const today = new Date();
                                      const isPastVisit = visitDate < today;
                                      
                                      return (
                                        <Box key={index} sx={{ 
                                          display: 'flex', 
                                          justifyContent: 'space-between', 
                                          alignItems: 'center',
                                          py: 1,
                                          px: 1,
                                          mb: index < selectedPatient.allCompletedVisits.length - 1 ? 1 : 0,
                                          backgroundColor: 'white',
                                          borderRadius: 1,
                                          border: '1px solid #e0e0e0'
                                        }}>
                                          <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                              {visit.date} at {visit.time}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {visit.type || 'Medical Visit'} • {visit.doctor || 'Dr. Unknown'}
                                            </Typography>
                                            {isPastVisit && (
                                              <Typography variant="caption" color="success.main" sx={{ display: 'block', fontStyle: 'italic' }}>
                                                📅 Auto-completed (past date)
                                              </Typography>
                                            )}
                                          </Box>
                                          <Chip 
                                            label={isPastVisit ? "Past Visit" : "Completed"} 
                                            size="small" 
                                            color="success" 
                                            variant="outlined"
                                            sx={{ fontSize: '0.65rem' }}
                                          />
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                  <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}>
                                    💡 All visits also appear in Medical History tab
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Last Visits</Typography>
                                  </Box>
                                  {selectedPatient.allCompletedVisits && selectedPatient.allCompletedVisits.length > 0 ? (
                                    <Box>
                                      <Typography variant="body1" fontWeight={600} color="primary.main">
                                        {selectedPatient.allCompletedVisits[0].formattedDate}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {selectedPatient.allCompletedVisits[0].type} with {selectedPatient.allCompletedVisits[0].doctor}
                                      </Typography>
                                      {selectedPatient.allCompletedVisits.length > 1 && (
                                        <Typography variant="caption" color="text.secondary">
                                          +{selectedPatient.allCompletedVisits.length - 1} more completed visits
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : selectedPatient.lastVisit ? (
                                    <Typography variant="body1" fontWeight={600} color="primary.main">
                                      {selectedPatient.lastVisit}
                                    </Typography>
                                  ) : (
                                    <Box>
                                      <Typography variant="body1" fontWeight={600} color="text.secondary">
                                        No completed visits yet
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Completed appointments will appear here automatically
                                      </Typography>
                                      <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                        💡 Complete appointments to update last visit automatically
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Today's Appointment</Typography>
                                <Typography variant="body1" fontWeight={600} color="success.main">
                                  {selectedPatient.todayAppointment || 'No appointment today'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">Next Appointment</Typography>
                                <Typography variant="body1" fontWeight={600} color="primary.main">
                                  {selectedPatient.nextAppointment || 'Not scheduled'}
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
                        <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Medical History ({selectedPatient.medicalHistory?.length || 0})
                        </Typography>
                          {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {selectedPatient.medicalHistory.filter((h: any) => h._autoGeneratedFromAppointment).length} from visits • {' '}
                              {selectedPatient.medicalHistory.filter((h: any) => !h._autoGeneratedFromAppointment).length} manually added
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            startIcon={<Add />}
                            onClick={() => {
                              // Set smart default for treatment type based on existing medications
                              const hasExistingMedications = selectedPatient?.medications && selectedPatient.medications.length > 0;
                              setTreatmentType(hasExistingMedications ? 'existing' : 'new');
                              setSelectedMedication('');
                              setNewTreatmentMedication(defaultMedicationData);
                              setAddMedicalHistoryOpen(true);
                            }}
                          >
                            Add Medical History
                          </Button>

                        </Box>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          {selectedPatient.medicalHistory?.length > 0 ? (
                            selectedPatient.medicalHistory.map((history: any, index: number) => (
                              <Card 
                                key={index} 
                                sx={{ 
                                  mb: 2,
                                  border: history._autoGeneratedFromAppointment ? '2px solid #e8f5e8' : '1px solid #e0e0e0',
                                  backgroundColor: history._autoGeneratedFromAppointment ? '#f8fffe' : 'white'
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {history.condition}
                                    </Typography>
                                        {history._autoGeneratedFromAppointment && (
                                          <Chip
                                            label="Auto-Generated"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            sx={{ 
                                              fontSize: '0.65rem', 
                                              height: 20,
                                              backgroundColor: '#e8f5e8',
                                              borderColor: '#4caf50'
                                            }}
                                          />
                                        )}
                                      </Box>
                                      {history._autoGeneratedFromAppointment && (
                                        <Typography variant="caption" color="success.main" sx={{ fontStyle: 'italic' }}>
                                          {history._isPastVisit ? 
                                            '📅 Auto-generated from past appointment' : 
                                            '📋 Auto-generated from completed appointment'
                                          }
                                        </Typography>
                                      )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        {history.date}
                                      </Typography>
                                      {!history._autoGeneratedFromAppointment && (
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
                                      )}
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
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No medical history found. Completed appointments will automatically appear here.
                              </Typography>
                              <Typography variant="body2" color="success.main">
                                📋 Completed appointments will automatically appear as medical history, or use "Add Medical History" to add manual entries.
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
                                <EnhancedMedicalConditionSelector 
                                  value={newMedicalHistory.condition}
                                  onChange={(value) => setNewMedicalHistory({ ...newMedicalHistory, condition: value })}
                                  label="Medical Condition"
                                  placeholder="Select or type a medical condition"
                                  helperText="Choose from our database or add a new condition"
                                  fullWidth
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
                                        selectedPatient.medications.map((medication: any, index: number) => (
                                          <MenuItem key={medication.id || `quick-medication-${index}`} value={medication.name}>
                                            <Box>
                                              <Typography variant="body2">{medication.name}</Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {medication.dosage}, {medication.frequency}
                                              </Typography>
                                            </Box>
                                          </MenuItem>
                                        ))
                                      )}
                                      <MenuItem key="quick-add-new" value="__ADD_NEW__" sx={{ borderTop: '1px solid #e0e0e0', mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                          <Add sx={{ fontSize: 16, mr: 1 }} />
                                          <Typography variant="body2" fontWeight={600}>
                                            Add New...
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                      {selectedPatient?.medications?.length === 0 && (
                                        <MenuItem key="quick-no-medications" disabled>
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
                                <EnhancedMedicationSelector
                                  value={{
                                    name: newMedication.name,
                                    dosage: newMedication.dosage,
                                    frequency: newMedication.frequency,
                                    duration: newMedication.duration
                                  }}
                                  onChange={(value) => setNewMedication({
                                    ...newMedication,
                                    name: value.name,
                                    dosage: value.dosage || '',
                                    frequency: value.frequency || '',
                                    duration: value.duration || ''
                                  })}
                                  label="Medication"
                                  placeholder="Select or type a medication name"
                                  helperText="Choose from our database or add new medications"
                                  showDosageAndFrequency={true}
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

                  {/* Enhanced Medical Documents Tab */}
                  {profileTab === 4 && (
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Medical Documents & Requirements
                        </Typography>
                      </Box>
                      
                      {/* Documents Sub-Tabs */}
                      <Tabs 
                        value={documentsTab} 
                        onChange={(e, newValue) => setDocumentsTab(newValue)}
                        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Assignment />
                              <span>Requirements & Orders ({selectedPatient.medicalRequirements?.filter((req: any) => req.status === 'pending').length || 0})</span>
                            </Box>
                          } 
                        />
                        <Tab 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachFile />
                              <span>Completed Documents ({
                                (selectedPatient.medicalRequirements?.filter((req: any) => req.status === 'completed').length || 0) + 
                                (selectedPatient.documents?.length || 0) +
                                (selectedPatient.id === 'patient-1' ? 3 : 0) // Sample documents only for first patient
                              })</span>
                            </Box>
                          } 
                        />
                      </Tabs>

                      {/* Requirements & Orders Tab */}
                      {documentsTab === 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Medical Requirements & Orders
                            </Typography>
                            <Button 
                              variant="contained" 
                              startIcon={<Add />}
                              onClick={() => setAddRequirementOpen(true)}
                            >
                              Add Requirement
                            </Button>
                          </Box>

                          <Alert severity="info" sx={{ mb: 2 }}>
                            All medical requirements and their status are now shown in the "Documents" tab below. 
                            Use this section to add new requirements only.
                          </Alert>
                          
                          <Grid container spacing={2}>
                            {/* Show only pending requirements count */}
                            {selectedPatient.medicalRequirements?.filter((req: any) => req.status === 'pending').length > 0 && (
                              <Grid item xs={12}>
                                <Card sx={{ p: 3, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.light' }}>
                                  <Typography variant="h6" sx={{ mb: 1 }}>
                                    📋 {selectedPatient.medicalRequirements?.filter((req: any) => req.status === 'pending').length} Pending Requirements
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Check the "Documents" tab below to view all requirements and their completion status.
                                  </Typography>
                                </Card>
                              </Grid>
                            )}
                            
                            {selectedPatient.medicalRequirements?.filter((req: any) => req.status === 'pending').length === 0 && (
                              <Grid item xs={12}>
                                <Card sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
                                  <Assignment sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No Pending Requirements
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    All requirements have been completed or none have been ordered yet.
                                  </Typography>
                                </Card>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}

                      {/* Completed Documents Tab */}
                      {documentsTab === 1 && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Completed Documents & Reports
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                startIcon={<WhatsApp />}
                                onClick={() => {
                                  // Collect all available documents
                                  const allDocs = [];
                                  
                                  // Add completed requirements
                                  if (selectedPatient.medicalRequirements) {
                                    selectedPatient.medicalRequirements
                                      .filter((req: any) => req.status === 'completed')
                                      .forEach((req: any) => allDocs.push({
                                        id: req.id,
                                        title: req.title,
                                        type: 'requirement',
                                        content: req.description,
                                        completedDate: req.completedDate,
                                        orderedBy: req.orderedBy,
                                        fileType: req.type === 'lab' ? 'PDF Report' : 
                                                 req.type === 'imaging' ? 'DICOM Image + PDF' : 
                                                 req.type === 'cardiac' ? 'PDF Report' : 'Medical Document'
                                      }));
                                  }
                                  
                                  // Add sample documents for patient-1
                                  if (selectedPatient.id === 'patient-1') {
                                    allDocs.push(
                                      {
                                        id: 'sample-lab',
                                        title: 'Lab Results - CBC',
                                        type: 'sample',
                                        content: 'Complete Blood Count (CBC) showing normal values',
                                        completedDate: '2024-01-15',
                                        orderedBy: 'Dr. Ahmed Hassan',
                                        fileType: 'PDF Laboratory Report'
                                      },
                                      {
                                        id: 'sample-xray',
                                        title: 'X-Ray Report - Chest',
                                        type: 'sample',
                                        content: 'Chest X-Ray showing clear lungs, no abnormalities',
                                        completedDate: '2023-12-10',
                                        orderedBy: 'Dr. Sarah Ahmed',
                                        fileType: 'DICOM Image + PDF Report'
                                      },
                                      {
                                        id: 'sample-insurance',
                                        title: 'Insurance Card',
                                        type: 'sample',
                                        content: 'Egyptian General Insurance Card - Active Coverage',
                                        completedDate: 'On File',
                                        orderedBy: 'Reception',
                                        fileType: 'Scanned PDF Document'
                                      }
                                    );
                                  }
                                  
                                  setSelectedDocumentsForShare(allDocs);
                                  setWhatsappMessage(`Hi! I'm sharing medical documents for ${selectedPatient.name}. Please find the attached files.`);
                                  setWhatsappDialogOpen(true);
                                }}
                                size="small"
                                sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#1DA851' } }}
                              >
                                Share All
                              </Button>
                              <Button 
                                variant="outlined" 
                                startIcon={<AttachFile />}
                                onClick={() => setUploadDocumentOpen(true)}
                              >
                                Upload Document
                              </Button>
                            </Box>
                          </Box>
                      
                                             <Grid container spacing={2}>
                             {/* All Requirements - Both Completed and Incomplete */}
                             {selectedPatient.medicalRequirements?.map((requirement: any, index: number) => (
                               <Grid item xs={12} sm={6} md={4} key={`doc-${requirement.id || index}`}>
                                 <Card 
                                   sx={{ 
                                     p: 3, 
                                     cursor: 'pointer', 
                                     '&:hover': { boxShadow: 4 },
                                     border: '2px solid',
                                     borderColor: requirement.status === 'completed' ? 'success.light' : 'warning.light',
                                     backgroundColor: requirement.status === 'completed' ? 'success.50' : 'warning.50'
                                   }}
                                   onClick={() => {
                                     if (requirement.status === 'completed') {
                                       // Use uploaded files if available, otherwise use sample data
                                       const uploadedFile = requirement.uploadedFiles && requirement.uploadedFiles.length > 0 ? requirement.uploadedFiles[0] : null;
                                       setSelectedDocument({
                                         title: requirement.title,
                                         content: requirement.description,
                                         type: requirement.type,
                                         completedDate: requirement.completedDate,
                                         orderedBy: requirement.orderedBy,
                                         fileType: uploadedFile ? uploadedFile.type : (requirement.type === 'lab' ? 'PDF Report' : 
                                                  requirement.type === 'imaging' ? 'DICOM Image + PDF' : 
                                                  requirement.type === 'cardiac' ? 'PDF Report' : 'Medical Document'),
                                         // Use uploaded file URL if available, otherwise sample data
                                         fileUrl: uploadedFile ? uploadedFile.url : (requirement.type === 'imaging' ? 
                                           'https://via.placeholder.com/600x400/e8f5e8/2e7d32?text=X-Ray+Results' :
                                           'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDscO1w7zDtsO+CjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihNZWRpY2FsIFJlcG9ydCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKMDAwMDAwMDMwMSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjM5OQolJUVPRg=='),
                                         uploadedFiles: requirement.uploadedFiles || []
                                       });
                                       setDocumentViewerOpen(true);
                                                                           } else {
                                        // Open upload dialog for incomplete requirements
                                        setSelectedRequirementForUpload(requirement);
                                        setUploadDialogOpen(true);
                                        setUploadedFiles([]);
                                      }
                                   }}
                                 >
                                   <Box sx={{ textAlign: 'center', mb: 2 }}>
                                     {requirement.type === 'lab' && <Science sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />}
                                     {requirement.type === 'imaging' && <Assignment sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />}
                                     {requirement.type === 'cardiac' && <LocalHospital sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />}
                                     {!['lab', 'imaging', 'cardiac'].includes(requirement.type) && <Assignment sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />}
                                   </Box>
                                   
                                   <Typography variant="body1" fontWeight={600} sx={{ mb: 1, textAlign: 'center' }}>
                                     {requirement.title}
                                   </Typography>
                                   
                                   {/* Status-specific content */}
                                   {requirement.status === 'completed' ? (
                                     <Box sx={{ mb: 2, p: 1, backgroundColor: 'success.100', borderRadius: 1 }}>
                                       <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600, display: 'block' }}>
                                         📋 COMPLETED RESULTS - Click to View
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Content:</strong> {requirement.description}
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Type:</strong> {requirement.type === 'lab' ? 'PDF Laboratory Report' : requirement.type === 'imaging' ? 'DICOM Image + PDF Report' : requirement.type === 'cardiac' ? 'PDF Cardiac Report' : 'Medical Document'}
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Completed:</strong> {requirement.completedDate ? new Date(requirement.completedDate).toLocaleDateString() : 'Recently'}
                                       </Typography>
                                       {requirement.orderedBy && (
                                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                           <strong>Ordered By:</strong> {requirement.orderedBy}
                                         </Typography>
                                       )}
                                     </Box>
                                   ) : (
                                     <Box sx={{ mb: 2, p: 1, backgroundColor: 'warning.100', borderRadius: 1 }}>
                                       <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                         📤 CLICK TO UPLOAD DOCUMENTS
                                       </Typography>
                                       
                                       {/* Progress Bar */}
                                       <Box sx={{ mb: 2 }}>
                                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                           Progress: 25% Complete
                                         </Typography>
                                         <LinearProgress 
                                           variant="determinate" 
                                           value={25} 
                                           color="warning"
                                           sx={{ 
                                             height: 8, 
                                             borderRadius: 4,
                                             backgroundColor: 'grey.200'
                                           }}
                                         />
                                       </Box>
                                       
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Required:</strong> {requirement.description}
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Ordered:</strong> {requirement.dateOrdered ? new Date(requirement.dateOrdered).toLocaleDateString() : 'Recently'}
                                       </Typography>
                                       {requirement.orderedBy && (
                                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                           <strong>By:</strong> {requirement.orderedBy}
                                         </Typography>
                                       )}
                                       {requirement.dueDate && (
                                         <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, display: 'block' }}>
                                           <strong>Due:</strong> {new Date(requirement.dueDate).toLocaleDateString()}
                                         </Typography>
                                       )}
                                     </Box>
                                   )}
                                   
                                   <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                                     <Chip 
                                       label={requirement.status === 'completed' ? 'Completed' : 'Incomplete'} 
                                       size="small" 
                                       color={requirement.status === 'completed' ? 'success' : 'warning'} 
                                     />
                                     <Chip 
                                       label={requirement.priority || 'normal'} 
                                       size="small" 
                                       variant="outlined"
                                       color={
                                         requirement.priority === 'urgent' ? 'error' :
                                         requirement.priority === 'high' ? 'warning' : 'default'
                                       }
                                     />
                                   </Box>
                                   
                                   {/* Action Buttons */}
                                   <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                     <IconButton
                                       size="small"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         if (requirement.status === 'completed') {
                                           // Share individual document
                                           const docData = {
                                             id: requirement.id,
                                             title: requirement.title,
                                             type: 'requirement',
                                             content: requirement.description,
                                             completedDate: requirement.completedDate,
                                             orderedBy: requirement.orderedBy,
                                             fileType: requirement.type === 'lab' ? 'PDF Report' : 
                                                      requirement.type === 'imaging' ? 'DICOM Image + PDF' : 
                                                      requirement.type === 'cardiac' ? 'PDF Report' : 'Medical Document'
                                           };
                                           setSelectedDocumentsForShare([docData]);
                                           setWhatsappMessage(`Hi! I'm sharing a medical document: ${requirement.title} for ${selectedPatient.name}.`);
                                           setWhatsappDialogOpen(true);
                                         }
                                       }}
                                       sx={{ 
                                         color: '#25D366',
                                         '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.1)' },
                                         display: requirement.status === 'completed' ? 'flex' : 'none'
                                       }}
                                       title="Share via WhatsApp"
                                     >
                                       <WhatsApp fontSize="small" />
                                     </IconButton>
                                     <IconButton
                                       size="small"
                                       onClick={async (e) => {
                                         e.stopPropagation();
                                         if (confirm(`Are you sure you want to delete "${requirement.title}"?`)) {
                                           // Remove from patient's requirements
                                           const updatedRequirements = selectedPatient.medicalRequirements.filter((req: any) => req.id !== requirement.id);
                                           const updatedPatient = { ...selectedPatient, medicalRequirements: updatedRequirements };
                                           setSelectedPatient(updatedPatient);
                                           
                                           // Update the main patients list
                                           const updatedPatients = enhancedPatients.map(patient =>
                                             patient.id === selectedPatient.id ? updatedPatient : patient
                                           );
                                           setEnhancedPatients(updatedPatients);

                                           // ✅ CRITICAL FIX: Save the updated patient to Firebase to persist deletion
                                           try {
                                             const { getOptimizedFirestore } = await import('@lib/firebase/legacy-compat');
                                             const db = await getOptimizedFirestore();
                                             if (db) {
                                               const { doc, setDoc } = await import('firebase/firestore');
                                               const patientRef = doc(db, 'patients', selectedPatient.id);
                                               await setDoc(patientRef, {
                                                 ...updatedPatient,
                                                 updatedAt: new Date().toISOString()
                                               }, { merge: true });
                                               console.log('✅ Patient medical requirement deletion saved to Firebase:', selectedPatient.id);
                                             }
                                           } catch (error) {
                                             console.error('❌ Error saving patient deletion to Firebase:', error);
                                           }
                                         }
                                       }}
                                       sx={{ 
                                         color: 'error.main',
                                         '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                                       }}
                                       title="Delete Document"
                                     >
                                       <Delete fontSize="small" />
                                     </IconButton>
                                   </Box>
                                 </Card>
                               </Grid>
                             ))}
                             
                             {/* Patient-specific sample documents - only for specific patients */}
                             {selectedPatient.id === 'patient-1' && (
                               <>
                                 <Grid item xs={12} sm={6} md={4}>
                                   <Card 
                                     sx={{ 
                                       p: 3, 
                                       cursor: 'pointer', 
                                       '&:hover': { boxShadow: 4 },
                                       border: '2px solid',
                                       borderColor: 'success.light',
                                       backgroundColor: 'success.50'
                                     }}
                                     onClick={() => {
                                       setSelectedDocument({
                                         title: 'Lab Results - CBC',
                                         content: 'Complete Blood Count (CBC) showing normal values',
                                         type: 'lab',
                                         completedDate: '2024-01-15',
                                         orderedBy: 'Dr. Ahmed Hassan',
                                         fileType: 'PDF Laboratory Report',
                                         fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDscO1w7zDtsO+CjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8Ci9MZW5ndGggODQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihMYWJvcmF0b3J5IFJlcG9ydCAtIENvbXBsZXRlIEJsb29kIENvdW50KSBUagowIDYwIFRkCihXaGl0ZSBCbG9vZCBDZWxsczogNy41Lzg3LzEwXjkpIFRqCjAgLTYwIFRkCihSZWQgQmxvb2QgQ2VsbHM6IDQuNS01LjUgbWlsbGlvbi9VTCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKMDAwMDAwMDM0MSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQzOQolJUVPRg=='
                                       });
                                       setDocumentViewerOpen(true);
                                     }}
                                   >
                                     <Box sx={{ textAlign: 'center', mb: 2 }}>
                                       <Science sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                     </Box>
                                     <Typography variant="body1" fontWeight={600} sx={{ mb: 1, textAlign: 'center' }}>
                                       Lab Results - CBC
                                     </Typography>
                                     <Box sx={{ mb: 2, p: 1, backgroundColor: 'success.100', borderRadius: 1 }}>
                                       <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600, display: 'block' }}>
                                         📋 COMPLETED RESULTS - Click to View
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Content:</strong> Complete Blood Count showing normal values
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Type:</strong> PDF Laboratory Report
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Date:</strong> Jan 15, 2024
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Ordered By:</strong> Dr. Ahmed Hassan
                                       </Typography>
                                     </Box>
                                     <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                       <Chip label="Completed" size="small" color="success" />
                                       <Chip label="normal" size="small" variant="outlined" />
                                     </Box>
                                   </Card>
                                 </Grid>
                                 
                                 <Grid item xs={12} sm={6} md={4}>
                                   <Card 
                                     sx={{ 
                                       p: 3, 
                                       cursor: 'pointer', 
                                       '&:hover': { boxShadow: 4 },
                                       border: '2px solid',
                                       borderColor: 'success.light',
                                       backgroundColor: 'success.50'
                                     }}
                                     onClick={() => {
                                       setSelectedDocument({
                                         title: 'X-Ray Report - Chest',
                                         content: 'Chest X-Ray showing clear lungs, no abnormalities',
                                         type: 'imaging',
                                         completedDate: '2023-12-10',
                                         orderedBy: 'Dr. Sarah Ahmed',
                                         fileType: 'DICOM Image + PDF Report',
                                         fileUrl: 'https://via.placeholder.com/600x400/e8f5e8/2e7d32?text=Chest+X-Ray+Normal'
                                       });
                                       setDocumentViewerOpen(true);
                                     }}
                                   >
                                     <Box sx={{ textAlign: 'center', mb: 2 }}>
                                       <Assignment sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                     </Box>
                                     <Typography variant="body1" fontWeight={600} sx={{ mb: 1, textAlign: 'center' }}>
                                       X-Ray Report - Chest
                                     </Typography>
                                     <Box sx={{ mb: 2, p: 1, backgroundColor: 'success.100', borderRadius: 1 }}>
                                       <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600, display: 'block' }}>
                                         📋 COMPLETED RESULTS - Click to View
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Content:</strong> Chest X-Ray showing clear lungs, no abnormalities
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Type:</strong> DICOM Image + PDF Report
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Date:</strong> Dec 10, 2023
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Ordered By:</strong> Dr. Sarah Ahmed
                                       </Typography>
                                     </Box>
                                     <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                       <Chip label="Completed" size="small" color="success" />
                                       <Chip label="normal" size="small" variant="outlined" />
                                     </Box>
                                   </Card>
                                 </Grid>
                                 
                                 <Grid item xs={12} sm={6} md={4}>
                                   <Card 
                                     sx={{ 
                                       p: 3, 
                                       cursor: 'pointer', 
                                       '&:hover': { boxShadow: 4 },
                                       border: '2px solid',
                                       borderColor: 'info.light',
                                       backgroundColor: 'info.50'
                                     }}
                                     onClick={() => {
                                       setSelectedDocument({
                                         title: 'Insurance Card',
                                         content: 'Egyptian General Insurance Card - Active Coverage',
                                         type: 'document',
                                         completedDate: 'On File',
                                         orderedBy: 'Reception',
                                         fileType: 'Scanned PDF Document',
                                         fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDscO1w7zDtsO+CjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8Ci9MZW5ndGggNjQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihJbnN1cmFuY2UgQ2FyZCAtIEVneXB0aWFuIEdlbmVyYWwpIFRqCjAgLTYwIFRkCihBY3RpdmUgQ292ZXJhZ2UpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjA3IDAwMDAwIG4gCjAwMDAwMDAzMjEgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTkKJSVFT0Y='
                                       });
                                       setDocumentViewerOpen(true);
                                     }}
                                   >
                                     <Box sx={{ textAlign: 'center', mb: 2 }}>
                                       <AttachFile sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                                     </Box>
                                     <Typography variant="body1" fontWeight={600} sx={{ mb: 1, textAlign: 'center' }}>
                                       Insurance Card
                                     </Typography>
                                     <Box sx={{ mb: 2, p: 1, backgroundColor: 'info.100', borderRadius: 1 }}>
                                       <Typography variant="caption" color="info.dark" sx={{ fontWeight: 600, display: 'block' }}>
                                         📄 DOCUMENT ON FILE - Click to View
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Content:</strong> Egyptian General Insurance Card - Active Coverage
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Type:</strong> Scanned PDF Document
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Status:</strong> Active Coverage
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                         <strong>Uploaded By:</strong> Reception
                                       </Typography>
                                     </Box>
                                     <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                       <Chip label="On File" size="small" color="info" />
                                       <Chip label="active" size="small" variant="outlined" color="success" />
                                     </Box>
                                   </Card>
                                 </Grid>
                               </>
                             )}
                         
                         {/* Empty state for patients with no documents */}
                         {(!selectedPatient.medicalRequirements || selectedPatient.medicalRequirements.filter((req: any) => req.status === 'completed').length === 0) && 
                          (!selectedPatient.documents || selectedPatient.documents.length === 0) && 
                          selectedPatient.id !== 'patient-1' && (
                           <Grid item xs={12}>
                             <Card sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
                               <AttachFile sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                               <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                 No Documents Available
                               </Typography>
                               <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                 No completed medical documents, lab results, or uploaded files for this patient yet.
                               </Typography>
                               <Button 
                                 variant="outlined" 
                                 startIcon={<Add />}
                                 onClick={() => setAddRequirementOpen(true)}
                               >
                                 Add Medical Requirement
                               </Button>
                             </Card>
                           </Grid>
                         )}

                         {/* Uploaded documents */}
                         {selectedPatient.documents?.map((doc: any) => (
                           <Grid item xs={12} sm={6} md={4} key={doc.id}>
                             <Card 
                               sx={{ p: 3, textAlign: 'center', cursor: 'pointer', "&:hover": { boxShadow: 4 } }}
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
                               <Chip label="Uploaded" size="small" color="success" sx={{ mt: 1 }} />
                             </Card>
                           </Grid>
                         ))}

                            {/* No Documents Message */}
                            {(!selectedPatient.documents || selectedPatient.documents.length === 0) && (
                              <Grid item xs={12}>
                                <Card sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
                                  <AttachFile sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No Documents Uploaded
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Upload completed test results, reports, and other medical documents.
                                  </Typography>
                                  <Button 
                                    variant="outlined" 
                                    startIcon={<AttachFile />}
                                    onClick={() => setUploadDocumentOpen(true)}
                                  >
                                    Upload First Document
                                  </Button>
                                </Card>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}
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
              setNewPatientData(defaultNewPatientData);
            }}
            maxWidth="lg"
            fullWidth
            sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)', 
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
                    onChange={(e) => setNewPatientData({ ...newPatientData, age: parseInt(e.target.value) || 0 })}
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
                  <FormControl fullWidth>
                    <InputLabel>Assigned Doctor</InputLabel>
                    <Select
                      value={newPatientData.doctorId || ''}
                      onChange={(e) => {
                        const selectedDoctorId = e.target.value as string;
                        const selectedDoctor = availableDoctors.find(d => d.id === selectedDoctorId);
                        if (selectedDoctor) {
                          setNewPatientData({ 
                            ...newPatientData, 
                            doctorId: selectedDoctorId,
                            doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
                            doctor: selectedDoctorId // Firebase ID
                          });
                        } else {
                          setNewPatientData({ 
                            ...newPatientData, 
                            doctorId: '',
                            doctorName: '',
                            doctor: ''
                          });
                        }
                      }}
                      label="Assigned Doctor"
                    >
                      <MenuItem value="">
                        <em>No doctor assigned</em>
                      </MenuItem>
                      {availableDoctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {`${doctor.firstName || 'Dr.'} ${doctor.lastName || 'Unknown'}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                  <FormControl fullWidth>
                    <InputLabel>Assigned Doctor</InputLabel>
                    <Select
                      value={editingPatient?.doctorId || editingPatient?.doctor || ''}
                      onChange={(e) => {
                        const selectedDoctorId = e.target.value as string;
                        const selectedDoctor = availableDoctors.find(d => d.id === selectedDoctorId);
                        if (selectedDoctor) {
                          setEditingPatient({ 
                            ...editingPatient, 
                            doctorId: selectedDoctorId,
                            doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
                            doctor: selectedDoctorId // Firebase ID
                          });
                        } else {
                          setEditingPatient({ 
                            ...editingPatient, 
                            doctorId: '',
                            doctorName: '',
                            doctor: ''
                          });
                        }
                      }}
                      label="Assigned Doctor"
                    >
                      <MenuItem value="">
                        <em>No doctor assigned</em>
                      </MenuItem>
                      {availableDoctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {`${doctor.firstName || 'Dr.'} ${doctor.lastName || 'Unknown'}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
            onClose={() => {
              setUploadDocumentOpen(false);
              setDocumentTitle('');
              setCustomDocumentType('');
              setShowCustomInput(false);
              setSelectedFile(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFile color="primary" />
                Upload Document
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* ✅ NEW: Enhanced Document Type Dropdown */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      value={documentTitle}
                      label="Document Type"
                      onChange={(e) => {
                        const value = e.target.value;
                        setDocumentTitle(value);
                        setShowCustomInput(value === 'Other');
                        if (value !== 'Other') {
                          setCustomDocumentType('');
                        }
                      }}
                    >
                      {predefinedDocumentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {type === 'Lab Report' && <Science sx={{ fontSize: 18, color: '#4caf50' }} />}
                            {type === 'X-Ray' && <LocalHospital sx={{ fontSize: 18, color: '#2196f3' }} />}
                            {(type === 'CT Scan' || type === 'MRI Scan') && <MedicalServices sx={{ fontSize: 18, color: '#9c27b0' }} />}
                            {type === 'Blood Test' && <Bloodtype sx={{ fontSize: 18, color: '#f44336' }} />}
                            {type === 'Prescription' && <LocalPharmacy sx={{ fontSize: 18, color: '#ff9800' }} />}
                            {type === 'Medical Certificate' && <Description sx={{ fontSize: 18, color: '#795548' }} />}
                            {!['Lab Report', 'X-Ray', 'CT Scan', 'MRI Scan', 'Blood Test', 'Prescription', 'Medical Certificate'].includes(type) && 
                             <AttachFile sx={{ fontSize: 18, color: '#607d8b' }} />}
                            {type}
                          </Box>
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Add sx={{ fontSize: 18, color: '#00bcd4' }} />
                          Other (Custom Type)
                        </Box>
                      </MenuItem>
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Select from common document types or choose "Other" to add a custom type
                    </Typography>
                  </FormControl>
                </Grid>
                
                {/* ✅ NEW: Custom Document Type Input */}
                {showCustomInput && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom Document Type"
                      value={customDocumentType}
                      onChange={(e) => setCustomDocumentType(e.target.value)}
                      placeholder="Enter custom document type name"
                      helperText="This will be added to the dropdown for future use"
                      autoFocus
                    />
                  </Grid>
                )}
                
                {/* File Upload Section */}
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
                
                {/* File Info Section */}
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
                setCustomDocumentType('');
                setShowCustomInput(false);
              }}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUploadDocument}
                disabled={
                  !selectedFile || 
                  !documentTitle.trim() || 
                  (documentTitle === 'Other' && !customDocumentType.trim())
                }
                startIcon={<CloudUpload />}
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
                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                    {viewingDocument.type === 'pdf' ? (
                      <iframe 
                        src={viewingDocument.fileUrl} 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title={viewingDocument.fileName}
                      />
                    ) : viewingDocument.type === 'image' ? (
                      <img 
                        src={viewingDocument.fileUrl} 
                        alt={viewingDocument.fileName}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center', p: 4 }}>
                        <InsertDriveFile sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                          Document Preview Not Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          This file type cannot be previewed directly. You can download it to view.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => {
                            // Create download link
                            const link = document.createElement('a');
                            link.href = viewingDocument.fileUrl;
                            link.download = viewingDocument.fileName;
                            link.click();
                          }}
                        >
                          Download File
                        </Button>
                      </Box>
                    )}
                  </Box>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* ✅ NEW: Upload Medical Requirement Document Dialog */}
          <Dialog
            open={uploadDialogOpen}
            onClose={() => {
              setUploadDialogOpen(false);
              setUploadedFiles([]);
              setSelectedRequirementForUpload(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUpload color="primary" />
                Upload Documents for: {selectedRequirementForUpload?.title || 'Medical Requirement'}
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedRequirementForUpload && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                  <Typography variant="subtitle2" color="info.main">
                    {selectedRequirementForUpload.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequirementForUpload.description}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
                mb: 2
              }}>
                <input
                  type="file"
                  hidden
                  id="requirement-file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      setUploadedFiles(prev => [...prev, ...files]);
                    }
                  }}
                />
                <label htmlFor="requirement-file-upload" style={{ cursor: 'pointer' }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1">
                    Click to upload files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PDF, Images, Word documents (Multiple files allowed)
                  </Typography>
                </label>
              </Box>
              
              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Uploaded Files ({uploadedFiles.length}):
                  </Typography>
                  <List dense>
                    {uploadedFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{ 
                          bgcolor: 'grey.50', 
                          borderRadius: 1, 
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      >
                        <ListItemAvatar>
                          {file.type.includes('image') ? (
                            <Image sx={{ color: '#4caf50' }} />
                          ) : file.type.includes('pdf') ? (
                            <PictureAsPdf sx={{ color: '#f44336' }} />
                          ) : (
                            <Description sx={{ color: '#2196f3' }} />
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => {
                              setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Upload the completed documents for this medical requirement. 
                Once uploaded, the requirement status will be marked as completed.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setUploadDialogOpen(false);
                setUploadedFiles([]);
                setSelectedRequirementForUpload(null);
              }}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUploadRequirementDocument}
                disabled={uploadedFiles.length === 0 || !selectedRequirementForUpload}
                startIcon={<CloudUpload />}
              >
                Upload & Complete
              </Button>
            </DialogActions>
          </Dialog>

        </Container>
      </React.Fragment>
    ); };

export default PatientListPage;
