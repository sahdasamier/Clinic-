import React, { useState, useEffect } from 'react';
import { 
  PatientService,
  AppointmentService,
  PaymentService,
  ServiceUtils,
  type Patient,
  type Appointment,
  type Payment
} from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

/**
 * 🚀 UI REFACTORING PATTERNS: localStorage → Firestore Services
 * 
 * This file demonstrates the complete refactoring patterns for moving
 * from localStorage operations to Firestore services in UI components.
 */

const UIRefactoringPatterns: React.FC = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  
  // ✅ NEW: Real-time state powered by Firestore listeners
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Set up real-time listeners (replaces localStorage loading)
  useEffect(() => {
    if (!userProfile?.clinicId) return;

    const clinicId = userProfile.clinicId;
    setLoading(true);

    // Real-time listeners automatically update state
    const unsubscribePatients = PatientService.listenPatients(clinicId, setPatients);
    const unsubscribeAppointments = AppointmentService.listenAppointments(clinicId, setAppointments);
    const unsubscribePayments = PaymentService.listenPayments(clinicId, setPayments);

    setLoading(false);

    return () => {
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribePayments();
    };
  }, [userProfile?.clinicId]);

  // 🔥 PATTERN 1: Creating New Records
  const createPatientExample = async () => {
    const patientData = {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      age: 35,
      gender: 'male' as const,
      status: 'new' as const,
      isActive: true,
      allergies: [],
      medications: [],
      visitNotes: [],
      vitalSigns: []
    };

    try {
      // ❌ OLD: Manual state manipulation + localStorage
      // const newPatient = { ...patientData, id: Date.now() };
      // const updated = [...patients, newPatient];
      // localStorage.setItem('patients', JSON.stringify(updated));
      // setPatients(updated);

      // ✅ NEW: Firestore service + automatic state update
      await PatientService.createPatient(userProfile!.clinicId, patientData);
      // State updates automatically via listener!
      
      console.log('✅ Patient created successfully');
    } catch (error) {
      console.error('❌ Error creating patient:', error);
    }
  };

  // 🔥 PATTERN 2: Updating Existing Records
  const updatePatientExample = async (patientId: string) => {
    const updates = {
      status: 'follow-up' as const,
      visitNotes: [
        {
          date: ServiceUtils.getToday(),
          doctor: 'Dr. Smith',
          notes: 'Patient is recovering well',
          visitType: 'Follow-up Visit'
        }
      ]
    };

    try {
      // ❌ OLD: Manual array manipulation + localStorage
      // const updated = patients.map(p => 
      //   p.id === patientId ? { ...p, ...updates } : p
      // );
      // localStorage.setItem('patients', JSON.stringify(updated));
      // setPatients(updated);

      // ✅ NEW: Firestore service + automatic state update
      await PatientService.updatePatient(patientId, updates);
      // State updates automatically via listener!
      
      console.log('✅ Patient updated successfully');
    } catch (error) {
      console.error('❌ Error updating patient:', error);
    }
  };

  // 🔥 PATTERN 3: Creating Related Records (Appointment + Payment)
  const scheduleAppointmentExample = async (patientId: string) => {
    const appointmentData = {
      patient: 'John Doe',
      patientId: patientId,
      doctor: 'Dr. Smith',
      doctorId: 'doctor123',
      date: '2024-01-15',
      time: '10:00',
      timeSlot: '10:00',
      type: 'consultation' as const,
      duration: 30,
      priority: 'normal' as const,
      location: 'Main Clinic',
      notes: 'Regular checkup',
      status: 'confirmed' as const,
      paymentStatus: 'pending' as const,
      isActive: true
    };

    try {
      // ❌ OLD: Complex manual state management + localStorage
      // const newAppointment = { ...appointmentData, id: Date.now() };
      // const updatedAppointments = [...appointments, newAppointment];
      // localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      // setAppointments(updatedAppointments);
      
      // // Also create payment manually
      // const payment = { /* manual payment creation */ };
      // const updatedPayments = [...payments, payment];
      // localStorage.setItem('payments', JSON.stringify(updatedPayments));
      // setPayments(updatedPayments);

      // ✅ NEW: Firestore services + automatic state updates
      const newAppointmentId = await AppointmentService.createAppointment(
        userProfile!.clinicId, 
        appointmentData
      );
      
      // Auto-create payment for appointment
      const paymentData = {
        patient: appointmentData.patient,
        patientId: patientId,
        appointmentId: newAppointmentId,
        amount: 100,
        method: 'cash' as const,
        status: 'pending' as const,
        date: appointmentData.date,
        invoiceDate: appointmentData.date,
        dueDate: appointmentData.date,
        category: 'consultation' as const,
        description: `Appointment with ${appointmentData.doctor}`,
        currency: 'USD',
        isActive: true
      };
      
      await PaymentService.createPayment(userProfile!.clinicId, paymentData);
      
      // Both states update automatically via listeners!
      console.log('✅ Appointment and payment created successfully');
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
    }
  };

  // 🔥 PATTERN 4: Complex Searches (replace localStorage filtering)
  const searchPatientsExample = async (searchTerm: string) => {
    try {
      // ❌ OLD: Load from localStorage and filter manually
      // const stored = localStorage.getItem('patients');
      // const allPatients = stored ? JSON.parse(stored) : [];
      // const filtered = allPatients.filter(p => 
      //   p.name.toLowerCase().includes(searchTerm.toLowerCase())
      // );
      // setPatients(filtered);

      // ✅ NEW: Use service search methods
      const searchResults = await PatientService.searchPatients(
        userProfile!.clinicId,
        searchTerm
      );
      
      // Display search results without affecting main state
      console.log(`Found ${searchResults.length} patients matching "${searchTerm}"`);
      return searchResults;
    } catch (error) {
      console.error('❌ Error searching patients:', error);
      return [];
    }
  };

  // 🔥 PATTERN 5: Bulk Operations
  const bulkUpdateExample = async (patientIds: string[], status: Patient['status']) => {
    try {
      // ❌ OLD: Manual loop + localStorage
      // const updated = patients.map(p => 
      //   patientIds.includes(p.id) ? { ...p, status } : p
      // );
      // localStorage.setItem('patients', JSON.stringify(updated));
      // setPatients(updated);

      // ✅ NEW: Service batch operations
      for (const patientId of patientIds) {
        await PatientService.updatePatient(patientId, { status });
      }
      
      // State updates automatically via listener!
      console.log(`✅ Updated ${patientIds.length} patients to status: ${status}`);
    } catch (error) {
      console.error('❌ Error updating patients:', error);
    }
  };

  // 🔥 PATTERN 6: Statistics & Analytics (replace localStorage calculations)
  const getStatisticsExample = async () => {
    try {
      // ❌ OLD: Load from localStorage and calculate manually
      // const storedPatients = localStorage.getItem('patients');
      // const storedAppointments = localStorage.getItem('appointments');
      // const patients = storedPatients ? JSON.parse(storedPatients) : [];
      // const appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      // const stats = calculateStatsManually(patients, appointments);

      // ✅ NEW: Use service statistics methods
      const patientStats = await PatientService.getPatientStats(userProfile!.clinicId);
      const appointmentStats = await AppointmentService.getAppointmentStats(userProfile!.clinicId);
      const paymentStats = await PaymentService.getPaymentStats(userProfile!.clinicId);
      
      console.log('📊 Real-time statistics:', {
        totalPatients: patientStats.total,
        todayAppointments: appointmentStats.today,
        monthlyRevenue: paymentStats.totalAmount
      });
      
      return { patientStats, appointmentStats, paymentStats };
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
    }
  };

  // 🔥 PATTERN 7: Form Handling (UI state only, no localStorage persistence)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleFormSubmit = async () => {
    try {
      // ❌ OLD: Save form to localStorage for "persistence"
      // localStorage.setItem('patient_form', JSON.stringify(formData));

      // ✅ NEW: Use form data directly, keep as UI state only
      await createPatientExample();
      
      // Reset form after successful submission
      setFormData({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 UI Refactoring Patterns: localStorage → Firestore Services</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>📊 Real-time Data Status</h2>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Patients: {patients.length}</p>
        <p>Appointments: {appointments.length}</p>
        <p>Payments: {payments.length}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🎯 Key Refactoring Patterns</h2>
        <ul>
          <li>✅ <strong>Real-time listeners</strong> replace localStorage loading</li>
          <li>✅ <strong>Service method calls</strong> replace manual state updates</li>
          <li>✅ <strong>Automatic state updates</strong> via onSnapshot listeners</li>
          <li>✅ <strong>Error handling</strong> with try/catch blocks</li>
          <li>✅ <strong>Type safety</strong> with TypeScript interfaces</li>
          <li>✅ <strong>Batch operations</strong> for efficiency</li>
          <li>✅ <strong>Search methods</strong> replace manual filtering</li>
          <li>✅ <strong>Statistics services</strong> replace manual calculations</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔧 Example Actions</h2>
        <button onClick={createPatientExample} style={{ margin: '5px' }}>
          Create Patient (Firestore)
        </button>
        <button onClick={() => updatePatientExample('example-id')} style={{ margin: '5px' }}>
          Update Patient (Firestore)
        </button>
        <button onClick={() => scheduleAppointmentExample('example-id')} style={{ margin: '5px' }}>
          Schedule Appointment + Payment (Firestore)
        </button>
        <button onClick={() => searchPatientsExample('John')} style={{ margin: '5px' }}>
          Search Patients (Firestore)
        </button>
        <button onClick={getStatisticsExample} style={{ margin: '5px' }}>
          Get Statistics (Firestore)
        </button>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>💡 Key Benefits of Refactoring</h3>
        <ul>
          <li><strong>Real-time collaboration:</strong> Multiple users see updates instantly</li>
          <li><strong>Data persistence:</strong> No more data loss when browser cache clears</li>
          <li><strong>Scalability:</strong> Cloud Firestore handles any amount of data</li>
          <li><strong>Offline support:</strong> Firestore offline persistence continues working</li>
          <li><strong>Type safety:</strong> Full TypeScript support with proper interfaces</li>
          <li><strong>Error handling:</strong> Proper error handling and user feedback</li>
          <li><strong>Performance:</strong> Optimized queries and batch operations</li>
          <li><strong>Simplicity:</strong> Cleaner code without manual state management</li>
        </ul>
      </div>
    </div>
  );
};

export default UIRefactoringPatterns; 