import { loadAppointmentsFromStorage, saveAppointmentsToStorage } from '../features/appointments/AppointmentListPage';
import { loadPatientsFromStorage, savePatientsToStorage } from '../features/patients/PatientListPage';

// Interface for organized appointment data
export interface OrganizedAppointmentData {
  completed: any[];
  notCompleted: any[];
  patientSummary: { [patientName: string]: { completed: any[], notCompleted: any[], totalAppointments: number } };
}

// Interface for patient with appointment data
export interface PatientWithAppointments {
  id: number;
  name: string;
  appointmentData: {
    completed: any[];
    notCompleted: any[];
    totalAppointments: number;
    lastCompletedDate?: string;
    nextPendingDate?: string;
  };
  // ... other patient properties
  [key: string]: any;
}

/**
 * Organize appointments by completion status
 */
export const organizeAppointmentsByCompletion = (): OrganizedAppointmentData => {
  const appointments = loadAppointmentsFromStorage();
  
  const completed = appointments.filter(apt => 
    apt.status === 'completed' || apt.completed === true
  );
  
  const notCompleted = appointments.filter(apt => 
    apt.status !== 'completed' && apt.completed !== true
  );
  
  // Group by patient name
  const patientSummary: { [patientName: string]: { completed: any[], notCompleted: any[], totalAppointments: number } } = {};
  
  appointments.forEach(apt => {
    if (!patientSummary[apt.patient]) {
      patientSummary[apt.patient] = {
        completed: [],
        notCompleted: [],
        totalAppointments: 0
      };
    }
    
    if (apt.status === 'completed' || apt.completed === true) {
      patientSummary[apt.patient].completed.push(apt);
    } else {
      patientSummary[apt.patient].notCompleted.push(apt);
    }
    
    patientSummary[apt.patient].totalAppointments++;
  });
  
  console.log('📊 Organized Appointment Data:', {
    totalAppointments: appointments.length,
    completed: completed.length,
    notCompleted: notCompleted.length,
    patientSummary: Object.keys(patientSummary).map(patient => ({
      patient,
      completed: patientSummary[patient].completed.length,
      notCompleted: patientSummary[patient].notCompleted.length,
      total: patientSummary[patient].totalAppointments
    }))
  });
  
  return {
    completed,
    notCompleted,
    patientSummary
  };
};

/**
 * Send organized appointment data to patient page and create missing patients
 */
export const sendAppointmentDataToPatients = (): PatientWithAppointments[] => {
  const organizedData = organizeAppointmentsByCompletion();
  const existingPatients = loadPatientsFromStorage();
  
  // Get all unique patient names from appointments
  const appointmentPatientNames = new Set(
    loadAppointmentsFromStorage().map(apt => apt.patient)
  );
  
  // Find patients who have appointments but don't exist in patient database
  const existingPatientNames = new Set(existingPatients.map(p => p.name));
  const missingPatientNames = [...appointmentPatientNames].filter(
    name => !existingPatientNames.has(name)
  );
  
  // Create patient records for missing appointment patients
  const missingPatients = missingPatientNames.map((patientName, index) => {
    const patientAppointments = loadAppointmentsFromStorage().filter(apt => apt.patient === patientName);
    const firstAppointment = patientAppointments[0];
    
    // Get today's date for proper appointment separation - Use local timezone
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    // Calculate today's appointment
    const todayAppointments = patientAppointments
      .filter(apt => {
        const normalizedDate = normalizeDateString(apt.date);
        return normalizedDate === todayString && apt.status !== 'completed' && apt.completed !== true;
      })
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    const todayAppointment = todayAppointments.length > 0 
      ? `Today ${todayAppointments[0].time}` 
      : '';
    
    // Calculate next appointment (AFTER today only)
    const futureAppointments = patientAppointments
      .filter(apt => {
        const normalizedDate = normalizeDateString(apt.date);
        const appointmentDate = new Date(normalizedDate);
        const todayDate = new Date(todayString);
        return appointmentDate > todayDate && apt.status !== 'completed' && apt.completed !== true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const nextAppointment = futureAppointments.length > 0 
      ? `${futureAppointments[0].date} ${futureAppointments[0].time}` 
      : '';
    
          return {
        id: Math.max(0, ...existingPatients.map(p => p.id)) + index + 1,
        name: patientName,
        age: null, // Age not provided
        gender: '',
        phone: firstAppointment?.phone || '',
        email: '',
        lastVisit: patientAppointments
          .filter(apt => apt.status === 'completed' || apt.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || '',
        todayAppointment, // Today's appointments only
        nextAppointment,  // Future appointments only (after today)
        condition: firstAppointment?.type || '',
        status: 'new',
        avatar: patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        address: '',
        bloodType: '',
        allergies: [],
        emergencyContact: '',
        medicalHistory: [],
        medications: [],
        visitNotes: [],
        vitalSigns: [],
        documents: [],
        _createdFromAppointment: true, // Flag to indicate this was auto-created
      };
  });
  
  // Combine existing patients with newly created ones
  const allPatients = [...existingPatients, ...missingPatients];
  
  // Save updated patient list (including new patients from appointments)
  savePatientsToStorage(allPatients);
  
  // Merge patient data with their appointment data
  const patientsWithAppointments = allPatients.map(patient => {
    const appointmentData = organizedData.patientSummary[patient.name] || {
      completed: [],
      notCompleted: [],
      totalAppointments: 0
    };
    
    // Calculate additional metrics
    const lastCompletedDate = appointmentData.completed.length > 0 
      ? appointmentData.completed
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : undefined;
    
    const nextPendingDate = appointmentData.notCompleted.length > 0
      ? appointmentData.notCompleted
          .filter(apt => {
            const normalizedDate = normalizeDateString(apt.date);
            const appointmentDate = new Date(normalizedDate);
            const today = new Date();
            const todayString = today.getFullYear() + '-' + 
              String(today.getMonth() + 1).padStart(2, '0') + '-' + 
              String(today.getDate()).padStart(2, '0');
            const todayDate = new Date(todayString);
            return appointmentDate > todayDate; // Only future appointments (after today)
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date
      : undefined;
    
    return {
      ...patient,
      appointmentData: {
        ...appointmentData,
        lastCompletedDate,
        nextPendingDate
      }
    };
  });
  
  console.log('🔄 Appointment Data Sent to Patients (Enhanced):', {
    totalExistingPatients: existingPatients.length,
    missingPatientsCreated: missingPatients.length,
    totalPatientsAfterSync: allPatients.length,
    appointmentPatientNames: [...appointmentPatientNames],
    missingPatientNames: missingPatientNames,
    patientsWithCompletedAppointments: patientsWithAppointments.filter(p => p.appointmentData.completed.length > 0).length,
    patientsWithPendingAppointments: patientsWithAppointments.filter(p => p.appointmentData.notCompleted.length > 0).length
  });
  
  return patientsWithAppointments;
};

/**
 * Get patient data organized by their appointment completion status
 */
export const getPatientsOrganizedByAppointmentStatus = () => {
  const patientsWithAppointments = sendAppointmentDataToPatients();
  
  const patientsWithCompleted = patientsWithAppointments.filter(p => 
    p.appointmentData.completed.length > 0
  );
  
  const patientsWithPending = patientsWithAppointments.filter(p => 
    p.appointmentData.notCompleted.length > 0
  );
  
  const patientsWithNoAppointments = patientsWithAppointments.filter(p => 
    p.appointmentData.totalAppointments === 0
  );
  
  return {
    patientsWithCompleted,
    patientsWithPending,
    patientsWithNoAppointments,
    allPatients: patientsWithAppointments
  };
};

/**
 * Normalize date string to YYYY-MM-DD format
 */
const normalizeDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try to parse and convert to YYYY-MM-DD
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.warn('Failed to normalize date:', dateStr, error);
  }
  
  return dateStr;
};

/**
 * Update specific patient's lastVisit, todayAppointment, and nextAppointment from appointments
 */
export const updatePatientAppointmentFields = (patientName: string) => {
  const patients = loadPatientsFromStorage();
  const appointments = loadAppointmentsFromStorage();
  
  const patientIndex = patients.findIndex(p => p.name === patientName);
  if (patientIndex === -1) return; // Patient not found
  
  const patientAppointments = appointments.filter(apt => apt.patient === patientName);
  
  // Calculate last visit (most recent completed appointment)
  const completedAppointments = patientAppointments
    .filter(apt => apt.status === 'completed' || apt.completed === true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const lastVisit = completedAppointments.length > 0 
    ? completedAppointments[0].date 
    : patients[patientIndex].lastVisit; // Keep existing if no completed appointments
  
  // Get today's date (without time) - Use local timezone
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  console.log(`🔍 Debug for ${patientName}:`, {
    todayString,
    patientAppointments: patientAppointments.map(apt => ({
      date: apt.date,
      normalizedDate: normalizeDateString(apt.date),
      time: apt.time,
      status: apt.status,
      completed: apt.completed
    }))
  });
  
  // Calculate today's appointment (appointment scheduled for today, if any)
  const todayAppointments = patientAppointments
    .filter(apt => {
      const normalizedDate = normalizeDateString(apt.date);
      const isToday = normalizedDate === todayString;
      const isNotCompleted = apt.status !== 'completed' && apt.completed !== true;
      
      console.log(`🔍 Checking appointment for today:`, {
        appointmentDate: apt.date,
        normalizedDate,
        todayString,
        isToday,
        status: apt.status,
        completed: apt.completed,
        isNotCompleted,
        willInclude: isToday && isNotCompleted
      });
      
      return isToday && isNotCompleted;
    })
    .sort((a, b) => (a.time || '').localeCompare(b.time || '')); // Sort by time
  
  const todayAppointment = todayAppointments.length > 0 
    ? `Today ${todayAppointments[0].time}` 
    : '';
  
  // Calculate next appointment (next upcoming non-completed appointment AFTER today)
  const futureAppointments = patientAppointments
    .filter(apt => {
      const normalizedDate = normalizeDateString(apt.date);
      const appointmentDate = new Date(normalizedDate);
      const todayDate = new Date(todayString);
      
      const isFuture = appointmentDate > todayDate;
      const isNotCompleted = apt.status !== 'completed' && apt.completed !== true;
      
      return isFuture && isNotCompleted;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextAppointment = futureAppointments.length > 0 
    ? `${futureAppointments[0].date} ${futureAppointments[0].time}` 
    : '';
  
  // Update patient record
  patients[patientIndex] = {
    ...patients[patientIndex],
    lastVisit,
    todayAppointment, // New field for today's appointments
    nextAppointment   // Now only shows future appointments (after today)
  };
  
  savePatientsToStorage(patients);
  
  console.log(`✅ Updated patient ${patientName}:`, {
    todayString,
    lastVisit,
    todayAppointment,
    nextAppointment,
    totalAppointments: patientAppointments.length,
    completedAppointments: completedAppointments.length,
    todayAppointments: todayAppointments.length,
    futureAppointments: futureAppointments.length,
    rawAppointments: patientAppointments.map(apt => `${apt.date} ${apt.time} (${apt.status})`)
  });
};

/**
 * Sync all patients' appointment fields from appointment data
 */
export const syncAllPatientsAppointmentFields = () => {
  const patients = loadPatientsFromStorage();
  const appointments = loadAppointmentsFromStorage();
  
  // Get all unique patient names from appointments
  const appointmentPatientNames = [...new Set(appointments.map(apt => apt.patient))];
  
  // Update each patient's appointment fields
  appointmentPatientNames.forEach(patientName => {
    updatePatientAppointmentFields(patientName);
  });
  
  console.log('🔄 Synced appointment fields for all patients:', appointmentPatientNames);
};

/**
 * Sync appointment changes to patient data
 */
export const syncAppointmentChangesToPatients = () => {
  console.log('🔄 Syncing appointment changes to patients...');
  sendAppointmentDataToPatients();
  syncAllPatientsAppointmentFields();
  
  // Trigger storage event to notify other components
  window.dispatchEvent(new CustomEvent('appointmentPatientSync', {
    detail: { timestamp: new Date().toISOString() }
  }));
};

/**
 * Manual sync trigger - force sync all patients with their appointment data
 */
export const forceSyncAllPatients = () => {
  console.log('🔄 Force syncing all patients with appointment data...');
  
  // Sync all existing patients' appointment fields
  syncAllPatientsAppointmentFields();
  
  // Also create missing patients from appointments
  sendAppointmentDataToPatients();
  
  // Trigger storage event to notify other components
  window.dispatchEvent(new CustomEvent('appointmentPatientSync', {
    detail: { timestamp: new Date().toISOString(), manual: true }
  }));
  
  console.log('✅ Force sync completed');
};

/**
 * Storage event listener to automatically sync when appointments change
 */
export const setupAppointmentPatientSync = () => {
  window.addEventListener('appointmentsUpdated', syncAppointmentChangesToPatients);
  
  // Also sync on page load
  syncAppointmentChangesToPatients();
  
  // Force sync after a short delay to ensure all data is loaded
  setTimeout(() => {
    forceSyncAllPatients();
  }, 1000);
}; 