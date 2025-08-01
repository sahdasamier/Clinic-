import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { safeFirestore } from '../../api/firebaseDirect';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  LinearProgress,
  Badge,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  ListItemSecondaryAction,
  Snackbar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
// ✅ NEW: Use the new real-time data hooks instead of legacy systems
import {
  useGlobalData,
  useAppointments,
  usePatients,
  useRealtimeUpdates,
  useDashboardStats
} from '../../hooks/useGlobalData';
import {
  CalendarToday,
  Schedule,
  Person,
  EventAvailable,
  EventBusy,
  Groups,
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Phone,
  LocationOn,
  ExpandMore,
  TableView,
  ViewModule,
  DateRange,
  FilterList,
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule as ScheduleIcon,
  Search,
  Clear,
  Today,
  People,
  TrendingUp,
  BarChart,
  ViewWeek,
  Warning,
  MedicalServices,
  LocalHospital,
  Assignment,
} from '@mui/icons-material';



import { 
  AppointmentService,
  PatientService,
  PaymentService,
  ServiceUtils,
  type Appointment as FirestoreAppointment
} from '../../services';
import { createAutoPaymentForAppointment, createPayment } from '../../utils/paymentUtils';
import { globalDataSync } from '../../utils/globalDataSync';
import {
  appointmentTypesOptions,
  priorityLevels,
  type AppointmentData,
} from '../../data/mockData';
import FirebaseFriendlySync, { FirebaseDataBridge } from '../../utils/firebaseFriendlySync';
import { firebaseDataManager, type Appointment as FirebaseAppointment, type Payment as FirebasePayment } from '../../utils/firebaseDataManager';
import AutoSyncIndicator from '../../components/AutoSyncIndicator';
import AvailableTimeSlotsSelector from '../../components/AvailableTimeSlotsSelector';

// Doctor interface for Firestore data
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clinicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ✅ Use Firestore Appointment interface instead of legacy AppointmentData
type Appointment = FirestoreAppointment;

interface NewAppointment {
  patient: string;
  doctor: string;
  date: string;
  time: string;
  hour: string;
  minute: string;
  type: string;
  duration: number;
  priority: 'normal' | 'high' | 'urgent';
  location: string;
  notes: string;
  phone: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue';
}

interface FilterState {
  status: string;
  type: string;
  priority: string;
  completed: string;
  doctor: string;
}

// Constants
const APPOINTMENTS_STORAGE_KEY = 'clinic_appointments_data';

// Tab Panel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Legacy Functions - Use Firestore services instead
export const loadAppointmentsFromStorage = (): Appointment[] => {
  console.warn('⚠️ loadAppointmentsFromStorage is deprecated - use AppointmentService.listenAppointments instead');
  return [];
};

export const saveAppointmentsToStorage = (appointments: Appointment[]) => {
  console.warn('⚠️ saveAppointmentsToStorage is deprecated - use AppointmentService methods instead');
};



// Statistics Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => {
  const { t } = useTranslation();
  
  return (
    <Card sx={{ 
      height: '100%',
      background: 'linear-gradient(120deg, rgba(2, 0, 36, 0.08) 0%, rgba(9, 9, 121, 0.12) 35%, rgba(0, 212, 255, 0.08) 100%)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(9, 9, 121, 0.2)',
      borderRadius: { xs: 2, md: 3 },
      boxShadow: '0 4px 20px rgba(9, 9, 121, 0.1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        background: 'linear-gradient(120deg, rgba(2, 0, 36, 0.12) 0%, rgba(9, 9, 121, 0.18) 35%, rgba(0, 212, 255, 0.12) 100%)',
        boxShadow: '0 8px 32px rgba(9, 9, 121, 0.2)',
      },
      transition: 'all 0.3s ease'
    }}>
      <CardContent sx={{ 
        p: { xs: 2, md: 3 },
        textAlign: 'center'
      }}>
        <Box
          sx={{
            width: { xs: 40, md: 56 },
            height: { xs: 40, md: 56 },
            borderRadius: { xs: '12px', md: '16px' },
            background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          mb: 0.5, 
          color: 'primary.main',
          background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
        }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 1, 
          fontWeight: 600,
          fontSize: { xs: '0.8rem', md: '0.875rem' }
        }}>
          {t(title)}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{
            fontSize: { xs: '0.7rem', md: '0.75rem' }
          }}>
            {t(subtitle)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to map appointment payment status to payment status
const mapAppointmentPaymentStatusToPaymentStatus = (appointmentPaymentStatus: string): string => {
  switch (appointmentPaymentStatus) {
    case 'completed':
    case 'paid':
      return 'paid';
    case 'partial':
      return 'partial';
    case 'failed':
      return 'failed';
    case 'pending':
    default:
      return 'pending';
  }
};

// Main Component
const AppointmentListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, initialized } = useAuth();
  const { userProfile } = useUser();

  // ✅ NEW: Use real-time data hooks
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    stats: appointmentStats
  } = useAppointments();

  const {
    patients,
    loading: patientsLoading,
    error: patientsError
  } = usePatients();

  const dashboardStats = useDashboardStats();
  const { onDataUpdate, onConnectionChange } = useRealtimeUpdates();

  // ✅ NEW: Real-time update notifications
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // ✅ Legacy appointment state (for compatibility with existing code)
  const [appointmentList, setAppointmentList] = useState<Appointment[]>([]);
  const [firebaseAppointments, setFirebaseAppointments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);
  
  // Local UI state
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorStartTime] = useState('15:00');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: '',
    type: '',
    priority: '',
    completed: '',
    doctor: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewNotesOpen, setViewNotesOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusEditAppointment, setStatusEditAppointment] = useState<Appointment | null>(null);
  const [paymentStatusMenuAnchor, setPaymentStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [paymentStatusEditAppointment, setPaymentStatusEditAppointment] = useState<Appointment | null>(null);
  const [typeMenuAnchor, setTypeMenuAnchor] = useState<null | HTMLElement>(null);
  const [typeEditAppointment, setTypeEditAppointment] = useState<Appointment | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    patient: '',
    doctor: '',
    date: selectedDate,
    time: '',
    hour: '',
    minute: '',
    type: '',
    duration: 25,
    priority: 'normal',
    location: '',
    notes: '',
    phone: '',
    paymentStatus: 'pending'
  });

  // ✅ NEW: Listen for real-time updates
  useEffect(() => {
    const unsubscribeDataUpdate = onDataUpdate((collection, data) => {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      console.log(`📅 Appointments: Real-time update - ${collection} (${data.length} items)`);
    });

    const unsubscribeConnection = onConnectionChange((status) => {
      console.log(`🔄 Appointments: Connection status - ${status}`);
    });

    return () => {
      unsubscribeDataUpdate();
      unsubscribeConnection();
    };
  }, [onDataUpdate, onConnectionChange]);

  // ✅ NEW: Debug logging for new system
  useEffect(() => {
    console.log('📅 APPOINTMENTS (NEW SYSTEM): Data state', {
      user: !!user,
      userProfile: !!userProfile,
      appointmentsCount: appointments.length,
      patientsCount: patients.length,
      connectionStatus: dashboardStats.connectionStatus,
      isOnline: dashboardStats.isOnline,
      lastUpdate: lastUpdate?.toLocaleTimeString(),
      updateCount
    });
  }, [user, userProfile, appointments.length, patients.length, dashboardStats, lastUpdate, updateCount]);

  // ✅ Sync hook data with legacy appointmentList state
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setAppointmentList(appointments);
      setDataLoading(false);
      setFirebaseConnected(true);
    }
  }, [appointments]);

  // Reset time slot when doctor or date changes in new appointment form
  useEffect(() => {
    if (newAppointment.doctor || newAppointment.date) {
      setNewAppointment(prev => ({
        ...prev,
        hour: '',
        minute: '',
        time: ''
      }));
    }
  }, [newAppointment.doctor, newAppointment.date]);

  // ✅ NEW: Listen for appointment payment status sync events
  useEffect(() => {
    const handleAppointmentPaymentStatusSync = (event: CustomEvent) => {
      console.log('💚 Appointment page: Payment status synced from payment page:', event.detail);
      
      // Force refresh to get updated appointment data
      FirebaseDataBridge.refreshAll(userProfile.clinicId || 'demo-clinic');
      
      const { appointmentId, patient, paymentId, newStatus } = event.detail;
      console.log(`💰 Appointment page synced: Appointment ${appointmentId} payment ${paymentId} status → ${newStatus}`);
    };

    // Add event listeners
    window.addEventListener('paymentStatusChanged', handlePaymentStatusChange as EventListener);
    window.addEventListener('appointmentPaymentStatusSynced', handleAppointmentPaymentStatusSync as EventListener);

    // Cleanup on unmount
    return () => {
      console.log('💚 AppointmentListPage: Cleaning up event listeners...');
      window.removeEventListener('paymentStatusChanged', handlePaymentStatusChange as EventListener);
      window.removeEventListener('appointmentPaymentStatusSynced', handleAppointmentPaymentStatusSync as EventListener);
    };
  }, []);

  // ✅ FIREBASE DATA MANAGER - Real-time synchronization
  useEffect(() => {
    // ✅ FIXED: Restructure to avoid early returns and prevent hooks count mismatch
    console.log('🔥 Setting up Firebase Data Manager...');
    
    let dataManager: any = null;
    let paymentUpdateCleanup: (() => void) | null = null;

    if (userProfile?.clinicId) {
      console.log('🔥 Initializing Firebase Data Manager for appointments...');
      
      // Initialize Firebase Data Manager
      dataManager = firebaseDataManager.initialize({
        clinicId: userProfile.clinicId,
        userId: userProfile.id
      });
      
      // Listen to real-time appointment updates
      dataManager.addEventListener('appointments', (firebaseAppointments: FirebaseAppointment[]) => {
        console.log(`🔥 REALTIME: Received ${firebaseAppointments.length} appointments from Firebase Data Manager`);
        setFirebaseAppointments(firebaseAppointments);
        
        // Convert Firebase appointments to local format for UI compatibility
        const convertedAppointments = firebaseAppointments.map(convertFirebaseAppointmentToLocal);
        setAppointmentList(convertedAppointments);
        setDataLoading(false);
        setFirebaseConnected(true);
      });
      
      // Listen to payment-related events from other pages
      const handlePaymentUpdated = (event: CustomEvent) => {
        const { updates, appointmentId } = event.detail;
        console.log('🔄 Cross-page event: Payment updated from payments page', event.detail);
        
        if (appointmentId) {
          // Update appointment payment status based on payment status
          setAppointmentList(prev => prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, paymentStatus: updates.status || apt.paymentStatus }
              : apt
          ));
        }
      };
      
      // Add browser event listeners
      window.addEventListener('paymentUpdated', handlePaymentUpdated as EventListener);
      
      paymentUpdateCleanup = () => {
        window.removeEventListener('paymentUpdated', handlePaymentUpdated as EventListener);
      };
    } else {
      console.log('🔥 Firebase Data Manager: No clinic ID available, skipping initialization');
    }
    
    // Cleanup function - always returns a function
    return () => {
      if (paymentUpdateCleanup) {
        paymentUpdateCleanup();
      }
      console.log('🧹 Cleaned up Firebase Data Manager listeners');
    };
  }, [userProfile?.clinicId]);

  // ✅ HELPER: Convert Firebase appointment to local format
  const convertFirebaseAppointmentToLocal = (firebaseApt: FirebaseAppointment): Appointment => {
    return {
      id: firebaseApt.id,
      patient: firebaseApt.patient,
      patientId: firebaseApt.patientId,
      doctor: firebaseApt.doctor,
      doctorId: firebaseApt.doctorId,
      date: firebaseApt.date,
      time: firebaseApt.time,
      timeSlot: firebaseApt.timeSlot,
      type: firebaseApt.type,
      duration: firebaseApt.duration,
      priority: firebaseApt.priority,
      status: firebaseApt.status,
      paymentStatus: firebaseApt.paymentStatus,
      location: firebaseApt.location || '',
      notes: firebaseApt.notes || '',
      phone: firebaseApt.phone || '',
      completed: firebaseApt.status === 'completed',
      isActive: firebaseApt.isActive,
      clinicId: firebaseApt.clinicId,
      createdAt: firebaseApt.createdAt || new Date().toISOString(),
      updatedAt: firebaseApt.updatedAt || new Date().toISOString()
    };
  };

  // ✅ Listen for browser Firebase events (backup method)
  useEffect(() => {
    const handleFirebaseUpdate = (event: CustomEvent) => {
      console.log('💚 AppointmentListPage: Browser Firebase event received');
      const data = event.detail;
      
      if (data.appointments) {
        setAppointmentList(data.appointments);
      }
      
      if (data.patients) {
        setAvailablePatients(data.patients);
      }
      
      setDataLoading(false);
    };

    window.addEventListener('firebaseDataUpdate', handleFirebaseUpdate as EventListener);
    
    return () => {
      window.removeEventListener('firebaseDataUpdate', handleFirebaseUpdate as EventListener);
    };
  }, []);

  // ✅ Listen for global events and cleanup
  useEffect(() => {
    // Listen for mobile FAB action
    const handleOpenAddAppointment = () => {
      setAddAppointmentOpen(true);
    };

    // Listen for user data clearing
    const handleUserDataCleared = () => {
      // Reset to default state
      setAppointmentList([]);
      setAvailablePatients([]);
      setTabValue(0);
      setSearchQuery('');
      setActiveFilters({
        status: '',
        type: '',
        priority: '',
        completed: '',
        doctor: ''
      });
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setNewAppointment({
        patient: '',
        doctor: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        hour: '',
        minute: '',
        type: '',
        duration: 25,
        priority: 'normal',
        location: '',
        notes: '',
        phone: '',
        paymentStatus: 'pending'
      });
      setSelectedAppointment(null);
      setStatusEditAppointment(null);
      
      // Close all dialogs
      setAddAppointmentOpen(false);
      setEditDialogOpen(false);
      setViewNotesOpen(false);
      setFilterAnchor(null);
      setStatusMenuAnchor(null);
      
      // Set view mode to default
      setViewMode('table');
      
      console.log('✅ Appointments reset to default state');
    };

    window.addEventListener('userDataCleared', handleUserDataCleared);
    window.addEventListener('openAddAppointment', handleOpenAddAppointment);
    
    return () => {
      window.removeEventListener('userDataCleared', handleUserDataCleared);
      window.removeEventListener('openAddAppointment', handleOpenAddAppointment);
    };
  }, []);

  // ✅ Real-time Firestore listener for doctors
  useEffect(() => {
    const clinicId = userProfile?.clinicId;
    
    if (!clinicId) {
      console.log('🔄 AppointmentListPage: Waiting for clinicId...');
      return;
    }

    console.log('🔄 AppointmentListPage: Setting up real-time doctor listener for clinic:', clinicId);

        // ✅ Use direct Firebase access
    const setupListener = async () => {
      try {
        const usersCollection = await safeFirestore.collection('users');
        const q = await safeFirestore.query(
          usersCollection,
          safeFirestore.where('clinicId', '==', clinicId),
          safeFirestore.where('role', '==', 'doctor'),
          safeFirestore.where('isActive', '==', true)
        );

          const unsub = safeFirestore.onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Doctor[];
      setAvailableDoctors(list);
      console.log('✅ AppointmentListPage: Real-time doctors updated:', JSON.stringify({
        count: list.length,
        doctors: list.map(d => ({
          id: d.id,
          firstName: d.firstName,
          lastName: d.lastName,
          fullName: `${d.firstName} ${d.lastName}`,
          email: d.email
        }))
      }, null, 2));
      
             // Add global debug function for testing doctor resolution
       (window as any).debugDoctorIdMismatch = () => {
         console.log('🚨 DOCTOR ID MISMATCH ANALYSIS:');
         console.log('👩‍⚕️ Available Doctors:', JSON.stringify(list.map(d => ({
           id: d.id,
           name: `${d.firstName} ${d.lastName}`
         })), null, 2));
         
         console.log('📋 Appointment Doctor Data:', JSON.stringify(appointmentList.map(apt => ({
           appointmentId: apt.id,
           patient: apt.patient,
           doctorField: apt.doctor,
           doctorIdField: (apt as any).doctorId,
           isFirebaseId: apt.doctor ? isFirebaseId(apt.doctor) : false,
           isDoctorIdFirebaseId: (apt as any).doctorId ? isFirebaseId((apt as any).doctorId) : false
         })), null, 2));
         
         console.log('🔍 ID Match Analysis:');
         appointmentList.forEach(apt => {
           const doctorId = (apt as any).doctorId || apt.doctor;
           const matchingDoctor = list.find(d => d.id === doctorId);
           console.log(`Appointment ${apt.id}:`, JSON.stringify({
             searchingForId: doctorId,
             foundMatch: !!matchingDoctor,
             matchingDoctor: matchingDoctor ? {
               id: matchingDoctor.id,
               name: `${matchingDoctor.firstName} ${matchingDoctor.lastName}`
             } : null
           }, null, 2));
         });
       };

       (window as any).debugDoctorResolution = (appointmentId?: string) => {
        console.log('🔍 DEBUGGING DOCTOR RESOLUTION:', {
          availableDoctors: list.map(d => ({
            id: d.id,
            name: `${d.firstName} ${d.lastName}`
          })),
          sampleAppointment: appointmentList[0] ? {
            id: appointmentList[0].id,
            doctorField: appointmentList[0].doctor,
            doctorIdField: (appointmentList[0] as any).doctorId,
            resolvedName: getDoctorName(appointmentList[0])
          } : 'No appointments',
          appointmentToTest: appointmentId ? appointmentList.find(a => a.id === appointmentId) : null
        });
        
        if (appointmentId) {
          const apt = appointmentList.find(a => a.id === appointmentId);
          if (apt) {
            console.log('🎯 SPECIFIC APPOINTMENT RESOLUTION:', {
              appointmentId,
              doctorField: apt.doctor,
              doctorIdField: (apt as any).doctorId,
              resolvedName: getDoctorName(apt),
              matchingDoctor: list.find(d => d.id === (apt as any).doctorId || d.id === apt.doctor)
            });
          }
        }
      };
      
    }, (error) => {
      console.error('❌ AppointmentListPage: Error in doctor listener:', error);
      setAvailableDoctors([]);
    });

        return () => {
          console.log('🔄 AppointmentListPage: Cleaning up doctor listener');
          unsub();
        };
      } catch (error) {
        console.error('❌ AppointmentListPage: Failed to setup Firebase listener:', error);
        setAvailableDoctors([]);
        return () => {}; // Return empty cleanup function
      }
    };
    
    setupListener();
  }, [userProfile?.clinicId, appointmentList]);

  // ✅ Additional setup - placeholder for future enhancements
  useEffect(() => {
    // Future enhancements can go here
    console.log('✅ AppointmentListPage: Additional setup complete');
  }, []);

  // Event Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleAppointmentCompletion = async (appointmentId: string) => {
    const appointment = appointmentList.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    try {
      const wasCompleted = appointment.status === 'completed';
      const newStatus = wasCompleted ? 'confirmed' : 'completed';
      
      // ✅ Use Firestore service instead of localStorage
      await AppointmentService.updateAppointment(appointmentId, {
        status: newStatus,
        completed: newStatus === 'completed'
      });
      
      // If appointment is being marked as completed, create auto-payment
      if (newStatus === 'completed' && !wasCompleted) {
        await handleAppointmentCompletion(appointment);
        
        // ✅ ENHANCED: Explicitly trigger patient appointment field recalculation
        console.log('✅ Appointment completed - triggering patient field recalculation');
        window.dispatchEvent(new CustomEvent('appointmentCompleted', {
          detail: { 
            appointmentId: appointment.id,
            patientName: appointment.patient,
            patientId: appointment.patientId,
            appointmentDate: appointment.date,
            completedAt: new Date().toISOString()
          }
        }));
      }
      
      // ✅ State updates automatically via real-time listener!
      console.log('✅ Appointment completion status updated via Firestore');
    } catch (error) {
      console.error('❌ Error updating appointment completion:', error);
    }
  };

  const calculateEstimatedFinishTime = () => {
    const todayAppointments = appointmentList
      .filter(apt => apt.date === selectedDate && !apt.completed)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    if (todayAppointments.length === 0) return t('no_pending_appointments');

    const totalDuration = todayAppointments.reduce((sum, apt) => sum + apt.duration, 0);
    const startTime = new Date(`${selectedDate}T${doctorStartTime}`);
    const finishTime = new Date(startTime.getTime() + totalDuration * 60000);
    
    return finishTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const generateAvailableTimeSlots = () => {
    const slots = [];
    const startHour = 15; // 3 PM
    const endHour = 20; // 8 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 20) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        const isBooked = appointmentList.some(apt => 
          apt.date === selectedDate && apt.timeSlot === timeString
        );
        
        slots.push({
          value: timeString,
          label: displayTime,
          available: !isBooked
        });
      }
    }
    
    return slots;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F59E0B';
      case 'urgent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRemainingTime = () => {
    const pending = appointmentList.filter(apt => apt.date === selectedDate && !apt.completed);
    const totalMinutes = pending.reduce((sum, apt) => sum + apt.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}${t('hours_short')} ${minutes}${t('minutes_short')} ${t('remaining')}`;
    }
    return `${minutes}${t('minutes_short')} ${t('remaining')}`;
  };

  const handleFilterSelect = (filterType: string, filterValue: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: filterValue
    }));
    setFilterAnchor(null);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const timeParts = appointment.time?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    let hour = '';
    let minute = '';
    if (timeParts) {
      hour = timeParts[1];
      minute = timeParts[2];
      if (timeParts[3] && timeParts[3].toUpperCase() === 'PM' && hour !== '12') {
        hour = (parseInt(hour) + 12).toString();
      } else if (timeParts[3] && timeParts[3].toUpperCase() === 'AM' && hour === '12') {
        hour = '0';
      }
    }
    
    setNewAppointment({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      hour: hour,
      minute: minute,
      type: appointment.type,
      duration: appointment.duration,
      priority: appointment.priority,
      location: appointment.location || '',
      notes: appointment.notes || '',
      phone: appointment.phone || '',
      paymentStatus: (appointment as any).paymentStatus || 'pending'
    });
    setEditDialogOpen(true);
  };

  const handleViewNotes = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewNotesOpen(true);
  };

  const handleQuickStatusEdit = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation();
    setStatusEditAppointment(appointment);
    setStatusMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleQuickPaymentStatusEdit = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setPaymentStatusEditAppointment(appointment);
    setPaymentStatusMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleQuickTypeEdit = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    setTypeEditAppointment(appointment);
    setTypeMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!statusEditAppointment) return;

    try {
      const previousStatus = statusEditAppointment.status;
      
      // ✅ ENHANCED: Use AppointmentService for better error handling
      const updateData = {
        status: newStatus as any,
        completed: newStatus === 'completed'
      };

      await AppointmentService.updateAppointment(statusEditAppointment.id, updateData);
      
      // ✅ ENHANCED: Trigger automatic cross-page sync
      import('../../utils/globalDataSync').then(({ triggerAutomaticSync }) => {
        triggerAutomaticSync.appointment({ ...statusEditAppointment, ...updateData }, 'update');
      });
      
      console.log('✅ Appointment status updated via AppointmentService');
      
      // If appointment is being marked as completed, create auto-payment
      if (newStatus === 'completed' && previousStatus !== 'completed') {
        await handleAppointmentCompletion(statusEditAppointment);
        
        // ✅ ENHANCED: Explicitly trigger patient appointment field recalculation
        console.log('✅ Appointment completed - triggering patient field recalculation');
        window.dispatchEvent(new CustomEvent('appointmentCompleted', {
          detail: { 
            appointmentId: statusEditAppointment.id,
            patientName: statusEditAppointment.patient,
            patientId: statusEditAppointment.patientId,
            appointmentDate: statusEditAppointment.date,
            completedAt: new Date().toISOString()
          }
        }));
      }
      
      // ✅ NEW: Trigger Firebase Data Bridge refresh to sync across all pages
      console.log('✅ Triggering Firebase Data Bridge refresh after status change');
      FirebaseDataBridge.refreshAll(userProfile?.clinicId || 'demo-clinic');
      
      // ✅ State updates automatically via real-time listener!
      
      setStatusMenuAnchor(null);
      setStatusEditAppointment(null);
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      alert('Failed to update appointment status. Please try again.');
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!paymentStatusEditAppointment) return;

    try {
      // ✅ Use Firebase Data Manager with cross-page sync
      await firebaseDataManager.syncAppointmentPaymentStatus(
        paymentStatusEditAppointment.id,
        newPaymentStatus
      );
      
      // ✅ FIXED: Create or update corresponding payment record in Firebase
      try {
        const existingPayments = await PaymentService.getPayments(userProfile?.clinicId || 'demo-clinic');
        const linkedPayment = existingPayments.find(payment => 
          payment.patient === paymentStatusEditAppointment.patient
        );

        // Map appointment payment status to payment status
        const mappedStatus = mapAppointmentPaymentStatusToPaymentStatus(newPaymentStatus);

        if (linkedPayment) {
          // Update existing payment status
          await PaymentService.updatePayment(linkedPayment.id, {
            status: mappedStatus as any
          });
          console.log(`✅ Updated linked payment ${linkedPayment.id} status: ${newPaymentStatus} → ${mappedStatus}`);
        } else {
          // Create new payment record if none exists
          const paymentData = {
            patient: paymentStatusEditAppointment.patient,
            patientAvatar: paymentStatusEditAppointment.patient.split(' ').map(n => n[0]).join('').toUpperCase() || 'P',
            doctor: paymentStatusEditAppointment.doctor || 'Unknown Doctor',
            amount: 100, // Default amount - should be configurable
            currency: 'EGP',
            date: ServiceUtils.getToday(),
            dueDate: paymentStatusEditAppointment.date,
            status: mappedStatus === 'cancelled' ? 'pending' : mappedStatus as 'pending' | 'paid',
            method: 'cash',
            description: `Payment for ${paymentStatusEditAppointment.type} appointment`,
            category: 'consultation',
            insurance: 'No' as 'Yes' | 'No',
            insuranceAmount: 0,
            paidAmount: mappedStatus === 'paid' ? 100 : 0,
            includeVAT: false,
            vatRate: 0,
            vatAmount: 0,
            totalAmountWithVAT: 100,
            baseAmount: 100,
            appointmentId: paymentStatusEditAppointment.id
          };

          const newPayment = createPayment(paymentData);
          console.log(`✅ Created new payment ${newPayment.invoiceId} with status ${mappedStatus} (from appointment status ${newPaymentStatus})`);
        }
      } catch (paymentError) {
        console.error('❌ Error syncing payment record:', paymentError);
        // Don't fail the appointment update if payment sync fails
      }
      
      // ✅ SIMPLIFIED: Firebase handles real-time sync automatically
      console.log('✅ Payment status updated in Firebase - real-time listeners will handle sync');
      
      // ✅ State updates automatically via real-time listener!
      console.log('✅ Payment status updated via Firestore and synced across pages');
      
      setPaymentStatusMenuAnchor(null);
      setPaymentStatusEditAppointment(null);
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
    }
  };

  const handleTypeChange = async (newType: string) => {
    if (!typeEditAppointment) return;

    try {
      // ✅ Use Firestore service instead of localStorage
      await AppointmentService.updateAppointment(typeEditAppointment.id, {
        type: newType
      });
      
      // ✅ NEW: Trigger Firebase Data Bridge refresh to sync across all pages  
      console.log('✅ Triggering Firebase Data Bridge refresh after type change');
      FirebaseDataBridge.refreshAll(userProfile?.clinicId || 'demo-clinic');
      
      // ✅ State updates automatically via real-time listener!
      console.log('✅ Appointment type updated via Firestore');
      
      setTypeMenuAnchor(null);
      setTypeEditAppointment(null);
    } catch (error) {
      console.error('❌ Error updating appointment type:', error);
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setRescheduleAppointment(appointment);
    setRescheduleData({ 
      date: appointment.date, 
      time: appointment.time 
    });
    setRescheduleDialogOpen(true);
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleAppointment || !rescheduleData.date || !rescheduleData.time) {
      alert('Please fill in both date and time');
      return;
    }

    try {
      // Generate timeSlot from time
      const timeSlot = rescheduleData.time.includes(':') 
        ? rescheduleData.time 
        : `${rescheduleData.time}:00`;

      await AppointmentService.rescheduleAppointment(
        rescheduleAppointment.id,
        rescheduleData.date,
        rescheduleData.time,
        timeSlot
      );

      console.log('✅ Appointment rescheduled successfully');
      setRescheduleDialogOpen(false);
      setRescheduleAppointment(null);
      setRescheduleData({ date: '', time: '' });

      // ✅ ENHANCED: Trigger patient appointment field recalculation
      window.dispatchEvent(new CustomEvent('appointmentRescheduled', {
        detail: { 
          appointmentId: rescheduleAppointment.id,
          patientName: rescheduleAppointment.patient,
          patientId: rescheduleAppointment.patientId,
          oldDate: rescheduleAppointment.date,
          newDate: rescheduleData.date,
          newTime: rescheduleData.time
        }
      }));

      // ✅ Trigger Firebase Data Bridge refresh to sync across all pages
      FirebaseDataBridge.refreshAll(userProfile?.clinicId || 'demo-clinic');
    } catch (error) {
      console.error('❌ Error rescheduling appointment:', error);
      alert('Failed to reschedule appointment. Please try again.');
    }
  };

  // Handle appointment completion and auto-payment creation
  const handleAppointmentCompletion = async (appointment: Appointment) => {
    try {
      console.log(`🏥 Creating payment for completed appointment: ${appointment.id}`);
      
      // ✅ Use the new Firebase auto-payment creation function
      const paymentParams = {
        clinicId: userProfile!.clinicId,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient,
        patientAvatar: appointment.patient.split(' ').map(n => n[0]).join('').toUpperCase(),
        doctorName: appointment.doctor,
        appointmentType: appointment.type,
        appointmentDate: appointment.date,
        appointmentDuration: appointment.duration || 30,
        isCompleted: true
      };

      // Update appointment status to completed and create payment
      await firebaseDataManager.updateAppointment(appointment.id, {
        status: 'completed',
        completed: true,
        paymentStatus: 'paid'
      });

      // Create payment in Firebase
      const paymentData = {
        clinicId: userProfile!.clinicId,
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointmentId: appointment.id,
        amount: 200, // Default amount - should be configurable
        currency: 'EGP',
        status: 'paid' as const,
        date: new Date().toISOString().split('T')[0],
        dueDate: appointment.date,
        method: 'cash',
        description: `Payment for completed ${appointment.type || 'unknown'} appointment`,
        category: appointment.type ? appointment.type.toLowerCase() : 'general',
        invoiceId: `INV-${Date.now()}-${appointment.id.slice(-6)}`,
        paidAmount: 200,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 200,
        baseAmount: 200,
        insurance: 'No' as const,
        insuranceAmount: 0,
        isActive: true
      };

      const paymentId = await firebaseDataManager.createPayment(paymentData);
      console.log(`✅ Appointment completed and payment ${paymentId} created and marked as PAID`);
        
      // Dispatch custom event to notify Payment Management about new revenue
      window.dispatchEvent(new CustomEvent('appointmentCompletedWithPayment', {
        detail: {
          appointment,
          payment: paymentData,
          revenue: paymentData.amount
        }
      }));
    } catch (error) {
      console.error('❌ Error handling appointment completion:', error);
    }
  };

  const handleSaveAppointment = async () => {
    if (!newAppointment.patient || !newAppointment.doctor || !newAppointment.date || !newAppointment.time || !userProfile?.clinicId) {
      alert(t('fill_required_fields'));
      return;
    }

    try {
      const timeSlot = newAppointment.hour && newAppointment.minute 
        ? `${newAppointment.hour.padStart(2, '0')}:${newAppointment.minute.padStart(2, '0')}`
        : newAppointment.time;

      if (selectedAppointment) {
        // ✅ UPDATE: Use Firestore service with proper doctor handling
        console.log('🔍 APPOINTMENT UPDATE DEBUG:', {
          selectedDoctorName: newAppointment.doctor,
          originalAppointment: {
            id: selectedAppointment.id,
            doctor: selectedAppointment.doctor,
            doctorId: (selectedAppointment as any).doctorId
          }
        });

        // Find the correct doctor ID from the selected name
        const selectedDoctor = availableDoctors.find(d => 
          `${d.firstName} ${d.lastName}` === newAppointment.doctor ||
          `Dr. ${d.firstName} ${d.lastName}` === newAppointment.doctor
        );

        // ✅ ENHANCED: Update linked patient record when appointment patient details change
        const existingPatientId = (selectedAppointment as any).patientId;
        let updatedPatientId = existingPatientId;
        
        // ✅ DIAGNOSTIC: Log patient ID information for debugging
        console.log('🔍 PATIENT ID DIAGNOSTIC:', {
          appointmentId: selectedAppointment.id,
          originalPatientName: selectedAppointment.patient,
          newPatientName: newAppointment.patient,
          existingPatientId: existingPatientId,
          hasExistingPatientId: !!existingPatientId,
          patientNameChanged: newAppointment.patient !== selectedAppointment.patient,
          phoneChanged: newAppointment.phone !== selectedAppointment.phone
        });
        
        // If patient name or phone changed, update the patient record
        if (newAppointment.patient !== selectedAppointment.patient || newAppointment.phone !== selectedAppointment.phone) {
          console.log('🔄 Patient details changed, updating patient record...');
          console.log('📝 UPDATE DETAILS:', {
            from: { name: selectedAppointment.patient, phone: selectedAppointment.phone },
            to: { name: newAppointment.patient, phone: newAppointment.phone },
            existingPatientId: existingPatientId
          });
          
          updatedPatientId = await AppointmentService.ensurePatientExists(
            userProfile.clinicId,
            newAppointment.patient,
            newAppointment.phone,
            existingPatientId // Pass existing ID to update instead of create
          );
          
          console.log('✅ PATIENT UPDATE RESULT:', {
            originalPatientId: existingPatientId,
            updatedPatientId: updatedPatientId,
            patientIdChanged: updatedPatientId !== existingPatientId
          });
        }

        const updatedData = {
          patient: newAppointment.patient,
          patientId: updatedPatientId || existingPatientId, // Ensure we keep the patient ID
          doctor: newAppointment.doctor, // Store the NAME
          doctorId: selectedDoctor?.id || (selectedAppointment as any).doctorId, // Keep existing ID if doctor not found
          phone: newAppointment.phone,
          date: newAppointment.date,
          time: newAppointment.time,
          timeSlot: timeSlot,
          type: (newAppointment.type as 'consultation' | 'follow-up' | 'surgery' | 'emergency') || 'consultation',
          duration: newAppointment.duration,
          priority: (newAppointment.priority as 'high' | 'normal' | 'urgent') || 'normal',
          location: newAppointment.location || 'TBD',
          notes: newAppointment.notes || '',
          paymentStatus: (newAppointment.paymentStatus as 'pending' | 'paid' | 'partial' | 'overdue') || 'pending'
        };

        // ✅ Use AppointmentService for better error handling
        await AppointmentService.updateAppointment(selectedAppointment.id, updatedData);
        
        // ✅ ENHANCED: Trigger automatic cross-page sync
        import('../../utils/globalDataSync').then(({ triggerAutomaticSync }) => {
          triggerAutomaticSync.appointment({ ...selectedAppointment, ...updatedData }, 'update');
          // Also trigger patient sync if patient data was updated
          if (newAppointment.patient !== selectedAppointment.patient) {
            triggerAutomaticSync.patient({ 
              id: updatedPatientId, 
              name: newAppointment.patient,
              phone: newAppointment.phone 
            }, 'update');
          }
        });
        
        setEditDialogOpen(false);
        console.log('✅ Appointment updated via AppointmentService');
      } else {
        // ✅ CREATE: Use Firebase Data Manager with proper doctor handling
        console.log('🔍 APPOINTMENT CREATION DEBUG:', {
          selectedDoctorName: newAppointment.doctor,
          userProfileId: userProfile.id,
          availableDoctors: availableDoctors.map(d => ({
            id: d.id,
            name: `${d.firstName} ${d.lastName}`
          }))
        });

        // Find the correct doctor ID from the selected name
        const selectedDoctor = availableDoctors.find(d => 
          `${d.firstName} ${d.lastName}` === newAppointment.doctor ||
          `Dr. ${d.firstName} ${d.lastName}` === newAppointment.doctor
        );

        console.log('🎯 SELECTED DOCTOR MATCH:', {
          searchingFor: newAppointment.doctor,
          foundDoctor: selectedDoctor ? {
            id: selectedDoctor.id,
            firstName: selectedDoctor.firstName,
            lastName: selectedDoctor.lastName
          } : 'NOT FOUND'
        });

        // ✅ ENHANCED: Ensure patient exists before creating appointment
        const patientId = await AppointmentService.ensurePatientExists(
          userProfile.clinicId,
          newAppointment.patient,
          newAppointment.phone
        );

        // ✅ DIAGNOSTIC: Log patient creation details
        console.log('🆕 NEW APPOINTMENT - PATIENT CREATION:', {
          patientName: newAppointment.patient,
          patientPhone: newAppointment.phone,
          createdPatientId: patientId,
          hasValidPatientId: !!patientId && patientId !== 'legacy-patient'
        });

        const appointmentData = {
          clinicId: userProfile.clinicId,
          patient: newAppointment.patient,
          patientId: patientId || 'legacy-patient', // Use actual patient ID
          doctor: newAppointment.doctor, // Store the NAME, not ID
          doctorId: selectedDoctor?.id || 'unknown-doctor', // Store actual doctor ID for lookup
          phone: newAppointment.phone,
          date: newAppointment.date,
          time: newAppointment.time,
          timeSlot: timeSlot,
          type: (newAppointment.type as 'consultation' | 'follow-up' | 'surgery' | 'emergency') || 'consultation',
          duration: newAppointment.duration,
          priority: (newAppointment.priority as 'high' | 'normal' | 'urgent') || 'normal',
          location: newAppointment.location || 'TBD',
          notes: newAppointment.notes || '',
          status: 'confirmed' as const,
          paymentStatus: (newAppointment.paymentStatus as 'pending' | 'paid' | 'partial' | 'overdue') || 'pending',
          isActive: true
        };

        // ✅ Use AppointmentService for better error handling
        const appointmentId = await AppointmentService.createAppointment(userProfile.clinicId, appointmentData);
        
        // ✅ ENHANCED: Trigger automatic cross-page sync
        import('../../utils/globalDataSync').then(({ triggerAutomaticSync }) => {
          triggerAutomaticSync.appointment({ ...appointmentData, id: appointmentId }, 'create');
        });
        
        setAddAppointmentOpen(false);
        console.log('✅ Appointment created via AppointmentService');
        
        // ✅ Trigger global sync to notify other pages
        globalDataSync.triggerAppointmentSync(appointmentData);
      }

      // ✅ State updates automatically via real-time listener!
      // No manual setAppointmentList or saveAppointmentsToStorage needed!

      // Reset form
      setNewAppointment({
        patient: '',
        doctor: '',
        date: selectedDate,
        time: '',
        hour: '',
        minute: '',
        type: '',
        duration: 25,
        priority: 'normal',
        location: '',
        notes: '',
        phone: '',
        paymentStatus: 'pending'
      });
      setSelectedAppointment(null);

      alert('✅ Appointment saved successfully!');
    } catch (error) {
      console.error('❌ Error saving appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // ✅ Enhanced error handling for conflict scenarios
      if (errorMessage.includes('Conflict') || errorMessage.includes('conflicts with')) {
        alert(`🚫 ${t('appointment_conflict_title')}\n\n${errorMessage}\n\n${t('please_select_different_time')}`);
      } else {
        alert(`❌ ${t('failed_to_save_appointment')}: ${errorMessage}\n\n${t('please_try_again')}`);
      }
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: '',
      type: '',
      priority: '',
      completed: '',
      doctor: ''
    });
    setSearchQuery('');
    setFilterAnchor(null);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== '').length + (searchQuery ? 1 : 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'info';
      case 'no-show': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle fontSize="small" />;
      case 'pending': return <AccessTime fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'cancelled': return <Cancel fontSize="small" />;
      case 'rescheduled': return <Schedule fontSize="small" />;
      case 'no-show': return <Cancel fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed': return 'success';
      case 'partial': return 'warning';
      case 'failed': return 'error';
      case 'pending':
      default: return 'default';
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = searchQuery === '' || 
        (appointment.patient && appointment.patient.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (appointment.doctor && appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (appointment.type && appointment.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (appointment.phone && appointment.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = activeFilters.status === '' ||
        appointment.status === activeFilters.status;

      const matchesType = activeFilters.type === '' ||
        (appointment.type && appointment.type.toLowerCase().includes(activeFilters.type.toLowerCase()));

      const matchesPriority = activeFilters.priority === '' ||
        appointment.priority === activeFilters.priority;

      const matchesCompleted = activeFilters.completed === '' ||
        (activeFilters.completed === 'completed' && appointment.completed) ||
        (activeFilters.completed === 'pending' && !appointment.completed);

      const matchesDoctor = activeFilters.doctor === '' ||
        (appointment.doctor && appointment.doctor.toLowerCase().includes(activeFilters.doctor.toLowerCase()));

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesCompleted && matchesDoctor;
    });

    switch (tabValue) {
      case 1: // Today
        filtered = filtered.filter(apt => apt.date === selectedDate);
        break;
      case 2: // Pending
        filtered = filtered.filter(apt => !apt.completed);
        break;
      case 3: // Completed
        filtered = filtered.filter(apt => apt.completed);
        break;
      case 4: // Confirmed
        filtered = filtered.filter(apt => apt.status === 'confirmed');
        break;
      case 5: // Pending Confirmation
        filtered = filtered.filter(apt => apt.status === 'pending');
        break;
      case 6: // Cancelled
        filtered = filtered.filter(apt => apt.status === 'cancelled');
        break;
      case 7: // Rescheduled
        filtered = filtered.filter(apt => apt.status === 'rescheduled');
        break;
      case 8: // No-show
        filtered = filtered.filter(apt => apt.status === 'no-show');
        break;
      default: // All
        break;
    }

    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();
  const todayAppointments = appointments
    .filter(apt => apt.date === selectedDate)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) > new Date(selectedDate));
  const completedToday = todayAppointments.filter(apt => apt.completed).length;
  const pendingToday = todayAppointments.filter(apt => !apt.completed).length;

  // Show loading spinner while data is loading
  if (appointmentsLoading || patientsLoading) {
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
            Loading appointment data...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we load your appointment information
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show error alerts if there are data loading errors
  const hasErrors = appointmentsError || patientsError;

  // ✅ Helper function to get doctor name from appointment
  const getDoctorName = (appointment: any): string => {
    console.log('🔍 Resolving doctor name for appointment:', JSON.stringify({
      appointmentId: appointment.id,
      doctorField: appointment.doctor,
      doctorIdField: appointment.doctorId,
      availableDoctorsCount: availableDoctors.length,
      availableDoctorIds: availableDoctors.map(d => d.id),
      firstAvailableDoctor: availableDoctors[0] ? {
        id: availableDoctors[0].id,
        firstName: availableDoctors[0].firstName,
        lastName: availableDoctors[0].lastName
      } : null
    }, null, 2));

    // ✅ PRIORITY 1: Check if doctorField contains a valid Firebase ID first
    if (appointment.doctor && isFirebaseId(appointment.doctor)) {
      const doctor = availableDoctors.find(d => d.id === appointment.doctor);
      if (doctor) {
        const resolvedName = `${doctor.firstName} ${doctor.lastName}`;
        console.log('✅ PRIORITY 1 SUCCESS: Resolved doctorField Firebase ID to name:', JSON.stringify({
          id: appointment.doctor,
          resolvedName: resolvedName
        }, null, 2));
        return resolvedName;
      } else {
        console.log('❌ PRIORITY 1 FAILED: doctorField Firebase ID not found:', appointment.doctor);
      }
    }

    // ✅ PRIORITY 2: Check if doctorField has a readable name (not an ID)
    if (appointment.doctor && appointment.doctor.length < 50 && !isFirebaseId(appointment.doctor)) {
      console.log('✅ PRIORITY 2 SUCCESS: Using doctorField as name:', appointment.doctor);
      return appointment.doctor;
    }
    
    // ✅ PRIORITY 3: Check doctorId field for Firebase ID resolution (only as fallback)
    if (appointment.doctorId && isFirebaseId(appointment.doctorId)) {
      const doctor = availableDoctors.find(d => d.id === appointment.doctorId);
      if (doctor) {
        const resolvedName = `${doctor.firstName} ${doctor.lastName}`;
        console.log('✅ PRIORITY 3 SUCCESS: Resolved doctorId field Firebase ID to name:', JSON.stringify({
          id: appointment.doctorId,
          resolvedName: resolvedName
        }, null, 2));
        return resolvedName;
      } else {
        console.log('❌ PRIORITY 3 FAILED: doctorId field Firebase ID not found:', JSON.stringify({
          searchingForId: appointment.doctorId,
          availableDoctorIds: availableDoctors.map(d => d.id),
          allAvailableDoctors: availableDoctors.map(d => ({
            id: d.id,
            firstName: d.firstName,
            lastName: d.lastName
          }))
        }, null, 2));
      }
    }

    // ✅ PRIORITY 4: Use doctorId as name if it's not a Firebase ID
    if (appointment.doctorId && !isFirebaseId(appointment.doctorId)) {
      console.log('✅ PRIORITY 4 SUCCESS: Using doctorId field as name:', appointment.doctorId);
      return appointment.doctorId;
    }
    
    // ✅ FALLBACK: Use whatever is in doctor field
    if (appointment.doctor) {
      console.log('✅ FALLBACK: Using doctor field as final attempt:', appointment.doctor);
      return appointment.doctor;
    }
    
    console.log('❌ ALL PRIORITIES FAILED: No doctor information found in appointment');
    return 'Not Assigned';
  };

  // ✅ Helper function to detect Firebase IDs
  const isFirebaseId = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    // Firebase IDs are typically 20+ characters, alphanumeric with no spaces
    return value.length >= 20 && /^[a-zA-Z0-9]+$/.test(value);
  };

  // ✅ Helper function to get doctor ID from name  
  const getDoctorIdByName = (doctorName: string): string => {
    if (!doctorName) return '';
    
    const doctor = availableDoctors.find(d => 
      `${d.firstName} ${d.lastName}` === doctorName ||
      `Dr. ${d.firstName} ${d.lastName}` === doctorName
    );
    
    return doctor?.id || doctorName; // Fallback to name if not found
  };

  // ✅ TEMPORARILY DISABLED: Automatic real-time sync listeners to fix hooks error
  // Automatic sync still works through Firebase real-time listeners and direct triggers
  // TODO: Re-enable after fixing hooks issue
  /*
  useEffect(() => {
    console.log('🔄 AppointmentList: Setting up automatic sync listeners');

    const handlePatientUpdate = (event: CustomEvent) => {
      console.log('👥 AppointmentList: Patient updated automatically, refreshing appointment data');
    };

    const handlePaymentUpdate = (event: CustomEvent) => {
      console.log('💰 AppointmentList: Payment updated automatically, refreshing appointment data');
    };

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('🔄 AppointmentList: Force refresh triggered automatically');
    };

    const handleAppointmentRefresh = (event: CustomEvent) => {
      console.log('📋 AppointmentList: Appointment data refresh triggered automatically');
    };

    window.addEventListener('patientUpdated', handlePatientUpdate);
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    window.addEventListener('forceDataRefresh', handleForceRefresh);
    window.addEventListener('refreshAppointmentData', handleAppointmentRefresh);

    return () => {
      window.removeEventListener('patientUpdated', handlePatientUpdate);
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      window.removeEventListener('forceDataRefresh', handleForceRefresh);
      window.removeEventListener('refreshAppointmentData', handleAppointmentRefresh);
    };
  }, []);
  */

  // ✅ REMOVED: Problematic useEffect that caused hooks error
  // Automatic sync is now handled directly in the save functions

  return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Enhanced Header Section */}
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
                  <CalendarToday sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />
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
                    {t('appointment_management')}
                  </Typography>
                  
                </Box>
              </Box>
              
              {/* Enhanced Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.5, sm: 2 },
                width: { xs: '100%', md: 'auto' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<Today />}
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.25)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('todays_schedule')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddAppointmentOpen(true)}
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
                  {t('schedule_new_appointment')}
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

          {/* Statistics Overview */}
          <Card sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(9, 9, 121, 0.1)',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(9, 9, 121, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.08) 0%, rgba(9, 9, 121, 0.12) 35%, rgba(0, 212, 255, 0.08) 100%)',
              boxShadow: '0 6px 25px rgba(9, 9, 121, 0.15)',
            },
            transition: 'all 0.3s ease',
          }}>
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
             <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
               📊 {t('appointment_statistics')}
             </Typography>
             <Grid container spacing={3}>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 3, 
                   background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.08) 0%, rgba(9, 9, 121, 0.12) 35%, rgba(0, 212, 255, 0.08) 100%)',
                   borderRadius: 3,
                   backdropFilter: 'blur(15px)',
                   border: '1px solid rgba(9, 9, 121, 0.2)',
                   boxShadow: '0 4px 20px rgba(9, 9, 121, 0.1)',
                   position: 'relative',
                   overflow: 'hidden',
                   '&:hover': {
                     background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.12) 0%, rgba(9, 9, 121, 0.18) 35%, rgba(0, 212, 255, 0.12) 100%)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 8px 30px rgba(9, 9, 121, 0.2)',
                   },
                   transition: 'all 0.3s ease'
                 }}>
                   <Box sx={{ 
                     position: 'absolute', 
                     top: -15, 
                     right: -15, 
                     width: 40, 
                     height: 40, 
                     background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.2) 0%, rgba(9, 9, 121, 0.15) 100%)', 
                     borderRadius: '50%' 
                   }} />
                   <Typography variant="h4" sx={{ 
                     fontWeight: 800, 
                     background: 'linear-gradient(135deg, rgba(0, 212, 255, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                     backgroundClip: 'text',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     mb: 0.5 
                   }}>
                     {`${completedToday}/${todayAppointments.length}`}
                   </Typography>
                   <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                     {t('todays_progress')}
                   </Typography>
                 </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 3, 
                   background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.06) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.06) 100%)',
                   borderRadius: 3,
                   backdropFilter: 'blur(15px)',
                   border: '1px solid rgba(0, 212, 255, 0.15)',
                   boxShadow: '0 4px 20px rgba(0, 212, 255, 0.08)',
                   position: 'relative',
                   overflow: 'hidden',
                   '&:hover': {
                     background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.09) 0%, rgba(9, 9, 121, 0.12) 35%, rgba(0, 212, 255, 0.09) 100%)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 8px 30px rgba(0, 212, 255, 0.15)',
                   },
                   transition: 'all 0.3s ease'
                 }}>
                   <Box sx={{ 
                     position: 'absolute', 
                     top: -15, 
                     right: -15, 
                     width: 40, 
                     height: 40, 
                     background: 'linear-gradient(45deg, rgba(9, 9, 121, 0.2) 0%, rgba(0, 212, 255, 0.15) 100%)', 
                     borderRadius: '50%' 
                   }} />
                   <Typography variant="h4" sx={{ 
                     fontWeight: 800, 
                     background: 'linear-gradient(135deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                     backgroundClip: 'text',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     mb: 0.5 
                   }}>
                     {t('doctor hours display')}
                   </Typography>
                   <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                     {t('doctor_hours')}
                   </Typography>
                 </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 3, 
                   background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.07) 35%, rgba(0, 212, 255, 0.04) 100%)',
                   borderRadius: 3,
                   backdropFilter: 'blur(15px)',
                   border: '1px solid rgba(2, 0, 36, 0.2)',
                   boxShadow: '0 4px 20px rgba(2, 0, 36, 0.08)',
                   position: 'relative',
                   overflow: 'hidden',
                   '&:hover': {
                     background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.08) 0%, rgba(9, 9, 121, 0.11) 35%, rgba(0, 212, 255, 0.07) 100%)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 8px 30px rgba(2, 0, 36, 0.15)',
                   },
                   transition: 'all 0.3s ease'
                 }}>
                   <Box sx={{ 
                     position: 'absolute', 
                     top: -15, 
                     right: -15, 
                     width: 40, 
                     height: 40, 
                     background: 'linear-gradient(45deg, rgba(2, 0, 36, 0.15) 0%, rgba(9, 9, 121, 0.2) 100%)', 
                     borderRadius: '50%' 
                   }} />
                   <Typography variant="h4" sx={{ 
                     fontWeight: 800, 
                     background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                     backgroundClip: 'text',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     mb: 0.5 
                   }}>
                     {appointmentList.filter(apt => apt.status === 'confirmed').length}
                   </Typography>
                   <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                     {t('confirmed_today')}
                   </Typography>
                 </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 3, 
                   background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.05) 0%, rgba(2, 0, 36, 0.07) 35%, rgba(0, 212, 255, 0.03) 100%)',
                   borderRadius: 3,
                   backdropFilter: 'blur(15px)',
                   border: '1px solid rgba(9, 9, 121, 0.15)',
                   boxShadow: '0 4px 20px rgba(9, 9, 121, 0.08)',
                   position: 'relative',
                   overflow: 'hidden',
                   '&:hover': {
                     background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.08) 0%, rgba(2, 0, 36, 0.11) 35%, rgba(0, 212, 255, 0.06) 100%)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 8px 30px rgba(9, 9, 121, 0.15)',
                   },
                   transition: 'all 0.3s ease'
                 }}>
                   <Box sx={{ 
                     position: 'absolute', 
                     top: -15, 
                     right: -15, 
                     width: 40, 
                     height: 40, 
                     background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.15) 0%, rgba(2, 0, 36, 0.2) 100%)', 
                     borderRadius: '50%' 
                   }} />
                   <Typography variant="h4" sx={{ 
                     fontWeight: 800, 
                     background: 'linear-gradient(135deg, rgba(9, 9, 121, 1) 0%, rgba(2, 0, 36, 1) 100%)',
                     backgroundClip: 'text',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     mb: 0.5 
                   }}>
                     {generateAvailableTimeSlots().filter(slot => slot.available).length}
                   </Typography>
                   <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                     {t('available_slots')}
                   </Typography>
                 </Box>
               </Grid>
             </Grid>
           </CardContent>
         </Card>

         {/* Main Appointments Table */}
         <Card sx={{ 
           background: 'linear-gradient(120deg, rgba(2, 0, 36, 0.03) 0%, rgba(9, 9, 121, 0.05) 35%, rgba(0, 212, 255, 0.03) 100%)',
           backdropFilter: 'blur(10px)',
           border: '1px solid rgba(9, 9, 121, 0.08)',
           borderRadius: 4,
           boxShadow: '0 8px 32px rgba(9, 9, 121, 0.1)',
           overflow: 'hidden',
           mb: 4,
           '&:hover': {
             background: 'linear-gradient(120deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)',
             boxShadow: '0 12px 40px rgba(9, 9, 121, 0.15)',
           },
           transition: 'all 0.3s ease',
         }}>
           <CardContent sx={{ p: 0 }}>
             {/* Search and Filters */}
             <Box sx={{ 
               p: 4, 
               borderBottom: 1, 
               borderColor: 'divider',
               background: 'linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%)'
             }}>
               <Grid container spacing={2} alignItems="center">
                 <Grid item xs={12} md={6}>
                   <TextField
                     fullWidth
                     placeholder={t('search_appointments_placeholder')}
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

                   {/* Active Filters Display */}
                   {getActiveFilterCount() > 0 && (
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                       {searchQuery && (
                         <Chip
                           label={`${t('search')}: "${searchQuery}"`}
                           size="small"
                           onDelete={() => setSearchQuery('')}
                           color="primary"
                           variant="outlined"
                         />
                       )}
                       {Object.entries(activeFilters).map(([key, value]) => 
                         value && (
                           <Chip
                             key={key}
                             label={`${t(key)}: ${t(value)}`}
                             size="small"
                             onDelete={() => handleFilterSelect(key, '')}
                             color="primary"
                             variant="outlined"
                           />
                         )
                       )}
                     </Box>
                   )}
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                     <TextField
                       type="date"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                       size="small"
                     />
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
                     <Box sx={{ 
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
                         startIcon={<ViewWeek />}
                         sx={{
                           borderRadius: 2,
                           fontWeight: 600,
                           fontSize: '0.8rem',
                           px: 2,
                           minWidth: 'fit-content',
                           ...(viewMode === 'table' && {
                             background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                             boxShadow: '0 4px 16px rgba(9, 9, 121, 0.3)',
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
                         startIcon={<ViewModule />}
                         sx={{
                           borderRadius: 2,
                           fontWeight: 600,
                           fontSize: '0.8rem',
                           px: 2,
                           minWidth: 'fit-content',
                           ...(viewMode === 'cards' && {
                             background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                             boxShadow: '0 4px 16px rgba(9, 9, 121, 0.3)',
                           }),
                           '&:hover': {
                             transform: 'translateY(-1px)',
                           },
                           transition: 'all 0.2s ease'
                         }}
                       >
                         {t('cards')}
                       </Button>
                     </Box>
                   </Box>
                 </Grid>
               </Grid>
             </Box>

             {/* Results Summary */}
             {(getActiveFilterCount() > 0 || searchQuery) && (
               <Box sx={{ 
                 px: 4, 
                 py: 3, 
                 background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)', 
                 borderBottom: 1, 
                 borderColor: 'divider',
                 borderRadius: '0 0 16px 16px'
               }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <Box
                     sx={{
                       width: 32,
                       height: 32,
                       borderRadius: '8px',
                       background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                     }}
                   >
                     <Search sx={{ fontSize: 18 }} />
                   </Box>
                   <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                     {t('showing_appointments', { 
                       showing: filteredAppointments.length, 
                       total: appointments.length 
                     })}
                     {getActiveFilterCount() > 0 && ` ${t('with_filters_applied', { count: getActiveFilterCount() })}`}
                   </Typography>
                 </Box>
               </Box>
             )}

             {/* Tabs */}
             <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
               <Tabs 
                 value={tabValue} 
                 onChange={handleTabChange}
                 variant="scrollable"
                 scrollButtons="auto"
                 allowScrollButtonsMobile
                 sx={{
                   '& .MuiTab-root': {
                     textTransform: 'none',
                     fontWeight: 600,
                     fontSize: '0.95rem',
                     minWidth: 'auto',
                     padding: '12px 16px',
                     borderRadius: '8px 8px 0 0',
                     margin: '0 2px',
                     '&.Mui-selected': {
                       color: 'white',
                       background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                       boxShadow: '0 4px 16px rgba(9, 9, 121, 0.4)',
                     },
                     '&:hover': {
                       backgroundColor: 'rgba(9, 9, 121, 0.1)',
                     }
                   },
                   '& .MuiTabs-indicator': {
                     height: 4,
                     borderRadius: '4px 4px 0 0',
                     background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                   },
                   '& .MuiTabs-scrollButtons': {
                     color: 'primary.main',
                   }
                 }}
               >
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <CalendarToday fontSize="small" />
                       <span>{t('all')}</span>
                       <Chip 
                                                   label={appointments.length} 
                         size="small" 
                         color="primary"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Today fontSize="small" />
                       <span>{t('today')}</span>
                       <Chip 
                         label={appointments.filter(apt => apt.date === selectedDate).length} 
                         size="small" 
                         color="info"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <AccessTime fontSize="small" />
                       <span>{t('pending')}</span>
                       <Chip 
                         label={appointments.filter(apt => !apt.completed).length} 
                         size="small" 
                         color="warning"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <CheckCircle fontSize="small" />
                       <span>{t('completed')}</span>
                       <Chip 
                         label={appointments.filter(apt => apt.completed).length} 
                         size="small" 
                         color="success"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <CheckCircle fontSize="small" />
                       <span>{t('confirmed')}</span>
                       <Chip 
                         label={appointmentList.filter(apt => apt.status === 'confirmed').length} 
                         size="small" 
                         color="success"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <AccessTime fontSize="small" />
                       <span>{t('pending_confirmation')}</span>
                       <Chip 
                         label={appointmentList.filter(apt => apt.status === 'pending').length} 
                         size="small" 
                         color="warning"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Cancel fontSize="small" />
                       <span>{t('cancelled')}</span>
                       <Chip 
                         label={appointmentList.filter(apt => apt.status === 'cancelled').length} 
                         size="small" 
                         color="error"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Schedule fontSize="small" />
                       <span>{t('rescheduled')}</span>
                       <Chip 
                         label={appointmentList.filter(apt => apt.status === 'rescheduled').length} 
                         size="small" 
                         color="info"
                         sx={{ height: 20, fontSize: '0.75rem' }}
                       />
                     </Box>
                   }
                 />
                 <Tab 
                   label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Cancel fontSize="small" />
                       <span>{t('no_show')}</span>
                       <Chip 
                         label={appointmentList.filter(apt => apt.status === 'no-show').length} 
                         size="small" 
                         sx={{ 
                           height: 20, 
                           fontSize: '0.75rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.8) 0%, rgba(9, 9, 121, 0.9) 100%)',
                           color: 'white',
                           fontWeight: 600,
                           border: '1px solid rgba(2, 0, 36, 0.3)',
                         }}
                       />
                     </Box>
                   }
                 />
               </Tabs>
             </Box>

             {/* Table View */}
             {viewMode === 'table' && (
               <Box sx={{ py: 3 }}>
                 <TableContainer>
                   <Table>
                     <TableHead sx={{ 
                       background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)',
                       backdropFilter: 'blur(10px)',
                     }}>
                       <TableRow>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>✓</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('patient')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('doctor')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('appointment_date')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('time_duration')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('type')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('priority')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('date_received')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('payment_status')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('status')}</TableCell>
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '0.9rem',
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           borderBottom: '2px solid rgba(9, 9, 121, 0.2)'
                         }}>{t('actions')}</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                                                {filteredAppointments.length === 0 && getActiveFilterCount() > 0 ? (
                         <TableRow>
                           <TableCell colSpan={11} sx={{ textAlign: 'center', py: 6 }}>
                             <Box>
                               <FilterList sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                               <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                 {t('no_appointments_match_filters')}
                               </Typography>
                               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                 {t('try_adjusting_search_criteria')}
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
                       ) : filteredAppointments.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={11} sx={{ textAlign: 'center', py: 6 }}>
                             <Box>
                               <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                               <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                 {tabValue === 1 ? t('no_appointments_today') :
                                  tabValue === 2 ? t('no_pending_appointments') :
                                  tabValue === 3 ? t('no_completed_appointments') :
                                  tabValue === 4 ? t('no_confirmed_appointments') :
                                  tabValue === 5 ? t('no_pending_confirmation_appointments') :
                                  tabValue === 6 ? t('no_cancelled_appointments') :
                                  tabValue === 7 ? t('no_rescheduled_appointments') :
                                  tabValue === 8 ? t('no_no_show_appointments') :
                                  t('no_appointments_found')}
                               </Typography>
                               <Typography variant="body2" color="text.secondary">
                                 {tabValue === 1 ? t('schedule_appointments_today') :
                                  tabValue === 2 ? t('all_appointments_completed_confirmed') :
                                  tabValue === 3 ? t('complete_appointments_to_see_here') :
                                  tabValue === 4 ? t('no_confirmed_status_yet') :
                                  tabValue === 5 ? t('all_appointments_confirmed') :
                                  tabValue === 6 ? t('no_appointments_cancelled') :
                                  tabValue === 7 ? t('no_appointments_rescheduled') :
                                  tabValue === 8 ? t('no_patients_missed_appointments') :
                                  t('schedule_first_appointment')}
                               </Typography>
                             </Box>
                           </TableCell>
                         </TableRow>
                       ) : (
                         filteredAppointments.map((appointment) => (
                           <TableRow 
                             key={appointment.id} 
                             hover
                             sx={{ 
                               opacity: appointment.completed ? 0.7 : 1,
                               background: appointment.completed 
                                 ? 'linear-gradient(135deg, rgba(2, 0, 36, 0.02) 0%, rgba(9, 9, 121, 0.03) 35%, rgba(0, 212, 255, 0.02) 100%)'
                                 : 'linear-gradient(135deg, rgba(2, 0, 36, 0.01) 0%, rgba(9, 9, 121, 0.02) 35%, rgba(0, 212, 255, 0.01) 100%)',
                               borderLeft: `4px solid ${getPriorityColor(appointment.priority)}`,
                               '&:hover': {
                                 background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.04) 0%, rgba(9, 9, 121, 0.06) 35%, rgba(0, 212, 255, 0.04) 100%)',
                                 transform: 'translateX(2px)',
                                 boxShadow: '0 2px 12px rgba(9, 9, 121, 0.1)',
                               },
                               transition: 'all 0.3s ease',
                               borderBottom: '1px solid rgba(9, 9, 121, 0.05)',
                             }}
                           >
                             <TableCell>
                               <Tooltip title={appointment.completed ? t('mark_as_pending') : t('mark_as_completed')}>
                                 <IconButton
                                   size="small"
                                   onClick={() => toggleAppointmentCompletion(appointment.id)}
                                   sx={{ 
                                     color: appointment.completed ? 'success.main' : 'text.secondary',
                                     '&:hover': { 
                                       backgroundColor: appointment.completed ? 'success.light' : 'primary.light',
                                       color: appointment.completed ? 'success.dark' : 'primary.main'
                                     }
                                   }}
                                 >
                                   <CheckCircle fontSize="small" />
                                 </IconButton>
                               </Tooltip>
                             </TableCell>
                             <TableCell>
                               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                 <Avatar
                                   sx={{
                                     width: 40,
                                     height: 40,
                                     mr: 2,
                                     background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                                     fontSize: '0.875rem',
                                     color: 'white',
                                     fontWeight: 600,
                                     boxShadow: '0 3px 12px rgba(2, 0, 36, 0.3)',
                                   }}
                                 >
                                   {appointment.patientAvatar}
                                 </Avatar>
                                 <Box>
                                   <Typography 
                                     variant="body2" 
                                     fontWeight={600}
                                     sx={{ 
                                       textDecoration: appointment.completed ? 'line-through' : 'none',
                                       color: appointment.completed ? 'text.secondary' : 'text.primary'
                                     }}
                                   >
                                     {appointment.patient}
                                   </Typography>
                                   <Typography variant="caption" color="text.secondary">
                                     {appointment.phone}
                                   </Typography>
                                 </Box>
                               </Box>
                             </TableCell>
                             <TableCell>
                               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                 <Avatar
                                   sx={{
                                     width: 32,
                                     height: 32,
                                     mr: 1.5,
                                     background: 'linear-gradient(135deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                                     fontSize: '0.75rem',
                                     color: 'white',
                                     fontWeight: 600,
                                     boxShadow: '0 2px 8px rgba(9, 9, 121, 0.3)',
                                   }}
                                 >
                                   👨‍⚕️
                                 </Avatar>
                                 <Box>
                                                                        <Typography 
                                       variant="body2" 
                                       fontWeight={600}
                                       sx={{
                                         background: 'linear-gradient(135deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                                         backgroundClip: 'text',
                                         WebkitBackgroundClip: 'text',
                                         WebkitTextFillColor: 'transparent',
                                       }}
                                     >
                                       {getDoctorName(appointment)}
                                     </Typography>
                                     <Typography variant="caption" color="text.secondary">
                                       {getDoctorName(appointment) !== 'Not Assigned' ? 'Assigned' : 'Unassigned'}
                                     </Typography>
                                 </Box>
                               </Box>
                             </TableCell>
                             <TableCell>
                               <Box>
                                 <Typography variant="body2" fontWeight={600} color="primary.main">
                                   {new Date(appointment.date).toLocaleDateString()}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                 </Typography>
                               </Box>
                             </TableCell>
                             <TableCell>
                               <Box>
                                 <Typography variant="body2" fontWeight={600} color="primary.main">
                                   {appointment.time}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   {appointment.duration} {t('minutes')}
                                 </Typography>
                               </Box>
                             </TableCell>
                             <TableCell>
                               <Tooltip title={t('click_to_change_type')} arrow>
                                 <Chip
                                   label={t(appointment.type ? appointment.type.toLowerCase().replace(/\s+/g, '_') : 'unknown')}
                                   size="small"
                                   variant="outlined"
                                   color="primary"
                                   onClick={(e) => handleQuickTypeEdit(appointment, e)}
                                   sx={{ 
                                     fontWeight: 600,
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
                               <Chip
                                 label={t(appointment.priority)}
                                 size="small"
                                 variant="outlined"
                                 sx={{ 
                                   borderColor: getPriorityColor(appointment.priority),
                                   color: getPriorityColor(appointment.priority)
                                 }}
                               />
                             </TableCell>
                             <TableCell>
                               <Box>
                                 <Typography variant="body2" color="text.primary">
                                   {new Date(appointment.createdAt).toLocaleDateString()}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   {new Date(appointment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </Typography>
                               </Box>
                             </TableCell>
                             <TableCell>
                               <Tooltip title={t('click_to_change_payment_status')} arrow>
                                 <Chip
                                   label={t((appointment as any).paymentStatus || 'pending')}
                                   size="small"
                                   variant="filled"
                                   color={getPaymentStatusColor((appointment as any).paymentStatus || 'pending') as any}
                                   onClick={(e) => handleQuickPaymentStatusEdit(appointment, e)}
                                   sx={{ 
                                     minWidth: 80,
                                     fontWeight: 600,
                                     textTransform: 'capitalize',
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
                               <Tooltip title={t('click_to_change_status')} arrow>
                                 <Chip
                                   icon={getStatusIcon(appointment.status)}
                                   label={t(appointment.completed ? 'completed' : appointment.status)}
                                   color={appointment.completed ? 'success' : getStatusColor(appointment.status) as any}
                                   size="small"
                                   variant="outlined"
                                   onClick={(e) => handleQuickStatusEdit(appointment, e)}
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
                                 <Tooltip title={t('view_notes')}>
                                   <IconButton 
                                     size="small" 
                                     color="primary"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleViewNotes(appointment);
                                     }}
                                   >
                                     <Visibility fontSize="small" />
                                   </IconButton>
                                 </Tooltip>
                                 <Tooltip title={t('edit_appointment')}>
                                   <IconButton 
                                     size="small" 
                                     color="primary"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleEditAppointment(appointment);
                                     }}
                                   >
                                     <Edit fontSize="small" />
                                   </IconButton>
                                 </Tooltip>
                                 <Tooltip title={t('reschedule')}>
                                   <IconButton 
                                     size="small" 
                                     color="warning"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleRescheduleAppointment(appointment);
                                     }}
                                   >
                                     <Schedule fontSize="small" />
                                   </IconButton>
                                 </Tooltip>
                                 <Tooltip title={t('whatsapp_patient')}>
                                   <IconButton 
                                     size="small" 
                                     sx={{ color: '#25D366' }}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       const message = t('whatsapp_reminder_message', {
                                         patient: appointment.patient,
                                         type: appointment.type,
                                         time: appointment.time
                                       });
                                       const phone = appointment.phone?.replace(/\D/g, '') || '';
                                       window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                     }}
                                   >
                                     <Phone fontSize="small" />
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
               </Box>
             )}

             {/* Cards View */}
             {viewMode === 'cards' && (
               <Box sx={{ py: 3 }}>
                 <Grid container spacing={3} sx={{ p: 3 }}>
                   {filteredAppointments.length === 0 && getActiveFilterCount() > 0 ? (
                     <Grid item xs={12}>
                       <Card sx={{ p: 6, textAlign: 'center' }}>
                         <FilterList sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                         <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                           {t('no_appointments_match_filters')}
                         </Typography>
                         <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                           {t('try_adjusting_search_criteria')}
                         </Typography>
                         <Button 
                           variant="contained" 
                           onClick={clearAllFilters}
                           startIcon={<FilterList />}
                           >
                             {t('clear_all_filters')}
                           </Button>
                         </Card>
                       </Grid>
                     ) : filteredAppointments.length === 0 ? (
                       <Grid item xs={12}>
                         <Card sx={{ p: 6, textAlign: 'center' }}>
                           <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                           <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                             {tabValue === 1 ? t('no_appointments_today') :
                              tabValue === 2 ? t('no_pending_appointments') :
                              tabValue === 3 ? t('no_completed_appointments') :
                              tabValue === 4 ? t('no_confirmed_appointments') :
                              tabValue === 5 ? t('no_pending_confirmation_appointments') :
                              tabValue === 6 ? t('no_cancelled_appointments') :
                              tabValue === 7 ? t('no_rescheduled_appointments') :
                              tabValue === 8 ? t('no_no_show_appointments') :
                              t('no_appointments_found')}
                           </Typography>
                           <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                             {tabValue === 1 ? t('schedule_appointments_today') :
                              tabValue === 2 ? t('all_appointments_completed_confirmed') :
                              tabValue === 3 ? t('complete_appointments_to_see_here') :
                              tabValue === 4 ? t('no_confirmed_status_yet') :
                              tabValue === 5 ? t('all_appointments_confirmed') :
                              tabValue === 6 ? t('no_appointments_cancelled') :
                              tabValue === 7 ? t('no_appointments_rescheduled') :
                              tabValue === 8 ? t('no_patients_missed_appointments') :
                              t('schedule_first_appointment')}
                           </Typography>
                                                    <Button 
                           variant="contained" 
                           onClick={() => setAddAppointmentOpen(true)}
                           startIcon={<Add />}
                           sx={{
                             minHeight: { xs: 48, md: 'auto' },
                             px: { xs: 3, md: 4 },
                             py: { xs: 1.5, md: 2 },
                             fontSize: { xs: '0.9rem', md: '1rem' },
                             borderRadius: { xs: 2, md: 1 }
                           }}
                           >
                             {t('schedule_appointment')}
                           </Button>
                         </Card>
                       </Grid>
                     ) : (
                       filteredAppointments.map((appointment) => (
                         <Grid item xs={12} sm={6} md={6} key={appointment.id}>
                           <Card sx={{ 
                             height: '100%', 
                             background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.04) 0%, rgba(9, 9, 121, 0.06) 35%, rgba(0, 212, 255, 0.04) 100%)',
                             backdropFilter: 'blur(10px)',
                             border: appointment.status === 'pending' ? '2px solid #F59E0B' : '1px solid rgba(9, 9, 121, 0.12)',
                             '&:hover': { 
                               background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.06) 0%, rgba(9, 9, 121, 0.1) 35%, rgba(0, 212, 255, 0.06) 100%)',
                               boxShadow: '0 8px 25px rgba(9, 9, 121, 0.15)',
                               transform: 'translateY(-2px)',
                             },
                             transition: 'all 0.3s ease',
                           }}>
                             <CardContent sx={{ p: 3 }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                   <Avatar
                                     sx={{
                                       width: 50,
                                       height: 50,
                                       mr: 2,
                                       background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                                       color: 'white',
                                       fontWeight: 600,
                                       boxShadow: '0 4px 16px rgba(2, 0, 36, 0.3)',
                                       border: '2px solid rgba(0, 212, 255, 0.2)',
                                     }}
                                   >
                                     {appointment.patientAvatar}
                                   </Avatar>
                                   <Box>
                                     <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                       {appointment.patient}
                                     </Typography>
                                     <Typography variant="body2" color="text.secondary">
                                       {t(appointment.type ? appointment.type.toLowerCase().replace(/\s+/g, '_') : 'unknown')}
                                     </Typography>
                                   </Box>
                                 </Box>
                                 <Tooltip title={t('click_to_change_status')} arrow>
                                   <Chip
                                     icon={getStatusIcon(appointment.status)}
                                     label={t(appointment.status)}
                                     color={getStatusColor(appointment.status) as any}
                                     size="small"
                                     variant="outlined"
                                     onClick={(e) => handleQuickStatusEdit(appointment, e)}
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
                               
                                                                <Grid container spacing={2}>
                                 <Grid item xs={6}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                     <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                                     <Typography variant="body2" color="primary.main" fontWeight={600}>
                                       {t('appointment_date')}: {new Date(appointment.date).toLocaleDateString()}
                                     </Typography>
                                   </Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                     <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                     <Typography variant="body2" color="text.primary" fontWeight={600}>
                                       {appointment.time} ({appointment.duration} {t('minutes')})
                                     </Typography>
                                   </Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                     <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                     <Typography variant="body2" color="text.secondary">
                                       {t('received')}: {appointment.createdAt ? 
                                         new Date(appointment.createdAt.toDate ? appointment.createdAt.toDate() : appointment.createdAt).toLocaleDateString() + 
                                         ' ' + new Date(appointment.createdAt.toDate ? appointment.createdAt.toDate() : appointment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                         : 'N/A'}
                                     </Typography>
                                   </Box>
                                 </Grid>
                                 <Grid item xs={6}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                     <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                     <Typography variant="body2" sx={{
                                       fontWeight: 600,
                                       background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                                       backgroundClip: 'text',
                                       WebkitBackgroundClip: 'text',
                                       WebkitTextFillColor: 'transparent',
                                     }}>
                                       {getDoctorName(appointment)}
                                     </Typography>
                                   </Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                     <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                     <Typography variant="body2" color="text.secondary">
                                       {appointment.location}
                                     </Typography>
                                   </Box>
                                 </Grid>
                               </Grid>
                               
                               {appointment.notes && (
                                 <Box sx={{ 
                                   mt: 2, 
                                   p: 2, 
                                   background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.03) 0%, rgba(9, 9, 121, 0.05) 35%, rgba(0, 212, 255, 0.03) 100%)',
                                   backdropFilter: 'blur(10px)',
                                   border: '1px solid rgba(9, 9, 121, 0.1)',
                                   borderRadius: 2 
                                 }}>
                                   <Typography variant="caption" sx={{ 
                                     color: 'rgba(2, 0, 36, 0.8)',
                                     fontWeight: 500
                                   }}>
                                     {t('notes')}: {appointment.notes}
                                   </Typography>
                                 </Box>
                               )}
                               
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                                 <Box sx={{ display: 'flex', gap: 1 }}>
                                   <Tooltip title={appointment.completed ? t('mark_as_pending') : t('mark_as_completed')}>
                                     <IconButton
                                       size="small"
                                       onClick={() => toggleAppointmentCompletion(appointment.id)}
                                       sx={{ 
                                         color: appointment.completed ? '#4CAF50' : 'rgba(9, 9, 121, 0.6)',
                                         background: appointment.completed 
                                           ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                                           : 'linear-gradient(135deg, rgba(9, 9, 121, 0.05) 0%, rgba(9, 9, 121, 0.02) 100%)',
                                         border: appointment.completed 
                                           ? '1px solid rgba(76, 175, 80, 0.2)'
                                           : '1px solid rgba(9, 9, 121, 0.1)',
                                         borderRadius: 1.5,
                                         '&:hover': { 
                                           background: appointment.completed 
                                             ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)'
                                             : 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(9, 9, 121, 0.05) 100%)',
                                           transform: 'scale(1.1)',
                                         },
                                         transition: 'all 0.3s ease'
                                       }}
                                     >
                                       <CheckCircle fontSize="small" />
                                     </IconButton>
                                   </Tooltip>
                                   <Button 
                                     size="small" 
                                     startIcon={<Phone />}
                                     sx={{ 
                                       color: '#25D366',
                                       background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(37, 211, 102, 0.05) 100%)',
                                       border: '1px solid rgba(37, 211, 102, 0.2)',
                                       borderRadius: 2,
                                       fontWeight: 600,
                                       '&:hover': {
                                         background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(37, 211, 102, 0.1) 100%)',
                                         transform: 'translateY(-1px)',
                                       },
                                       transition: 'all 0.3s ease'
                                     }}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       const message = t('whatsapp_reminder_message', {
                                         patient: appointment.patient,
                                         type: appointment.type,
                                         time: appointment.time
                                       });
                                       const phone = appointment.phone?.replace(/\D/g, '') || '';
                                       window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                     }}
                                   >
                                     {t('whatsapp')}
                                   </Button>
                                 </Box>
                                 <Chip
                                   label={t(appointment.priority)}
                                   size="small"
                                   variant="outlined"
                                   sx={{ 
                                     borderColor: getPriorityColor(appointment.priority),
                                     color: getPriorityColor(appointment.priority),
                                     background: `linear-gradient(135deg, ${getPriorityColor(appointment.priority)}10, ${getPriorityColor(appointment.priority)}05)`,
                                     fontWeight: 600,
                                     backdropFilter: 'blur(5px)',
                                   }}
                                 />
                               </Box>
                             </CardContent>
                           </Card>
                         </Grid>
                       ))
                     )}
                   </Grid>
                 </Box>
               )}
             </CardContent>
           </Card>
  
           {/* Today's Schedule and Performance Sections */}
           <Grid container spacing={4}>
             <Grid item xs={12} md={8}>
               <Card sx={{ 
                 borderRadius: 3, 
                 boxShadow: 3, 
                 background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                 color: 'white',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
                 <Box sx={{ 
                   position: 'absolute', 
                   top: 0, 
                   right: 0, 
                   width: 100, 
                   height: 100, 
                   background: 'rgba(255,255,255,0.1)', 
                   borderRadius: '50%', 
                   transform: 'translate(30px, -30px)' 
                 }} />
                 <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Today sx={{ fontSize: 32 }} />
                       <Box>
                         <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                           {t('todays_schedule')}
                         </Typography>
                         
                       </Box>
                     </Box>
                     
                   </Box>
                   
                   {todayAppointments.length === 0 ? (
                     <Box sx={{ textAlign: 'center', py: 4 }}>
                       <CalendarToday sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                       <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                         {t('no_appointments_today')}
                       </Typography>
                       <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                         {t('enjoy_free_day_or_schedule')}
                       </Typography>
                       <Box sx={{ 
                         display: 'flex', 
                         gap: { xs: 1.5, md: 2 }, 
                         justifyContent: 'center', 
                         flexWrap: 'wrap',
                         flexDirection: { xs: 'column', sm: 'row' },
                         alignItems: 'center'
                       }}>
                         <Button
                           variant="outlined"
                           startIcon={<Add />}
                           onClick={() => setAddAppointmentOpen(true)}
                           sx={{ 
                             color: 'white', 
                             borderColor: 'rgba(255,255,255,0.5)',
                             minHeight: 48,
                             px: { xs: 3, md: 3 },
                             py: { xs: 1.5, md: 1.5 },
                             fontSize: { xs: '0.9rem', md: '1rem' },
                             width: { xs: '100%', sm: 'auto' },
                             maxWidth: { xs: '280px', sm: 'none' },
                             borderRadius: 3,
                             fontWeight: 600,
                             minWidth: { xs: 'auto', sm: 120 },
                             whiteSpace: 'nowrap',
                             textOverflow: 'ellipsis',
                             overflow: 'hidden',
                             '&:hover': { 
                               borderColor: 'white',
                               backgroundColor: 'rgba(255,255,255,0.1)',
                               transform: 'translateY(-2px)',
                             },
                             transition: 'all 0.3s ease'
                           }}
                         >
                           {t('schedule')}
                         </Button>
                         <Button
                           variant="outlined"
                           startIcon={<People />}
                           onClick={() => window.location.href = '/patients'}
                           sx={{ 
                             color: 'white', 
                             borderColor: 'rgba(255,255,255,0.5)',
                             minHeight: { xs: 48, md: 'auto' },
                             px: { xs: 3, md: 2 },
                             py: { xs: 1.5, md: 1 },
                             fontSize: { xs: '0.9rem', md: '1rem' },
                             width: { xs: '100%', sm: 'auto' },
                             maxWidth: { xs: '280px', sm: 'none' },
                             borderRadius: { xs: 2, md: 1 },
                             '&:hover': { 
                               borderColor: 'white',
                               backgroundColor: 'rgba(255,255,255,0.1)'
                             }
                           }}
                         >
                           {t('patients')}
                         </Button>
                       </Box>
                     </Box>
                   ) : (
                     <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                       {todayAppointments.slice(0, 3).map((appointment) => (
                         <Card 
                           key={appointment.id}
                           sx={{ 
                             minWidth: 200,
                             backgroundColor: 'rgba(255,255,255,0.15)',
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255,255,255,0.2)',
                             cursor: 'pointer',
                             '&:hover': { 
                               backgroundColor: 'rgba(255,255,255,0.25)',
                               transform: 'translateY(-2px)'
                             },
                             transition: 'all 0.3s ease'
                           }}
                           onClick={(e) => handleQuickStatusEdit(appointment, e)}
                         >
                           <CardContent sx={{ p: 2, color: 'white' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                               <Avatar sx={{ 
                                 width: 24, 
                                 height: 24, 
                                 mr: 1, 
                                 fontSize: '0.75rem',
                                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                                 color: 'white',
                                 fontWeight: 600,
                                 border: '1px solid rgba(255, 255, 255, 0.2)',
                               }}>
                                 {appointment.patientAvatar}
                               </Avatar>
                               <Typography variant="body2" fontWeight={600}>
                                 {appointment.patient}
                               </Typography>
                             </Box>
                             <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                               {appointment.time} • {t(appointment.type ? appointment.type.toLowerCase().replace(/\s+/g, '_') : 'unknown')}
                             </Typography>
                             <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                               <Chip 
                                 size="small" 
                                 label={t(appointment.status)}
                                 sx={{ 
                                   backgroundColor: 'rgba(255,255,255,0.2)',
                                   color: 'white',
                                   fontSize: '0.65rem'
                                 }}
                               />
                               {appointment.completed && (
                                 <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                               )}
                             </Box>
                           </CardContent>
                         </Card>
                       ))}
                       {todayAppointments.length > 3 && (
                         <Card sx={{ 
                           minWidth: 120,
                           backgroundColor: 'rgba(255,255,255,0.1)',
                           border: '2px dashed rgba(255,255,255,0.3)',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           cursor: 'pointer',
                           '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
                         }}>
                           <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                             <Typography variant="h6" fontWeight={700}>
                               +{todayAppointments.length - 3}
                             </Typography>
                             <Typography variant="caption" sx={{ opacity: 0.8 }}>
                               {t('more_appointments')}
                             </Typography>
                           </CardContent>
                         </Card>
                       )}
                     </Box>
                   )}
                 </CardContent>
               </Card>
             </Grid>
  

  
             {/* Analytics Dashboard */}
             <Grid item xs={12}>
               <Card sx={{ 
                 background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.03) 0%, rgba(9, 9, 121, 0.05) 35%, rgba(0, 212, 255, 0.03) 100%)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(9, 9, 121, 0.1)',
                 borderRadius: 3, 
                 boxShadow: '0 4px 20px rgba(9, 9, 121, 0.08)',
                 '&:hover': {
                   background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)',
                   boxShadow: '0 6px 25px rgba(9, 9, 121, 0.12)',
                 },
                 transition: 'all 0.3s ease',
               }}>
                 <CardContent sx={{ p: 4 }}>
                   <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <BarChart sx={{ color: 'primary.main' }} />
                     {t('clinic_analytics_overview')}
                   </Typography>
                   
                   <Grid container spacing={3}>
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 3, 
                         background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.08) 0%, rgba(9, 9, 121, 0.12) 35%, rgba(0, 212, 255, 0.08) 100%)',
                         backdropFilter: 'blur(15px)',
                         border: '1px solid rgba(9, 9, 121, 0.2)',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         boxShadow: '0 4px 20px rgba(9, 9, 121, 0.1)',
                         '&:hover': {
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.12) 0%, rgba(9, 9, 121, 0.18) 35%, rgba(0, 212, 255, 0.12) 100%)',
                           transform: 'translateY(-2px)',
                           boxShadow: '0 8px 30px rgba(9, 9, 121, 0.2)',
                         },
                         transition: 'all 0.3s ease'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.2) 0%, rgba(9, 9, 121, 0.15) 100%)', 
                           borderRadius: '50%' 
                         }} />
                         <CalendarToday sx={{ fontSize: 32, color: 'rgba(0, 212, 255, 1)', mb: 1 }} />
                         <Typography variant="h4" sx={{ 
                           fontWeight: 800, 
                           background: 'linear-gradient(135deg, rgba(0, 212, 255, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           mb: 0.5 
                         }}>
                           {appointmentList.length}
                         </Typography>
                         <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                           {t('total_appointments')}
                         </Typography>
                       </Box>
                     </Grid>
  
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 3, 
                         background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.06) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.06) 100%)',
                         backdropFilter: 'blur(15px)',
                         border: '1px solid rgba(0, 212, 255, 0.15)',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         boxShadow: '0 4px 20px rgba(0, 212, 255, 0.08)',
                         '&:hover': {
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.09) 0%, rgba(9, 9, 121, 0.12) 35%, rgba(0, 212, 255, 0.09) 100%)',
                           transform: 'translateY(-2px)',
                           boxShadow: '0 8px 30px rgba(0, 212, 255, 0.15)',
                         },
                         transition: 'all 0.3s ease'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'linear-gradient(45deg, rgba(9, 9, 121, 0.2) 0%, rgba(0, 212, 255, 0.15) 100%)', 
                           borderRadius: '50%' 
                         }} />
                         <CheckCircle sx={{ fontSize: 32, color: 'rgba(9, 9, 121, 1)', mb: 1 }} />
                         <Typography variant="h4" sx={{ 
                           fontWeight: 800, 
                           background: 'linear-gradient(135deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           mb: 0.5 
                         }}>
                           {appointmentList.filter(apt => apt.completed).length}
                         </Typography>
                         <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                           {t('completed')}
                         </Typography>
                       </Box>
                     </Grid>
  
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 3, 
                         background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.07) 35%, rgba(0, 212, 255, 0.04) 100%)',
                         backdropFilter: 'blur(15px)',
                         border: '1px solid rgba(2, 0, 36, 0.2)',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         boxShadow: '0 4px 20px rgba(2, 0, 36, 0.08)',
                         '&:hover': {
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.08) 0%, rgba(9, 9, 121, 0.11) 35%, rgba(0, 212, 255, 0.07) 100%)',
                           transform: 'translateY(-2px)',
                           boxShadow: '0 8px 30px rgba(2, 0, 36, 0.15)',
                         },
                         transition: 'all 0.3s ease'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'linear-gradient(45deg, rgba(2, 0, 36, 0.15) 0%, rgba(9, 9, 121, 0.2) 100%)', 
                           borderRadius: '50%' 
                         }} />
                         <Warning sx={{ fontSize: 32, color: 'rgba(2, 0, 36, 1)', mb: 1 }} />
                         <Typography variant="h4" sx={{ 
                           fontWeight: 800, 
                           background: 'linear-gradient(135deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           mb: 0.5 
                         }}>
                           {appointmentList.filter(apt => apt.status === 'pending').length}
                         </Typography>
                         <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                           {t('pending_confirmation')}
                         </Typography>
                       </Box>
                     </Grid>
  
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 3, 
                         background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.05) 0%, rgba(2, 0, 36, 0.07) 35%, rgba(0, 212, 255, 0.03) 100%)',
                         backdropFilter: 'blur(15px)',
                         border: '1px solid rgba(9, 9, 121, 0.15)',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         boxShadow: '0 4px 20px rgba(9, 9, 121, 0.08)',
                         '&:hover': {
                           background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.08) 0%, rgba(2, 0, 36, 0.11) 35%, rgba(0, 212, 255, 0.06) 100%)',
                           transform: 'translateY(-2px)',
                           boxShadow: '0 8px 30px rgba(9, 9, 121, 0.15)',
                         },
                         transition: 'all 0.3s ease'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.15) 0%, rgba(2, 0, 36, 0.2) 100%)', 
                           borderRadius: '50%' 
                         }} />
                         <TrendingUp sx={{ fontSize: 32, color: 'rgba(9, 9, 121, 1)', mb: 1 }} />
                         <Typography variant="h4" sx={{ 
                           fontWeight: 800, 
                           background: 'linear-gradient(135deg, rgba(9, 9, 121, 1) 0%, rgba(2, 0, 36, 1) 100%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           mb: 0.5 
                         }}>
                           {appointmentList.filter(apt => apt.priority === 'high' || apt.priority === 'urgent').length}
                         </Typography>
                         <Typography variant="body2" sx={{ color: 'rgba(2, 0, 36, 0.8)', fontWeight: 600 }}>
                           {t('high_priority')}
                         </Typography>
                       </Box>
                     </Grid>
                   </Grid>
                 </CardContent>
               </Card>
             </Grid>
           </Grid>
  
           {/* Filter Menu */}
           <Menu
             anchorEl={filterAnchor}
             open={Boolean(filterAnchor)}
             onClose={() => setFilterAnchor(null)}
             PaperProps={{
               sx: { minWidth: 280, maxHeight: 500 }
             }}
           >
             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
                   {t('filter_appointments')}
                 </Typography>
                 {getActiveFilterCount() > 0 && (
                   <Button 
                     size="small" 
                     color="primary"
                     onClick={clearAllFilters}
                   >
                     {t('clear_all')}
                   </Button>
                 )}
               </Box>
               {getActiveFilterCount() > 0 && (
                 <Typography variant="caption" color="text.secondary">
                   {t('filters_active_results', { 
                     count: getActiveFilterCount(), 
                     results: filteredAppointments.length 
                   })}
                 </Typography>
               )}
             </Box>
  
             {/* Status Filter */}
             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t('appointment_status')}
               </Typography>
               <MenuItem 
                 onClick={() => handleFilterSelect('status', '')}
                 selected={activeFilters.status === ''}
                 dense
               >
                 {t('all_statuses')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('status', 'confirmed')}
                 selected={activeFilters.status === 'confirmed'}
                 dense
               >
                 {t('confirmed')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('status', 'pending')}
                 selected={activeFilters.status === 'pending'}
                 dense
               >
                 {t('pending')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('status', 'cancelled')}
                 selected={activeFilters.status === 'cancelled'}
                 dense
               >
                 {t('cancelled')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('status', 'rescheduled')}
                 selected={activeFilters.status === 'rescheduled'}
                 dense
               >
                 {t('rescheduled')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('status', 'no-show')}
                 selected={activeFilters.status === 'no-show'}
                 dense
               >
                 {t('no_show')}
               </MenuItem>
             </Box>
  
             {/* Completion Status Filter */}
             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t('progress_status')}
               </Typography>
               <MenuItem 
                 onClick={() => handleFilterSelect('completed', '')}
                 selected={activeFilters.completed === ''}
                 dense
               >
                 {t('all_progress')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('completed', 'completed')}
                 selected={activeFilters.completed === 'completed'}
                 dense
               >
                 ✅ {t('completed')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('completed', 'pending')}
                 selected={activeFilters.completed === 'pending'}
                 dense
               >
                 ⏱️ {t('pending')}
               </MenuItem>
             </Box>
  
             {/* Appointment Type Filter */}
             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t('appointment_type')}
               </Typography>
               <MenuItem 
                 onClick={() => handleFilterSelect('type', '')}
                 selected={activeFilters.type === ''}
                 dense
               >
                 {t('all_types')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('type', 'Consultation')}
                 selected={activeFilters.type === 'Consultation'}
                 dense
               >
                 {t('consultation')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('type', 'Check-up')}
                 selected={activeFilters.type === 'Check-up'}
                 dense
               >
                 {t('check_up')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('type', 'Follow-up')}
                 selected={activeFilters.type === 'Follow-up'}
                 dense
               >
                 {t('follow_up')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('type', 'Surgery')}
                 selected={activeFilters.type === 'Surgery'}
                 dense
               >
                 {t('surgery_consultation')}
               </MenuItem>
             </Box>
  
             {/* Priority Filter */}
             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t('priority_level')}
               </Typography>
               <MenuItem 
                 onClick={() => handleFilterSelect('priority', '')}
                 selected={activeFilters.priority === ''}
                 dense
               >
                 {t('all_priorities')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('priority', 'normal')}
                 selected={activeFilters.priority === 'normal'}
                 dense
               >
                 🟢 {t('normal')}
               </MenuItem>
               <MenuItem 
                 onClick={() => handleFilterSelect('priority', 'high')}
                 selected={activeFilters.priority === 'high'}
                 dense
               >
                 🟡 {t('high_priority')}
               </MenuItem>
               <MenuItem 
               onClick={() => handleFilterSelect('priority', 'urgent')}
               selected={activeFilters.priority === 'urgent'}
               dense
             >
               🔴 {t('urgent')}
             </MenuItem>
           </Box>

           {/* Doctor Filter */}
           <Box sx={{ p: 2 }}>
             <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
               {t('doctor')}
             </Typography>
             <MenuItem 
               onClick={() => handleFilterSelect('doctor', '')}
               selected={activeFilters.doctor === ''}
               dense
             >
               {t('all_doctors')}
             </MenuItem>
             {availableDoctors.map((doctor) => (
               <MenuItem 
                 key={doctor.id}
                 onClick={() => handleFilterSelect('doctor', `${doctor.firstName} ${doctor.lastName}`)}
                 selected={activeFilters.doctor === `${doctor.firstName} ${doctor.lastName}`}
                 dense
               >
                 {doctor.firstName} {doctor.lastName}
               </MenuItem>
             ))}
           </Box>
         </Menu>

         {/* Add/Edit Appointment Dialog */}
         <Dialog
           open={addAppointmentOpen || editDialogOpen}
           onClose={() => {
             setAddAppointmentOpen(false);
             setEditDialogOpen(false);
             setSelectedAppointment(null);
           }}
           maxWidth="lg"
           fullWidth
         >
           <DialogTitle>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <CalendarToday sx={{ color: 'primary.main' }} />
               <Typography variant="h6">
                 {selectedAppointment ? t('edit_appointment') : t('schedule_new_appointment')}
               </Typography>
             </Box>
           </DialogTitle>
           <DialogContent>
             <Grid container spacing={3} sx={{ mt: 1 }}>
               {/* Patient Selection */}
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth>
                   <InputLabel>{t('patient_name')}</InputLabel>
                   <Select
                     label={t('patient_name')}
                     value={availablePatients.find(p => p.name === newAppointment.patient) ? newAppointment.patient : 'custom'}
                     onChange={(e) => {
                       if (e.target.value === 'custom') {
                         setNewAppointment(prev => ({ 
                           ...prev, 
                           patient: '',
                           phone: ''
                         }));
                       } else {
                         const selectedPatient = availablePatients.find(p => p.name === e.target.value);
                         setNewAppointment(prev => ({ 
                           ...prev, 
                           patient: e.target.value,
                           phone: selectedPatient?.phone || prev.phone
                         }));
                       }
                     }}
                   >
                     <MenuItem value="custom">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                         <Add fontSize="small" />
                       </Box>
                     </MenuItem>
                     {availablePatients.map((patient) => (
                       <MenuItem key={patient.id} value={patient.name}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                           <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                             {patient.avatar}
                           </Avatar>
                           <Box>
                             <Typography variant="body2">{patient.name}</Typography>
                             <Typography variant="caption" color="text.secondary">
                               {patient.phone} • {patient.condition}
                             </Typography>
                           </Box>
                         </Box>
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>

               {/* Custom Patient Name Input */}
               {!availablePatients.find(p => p.name === newAppointment.patient) && (
                 <Grid item xs={12} md={6}>
                   <TextField
                     fullWidth
                     label={t('enter_patient_name')}
                     value={newAppointment.patient}
                     onChange={(e) => setNewAppointment(prev => ({ ...prev, patient: e.target.value }))}
                     placeholder={t('type_patient_name_here')}
                     required
                     InputProps={{
                       startAdornment: <InputAdornment position="start">👤</InputAdornment>
                     }}
                     helperText={t('enter_new_patient_name_helper')}
                   />
                 </Grid>
               )}

               {/* Phone Number */}
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('phone_number')}
                   value={newAppointment.phone}
                   onChange={(e) => setNewAppointment(prev => ({ ...prev, phone: e.target.value }))}
                   placeholder={t('phone_placeholder')}
                   InputProps={{
                     startAdornment: <InputAdornment position="start">📞</InputAdornment>
                   }}
                 />
               </Grid>

               {/* Doctor Selection */}
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth>
                   <InputLabel>{t('doctor')}</InputLabel>
                   <Select 
                     label={t('doctor')}
                     value={newAppointment.doctor}
                     onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor: e.target.value }))}
                   >
                     <MenuItem value="">Select doctor…</MenuItem>
                     {availableDoctors.map(d => (
                       <MenuItem key={d.id} value={`${d.firstName} ${d.lastName}`}>
                         Dr. {d.firstName} {d.lastName}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>

               {/* Date Selection */}
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('appointment_date')}
                   type="date"
                   value={newAppointment.date}
                   onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                   InputLabelProps={{ shrink: true }}
                   inputProps={{
                     min: new Date().toISOString().split('T')[0]
                   }}
                 />
               </Grid>

               {/* Available Time Slots Selector */}
               <Grid item xs={12}>
                 <AvailableTimeSlotsSelector
                   doctorId={availableDoctors.find(d => `${d.firstName} ${d.lastName}` === newAppointment.doctor)?.id}
                   date={newAppointment.date}
                   duration={newAppointment.duration || 30}
                   selectedTimeSlot={newAppointment.hour && newAppointment.minute ? `${newAppointment.hour}:${newAppointment.minute}` : ''}
                   onTimeSlotSelect={(timeSlot) => {
                     // Parse timeSlot (HH:MM format) and set hour, minute, and time display
                     const [hour, minute] = timeSlot.split(':');
                     const hourNum = parseInt(hour);
                     const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
                     const ampm = hourNum >= 12 ? 'PM' : 'AM';
                     const timeDisplay = `${displayHour}:${minute} ${ampm}`;
                     
                     setNewAppointment(prev => ({
                       ...prev,
                       hour: hour,
                       minute: minute,
                       time: timeDisplay
                     }));
                   }}
                 />
               </Grid>

               {/* Appointment Type */}
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth>
                   <InputLabel>{t('appointment_type')}</InputLabel>
                   <Select 
                     label={t('appointment_type')}
                     value={newAppointment.type}
                     onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value }))}
                   >
                     <MenuItem value="Consultation">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <MedicalServices fontSize="small" color="primary" />
                         {t('consultation')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="Check-up">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Assignment fontSize="small" color="info" />
                         {t('check_up')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="Follow-up">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Schedule fontSize="small" color="warning" />
                         {t('follow_up')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="Surgery Consultation">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <LocalHospital fontSize="small" color="error" />
                         {t('surgery_consultation')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="Emergency">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Warning fontSize="small" color="error" />
                         {t('emergency')}
                       </Box>
                     </MenuItem>
                   </Select>
                 </FormControl>
               </Grid>

               {/* Duration */}
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>{t('duration')}</InputLabel>
                   <Select 
                     label={t('duration')}
                     value={newAppointment.duration}
                     onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: Number(e.target.value) }))}
                   >
                     <MenuItem value={15}>{t('duration_minutes', { minutes: 15 })}</MenuItem>
                     <MenuItem value={20}>{t('duration_minutes', { minutes: 20 })}</MenuItem>
                     <MenuItem value={25}>{t('duration_minutes', { minutes: 25 })}</MenuItem>
                     <MenuItem value={30}>{t('duration_minutes', { minutes: 30 })}</MenuItem>
                     <MenuItem value={45}>{t('duration_minutes', { minutes: 45 })}</MenuItem>
                     <MenuItem value={60}>{t('duration_hour', { hours: 1 })}</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>

               {/* Priority */}
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>{t('priority')}</InputLabel>
                   <Select 
                     label={t('priority')}
                     value={newAppointment.priority}
                     onChange={(e) => setNewAppointment(prev => ({ ...prev, priority: e.target.value as any }))}
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

               {/* Payment Status */}
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>{t('payment_status')}</InputLabel>
                   <Select 
                     label={t('payment_status')}
                     value={newAppointment.paymentStatus || 'pending'}
                     onChange={(e) => setNewAppointment(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                   >
                     <MenuItem value="pending">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         🟡 {t('pending')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="completed">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         🟢 {t('completed')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="partial">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         🟠 {t('partial')}
                       </Box>
                     </MenuItem>
                     <MenuItem value="failed">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         🔴 {t('failed')}
                       </Box>
                     </MenuItem>
                   </Select>
                 </FormControl>
               </Grid>

               {/* Doctor Schedule Info */}
               {newAppointment.doctor && (
                 <Grid item xs={12}>
                   <Alert severity="info" sx={{ mt: 1 }}>
                     <Typography variant="body2">
                       <strong>📅 {t('doctor_schedule')}:</strong> 09:00 - 17:00
                       <br />
                       <strong>🚫 {t('off_days')}:</strong> {t('none')}
                       <br />
                       <strong>🏥 {t('specialty')}:</strong> {t('general_practice')}
                     </Typography>
                   </Alert>
                 </Grid>
               )}

               {/* Time Conflict Check */}
               {newAppointment.date && newAppointment.time && newAppointment.doctor && (
                 <Grid item xs={12}>
                   {appointmentList.some(apt => 
                     apt.date === newAppointment.date && 
                     apt.doctor === newAppointment.doctor && 
                     apt.time === newAppointment.time &&
                     apt.id !== selectedAppointment?.id
                   ) ? (
                     <Alert severity="warning">
                                                <Typography variant="body2">
                           ⚠️ <strong>{t('time_conflict')}:</strong> {t('doctor_has_appointment_at_time', {
                             doctor: newAppointment.doctor,
                             time: newAppointment.time,
                             date: newAppointment.date
                           })}
                         </Typography>
                     </Alert>
                   ) : (
                     <Alert severity="success">
                                                <Typography variant="body2">
                           ✅ <strong>{t('time_available')}:</strong> {t('doctor_is_free_at_time', {
                             doctor: newAppointment.doctor,
                             time: newAppointment.time,
                             date: newAppointment.date
                           })}
                         </Typography>
                     </Alert>
                   )}
                 </Grid>
               )}

               {/* Location/Room */}
               <Grid item xs={12} md={6}>
                 <TextField 
                   fullWidth 
                   label={t('location_room')} 
                   placeholder={t('location_placeholder')}
                   value={newAppointment.location}
                   onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                   InputProps={{
                     startAdornment: <InputAdornment position="start">🏥</InputAdornment>
                   }}
                 />
               </Grid>

               {/* Appointment Summary */}
               {newAppointment.patient && newAppointment.doctor && newAppointment.date && newAppointment.time && (
                 <Grid item xs={12}>
                   <Card sx={{ 
                     p: 2, 
                     background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 35%, rgba(0, 212, 255, 0.05) 100%)',
                     backdropFilter: 'blur(10px)',
                     border: '1px solid rgba(9, 9, 121, 0.2)',
                     borderRadius: 2,
                     boxShadow: '0 4px 15px rgba(9, 9, 121, 0.1)',
                   }}>
                     <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                       📅 {t('appointment_summary')}
                     </Typography>
                     <Grid container spacing={2}>
                       <Grid item xs={12} sm={6}>
                         <Typography variant="body2">
                           <strong>{t('patient')}:</strong> {newAppointment.patient}
                         </Typography>
                       </Grid>
                       <Grid item xs={12} sm={6}>
                         <Typography variant="body2">
                           <strong>{t('doctor')}:</strong> {newAppointment.doctor}
                         </Typography>
                       </Grid>
                       <Grid item xs={12} sm={6}>
                         <Typography variant="body2">
                           <strong>{t('date_time')}:</strong> {newAppointment.date} {t('at')} {newAppointment.time}
                         </Typography>
                       </Grid>
                       <Grid item xs={12} sm={6}>
                         <Typography variant="body2">
                           <strong>{t('duration')}:</strong> {newAppointment.duration} {t('minutes')}
                         </Typography>
                       </Grid>
                     </Grid>
                   </Card>
                 </Grid>
               )}

               {/* Notes */}
               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label={t('additional_notes')}
                   multiline
                   rows={3}
                   placeholder={t('notes_placeholder')}
                   value={newAppointment.notes}
                   onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                   InputProps={{
                     startAdornment: <InputAdornment position="start">📝</InputAdornment>
                   }}
                 />
               </Grid>
             </Grid>
           </DialogContent>
           <DialogActions>
             <Button onClick={() => {
               setAddAppointmentOpen(false);
               setEditDialogOpen(false);
               setSelectedAppointment(null);
             }}>
               {t('cancel')}
             </Button>
             <Button variant="contained" onClick={handleSaveAppointment}>
               {selectedAppointment ? t('update_appointment') : t('schedule_appointment')}
             </Button>
           </DialogActions>
         </Dialog>

         {/* View Notes Dialog */}
         <Dialog
           open={viewNotesOpen}
           onClose={() => setViewNotesOpen(false)}
           maxWidth="sm"
           fullWidth
         >
           <DialogTitle>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Avatar sx={{ backgroundColor: 'primary.main' }}>
                 {selectedAppointment?.patientAvatar}
               </Avatar>
               <Box>
                 <Typography variant="h6">{selectedAppointment?.patient}</Typography>
                 <Typography variant="caption" color="text.secondary">
                   {t(selectedAppointment?.type?.toLowerCase().replace(/\s+/g, '_') || '')} • {selectedAppointment?.date} {t('at')} {selectedAppointment?.time}
                 </Typography>
               </Box>
             </Box>
           </DialogTitle>
           <DialogContent>
             <Box sx={{ mt: 2 }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t('appointment_details')}
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography variant="body2" color="text.secondary">{t('doctor')}:</Typography>
                   <Typography variant="body2">{selectedAppointment?.doctor}</Typography>
                 </Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography variant="body2" color="text.secondary">{t('duration')}:</Typography>
                   <Typography variant="body2">{selectedAppointment?.duration} {t('minutes')}</Typography>
                 </Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography variant="body2" color="text.secondary">{t('location')}:</Typography>
                   <Typography variant="body2">{selectedAppointment?.location}</Typography>
                 </Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography variant="body2" color="text.secondary">{t('priority')}:</Typography>
                   <Chip 
                     label={t(selectedAppointment?.priority || '')} 
                     size="small" 
                     variant="outlined"
                     sx={{ 
                       borderColor: getPriorityColor(selectedAppointment?.priority || 'normal'),
                       color: getPriorityColor(selectedAppointment?.priority || 'normal')
                     }}
                   />
                 </Box>
               </Box>
               
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                 {t('notes')}
               </Typography>
               <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                 <Typography variant="body2" color="text.secondary">
                   {selectedAppointment?.notes || t('no_notes_available')}
                 </Typography>
               </Paper>
               
               <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                 <Button
                   variant="outlined"
                   startIcon={<Phone />}
                   sx={{ color: '#25D366', borderColor: '#25D366' }}
                   onClick={(e) => {
                     e.stopPropagation();
                     if (selectedAppointment) {
                       const message = t('whatsapp_appointment_message', {
                         patient: selectedAppointment.patient,
                         type: selectedAppointment.type,
                         date: selectedAppointment.date,
                         time: selectedAppointment.time
                       });
                       const phone = selectedAppointment.phone?.replace(/\D/g, '') || '';
                       window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                     }
                   }}
                 >
                   {t('whatsapp_patient')}
                 </Button>
                 <Button
                   variant="outlined"
                   startIcon={<Edit />}
                   onClick={(e) => {
                     e.stopPropagation();
                     setViewNotesOpen(false);
                     handleEditAppointment(selectedAppointment!);
                   }}
                 >
                   {t('edit_appointment')}
                 </Button>
               </Box>
             </Box>
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setViewNotesOpen(false)}>{t('close')}</Button>
           </DialogActions>
         </Dialog>

         {/* Quick Status Edit Menu */}
         <Menu
           anchorEl={statusMenuAnchor}
           open={Boolean(statusMenuAnchor)}
           onClose={() => {
             setStatusMenuAnchor(null);
             setStatusEditAppointment(null);
           }}
           PaperProps={{
             sx: { minWidth: 200 }
           }}
         >
           <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
               {t('change_status')}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {statusEditAppointment?.patient}
             </Typography>
           </Box>
           
           <MenuItem 
             onClick={() => handleStatusChange('confirmed')}
             selected={statusEditAppointment?.status === 'confirmed'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 icon={<CheckCircle fontSize="small" />}
                 label={t('confirmed')} 
                 color="success" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('confirmed')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleStatusChange('pending')}
             selected={statusEditAppointment?.status === 'pending'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 icon={<AccessTime fontSize="small" />}
                 label={t('pending')} 
                 color="warning" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('pending_confirmation')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleStatusChange('cancelled')}
             selected={statusEditAppointment?.status === 'cancelled'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 icon={<Cancel fontSize="small" />}
                 label={t('cancelled')} 
                 color="error" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('cancelled')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleStatusChange('rescheduled')}
             selected={statusEditAppointment?.status === 'rescheduled'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 icon={<Schedule fontSize="small" />}
                 label={t('rescheduled')} 
                 color="info" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('rescheduled')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleStatusChange('completed')}
             selected={statusEditAppointment?.status === 'completed'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 icon={<CheckCircle fontSize="small" />}
                 label={t('completed')} 
                 color="success" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('completed')} 💰</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleStatusChange('no-show')}
             selected={statusEditAppointment?.status === 'no-show'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 label={t('no_show')} 
                 size="small" 
                 variant="outlined" 
                 sx={{
                   borderColor: 'rgba(2, 0, 36, 0.6)',
                   color: 'rgba(2, 0, 36, 0.9)',
                   background: 'linear-gradient(135deg, rgba(2, 0, 36, 0.05) 0%, rgba(9, 9, 121, 0.08) 100%)',
                   fontWeight: 600,
                 }}
               />
               <Typography variant="body2">{t('no_show')}</Typography>
             </Box>
           </MenuItem>
                 </Menu>

         {/* Quick Payment Status Edit Menu */}
         <Menu
           anchorEl={paymentStatusMenuAnchor}
           open={Boolean(paymentStatusMenuAnchor)}
           onClose={() => {
             setPaymentStatusMenuAnchor(null);
             setPaymentStatusEditAppointment(null);
           }}
           PaperProps={{
             sx: { minWidth: 200 }
           }}
         >
           <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
               {t('change_payment_status')}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {paymentStatusEditAppointment?.patient}
             </Typography>
           </Box>
           
           <MenuItem 
             onClick={() => handlePaymentStatusChange('pending')}
             selected={paymentStatusEditAppointment?.paymentStatus === 'pending'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 label="🟡 Pending" 
                 color="warning" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('payment_pending')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handlePaymentStatusChange('paid')}
             selected={paymentStatusEditAppointment?.paymentStatus === 'paid'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 label="🟢 Paid" 
                 color="success" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('payment_completed')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handlePaymentStatusChange('partial')}
             selected={paymentStatusEditAppointment?.paymentStatus === 'partial'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 label="🟠 Partial" 
                 color="info" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('payment_partial')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handlePaymentStatusChange('overdue')}
             selected={paymentStatusEditAppointment?.paymentStatus === 'overdue'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Chip 
                 label="🔴 Overdue" 
                 color="error" 
                 size="small" 
                 variant="outlined" 
               />
               <Typography variant="body2">{t('payment_overdue')}</Typography>
             </Box>
           </MenuItem>
         </Menu>

         {/* Quick Type Edit Menu */}
         <Menu
           anchorEl={typeMenuAnchor}
           open={Boolean(typeMenuAnchor)}
           onClose={() => {
             setTypeMenuAnchor(null);
             setTypeEditAppointment(null);
           }}
           PaperProps={{
             sx: { minWidth: 220 }
           }}
         >
           <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
               {t('change_appointment_type')}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {typeEditAppointment?.patient}
             </Typography>
           </Box>
           
           <MenuItem 
             onClick={() => handleTypeChange('Consultation')}
             selected={typeEditAppointment?.type === 'Consultation'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <MedicalServices fontSize="small" color="primary" />
               <Typography variant="body2">{t('consultation')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleTypeChange('Check-up')}
             selected={typeEditAppointment?.type === 'Check-up'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Assignment fontSize="small" color="info" />
               <Typography variant="body2">{t('check_up')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleTypeChange('Follow-up')}
             selected={typeEditAppointment?.type === 'Follow-up'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Schedule fontSize="small" color="warning" />
               <Typography variant="body2">{t('follow_up')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleTypeChange('Surgery Consultation')}
             selected={typeEditAppointment?.type === 'Surgery Consultation'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <LocalHospital fontSize="small" color="error" />
               <Typography variant="body2">{t('surgery_consultation')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleTypeChange('Emergency')}
             selected={typeEditAppointment?.type === 'Emergency'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Warning fontSize="small" color="error" />
               <Typography variant="body2">{t('emergency')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleTypeChange('Vaccination')}
             selected={typeEditAppointment?.type === 'Vaccination'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <MedicalServices fontSize="small" color="success" />
               <Typography variant="body2">{t('vaccination')}</Typography>
             </Box>
           </MenuItem>
           
           <MenuItem 
             onClick={() => handleTypeChange('Lab Review')}
             selected={typeEditAppointment?.type === 'Lab Review'}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Assignment fontSize="small" color="info" />
               <Typography variant="body2">{t('lab_review')}</Typography>
             </Box>
           </MenuItem>
         </Menu>

        {/* Reschedule Appointment Dialog */}
        <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)}>
          <DialogTitle>
            {t('reschedule')} - {rescheduleAppointment?.patient}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('new_date')}
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('new_time')}
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRescheduleDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveReschedule} variant="contained">
              {t('reschedule')}
            </Button>
          </DialogActions>
        </Dialog>

        </Container>
  );
};

export default AppointmentListPage;