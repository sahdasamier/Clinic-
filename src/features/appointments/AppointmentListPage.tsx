import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore
} from 'firebase/firestore';
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
import {
  appointmentTypesOptions,
  priorityLevels,
  type AppointmentData,
} from '../../data/mockData';

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
      borderRadius: { xs: 2, md: 3 },
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

// Main Component
const AppointmentListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, initialized } = useAuth();
  const { userProfile } = useUser();
  
  // State Management
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // ✅ Firestore-powered appointment state
  const [appointmentList, setAppointmentList] = useState<FirestoreAppointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
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
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  // ✅ Initialize available patients with empty array (no localStorage)
  const [availablePatients, setAvailablePatients] = useState<any[]>([]);

  // ✅ Set up Firestore listeners for real-time data
  useEffect(() => {
    // Wait for auth to be initialized and user to be available
    if (!initialized || authLoading || !user || !userProfile) {
      console.log('🔄 AppointmentListPage: Waiting for auth initialization...', {
        initialized,
        authLoading,
        hasUser: !!user,
        hasUserProfile: !!userProfile
      });
      return;
    }

    console.log('✅ AppointmentListPage: Setting up Firestore listeners...');
    setDataLoading(true);

    const clinicId = userProfile.clinicId;

    // Set up real-time listeners
    const unsubscribeAppointments = AppointmentService.listenAppointments(clinicId, (updatedAppointments) => {
      console.log(`📅 Appointments updated: ${updatedAppointments.length} appointments`);
      setAppointmentList(updatedAppointments);
      setDataLoading(false);
    });

    const unsubscribePatients = PatientService.listenPatients(clinicId, (updatedPatients) => {
      console.log(`👥 Patients updated: ${updatedPatients.length} patients`);
      setAvailablePatients(updatedPatients);
    });

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
    
    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Firestore listeners...');
      unsubscribeAppointments();
      unsubscribePatients();
      window.removeEventListener('userDataCleared', handleUserDataCleared);
      window.removeEventListener('openAddAppointment', handleOpenAddAppointment);
    };
  }, [initialized, authLoading, user, userProfile]);

  // ✅ Real-time Firestore listener for doctors
  useEffect(() => {
    const db = getFirestore();
    const clinicId = userProfile?.clinicId;
    
    if (!clinicId) {
      console.log('🔄 AppointmentListPage: Waiting for clinicId...');
      return;
    }

    console.log('🔄 AppointmentListPage: Setting up real-time doctor listener for clinic:', clinicId);

    const q = query(
      collection(db, 'users'),
      where('clinicId', '==', clinicId),
      where('role', '==', 'doctor'),
      where('isActive', '==', true)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Doctor[];
      setAvailableDoctors(list);
      console.log('✅ AppointmentListPage: Real-time doctors updated:', list.length);
    }, (error) => {
      console.error('❌ AppointmentListPage: Error in doctor listener:', error);
      // Fallback to empty array on error
      setAvailableDoctors([]);
    });

    return () => {
      console.log('🔄 AppointmentListPage: Cleaning up doctor listener');
      unsub();
    };
  }, [userProfile?.clinicId]);

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
      
      // ✅ Use Firestore service instead of localStorage
      await AppointmentService.updateAppointment(statusEditAppointment.id, {
        status: newStatus as any,
        completed: newStatus === 'completed'
      });
      
      // If appointment is being marked as completed, create auto-payment
      if (newStatus === 'completed' && previousStatus !== 'completed') {
        await handleAppointmentCompletion(statusEditAppointment);
      }
      
      // ✅ State updates automatically via real-time listener!
      console.log('✅ Appointment status updated via Firestore');
      
      setStatusMenuAnchor(null);
      setStatusEditAppointment(null);
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!paymentStatusEditAppointment) return;

    try {
      // ✅ Use Firestore service instead of localStorage
      await AppointmentService.updateAppointment(paymentStatusEditAppointment.id, {
        paymentStatus: newPaymentStatus as any
      });
      
      // ✅ State updates automatically via real-time listener!
      console.log('✅ Payment status updated via Firestore');
      
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
      
      // ✅ State updates automatically via real-time listener!
      console.log('✅ Appointment type updated via Firestore');
      
      setTypeMenuAnchor(null);
      setTypeEditAppointment(null);
    } catch (error) {
      console.error('❌ Error updating appointment type:', error);
    }
  };

  // Handle appointment completion and auto-payment creation
  const handleAppointmentCompletion = async (appointment: Appointment) => {
    try {
      console.log(`🏥 Creating payment for completed appointment: ${appointment.id}`);
      
      // ✅ Create payment using Firestore service
      const paymentData = {
        patientId: appointment.patientId || 'legacy-patient',
        patient: appointment.patient,
        amount: 100, // Default amount - should be configurable
        date: ServiceUtils.getToday(),
        invoiceDate: appointment.date,
        dueDate: appointment.date,
        status: 'paid' as const,
        method: 'cash' as const,
        category: 'consultation' as const,
        description: `Payment for ${appointment.type} appointment`,
        currency: 'USD',
        isActive: true
      };

      const paymentId = await PaymentService.createPayment(userProfile!.clinicId, paymentData);
      
      // Update appointment payment status to 'paid'
      await AppointmentService.updateAppointment(appointment.id, {
        paymentStatus: 'paid'
      });

      console.log(`✅ Payment ${paymentId} created and marked as PAID`);
      
      // Dispatch custom event to notify Payment Management about new revenue
      window.dispatchEvent(new CustomEvent('appointmentCompletedWithPayment', {
        detail: {
          appointment,
          payment: { id: paymentId, ...paymentData },
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
        // ✅ UPDATE: Use Firestore service instead of localStorage
        const updatedData = {
          patient: newAppointment.patient,
          doctor: newAppointment.doctor,
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

        await AppointmentService.updateAppointment(selectedAppointment.id, updatedData);
        setEditDialogOpen(false);
        console.log('✅ Appointment updated via Firestore service');
      } else {
        // ✅ CREATE: Use Firestore service instead of localStorage
        const appointmentData = {
          patient: newAppointment.patient,
          patientId: 'legacy-patient', // TODO: Get actual patient ID
          doctor: newAppointment.doctor,
          doctorId: userProfile.id || 'default-doctor',
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

        await AppointmentService.createAppointment(userProfile.clinicId, appointmentData);
        setAddAppointmentOpen(false);
        console.log('✅ Appointment created via Firestore service');
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
      alert('Failed to save appointment. Please try again.');
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
    let filtered = appointmentList.filter(appointment => {
      const matchesSearch = searchQuery === '' || 
        appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = activeFilters.status === '' ||
        appointment.status === activeFilters.status;

      const matchesType = activeFilters.type === '' ||
        appointment.type.toLowerCase().includes(activeFilters.type.toLowerCase());

      const matchesPriority = activeFilters.priority === '' ||
        appointment.priority === activeFilters.priority;

      const matchesCompleted = activeFilters.completed === '' ||
        (activeFilters.completed === 'completed' && appointment.completed) ||
        (activeFilters.completed === 'pending' && !appointment.completed);

      const matchesDoctor = activeFilters.doctor === '' ||
        appointment.doctor.toLowerCase().includes(activeFilters.doctor.toLowerCase());

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
  const todayAppointments = appointmentList
    .filter(apt => apt.date === selectedDate)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  
  const upcomingAppointments = appointmentList.filter(apt => new Date(apt.date) > new Date(selectedDate));
  const completedToday = todayAppointments.filter(apt => apt.completed).length;
  const pendingToday = todayAppointments.filter(apt => !apt.completed).length;

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
            Loading appointment data...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we load your appointment information
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Enhanced Header Section */}
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
                  <Typography 
                    variant="h6"
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    🩺 {t('comprehensive_appointment_scheduling')}
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
             <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
               📊 {t('appointment_statistics')}
             </Typography>
             <Grid container spacing={3}>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 2, 
                   backgroundColor: 'rgba(255,255,255,0.8)', 
                   borderRadius: 3,
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.2)'
                 }}>
                   <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                     {`${completedToday}/${todayAppointments.length}`}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('todays_progress')}
                   </Typography>
                 </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 2, 
                   backgroundColor: 'rgba(255,255,255,0.8)', 
                   borderRadius: 3,
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.2)'
                 }}>
                   <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                     {t('doctor hours display')}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('doctor_hours')}
                   </Typography>
                 </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 2, 
                   backgroundColor: 'rgba(255,255,255,0.8)', 
                   borderRadius: 3,
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.2)'
                 }}>
                   <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mb: 0.5 }}>
                     {appointmentList.filter(apt => apt.status === 'confirmed').length}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('confirmed_today')}
                   </Typography>
                 </Box>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Box sx={{ 
                   textAlign: 'center', 
                   p: 2, 
                   backgroundColor: 'rgba(255,255,255,0.8)', 
                   borderRadius: 3,
                   backdropFilter: 'blur(10px)',
                   border: '1px solid rgba(255,255,255,0.2)'
                 }}>
                   <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mb: 0.5 }}>
                     {generateAvailableTimeSlots().filter(slot => slot.available).length}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('available_slots')}
                   </Typography>
                 </Box>
               </Grid>
             </Grid>
           </CardContent>
         </Card>

         {/* Main Appointments Table */}
         <Card sx={{ 
           borderRadius: 4,
           boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
           border: '1px solid rgba(0,0,0,0.05)',
           overflow: 'hidden',
           mb: 4
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
                         startIcon={<ViewModule />}
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
                 background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
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
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                       total: appointmentList.length 
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
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                       boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                     },
                     '&:hover': {
                       backgroundColor: 'rgba(102, 126, 234, 0.1)',
                     }
                   },
                   '& .MuiTabs-indicator': {
                     height: 4,
                     borderRadius: '4px 4px 0 0',
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                         label={appointmentList.length} 
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
                         label={appointmentList.filter(apt => apt.date === selectedDate).length} 
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
                         label={appointmentList.filter(apt => !apt.completed).length} 
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
                         label={appointmentList.filter(apt => apt.completed).length} 
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
                         color="secondary"
                         sx={{ height: 20, fontSize: '0.75rem' }}
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
                     <TableHead>
                       <TableRow>
                         <TableCell sx={{ fontWeight: 600 }}>✓</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('patient')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('appointment_date')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('time_duration')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('type')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('priority')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('date_received')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('payment_status')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('status')}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                                                {filteredAppointments.length === 0 && getActiveFilterCount() > 0 ? (
                         <TableRow>
                           <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
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
                           <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
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
                               opacity: appointment.completed ? 0.6 : 1,
                               backgroundColor: appointment.completed ? '#f8f9fa' : 'inherit',
                               borderLeft: `4px solid ${getPriorityColor(appointment.priority)}`,
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
                                     backgroundColor: 'primary.main',
                                     fontSize: '0.875rem',
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
                                   label={t(appointment.type.toLowerCase().replace(/\s+/g, '_'))}
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
                             '&:hover': { boxShadow: 4 },
                             border: appointment.status === 'pending' ? '2px solid #F59E0B' : 'none',
                           }}>
                             <CardContent sx={{ p: 3 }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                   <Avatar
                                     sx={{
                                       width: 50,
                                       height: 50,
                                       mr: 2,
                                       backgroundColor: 'primary.main',
                                     }}
                                   >
                                     {appointment.patientAvatar}
                                   </Avatar>
                                   <Box>
                                     <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                       {appointment.patient}
                                     </Typography>
                                     <Typography variant="body2" color="text.secondary">
                                       {t(appointment.type.toLowerCase().replace(/\s+/g, '_'))}
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
                                       {t('received')}: {new Date(appointment.createdAt).toLocaleDateString()}
                                     </Typography>
                                   </Box>
                                 </Grid>
                                 <Grid item xs={6}>
                                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                     <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                     <Typography variant="body2" color="text.secondary">
                                       {appointment.doctor}
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
                                 <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                   <Typography variant="caption" color="text.secondary">
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
                                         color: appointment.completed ? 'success.main' : 'text.secondary',
                                         '&:hover': { backgroundColor: 'primary.light' }
                                       }}
                                     >
                                       <CheckCircle fontSize="small" />
                                     </IconButton>
                                   </Tooltip>
                                   <Button 
                                     size="small" 
                                     startIcon={<Phone />}
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
                                     {t('whatsapp')}
                                   </Button>
                                 </Box>
                                 <Chip
                                   label={t(appointment.priority)}
                                   size="small"
                                   variant="outlined"
                                   sx={{ 
                                     borderColor: getPriorityColor(appointment.priority),
                                     color: getPriorityColor(appointment.priority)
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
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                         <Typography variant="body2" sx={{ opacity: 0.9 }}>
                           {t('appointments_finishing_at', { 
                             count: todayAppointments.length, 
                             time: calculateEstimatedFinishTime() 
                           })}
                         </Typography>
                       </Box>
                     </Box>
                     <Chip 
                       label={t('done_count', { completed: completedToday, total: todayAppointments.length })}
                       sx={{ 
                         backgroundColor: 'rgba(255,255,255,0.2)', 
                         color: 'white',
                         fontWeight: 600
                       }}
                     />
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
                               <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                 {appointment.patientAvatar}
                               </Avatar>
                               <Typography variant="body2" fontWeight={600}>
                                 {appointment.patient}
                               </Typography>
                             </Box>
                             <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                               {appointment.time} • {t(appointment.type.toLowerCase().replace(/\s+/g, '_'))}
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
  
             {/* Performance Insights */}
             <Grid item xs={12} md={4}>
               <Card sx={{ 
                 borderRadius: 3, 
                 boxShadow: 3,
                 background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                 color: 'white',
                 height: '100%',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
                 <Box sx={{ 
                   position: 'absolute', 
                   bottom: 0, 
                   left: 0, 
                   width: 80, 
                   height: 80, 
                   background: 'rgba(255,255,255,0.1)', 
                   borderRadius: '50%', 
                   transform: 'translate(-20px, 20px)' 
                 }} />
                 <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                     <TrendingUp sx={{ fontSize: 28, mr: 2 }} />
                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
                       {t('performance_today')}
                     </Typography>
                   </Box>
                   
                   <Box sx={{ mb: 3 }}>
                     <Typography variant="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
                       {Math.round((completedToday / (todayAppointments.length || 1)) * 100)}%
                     </Typography>
                     <Typography variant="body2" sx={{ opacity: 0.9 }}>
                       {t('completion_rate')}
                     </Typography>
                   </Box>
  
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Typography variant="body2" sx={{ opacity: 0.9 }}>
                         {t('completed')}
                       </Typography>
                       <Typography variant="body2" fontWeight={600}>
                         {completedToday}/{todayAppointments.length}
                       </Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Typography variant="body2" sx={{ opacity: 0.9 }}>
                         {t('time_remaining')}
                       </Typography>
                       <Typography variant="body2" fontWeight={600}>
                         {getRemainingTime().split(' remaining')[0]}
                       </Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Typography variant="body2" sx={{ opacity: 0.9 }}>
                         {t('avg_duration')}
                       </Typography>
                       <Typography variant="body2" fontWeight={600}>
                         {Math.round(appointmentList.reduce((sum, apt) => sum + apt.duration, 0) / appointmentList.length)} {t('min')}
                       </Typography>
                     </Box>
                   </Box>
                 </CardContent>
               </Card>
             </Grid>
  
             {/* Analytics Dashboard */}
             <Grid item xs={12}>
               <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                 <CardContent sx={{ p: 4 }}>
                   <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <BarChart sx={{ color: 'primary.main' }} />
                     {t('clinic_analytics_overview')}
                   </Typography>
                   
                   <Grid container spacing={3}>
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 2, 
                         backgroundColor: '#E3F2FD',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'rgba(25, 118, 210, 0.1)', 
                           borderRadius: '50%' 
                         }} />
                         <CalendarToday sx={{ fontSize: 32, color: '#1976D2', mb: 1 }} />
                         <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976D2', mb: 0.5 }}>
                           {appointmentList.length}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           {t('total_appointments')}
                         </Typography>
                       </Box>
                     </Grid>
  
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 2, 
                         backgroundColor: '#E8F5E8',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'rgba(46, 125, 50, 0.1)', 
                           borderRadius: '50%' 
                         }} />
                         <CheckCircle sx={{ fontSize: 32, color: '#2E7D32', mb: 1 }} />
                         <Typography variant="h4" sx={{ fontWeight: 800, color: '#2E7D32', mb: 0.5 }}>
                           {appointmentList.filter(apt => apt.completed).length}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           {t('completed')}
                         </Typography>
                       </Box>
                     </Grid>
  
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 2, 
                         backgroundColor: '#FFF3E0',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'rgba(245, 124, 0, 0.1)', 
                           borderRadius: '50%' 
                         }} />
                         <Warning sx={{ fontSize: 32, color: '#F57C00', mb: 1 }} />
                         <Typography variant="h4" sx={{ fontWeight: 800, color: '#F57C00', mb: 0.5 }}>
                           {appointmentList.filter(apt => apt.status === 'pending').length}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           {t('pending_confirmation')}
                         </Typography>
                       </Box>
                     </Grid>
  
                     <Grid item xs={12} sm={6} md={3}>
                       <Box sx={{ 
                         p: 3, 
                         borderRadius: 2, 
                         backgroundColor: '#FCE4EC',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden'
                       }}>
                         <Box sx={{ 
                           position: 'absolute', 
                           top: -20, 
                           right: -20, 
                           width: 60, 
                           height: 60, 
                           background: 'rgba(194, 24, 91, 0.1)', 
                           borderRadius: '50%' 
                         }} />
                         <TrendingUp sx={{ fontSize: 32, color: '#C2185B', mb: 1 }} />
                         <Typography variant="h4" sx={{ fontWeight: 800, color: '#C2185B', mb: 0.5 }}>
                           {appointmentList.filter(apt => apt.priority === 'high' || apt.priority === 'urgent').length}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
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
                       <MenuItem key={d.id} value={d.id}>
                         {d.firstName} {d.lastName}
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

               {/* Hour Selection */}
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>{t('hour')}</InputLabel>
                   <Select 
                     label={t('hour')}
                     value={newAppointment.hour}
                     onChange={(e) => {
                       const hour = e.target.value;
                       const minute = newAppointment.minute;
                       let timeDisplay = '';
                       if (hour && minute) {
                         const hourNum = parseInt(hour);
                         const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
                         const ampm = hourNum >= 12 ? 'PM' : 'AM';
                         timeDisplay = `${displayHour}:${minute} ${ampm}`;
                       }
                       setNewAppointment(prev => ({ 
                         ...prev, 
                         hour: e.target.value,
                         time: timeDisplay
                       }));
                     }}
                   >
                     {Array.from({length: 24}, (_, i) => (
                       <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                         {i.toString().padStart(2, '0')}:00 ({i < 12 ? 'AM' : 'PM'})
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>

               {/* Minute Selection */}
               <Grid item xs={12} md={3}>
                 <FormControl fullWidth>
                   <InputLabel>{t('minutes')}</InputLabel>
                   <Select 
                     label={t('minutes')}
                     value={newAppointment.minute}
                     onChange={(e) => {
                       const hour = newAppointment.hour;
                       const minute = e.target.value;
                       let timeDisplay = '';
                       if (hour && minute) {
                         const hourNum = parseInt(hour);
                         const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
                         const ampm = hourNum >= 12 ? 'PM' : 'AM';
                         timeDisplay = `${displayHour}:${minute} ${ampm}`;
                       }
                       setNewAppointment(prev => ({ 
                         ...prev, 
                         minute: e.target.value,
                         time: timeDisplay
                       }));
                     }}
                   >
                     {['00', '15', '30', '45'].map((minute) => (
                       <MenuItem key={minute} value={minute}>
                         {minute}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>

               {/* Time Display */}
               {newAppointment.time && (
                 <Grid item xs={12} md={6}>
                   <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <AccessTime fontSize="small" />
                     <Typography variant="body2">
                       {t('selected_time')}: <strong>{newAppointment.time}</strong>
                     </Typography>
                   </Alert>
                 </Grid>
               )}

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
                   <Card sx={{ p: 2, backgroundColor: '#f0f7ff', border: '1px solid #2196f3' }}>
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
                 color="secondary" 
                 size="small" 
                 variant="outlined" 
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
        </Container>
  );
};

export default AppointmentListPage;