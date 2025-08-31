import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '@lib/firebase/legacy-compat';

interface AppointmentConflict {
  hasConflict: boolean;
  conflictingAppointment?: {
    id: string;
    patient: string;
    time: string;
    timeSlot: string;
    duration: number;
  };
  message: string;
}

interface TimeSlotInfo {
  doctorId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: string; // HH:MM format
  duration: number; // minutes
  excludeAppointmentId?: string; // For rescheduling
}

export class AppointmentConflictService {
  private static COLLECTION_NAME = 'appointments';

  /**
   * Check if a specific time slot is available for a doctor
   */
  static async checkTimeSlotAvailability(slotInfo: TimeSlotInfo): Promise<AppointmentConflict> {
    try {
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase not ready - please wait for initialization');
      }

      const db = getOptimizedFirestore();
      const appointmentsRef = collection(db, this.COLLECTION_NAME);
      
      // Query for appointments on the same date and doctor
      let appointmentQuery = query(
        appointmentsRef,
        where('doctorId', '==', slotInfo.doctorId),
        where('date', '==', slotInfo.date),
        where('isActive', '==', true),
        where('status', 'in', ['pending', 'confirmed', 'scheduled']) // ✅ FIXED: Include 'scheduled' status
      );

      const querySnapshot = await getDocs(appointmentQuery);
      
      // Convert new appointment time to minutes for comparison
      const [newHour, newMinute] = slotInfo.timeSlot.split(':').map(Number);
      const newStartMinutes = newHour * 60 + newMinute;
      const newEndMinutes = newStartMinutes + slotInfo.duration;

      // Check for conflicts with existing appointments
      for (const doc of querySnapshot.docs) {
        const appointment = { id: doc.id, ...doc.data() };
        
        // Skip if this is the same appointment (for rescheduling)
        if (slotInfo.excludeAppointmentId && appointment.id === slotInfo.excludeAppointmentId) {
          continue;
        }

        // Parse existing appointment time
        const existingTimeSlot = appointment.timeSlot || appointment.time;
        if (!existingTimeSlot) continue;

        const [existingHour, existingMinute] = existingTimeSlot.split(':').map(Number);
        const existingStartMinutes = existingHour * 60 + existingMinute;
        const existingEndMinutes = existingStartMinutes + (appointment.duration || 30);

        // Check for time overlap
        const hasOverlap = (
          newStartMinutes < existingEndMinutes && 
          newEndMinutes > existingStartMinutes
        );

        if (hasOverlap) {
          return {
            hasConflict: true,
            conflictingAppointment: {
              id: appointment.id,
              patient: appointment.patient || 'Unknown Patient',
              time: appointment.time,
              timeSlot: existingTimeSlot,
              duration: appointment.duration || 30
            },
            message: `Time slot ${slotInfo.timeSlot} conflicts with existing appointment for ${appointment.patient} at ${existingTimeSlot}`
          };
        }
      }

      return {
        hasConflict: false,
        message: `Time slot ${slotInfo.timeSlot} is available`
      };

    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return {
        hasConflict: true,
        message: 'Unable to verify time slot availability. Please try again.'
      };
    }
  }

  /**
   * Get all conflicting appointments for a doctor on a specific date
   */
  static async getDoctorConflicts(doctorId: string, date: string): Promise<any[]> {
    try {
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase not ready');
      }

      const db = getOptimizedFirestore();
      const appointmentsRef = collection(db, this.COLLECTION_NAME);
      
      const appointmentQuery = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        where('date', '==', date),
        where('isActive', '==', true),
        where('status', 'in', ['pending', 'confirmed', 'scheduled']) // ✅ FIXED: Include 'scheduled' status
      );

      const querySnapshot = await getDocs(appointmentQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
      console.error('Error getting doctor conflicts:', error);
      return [];
    }
  }

  /**
   * Validate appointment data before creation/update
   */
  static async validateAppointment(appointmentData: {
    doctorId: string;
    date: string;
    timeSlot: string;
    duration: number;
    appointmentId?: string; // For updates
  }): Promise<{ isValid: boolean; error?: string }> {
    
    // Basic validation
    if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.timeSlot) {
      return {
        isValid: false,
        error: 'Missing required appointment information (doctor, date, or time)'
      };
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentData.date)) {
      return {
        isValid: false,
        error: 'Invalid date format. Please use YYYY-MM-DD format'
      };
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(appointmentData.timeSlot)) {
      return {
        isValid: false,
        error: 'Invalid time format. Please use HH:MM format'
      };
    }

    // Check for past dates
    const appointmentDate = new Date(appointmentData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return {
        isValid: false,
        error: 'Cannot schedule appointments in the past'
      };
    }

    // Check for conflicts
    const conflictCheck = await this.checkTimeSlotAvailability({
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
      duration: appointmentData.duration,
      excludeAppointmentId: appointmentData.appointmentId
    });

    if (conflictCheck.hasConflict) {
      return {
        isValid: false,
        error: conflictCheck.message
      };
    }

    return { isValid: true };
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  static async getAvailableTimeSlots(
    doctorId: string, 
    date: string, 
    duration: number = 30,
    workingHours: { start: string; end: string } = { start: '09:00', end: '17:00' }
  ): Promise<string[]> {
    try {
      // Get existing appointments
      const existingAppointments = await this.getDoctorConflicts(doctorId, date);
      
      // Generate all possible time slots
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = workingHours.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      const allSlots: string[] = [];
      
      for (let time = startTime; time < endTime; time += duration) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(timeSlot);
      }

      // Filter out conflicting slots
      const availableSlots = [];
      
      for (const slot of allSlots) {
        const conflictCheck = await this.checkTimeSlotAvailability({
          doctorId,
          date,
          timeSlot: slot,
          duration
        });
        
        if (!conflictCheck.hasConflict) {
          availableSlots.push(slot);
        }
      }

      return availableSlots;

    } catch (error) {
      console.error('Error getting available time slots:', error);
      return [];
    }
  }

  /**
   * Reserve a time slot (mark as unavailable)
   */
  static async reserveTimeSlot(slotInfo: TimeSlotInfo): Promise<{ success: boolean; message: string }> {
    try {
      // First check if still available
      const conflictCheck = await this.checkTimeSlotAvailability(slotInfo);
      
      if (conflictCheck.hasConflict) {
        return {
          success: false,
          message: conflictCheck.message
        };
      }

      // The actual reservation will happen when the appointment is created
      // This method serves as a final check before creation
      return {
        success: true,
        message: `Time slot ${slotInfo.timeSlot} reserved successfully`
      };

    } catch (error) {
      console.error('Error reserving time slot:', error);
      return {
        success: false,
        message: 'Failed to reserve time slot'
      };
    }
  }
}

export default AppointmentConflictService; 