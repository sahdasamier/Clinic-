import { useState, useEffect, useCallback } from 'react';
import { AppointmentConflictService } from '../services/AppointmentConflictService';

interface UseAvailableTimeSlotsProps {
  doctorId?: string;
  date?: string;
  duration?: number;
  workingHours?: { start: string; end: string };
}

interface SlotInfo {
  timeSlot: string;
  isAvailable: boolean;
  isReserved: boolean;
  appointmentDetails?: {
    id: string;
    patientName: string;
    appointmentType: string;
    status: string;
  };
}

interface UseAvailableTimeSlotsReturn {
  availableSlots: string[];
  allSlots: SlotInfo[];
  totalSlots: number;
  bookedSlots: number;
  loading: boolean;
  error: string | null;
  refreshSlots: () => void;
  checkSlotAvailability: (timeSlot: string) => Promise<boolean>;
}

export const useAvailableTimeSlots = ({
  doctorId,
  date,
  duration = 30,
  workingHours = { start: '09:00', end: '17:00' }
}: UseAvailableTimeSlotsProps): UseAvailableTimeSlotsReturn => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<SlotInfo[]>([]);
  const [totalSlots, setTotalSlots] = useState(0);
  const [bookedSlots, setBookedSlots] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ENHANCED: Fetch both available and booked slots with appointment details
  const fetchAllSlotsWithDetails = useCallback(async () => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      setAllSlots([]);
      setTotalSlots(0);
      setBookedSlots(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get available slots
      const availableSlotsList = await AppointmentConflictService.getAvailableTimeSlots(
        doctorId,
        date,
        duration,
        workingHours
      );

      // Generate all possible time slots for the day
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = workingHours.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      const allPossibleSlots: string[] = [];
      
      for (let time = startTime; time < endTime; time += duration) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allPossibleSlots.push(timeSlot);
      }

      // Get existing appointments for this doctor and date
      const existingAppointments = await AppointmentConflictService.getDoctorConflicts(doctorId, date);
      


      // Create slot info array
      const allSlotsInfo: SlotInfo[] = allPossibleSlots.map(timeSlot => {
        const isAvailable = availableSlotsList.includes(timeSlot);
        
        // Look for appointment that conflicts with this slot
        const conflictingAppointment = existingAppointments.find(apt => {
          // Handle different possible field names for time
          const aptTimeSlot = apt.timeSlot || apt.time || apt.appointmentTime || apt.appointmentTimeSlot;
          if (!aptTimeSlot) {
            return false;
          }
          
          let aptHour, aptMinute;
          try {
            [aptHour, aptMinute] = aptTimeSlot.split(':').map(Number);
          } catch (error) {
            return false;
          }
          
          if (isNaN(aptHour) || isNaN(aptMinute)) {
            return false;
          }
          
          const aptTime = aptHour * 60 + aptMinute;
          const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
          const slotTime = slotHour * 60 + slotMinute;
          const aptDuration = apt.duration || 30; // Default duration if not specified
          
          // Check if the appointment overlaps with this time slot
          const overlaps = (aptTime <= slotTime && (aptTime + aptDuration) > slotTime) ||
                          (slotTime <= aptTime && (slotTime + duration) > aptTime);
          

          
          return overlaps;
        });

        // Mark slot as unavailable if there's any conflict
        const hasConflict = !!conflictingAppointment;
        const actuallyAvailable = isAvailable && !hasConflict;

        return {
          timeSlot,
          isAvailable: actuallyAvailable,
          isReserved: hasConflict,
          appointmentDetails: conflictingAppointment ? {
            id: conflictingAppointment.id,
            patientName: conflictingAppointment.patient || conflictingAppointment.patientName || conflictingAppointment.name || 'Unknown Patient',
            appointmentType: conflictingAppointment.type || conflictingAppointment.appointmentType || conflictingAppointment.appointmentType || 'consultation',
            status: conflictingAppointment.status || 'scheduled'
          } : undefined
        };
      });

      // Use conflict-aware availability for accurate counts
      const actuallyAvailableSlots = allSlotsInfo.filter(slot => slot.isAvailable).map(slot => slot.timeSlot);
      
      setAvailableSlots(actuallyAvailableSlots);
      setAllSlots(allSlotsInfo);
      setTotalSlots(allPossibleSlots.length);
      setBookedSlots(allSlotsInfo.filter(slot => !slot.isAvailable).length);



    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch available time slots');
      setAvailableSlots([]);
      setAllSlots([]);
      setTotalSlots(0);
      setBookedSlots(0);
    } finally {
      setLoading(false);
    }
  }, [doctorId, date, duration, JSON.stringify(workingHours)]); // Use JSON.stringify for object comparison

  const checkSlotAvailability = useCallback(async (timeSlot: string): Promise<boolean> => {
    if (!doctorId || !date) {
      return false;
    }

    try {
      const conflict = await AppointmentConflictService.checkTimeSlotAvailability({
        doctorId,
        date,
        timeSlot,
        duration
      });
      
      return !conflict.hasConflict;
    } catch (err) {
      console.error('Error checking slot availability:', err);
      return false;
    }
  }, [doctorId, date, duration]);

  const refreshSlots = useCallback(() => {
    if (doctorId && date) {
      fetchAllSlotsWithDetails();
    }
  }, [doctorId, date, fetchAllSlotsWithDetails]);

  // Separate useEffect with proper dependencies to avoid infinite loop
  useEffect(() => {
    let isCancelled = false;
    
    const loadSlots = async () => {
      if (!doctorId || !date) {
        setAvailableSlots([]);
        setAllSlots([]);
        setTotalSlots(0);
        setBookedSlots(0);
        setLoading(false);
        return;
      }

      if (!isCancelled) {
        await fetchAllSlotsWithDetails();
      }
    };

    loadSlots();

    return () => {
      isCancelled = true;
    };
  }, [doctorId, date, duration, JSON.stringify(workingHours)]);



  return {
    availableSlots,
    allSlots,
    totalSlots,
    bookedSlots,
    loading,
    error,
    refreshSlots,
    checkSlotAvailability
  };
};

export default useAvailableTimeSlots; 