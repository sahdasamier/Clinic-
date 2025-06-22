import { loadAppointmentsFromStorage, saveAppointmentsToStorage } from '../features/appointments/AppointmentListPage';
import { loadPatientsFromStorage, savePatientsToStorage } from '../features/patients/PatientListPage';

/**
 * Enhanced appointment loading with multiple key support and debugging
 */
const loadAppointmentsEnhanced = (): any[] => {
  const possibleKeys = ['clinic_appointments_data', 'appointments'];
  let appointments: any[] = [];
  
  console.log('🔍 Loading appointments - checking keys:', possibleKeys);
  
  for (const key of possibleKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(`✅ Found ${parsedData.length} appointments in localStorage key: ${key}`);
          appointments = [...appointments, ...parsedData];
        } else {
          console.log(`⚠️ Key ${key} exists but has no valid appointments`);
        }
      } else {
        console.log(`❌ Key ${key} not found in localStorage`);
      }
    } catch (error) {
      console.error(`❌ Error loading appointments from key ${key}:`, error);
    }
  }
  
  // Remove duplicates based on ID
  const uniqueAppointments = appointments.filter((apt, index, self) => 
    index === self.findIndex(a => a.id === apt.id)
  );
  
  console.log(`📊 Total unique appointments loaded: ${uniqueAppointments.length}`);
  
  if (uniqueAppointments.length === 0) {
    // Fallback to the original function
    console.log('🔄 Falling back to original loadAppointmentsFromStorage');
    return loadAppointmentsFromStorage();
  }
  
  return uniqueAppointments;
};

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
  const appointments = loadAppointmentsEnhanced();
  
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
    loadAppointmentsEnhanced().map(apt => apt.patient)
  );
  
  // Find patients who have appointments but don't exist in patient database
  const existingPatientNames = new Set(existingPatients.map(p => p.name));
  const missingPatientNames = [...appointmentPatientNames].filter(
    name => !existingPatientNames.has(name)
  );
  
  // Create patient records for missing appointment patients
  const missingPatients = missingPatientNames.map((patientName, index) => {
    const patientAppointments = loadAppointmentsEnhanced().filter(apt => apt.patient === patientName);
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
    
    // Calculate all completed visits for this patient (including past appointments)
    const completedAppointments = patientAppointments
      .filter(apt => {
        // Consider completed if explicitly marked OR if appointment date is in the past
        const isExplicitlyCompleted = apt.status === 'completed' || apt.completed === true;
        const appointmentDate = new Date(normalizeDateString(apt.date));
        const todayDate = new Date(todayString);
        const isPastAppointment = appointmentDate < todayDate;
        
        return isExplicitlyCompleted || isPastAppointment;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const allCompletedVisits = completedAppointments.map(apt => ({
      date: apt.date,
      time: apt.time,
      type: apt.type,
      doctor: apt.doctor,
      notes: apt.notes,
      appointmentId: apt.id
    }));
    
          return {
        id: Math.max(0, ...existingPatients.map(p => p.id)) + index + 1,
        name: patientName,
        age: null, // Age not provided
        gender: '',
        phone: firstAppointment?.phone || '',
        email: '',
        lastVisit: completedAppointments.length > 0 
          ? completedAppointments[0].date 
          : '',
        allCompletedVisits, // All completed visits with details
        todayAppointment, // Today's appointments only
        nextAppointment,  // Future appointments only (after today)
        condition: firstAppointment?.type || '',
        status: 'new',
        avatar: patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        address: '',
        bloodType: '',
        allergies: [],
        emergencyContact: '',
        medicalHistory: completedAppointments
          .map(apt => convertAppointmentToMedicalHistory(apt))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
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
 * Convert completed appointment to medical history entry
 */
const convertAppointmentToMedicalHistory = (appointment: any) => {
  // Check if this is a past appointment (auto-completed) or explicitly completed
  const appointmentDate = new Date(appointment.date);
  const today = new Date();
  const isPastVisit = appointmentDate < today;
  const isExplicitlyCompleted = appointment.status === 'completed' || appointment.completed === true;
  
  return {
    date: appointment.date,
    condition: `${appointment.type || 'Medical Visit'} - ${isPastVisit && !isExplicitlyCompleted ? 'Past Visit' : 'Visit Completed'}`,
    treatment: appointment.notes ? 
      `Visit ${isPastVisit && !isExplicitlyCompleted ? 'recorded' : 'completed'}. Notes: ${appointment.notes}` : 
      `${appointment.type || 'Medical'} visit ${isPastVisit && !isExplicitlyCompleted ? 'recorded from past date' : 'completed successfully'}.`,
    doctor: appointment.doctor || 'Dr. Unknown',
    notes: `Appointment ${isPastVisit && !isExplicitlyCompleted ? 'from past date' : 'completed'} on ${appointment.date} at ${appointment.time}. Duration: ${appointment.duration || 30} minutes.${appointment.notes ? ` Additional notes: ${appointment.notes}` : ''}${isPastVisit && !isExplicitlyCompleted ? ' (Auto-recorded from past appointment)' : ''}`,
    _autoGeneratedFromAppointment: true, // Flag to identify auto-generated entries
    _appointmentId: appointment.id,
    _isPastVisit: isPastVisit && !isExplicitlyCompleted // Flag to identify past visits
  };
};

/**
 * Sync completed appointments to medical history
 */
const syncCompletedAppointmentsToMedicalHistory = (patientIndex: number, patients: any[], patientAppointments: any[]) => {
  const patient = patients[patientIndex];
  const existingMedicalHistory = patient.medicalHistory || [];
  
  // Get completed appointments (including past appointments)
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
    
  const completedAppointments = patientAppointments
    .filter(apt => {
      // Consider completed if explicitly marked OR if appointment date is in the past
      const isExplicitlyCompleted = apt.status === 'completed' || apt.completed === true;
      const appointmentDate = new Date(normalizeDateString(apt.date));
      const todayDate = new Date(todayString);
      const isPastAppointment = appointmentDate < todayDate;
      
      return isExplicitlyCompleted || isPastAppointment;
    });
  
  // Get existing appointment IDs in medical history to avoid duplicates
  const existingAppointmentIds = new Set(
    existingMedicalHistory
      .filter(history => history._appointmentId)
      .map(history => history._appointmentId)
  );
  
  // Convert new completed appointments to medical history entries
  const newMedicalHistoryEntries = completedAppointments
    .filter(apt => !existingAppointmentIds.has(apt.id)) // Avoid duplicates
    .map(apt => convertAppointmentToMedicalHistory(apt));
  
  if (newMedicalHistoryEntries.length > 0) {
    // Add new entries and sort by date (newest first)
    const updatedMedicalHistory = [...existingMedicalHistory, ...newMedicalHistoryEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    patients[patientIndex] = {
      ...patients[patientIndex],
      medicalHistory: updatedMedicalHistory
    };
    
    console.log(`📋 Added ${newMedicalHistoryEntries.length} completed appointments to ${patient.name}'s medical history`);
  }
  
  return newMedicalHistoryEntries.length;
};

/**
 * Update specific patient's lastVisit, todayAppointment, nextAppointment and sync medical history
 */
export const updatePatientAppointmentFields = (patientName: string) => {
  const patients = loadPatientsFromStorage();
  const appointments = loadAppointmentsEnhanced();
  
  const patientIndex = patients.findIndex(p => p.name === patientName);
  if (patientIndex === -1) return; // Patient not found
  
  const patientAppointments = appointments.filter(apt => apt.patient === patientName);
  
  // Get today's date (without time) - Use local timezone - MOVED TO TOP
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  // Calculate all completed visits (including past appointments) and most recent one
  const completedAppointments = patientAppointments
    .filter(apt => {
      // Consider completed if explicitly marked OR if appointment date is in the past
      const isExplicitlyCompleted = apt.status === 'completed' || apt.completed === true;
      const appointmentDate = new Date(normalizeDateString(apt.date));
      const todayDate = new Date(todayString);
      const isPastAppointment = appointmentDate < todayDate;
      
      return isExplicitlyCompleted || isPastAppointment;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Store all completed visit dates from appointments
  const allCompletedVisits = completedAppointments.map(apt => ({
    date: apt.date,
    time: apt.time,
    type: apt.type,
    doctor: apt.doctor,
    notes: apt.notes,
    appointmentId: apt.id
  }));
  
  // Check if patient has a manually set lastVisit that's not from appointments
  const existingLastVisit = patients[patientIndex].lastVisit;
  if (existingLastVisit && existingLastVisit.trim()) {
    // Check if this lastVisit is already in our completed appointments
    const isAlreadyInAppointments = completedAppointments.some(apt => apt.date === existingLastVisit);
    
    if (!isAlreadyInAppointments) {
      // Add the manually set lastVisit as a completed visit
      allCompletedVisits.push({
        date: existingLastVisit,
        time: 'Unknown',
        type: 'Last Visit (Manual)',
        doctor: 'Dr. Unknown',
        notes: 'Manually recorded last visit',
        appointmentId: `manual-${existingLastVisit}`
      });
      
      console.log(`✅ Added manually set lastVisit (${existingLastVisit}) to completed visits for ${patientName}`);
    }
  }
  
  // Sort all completed visits by date (newest first)
  allCompletedVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get most recent visit for lastVisit field
  const lastVisit = allCompletedVisits.length > 0 
    ? allCompletedVisits[0].date 
    : existingLastVisit; // Keep existing if no completed visits
  
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
  
  // Sync completed appointments to medical history
  const newHistoryEntries = syncCompletedAppointmentsToMedicalHistory(patientIndex, patients, patientAppointments);
  
  // Update patient record with appointment fields
  patients[patientIndex] = {
    ...patients[patientIndex],
    lastVisit,
    allCompletedVisits, // New field storing all completed visits
    todayAppointment, // New field for today's appointments
    nextAppointment   // Now only shows future appointments (after today)
  };
  
  savePatientsToStorage(patients);
  
  console.log(`✅ Updated patient ${patientName}:`, {
    todayString,
    lastVisit,
    allCompletedVisits: allCompletedVisits.length,
    todayAppointment,
    nextAppointment,
    totalAppointments: patientAppointments.length,
    completedAppointments: completedAppointments.length,
    explicitlyCompleted: patientAppointments.filter(apt => apt.status === 'completed' || apt.completed === true).length,
    pastAppointments: patientAppointments.filter(apt => {
      const appointmentDate = new Date(normalizeDateString(apt.date));
      const todayDate = new Date(todayString);
      return appointmentDate < todayDate && apt.status !== 'completed' && apt.completed !== true;
    }).length,
    todayAppointments: todayAppointments.length,
    futureAppointments: futureAppointments.length,
    newHistoryEntries,
    allCompletedVisitsDetails: allCompletedVisits,
    rawAppointments: patientAppointments.map(apt => `${apt.date} ${apt.time} (${apt.status})`)
  });
};

/**
 * Sync all patients' appointment fields from appointment data
 */
export const syncAllPatientsAppointmentFields = () => {
  const patients = loadPatientsFromStorage();
  const appointments = loadAppointmentsEnhanced();
  
  // Get all unique patient names from appointments
  const appointmentPatientNames = [...new Set(appointments.map(apt => apt.patient))];
  
  // Update each patient's appointment fields
  appointmentPatientNames.forEach(patientName => {
    updatePatientAppointmentFields(patientName);
  });
  
  console.log('🔄 Synced appointment fields for all patients:', appointmentPatientNames);
};

/**
 * Bulk sync all patients' completed appointments to medical history
 */
export const syncAllCompletedAppointmentsToMedicalHistory = () => {
  const patients = loadPatientsFromStorage();
  const appointments = loadAppointmentsEnhanced();
  
  let totalSynced = 0;
  
  patients.forEach((patient, index) => {
    const patientAppointments = appointments.filter(apt => apt.patient === patient.name);
    const syncedCount = syncCompletedAppointmentsToMedicalHistory(index, patients, patientAppointments);
    totalSynced += syncedCount;
  });
  
  if (totalSynced > 0) {
    savePatientsToStorage(patients);
    console.log(`📋 Bulk sync completed: ${totalSynced} completed appointments added to medical history across all patients`);
  } else {
    console.log('📋 Bulk sync completed: No new appointments to sync to medical history');
  }
  
  return totalSynced;
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
  
  // Sync all completed appointments to medical history
  syncAllCompletedAppointmentsToMedicalHistory();
  
  // Also create missing patients from appointments
  sendAppointmentDataToPatients();
  
  // Trigger storage event to notify other components
  window.dispatchEvent(new CustomEvent('appointmentPatientSync', {
    detail: { timestamp: new Date().toISOString(), manual: true }
  }));
  
  console.log('✅ Force sync completed');
};

/**
 * Debug function to analyze a specific patient's appointment data
 */
export const debugPatientAppointments = (patientName: string) => {
  console.log(`🔍 DEBUG: Analyzing appointments for ${patientName}`);
  
  const appointments = loadAppointmentsEnhanced();
  const patients = loadPatientsFromStorage();
  
  const patientAppointments = appointments.filter(apt => 
    apt.patient && apt.patient.toLowerCase().includes(patientName.toLowerCase())
  );
  
  const patient = patients.find(p => 
    p.name && p.name.toLowerCase().includes(patientName.toLowerCase())
  );
  
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  console.log('📊 Patient Appointment Analysis:', {
    patientName,
    todayString,
    totalAppointments: patientAppointments.length,
    appointments: patientAppointments.map(apt => {
      const appointmentDate = new Date(normalizeDateString(apt.date));
      const isPast = appointmentDate < new Date(todayString);
      const isExplicitlyCompleted = apt.status === 'completed' || apt.completed === true;
      
      return {
        id: apt.id,
        date: apt.date,
        normalizedDate: normalizeDateString(apt.date),
        time: apt.time,
        type: apt.type,
        status: apt.status,
        completed: apt.completed,
        isPast,
        isExplicitlyCompleted,
        shouldBeInLastVisits: isPast || isExplicitlyCompleted
      };
    }),
    patient: patient ? {
      lastVisit: patient.lastVisit,
      allCompletedVisits: patient.allCompletedVisits?.length || 0,
      todayAppointment: patient.todayAppointment,
      nextAppointment: patient.nextAppointment
    } : 'Patient not found'
  });
  
  return { appointments: patientAppointments, patient };
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
  
  // Make debug function available globally for console access
  (window as any).debugPatientAppointments = debugPatientAppointments;
}; 