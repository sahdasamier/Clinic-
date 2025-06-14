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
    
          return {
        id: Math.max(0, ...existingPatients.map(p => p.id)) + index + 1,
        name: patientName,
        age: 30, // Default age
        gender: 'Unknown',
        phone: firstAppointment?.phone || 'N/A',
        email: `${patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        lastVisit: patientAppointments
          .filter(apt => apt.status === 'completed' || apt.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || 'N/A',
        nextAppointment: patientAppointments
          .filter(apt => new Date(apt.date) >= new Date() && (apt.status !== 'completed' && !apt.completed))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date || 'Not scheduled',
        condition: firstAppointment?.type || 'Initial consultation',
        status: 'new',
        avatar: patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        address: 'Address not provided',
        bloodType: 'Unknown',
        allergies: [],
        emergencyContact: 'Not provided',
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
          .filter(apt => new Date(apt.date) >= new Date())
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
 * Sync appointment changes to patient data
 */
export const syncAppointmentChangesToPatients = () => {
  console.log('🔄 Syncing appointment changes to patients...');
  sendAppointmentDataToPatients();
  
  // Trigger storage event to notify other components
  window.dispatchEvent(new CustomEvent('appointmentPatientSync', {
    detail: { timestamp: new Date().toISOString() }
  }));
};

/**
 * Storage event listener to automatically sync when appointments change
 */
export const setupAppointmentPatientSync = () => {
  window.addEventListener('appointmentsUpdated', syncAppointmentChangesToPatients);
  
  // Also sync on page load
  syncAppointmentChangesToPatients();
}; 