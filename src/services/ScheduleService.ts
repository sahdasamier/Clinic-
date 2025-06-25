import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  getDocs,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../api/firebase';

const COLLECTION_NAME = 'doctor_schedules';
const schedulesCollection = collection(db, COLLECTION_NAME);

export interface DoctorSchedule {
  id: string; // doctorId
  clinicId: string;
  doctorId: string;
  doctorName: string;
  workingHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  offDays: string[]; // ['friday', 'saturday']
  consultationDuration: number; // minutes
  maxPatientsPerHour: number;
  
  // Weekly schedule - actual slots for each day
  weeklySchedule: {
    [date: string]: { // YYYY-MM-DD format
      isWorking: boolean;
      timeSlots: string[]; // ['09:00', '09:30', '10:00']
      notes?: string;
    };
  };
  
  // Recurring patterns (optional)
  recurringPatterns?: {
    [dayOfWeek: string]: { // 'monday', 'tuesday', etc.
      isWorking: boolean;
      timeSlots: string[];
    };
  };
  
  specialty?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface TimeSlot {
  time: string; // HH:MM format
  isAvailable: boolean;
  isReserved: boolean;
  appointmentId?: string;
  patientName?: string;
  notes?: string;
}

export const ScheduleService = {
  // Create or update doctor schedule
  async setDoctorSchedule(
    clinicId: string, 
    doctorId: string, 
    scheduleData: Omit<DoctorSchedule, 'id' | 'clinicId' | 'doctorId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<void> {
    const schedule: DoctorSchedule = {
      ...scheduleData,
      id: doctorId,
      clinicId,
      doctorId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(schedulesCollection, doctorId), schedule, { merge: true });
    console.log('✅ Doctor schedule saved:', doctorId);
  },

  // Update doctor schedule
  async updateDoctorSchedule(doctorId: string, updates: Partial<DoctorSchedule>): Promise<void> {
    const scheduleRef = doc(schedulesCollection, doctorId);
    await setDoc(scheduleRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('✅ Doctor schedule updated:', doctorId);
  },

  // Set weekly schedule for a doctor
  async setWeeklySchedule(
    clinicId: string,
    doctorId: string, 
    weeklySchedule: DoctorSchedule['weeklySchedule']
  ): Promise<void> {
    await this.updateDoctorSchedule(doctorId, { weeklySchedule });
    console.log('✅ Weekly schedule updated for doctor:', doctorId);
  },

  // Set specific day schedule
  async setDaySchedule(
    doctorId: string,
    date: string, // YYYY-MM-DD
    daySchedule: DoctorSchedule['weeklySchedule'][string]
  ): Promise<void> {
    // Get current schedule
    const currentSchedule = await this.getDoctorSchedule(doctorId);
    if (!currentSchedule) {
      throw new Error('Doctor schedule not found');
    }

    const updatedWeeklySchedule = {
      ...currentSchedule.weeklySchedule,
      [date]: daySchedule
    };

    await this.updateDoctorSchedule(doctorId, { 
      weeklySchedule: updatedWeeklySchedule 
    });
    console.log('✅ Day schedule updated:', doctorId, date);
  },

  // Add time slots to a specific date
  async addTimeSlotsToDate(
    doctorId: string,
    date: string, // YYYY-MM-DD
    timeSlots: string[] // ['14:30', '15:00']
  ): Promise<void> {
    const currentSchedule = await this.getDoctorSchedule(doctorId);
    if (!currentSchedule) {
      throw new Error('Doctor schedule not found');
    }

    const currentDaySchedule = currentSchedule.weeklySchedule[date] || {
      isWorking: true,
      timeSlots: [],
      notes: ''
    };

    // Merge and deduplicate time slots
    const mergedSlots = [...new Set([...currentDaySchedule.timeSlots, ...timeSlots])];
    mergedSlots.sort();

    const updatedWeeklySchedule = {
      ...currentSchedule.weeklySchedule,
      [date]: {
        ...currentDaySchedule,
        timeSlots: mergedSlots
      }
    };

    await this.updateDoctorSchedule(doctorId, { 
      weeklySchedule: updatedWeeklySchedule 
    });
    console.log('✅ Time slots added:', doctorId, date, timeSlots);
  },

  // Remove time slot from a specific date
  async removeTimeSlotFromDate(
    doctorId: string,
    date: string,
    timeSlot: string
  ): Promise<void> {
    const currentSchedule = await this.getDoctorSchedule(doctorId);
    if (!currentSchedule?.weeklySchedule[date]) {
      return; // No schedule for this date
    }

    const currentDaySchedule = currentSchedule.weeklySchedule[date];
    const updatedTimeSlots = currentDaySchedule.timeSlots.filter(slot => slot !== timeSlot);

    const updatedWeeklySchedule = {
      ...currentSchedule.weeklySchedule,
      [date]: {
        ...currentDaySchedule,
        timeSlots: updatedTimeSlots
      }
    };

    await this.updateDoctorSchedule(doctorId, { 
      weeklySchedule: updatedWeeklySchedule 
    });
    console.log('✅ Time slot removed:', doctorId, date, timeSlot);
  },

  // Get doctor schedule
  async getDoctorSchedule(doctorId: string): Promise<DoctorSchedule | null> {
    const q = query(schedulesCollection, where('doctorId', '==', doctorId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as DoctorSchedule;
  },

  // Listen to doctor schedule
  listenDoctorSchedule(doctorId: string, callback: (schedule: DoctorSchedule | null) => void): () => void {
    const q = query(schedulesCollection, where('doctorId', '==', doctorId));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const schedule = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as DoctorSchedule;
      
      callback(schedule);
    }, (error) => {
      console.error('❌ Error listening to doctor schedule:', error);
      callback(null);
    });
  },

  // Listen to all clinic schedules
  listenClinicSchedules(clinicId: string, callback: (schedules: DoctorSchedule[]) => void): () => void {
    const q = query(
      schedulesCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('doctorName', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DoctorSchedule[];
      
      console.log(`📅 Clinic schedules updated: ${schedules.length} doctors`);
      callback(schedules);
    }, (error) => {
      console.error('❌ Error listening to clinic schedules:', error);
      callback([]);
    });
  },

  // Get available time slots for a doctor on a specific date
  async getAvailableTimeSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const schedule = await this.getDoctorSchedule(doctorId);
    if (!schedule || !schedule.weeklySchedule[date]) {
      return [];
    }

    const daySchedule = schedule.weeklySchedule[date];
    if (!daySchedule.isWorking) {
      return [];
    }

    // Convert time slots to TimeSlot objects
    return daySchedule.timeSlots.map(time => ({
      time,
      isAvailable: true,
      isReserved: false,
    }));
  },

  // Generate time slots based on working hours and duration
  generateTimeSlots(
    startTime: string, // "09:00"
    endTime: string,   // "17:00"
    duration: number   // 30 minutes
  ): string[] {
    const slots: string[] = [];
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    for (let time = startMinutes; time < endMinutes; time += duration) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
    }
    
    return slots;
  },

  // Create default schedule for a doctor
  async createDefaultSchedule(
    clinicId: string,
    doctorId: string,
    doctorName: string,
    specialty?: string
  ): Promise<void> {
    const defaultSchedule: Omit<DoctorSchedule, 'id' | 'clinicId' | 'doctorId' | 'createdAt' | 'updatedAt' | 'isActive'> = {
      doctorName,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      offDays: ['friday'],
      consultationDuration: 30,
      maxPatientsPerHour: 2,
      weeklySchedule: {},
      specialty,
    };

    await this.setDoctorSchedule(clinicId, doctorId, defaultSchedule);
    console.log('✅ Default schedule created for doctor:', doctorId);
  },

  // Apply recurring pattern to a date range
  async applyRecurringPattern(
    doctorId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string,   // YYYY-MM-DD
    pattern: DoctorSchedule['recurringPatterns']
  ): Promise<void> {
    if (!pattern) return;

    const schedule = await this.getDoctorSchedule(doctorId);
    if (!schedule) {
      throw new Error('Doctor schedule not found');
    }

    const updatedWeeklySchedule = { ...schedule.weeklySchedule };

    // Generate dates between start and end
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      if (pattern[dayOfWeek]) {
        updatedWeeklySchedule[dateStr] = {
          isWorking: pattern[dayOfWeek].isWorking,
          timeSlots: [...pattern[dayOfWeek].timeSlots],
          notes: `Applied from ${dayOfWeek} pattern`
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    await this.updateDoctorSchedule(doctorId, { 
      weeklySchedule: updatedWeeklySchedule 
    });
    console.log('✅ Recurring pattern applied:', doctorId, startDate, endDate);
  },

  // Delete doctor schedule
  async deleteDoctorSchedule(doctorId: string): Promise<void> {
    await this.updateDoctorSchedule(doctorId, { isActive: false });
    console.log('✅ Doctor schedule soft deleted:', doctorId);
  },

  // Hard delete doctor schedule
  async hardDeleteDoctorSchedule(doctorId: string): Promise<void> {
    await deleteDoc(doc(schedulesCollection, doctorId));
    console.log('✅ Doctor schedule permanently deleted:', doctorId);
  },

  // Get schedule statistics for a clinic
  async getScheduleStats(clinicId: string): Promise<{
    totalDoctors: number;
    activeDoctors: number;
    doctorsWorkingToday: number;
    totalSlotsToday: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      schedulesCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const schedules = snapshot.docs.map(doc => doc.data()) as DoctorSchedule[];

    const doctorsWorkingToday = schedules.filter(schedule => 
      schedule.weeklySchedule[today]?.isWorking
    ).length;

    const totalSlotsToday = schedules.reduce((total, schedule) => {
      const todaySchedule = schedule.weeklySchedule[today];
      return total + (todaySchedule?.timeSlots?.length || 0);
    }, 0);

    return {
      totalDoctors: schedules.length,
      activeDoctors: schedules.length, // All returned schedules are active
      doctorsWorkingToday,
      totalSlotsToday,
    };
  }
};

export default ScheduleService; 