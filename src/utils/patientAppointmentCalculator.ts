// ✅ FIREBASE-BASED PATIENT APPOINTMENT CALCULATOR
// Replaces legacy localStorage-based sync with real-time Firebase data

interface PatientAppointmentData {
  todayAppointment: string;
  nextAppointment: string;
  lastVisit: string;
  allCompletedVisits: Array<{
    date: string;
    formattedDate: string;
    time: string;
    type: string;
    doctor: string;
  }>;
  appointmentCount: number;
  completedCount: number;
  pendingCount: number;
  appointmentData: {
    completed: any[];
    notCompleted: any[];
    totalAppointments: number;
  };
}

/**
 * Format date for display (e.g., "Dec 15, 2023")
 */
const formatDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculate appointment-related fields for a patient based on Firebase appointment data
 */
export const calculatePatientAppointmentFields = (
  patientName: string, 
  patientId: string, 
  appointments: any[]
): PatientAppointmentData => {
  // Filter appointments for this patient
  const patientAppointments = appointments.filter(apt => 
    (apt.patient === patientName && apt.isActive !== false) || 
    (apt.patientId === patientId && apt.isActive !== false)
  );

  // Get today's date
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');

  console.log(`🔍 Calculating appointment fields for ${patientName}:`, {
    patientId,
    totalAppointments: patientAppointments.length,
    todayString,
    appointmentDates: patientAppointments.map(apt => apt.date)
  });

  // Separate completed and not completed appointments
  const completedAppointments = patientAppointments.filter(apt => 
    apt.status === 'completed' || apt.completed === true
  );
  
  const notCompletedAppointments = patientAppointments.filter(apt => 
    apt.status !== 'completed' && apt.completed !== true
  );

  // Calculate today's appointment
  const todayAppointments = patientAppointments
    .filter(apt => {
      const appointmentDate = normalizeDate(apt.date);
      const isToday = appointmentDate === todayString;
      const isNotCompleted = apt.status !== 'completed' && apt.completed !== true;
      return isToday && isNotCompleted;
    })
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const todayAppointment = todayAppointments.length > 0 
    ? `Today ${todayAppointments[0].time || 'Time TBD'}` 
    : '';

  // Calculate next appointment (future appointments only)
  const futureAppointments = patientAppointments
    .filter(apt => {
      const appointmentDate = normalizeDate(apt.date);
      const isFuture = new Date(appointmentDate) > new Date(todayString);
      const isNotCompleted = apt.status !== 'completed' && apt.completed !== true;
      return isFuture && isNotCompleted;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextAppointment = futureAppointments.length > 0 
    ? `${futureAppointments[0].date} ${futureAppointments[0].time || ''}`.trim()
    : '';

  // ✅ ENHANCED: Calculate all completed visits with detailed information
  const sortedCompletedAppointments = completedAppointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const allCompletedVisits = sortedCompletedAppointments.map(apt => ({
    date: apt.date,
    formattedDate: formatDateForDisplay(apt.date),
    time: apt.time || '',
    type: apt.type || 'Consultation',
    doctor: apt.doctor || 'Unknown Doctor'
  }));

  // Calculate last visit (most recent completed appointment)
  const lastVisit = allCompletedVisits.length > 0 
    ? allCompletedVisits[0].formattedDate
    : '';

  const result: PatientAppointmentData = {
    todayAppointment,
    nextAppointment,
    lastVisit,
    allCompletedVisits,
    appointmentCount: patientAppointments.length,
    completedCount: completedAppointments.length,
    pendingCount: notCompletedAppointments.length,
    appointmentData: {
      completed: completedAppointments,
      notCompleted: notCompletedAppointments,
      totalAppointments: patientAppointments.length
    }
  };

  console.log(`✅ Calculated appointment fields for ${patientName}:`, {
    ...result,
    lastVisitDetails: allCompletedVisits[0] || 'No completed visits'
  });
  return result;
};

/**
 * Normalize date string to YYYY-MM-DD format
 */
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Convert other formats to YYYY-MM-DD
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date format:', dateStr);
    return dateStr;
  }
  
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
};

/**
 * Calculate appointment fields for multiple patients
 */
export const calculateAllPatientsAppointmentFields = (
  patients: any[], 
  appointments: any[]
): any[] => {
  return patients.map(patient => {
    const appointmentFields = calculatePatientAppointmentFields(
      patient.name, 
      patient.id, 
      appointments
    );
    
    return {
      ...patient,
      ...appointmentFields
    };
  });
}; 