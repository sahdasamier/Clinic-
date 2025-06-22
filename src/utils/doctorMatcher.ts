import { getDoctorsByClinic } from '../api/doctorPatients';

/**
 * Match doctor name from scheduling system to Firebase user ID
 */
export const matchDoctorNameToUserId = async (
  doctorName: string, 
  clinicId: string
): Promise<string | null> => {
  try {
    // Get all doctors from Firebase for this clinic
    const firebaseDoctors = await getDoctorsByClinic(clinicId);
    
    // Normalize the input doctor name
    const normalizedInputName = normalizeName(doctorName);
    
    // Try to find matching doctor
    for (const doctor of firebaseDoctors) {
      const fullName = `${doctor.firstName} ${doctor.lastName}`;
      const normalizedFullName = normalizeName(fullName);
      
      // Check various name formats
      if (
        normalizedFullName === normalizedInputName ||                    // "Ahmed Muhmude"
        normalizedFullName === normalizeName(`Dr. ${fullName}`) ||       // "Dr. Ahmed Muhmude"  
        normalizeName(doctor.firstName) === normalizedInputName ||       // "Ahmed"
        normalizeName(doctor.lastName) === normalizedInputName ||        // "Muhmude"
        normalizedInputName.includes(normalizeName(doctor.firstName)) || // Contains first name
        normalizedInputName.includes(normalizeName(doctor.lastName))     // Contains last name
      ) {
        console.log(`✅ Matched doctor "${doctorName}" to Firebase user:`, doctor.id);
        return doctor.id;
      }
    }
    
    console.warn(`⚠️ Could not match doctor "${doctorName}" to any Firebase user`);
    return null;
  } catch (error) {
    console.error('❌ Error matching doctor name to user ID:', error);
    return null;
  }
};

/**
 * Normalize name for comparison (remove spaces, convert to lowercase, remove "Dr.")
 */
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/^dr\.?\s*/i, '')  // Remove "Dr." prefix
    .replace(/\s+/g, '')        // Remove all spaces
    .trim();
};

/**
 * Get doctor's full name from Firebase user ID
 */
export const getDoctorNameFromUserId = async (
  doctorId: string,
  clinicId: string
): Promise<string | null> => {
  try {
    const firebaseDoctors = await getDoctorsByClinic(clinicId);
    const doctor = firebaseDoctors.find(d => d.id === doctorId);
    
    if (doctor) {
      return `Dr. ${doctor.firstName} ${doctor.lastName}`;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting doctor name from user ID:', error);
    return null;
  }
};

/**
 * Auto-link appointment to doctor's Firebase ID
 */
export const enhanceAppointmentWithDoctorId = async (
  appointment: any,
  clinicId: string
): Promise<any> => {
  try {
    // Try to match doctor name to Firebase user ID
    const doctorId = await matchDoctorNameToUserId(appointment.doctor, clinicId);
    
    if (doctorId) {
      console.log(`🔗 Enhanced appointment with doctorId: ${doctorId}`);
      return {
        ...appointment,
        doctorId: doctorId,  // 🔑 Add Firebase doctor ID
        doctorName: appointment.doctor  // Keep original name for display
      };
    }
    
    // If no match found, return original appointment
    console.warn(`⚠️ Could not enhance appointment - doctor "${appointment.doctor}" not found in Firebase`);
    return appointment;
  } catch (error) {
    console.error('❌ Error enhancing appointment with doctor ID:', error);
    return appointment;
  }
}; 