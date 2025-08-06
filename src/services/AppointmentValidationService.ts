import { AppointmentConflictService } from './AppointmentConflictService';
import { AppointmentService } from './AppointmentService';

export interface AppointmentValidationOptions {
  doctorId: string;
  date: string;
  timeSlot: string;
  duration: number;
  patientName: string;
  appointmentType: string;
  excludeAppointmentId?: string; // For rescheduling
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isReservedSlot?: boolean;
  conflictDetails?: {
    isReservedSlot?: boolean;
    conflictingAppointment?: any;
    suggestedAlternatives?: string[];
  };
}

export interface TimeSlotReservation {
  doctorId: string;
  date: string;
  timeSlot: string;
  duration: number;
  reservationId: string;
  expiresAt: Date;
}

export class AppointmentValidationService {
  private static activeReservations = new Map<string, TimeSlotReservation>();
  private static readonly RESERVATION_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Comprehensive appointment validation with conflict detection
   */
  static async validateAppointmentDetails(options: AppointmentValidationOptions): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let conflictDetails: any = {};

    console.log('🔍 VALIDATING APPOINTMENT:', {
      doctor: options.doctorId,
      date: options.date,
      time: options.timeSlot,
      duration: options.duration,
      patient: options.patientName,
      type: options.appointmentType
    });

    try {
      // 1. Basic field validation
      if (!options.doctorId) errors.push('Doctor is required');
      if (!options.date) errors.push('Date is required');
      if (!options.timeSlot) errors.push('Time slot is required');
      if (!options.patientName?.trim()) errors.push('Patient name is required');
      if (!options.appointmentType) errors.push('Appointment type is required');
      if (options.duration < 15) warnings.push('Duration is very short (less than 15 minutes)');
      if (options.duration > 120) warnings.push('Duration is very long (more than 2 hours)');

      // 2. Date validation
      const appointmentDate = new Date(options.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        errors.push('Cannot schedule appointments in the past');
      }

      // Check if appointment is too far in future (1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (appointmentDate > oneYearFromNow) {
        warnings.push('Appointment is scheduled more than a year in advance');
      }

      // 3. Time slot format validation
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(options.timeSlot)) {
        errors.push('Invalid time format. Use HH:MM format (24-hour)');
      }

      // 4. Business hours validation
      const [hours, minutes] = options.timeSlot.split(':').map(Number);
      const appointmentMinutes = hours * 60 + minutes;
      const startTime = 9 * 60; // 9:00 AM
      const endTime = 17 * 60;  // 5:00 PM

      if (appointmentMinutes < startTime || appointmentMinutes > endTime) {
        warnings.push('Appointment is outside standard business hours (9 AM - 5 PM)');
      }

      // 5. Weekend validation
      const dayOfWeek = appointmentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        warnings.push('Appointment is scheduled on a weekend');
      }

      // 6. Advanced conflict detection with reserved slot handling
      if (!errors.length) {
        const conflictCheck = await AppointmentConflictService.checkTimeSlotAvailability({
          doctorId: options.doctorId,
          date: options.date,
          timeSlot: options.timeSlot,
          duration: options.duration,
          excludeAppointmentId: options.excludeAppointmentId
        });

        if (conflictCheck.hasConflict) {
          // ✅ ENHANCED: Handle reserved slots differently - don't show error, just mark as unavailable
          if (conflictCheck.conflictReason === 'doctor_has_appointment_at_time') {
            // This is a reserved slot - don't add error, just silently mark as unavailable
            console.log('⏰ RESERVED SLOT DETECTED:', {
              timeSlot: options.timeSlot,
              conflictingAppointment: conflictCheck.conflictingAppointment?.patient || 'Unknown Patient',
              appointmentType: conflictCheck.conflictingAppointment?.type || 'Unknown'
            });
            
            conflictDetails = {
              isReservedSlot: true,
              conflictingAppointment: conflictCheck.conflictingAppointment,
              suggestedAlternatives: await this.getSuggestedAlternatives(options)
            };
          } else {
            // Other types of conflicts should still show errors
            errors.push(`Time slot conflict: ${conflictCheck.conflictReason}`);
            conflictDetails = {
              conflictingAppointment: conflictCheck.conflictingAppointment,
              suggestedAlternatives: await this.getSuggestedAlternatives(options)
            };
          }
        }

        // 7. Check for reservation conflicts
        const reservationConflict = this.checkReservationConflict(options);
        if (reservationConflict) {
          errors.push('Time slot is temporarily reserved by another user');
          conflictDetails.reservationExpiry = reservationConflict.expiresAt;
        }

        // 8. Check for patient double-booking
        const patientConflict = await this.checkPatientDoubleBooking(options);
        if (patientConflict) {
          warnings.push(`Patient ${options.patientName} already has an appointment on ${options.date}`);
        }

        // 9. Check doctor's workload
        const workloadCheck = await this.checkDoctorWorkload(options);
        if (workloadCheck.isOverloaded) {
          warnings.push(`Doctor has ${workloadCheck.appointmentCount} appointments on this day`);
        }
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        isReservedSlot: conflictDetails.isReservedSlot || false,
        conflictDetails: Object.keys(conflictDetails).length > 0 ? conflictDetails : undefined
      };

      console.log('✅ VALIDATION RESULT:', result);
      return result;

    } catch (error) {
      console.error('❌ Error validating appointment:', error);
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: []
      };
    }
  }

  /**
   * Reserve a time slot temporarily to prevent conflicts during booking
   */
  static reserveTimeSlot(options: AppointmentValidationOptions): string {
    const reservationId = `${options.doctorId}-${options.date}-${options.timeSlot}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + this.RESERVATION_DURATION);

    const reservation: TimeSlotReservation = {
      doctorId: options.doctorId,
      date: options.date,
      timeSlot: options.timeSlot,
      duration: options.duration,
      reservationId,
      expiresAt
    };

    this.activeReservations.set(reservationId, reservation);

    // Auto-cleanup expired reservation
    setTimeout(() => {
      this.activeReservations.delete(reservationId);
    }, this.RESERVATION_DURATION);

    console.log(`🔒 RESERVED time slot: ${options.timeSlot} on ${options.date} for doctor ${options.doctorId} (expires in 5 minutes)`);
    return reservationId;
  }

  /**
   * Release a time slot reservation
   */
  static releaseReservation(reservationId: string): void {
    const reservation = this.activeReservations.get(reservationId);
    if (reservation) {
      this.activeReservations.delete(reservationId);
      console.log(`🔓 RELEASED time slot reservation: ${reservationId}`);
    }
  }

  /**
   * Check if a time slot has an active reservation
   */
  private static checkReservationConflict(options: AppointmentValidationOptions): TimeSlotReservation | null {
    const now = new Date();
    
    for (const [id, reservation] of this.activeReservations.entries()) {
      // Clean up expired reservations
      if (reservation.expiresAt < now) {
        this.activeReservations.delete(id);
        continue;
      }

      // Check for conflict
      if (reservation.doctorId === options.doctorId &&
          reservation.date === options.date &&
          reservation.timeSlot === options.timeSlot) {
        return reservation;
      }
    }

    return null;
  }

  /**
   * Get suggested alternative time slots
   */
  private static async getSuggestedAlternatives(options: AppointmentValidationOptions): Promise<string[]> {
    try {
      const availableSlots = await AppointmentConflictService.getAvailableTimeSlots(
        options.doctorId,
        options.date,
        options.duration,
        { start: '09:00', end: '17:00' }
      );

      // Return up to 3 alternatives closest to requested time
      const requestedMinutes = this.timeToMinutes(options.timeSlot);
      
      return availableSlots
        .map(slot => ({
          slot,
          diff: Math.abs(this.timeToMinutes(slot) - requestedMinutes)
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 3)
        .map(item => item.slot);
    } catch (error) {
      console.error('Error getting suggested alternatives:', error);
      return [];
    }
  }

  /**
   * Check for patient double-booking on the same day
   */
  private static async checkPatientDoubleBooking(options: AppointmentValidationOptions): Promise<boolean> {
    try {
      // This would need to be implemented based on your patient data structure
      // For now, return false (no conflict)
      return false;
    } catch (error) {
      console.error('Error checking patient double-booking:', error);
      return false;
    }
  }

  /**
   * Check doctor's workload for the day
   */
  private static async checkDoctorWorkload(options: AppointmentValidationOptions): Promise<{isOverloaded: boolean; appointmentCount: number}> {
    try {
      const conflicts = await AppointmentConflictService.getDoctorConflicts(options.doctorId, options.date);
      const appointmentCount = conflicts.length;
      
      return {
        isOverloaded: appointmentCount >= 8, // More than 8 appointments per day
        appointmentCount
      };
    } catch (error) {
      console.error('Error checking doctor workload:', error);
      return { isOverloaded: false, appointmentCount: 0 };
    }
  }

  /**
   * Convert time string to minutes since midnight
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get all active reservations (for debugging)
   */
  static getActiveReservations(): TimeSlotReservation[] {
    const now = new Date();
    
    // Clean up expired reservations
    for (const [id, reservation] of this.activeReservations.entries()) {
      if (reservation.expiresAt < now) {
        this.activeReservations.delete(id);
      }
    }
    
    return Array.from(this.activeReservations.values());
  }

  /**
   * Quick validation for time slot availability (lighter version)
   */
  static async quickValidateTimeSlot(doctorId: string, date: string, timeSlot: string, duration: number = 30): Promise<{available: boolean; reason?: string}> {
    try {
      const conflict = await AppointmentConflictService.checkTimeSlotAvailability({
        doctorId,
        date,
        timeSlot,
        duration
      });

      if (conflict.hasConflict) {
        return { available: false, reason: conflict.conflictReason };
      }

      const reservationConflict = this.checkReservationConflict({ doctorId, date, timeSlot, duration, patientName: '', appointmentType: '' });
      if (reservationConflict) {
        return { available: false, reason: 'Temporarily reserved by another user' };
      }

      return { available: true };
    } catch (error) {
      console.error('Error in quick validation:', error);
      return { available: false, reason: 'Validation error' };
    }
  }
}

// Expose debugging functions for console access
if (typeof window !== 'undefined') {
  (window as any).debugAppointmentValidation = {
    getActiveReservations: () => AppointmentValidationService.getActiveReservations(),
    quickValidate: (doctorId: string, date: string, timeSlot: string, duration?: number) => 
      AppointmentValidationService.quickValidateTimeSlot(doctorId, date, timeSlot, duration),
    validateFull: (options: AppointmentValidationOptions) => 
      AppointmentValidationService.validateAppointmentDetails(options)
  };
} 