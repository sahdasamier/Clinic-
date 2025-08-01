import { useState, useEffect, useCallback } from 'react';
import { AppointmentConflictService } from '../services/AppointmentConflictService';

interface UseAvailableTimeSlotsProps {
  doctorId?: string;
  date?: string;
  duration?: number;
  workingHours?: { start: string; end: string };
}

interface UseAvailableTimeSlotsReturn {
  availableSlots: string[];
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = useCallback(async () => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const slots = await AppointmentConflictService.getAvailableTimeSlots(
        doctorId,
        date,
        duration,
        workingHours
      );
      
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch available time slots');
      setAvailableSlots([]);
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
      fetchAvailableSlots();
    }
  }, [doctorId, date, fetchAvailableSlots]);

  // Separate useEffect with proper dependencies to avoid infinite loop
  useEffect(() => {
    let isCancelled = false;
    
    const loadSlots = async () => {
      if (!doctorId || !date) {
        setAvailableSlots([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const slots = await AppointmentConflictService.getAvailableTimeSlots(
          doctorId,
          date,
          duration,
          workingHours
        );
        
        if (!isCancelled) {
          setAvailableSlots(slots);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching available time slots:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch available time slots');
          setAvailableSlots([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadSlots();

    return () => {
      isCancelled = true;
    };
  }, [doctorId, date, duration, JSON.stringify(workingHours)]);

  return {
    availableSlots,
    loading,
    error,
    refreshSlots,
    checkSlotAvailability
  };
};

export default useAvailableTimeSlots; 