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
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  CalendarToday,
  Schedule,
  People,
  CheckCircle,
  AccessTime,
  Cancel,
  Edit,
  Delete,
  Visibility,
  Phone,
  LocationOn,
  TrendingUp,
  Warning,
  Today,
  ViewWeek,
  ViewModule,
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

const appointments = [
  {
    id: 1,
    patient: 'Ahmed Al-Rashid',
    patientAvatar: 'AR',
    date: '2024-01-20',
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
  },
  {
    id: 2,
    patient: 'Fatima Hassan',
    patientAvatar: 'FH',
    date: '2024-01-20',
    time: '3:25 PM',
    timeSlot: '15:25',
    duration: 30,
    doctor: 'Dr. Sarah Ahmed',
    type: 'Check-up',
    status: 'confirmed',
    location: 'Room 101',
    phone: '+971 50 234 5678',
    notes: 'Routine blood pressure check',
    completed: true,
    priority: 'normal',
  },
  {
    id: 3,
    patient: 'Mohammed Ali',
    patientAvatar: 'MA',
    date: '2024-01-20',
    time: '3:55 PM',
    timeSlot: '15:55',
    duration: 20,
    doctor: 'Dr. Sarah Ahmed',
    type: 'Follow-up',
    status: 'confirmed',
    location: 'Room 101',
    phone: '+971 50 345 6789',
    notes: 'Asthma medication review',
    completed: false,
    priority: 'normal',
  },
  {
    id: 4,
    patient: 'Sara Ahmed',
    patientAvatar: 'SA',
    date: '2024-01-20',
    time: '4:15 PM',
    timeSlot: '16:15',
    duration: 30,
    doctor: 'Dr. Sarah Ahmed',
    type: 'Surgery Consultation',
    status: 'confirmed',
    location: 'Room 101',
    phone: '+971 50 456 7890',
    notes: 'Pre-operative consultation',
    completed: false,
    priority: 'high',
  },
  {
    id: 5,
    patient: 'Omar Khalil',
    patientAvatar: 'OK',
    date: '2024-01-20',
    time: '4:45 PM',
    timeSlot: '16:45',
    duration: 25,
    doctor: 'Dr. Sarah Ahmed',
    type: 'Consultation',
    status: 'pending',
    location: 'Room 101',
    phone: '+971 50 567 8901',
    notes: 'First-time consultation',
    completed: false,
    priority: 'normal',
  },
];

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
  const [appointmentList, setAppointmentList] = useState(appointments);
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
    setAppointmentList(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, completed: !apt.completed, status: apt.completed ? 'confirmed' : 'completed' }
          : apt
      )
    );
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

  const handleSaveAppointment = () => {
    if (selectedAppointment) {
      // Edit existing appointment
      setAppointmentList(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, ...newAppointment }
            : apt
        )
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
        priority: newAppointment.priority
      };
      
      setAppointmentList(prev => [...prev, newApt]);
      setAddAppointmentOpen(false);
    }
    
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
      case 2: // Pending
        filtered = filtered.filter(apt => !apt.completed);
        break;
      case 3: // Completed
        filtered = filtered.filter(apt => apt.completed);
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
                startIcon={<Add />}
                onClick={() => setAddAppointmentOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Schedule Appointment
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

          <Grid container spacing={3}>
            {/* Main Appointments View */}
            <Grid item xs={12} lg={8}>
              <Card>
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

                  {/* Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                      <Tab label={`All (${filteredAppointments.length})`} />
                      <Tab label={`Today (${filteredAppointments.filter(apt => apt.date === selectedDate).length})`} />
                      <Tab label={`Pending (${filteredAppointments.filter(apt => !apt.completed).length})`} />
                      <Tab label={`Completed (${filteredAppointments.filter(apt => apt.completed).length})`} />
                    </Tabs>
                  </Box>

                  {/* Appointments List - Table View */}
                  {viewMode === 'table' && (
                    <TabPanel value={tabValue} index={0}>
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
                                      No appointments found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Schedule your first appointment to get started
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
                                  <Chip
                                    icon={getStatusIcon(appointment.status)}
                                    label={appointment.completed ? 'completed' : appointment.status}
                                    color={appointment.completed ? 'success' : getStatusColor(appointment.status) as any}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="View Notes">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleViewNotes(appointment)}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Appointment">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleEditAppointment(appointment)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="WhatsApp Patient">
                                      <IconButton 
                                        size="small" 
                                        sx={{ color: '#25D366' }}
                                        onClick={() => {
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
                    </TabPanel>
                  )}

                  {/* Appointments List - Cards View */}
                  {viewMode === 'cards' && (
                    <TabPanel value={tabValue} index={0}>
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
                                No appointments found
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Schedule your first appointment to get started
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
                                  <Chip
                                    icon={getStatusIcon(appointment.status)}
                                    label={appointment.status}
                                    color={getStatusColor(appointment.status) as any}
                                    size="small"
                                    variant="outlined"
                                  />
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
                                      onClick={() => {
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
                    </TabPanel>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar - Quick Info */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Today's Schedule - Todo Style */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Today's Schedule
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {calculateEstimatedFinishTime()}
                      </Typography>
                    </Box>
                    <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
                      {todayAppointments.length === 0 ? (
                        <ListItem sx={{ justifyContent: 'center', py: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              No appointments scheduled for today
                            </Typography>
                          </Box>
                        </ListItem>
                      ) : (
                        todayAppointments.map((appointment, index) => (
                          <React.Fragment key={appointment.id}>
                            <ListItem 
                              sx={{ 
                                px: 0, 
                                py: 1,
                                opacity: appointment.completed ? 0.6 : 1,
                                borderLeft: `3px solid ${getPriorityColor(appointment.priority)}`,
                                pl: 1,
                                '&:hover': { backgroundColor: 'action.hover' },
                                cursor: 'pointer'
                              }}
                              onClick={() => handleViewNotes(appointment)}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAppointmentCompletion(appointment.id);
                                }}
                                sx={{ 
                                  mr: 1,
                                  color: appointment.completed ? 'success.main' : 'text.secondary',
                                  '&:hover': { backgroundColor: 'primary.light' }
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: appointment.completed ? 'success.main' : 'primary.main',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {appointment.patientAvatar}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
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
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="primary.main">
                                      {appointment.time} ({appointment.duration}m)
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      {appointment.type}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const message = `Hello ${appointment.patient}, this is a reminder for your ${appointment.type} appointment today at ${appointment.time}.`;
                                    const phone = appointment.phone.replace(/\D/g, '');
                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                  }}
                                  sx={{ color: '#25D366' }}
                                >
                                  <Phone fontSize="small" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < todayAppointments.length - 1 && <Divider sx={{ ml: 6 }} />}
                          </React.Fragment>
                        ))
                      )}
                    </List>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        ⏱️ {getRemainingTime()} • {pendingToday} patients remaining
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => setAddAppointmentOpen(true)}
                      >
                        Schedule Appointment
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<CalendarToday />}
                        onClick={() => setTabValue(1)}
                      >
                        Today's Schedule ({todayAppointments.length})
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<People />}
                        onClick={() => window.location.href = '/patients'}
                      >
                        Patient List
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<Warning />}
                        onClick={() => {
                          setActiveFilters(prev => ({ ...prev, status: 'pending' }));
                          setTabValue(2);
                        }}
                      >
                        Pending Confirmations ({appointmentList.filter(apt => apt.status === 'pending').length})
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Quick Stats
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Duration
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {Math.round(appointmentList.reduce((sum, apt) => sum + apt.duration, 0) / appointmentList.length)} min
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Completion Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {Math.round((appointmentList.filter(apt => apt.completed).length / appointmentList.length) * 100)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          High Priority
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="warning.main">
                          {appointmentList.filter(apt => apt.priority === 'high' || apt.priority === 'urgent').length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Today's Load
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color={todayAppointments.length > 5 ? 'error.main' : 'success.main'}>
                          {todayAppointments.length}/8 slots
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
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
                    onClick={() => {
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
                    onClick={() => {
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
        </Container>
      </Box>
    </Box>
  );
};

export default AppointmentListPage; 