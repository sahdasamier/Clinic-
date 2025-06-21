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

import { loadAppointmentsFromStorage, saveAppointmentsToStorage } from './appointments/AppointmentListPage';
import {
  baseDoctorSchedules,
  daysOfWeek,
  timeSlots,
  medicalSpecialties,
  appointmentTypes,
  defaultDoctorFormData,
  defaultTimeSlotFormData,
  doctorSchedules,
  type Doctor,
  type Appointment,
} from '../data/mockData';


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



// Helper function to map doctor name to doctor object
const findDoctorByName = (doctorName: string, doctors: any[]) => {
  return doctors.find((doc: any) => doc.name === doctorName);
};



const DoctorSchedulingPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from shared storage on component mount
  useEffect(() => {
    const loadAppointments = () => {
      const appointmentData = loadAppointmentsFromStorage();
      setAppointments(appointmentData);
    };

    // Load initial data
    loadAppointments();

    // Listen for appointment updates from other components
    const handleAppointmentUpdate = () => {
      loadAppointments();
    };

    // Listen for user data clearing
    // Listen for mobile FAB action
    const handleOpenAddDoctor = () => {
      setAddDoctorDialogOpen(true);
    };

    const handleUserDataCleared = () => {
      // Reset to default state
      setAppointments([]);
      setDoctors(baseDoctorSchedules.map(doctor => ({
        ...doctor,
        specialty: t(doctor.specialty)
      })));
      setTabValue(0);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setFormData({ time: '' });
      setDoctorFormData(defaultDoctorFormData);
      setTimeSlotFormData(defaultTimeSlotFormData);
      setSelectedAppointment(null);
      setSelectedDoctorForAdd(null);
      setSelectedDoctorForEdit(null);
      setSelectedTimeSlot(null);
      
      // Close any open dialogs
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setAddDoctorDialogOpen(false);
      setEditDoctorDialogOpen(false);
      setEditTimeSlotDialogOpen(false);
      setMenuAnchor(null);
      
      console.log('✅ Doctor scheduling reset to default state');
    };

    window.addEventListener('appointmentsUpdated', handleAppointmentUpdate);
    window.addEventListener('userDataCleared', handleUserDataCleared);
    window.addEventListener('openAddDoctor', handleOpenAddDoctor);
    
    // Cleanup
    return () => {
      window.removeEventListener('appointmentsUpdated', handleAppointmentUpdate);
      window.removeEventListener('userDataCleared', handleUserDataCleared);
      window.removeEventListener('openAddDoctor', handleOpenAddDoctor);
    };
  }, [t]);
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

  // Translate doctor specialties and initialize state
  const doctorSchedules = baseDoctorSchedules.map(doctor => ({
    ...doctor,
    specialty: t(doctor.specialty)
  }));
  
  // New state for doctor management
  const [doctors, setDoctors] = useState(doctorSchedules);
  const [addDoctorDialogOpen, setAddDoctorDialogOpen] = useState(false);
  const [editDoctorDialogOpen, setEditDoctorDialogOpen] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState<any>(null);
  const [doctorFormData, setDoctorFormData] = useState(defaultDoctorFormData);

  // Time slot editing state
  const [editTimeSlotDialogOpen, setEditTimeSlotDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    doctorId: number;
    time: string;
    type: 'regular' | 'available' | 'reserved';
    appointment?: Appointment;
  } | null>(null);
  const [timeSlotFormData, setTimeSlotFormData] = useState(defaultTimeSlotFormData);

  // Weekly scheduling state
  const [weeklyScheduleDialogOpen, setWeeklyScheduleDialogOpen] = useState(false);
  const [selectedDoctorForWeekly, setSelectedDoctorForWeekly] = useState<any>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });
  const [weeklyScheduleData, setWeeklyScheduleData] = useState<{
    [day: string]: {
      isWorking: boolean;
      timeSlots: string[];
      notes: string;
    }
  }>({});

  // Recurring appointments state
  const [recurringAppointmentsDialogOpen, setRecurringAppointmentsDialogOpen] = useState(false);
  const [recurringSettings, setRecurringSettings] = useState({
    enabled: true,
    weeksToRepeat: 4,
    includeOffDays: false,
    autoApprove: false,
  });

  // Time slot input state for weekly scheduling
  const [newTimeSlot, setNewTimeSlot] = useState('');

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
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return [];
    return appointments.filter((apt: Appointment) => apt.doctor === doctor.name && apt.date === date);
  };



  // Generate time slots for a doctor (uses the new getAllTimeSlots function)
  const generateDoctorTimeSlots = (doctor: Doctor) => {
    return getAllTimeSlots(doctor.id);
  };

  // Get all time slots for a doctor (including custom ones from appointments)
  const getAllTimeSlots = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return [];
    
    // Get doctor appointments for the selected date
    const doctorAppointments = getDoctorAppointments(doctorId, selectedDate);
    
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
    
    // Get custom time slots from appointments (using timeSlot field)
    const customSlots = doctorAppointments
      .map(apt => apt.timeSlot)
      .filter(timeSlot => !regularSlots.includes(timeSlot));
    
    // Combine and sort all slots
    const allSlots = [...regularSlots, ...customSlots].sort();
    
    return allSlots.map(timeSlot => {
      const appointment = doctorAppointments.find(apt => apt.timeSlot === timeSlot);
      
      // Only mark as reserved if it has a real patient and is not just an available slot
      const isReserved = !!(appointment && appointment.patient && !appointment.isAvailableSlot && appointment.status !== 'cancelled');
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
    setFormData({ time: appointment.timeSlot });
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointment: Appointment) => {
    const updatedAppointments = appointments.filter(apt => apt.id !== appointment.id);
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments); // Save to shared storage
    setMenuAnchor(null);
  };

  // Save new appointment - creates available time slot
  const handleSaveNew = () => {
    if (!selectedDoctorForAdd || !formData.time) {
      setSnackbar({
        open: true,
        message: `❌ ${t('please_select_doctor_and_time')}`,
        severity: 'error'
      });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctorForAdd);
    if (!doctor) return;

    // Check if time slot is already taken
    const existingAppointment = appointments.find(apt => 
      apt.doctor === doctor.name && 
      apt.date === selectedDate && 
      apt.timeSlot === formData.time
    );

    if (existingAppointment) {
      const slotType = existingAppointment.patient && !existingAppointment.isAvailableSlot 
        ? t('reserved_appointment')
        : existingAppointment.isAvailableSlot 
        ? t('available_slot')
        : t('time_slot');
      
      setSnackbar({
        open: true,
        message: `❌ ${t('time_slot_already_exists', { time: formData.time, type: slotType, doctor: doctor.name })}`,
        severity: 'error'
      });
      return;
    }

    // Convert 24-hour format to 12-hour format for display
    const timeDisplay = new Date(`2024-01-01T${formData.time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const newAppointment: Appointment = {
      id: Math.max(...appointments.map(a => a.id || 0)) + 1,
      doctor: doctor.name,
      date: selectedDate,
      time: timeDisplay,
      timeSlot: formData.time,
      patient: t('available_slot'), // Use a default name for available slots
      patientAvatar: 'AS',
      duration: doctor.consultationDuration || 30,
      type: t('available_slot'),
      status: 'pending',
      location: `${t('room')} ${100 + doctor.id}`,
      phone: '',
      notes: t('available_time_slot_created'),
      completed: false,
      priority: 'normal',
      createdAt: new Date().toISOString(),
      isAvailableSlot: true,
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments); // Save to shared storage
    setAddDialogOpen(false);
    
    // Success notification
    const existingAppointmentsCount = appointments.filter(apt => 
      apt.doctor === doctor.name && apt.date === selectedDate
    ).length;
    
    setSnackbar({
      open: true,
      message: `✅ ${t('available_time_slot_added', { 
        time: timeDisplay, 
        doctor: doctor.name, 
        date: selectedDate, 
        count: existingAppointmentsCount + 1 
      })}`,
      severity: 'success'
    });

    // Reset form
    setSelectedDoctorForAdd(null);
    setFormData({ time: '' });
  };

  // Save edited appointment
  const handleSaveEdit = () => {
    if (!formData.time || !selectedAppointment) {
      alert(t('please_fill_all_fields'));
      return;
    }

    // Check if new time slot is already taken (excluding current appointment)
    const existingAppointment = appointments.find(apt => 
      apt.doctor === selectedAppointment.doctor && 
      apt.date === selectedDate && 
      apt.timeSlot === formData.time &&
      apt.id !== selectedAppointment.id
    );

    if (existingAppointment) {
      alert(t('time_slot_already_reserved', { time: formData.time }));
      return;
    }

    // Convert 24-hour format to 12-hour format for display
    const timeDisplay = new Date(`2024-01-01T${formData.time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const updatedAppointments = appointments.map(apt => 
      apt.id === selectedAppointment.id 
        ? { ...apt, time: timeDisplay, timeSlot: formData.time }
        : apt
    );
    
    setAppointments(updatedAppointments);
    saveAppointmentsToStorage(updatedAppointments); // Save to shared storage
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
    setDoctorFormData(defaultDoctorFormData);
    setAddDoctorDialogOpen(true);
  };

  // Handle edit doctor
  const handleEditDoctor = (doctor: any) => {
    setSelectedDoctorForEdit(doctor);
    setDoctorFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      workingHoursStart: doctor.workingHours.start,
      workingHoursEnd: doctor.workingHours.end,
      offDays: doctor.offDays,
      consultationDuration: doctor.consultationDuration,
      maxPatientsPerHour: doctor.maxPatientsPerHour,
    });
    setEditDoctorDialogOpen(true);
  };

  // Handle save new doctor
  const handleSaveNewDoctor = () => {
    if (!doctorFormData.name.trim() || !doctorFormData.specialty.trim()) {
      setSnackbar({
        open: true,
        message: `❌ ${t('please_fill_doctor_name_specialty')}`,
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
      message: `✅ ${t('doctor_added_successfully', { name: doctorFormData.name })}`,
      severity: 'success'
        });
  };

  // Handle save edited doctor
  const handleSaveEditedDoctor = () => {
    if (!doctorFormData.name.trim() || !doctorFormData.specialty.trim()) {
      setSnackbar({
        open: true,
        message: `❌ ${t('please_fill_doctor_name_specialty')}`,
        severity: 'error'
      });
      return;
    }

    const updatedDoctor = {
      ...selectedDoctorForEdit,
      name: doctorFormData.name.trim(),
      specialty: doctorFormData.specialty.trim(),
      workingHours: { 
        start: doctorFormData.workingHoursStart, 
        end: doctorFormData.workingHoursEnd 
      },
      offDays: doctorFormData.offDays,
      maxPatientsPerHour: doctorFormData.maxPatientsPerHour,
      consultationDuration: doctorFormData.consultationDuration,
    };

    setDoctors(prev => prev.map(doc => doc.id === selectedDoctorForEdit.id ? updatedDoctor : doc));
    setEditDoctorDialogOpen(false);
    setSelectedDoctorForEdit(null);
    
    setSnackbar({
      open: true,
      message: `✅ ${t('doctor_updated_successfully', { name: doctorFormData.name })}`,
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
      ...defaultTimeSlotFormData,
      time: timeSlot,
      type: actualSlotType,
      patientName: appointment?.patient || '',
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
        message: `❌ ${t('patient_name_required')}`,
        severity: 'error'
      });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedTimeSlot.doctorId);
    if (!doctor) return;
    
    // Remove any existing appointment for this time slot and date
    const filteredAppointments = appointments.filter(apt => 
      !(apt.doctor === doctor.name && 
        apt.date === selectedDate && 
        apt.timeSlot === selectedTimeSlot.time)
    );

    // Add new appointment based on type (only for available and reserved)
    if (timeSlotFormData.type === 'available' || timeSlotFormData.type === 'reserved') {
      // Convert 24-hour format to 12-hour format for display
      const timeDisplay = new Date(`2024-01-01T${selectedTimeSlot.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const newAppointment: Appointment = {
        id: Math.max(...(appointments.length > 0 ? appointments.map(a => a.id || 0) : [0])) + 1,
        doctor: doctor.name,
        date: selectedDate,
        time: timeDisplay,
        timeSlot: selectedTimeSlot.time,
        patient: timeSlotFormData.type === 'reserved' ? timeSlotFormData.patientName.trim() : t('available_slot'),
        patientAvatar: timeSlotFormData.type === 'reserved' 
          ? timeSlotFormData.patientName.trim().split(' ').map(n => n[0]).join('').toUpperCase() || 'PA'
          : 'AS',
        duration: doctor.consultationDuration || 30,
        type: timeSlotFormData.type === 'reserved' ? timeSlotFormData.appointmentType : t('available_slot'),
        status: timeSlotFormData.type === 'reserved' ? 'confirmed' : 'pending',
        location: `${t('room')} ${100 + doctor.id}`,
        phone: timeSlotFormData.patientPhone || '',
        notes: timeSlotFormData.notes || (timeSlotFormData.type === 'available' ? t('available_time_slot') : ''),
        completed: false,
        priority: 'normal',
        createdAt: new Date().toISOString(),
        isAvailableSlot: timeSlotFormData.type === 'available',
      };
      
      const updatedAppointments = [...filteredAppointments, newAppointment];
      setAppointments(updatedAppointments);
      saveAppointmentsToStorage(updatedAppointments); // Save to shared storage
    } else {
      // Just remove the appointment for 'regular' type
      setAppointments(filteredAppointments);
      saveAppointmentsToStorage(filteredAppointments); // Save to shared storage
    }
    // If type is 'regular', we just remove the appointment (already done above)

    setEditTimeSlotDialogOpen(false);
    setSelectedTimeSlot(null);
    
    const typeMessages = {
      regular: `✅ ${t('converted_to_regular')}`,
      available: `⏰ ${t('converted_to_available')}`,
      reserved: `🔒 ${t('reserved_for_patient', { patient: timeSlotFormData.patientName || t('patient') })}`
    };
    
    setSnackbar({
      open: true,
      message: typeMessages[timeSlotFormData.type],
      severity: 'success'
    });
  };

  // Weekly scheduling functions
  const handleOpenWeeklySchedule = (doctor: any) => {
    console.log('🔧 Opening weekly schedule for doctor:', doctor.name, doctor.id);
    setSelectedDoctorForWeekly(doctor);
    
    // Check if doctor already has custom weekly schedule in localStorage
    const existingScheduleKey = `weekly_schedule_${doctor.id}`;
    const existingSchedule = localStorage.getItem(existingScheduleKey);
    
    let initialWeeklyData: any = {};
    
    if (existingSchedule) {
      // Load existing custom schedule
      try {
        initialWeeklyData = JSON.parse(existingSchedule);
        console.log('📅 Loaded existing weekly schedule for Dr.', doctor.name);
      } catch (error) {
        console.warn('Error loading existing schedule, creating default');
        initialWeeklyData = {};
      }
    }
    
    // Initialize or fill missing days with default settings
    daysOfWeek.forEach(day => {
      if (!initialWeeklyData[day]) {
        initialWeeklyData[day] = {
          isWorking: !doctor.offDays.includes(day),
          timeSlots: [],
          notes: ''
        };
        
        // Only add default time slots if no existing schedule
        if (!existingSchedule && !doctor.offDays.includes(day)) {
          const slots = [];
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
            slots.push(timeSlot);
          }
          initialWeeklyData[day].timeSlots = slots;
        }
      }
    });
    
    setWeeklyScheduleData(initialWeeklyData);
    setWeeklyScheduleDialogOpen(true);
    console.log('✅ Weekly schedule dialog should now be open');
  };

  const handleSaveWeeklySchedule = () => {
    if (!selectedDoctorForWeekly) return;

    // Save the weekly schedule to localStorage for persistence
    const scheduleKey = `weekly_schedule_${selectedDoctorForWeekly.id}`;
    localStorage.setItem(scheduleKey, JSON.stringify(weeklyScheduleData));

    // Update doctor's off days based on weekly schedule
    const newOffDays = daysOfWeek.filter(day => !weeklyScheduleData[day]?.isWorking);
    
    const updatedDoctor = {
      ...selectedDoctorForWeekly,
      offDays: newOffDays
    };

    setDoctors(prev => prev.map(doc => 
      doc.id === selectedDoctorForWeekly.id ? updatedDoctor : doc
    ));

    // Generate appointments for the entire week
    const newAppointments: Appointment[] = [];
    const weekStart = new Date(currentWeekStart);
    
    daysOfWeek.forEach((day, index) => {
      if (weeklyScheduleData[day]?.isWorking && weeklyScheduleData[day]?.timeSlots.length > 0) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        const dateString = dayDate.toISOString().split('T')[0];
        
        weeklyScheduleData[day].timeSlots.forEach(timeSlot => {
          // Check if appointment already exists
          const existingApt = appointments.find(apt => 
            apt.doctor === selectedDoctorForWeekly.name && 
            apt.date === dateString && 
            apt.timeSlot === timeSlot
          );
          
          if (!existingApt) {
            const timeDisplay = new Date(`2024-01-01T${timeSlot}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });

            const newAppointment: Appointment = {
              id: Math.max(...(appointments.length > 0 ? appointments.map(a => a.id || 0) : [0])) + newAppointments.length + 1,
              doctor: selectedDoctorForWeekly.name,
              date: dateString,
              time: timeDisplay,
              timeSlot: timeSlot,
              patient: t('available_slot'),
              patientAvatar: 'AS',
              duration: selectedDoctorForWeekly.consultationDuration || 30,
              type: t('available_slot'),
              status: 'pending',
              location: `${t('room')} ${100 + selectedDoctorForWeekly.id}`,
              phone: '',
              notes: weeklyScheduleData[day].notes || t('weekly_schedule_generated'),
              completed: false,
              priority: 'normal',
              createdAt: new Date().toISOString(),
              isAvailableSlot: true,
            };
            
            newAppointments.push(newAppointment);
          }
        });
      }
    });

    // Save all new appointments
    if (newAppointments.length > 0) {
      const updatedAppointments = [...appointments, ...newAppointments];
      setAppointments(updatedAppointments);
      saveAppointmentsToStorage(updatedAppointments);
    }

    setWeeklyScheduleDialogOpen(false);
    setSnackbar({
      open: true,
      message: `✅ ${t('weekly_schedule_saved', { doctor: selectedDoctorForWeekly.name, count: newAppointments.length })}`,
      severity: 'success'
    });
  };

  const addTimeSlotToDay = (day: string) => {
    if (!newTimeSlot) {
      setSnackbar({
        open: true,
        message: `⚠️ Please select a time first`,
        severity: 'error'
      });
      return;
    }

    // Check if time slot already exists for this day
    const existingSlots = weeklyScheduleData[day]?.timeSlots || [];
    if (existingSlots.includes(newTimeSlot)) {
      setSnackbar({
        open: true,
        message: `⚠️ Time slot ${newTimeSlot} already exists for ${t(day)}`,
        severity: 'error'
      });
      return;
    }

    setWeeklyScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...(prev[day]?.timeSlots || []), newTimeSlot].sort()
      }
    }));

    setSnackbar({
      open: true,
      message: `✅ Added time slot ${newTimeSlot} to ${t(day)}`,
      severity: 'success'
    });

    // Clear the input
    setNewTimeSlot('');
  };

  // Copy time slots from one day to another
  const copyTimeSlotsToDay = (fromDay: string, toDay: string) => {
    const fromDayData = weeklyScheduleData[fromDay];
    if (fromDayData?.timeSlots) {
      setWeeklyScheduleData(prev => ({
        ...prev,
        [toDay]: {
          ...prev[toDay],
          timeSlots: [...fromDayData.timeSlots]
        }
      }));
      
      setSnackbar({
        open: true,
        message: `✅ Copied ${fromDayData.timeSlots.length} time slots from ${t(fromDay)} to ${t(toDay)}`,
        severity: 'success'
      });
    }
  };

  // Apply doctor's default hours to a specific day
  const applyDefaultHoursToDay = (day: string) => {
    if (!selectedDoctorForWeekly) return;
    
    const slots: string[] = [];
    const startHour = parseInt(selectedDoctorForWeekly.workingHours.start.split(':')[0]);
    const startMinute = parseInt(selectedDoctorForWeekly.workingHours.start.split(':')[1]);
    const endHour = parseInt(selectedDoctorForWeekly.workingHours.end.split(':')[0]);
    const endMinute = parseInt(selectedDoctorForWeekly.workingHours.end.split(':')[1]);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += selectedDoctorForWeekly.consultationDuration) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
    }
    
    setWeeklyScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: slots
      }
    }));
    
    setSnackbar({
      open: true,
      message: `✅ Applied default hours (${selectedDoctorForWeekly.workingHours.start} - ${selectedDoctorForWeekly.workingHours.end}) to ${t(day)}`,
      severity: 'success'
    });
  };

  // Clear all time slots for a day
  const clearAllTimeSlotsForDay = (day: string) => {
    setWeeklyScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: []
      }
    }));
    
    setSnackbar({
      open: true,
      message: `🗑️ Cleared all time slots for ${t(day)}`,
      severity: 'success'
    });
  };

  // Quick availability presets
  const applyQuickAvailability = (day: string, preset: 'morning' | 'afternoon' | 'evening' | 'full') => {
    let slots: string[] = [];
    
    switch (preset) {
      case 'morning':
        slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
        break;
      case 'afternoon':
        slots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
        break;
      case 'evening':
        slots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
        break;
      case 'full':
        slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
        break;
    }
    
    setWeeklyScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: slots
      }
    }));
    
    setSnackbar({
      open: true,
      message: `⏰ Applied ${preset} availability to ${t(day)} (${slots.length} slots)`,
      severity: 'success'
    });
  };

  const removeTimeSlotFromDay = (day: string, slotIndex: number) => {
    setWeeklyScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day]?.timeSlots.filter((_, index) => index !== slotIndex) || []
      }
    }));
  };

  const updateTimeSlot = (day: string, slotIndex: number, newTime: string) => {
    setWeeklyScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day]?.timeSlots.map((slot, index) => 
          index === slotIndex ? newTime : slot
        ) || []
      }
    }));
  };

  // Recurring appointments functions
  const handleSetupRecurringAppointments = () => {
    setRecurringAppointmentsDialogOpen(true);
  };

  const handleApplyRecurringSchedule = () => {
    if (!recurringSettings.enabled) return;

    const currentWeekAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return aptDate >= weekStart && aptDate <= weekEnd;
    });

    const newRecurringAppointments: Appointment[] = [];

    for (let week = 1; week <= recurringSettings.weeksToRepeat; week++) {
      currentWeekAppointments.forEach(apt => {
        if (!recurringSettings.includeOffDays) {
          const doctor = doctors.find(d => d.name === apt.doctor);
          const aptDate = new Date(apt.date);
          const dayName = daysOfWeek[aptDate.getDay()];
          if (doctor?.offDays.includes(dayName)) return;
        }

        const futureDate = new Date(apt.date);
        futureDate.setDate(futureDate.getDate() + (week * 7));
        const futureDateString = futureDate.toISOString().split('T')[0];

        // Check if appointment already exists
        const existingApt = appointments.find(existingApt => 
          existingApt.doctor === apt.doctor && 
          existingApt.date === futureDateString && 
          existingApt.timeSlot === apt.timeSlot
        );

        if (!existingApt) {
          const recurringAppointment: Appointment = {
            ...apt,
            id: Math.max(...(appointments.length > 0 ? appointments.map(a => a.id || 0) : [0])) + newRecurringAppointments.length + 1,
            date: futureDateString,
            status: recurringSettings.autoApprove ? 'confirmed' : 'pending',
            notes: `${apt.notes || ''} (${t('recurring_appointment')} - ${t('week')} ${week + 1})`,
            createdAt: new Date().toISOString(),
          };
          
          newRecurringAppointments.push(recurringAppointment);
        }
      });
    }

    if (newRecurringAppointments.length > 0) {
      const updatedAppointments = [...appointments, ...newRecurringAppointments];
      setAppointments(updatedAppointments);
      saveAppointmentsToStorage(updatedAppointments);
    }

    setRecurringAppointmentsDialogOpen(false);
    setSnackbar({
      open: true,
      message: `✅ ${t('recurring_appointments_created', { count: newRecurringAppointments.length, weeks: recurringSettings.weeksToRepeat })}`,
      severity: 'success'
    });
  };

  const getWeekDates = () => {
    const weekStart = new Date(currentWeekStart);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeekStart);
    const offset = direction === 'next' ? 7 : -7;
    current.setDate(current.getDate() + offset);
    setCurrentWeekStart(current.toISOString().split('T')[0]);
  };

  // Calculate statistics
  const totalWorkingDoctors = getWorkingDoctors().length;
  const totalAppointmentsToday = appointments.filter((apt: Appointment) => apt.date === selectedDate).length;
  const busyDoctors = getWorkingDoctors().filter((doctor: Doctor) => 
    getDoctorAppointments(doctor.id, selectedDate).length > 0
  ).length;

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
                  <Schedule sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />
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
                    {t('doctor_scheduling')}
                  </Typography>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    🩺 {t('comprehensive_schedule_management')}
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
                  startIcon={<Schedule />}
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 700,
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
                  variant="outlined"
                  startIcon={<EventAvailable />}
                  onClick={handleSetupRecurringAppointments}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255,255,255,0.25)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('recurring_schedule')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddDoctor}
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
                  {t('add_new_doctor')}
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

         {/* Enhanced Date Selection */}
         <Card sx={{ 
           mb: 4, 
           background: 'linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%)',
           borderRadius: 3,
           boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
           border: '1px solid rgba(0,0,0,0.05)',
         }}>
           <CardContent sx={{ p: 3 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
               <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                 📅 {t('schedule_date')}:
               </Typography>
               <TextField
                 type="date"
                 label={t('select_date')}
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 InputLabelProps={{ shrink: true }}
                 sx={{ 
                   '& .MuiOutlinedInput-root': { 
                     borderRadius: 3,
                     backgroundColor: 'white',
                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                     '&:hover': {
                       boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                     },
                   }
                 }}
               />
               <Chip 
                 label={`${t(getSelectedDayOfWeek())}`}
                 sx={{ 
                   textTransform: 'capitalize',
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   fontWeight: 600,
                 }}
               />
             </Box>
           </CardContent>
         </Card>

         {/* Enhanced Statistics Overview */}
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
               📊 {t('doctor_schedule_statistics')}
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
                     {totalWorkingDoctors}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('working_today')}
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
                     {totalAppointmentsToday}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('total_appointments')}
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
                     {busyDoctors}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('busy_doctors')}
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
                     {totalWorkingDoctors - busyDoctors}
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                     {t('available_doctors')}
                   </Typography>
                 </Box>
               </Grid>
             </Grid>
           </CardContent>
           {/* Decorative elements */}
           <Box sx={{
             position: 'absolute',
             top: -40,
             right: -40,
             width: 120,
             height: 120,
             borderRadius: '50%',
             backgroundColor: 'rgba(102, 126, 234, 0.1)',
             zIndex: 1,
           }} />
           <Box sx={{
             position: 'absolute',
             bottom: -30,
             left: -30,
             width: 80,
             height: 80,
             borderRadius: '50%',
             backgroundColor: 'rgba(118, 75, 162, 0.1)',
             zIndex: 1,
           }} />
         </Card>

         {/* Enhanced Time Slot Legend */}
         <Card sx={{ 
           mb: 4,
           borderRadius: 4,
           boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
           border: '1px solid rgba(0,0,0,0.05)',
           overflow: 'hidden'
         }}>
           <CardContent sx={{ p: 4 }}>
             <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
               🎨 {t('time_slot_color_guide')}
             </Typography>
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
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
                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                   ✅ {t('regular_working_hours')}
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
                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                   ⏰ {t('available_slot_added_manually')}
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
                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                   🔒 {t('reserved_patient_appointment')}
                 </Typography>
               </Box>
             </Box>
             <Box sx={{ 
               p: 3, 
               background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
               borderRadius: 3, 
               border: '1px solid rgba(102, 126, 234, 0.2)',
               position: 'relative',
               overflow: 'hidden'
             }}>
               <Box sx={{
                 position: 'absolute',
                 top: -10,
                 right: -10,
                 width: 40,
                 height: 40,
                 borderRadius: '50%',
                 backgroundColor: 'rgba(102, 126, 234, 0.1)',
                 zIndex: 1,
               }} />
               <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main', position: 'relative', zIndex: 2 }}>
                 💡 {t('interactive_time_slots')}
               </Typography>
               <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5, position: 'relative', zIndex: 2 }}>
                 {t('click_time_slot_to_edit')}
               </Typography>
             </Box>
           </CardContent>
         </Card>

         {/* Enhanced Main Content */}
         <Card sx={{ 
           borderRadius: 4,
           boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
           border: '1px solid rgba(0,0,0,0.05)',
           overflow: 'hidden'
         }}>
           <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
             <Tabs 
               value={tabValue} 
               onChange={handleTabChange}
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
               }}
             >
               <Tab label={`📅 ${t('doctor_schedules')}`} />
               <Tab label={`📊 ${t('weekly_overview')}`} />
               <Tab label={`👥 ${t('all_doctors')}`} />
             </Tabs>
           </Box>

           <TabPanel value={tabValue} index={0}>
             <Box sx={{ p: 4 }}>
               <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                 📋 {t('doctor_schedules_for_date', { date: new Date(selectedDate).toLocaleDateString() })}
               </Typography>
               
               {/* Enhanced Helpful Notice */}
               <Box sx={{ 
                 mb: 4, 
                 p: 3, 
                 background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
                 borderRadius: 3, 
                 border: '1px solid rgba(102, 126, 234, 0.2)',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
                 <Box sx={{
                   position: 'absolute',
                   top: -20,
                   right: -20,
                   width: 60,
                   height: 60,
                   borderRadius: '50%',
                   backgroundColor: 'rgba(102, 126, 234, 0.1)',
                   zIndex: 1,
                 }} />
                 <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, position: 'relative', zIndex: 2 }}>
                   💡 {t('how_to_manage_time_slots')}:
                 </Typography>
                 <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500, position: 'relative', zIndex: 2 }}>
                   • {t('click_plus_button_to_add')}
                 </Typography>
                 <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500, position: 'relative', zIndex: 2 }}>
                   • {t('add_multiple_time_slots')}
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, position: 'relative', zIndex: 2 }}>
                   • {t('click_time_slot_chip_to_edit')}
                 </Typography>
               </Box>

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
                         borderRadius: 4,
                         boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                         border: '2px solid',
                         borderColor: doctorAppointments.length > 0 
                           ? 'rgba(102, 126, 234, 0.3)' 
                           : 'rgba(0,0,0,0.1)',
                         position: 'relative',
                         overflow: 'hidden',
                         '&:hover': { 
                           boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                           transform: 'translateY(-2px)',
                           borderColor: 'rgba(102, 126, 234, 0.5)'
                         },
                         transition: 'all 0.3s ease',
                         ...(doctorAppointments.length > 0 && {
                           background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
                         })
                       }}>
                         <CardContent sx={{ p: 3 }}>
                           {/* Doctor Header */}
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                               <Avatar 
                                 sx={{ 
                                   width: 64, 
                                   height: 64, 
                                   mr: 3, 
                                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                   fontSize: '1.3rem',
                                   fontWeight: 'bold',
                                   boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                                   color: 'white'
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
                               <Tooltip title={t('weekly_schedule')}>
                                 <IconButton 
                                   onClick={() => handleOpenWeeklySchedule(doctor)}
                                   sx={{
                                     background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                     color: 'white',
                                     boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                                     '&:hover': {
                                       background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
                                       transform: 'scale(1.1)',
                                       boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                                     },
                                     transition: 'all 0.3s ease'
                                   }}
                                   size="small"
                                 >
                                   <Schedule />
                                 </IconButton>
                               </Tooltip>
                               <Tooltip title={t('add_time_slot')}>
                                 <IconButton 
                                   onClick={() => handleAddAppointment(doctor.id)}
                                   sx={{
                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                     color: 'white',
                                     boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                     '&:hover': {
                                       background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                       transform: 'scale(1.1)',
                                       boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                     },
                                     transition: 'all 0.3s ease'
                                   }}
                                   size="small"
                                 >
                                   <Add />
                                 </IconButton>
                               </Tooltip>
                               <Badge 
                                 badgeContent={doctorAppointments.length} 
                                 max={99}
                                 sx={{
                                   '& .MuiBadge-badge': {
                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                     color: 'white',
                                     fontWeight: 700,
                                     fontSize: '0.75rem',
                                     boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                   }
                                 }}
                               >
                                 <Person sx={{ 
                                   color: 'text.secondary',
                                   fontSize: 28
                                 }} />
                               </Badge>
                             </Box>
                           </Box>

                           {/* Availability Stats */}
                           <Box sx={{ mb: 3 }}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                               <Typography variant="body2" color="text.secondary">
                                 {t('schedule_utilization')}
                               </Typography>
                               <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                 {bookedSlots}/{totalSlots} {t('slots')}
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
                                 {availableSlots} {t('available')}
                               </Typography>
                               <Typography variant="caption" sx={{ color: '#f44336' }}>
                                 {bookedSlots} {t('reserved')}
                               </Typography>
                             </Box>
                           </Box>

                           {/* Time Slots */}
                           <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                             {t('time_slots_total', { count: timeSlots.length })}:
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
                                   title={slot.isReserved ? t('reserved_slot_tooltip', { patient: slot.patient }) : 
                                         slot.isAvailableSlot ? t('available_slot_tooltip') :
                                         t('regular_hours_tooltip')}
                                 />
                               );
                             })}
                           </Box>

                           {/* Reserved Appointments */}
                           {doctorAppointments.filter(apt => apt.patient && !apt.isAvailableSlot).length > 0 && (
                             <Box sx={{ mt: 3 }}>
                               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                 🔒 {t('reserved_appointments_count', { count: doctorAppointments.filter(apt => apt.patient && !apt.isAvailableSlot).length })}:
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
                                           {apt.duration} {t('min')} • Dr. {doctor.name} • {t('reserved_appointment')}
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
                                 ⏰ {t('available_slots_count', { count: doctorAppointments.filter(apt => apt.isAvailableSlot).length })}:
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
                                        ⏰ {apt.time} - {t('available')}
                                         </Typography>
                                       }
                                       secondary={
                                         <Typography variant="caption" color="text.secondary">
                                           {apt.duration} {t('min')} • Dr. {doctor.name} • {t('available_slot')}
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

               {/* Enhanced Doctors Off Today */}
               {doctors.filter(doctor => !isDoctorWorking(doctor)).length > 0 && (
                 <Box sx={{ mt: 4 }}>
                   <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                     👥 {t('doctors_off_today', { day: t(getSelectedDayOfWeek()) })}:
                   </Typography>
                   <Grid container spacing={3}>
                     {doctors.filter(doctor => !isDoctorWorking(doctor)).map((doctor) => (
                       <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                         <Card sx={{ 
                           borderRadius: 4,
                           boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                           border: '2px solid rgba(0,0,0,0.1)',
                           position: 'relative',
                           overflow: 'hidden',
                           '&:hover': { 
                             boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                             transform: 'translateY(-2px)',
                             borderColor: 'rgba(102, 126, 234, 0.3)'
                           },
                           transition: 'all 0.3s ease',
                           background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)',
                         }}>
                           <CardContent sx={{ p: 3 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                 <Avatar sx={{ 
                                   width: 48, 
                                   height: 48, 
                                   mr: 2, 
                                   backgroundColor: '#bdbdbd',
                                   fontSize: '1.1rem',
                                   fontWeight: 'bold'
                                 }}>
                                   {doctor.avatar}
                                 </Avatar>
                                 <Box sx={{ flex: 1 }}>
                                   <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                     {doctor.name}
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                     {doctor.specialty}
                                   </Typography>
                                   <Typography variant="caption" sx={{ 
                                     color: 'warning.main', 
                                     fontWeight: 600,
                                     backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                     padding: '2px 8px',
                                     borderRadius: '12px',
                                     display: 'inline-block',
                                     mt: 0.5
                                   }}>
                                     📅 {t('day_off')}
                                   </Typography>
                                 </Box>
                               </Box>
                               <Tooltip title={t('edit_doctor_schedule')}>
                                 <IconButton 
                                   onClick={() => handleEditDoctor(doctor)}
                                   sx={{
                                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                     color: 'white',
                                     boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                     '&:hover': {
                                       background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                       transform: 'scale(1.05)',
                                       boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                     },
                                     transition: 'all 0.3s ease'
                                   }}
                                   size="small"
                                 >
                                   <Edit fontSize="small" />
                                 </IconButton>
                               </Tooltip>
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
             <Box sx={{ p: 4 }}>
               <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                 📊 {t('weekly_schedule_overview')}
               </Typography>
               
               <Box sx={{ 
                 mb: 4, 
                 p: 3, 
                 background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
                 borderRadius: 3, 
                 border: '1px solid rgba(102, 126, 234, 0.2)'
               }}>
                 <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                   📅 {t('weekly_working_patterns')}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                   {t('weekly_overview_description')}
                 </Typography>
               </Box>
               
               <TableContainer component={Paper} sx={{ 
                 borderRadius: 4,
                 boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                 border: '1px solid rgba(0,0,0,0.05)',
                 overflow: 'hidden'
               }}>
                 <Table>
                   <TableHead sx={{ 
                     background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                   }}>
                     <TableRow>
                       <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('doctor')}</TableCell>
                       {daysOfWeek.map((day) => (
                         <TableCell key={day} sx={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.95rem' }}>
                           {t(day).substring(0, 3)}
                         </TableCell>
                       ))}
                       <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
                         {t('actions')}
                       </TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {doctors.map((doctor) => (
                       <TableRow key={doctor.id} hover sx={{
                         '&:hover': {
                           backgroundColor: 'rgba(102, 126, 234, 0.02)',
                         }
                       }}>
                         <TableCell>
                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <Avatar sx={{ 
                               width: 40, 
                               height: 40, 
                               mr: 2, 
                               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                               color: 'white',
                               fontWeight: 'bold',
                               fontSize: '1rem'
                             }}>
                               {doctor.avatar}
                             </Avatar>
                             <Box>
                               <Typography variant="body2" fontWeight={700}>
                                 {doctor.name}
                               </Typography>
                               <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                 {doctor.specialty}
                               </Typography>
                             </Box>
                           </Box>
                         </TableCell>
                         {daysOfWeek.map((day) => (
                           <TableCell key={day}>
                             {doctor.offDays.includes(day) ? (
                               <Chip 
                                 label={t('off')} 
                                 size="small" 
                                 sx={{
                                   backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                   color: '#d32f2f',
                                   border: '1px solid rgba(244, 67, 54, 0.3)',
                                   fontWeight: 600
                                 }}
                               />
                             ) : (
                               <Box sx={{
                                 p: 1,
                                 backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                 borderRadius: 2,
                                 border: '1px solid rgba(76, 175, 80, 0.3)'
                               }}>
                                 <Typography variant="caption" sx={{ 
                                   fontWeight: 700,
                                   color: '#2e7d32',
                                   display: 'block',
                                   textAlign: 'center'
                                 }}>
                                   {doctor.workingHours.start}
                                 </Typography>
                                 <Typography variant="caption" sx={{ 
                                   fontWeight: 500,
                                   color: '#2e7d32',
                                   display: 'block',
                                   textAlign: 'center'
                                 }}>
                                   {doctor.workingHours.end}
                                 </Typography>
                               </Box>
                             )}
                           </TableCell>
                         ))}
                         <TableCell sx={{ textAlign: 'center' }}>
                           <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                             <Tooltip title={t('weekly_schedule')}>
                               <Button
                                 variant="contained"
                                 size="small"
                                 startIcon={<Schedule />}
                                 onClick={() => handleOpenWeeklySchedule(doctor)}
                                 sx={{
                                   background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                   color: 'white',
                                   boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                                   borderRadius: 2,
                                   fontSize: '0.75rem',
                                   fontWeight: 600,
                                   px: 2,
                                   '&:hover': {
                                     background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
                                     transform: 'scale(1.05)',
                                     boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                                   },
                                   transition: 'all 0.3s ease'
                                 }}
                               >
                                 Weekly Schedule
                               </Button>
                             </Tooltip>
                             <Tooltip title={t('edit_doctor_profile')}>
                               <IconButton 
                                 onClick={() => handleEditDoctor(doctor)}
                                 sx={{
                                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                   color: 'white',
                                   boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                   '&:hover': {
                                     background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                     transform: 'scale(1.05)',
                                     boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                   },
                                   transition: 'all 0.3s ease'
                                 }}
                                 size="small"
                               >
                                 <Edit fontSize="small" />
                               </IconButton>
                             </Tooltip>
                           </Box>
                         </TableCell>
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
                 {t('all_doctors_count', { count: doctors.length })}
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
                               {t('off_days')}: {doctor.offDays.length > 0 ? doctor.offDays.map(day => t(day)).join(', ') : t('none')} • 
                               {t('max_patients_per_hour', { max: doctor.maxPatientsPerHour })} • 
                               {t('consultation_duration_min', { duration: doctor.consultationDuration })}
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
                   {t('add_available_time_slot')}
                 </Typography>
                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
                   {t('create_availability_for', { doctor: doctors.find(d => d.id === selectedDoctorForAdd)?.name || t('doctor') })}
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
                 ℹ️ <strong>{t('what_this_does')}:</strong>
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 {t('add_time_slot_description')}
               </Typography>
               <Box sx={{ mt: 2, ml: 2 }}>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                   • <span style={{ color: '#2e7d32', fontWeight: 600 }}>{t('green_slots')}</span>: {t('regular_working_hours_description')}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                   • <span style={{ color: '#1976d2', fontWeight: 600 }}>{t('blue_slots')}</span>: {t('available_slots_description')}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                   • <span style={{ color: '#d32f2f', fontWeight: 600 }}>{t('red_slots')}</span>: {t('reserved_slots_description')}
                 </Typography>
                 <Typography variant="body2" sx={{ mt: 1, p: 1, backgroundColor: '#e8f5e8', borderRadius: 1, color: '#2e7d32', fontWeight: 600 }}>
                   ✅ {t('can_add_multiple_time_slots')}
                 </Typography>
               </Box>
             </Box>
             
             <FormControl fullWidth margin="normal">
               <InputLabel id="doctor-label">{t('doctor')}</InputLabel>
               <Select
                 labelId="doctor-label"
                 id="doctor"
                 value={selectedDoctorForAdd || ''}
                 label={t('doctor')}
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
                               ✅ {t('has_existing_appointments')}
                             </Typography>
                           )}
                         </Box>
                         {hasExistingAppointments && (
                           <Chip 
                             label={t('slots_count', { count: doctorAppointments.length })} 
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
               label={t('time_slot')}
               type="time"
               value={formData.time || ''}
               onChange={(e) => setFormData({ ...formData, time: e.target.value })}
               helperText={t('enter_time_format')}
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
               {t('cancel')}
             </Button>
             <Button 
               onClick={handleSaveNew}
               variant="contained"
               sx={{ borderRadius: 2, px: 4 }}
             >
               {t('add_time_slot')}
             </Button>
           </DialogActions>
         </Dialog>

         {/* Edit Appointment Dialog */}
         <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
           <DialogTitle>{t('edit_appointment')}</DialogTitle>
           <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                id="time"
                label={t('time_hhmm_format')}
                type="time"
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                helperText={t('change_time_or_enter_new')}
              />
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setEditDialogOpen(false)}>{t('cancel')}</Button>
             <Button onClick={handleSaveEdit}>{t('save')}</Button>
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
               {t('edit')}
             </MenuItem>
             <MenuItem onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(selectedAppointment); }}>
               <Delete />
               {t('delete')}
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
                   {t('add_new_doctor')}
                 </Typography>
                 <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                   🩺 {t('register_new_medical_professional')}
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
                 👨‍⚕️ {t('doctor_information')}
               </Typography>
               <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                 {t('doctor_registration_description')}
               </Typography>
             </Box>

             <Grid container spacing={4}>
               {/* Personal Information Section */}
               <Grid item xs={12}>
                 <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Person sx={{ fontSize: 24 }} />
                   {t('personal_information')}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={`${t('full_name')} *`}
                   value={doctorFormData.name}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                   placeholder={t('doctor_name_placeholder')}
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
                   <InputLabel>{`${t('medical_specialty')} *`}</InputLabel>
                   <Select
                     value={doctorFormData.specialty}
                     label={`${t('medical_specialty')} *`}
                     onChange={(e) => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                     required
                   >
                     {medicalSpecialties.map((specialty) => (
                       <MenuItem key={specialty.value} value={specialty.value}>
                         {t(specialty.key)}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>

               {/* Working Schedule Section */}
               <Grid item xs={12} sx={{ mt: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Schedule sx={{ fontSize: 24 }} />
                   {t('working_schedule')}
                 </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('working_hours_start')}
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
                   label={t('working_hours_end')}
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
                   label={t('consultation_duration_minutes')}
                   type="number"
                   value={doctorFormData.consultationDuration}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationDuration: parseInt(e.target.value) || 30 })}
                   inputProps={{ min: 15, max: 120, step: 15 }}
                   helperText={t('typical_duration_range')}
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
                   label={t('max_patients_per_hour')}
                   type="number"
                   value={doctorFormData.maxPatientsPerHour}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, maxPatientsPerHour: parseInt(e.target.value) || 2 })}
                   inputProps={{ min: 1, max: 10 }}
                   helperText={t('recommended_patients_range')}
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
                   <InputLabel>{t('off_days')}</InputLabel>
                   <Select
                     multiple
                     value={doctorFormData.offDays}
                     onChange={(e) => setDoctorFormData({ ...doctorFormData, offDays: e.target.value as string[] })}
                     label={t('off_days')}
                     renderValue={(selected) => selected.map(day => t(day)).join(', ')}
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
                           {t(day)}
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
               {t('cancel')}
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
               ✨ {t('add_doctor_to_clinic')}
             </Button>
           </DialogActions>
         </Dialog>

         {/* Enhanced Edit Doctor Dialog */}
         <Dialog 
           open={editDoctorDialogOpen} 
           onClose={() => setEditDoctorDialogOpen(false)}
           maxWidth="lg"
           fullWidth
           PaperProps={{
             sx: {
               borderRadius: 4,
               background: 'linear-gradient(145deg, #fff8e1 0%, #e8f5e8 25%, #ffffff 100%)',
               boxShadow: '0 24px 50px rgba(102, 126, 234, 0.15)',
               overflow: 'hidden',
             }
           }}
         >
           <DialogTitle sx={{ 
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                 <Edit sx={{ fontSize: 36, color: 'white' }} />
               </Box>
               <Box>
                 <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.8rem' }}>
                   {t('edit_doctor_information')}
                 </Typography>
                 <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                   🩺 {t('update_doctor_profile', { doctor: selectedDoctorForEdit?.name || t('doctor') })}
                 </Typography>
               </Box>
             </Box>
           </DialogTitle>
           
           <DialogContent sx={{ p: 5, backgroundColor: '#fafafa' }}>
             <Grid container spacing={4}>
               <Grid item xs={12}>
                 <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Person />
                   {t('personal_information')}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('doctor_name')}
                   value={doctorFormData.name}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                   required
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       borderRadius: 3,
                       backgroundColor: 'white',
                       '&:hover fieldset': { borderColor: '#667eea' },
                       '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                     },
                     '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                   }}
                 />
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth sx={{
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 3,
                     backgroundColor: 'white',
                     '&:hover fieldset': { borderColor: '#667eea' },
                     '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                   },
                   '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                 }}>
                   <InputLabel>{t('medical_specialty')}</InputLabel>
                   <Select
                     value={doctorFormData.specialty}
                     label={t('medical_specialty')}
                     onChange={(e) => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                     required
                   >
                     {medicalSpecialties.map((specialty) => (
                       <MenuItem key={specialty.value} value={specialty.value}>
                         {t(specialty.key)}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>

               <Grid item xs={12}>
                 <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Schedule />
                   {t('working_hours_and_schedule')}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('working_hours_start')}
                   type="time"
                   value={doctorFormData.workingHoursStart}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, workingHoursStart: e.target.value })}
                   InputLabelProps={{ shrink: true }}
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       borderRadius: 3,
                       backgroundColor: 'white',
                       '&:hover fieldset': { borderColor: '#667eea' },
                       '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                     },
                     '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                   }}
                 />
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('working_hours_end')}
                   type="time"
                   value={doctorFormData.workingHoursEnd}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, workingHoursEnd: e.target.value })}
                   InputLabelProps={{ shrink: true }}
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       borderRadius: 3,
                       backgroundColor: 'white',
                       '&:hover fieldset': { borderColor: '#667eea' },
                       '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                     },
                     '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                   }}
                 />
               </Grid>
               
               <Grid item xs={12}>
                 <FormControl fullWidth sx={{
                   '& .MuiOutlinedInput-root': {
                     borderRadius: 3,
                     backgroundColor: 'white',
                     '&:hover fieldset': { borderColor: '#667eea' },
                     '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                   },
                   '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                 }}>
                   <InputLabel>{t('off_days')}</InputLabel>
                   <Select
                     multiple
                     value={doctorFormData.offDays}
                     onChange={(e) => setDoctorFormData({ ...doctorFormData, offDays: e.target.value as string[] })}
                     label={t('off_days')}
                     renderValue={(selected) => selected.map(day => t(day)).join(', ')}
                   >
                     {daysOfWeek.map((day) => (
                       <MenuItem key={day} value={day}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Box sx={{ 
                             width: 8, 
                             height: 8, 
                             borderRadius: '50%', 
                             backgroundColor: doctorFormData.offDays.includes(day) ? '#667eea' : '#e0e0e0' 
                           }} />
                           {t(day)}
                         </Box>
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('consultation_duration_minutes')}
                   type="number"
                   value={doctorFormData.consultationDuration}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationDuration: parseInt(e.target.value) || 30 })}
                   inputProps={{ min: 15, max: 120, step: 15 }}
                   helperText={t('typical_duration_range')}
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       borderRadius: 3,
                       backgroundColor: 'white',
                       '&:hover fieldset': { borderColor: '#667eea' },
                       '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                     },
                     '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                   }}
                 />
               </Grid>
               
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label={t('max_patients_per_hour')}
                   type="number"
                   value={doctorFormData.maxPatientsPerHour}
                   onChange={(e) => setDoctorFormData({ ...doctorFormData, maxPatientsPerHour: parseInt(e.target.value) || 2 })}
                   inputProps={{ min: 1, max: 10 }}
                   helperText={t('recommended_patients_range')}
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       borderRadius: 3,
                       backgroundColor: 'white',
                       '&:hover fieldset': { borderColor: '#667eea' },
                       '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                     },
                     '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                   }}
                 />
               </Grid>
             </Grid>
           </DialogContent>
           
           <DialogActions sx={{ 
             p: 4, 
             gap: 3, 
             backgroundColor: '#f8f9fa',
             borderTop: '1px solid #e0e0e0' 
           }}>
             <Button 
               onClick={() => setEditDoctorDialogOpen(false)}
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
               {t('cancel')}
             </Button>
             <Button 
               onClick={handleSaveEditedDoctor}
               variant="contained"
               size="large"
               sx={{ 
                 borderRadius: 3, 
                 px: 6,
                 py: 1.5,
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                 fontWeight: 600,
                 fontSize: '1.1rem',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                   boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                   transform: 'translateY(-2px)',
                 },
                 transition: 'all 0.3s ease',
               }}
             >
               ✨ {t('update_doctor')}
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
                   {t('edit_time_slot_time', { time: selectedTimeSlot?.time })}
                 </Typography>
                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
                   {t('configure_slot_type_and_patient')}
                 </Typography>
               </Box>
             </Box>
           </DialogTitle>
           
           <DialogContent sx={{ p: 4 }}>
             {/* Current Status */}
             <Box sx={{ mb: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
               <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                 {t('current_status')}
               </Typography>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Chip
                   label={selectedTimeSlot?.type === 'reserved' ? `🔒 ${t('reserved')}` : 
                         selectedTimeSlot?.type === 'available' ? `⏰ ${t('available')}` : 
                         `✅ ${t('regular')}`}
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
                     {t('patient')}: <strong>{selectedTimeSlot.appointment.patient}</strong>
                   </Typography>
                 )}
               </Box>
             </Box>

             <Grid container spacing={3}>
               <Grid item xs={12}>
                 <FormControl fullWidth>
                   <InputLabel>{t('slot_type')}</InputLabel>
                   <Select
                     value={timeSlotFormData.type}
                     label={t('slot_type')}
                     onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, type: e.target.value as 'regular' | 'available' | 'reserved' })}
                   >
                     <MenuItem value="regular">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Chip label="✅" size="small" sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} />
                         <Box>
                           <Typography variant="body2" fontWeight={600}>{t('regular_working_hours')}</Typography>
                           <Typography variant="caption" color="text.secondary">
                             {t('standard_doctor_availability')}
                           </Typography>
                         </Box>
                       </Box>
                     </MenuItem>
                     <MenuItem value="available">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Chip label="⏰" size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} />
                         <Box>
                           <Typography variant="body2" fontWeight={600}>{t('available_slot_added_manually')}</Typography>
                           <Typography variant="caption" color="text.secondary">
                             {t('extra_availability_outside_hours')}
                           </Typography>
                         </Box>
                       </Box>
                     </MenuItem>
                     <MenuItem value="reserved">
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Chip label="🔒" size="small" sx={{ backgroundColor: '#ffcdd2', color: '#d32f2f' }} />
                         <Box>
                           <Typography variant="body2" fontWeight={600}>{t('reserved_patient_appointment')}</Typography>
                           <Typography variant="caption" color="text.secondary">
                             {t('booked_appointment_with_patient')}
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
                       label={`${t('patient_name')} *`}
                       value={timeSlotFormData.patientName}
                       onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, patientName: e.target.value })}
                       placeholder={t('full_patient_name')}
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
                       label={t('patient_phone')}
                       value={timeSlotFormData.patientPhone}
                       onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, patientPhone: e.target.value })}
                       placeholder={t('contact_number')}
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
                       <InputLabel>{t('appointment_type')}</InputLabel>
                       <Select
                         value={timeSlotFormData.appointmentType}
                         label={t('appointment_type')}
                         onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, appointmentType: e.target.value })}
                         sx={{
                           borderRadius: 2,
                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800' },
                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800' },
                         }}
                       >
                         {appointmentTypes.map((type) => (
                           <MenuItem key={type.value} value={type.value}>
                             {t(type.key)}
                           </MenuItem>
                         ))}
                       </Select>
                     </FormControl>
                   </Grid>
                   <Grid item xs={12}>
                     <TextField
                       fullWidth
                       label={t('notes')}
                       multiline
                       rows={3}
                       value={timeSlotFormData.notes}
                       onChange={(e) => setTimeSlotFormData({ ...timeSlotFormData, notes: e.target.value })}
                       placeholder={t('additional_notes_placeholder')}
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
               {t('cancel')}
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
               {t('save_changes')}
             </Button>
           </DialogActions>
         </Dialog>

         {/* Weekly Schedule Dialog */}
         <Dialog 
           open={weeklyScheduleDialogOpen} 
           onClose={() => setWeeklyScheduleDialogOpen(false)}
           maxWidth="lg"
           fullWidth
           PaperProps={{
             sx: {
               borderRadius: 4,
               background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
               boxShadow: '0 20px 40px rgba(76, 175, 80, 0.15)',
               maxHeight: '90vh',
             }
           }}
         >
           <DialogTitle sx={{ 
             background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
             color: 'white',
             borderRadius: 0,
           }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Schedule sx={{ fontSize: 32 }} />
               <Box>
                 <Typography variant="h5" sx={{ fontWeight: 700 }}>
                   📅 Weekly Schedule for Dr. {selectedDoctorForWeekly?.name}
                 </Typography>
                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
                   Set working days, time slots, and off days for the entire week
                 </Typography>
               </Box>
             </Box>
           </DialogTitle>
           
                       <DialogContent sx={{ p: 4, maxHeight: '60vh', overflow: 'auto' }}>
              {/* Helpful Info */}
              <Box sx={{ mb: 4, p: 3, backgroundColor: '#e8f5e9', borderRadius: 3, border: '1px solid #4CAF50' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
                  💡 Flexible Weekly Scheduling
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Different schedules per day:</strong> Monday 9-12, Tuesday 2-5, Wednesday off, etc.<br/>
                  • <strong>Custom time slots:</strong> Add any time slots you want for each day<br/>
                  • <strong>Copy & Apply:</strong> Use helper buttons to copy slots between days<br/>
                  • <strong>Persistent:</strong> Your custom schedule is saved and remembered
                </Typography>
              </Box>

              {/* Week Navigation */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 3 }}>
                <Button 
                  onClick={() => navigateWeek('prev')}
                  variant="outlined"
                  startIcon={<Add sx={{ transform: 'rotate(180deg)' }} />}
                  sx={{ borderRadius: 2 }}
                >
                  Previous Week
                </Button>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Week of {new Date(currentWeekStart).toLocaleDateString()}
                </Typography>
                <Button 
                  onClick={() => navigateWeek('next')}
                  variant="outlined"
                  endIcon={<Add />}
                  sx={{ borderRadius: 2 }}
                >
                  Next Week
                </Button>
              </Box>

             {/* Daily Schedule Grid */}
             <Grid container spacing={3}>
               {daysOfWeek.map((day, index) => {
                 const dayData = weeklyScheduleData[day] || { isWorking: false, timeSlots: [], notes: '' };
                 const weekDate = getWeekDates()[index];
                 
                 return (
                   <Grid item xs={12} key={day}>
                     <Card sx={{ 
                       border: dayData.isWorking ? '2px solid #4CAF50' : '2px solid #e0e0e0',
                       backgroundColor: dayData.isWorking ? '#f1f8e9' : '#fafafa',
                       borderRadius: 3,
                     }}>
                       <CardContent sx={{ p: 3 }}>
                         {/* Day Header */}
                         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                             <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                               {t(day)} ({new Date(weekDate).toLocaleDateString()})
                             </Typography>
                             <Chip 
                               label={dayData.isWorking ? 'Working Day' : 'Day Off'}
                               size="small"
                               sx={{
                                 backgroundColor: dayData.isWorking ? '#c8e6c8' : '#ffcdd2',
                                 color: dayData.isWorking ? '#2e7d32' : '#d32f2f',
                                 fontWeight: 600
                               }}
                             />
                           </Box>
                           <Button
                             variant={dayData.isWorking ? "contained" : "outlined"}
                             color={dayData.isWorking ? "success" : "primary"}
                             onClick={() => setWeeklyScheduleData(prev => ({
                               ...prev,
                               [day]: {
                                 ...prev[day],
                                 isWorking: !dayData.isWorking,
                                 timeSlots: !dayData.isWorking ? [] : prev[day]?.timeSlots || []
                               }
                             }))}
                             sx={{ borderRadius: 2 }}
                           >
                             {dayData.isWorking ? 'Set as Day Off' : 'Set as Working Day'}
                           </Button>
                         </Box>

                                                   {/* Time Slots (only for working days) */}
                          {dayData.isWorking && (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  Time Slots ({dayData.timeSlots.length})
                                </Typography>
                              </Box>

                              {/* Quick Availability Presets */}
                              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
                                  ⚡ Quick Availability Presets:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => applyQuickAvailability(day, 'morning')}
                                    sx={{ 
                                      borderRadius: 2, 
                                      fontSize: '0.75rem',
                                      backgroundColor: '#e3f2fd',
                                      '&:hover': { backgroundColor: '#bbdefb' }
                                    }}
                                  >
                                    🌅 Morning (9-12)
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => applyQuickAvailability(day, 'afternoon')}
                                    sx={{ 
                                      borderRadius: 2, 
                                      fontSize: '0.75rem',
                                      backgroundColor: '#fff3e0',
                                      '&:hover': { backgroundColor: '#ffe0b2' }
                                    }}
                                  >
                                    ☀️ Afternoon (2-5)
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => applyQuickAvailability(day, 'evening')}
                                    sx={{ 
                                      borderRadius: 2, 
                                      fontSize: '0.75rem',
                                      backgroundColor: '#f3e5f5',
                                      '&:hover': { backgroundColor: '#e1bee7' }
                                    }}
                                  >
                                    🌙 Evening (6-9)
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => applyQuickAvailability(day, 'full')}
                                    sx={{ 
                                      borderRadius: 2, 
                                      fontSize: '0.75rem',
                                      backgroundColor: '#e8f5e9',
                                      color: '#2e7d32',
                                      borderColor: '#4caf50',
                                      '&:hover': { backgroundColor: '#c8e6c9', borderColor: '#2e7d32' }
                                    }}
                                  >
                                    🌈 Full Day
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Schedule />}
                                    onClick={() => applyDefaultHoursToDay(day)}
                                    sx={{ 
                                      borderRadius: 2, 
                                      fontSize: '0.75rem',
                                      backgroundColor: '#e8eaf6'
                                    }}
                                  >
                                    📋 Default Hours
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => clearAllTimeSlotsForDay(day)}
                                    sx={{ 
                                      borderRadius: 2, 
                                      fontSize: '0.75rem',
                                      backgroundColor: '#ffebee',
                                      color: '#d32f2f',
                                      borderColor: '#f44336',
                                      '&:hover': { backgroundColor: '#ffcdd2', borderColor: '#d32f2f' }
                                    }}
                                  >
                                    🗑️ Clear All
                                  </Button>
                                </Box>
                              </Box>

                              {/* Current Time Slots */}
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
                                  📅 Current Time Slots:
                                </Typography>
                                {dayData.timeSlots.length === 0 ? (
                                  <Box sx={{ 
                                    p: 3, 
                                    textAlign: 'center', 
                                    backgroundColor: '#f5f5f5', 
                                    borderRadius: 2,
                                    border: '2px dashed #ccc'
                                  }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No time slots added yet. Use quick presets above or add custom slots below.
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {dayData.timeSlots.map((timeSlot, slotIndex) => (
                                      <Box 
                                        key={slotIndex} 
                                        sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 1,
                                          p: 1,
                                          backgroundColor: '#ffffff',
                                          border: '1px solid #e0e0e0',
                                          borderRadius: 2,
                                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                      >
                                        <TextField
                                          size="small"
                                          type="time"
                                          value={timeSlot}
                                          onChange={(e) => updateTimeSlot(day, slotIndex, e.target.value)}
                                          sx={{ 
                                            width: 130,
                                            '& .MuiOutlinedInput-root': { 
                                              borderRadius: 2,
                                              '& fieldset': { borderColor: '#e0e0e0' },
                                              '&:hover fieldset': { borderColor: '#2196f3' },
                                              '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                          }}
                                        />
                                        <IconButton 
                                          size="small" 
                                          color="error"
                                          onClick={() => removeTimeSlotFromDay(day, slotIndex)}
                                          sx={{
                                            backgroundColor: '#ffebee',
                                            '&:hover': { backgroundColor: '#ffcdd2' }
                                          }}
                                        >
                                          <Delete />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Box>

                              {/* Add Custom Time Slot */}
                              <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
                                  ➕ Add Custom Time Slot:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <TextField
                                    size="small"
                                    type="time"
                                    value={newTimeSlot}
                                    onChange={(e) => setNewTimeSlot(e.target.value)}
                                    placeholder="Select time"
                                    sx={{ 
                                      width: 150,
                                      '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        backgroundColor: '#ffffff'
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => addTimeSlotToDay(day)}
                                    disabled={!newTimeSlot}
                                    sx={{ 
                                      borderRadius: 2,
                                      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
                                      }
                                    }}
                                  >
                                    Add Slot
                                  </Button>
                                </Box>
                              </Box>

                             {/* Notes for the day */}
                             <TextField
                               fullWidth
                               size="small"
                               label={`Notes for ${t(day)}`}
                               value={dayData.notes}
                               onChange={(e) => setWeeklyScheduleData(prev => ({
                                 ...prev,
                                 [day]: {
                                   ...prev[day],
                                   notes: e.target.value
                                 }
                               }))}
                               placeholder="Special notes or instructions for this day..."
                               sx={{ 
                                 '& .MuiOutlinedInput-root': { borderRadius: 2 }
                               }}
                             />
                           </Box>
                         )}
                       </CardContent>
                     </Card>
                   </Grid>
                 );
               })}
             </Grid>

             {/* Weekly Schedule Summary */}
             <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
               <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                 📋 Weekly Schedule Summary
               </Typography>
               <Grid container spacing={1}>
                 {daysOfWeek.map(day => {
                   const dayData = weeklyScheduleData[day] || { isWorking: false, timeSlots: [] };
                   return (
                     <Grid item xs={12} sm={6} md={4} lg={3} key={day}>
                       <Box sx={{ 
                         p: 2, 
                         backgroundColor: dayData.isWorking ? '#e8f5e8' : '#ffebee',
                         borderRadius: 2,
                         border: `1px solid ${dayData.isWorking ? '#4CAF50' : '#f44336'}`
                       }}>
                         <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                           {t(day)}
                         </Typography>
                         {dayData.isWorking ? (
                           <Typography variant="caption" color="text.secondary">
                             {dayData.timeSlots.length} time slots
                             {dayData.timeSlots.length > 0 && (
                               <><br/>{dayData.timeSlots[0]} - {dayData.timeSlots[dayData.timeSlots.length - 1]}</>
                             )}
                           </Typography>
                         ) : (
                           <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                             Day Off
                           </Typography>
                         )}
                       </Box>
                     </Grid>
                   );
                 })}
               </Grid>
             </Box>
           </DialogContent>
           
           <DialogActions sx={{ p: 4, gap: 3, backgroundColor: '#f8f9fa' }}>
             <Button 
               onClick={() => setWeeklyScheduleDialogOpen(false)}
               variant="outlined"
               size="large"
               sx={{ borderRadius: 3, px: 4 }}
             >
               Cancel
             </Button>
             <Button 
               onClick={handleSaveWeeklySchedule}
               variant="contained"
               size="large"
               sx={{ 
                 borderRadius: 3, 
                 px: 6,
                 background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                 boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
                   boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)',
                 }
               }}
             >
               ✅ Save Weekly Schedule
             </Button>
           </DialogActions>
         </Dialog>

         {/* Recurring Appointments Dialog */}
         <Dialog 
           open={recurringAppointmentsDialogOpen} 
           onClose={() => setRecurringAppointmentsDialogOpen(false)}
           maxWidth="md"
           fullWidth
           PaperProps={{
             sx: {
               borderRadius: 4,
               background: 'linear-gradient(145deg, #fff3e0 0%, #ffffff 100%)',
               boxShadow: '0 20px 40px rgba(255, 152, 0, 0.15)',
             }
           }}
         >
           <DialogTitle sx={{ 
             background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
             color: 'white',
             borderRadius: 0,
           }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <EventAvailable sx={{ fontSize: 32 }} />
               <Box>
                 <Typography variant="h5" sx={{ fontWeight: 700 }}>
                   🔄 Recurring Appointments Setup
                 </Typography>
                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
                   Automatically repeat current week's schedule for upcoming weeks
                 </Typography>
               </Box>
             </Box>
           </DialogTitle>
           
           <DialogContent sx={{ p: 4 }}>
             <Grid container spacing={3}>
               <Grid item xs={12}>
                 <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
                   <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                     ℹ️ How Recurring Appointments Work
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     This feature will copy all appointments from the current week (week of {new Date(currentWeekStart).toLocaleDateString()}) 
                     and create them for the specified number of future weeks. Perfect for doctors with regular schedules!
                   </Typography>
                 </Box>
               </Grid>

               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   label="Number of Weeks to Repeat"
                   type="number"
                   value={recurringSettings.weeksToRepeat}
                   onChange={(e) => setRecurringSettings(prev => ({ 
                     ...prev, 
                     weeksToRepeat: parseInt(e.target.value) || 1 
                   }))}
                   inputProps={{ min: 1, max: 12 }}
                   helperText="How many future weeks to create appointments for"
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
                   <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                     Recurring Options
                   </Typography>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                     <FormControlLabel
                       control={
                         <Switch
                           checked={recurringSettings.enabled}
                           onChange={(e) => setRecurringSettings(prev => ({ 
                             ...prev, 
                             enabled: e.target.checked 
                           }))}
                           color="warning"
                         />
                       }
                       label="Enable Recurring Appointments"
                     />
                     <FormControlLabel
                       control={
                         <Switch
                           checked={recurringSettings.includeOffDays}
                           onChange={(e) => setRecurringSettings(prev => ({ 
                             ...prev, 
                             includeOffDays: e.target.checked 
                           }))}
                           color="warning"
                         />
                       }
                       label="Include Doctor's Off Days"
                     />
                     <FormControlLabel
                       control={
                         <Switch
                           checked={recurringSettings.autoApprove}
                           onChange={(e) => setRecurringSettings(prev => ({ 
                             ...prev, 
                             autoApprove: e.target.checked 
                           }))}
                           color="warning"
                         />
                       }
                       label="Auto-approve Recurring Appointments"
                     />
                   </Box>
                 </FormControl>
               </Grid>

               <Grid item xs={12}>
                 <Box sx={{ p: 3, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
                   <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e65100', mb: 1 }}>
                     ⚠️ Preview
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     This will create <strong>{appointments.filter(apt => {
                       const aptDate = new Date(apt.date);
                       const weekStart = new Date(currentWeekStart);
                       const weekEnd = new Date(weekStart);
                       weekEnd.setDate(weekStart.getDate() + 6);
                       return aptDate >= weekStart && aptDate <= weekEnd;
                     }).length * recurringSettings.weeksToRepeat}</strong> new appointments 
                     across <strong>{recurringSettings.weeksToRepeat}</strong> weeks, starting from{' '}
                     <strong>{new Date(new Date(currentWeekStart).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>.
                   </Typography>
                 </Box>
               </Grid>
             </Grid>
           </DialogContent>
           
           <DialogActions sx={{ p: 4, gap: 3, backgroundColor: '#f8f9fa' }}>
             <Button 
               onClick={() => setRecurringAppointmentsDialogOpen(false)}
               variant="outlined"
               size="large"
               sx={{ borderRadius: 3, px: 4 }}
             >
               Cancel
             </Button>
             <Button 
               onClick={handleApplyRecurringSchedule}
               variant="contained"
               size="large"
               disabled={!recurringSettings.enabled}
               sx={{ 
                 borderRadius: 3, 
                 px: 6,
                 background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                 boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
                   boxShadow: '0 12px 40px rgba(255, 152, 0, 0.4)',
                 }
               }}
             >
               🔄 Create Recurring Schedule
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
  );
};

export default DoctorSchedulingPage;

// Export the doctorSchedules for backwards compatibility
export { doctorSchedules } from '../data/mockData';
