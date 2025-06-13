// TODO: Implement doctor scheduling API functions (e.g., get doctor schedules, book appointments, update availability)

export interface DoctorSchedule {
  id: number;
  name: string;
  specialty: string;
  workingHours: {
    start: string;
    end: string;
  };
  offDays: string[];
  maxPatientsPerHour: number;
  consultationDuration: number;
}

export interface Appointment {
  id: number;
  doctorId: number;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

// Future API functions to implement:
// - getDoctorSchedules(): Promise<DoctorSchedule[]>
// - getAppointments(doctorId?: number, date?: string): Promise<Appointment[]>
// - bookAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment>
// - updateAppointmentStatus(appointmentId: number, status: string): Promise<void>
// - getDoctorAvailability(doctorId: number, date: string): Promise<string[]>
// - cancelAppointment(appointmentId: number): Promise<void> 