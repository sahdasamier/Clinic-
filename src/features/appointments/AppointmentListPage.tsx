import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@mui/material';
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
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Storage key for appointments (same as notifications system)
const APPOINTMENTS_STORAGE_KEY = 'clinic_appointments_data';

// EXPORT: Load appointments from localStorage
export const loadAppointmentsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.warn('Error loading appointments from localStorage:', error);
  }
  return getDefaultAppointments();
};

// EXPORT: Save appointments to localStorage
export const saveAppointmentsToStorage = (appointments: any[]) => {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    // Trigger storage event for other components (like notifications) to detect changes
    window.dispatchEvent(new Event('appointmentsUpdated'));
  } catch (error) {
    console.warn('Error saving appointments to localStorage:', error);
  }
};

// EXPORT: Default appointments data
export const getDefaultAppointments = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 1,
      patient: 'Ahmed Al-Rashid',
      patientAvatar: 'AR',
      date: tomorrow.toISOString().split('T')[0],
      time: '3:00 PM',
      timeSlot: '15:00',
      duration: 25,
      doctor: 'Dr. Sarah Ahmed',
      type: 'Consultation',
      status: 'confirmed',
      location: 'Room 101',
      phone: '+971 50 123 4567',
      notes: 'Follow-up for diabetes management',
      completed: false,
      priority: 'normal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      patient: 'Fatima Hassan',
      patientAvatar: 'FH',
      date: today.toISOString().split('T')[0],
      time: '4:00 PM',
      timeSlot: '16:00',
      duration: 30,
      doctor: 'Dr. Ahmed Omar',
      type: 'Check-up',
      status: 'confirmed',
      location: 'Room 102',
      phone: '+971 50 234 5678',
      notes: 'Routine blood pressure check',
      completed: false,
      priority: 'normal',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      patient: 'Mohammed Ali',
      patientAvatar: 'MA',
      date: yesterday.toISOString().split('T')[0],
      time: '10:00 AM',
      timeSlot: '10:00',
      duration: 45,
      doctor: 'Dr. Mohammed Ali',
      type: 'Follow-up',
      status: 'no-show',
      location: 'Room 103',
      phone: '+971 50 345 6789',
      notes: 'Cardiology follow-up',
      completed: false,
      priority: 'normal',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      patient: 'Sara Ahmed',
      patientAvatar: 'SA',
      date: today.toISOString().split('T')[0],
      time: '4:15 PM',
      timeSlot: '16:15',
      duration: 30,
      doctor: 'Dr. Sarah Ahmed',
      type: 'Surgery Consultation',
      status: 'cancelled',
      location: 'Room 101',
      phone: '+971 50 456 7890',
      notes: 'Pre-operative consultation',
      completed: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      patient: 'Omar Khalil',
      patientAvatar: 'OK',
      date: today.toISOString().split('T')[0],
      time: '2:00 PM',
      timeSlot: '14:00',
      duration: 15,
      doctor: 'Dr. Fatima Hassan',
      type: 'Dermatology',
      status: 'pending',
      location: 'Room 104',
      phone: '+971 50 567 8901',
      notes: 'Skin condition consultation',
      completed: false,
      priority: 'normal',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 6,
      patient: 'Layla Al-Zahra',
      patientAvatar: 'LZ',
      date: tomorrow.toISOString().split('T')[0],
      time: '10:30 AM',
      timeSlot: '10:30',
      duration: 20,
      doctor: 'Dr. Sarah Ahmed',
      type: 'Pediatrics',
      status: 'confirmed',
      location: 'Room 101',
      phone: '+971 50 678 9012',
      notes: 'Routine child checkup',
      completed: false,
      priority: 'normal',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 7,
      patient: 'Hassan Mahmoud',
      patientAvatar: 'HM',
      date: today.toISOString().split('T')[0],
      time: '11:00 AM',
      timeSlot: '11:00',
      duration: 45,
      doctor: 'Dr. Mohammed Ali',
      type: 'Cardiology',
      status: 'completed',
      location: 'Room 103',
      phone: '+971 50 789 0123',
      notes: 'Heart checkup - all results normal',
      completed: true,
      priority: 'high',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 8,
      patient: 'Nadia Abdullah',
      patientAvatar: 'NA',
      date: yesterday.toISOString().split('T')[0],
      time: '3:30 PM',
      timeSlot: '15:30',
      duration: 15,
      doctor: 'Dr. Fatima Hassan',
      type: 'Dermatology',
      status: 'completed',
      location: 'Room 104',
      phone: '+971 50 890 1234',
      notes: 'Skin treatment - excellent progress',
      completed: true,
      priority: 'normal',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

const appointments = getDefaultAppointments();

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AppointmentListPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentList, setAppointmentList] = useState<any[]>([]);

  // Load appointments from localStorage on component mount
  useEffect(() => {
    const savedAppointments = loadAppointmentsFromStorage();
    setAppointmentList(savedAppointments);
  }, []);
  const [doctorStartTime] = useState('15:00'); // 3:00 PM start time
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    type: '',
    priority: '',
    completed: '',
    doctor: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewNotesOpen, setViewNotesOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusEditAppointment, setStatusEditAppointment] = useState<any>(null);
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    doctor: '',
    date: selectedDate,
    time: '',
    type: '',
    duration: 25,
    priority: 'normal',
    location: '',
    notes: '',
    phone: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleAppointmentCompletion = (appointmentId: number) => {
    const updatedList = appointmentList.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, completed: !apt.completed, status: apt.completed ? 'confirmed' : 'completed' }
        : apt
    );
    setAppointmentList(updatedList);
    saveAppointmentsToStorage(updatedList);
  };

  const calculateEstimatedFinishTime = () => {
    const todayAppointments = appointmentList
      .filter(apt => apt.date === selectedDate && !apt.completed)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    if (todayAppointments.length === 0) return 'No pending appointments';

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
      for (let minute = 0; minute < 60; minute += 20) { // 20-minute intervals
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        // Check if slot is available
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
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const handleFilterSelect = (filterType: string, filterValue: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: filterValue
    }));
    setFilterAnchor(null);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNewAppointment({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      duration: appointment.duration,
      priority: appointment.priority,
      location: appointment.location,
      notes: appointment.notes,
      phone: appointment.phone
    });
    setEditDialogOpen(true);
  };

  const handleViewNotes = (appointment: any) => {
    setSelectedAppointment(appointment);
    setViewNotesOpen(true);
  };

  // Add status editing functions
  const handleQuickStatusEdit = (appointment: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row/card click
    setStatusEditAppointment(appointment);
    setStatusMenuAnchor(event.currentTarget as HTMLElement);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!statusEditAppointment) return;

    const updatedList = appointmentList.map(apt => 
      apt.id === statusEditAppointment.id 
        ? { ...apt, status: newStatus }
        : apt
    );
    
    setAppointmentList(updatedList);
    saveAppointmentsToStorage(updatedList);
    setStatusMenuAnchor(null);
    setStatusEditAppointment(null);
  };

  const handleSaveAppointment = () => {
    let updatedList;
    
    if (selectedAppointment) {
      // Edit existing appointment
      updatedList = appointmentList.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, ...newAppointment }
          : apt
      );
      setEditDialogOpen(false);
    } else {
      // Add new appointment
      const timeSlot = new Date(`2024-01-01T${newAppointment.time}`).toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const newApt = {
        id: Math.max(...appointmentList.map(a => a.id)) + 1,
        patient: newAppointment.patient,
        patientAvatar: newAppointment.patient.split(' ').map(n => n[0]).join(''),
        date: newAppointment.date,
        time: newAppointment.time,
        timeSlot: timeSlot,
        duration: newAppointment.duration,
        doctor: newAppointment.doctor,
        type: newAppointment.type,
        status: 'confirmed',
        location: newAppointment.location,
        phone: newAppointment.phone,
        notes: newAppointment.notes,
        completed: false,
        priority: newAppointment.priority,
        createdAt: new Date().toISOString(),
      };
      
      updatedList = [...appointmentList, newApt];
      setAddAppointmentOpen(false);
    }
    
    setAppointmentList(updatedList);
    saveAppointmentsToStorage(updatedList);
    
    // Reset form
    setNewAppointment({
      patient: '',
      doctor: '',
      date: selectedDate,
      time: '',
      type: '',
      duration: 25,
      priority: 'normal',
      location: '',
      notes: '',
      phone: ''
    });
    setSelectedAppointment(null);
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
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'rescheduled':
        return 'info';
      case 'no-show':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <AccessTime fontSize="small" />;
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'cancelled':
        return <Cancel fontSize="small" />;
      case 'rescheduled':
        return <Schedule fontSize="small" />;
      case 'no-show':
        return <Cancel fontSize="small" />;
      default:
        return <Schedule fontSize="small" />;
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointmentList.filter(appointment => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.phone.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = activeFilters.status === '' ||
        appointment.status === activeFilters.status;

      // Type filter
      const matchesType = activeFilters.type === '' ||
        appointment.type.toLowerCase().includes(activeFilters.type.toLowerCase());

      // Priority filter
      const matchesPriority = activeFilters.priority === '' ||
        appointment.priority === activeFilters.priority;

      // Completed filter
      const matchesCompleted = activeFilters.completed === '' ||
        (activeFilters.completed === 'completed' && appointment.completed) ||
        (activeFilters.completed === 'pending' && !appointment.completed);

      // Doctor filter
      const matchesDoctor = activeFilters.doctor === '' ||
        appointment.doctor.toLowerCase().includes(activeFilters.doctor.toLowerCase());

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesCompleted && matchesDoctor;
    });

    // Apply tab-specific filtering
    switch (tabValue) {
      case 1: // Today
        filtered = filtered.filter(apt => apt.date === selectedDate);
        break;
      case 2: // Pending (not completed)
        filtered = filtered.filter(apt => !apt.completed);
        break;
      case 3: // Completed
        filtered = filtered.filter(apt => apt.completed);
        break;
      case 4: // Confirmed Status
        filtered = filtered.filter(apt => apt.status === 'confirmed');
        break;
      case 5: // Pending Confirmation Status
        filtered = filtered.filter(apt => apt.status === 'pending');
        break;
      case 6: // Cancelled Status
        filtered = filtered.filter(apt => apt.status === 'cancelled');
        break;
      case 7: // Rescheduled Status
        filtered = filtered.filter(apt => apt.status === 'rescheduled');
        break;
      case 8: // No-show Status
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
                <CalendarToday sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {t('appointments')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage and schedule patient appointments
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setAddAppointmentOpen(true)}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 10px 2px rgba(255, 105, 135, .3)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Schedule New Appointment
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Schedule"
                value={`${completedToday}/${todayAppointments.length}`}
                icon={<Today />}
                color="#3B82F6"
                subtitle={`${pendingToday} remaining`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Doctor Hours"
                value="3PM - 8PM"
                icon={<Schedule />}
                color="#10B981"
                subtitle="5 hours available"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Estimated Finish"
                value={calculateEstimatedFinishTime()}
                icon={<AccessTime />}
                color="#F59E0B"
                subtitle={getRemainingTime()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Available Slots"
                value={generateAvailableTimeSlots().filter(slot => slot.available).length}
                icon={<CalendarToday />}
                color="#8B5CF6"
                subtitle="20-min intervals"
              />
            </Grid>
          </Grid>

          {/* Main Appointments Table - Full Width */}
          <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
            <CardContent sx={{ p: 0 }}>
                  {/* Search and Filters */}
                  <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          placeholder="Search appointments by patient, doctor, type, or phone..."
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
                            {activeFilters.status && (
                              <Chip
                                label={`Status: ${activeFilters.status}`}
                                size="small"
                                onDelete={() => handleFilterSelect('status', '')}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {activeFilters.type && (
                              <Chip
                                label={`Type: ${activeFilters.type}`}
                                size="small"
                                onDelete={() => handleFilterSelect('type', '')}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {activeFilters.priority && (
                              <Chip
                                label={`Priority: ${activeFilters.priority}`}
                                size="small"
                                onDelete={() => handleFilterSelect('priority', '')}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {activeFilters.completed && (
                              <Chip
                                label={`Status: ${activeFilters.completed}`}
                                size="small"
                                onDelete={() => handleFilterSelect('completed', '')}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {activeFilters.doctor && (
                              <Chip
                                label={`Doctor: ${activeFilters.doctor}`}
                                size="small"
                                onDelete={() => handleFilterSelect('doctor', '')}
                                color="primary"
                                variant="outlined"
                              />
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
                            startIcon={<ViewWeek />}
                          >
                            Table
                          </Button>
                          <Button
                            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('cards')}
                            startIcon={<ViewModule />}
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
                        Showing {filteredAppointments.length} of {appointmentList.length} appointments
                        {getActiveFilterCount() > 0 && ` with ${getActiveFilterCount()} filter(s) applied`}
                      </Typography>
                    </Box>
                  )}

                  {/* Enhanced Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
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
                          '&.Mui-selected': {
                            color: 'primary.main',
                          }
                        },
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderRadius: '3px 3px 0 0',
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
                            <span>All</span>
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
                            <span>Today</span>
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
                            <span>Pending</span>
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
                            <span>Completed</span>
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
                            <span>Confirmed</span>
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
                            <span>Pending Conf.</span>
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
                            <span>Cancelled</span>
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
                            <span>Rescheduled</span>
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
                            <span>No-show</span>
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

                  {/* Appointments List - Table View */}
                  {viewMode === 'table' && (
                    <Box sx={{ py: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>✓</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Time & Duration</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredAppointments.length === 0 && getActiveFilterCount() > 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                  <Box>
                                    <FilterList sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                      No appointments match your filters
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
                            ) : filteredAppointments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                  <Box>
                                    <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                      {tabValue === 1 ? 'No appointments scheduled for today' :
                                       tabValue === 2 ? 'No pending appointments' :
                                       tabValue === 3 ? 'No completed appointments' :
                                       tabValue === 4 ? 'No confirmed appointments' :
                                       tabValue === 5 ? 'No pending confirmation appointments' :
                                       tabValue === 6 ? 'No cancelled appointments' :
                                       tabValue === 7 ? 'No rescheduled appointments' :
                                       tabValue === 8 ? 'No no-show appointments' :
                                       'No appointments found'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {tabValue === 1 ? 'Schedule some appointments for today' :
                                       tabValue === 2 ? 'All appointments are completed or confirmed' :
                                       tabValue === 3 ? 'Complete some appointments to see them here' :
                                       tabValue === 4 ? 'No appointments with confirmed status yet' :
                                       tabValue === 5 ? 'All appointments have been confirmed' :
                                       tabValue === 6 ? 'No appointments have been cancelled' :
                                       tabValue === 7 ? 'No appointments have been rescheduled' :
                                       tabValue === 8 ? 'No patients have missed their appointments' :
                                       'Schedule your first appointment to get started'}
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
                                  <Tooltip title={appointment.completed ? "Mark as pending" : "Mark as completed"}>
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
                                      {appointment.time}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {appointment.duration} minutes
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{appointment.type}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={appointment.priority}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: getPriorityColor(appointment.priority),
                                      color: getPriorityColor(appointment.priority)
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Click to change status" arrow>
                                    <Chip
                                      icon={getStatusIcon(appointment.status)}
                                      label={appointment.completed ? 'completed' : appointment.status}
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
                                    <Tooltip title="View Notes">
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
                                    <Tooltip title="Edit Appointment">
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
                                    <Tooltip title="WhatsApp Patient">
                                      <IconButton 
                                        size="small" 
                                        sx={{ color: '#25D366' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const message = `Hello ${appointment.patient}, this is a reminder for your ${appointment.type} appointment today at ${appointment.time}.`;
                                          const phone = appointment.phone.replace(/\D/g, '');
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

                  {/* Appointments List - Cards View */}
                  {viewMode === 'cards' && (
                    <Box sx={{ py: 3 }}>
                      <Grid container spacing={3} sx={{ p: 3 }}>
                        {filteredAppointments.length === 0 && getActiveFilterCount() > 0 ? (
                          <Grid item xs={12}>
                            <Card sx={{ p: 6, textAlign: 'center' }}>
                              <FilterList sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                                No appointments match your filters
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
                        ) : filteredAppointments.length === 0 ? (
                          <Grid item xs={12}>
                            <Card sx={{ p: 6, textAlign: 'center' }}>
                              <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                                {tabValue === 1 ? 'No appointments scheduled for today' :
                                 tabValue === 2 ? 'No pending appointments' :
                                 tabValue === 3 ? 'No completed appointments' :
                                 tabValue === 4 ? 'No confirmed appointments' :
                                 tabValue === 5 ? 'No pending confirmation appointments' :
                                 tabValue === 6 ? 'No cancelled appointments' :
                                 tabValue === 7 ? 'No rescheduled appointments' :
                                 tabValue === 8 ? 'No no-show appointments' :
                                 'No appointments found'}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {tabValue === 1 ? 'Schedule some appointments for today' :
                                 tabValue === 2 ? 'All appointments are completed or confirmed' :
                                 tabValue === 3 ? 'Complete some appointments to see them here' :
                                 tabValue === 4 ? 'No appointments with confirmed status yet' :
                                 tabValue === 5 ? 'All appointments have been confirmed' :
                                 tabValue === 6 ? 'No appointments have been cancelled' :
                                 tabValue === 7 ? 'No appointments have been rescheduled' :
                                 tabValue === 8 ? 'No patients have missed their appointments' :
                                 'Schedule your first appointment to get started'}
                              </Typography>
                              <Button 
                                variant="contained" 
                                onClick={() => setAddAppointmentOpen(true)}
                                startIcon={<Add />}
                              >
                                Schedule Appointment
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
                                        {appointment.type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Tooltip title="Click to change status" arrow>
                                    <Chip
                                      icon={getStatusIcon(appointment.status)}
                                      label={appointment.status}
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
                                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        {appointment.date}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="primary.main" fontWeight={600}>
                                        {appointment.time}
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
                                      Notes: {appointment.notes}
                                    </Typography>
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title={appointment.completed ? "Mark as pending" : "Mark as completed"}>
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
                                        const message = `Hello ${appointment.patient}, this is a reminder for your ${appointment.type} appointment today at ${appointment.time}.`;
                                        const phone = appointment.phone.replace(/\D/g, '');
                                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                      }}
                                    >
                                      WhatsApp
                                    </Button>
                                  </Box>
                                  <Chip
                                    label={appointment.priority}
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

          {/* Professional Dashboard Sections Below Main Table */}
          <Grid container spacing={4}>
            {/* Today's Schedule Section */}
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
                          Today's Schedule
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {todayAppointments.length} appointments • Finishing at {calculateEstimatedFinishTime()}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={`${completedToday}/${todayAppointments.length} Done`}
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
                         No appointments today
                       </Typography>
                       <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                         Enjoy your free day or schedule some appointments
                       </Typography>
                       <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                         <Button
                           variant="outlined"
                           startIcon={<Add />}
                           onClick={() => setAddAppointmentOpen(true)}
                           sx={{ 
                             color: 'white', 
                             borderColor: 'rgba(255,255,255,0.5)',
                             '&:hover': { 
                               borderColor: 'white',
                               backgroundColor: 'rgba(255,255,255,0.1)'
                             }
                           }}
                         >
                           Schedule
                         </Button>
                         <Button
                           variant="outlined"
                           startIcon={<People />}
                           onClick={() => window.location.href = '/patients'}
                           sx={{ 
                             color: 'white', 
                             borderColor: 'rgba(255,255,255,0.5)',
                             '&:hover': { 
                               borderColor: 'white',
                               backgroundColor: 'rgba(255,255,255,0.1)'
                             }
                           }}
                         >
                           Patients
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
                              {appointment.time} • {appointment.type}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Chip 
                                size="small" 
                                label={appointment.status}
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
                              more appointments
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Performance Insights */}
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
                      Performance Today
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {Math.round((completedToday / (todayAppointments.length || 1)) * 100)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completion Rate
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Completed
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {completedToday}/{todayAppointments.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Time Remaining
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {getRemainingTime().split(' remaining')[0]}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Avg. Duration
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {Math.round(appointmentList.reduce((sum, apt) => sum + apt.duration, 0) / appointmentList.length)} min
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Professional Analytics Dashboard */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChart sx={{ color: 'primary.main' }} />
                    Clinic Analytics Overview
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
                          Total Appointments
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
                          Completed
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
                          Pending Confirmation
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
                          High Priority
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
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filter Appointments
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
                  {getActiveFilterCount()} filter(s) active • {filteredAppointments.length} appointment(s) found
                </Typography>
              )}
            </Box>

            {/* Status Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Appointment Status
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('status', '')}
                selected={activeFilters.status === ''}
                dense
              >
                All Statuses
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'confirmed')}
                selected={activeFilters.status === 'confirmed'}
                dense
              >
                Confirmed
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'pending')}
                selected={activeFilters.status === 'pending'}
                dense
              >
                Pending
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'cancelled')}
                selected={activeFilters.status === 'cancelled'}
                dense
              >
                Cancelled
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'rescheduled')}
                selected={activeFilters.status === 'rescheduled'}
                dense
              >
                Rescheduled
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('status', 'no-show')}
                selected={activeFilters.status === 'no-show'}
                dense
              >
                No-show
              </MenuItem>
            </Box>

            {/* Completion Status Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Progress Status
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('completed', '')}
                selected={activeFilters.completed === ''}
                dense
              >
                All Progress
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('completed', 'completed')}
                selected={activeFilters.completed === 'completed'}
                dense
              >
                ✅ Completed
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('completed', 'pending')}
                selected={activeFilters.completed === 'pending'}
                dense
              >
                ⏱️ Pending
              </MenuItem>
            </Box>

            {/* Appointment Type Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Appointment Type
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('type', '')}
                selected={activeFilters.type === ''}
                dense
              >
                All Types
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('type', 'Consultation')}
                selected={activeFilters.type === 'Consultation'}
                dense
              >
                Consultation
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('type', 'Check-up')}
                selected={activeFilters.type === 'Check-up'}
                dense
              >
                Check-up
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('type', 'Follow-up')}
                selected={activeFilters.type === 'Follow-up'}
                dense
              >
                Follow-up
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('type', 'Surgery')}
                selected={activeFilters.type === 'Surgery'}
                dense
              >
                Surgery Consultation
              </MenuItem>
            </Box>

            {/* Priority Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Priority Level
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('priority', '')}
                selected={activeFilters.priority === ''}
                dense
              >
                All Priorities
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('priority', 'normal')}
                selected={activeFilters.priority === 'normal'}
                dense
              >
                🟢 Normal
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('priority', 'high')}
                selected={activeFilters.priority === 'high'}
                dense
              >
                🟡 High Priority
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('priority', 'urgent')}
                selected={activeFilters.priority === 'urgent'}
                dense
              >
                🔴 Urgent
              </MenuItem>
            </Box>

            {/* Doctor Filter */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Doctor
              </Typography>
              <MenuItem 
                onClick={() => handleFilterSelect('doctor', '')}
                selected={activeFilters.doctor === ''}
                dense
              >
                All Doctors
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('doctor', 'Dr. Sarah Ahmed')}
                selected={activeFilters.doctor === 'Dr. Sarah Ahmed'}
                dense
              >
                Dr. Sarah Ahmed
              </MenuItem>
              <MenuItem 
                onClick={() => handleFilterSelect('doctor', 'Dr. Ahmed Ali')}
                selected={activeFilters.doctor === 'Dr. Ahmed Ali'}
                dense
              >
                Dr. Ahmed Ali
              </MenuItem>
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
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>{selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    value={newAppointment.patient}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, patient: e.target.value }))}
                    placeholder="e.g., Ahmed Al-Rashid"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={newAppointment.phone}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g., +971 50 123 4567"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Doctor</InputLabel>
                    <Select 
                      label="Doctor"
                      value={newAppointment.doctor}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor: e.target.value }))}
                    >
                      <MenuItem value="Dr. Sarah Ahmed">Dr. Sarah Ahmed</MenuItem>
                      <MenuItem value="Dr. Ahmed Ali">Dr. Ahmed Ali</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Available Time Slots</InputLabel>
                    <Select 
                      label="Available Time Slots"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    >
                      {generateAvailableTimeSlots().map((slot) => (
                        <MenuItem 
                          key={slot.value} 
                          value={slot.label}
                          disabled={!slot.available && !selectedAppointment}
                          sx={{ 
                            color: slot.available || selectedAppointment ? 'text.primary' : 'text.disabled',
                            backgroundColor: slot.available || selectedAppointment ? 'inherit' : '#f5f5f5'
                          }}
                        >
                          {slot.label} {!slot.available && !selectedAppointment && '(Booked)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select 
                      label="Type"
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <MenuItem value="Consultation">Consultation</MenuItem>
                      <MenuItem value="Check-up">Check-up</MenuItem>
                      <MenuItem value="Follow-up">Follow-up</MenuItem>
                      <MenuItem value="Surgery Consultation">Surgery Consultation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Duration</InputLabel>
                    <Select 
                      label="Duration"
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    >
                      <MenuItem value={20}>20 minutes</MenuItem>
                      <MenuItem value={25}>25 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select 
                      label="Priority"
                      value={newAppointment.priority}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Doctor Hours: 3:00 PM - 8:00 PM
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Location/Room" 
                    placeholder="e.g., Room 101"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    placeholder="Additional notes about the appointment..."
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
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
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSaveAppointment}>
                {selectedAppointment ? 'Update Appointment' : 'Schedule Appointment'}
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
                    {selectedAppointment?.type} • {selectedAppointment?.date} at {selectedAppointment?.time}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Appointment Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Doctor:</Typography>
                    <Typography variant="body2">{selectedAppointment?.doctor}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Duration:</Typography>
                    <Typography variant="body2">{selectedAppointment?.duration} minutes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Location:</Typography>
                    <Typography variant="body2">{selectedAppointment?.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Priority:</Typography>
                    <Chip 
                      label={selectedAppointment?.priority} 
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
                  Notes
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAppointment?.notes || 'No notes available for this appointment.'}
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
                        const message = `Hello ${selectedAppointment.patient}, this is regarding your ${selectedAppointment.type} appointment on ${selectedAppointment.date} at ${selectedAppointment.time}.`;
                        const phone = selectedAppointment.phone.replace(/\D/g, '');
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                      }
                    }}
                  >
                    WhatsApp Patient
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewNotesOpen(false);
                      handleEditAppointment(selectedAppointment);
                    }}
                  >
                    Edit Appointment
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewNotesOpen(false)}>Close</Button>
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
                Change Status
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
                  label="Confirmed" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Confirmed</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('pending')}
              selected={statusEditAppointment?.status === 'pending'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<AccessTime fontSize="small" />}
                  label="Pending" 
                  color="warning" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Pending Confirmation</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('cancelled')}
              selected={statusEditAppointment?.status === 'cancelled'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<Cancel fontSize="small" />}
                  label="Cancelled" 
                  color="error" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Cancelled</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('rescheduled')}
              selected={statusEditAppointment?.status === 'rescheduled'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<Schedule fontSize="small" />}
                  label="Rescheduled" 
                  color="info" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">Rescheduled</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleStatusChange('no-show')}
              selected={statusEditAppointment?.status === 'no-show'}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="No-show" 
                  color="secondary" 
                  size="small" 
                  variant="outlined" 
                />
                <Typography variant="body2">No-show</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Container>
      </Box>
    </Box>
  );
};

export default AppointmentListPage; 