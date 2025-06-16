import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { getAppointmentsByDate, getAppointmentsByDoctor } from './appointments';

// TODO: Implement doctor scheduling API functions (e.g., get doctor schedules, book appointments, update availability)

export interface DoctorSchedule {
  id: string;
  name: string;
  specialty: string;
  workingHours: {
    start: string;
    end: string;
  };
  offDays: string[];
  maxPatientsPerHour: number;
  consultationDuration: number;
  availability?: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

const DOCTORS_COLLECTION = 'doctors';
const SCHEDULES_COLLECTION = 'doctor_schedules';

// Get all doctor schedules
export const getDoctorSchedules = async (): Promise<DoctorSchedule[]> => {
  try {
    const schedulesRef = collection(db, SCHEDULES_COLLECTION);
    const querySnapshot = await getDocs(schedulesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DoctorSchedule[];
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    // Return default schedules if Firebase fails
    return getDefaultDoctorSchedules();
  }
};

// Get doctor schedule by ID
export const getDoctorSchedule = async (doctorId: string): Promise<DoctorSchedule | null> => {
  try {
    const schedules = await getDoctorSchedules();
    return schedules.find(schedule => schedule.id === doctorId) || null;
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    return null;
  }
};

// Get doctor availability for a specific date
export const getDoctorAvailability = async (doctorId: string, date: string): Promise<TimeSlot[]> => {
  try {
    const doctorSchedule = await getDoctorSchedule(doctorId);
    if (!doctorSchedule) {
      throw new Error('Doctor schedule not found');
    }

    // Check if the date is an off day
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (doctorSchedule.offDays.includes(dayOfWeek)) {
      return [];
    }

    // Generate time slots based on working hours
    const timeSlots = generateTimeSlots(
      doctorSchedule.workingHours.start,
      doctorSchedule.workingHours.end,
      doctorSchedule.consultationDuration
    );

    // Get existing appointments for this doctor on this date
    const existingAppointments = await getAppointmentsByDoctor(doctorId);
    const dateAppointments = existingAppointments.filter(apt => apt.date === date);

    // Mark slots as unavailable if they have appointments
    return timeSlots.map(slot => ({
      ...slot,
      available: !dateAppointments.some(apt => apt.timeSlot === slot.time),
      appointmentId: dateAppointments.find(apt => apt.timeSlot === slot.time)?.id
    }));
  } catch (error) {
    console.error('Error getting doctor availability:', error);
    return [];
  }
};

// Generate time slots between start and end time
const generateTimeSlots = (startTime: string, endTime: string, duration: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let current = start;
  while (current < end) {
    const timeString = formatTime(current);
    slots.push({
      time: timeString,
      available: true
    });
    current += duration;
  }
  
  return slots;
};

// Parse time string to minutes
const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Format minutes to time string
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Check if a specific time slot is available
export const isTimeSlotAvailable = async (doctorId: string, date: string, timeSlot: string): Promise<boolean> => {
  try {
    const availability = await getDoctorAvailability(doctorId, date);
    const slot = availability.find(slot => slot.time === timeSlot);
    return slot ? slot.available : false;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
};

// Get all available time slots for all doctors on a specific date
export const getAllAvailableSlots = async (date: string): Promise<{ doctorId: string; doctorName: string; slots: TimeSlot[] }[]> => {
  try {
    const doctorSchedules = await getDoctorSchedules();
    const availabilityPromises = doctorSchedules.map(async (doctor) => {
      const slots = await getDoctorAvailability(doctor.id, date);
      return {
        doctorId: doctor.id,
        doctorName: doctor.name,
        slots: slots.filter(slot => slot.available)
      };
    });

    return await Promise.all(availabilityPromises);
  } catch (error) {
    console.error('Error getting all available slots:', error);
    return [];
  }
};

// Book an appointment (updates availability)
export const bookAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<string> => {
  try {
    // Check if the time slot is still available
    const isAvailable = await isTimeSlotAvailable(
      appointmentData.doctorId,
      appointmentData.date,
      appointmentData.time
    );

    if (!isAvailable) {
      throw new Error('Time slot is no longer available');
    }

    // Add the appointment (this will be handled by the appointments API)
    // This is a placeholder - the actual booking should be done through appointments API
    console.log('Booking appointment:', appointmentData);
    
    return 'appointment-id-placeholder';
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw new Error('Failed to book appointment');
  }
};

// Update doctor availability (admin function)
export const updateDoctorSchedule = async (doctorId: string, schedule: Partial<DoctorSchedule>): Promise<void> => {
  try {
    const doctorRef = doc(db, SCHEDULES_COLLECTION, doctorId);
    await updateDoc(doctorRef, schedule);
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    throw new Error('Failed to update doctor schedule');
  }
};

// Cancel appointment (frees up time slot)
export const cancelAppointment = async (appointmentId: string): Promise<void> => {
  try {
    // This should be handled by the appointments API
    // Just a placeholder for scheduling-related logic
    console.log('Cancelling appointment:', appointmentId);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw new Error('Failed to cancel appointment');
  }
};

// Get doctor's daily schedule with appointments
export const getDoctorDailySchedule = async (doctorId: string, date: string) => {
  try {
    const [schedule, appointments] = await Promise.all([
      getDoctorSchedule(doctorId),
      getAppointmentsByDate(date)
    ]);

    if (!schedule) {
      throw new Error('Doctor schedule not found');
    }

    const doctorAppointments = appointments.filter(apt => apt.doctorId === doctorId);
    
    return {
      doctor: schedule,
      appointments: doctorAppointments,
      workingHours: schedule.workingHours,
      totalSlots: generateTimeSlots(
        schedule.workingHours.start,
        schedule.workingHours.end,
        schedule.consultationDuration
      ).length,
      bookedSlots: doctorAppointments.length,
      availableSlots: generateTimeSlots(
        schedule.workingHours.start,
        schedule.workingHours.end,
        schedule.consultationDuration
      ).length - doctorAppointments.length
    };
  } catch (error) {
    console.error('Error getting doctor daily schedule:', error);
    throw new Error('Failed to get doctor daily schedule');
  }
};

// Default doctor schedules (fallback)
const getDefaultDoctorSchedules = (): DoctorSchedule[] => {
  return [
    {
      id: 'dr_sarah_ahmed',
      name: 'Dr. Sarah Ahmed',
      specialty: 'General Practice',
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      offDays: ['Friday', 'Saturday'],
      maxPatientsPerHour: 3,
      consultationDuration: 20
    },
    {
      id: 'dr_ahmed_omar',
      name: 'Dr. Ahmed Omar',
      specialty: 'Cardiology',
      workingHours: {
        start: '09:00',
        end: '16:00'
      },
      offDays: ['Friday', 'Saturday'],
      maxPatientsPerHour: 2,
      consultationDuration: 30
    },
    {
      id: 'dr_fatima_hassan',
      name: 'Dr. Fatima Hassan',
      specialty: 'Dermatology',
      workingHours: {
        start: '10:00',
        end: '18:00'
      },
      offDays: ['Friday', 'Saturday'],
      maxPatientsPerHour: 4,
      consultationDuration: 15
    },
    {
      id: 'dr_mohammed_ali',
      name: 'Dr. Mohammed Ali',
      specialty: 'Orthopedics',
      workingHours: {
        start: '08:30',
        end: '16:30'
      },
      offDays: ['Friday', 'Saturday'],
      maxPatientsPerHour: 2,
      consultationDuration: 25
    }
  ];
};

// Initialize default doctor schedules in Firebase (run once)
export const initializeDefaultSchedules = async (): Promise<void> => {
  try {
    const existingSchedules = await getDoctorSchedules();
    if (existingSchedules.length === 0) {
      const defaultSchedules = getDefaultDoctorSchedules();
      const schedulesRef = collection(db, SCHEDULES_COLLECTION);
      
      for (const schedule of defaultSchedules) {
        await addDoc(schedulesRef, schedule);
      }
      
      console.log('Default doctor schedules initialized');
    }
  } catch (error) {
    console.error('Error initializing default schedules:', error);
  }
};

// Future API functions to implement:
// - getDoctorSchedules(): Promise<DoctorSchedule[]>
// - getAppointments(doctorId?: number, date?: string): Promise<Appointment[]>
// - bookAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment>
// - updateAppointmentStatus(appointmentId: number, status: string): Promise<void>
// - getDoctorAvailability(doctorId: number, date: string): Promise<string[]>
// - cancelAppointment(appointmentId: number): Promise<void> 