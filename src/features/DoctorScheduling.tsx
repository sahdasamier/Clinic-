import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Schedule,
  LocalHospital,
  Person,
  EventAvailable,
  EventBusy,
  Groups,
  Add,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

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
      id={`scheduling-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Doctor schedules with working hours and off days
const doctorSchedules = [
  {
    id: 1,
    name: 'Dr. Ahmed Omar',
    avatar: 'AO',
    specialty: 'General Medicine',
    workingHours: { start: '16:00', end: '20:00' }, // 4 PM to 8 PM
    offDays: ['friday'], // Off on Friday
    maxPatientsPerHour: 2,
    consultationDuration: 30, // minutes
  },
  {
    id: 2,
    name: 'Dr. Sarah Ahmed',
    avatar: 'SA',
    specialty: 'Pediatrics',
    workingHours: { start: '09:00', end: '17:00' }, // 9 AM to 5 PM
    offDays: ['friday', 'saturday'], // Off on weekends
    maxPatientsPerHour: 3,
    consultationDuration: 20,
  },
  {
    id: 3,
    name: 'Dr. Mohammed Ali',
    avatar: 'MA',
    specialty: 'Cardiology',
    workingHours: { start: '10:00', end: '18:00' }, // 10 AM to 6 PM
    offDays: ['friday'],
    maxPatientsPerHour: 2,
    consultationDuration: 45,
  },
  {
    id: 4,
    name: 'Dr. Fatima Hassan',
    avatar: 'FH',
    specialty: 'Dermatology',
    workingHours: { start: '14:00', end: '22:00' }, // 2 PM to 10 PM
    offDays: ['friday', 'sunday'],
    maxPatientsPerHour: 4,
    consultationDuration: 15,
  },
];

// Appointment interface
interface Appointment {
  id?: number;
  doctorId: number;
  date: string;
  time: string;
  patient?: string;
  duration: number;
  isAvailableSlot?: boolean; // New field to distinguish available slots from actual appointments
}

// Sample appointments data (these are REAL appointments with patients)
const initialAppointments: Appointment[] = [
  // Dr. Ahmed Omar - Monday 4-6 PM has 4 patients (RESERVED)
  { id: 1, doctorId: 1, date: '2024-01-15', time: '16:00', patient: 'Ahmed Al-Rashid', duration: 30 },
  { id: 2, doctorId: 1, date: '2024-01-15', time: '16:30', patient: 'Fatima Hassan', duration: 30 },
  { id: 3, doctorId: 1, date: '2024-01-15', time: '17:00', patient: 'Omar Khalil', duration: 30 },
  { id: 4, doctorId: 1, date: '2024-01-15', time: '17:30', patient: 'Sara Ahmed', duration: 30 },
  
  // Dr. Sarah Ahmed - Tuesday appointments (RESERVED)
  { id: 5, doctorId: 2, date: '2024-01-16', time: '09:00', patient: 'Ali Hassan', duration: 20 },
  { id: 6, doctorId: 2, date: '2024-01-16', time: '09:20', patient: 'Noor Ahmed', duration: 20 },
  { id: 7, doctorId: 2, date: '2024-01-16', time: '10:00', patient: 'Layla Omar', duration: 20 },
  
  // Dr. Mohammed Ali - Wednesday appointments (RESERVED)
  { id: 8, doctorId: 3, date: '2024-01-17', time: '10:00', patient: 'Hassan Mahmoud', duration: 45 },
  { id: 9, doctorId: 3, date: '2024-01-17', time: '11:00', patient: 'Nadia Abdullah', duration: 45 },
];

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

const DoctorSchedulingPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDoctorForAdd, setSelectedDoctorForAdd] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    time: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // New state for doctor management
  const [doctors, setDoctors] = useState(doctorSchedules);
  const [addDoctorDialogOpen, setAddDoctorDialogOpen] = useState(false);
  const [doctorFormData, setDoctorFormData] = useState({
    name: '',
    specialty: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    offDays: [] as string[],
    consultationDuration: 30,
    maxPatientsPerHour: 2,
  });

  // Time slot editing state
  const [editTimeSlotDialogOpen, setEditTimeSlotDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    doctorId: number;
    time: string;
    type: 'regular' | 'available' | 'reserved';
    appointment?: Appointment;
  } | null>(null);
  const [timeSlotFormData, setTimeSlotFormData] = useState({
    time: '',
    type: 'regular' as 'regular' | 'available' | 'reserved',
    patientName: '',
    patientPhone: '',
    appointmentType: 'consultation',
    notes: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get day of week for selected date
  const getSelectedDayOfWeek = () => {
    const date = new Date(selectedDate);
    return daysOfWeek[date.getDay()];
  };

  // Check if doctor is working on selected date
  const isDoctorWorking = (doctor: Doctor) => {
    const dayOfWeek = getSelectedDayOfWeek();
    return !doctor.offDays.includes(dayOfWeek);
  };

  // Get working doctors for selected date
  const getWorkingDoctors = () => {
    return doctors.filter(doctor => isDoctorWorking(doctor));
  };

  // Get appointments for a doctor on selected date
  const getDoctorAppointments = (doctorId: number, date: string) => {
    return appointments.filter((apt: Appointment) => apt.doctorId === doctorId && apt.date === date);
  };

  // Doctor interface
  interface Doctor {
    id: number;
    name: string;
    avatar: string;
    specialty: string;
    workingHours: { start: string; end: string };
    offDays: string[];
    consultationDuration: number;
  }

  // Generate time slots for a doctor (uses the new getAllTimeSlots function)
  const generateDoctorTimeSlots = (doctor: Doctor) => {
    return getAllTimeSlots(doctor.id);
  };

  // Get all time slots for a doctor (including custom ones from appointments)
  const getAllTimeSlots = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return [];
    
    // Get regular working hour slots
    const regularSlots: string[] = [];
    const startHour = parseInt(doctor.workingHours.start.split(':')[0]);
    const startMinute = parseInt(doctor.workingHours.start.split(':')[1]);
    const endHour = parseInt(doctor.workingHours.end.split(':')[0]);
    const endMinute = parseInt(doctor.workingHours.end.split(':')[1]);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += doctor.consultationDuration) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      regularSlots.push(timeSlot);
    }
    
    // Get custom time slots from appointments
    const customSlots = appointments
      .filter(apt => apt.doctorId === doctorId && apt.date === selectedDate)
      .map(apt => apt.time)
      .filter(time => !regularSlots.includes(time));
    
    // Combine and sort all slots
    const allSlots = [...regularSlots, ...customSlots].sort();
    
    return allSlots.map(timeSlot => {
      const appointment = appointments.find(apt => 
        apt.doctorId === doctorId && 
        apt.date === selectedDate && 
        apt.time === timeSlot
      );
      
      // Only mark as reserved if it has a real patient (not just an available slot)
      const isReserved = !!(appointment && appointment.patient && !appointment.isAvailableSlot);
      const isAvailableSlot = !!(appointment && appointment.isAvailableSlot);
      
      return {
        time: timeSlot,
        isReserved,
        isAvailableSlot,
        patient: appointment?.patient || null,
        appointment: appointment || null
      };
    });
  };

  // Handle add appointment
  const handleAddAppointment = (doctorId: number) => {
    setSelectedDoctorForAdd(doctorId);
    setFormData({ time: '' });
    setAddDialogOpen(true);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({ time: appointment.time });
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
    setMenuAnchor(null);
  };

  // Save new appointment - creates available time slot
  const handleSaveNew = () => {
    if (!selectedDoctorForAdd || !formData.time) {
      setSnackbar({
        open: true,
        message: '❌ Please select a doctor and enter a time',
        severity: 'error'
      });
      return;
    }

    // Check if time slot is already taken
    const existingAppointment = appointments.find(apt => 
      apt.doctorId === selectedDoctorForAdd && 
      apt.date === selectedDate && 
      apt.time === formData.time
    );

    if (existingAppointment) {
      const doctor = doctors.find(d => d.id === selectedDoctorForAdd);
      const slotType = existingAppointment.patient && !existingAppointment.isAvailableSlot 
        ? 'reserved appointment' 
        : existingAppointment.isAvailableSlot 
        ? 'available slot' 
        : 'time slot';
      
      setSnackbar({
        open: true,
        message: `❌ Time slot ${formData.time} already exists as a ${slotType} for ${doctor?.name}. Please choose a different time.`,
        severity: 'error'
      });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctorForAdd);
    const newAppointment: Appointment = {
      id: Math.max(...appointments.map(a => a.id || 0)) + 1,
      doctorId: selectedDoctorForAdd,
      date: selectedDate,
      time: formData.time,
      patient: '', // No patient - this is just an available slot
      duration: doctor?.consultationDuration || 30,
      isAvailableSlot: true,
    };

    setAppointments(prev => [...prev, newAppointment]);
    setAddDialogOpen(false);
    
    // Success notification
    const existingAppointmentsCount = appointments.filter(apt => 
      apt.doctorId === selectedDoctorForAdd && apt.date === selectedDate
    ).length;
    
    setSnackbar({
      open: true,
      message: `✅ Available time slot ${formData.time} added for ${doctor?.name} on ${selectedDate}. Doctor now has ${existingAppointmentsCount + 1} time slots.`,
      severity: 'success'
    });

    // Reset form
    setSelectedDoctorForAdd(null);
    setFormData({ time: '' });
  };

  // Save edited appointment
  const handleSaveEdit = () => {
    if (!formData.time || !selectedAppointment) {
      alert('Please fill all fields');
      return;
    }

    // Check if new time slot is already taken (excluding current appointment)
    const existingAppointment = appointments.find(apt => 
      apt.doctorId === selectedAppointment.doctorId && 
      apt.date === selectedDate && 
      apt.time === formData.time &&
      apt.id !== selectedAppointment.id
    );

    if (existingAppointment) {
      alert(`Time slot ${formData.time} is already reserved`);
      return;
    }

    setAppointments(prev => prev.map(apt => 
      apt.id === selectedAppointment.id 
        ? { ...apt, time: formData.time }
        : apt
    ));
    setEditDialogOpen(false);
    setSelectedAppointment(null);
    setFormData({ time: '' });
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    event.stopPropagation();
    setSelectedAppointment(appointment);
    setMenuAnchor(event.currentTarget);
  };

  // Handle add new doctor
  const handleAddDoctor = () => {
    setDoctorFormData({
      name: '',
      specialty: '',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      offDays: [],
      consultationDuration: 30,
      maxPatientsPerHour: 2,
    });
    setAddDoctorDialogOpen(true);
  };

  // Handle save new doctor
  const handleSaveNewDoctor = () => {
    if (!doctorFormData.name.trim() || !doctorFormData.specialty.trim()) {
      setSnackbar({
        open: true,
        message: '❌ Please fill in doctor name and specialty',
        severity: 'error'
      });
      return;
    }

    // Generate avatar initials
    const nameParts = doctorFormData.name.trim().split(' ');
    const avatar = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : doctorFormData.name.substring(0, 2).toUpperCase();

    const newDoctor = {
      id: Math.max(...doctors.map(d => d.id)) + 1,
      name: doctorFormData.name.trim(),
      avatar: avatar,
      specialty: doctorFormData.specialty.trim(),
      workingHours: { 
        start: doctorFormData.workingHoursStart, 
        end: doctorFormData.workingHoursEnd 
      },
      offDays: doctorFormData.offDays,
      maxPatientsPerHour: doctorFormData.maxPatientsPerHour,
      consultationDuration: doctorFormData.consultationDuration,
    };

    setDoctors(prev => [...prev, newDoctor]);
    setAddDoctorDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: `✅ Doctor ${doctorFormData.name} added successfully!`,
      severity: 'success'
        });
  };

  // Handle time slot click for editing
  const handleTimeSlotClick = (doctorId: number, timeSlot: string, type: 'regular' | 'available' | 'reserved', appointment?: Appointment) => {
    // Determine actual slot type based on appointment data
    let actualSlotType: 'regular' | 'available' | 'reserved' = 'regular';
    
    if (appointment) {
      if (appointment.patient && !appointment.isAvailableSlot) {
        actualSlotType = 'reserved';
      } else if (appointment.isAvailableSlot) {
        actualSlotType = 'available';
      }
    }
    
    setSelectedTimeSlot({
      doctorId,
      time: timeSlot,
      type: actualSlotType,
      appointment: appointment || undefined
    });
    
    setTimeSlotFormData({
      time: timeSlot,
      type: actualSlotType,
      patientName: appointment?.patient || '',
      patientPhone: '',
      appointmentType: 'consultation',
      notes: '',
    });
    
    setEditTimeSlotDialogOpen(true);
  };

  // Handle save time slot edit
  const handleSaveTimeSlotEdit = () => {
    if (!selectedTimeSlot) return;

    // If changing to reserved, need patient name
    if (timeSlotFormData.type === 'reserved' && !timeSlotFormData.patientName.trim()) {
      setSnackbar({
        open: true,
        message: '❌ Patient name is required for reserved appointments',
        severity: 'error'
      });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedTimeSlot.doctorId);
    
    // Remove any existing appointment for this time slot and date
    setAppointments(prev => prev.filter(apt => 
      !(apt.doctorId === selectedTimeSlot.doctorId && 
        apt.date === selectedDate && 
        apt.time === selectedTimeSlot.time)
    ));

    // Add new appointment based on type (only for available and reserved)
    if (timeSlotFormData.type === 'available' || timeSlotFormData.type === 'reserved') {
      const newAppointment: Appointment = {
        id: Math.max(...(appointments.length > 0 ? appointments.map(a => a.id || 0) : [0])) + 1,
        doctorId: selectedTimeSlot.doctorId,
        date: selectedDate,
        time: selectedTimeSlot.time,
        patient: timeSlotFormData.type === 'reserved' ? timeSlotFormData.patientName.trim() : '',
        duration: doctor?.consultationDuration || 30,
        isAvailableSlot: timeSlotFormData.type === 'available',
      };
      
      setAppointments(prev => [...prev, newAppointment]);
    }
    // If type is 'regular', we just remove the appointment (already done above)

    setEditTimeSlotDialogOpen(false);
    setSelectedTimeSlot(null);
    
    const typeMessages = {
      regular: '✅ Converted to Regular Working Hours',
      available: '⏰ Converted to Available Slot',
      reserved: `🔒 Reserved for ${timeSlotFormData.patientName || 'Patient'}`
    };
    
    setSnackbar({
      open: true,
      message: typeMessages[timeSlotFormData.type],
      severity: 'success'
    });
  };

  // Calculate statistics
  const totalWorkingDoctors = getWorkingDoctors().length;
  const totalAppointmentsToday = appointments.filter((apt: Appointment) => apt.date === selectedDate).length;
  const busyDoctors = getWorkingDoctors().filter((doctor: Doctor) => 
    getDoctorAppointments(doctor.id, selectedDate).length > 0
  ).length;

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            borderRadius: 3,
            color: 'white',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    Doctor Scheduling
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage doctor schedules, working hours, and patient appointments
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={handleAddDoctor}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                    },
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add New Doctor
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Date Selection */}
          <Box sx={{ mb: 3 }}>
            <TextField
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mr: 2 }}
            />
            <Chip 
              label={`${getSelectedDayOfWeek().charAt(0).toUpperCase() + getSelectedDayOfWeek().slice(1)}`}
              color="primary"
              sx={{ ml: 1, textTransform: 'capitalize' }}
            />
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalWorkingDoctors}
                      </Typography>
                      <Typography variant="body1">Working Today</Typography>
                    </Box>
                    <LocalHospital sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalAppointmentsToday}
                      </Typography>
                      <Typography variant="body1">Total Appointments</Typography>
                    </Box>
                    <Groups sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {busyDoctors}
                      </Typography>
                      <Typography variant="body1">Doctors with Patients</Typography>
                    </Box>
                    <EventBusy sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalWorkingDoctors - busyDoctors}
                      </Typography>
                      <Typography variant="body1">Available Doctors</Typography>
                    </Box>
                    <EventAvailable sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Time Slot Legend */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                📊 Time Slot Color Guide
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="✅ 10:00" 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      backgroundColor: '#e8f5e8',
                      borderColor: '#4caf50',
                      color: '#2e7d32',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ✅ Regular Working Hours
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="⏰ 14:30" 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      backgroundColor: '#e3f2fd',
                      borderColor: '#2196f3',
                      color: '#1976d2',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ⏰ Available Slot (Added Manually)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="🔒 16:00" 
                    size="small" 
                    variant="filled"
                    sx={{ 
                      backgroundColor: '#ffcdd2',
                      borderColor: '#f44336',
                      color: '#d32f2f',
                      textDecoration: 'line-through',
                      fontWeight: 700,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    🔒 Reserved (Patient Appointment)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f7ff', borderRadius: 2, border: '1px solid #2196f3' }}>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  💡 Click on any time slot to edit its type or add patient details!
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Doctor Schedules" />
                <Tab label="Weekly Overview" />
                <Tab label="All Doctors" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Doctor Schedules for {new Date(selectedDate).toLocaleDateString()}
                </Typography>
                
                {/* Helpful notice */}
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    💡 <strong>How to add time slots:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    • Click the <strong>+ button</strong> next to any doctor to add time slots
                  </Typography>
                  <Typography variant="body2">
                    • You can add multiple time slots to the same doctor, even if they already have appointments
                  </Typography>
                  <Typography variant="body2">
                    • Only the exact same time slot will be blocked - different times are always allowed
                  </Typography>
                </Alert>

                <Grid container spacing={3}>
                  {getWorkingDoctors().map((doctor) => {
                    const doctorAppointments = getDoctorAppointments(doctor.id, selectedDate);
                    const timeSlots = generateDoctorTimeSlots(doctor);
                    const bookedSlots = timeSlots.filter(slot => slot.isReserved).length;
                    const totalSlots = timeSlots.length;
                    const availableSlots = totalSlots - bookedSlots;

                    return (
                      <Grid item xs={12} md={6} key={doctor.id}>
                        <Card sx={{ 
                          height: '100%',
                          border: doctorAppointments.length > 0 ? '2px solid #4caf50' : '2px solid #e0e0e0',
                          '&:hover': { boxShadow: 4 }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            {/* Doctor Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 56, 
                                    height: 56, 
                                    mr: 2, 
                                    backgroundColor: doctorAppointments.length > 0 ? '#4caf50' : '#2196f3',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {doctor.avatar}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {doctor.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {doctor.specialty}
                                  </Typography>
                                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                                    {doctor.workingHours.start} - {doctor.workingHours.end}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="Add Appointment">
                                  <IconButton 
                                    color="primary"
                                    onClick={() => handleAddAppointment(doctor.id)}
                                    size="small"
                                  >
                                    <Add />
                                  </IconButton>
                                </Tooltip>
                                <Badge 
                                  badgeContent={doctorAppointments.length} 
                                  color="primary"
                                  max={99}
                                >
                                  <Person sx={{ color: 'text.secondary' }} />
                                </Badge>
                              </Box>
                            </Box>

                            {/* Availability Stats */}
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Schedule Utilization
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {bookedSlots}/{totalSlots} slots
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={(bookedSlots / totalSlots) * 100} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: bookedSlots / totalSlots > 0.8 ? '#f44336' : 
                                                   bookedSlots / totalSlots > 0.6 ? '#ff9800' : '#4caf50'
                                  }
                                }} 
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" sx={{ color: '#4caf50' }}>
                                  {availableSlots} available
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#f44336' }}>
                                  {bookedSlots} reserved
                                </Typography>
                              </Box>
                            </Box>

                            {/* Time Slots */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                              Time Slots ({timeSlots.length} total):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {timeSlots.map((slot, index) => {
                                const slotType = slot.isReserved ? 'reserved' : 
                                               slot.isAvailableSlot ? 'available' : 'regular';
                                const slotIcon = slot.isReserved ? '🔒' : 
                                               slot.isAvailableSlot ? '⏰' : '✅';
                                
                                return (
                                  <Chip
                                    key={index}
                                    label={`${slotIcon} ${slot.time}`}
                                    size="small"
                                    variant={slot.isReserved ? 'filled' : 'outlined'}
                                    clickable
                                    onClick={() => handleTimeSlotClick(doctor.id, slot.time, slotType, slot.appointment || undefined)}
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      fontWeight: slot.isReserved ? 700 : 600,
                                      textDecoration: slot.isReserved ? 'line-through' : 'none',
                                      cursor: 'pointer',
                                      
                                      // ✅ Regular Working Hours (Green)
                                      ...(slotType === 'regular' && {
                                        backgroundColor: '#e8f5e8',
                                        borderColor: '#4caf50',
                                        color: '#2e7d32',
                                        '&:hover': { 
                                          backgroundColor: '#c8e6c8',
                                          borderColor: '#388e3c',
                                          transform: 'scale(1.05)',
                                        },
                                      }),
                                      
                                      // ⏰ Available Slot (Added Manually) (Blue)
                                      ...(slotType === 'available' && {
                                        backgroundColor: '#e3f2fd',
                                        borderColor: '#2196f3',
                                        color: '#1976d2',
                                        '&:hover': { 
                                          backgroundColor: '#bbdefb',
                                          borderColor: '#1976d2',
                                          transform: 'scale(1.05)',
                                        },
                                      }),
                                      
                                      // 🔒 Reserved (Patient Appointment) (Red)
                                      ...(slotType === 'reserved' && {
                                        backgroundColor: '#ffcdd2',
                                        borderColor: '#f44336',
                                        color: '#d32f2f',
                                        '&:hover': { 
                                          backgroundColor: '#ffb3ba',
                                          borderColor: '#d32f2f',
                                          transform: 'scale(1.05)',
                                        },
                                      }),
                                      
                                      transition: 'all 0.2s ease',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                      '&:hover': {
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                      }
                                    }}
                                    title={slot.isReserved ? `🔒 RESERVED: ${slot.patient} (Click to edit)` : 
                                          slot.isAvailableSlot ? `⏰ Available Slot (Click to edit)` :
                                          `✅ Regular Working Hours (Click to edit)`}
                                  />
                                );
                              })}
                            </Box>

                            {/* Reserved Appointments */}
                            {doctorAppointments.filter(apt => apt.patient && !apt.isAvailableSlot).length > 0 && (
                              <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                  🔒 Reserved Appointments ({doctorAppointments.filter(apt => apt.patient && !apt.isAvailableSlot).length}):
                                </Typography>
                                <List dense>
                                  {doctorAppointments.filter(apt => apt.patient && !apt.isAvailableSlot).map((apt: Appointment, index: number) => (
                                    <ListItem 
                                      key={index} 
                                      sx={{ 
                                        px: 0, 
                                        py: 0.5,
                                        backgroundColor: '#ffebee',
                                        borderRadius: 1,
                                        mb: 1,
                                        border: '2px solid #f44336'
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            🔒 {apt.time} - {apt.patient}
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption" color="text.secondary">
                                            {apt.duration} min • Dr. {doctor.name} • RESERVED APPOINTMENT
                                          </Typography>
                                        }
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton 
                                          size="small"
                                          onClick={(e) => handleMenuOpen(e, apt)}
                                        >
                                          <MoreVert fontSize="small" />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}

                            {/* Available Slots (manually added) */}
                            {doctorAppointments.filter(apt => apt.isAvailableSlot).length > 0 && (
                              <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                  ⏰ Available Slots ({doctorAppointments.filter(apt => apt.isAvailableSlot).length}):
                                </Typography>
                                <List dense>
                                  {doctorAppointments.filter(apt => apt.isAvailableSlot).map((apt: Appointment, index: number) => (
                                    <ListItem 
                                      key={index} 
                                      sx={{ 
                                        px: 0, 
                                        py: 0.5,
                                        backgroundColor: '#e3f2fd',
                                        borderRadius: 1,
                                        mb: 1,
                                        border: '2px solid #2196f3'
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ⏰ {apt.time} - Available
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption" color="text.secondary">
                                            {apt.duration} min • Dr. {doctor.name} • AVAILABLE SLOT
                                          </Typography>
                                        }
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton 
                                          size="small"
                                          onClick={(e) => handleMenuOpen(e, apt)}
                                        >
                                          <MoreVert fontSize="small" />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Doctors Off Today */}
                {doctors.filter(doctor => !isDoctorWorking(doctor)).length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                      Doctors Off Today ({getSelectedDayOfWeek()}):
                    </Typography>
                    <Grid container spacing={2}>
                      {doctors.filter(doctor => !isDoctorWorking(doctor)).map((doctor) => (
                        <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                          <Card sx={{ backgroundColor: '#f5f5f5', opacity: 0.7 }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 40, height: 40, mr: 2, backgroundColor: '#bdbdbd' }}>
                                  {doctor.avatar}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {doctor.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {doctor.specialty} • Day Off
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Weekly schedule overview showing all doctors' working patterns.
                </Alert>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                        {daysOfWeek.map((day) => (
                          <TableCell key={day} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {day.substring(0, 3)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 1.5, backgroundColor: 'primary.main' }}>
                                {doctor.avatar}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {doctor.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {doctor.specialty}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          {daysOfWeek.map((day) => (
                            <TableCell key={day}>
                              {doctor.offDays.includes(day) ? (
                                <Chip label="OFF" size="small" color="error" variant="outlined" />
                              ) : (
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {doctor.workingHours.start} - {doctor.workingHours.end}
                                </Typography>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  All Doctors ({doctors.length})
                </Typography>
                <List>
                  {doctors.map((doctor) => (
                    <React.Fragment key={doctor.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: 'primary.main' }}>
                            {doctor.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={doctor.name}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {doctor.specialty} • {doctor.workingHours.start} - {doctor.workingHours.end}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Off days: {doctor.offDays.join(', ') || 'None'} • 
                                Max {doctor.maxPatientsPerHour} patients/hour • 
                                {doctor.consultationDuration} min consultations
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </TabPanel>
          </Card>

          {/* Add Available Time Slot Dialog */}
          <Dialog 
            open={addDialogOpen} 
            onClose={() => setAddDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Add sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Add Available Time Slot
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Create availability for {doctors.find(d => d.id === selectedDoctorForAdd)?.name || 'doctor'}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: '#f8f9fa', 
                borderRadius: 2, 
                border: '1px solid #e9ecef',
                mb: 3 
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ℹ️ <strong>What this does:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This adds an available time slot to the doctor's schedule. You can add time slots to ANY doctor, even if they already have existing appointments.
                </Typography>
                <Box sx={{ mt: 2, ml: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    • <span style={{ color: '#2e7d32', fontWeight: 600 }}>Green slots</span>: Regular working hours (doctor's normal schedule)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    • <span style={{ color: '#1976d2', fontWeight: 600 }}>Blue slots</span>: Available slots you add manually (like this one)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    • <span style={{ color: '#d32f2f', fontWeight: 600 }}>Red slots</span>: Reserved appointments with actual patient names
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 1, backgroundColor: '#e8f5e8', borderRadius: 1, color: '#2e7d32', fontWeight: 600 }}>
                    ✅ You can add multiple time slots to the same doctor on different times!
                  </Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="doctor-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  id="doctor"
                  value={selectedDoctorForAdd || ''}
                  label="Doctor"
                  onChange={(e) => setSelectedDoctorForAdd(e.target.value as number)}
                  sx={{ borderRadius: 2 }}
                >
                  {getWorkingDoctors().map((doctor) => {
                    const doctorAppointments = getDoctorAppointments(doctor.id, selectedDate);
                    const hasExistingAppointments = doctorAppointments.length > 0;
                    
                    return (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: hasExistingAppointments ? '#4caf50' : 'primary.main' }}>
                            {doctor.avatar}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {doctor.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doctor.specialty}
                            </Typography>
                            {hasExistingAppointments && (
                              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600, display: 'block' }}>
                                ✅ Has existing appointments - can add more time slots
                              </Typography>
                            )}
                          </Box>
                          {hasExistingAppointments && (
                            <Chip 
                              label={`${doctorAppointments.length} slots`} 
                              size="small" 
                              sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                id="time"
                label="Time Slot"
                type="time"
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                helperText="Enter any time in HH:MM format (e.g., 14:30, 09:15)"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2 
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setAddDialogOpen(false)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNew}
                variant="contained"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Add Time Slot
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Appointment Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>Edit Appointment</DialogTitle>
                         <DialogContent>
               <TextField
                 fullWidth
                 margin="normal"
                 id="time"
                 label="Time (HH:MM format)"
                 type="time"
                 value={formData.time || ''}
                 onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                 helperText="Change time or enter new custom time slot"
               />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogActions>
          </Dialog>

          {/* Menu for Appointment Actions */}
          {selectedAppointment && (
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={(e) => { e.stopPropagation(); handleEditAppointment(selectedAppointment); }}>
                <Edit />
                Edit
              </MenuItem>
              <MenuItem onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(selectedAppointment); }}>
                <Delete />
                Delete
              </MenuItem>
            </Menu>
          )}

          {/* Enhanced Add New Doctor Dialog */}
          <Dialog 
            open={addDoctorDialogOpen} 
            onClose={() => setAddDoctorDialogOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'linear-gradient(145deg, #f8fffe 0%, #e8f5e8 25%, #ffffff 100%)',
                boxShadow: '0 24px 50px rgba(76, 175, 80, 0.15)',
                overflow: 'hidden',
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%)',
              color: 'white',
              borderRadius: 0,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  p: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(10px)',
                }}>
                  <LocalHospital sx={{ fontSize: 36, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.8rem' }}>
                    Add New Doctor
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    🩺 Register a new medical professional to your clinic team
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 5, backgroundColor: '#fafafa' }}>
              {/* Welcome Section */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'white', 
                borderRadius: 3, 
                border: '2px solid #e8f5e8',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50', mb: 2 }}>
                  👨‍⚕️ Doctor Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Please fill in the details below to add a new doctor to your clinic management system. 
                  All fields marked with * are required for registration.
                </Typography>
              </Box>

              <Grid container spacing={4}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 24 }} />
                    Personal Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={doctorFormData.name}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                    placeholder="e.g., Dr. Ahmed Hassan Mohamed"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#4caf50' },
                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'white',
                      '&:hover fieldset': { borderColor: '#4caf50' },
                      '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                  }}>
                    <InputLabel>Medical Specialty *</InputLabel>
                    <Select
                      value={doctorFormData.specialty}
                      label="Medical Specialty *"
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                      required
                    >
                      <MenuItem value="General Medicine">General Medicine</MenuItem>
                      <MenuItem value="Cardiology">Cardiology</MenuItem>
                      <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                      <MenuItem value="Dermatology">Dermatology</MenuItem>
                      <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                      <MenuItem value="Neurology">Neurology</MenuItem>
                      <MenuItem value="Gastroenterology">Gastroenterology</MenuItem>
                      <MenuItem value="Ophthalmology">Ophthalmology</MenuItem>
                      <MenuItem value="ENT">ENT (Ear, Nose, Throat)</MenuItem>
                      <MenuItem value="Psychiatry">Psychiatry</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Working Schedule Section */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 24 }} />
                    Working Schedule
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Working Hours Start"
                    type="time"
                    value={doctorFormData.workingHoursStart}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, workingHoursStart: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#4caf50' },
                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Working Hours End"
                    type="time"
                    value={doctorFormData.workingHoursEnd}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, workingHoursEnd: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#4caf50' },
                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Consultation Duration (minutes)"
                    type="number"
                    value={doctorFormData.consultationDuration}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationDuration: parseInt(e.target.value) || 30 })}
                    inputProps={{ min: 15, max: 120, step: 15 }}
                    helperText="Typical: 15-60 minutes"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#4caf50' },
                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Max Patients Per Hour"
                    type="number"
                    value={doctorFormData.maxPatientsPerHour}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, maxPatientsPerHour: parseInt(e.target.value) || 2 })}
                    inputProps={{ min: 1, max: 10 }}
                    helperText="Recommended: 2-4 patients"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'white',
                        '&:hover fieldset': { borderColor: '#4caf50' },
                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'white',
                      '&:hover fieldset': { borderColor: '#4caf50' },
                      '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
                  }}>
                    <InputLabel>Off Days</InputLabel>
                    <Select
                      multiple
                      value={doctorFormData.offDays}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, offDays: e.target.value as string[] })}
                      label="Off Days"
                      renderValue={(selected) => selected.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                    >
                      {daysOfWeek.map((day) => (
                        <MenuItem key={day} value={day}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: doctorFormData.offDays.includes(day) ? '#4caf50' : '#e0e0e0' 
                            }} />
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 4, 
              gap: 3, 
              backgroundColor: '#f5f5f5',
              borderTop: '1px solid #e0e0e0' 
            }}>
              <Button 
                onClick={() => setAddDoctorDialogOpen(false)}
                variant="outlined"
                size="large"
                sx={{ 
                  borderRadius: 3, 
                  px: 5,
                  py: 1.5,
                  borderColor: '#bdbdbd',
                  color: '#757575',
                  '&:hover': { 
                    borderColor: '#9e9e9e',
                    backgroundColor: '#f5f5f5',
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNewDoctor}
                variant="contained"
                size="large"
                sx={{ 
                  borderRadius: 3, 
                  px: 6,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                ✨ Add Doctor to Clinic
              </Button>
            </DialogActions>
                    </Dialog>

          {/* Edit Time Slot Dialog */}
          <Dialog 
            open={editTimeSlotDialogOpen} 
            onClose={() => setEditTimeSlotDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'linear-gradient(145deg, #fff8e1 0%, #ffffff 100%)',
                boxShadow: '0 20px 40px rgba(255, 152, 0, 0.15)',
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              color: 'white',
              borderRadius: 0,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Edit sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Edit Time Slot: {selectedTimeSlot?.time}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Configure slot type and patient details
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4 }}>
              {/* Current Status */}
              <Box sx={{ mb: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={selectedTimeSlot?.type === 'reserved' ? '🔒 Reserved' : 
                          selectedTimeSlot?.type === 'available' ? '⏰ Available' : 
                          '✅ Regular'}
                    size="small"
                    sx={{
                      backgroundColor: selectedTimeSlot?.type === 'reserved' ? '#ffcdd2' : 
                                     selectedTimeSlot?.type === 'available' ? '#e3f2fd' : '#e8f5e8',
                      color: selectedTimeSlot?.type === 'reserved' ? '#d32f2f' : 
                           selectedTimeSlot?.type === 'available' ? '#1976d2' : '#2e7d32',
                      fontWeight: 600,
                    }}
                  />
                  {selectedTimeSlot?.appointment?.patient && (
                    <Typography variant="body2">
                      Patient: <strong>{selectedTimeSlot.appointment.patient}</strong>
                    </Typography>
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Slot Type</InputLabel>
                    <Select
                      value={timeSlotFormData.type}
                      label="Slot Type"
                      onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, type: e.target.value as 'regular' | 'available' | 'reserved' })}
                    >
                      <MenuItem value="regular">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip label="✅" size="small" sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>Regular Working Hours</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Standard doctor availability during working hours
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="available">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip label="⏰" size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>Available Slot (Added Manually)</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Extra availability outside regular hours
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="reserved">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip label="🔒" size="small" sx={{ backgroundColor: '#ffcdd2', color: '#d32f2f' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>Reserved (Patient Appointment)</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Booked appointment with patient details
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Patient Details (only for reserved slots) */}
                {timeSlotFormData.type === 'reserved' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Patient Name *"
                        value={timeSlotFormData.patientName}
                        onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, patientName: e.target.value })}
                        placeholder="Full patient name"
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#ff9800' },
                            '&.Mui-focused fieldset': { borderColor: '#ff9800' },
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#ff9800' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Patient Phone"
                        value={timeSlotFormData.patientPhone}
                        onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, patientPhone: e.target.value })}
                        placeholder="Contact number"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#ff9800' },
                            '&.Mui-focused fieldset': { borderColor: '#ff9800' },
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#ff9800' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Appointment Type</InputLabel>
                        <Select
                          value={timeSlotFormData.appointmentType}
                          label="Appointment Type"
                          onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, appointmentType: e.target.value })}
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800' },
                          }}
                        >
                          <MenuItem value="consultation">Consultation</MenuItem>
                          <MenuItem value="follow-up">Follow-up</MenuItem>
                          <MenuItem value="emergency">Emergency</MenuItem>
                          <MenuItem value="routine-checkup">Routine Checkup</MenuItem>
                          <MenuItem value="specialist-referral">Specialist Referral</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes"
                        multiline
                        rows={3}
                        value={timeSlotFormData.notes}
                        onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, notes: e.target.value })}
                        placeholder="Additional notes about the appointment..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#ff9800' },
                            '&.Mui-focused fieldset': { borderColor: '#ff9800' },
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#ff9800' },
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 2, backgroundColor: '#f5f5f5' }}>
              <Button 
                onClick={() => setEditTimeSlotDialogOpen(false)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTimeSlotEdit}
                variant="contained"
                sx={{ 
                  borderRadius: 2, 
                  px: 4,
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                  }
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default DoctorSchedulingPage; 