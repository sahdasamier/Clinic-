import { AppointmentService } from '@/services/AppointmentService';
import { PatientService } from '@/services/PatientService';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '@lib/firebase/legacy-compat';

// Helper to get safe database reference
const getDb = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  return getOptimizedFirestore();
};

// ✅ Add proper types for the data
interface AppointmentData {
  id: string;
  patient?: string;
  phone?: string;
  type?: string;
  patientId?: string;
  clinicId?: string;
  isActive?: boolean;
  [key: string]: any; // Allow other properties
}

interface PatientData {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  condition?: string;
  isActive?: boolean;
  clinicId?: string;
  [key: string]: any; // Allow other properties
}

/**
 * Manual sync utility to process existing appointments and create patient records
 * This can be called from the browser console or frontend
 */
export class ManualSyncUtility {
  
  /**
   * Sync all appointments to create missing patient records
   * @param clinicId - The clinic ID to sync (default: "demo-clinic")
   */
  static async syncAppointmentsToPatients(clinicId: string = "demo-clinic") {
    console.log('🚀 Starting Manual Appointment-Patient Sync...');
    console.log('📍 Clinic ID:', clinicId);
    
    try {
      // Step 1: Get all appointments
      console.log('📋 Step 1: Fetching all appointments...');
      const appointmentsQuery = query(
        collection(getDb(), 'appointments'),
        where('clinicId', '==', clinicId),
        where('isActive', '==', true)
      );
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments: AppointmentData[] = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppointmentData));
      
      console.log(`📊 Found ${appointments.length} appointments to process`);
      
      if (appointments.length === 0) {
        console.log('⚠️ No appointments found. Check your clinic ID.');
        return { error: 'No appointments found' };
      }
      
      // Step 2: Get existing patients
      console.log('👥 Step 2: Fetching existing patients...');
      const patientsQuery = query(
        collection(getDb(), 'patients'),
        where('clinicId', '==', clinicId),
        where('isActive', '==', true)
      );
      
      const patientsSnapshot = await getDocs(patientsQuery);
      const existingPatients: PatientData[] = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PatientData));
      
      console.log(`👥 Found ${existingPatients.length} existing patients`);
      
      // Step 3: Process each appointment
      console.log('🔄 Step 3: Processing appointments...');
      let patientsCreated = 0;
      let patientsLinked = 0;
      let appointmentsProcessed = 0;
      const errors: string[] = [];
      
      for (const appointment of appointments) {
        try {
          console.log(`📋 Processing appointment ${appointment.id} for patient: ${appointment.patient || 'Unknown'}`);
          
          // Skip if no patient name
          if (!appointment.patient || appointment.patient.trim() === '') {
            console.log('⏭️ Skipping - no patient name');
            continue;
          }
          
          // Check if patient already exists
          const existingPatient = existingPatients.find(p => 
            p.name?.toLowerCase().trim() === appointment.patient?.toLowerCase().trim()
          );
          
          if (existingPatient) {
            console.log(`✅ Patient already exists: ${existingPatient.name} (${existingPatient.id})`);
            
            // Update appointment with patientId if missing
            if (!appointment.patientId) {
              await AppointmentService.updateAppointment(appointment.id, {
                patientId: existingPatient.id
              });
              patientsLinked++;
              console.log(`🔗 Linked appointment to existing patient`);
            }
          } else {
            // Create new patient
            console.log(`🆕 Creating new patient: ${appointment.patient}`);
            
            const newPatientData = {
              name: appointment.patient,
              phone: appointment.phone || '',
              email: '',
              status: 'new' as const,
              condition: appointment.type || 'General consultation',
              isActive: true,
              medicalHistory: [],
              medications: [],
              visitNotes: [],
              vitalSigns: [],
              documents: [],
              allergies: []
            };
            
            const newPatientId = await PatientService.createPatient(clinicId, newPatientData);
            console.log(`✅ Created new patient: ${appointment.patient} (${newPatientId})`);
            
            // Update appointment with new patientId
            await AppointmentService.updateAppointment(appointment.id, {
              patientId: newPatientId
            });
            
            patientsCreated++;
            console.log(`🔗 Linked appointment to new patient`);
          }
          
          appointmentsProcessed++;
          
        } catch (error) {
          const errorMsg = `Failed to process appointment ${appointment.id}: ${error}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }
      
      const result = {
        totalAppointments: appointments.length,
        appointmentsProcessed,
        patientsCreated,
        patientsLinked,
        errors
      };
      
      console.log('🎉 Manual Sync Completed!');
      console.log('📊 Results:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      throw error;
    }
  }
  
  /**
   * Quick sync - just create patients from appointments without linking
   */
  static async quickCreatePatientsFromAppointments(clinicId: string = "demo-clinic") {
    console.log('⚡ Quick Sync: Creating patients from appointments...');
    
    try {
      const appointments = await AppointmentService.getAllAppointments(clinicId);
      const existingPatients = await PatientService.searchPatients(clinicId, '');
      
      const existingPatientNames = new Set(
        existingPatients.map(p => p.name?.toLowerCase().trim())
      );
      
      let created = 0;
      
      for (const appointment of appointments) {
        if (!appointment.patient || appointment.patient.trim() === '') continue;
        
        const patientNameLower = appointment.patient.toLowerCase().trim();
        
        if (!existingPatientNames.has(patientNameLower)) {
          const newPatientData = {
            name: appointment.patient,
            phone: appointment.phone || '',
            email: '',
            status: 'new' as const,
            condition: appointment.type || 'General consultation',
            isActive: true,
            medicalHistory: [],
            medications: [],
            visitNotes: [],
            vitalSigns: [],
            documents: [],
            allergies: []
          };
          
          await PatientService.createPatient(clinicId, newPatientData);
          existingPatientNames.add(patientNameLower);
          created++;
          console.log(`✅ Created patient: ${appointment.patient}`);
        }
      }
      
      console.log(`🎉 Quick sync complete! Created ${created} patients`);
      return { created };
      
    } catch (error) {
      console.error('❌ Quick sync failed:', error);
      throw error;
    }
  }
  
  /**
   * Debug function to check clinic data
   */
  static async debugClinicData(clinicId: string = "demo-clinic") {
    console.log('🔍 Debugging clinic data for:', clinicId);
    
    try {
      // Check appointments
      const appointmentsQuery = query(
        collection(getDb(), 'appointments'),
        where('clinicId', '==', clinicId)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments: AppointmentData[] = appointmentsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as AppointmentData));
      
      // Check patients  
      const patientsQuery = query(
        collection(getDb(), 'patients'),
        where('clinicId', '==', clinicId)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patients: PatientData[] = patientsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as PatientData));
      
      console.log('📊 Debug Results:');
      console.log(`📋 Appointments: ${appointments.length}`);
      console.log(`👥 Patients: ${patients.length}`);
      
      // Show sample data
      if (appointments.length > 0) {
        console.log('📋 Sample appointment:', appointments[0]);
      }
      
      if (patients.length > 0) {
        console.log('👥 Sample patient:', patients[0]);
      }
      
      // Check for appointments without patientId
      const appointmentsWithoutPatientId = appointments.filter(a => !a.patientId);
      console.log(`🔗 Appointments without patientId: ${appointmentsWithoutPatientId.length}`);
      
      return {
        appointments: appointments.length,
        patients: patients.length,
        appointmentsWithoutPatientId: appointmentsWithoutPatientId.length,
        sampleAppointment: appointments[0],
        samplePatient: patients[0]
      };
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
      throw error;
    }
  }
}

// Make it available globally for console access
(window as any).ManualSyncUtility = ManualSyncUtility;

export default ManualSyncUtility; 