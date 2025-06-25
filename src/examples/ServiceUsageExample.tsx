import React, { useState, useEffect } from 'react';
import { 
  PatientService, 
  AppointmentService, 
  ScheduleService, 
  PaymentService,
  InventoryService,
  ServiceUtils,
  type Patient,
  type Appointment,
  type Payment,
  type InventoryItem
} from '../services';

// Example: How to use the Firestore services in React components
const ServiceUsageExample: React.FC = () => {
  // Example clinic ID - in real app, get from auth context
  const clinicId = 'demo-clinic-123';
  
  // State for different entities
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Listen to real-time data updates
  useEffect(() => {
    console.log('🔗 Setting up real-time Firestore listeners...');
    
    // Listen to patients
    const unsubscribePatients = PatientService.listenPatients(clinicId, (updatedPatients) => {
      console.log('📊 Patients updated:', updatedPatients.length);
      setPatients(updatedPatients);
    });

    // Listen to appointments
    const unsubscribeAppointments = AppointmentService.listenAppointments(clinicId, (updatedAppointments) => {
      console.log('📅 Appointments updated:', updatedAppointments.length);
      setAppointments(updatedAppointments);
    });

    // Listen to payments
    const unsubscribePayments = PaymentService.listenPayments(clinicId, (updatedPayments) => {
      console.log('💰 Payments updated:', updatedPayments.length);
      setPayments(updatedPayments);
    });

    // Listen to inventory
    const unsubscribeInventory = InventoryService.listenInventory(clinicId, (updatedInventory) => {
      console.log('📦 Inventory updated:', updatedInventory.length);
      setInventory(updatedInventory);
    });

    setLoading(false);

    // Cleanup: Unsubscribe from all listeners when component unmounts
    return () => {
      console.log('🧹 Cleaning up Firestore listeners...');
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribePayments();
      unsubscribeInventory();
    };
  }, [clinicId]);

  // 2. Example: Create a new patient
  const handleCreatePatient = async () => {
    try {
      const newPatientData = {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        age: 35,
        gender: 'male' as const,
        condition: 'Routine checkup',
        status: 'new' as const,
        avatar: ServiceUtils.generateAvatar('John Doe'),
        isActive: true,
      };

      const patientId = await PatientService.createPatient(clinicId, newPatientData);
      console.log('✅ Patient created with ID:', patientId);
      
      // Patient will automatically appear in the patients list due to real-time listener
    } catch (error) {
      console.error('❌ Error creating patient:', error);
    }
  };

  // 3. Example: Create an appointment
  const handleCreateAppointment = async () => {
    if (patients.length === 0) {
      alert('Create a patient first!');
      return;
    }

    try {
      const patient = patients[0]; // Use first patient for demo
      const appointmentData = {
        patientId: patient.id,
        patient: patient.name,
        doctor: 'Dr. Smith',
        doctorId: 'doctor-123',
        date: ServiceUtils.getToday(),
        time: '10:00 AM',
        timeSlot: '10:00',
        duration: 30,
        type: 'consultation',
        status: 'pending' as const,
        priority: 'normal' as const,
        location: 'Room 101',
        isActive: true,
      };

      const appointmentId = await AppointmentService.createAppointment(clinicId, appointmentData);
      console.log('✅ Appointment created with ID:', appointmentId);
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
    }
  };

  // 4. Example: Create a payment/invoice
  const handleCreatePayment = async () => {
    if (patients.length === 0) {
      alert('Create a patient first!');
      return;
    }

    try {
      const patient = patients[0];
      const paymentData = {
        patientId: patient.id,
        patient: patient.name,
        amount: 150,
        date: ServiceUtils.getToday(),
        invoiceDate: ServiceUtils.getToday(),
        dueDate: ServiceUtils.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
        status: 'pending' as const,
        method: 'cash' as const,
        category: 'consultation' as const,
        description: 'Medical consultation fee',
        currency: 'USD',
        isActive: true,
      };

      const paymentId = await PaymentService.createPayment(clinicId, paymentData);
      console.log('✅ Payment created with ID:', paymentId);
    } catch (error) {
      console.error('❌ Error creating payment:', error);
    }
  };

  // 5. Example: Set doctor schedule
  const handleSetDoctorSchedule = async () => {
    try {
      const doctorId = 'doctor-123';
      const scheduleData = {
        doctorName: 'Dr. Smith',
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        offDays: ['friday', 'saturday'],
        consultationDuration: 30,
        maxPatientsPerHour: 2,
        weeklySchedule: {
          [ServiceUtils.getToday()]: {
            isWorking: true,
            timeSlots: ['09:00', '09:30', '10:00', '10:30', '11:00'],
            notes: 'Regular schedule'
          }
        },
        specialty: 'General Medicine',
      };

      await ScheduleService.setDoctorSchedule(clinicId, doctorId, scheduleData);
      console.log('✅ Doctor schedule set for:', doctorId);
    } catch (error) {
      console.error('❌ Error setting doctor schedule:', error);
    }
  };

  // 6. Example: Add inventory item
  const handleAddInventoryItem = async () => {
    try {
      const itemData = {
        name: 'Paracetamol 500mg',
        description: 'Pain relief medication',
        category: 'medication' as const,
        type: 'tablet',
        quantity: 100,
        unit: 'tablets',
        minQuantity: 20,
        supplier: 'Medical Supplies Inc.',
        unitCost: 0.50,
        totalCost: 50.00,
        currency: 'USD',
        purchaseDate: ServiceUtils.getToday(),
        lastUpdated: ServiceUtils.getToday(),
        location: 'Pharmacy Storage',
        tags: ['pain relief', 'common'],
        isActive: true,
      };

      const itemId = await InventoryService.createItem(clinicId, itemData);
      console.log('✅ Inventory item created with ID:', itemId);
    } catch (error) {
      console.error('❌ Error creating inventory item:', error);
    }
  };

  // 7. Example: Search functionality
  const handleSearchPatients = async () => {
    try {
      const searchResults = await PatientService.searchPatients(clinicId, 'john');
      console.log('🔍 Search results:', searchResults);
    } catch (error) {
      console.error('❌ Error searching patients:', error);
    }
  };

  // 8. Example: Update appointment status
  const handleCompleteAppointment = async () => {
    if (appointments.length === 0) {
      alert('Create an appointment first!');
      return;
    }

    try {
      const appointment = appointments[0];
      await AppointmentService.completeAppointment(appointment.id, 'Patient consultation completed successfully');
      console.log('✅ Appointment marked as completed');
    } catch (error) {
      console.error('❌ Error completing appointment:', error);
    }
  };

  // 9. Example: Get statistics
  const handleGetStats = async () => {
    try {
      const [patientStats, appointmentStats, paymentStats, inventoryStats] = await Promise.all([
        PatientService.getPatientStats(clinicId),
        AppointmentService.getAppointmentStats(clinicId),
        PaymentService.getPaymentStats(clinicId),
        InventoryService.getInventoryStats(clinicId)
      ]);

      console.log('📊 Statistics:', {
        patients: patientStats,
        appointments: appointmentStats,
        payments: paymentStats,
        inventory: inventoryStats
      });
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
    }
  };

  if (loading) {
    return <div>Loading Firestore services...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔥 Firestore Services Usage Example</h1>
      <p>Open your browser console to see the service operations in action!</p>

      {/* Data Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>📊 Patients ({patients.length})</h3>
          {patients.slice(0, 3).map(patient => (
            <div key={patient.id} style={{ marginBottom: '10px' }}>
              <strong>{patient.name}</strong><br />
              <small>{patient.email} • {patient.status}</small>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>📅 Appointments ({appointments.length})</h3>
          {appointments.slice(0, 3).map(appointment => (
            <div key={appointment.id} style={{ marginBottom: '10px' }}>
              <strong>{appointment.patient}</strong><br />
              <small>{appointment.date} {appointment.time} • {appointment.status}</small>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>💰 Payments ({payments.length})</h3>
          {payments.slice(0, 3).map(payment => (
            <div key={payment.id} style={{ marginBottom: '10px' }}>
              <strong>{payment.patient}</strong><br />
              <small>${payment.amount} • {payment.status}</small>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>📦 Inventory ({inventory.length})</h3>
          {inventory.slice(0, 3).map(item => (
            <div key={item.id} style={{ marginBottom: '10px' }}>
              <strong>{item.name}</strong><br />
              <small>{item.quantity} {item.unit} • {item.status}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <h2>🎛️ Service Operations</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleCreatePatient} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          👤 Create Patient
        </button>
        
        <button onClick={handleCreateAppointment} style={{ padding: '10px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          📅 Create Appointment
        </button>
        
        <button onClick={handleCreatePayment} style={{ padding: '10px 15px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          💰 Create Payment
        </button>
        
        <button onClick={handleSetDoctorSchedule} style={{ padding: '10px 15px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🩺 Set Doctor Schedule
        </button>
        
        <button onClick={handleAddInventoryItem} style={{ padding: '10px 15px', backgroundColor: '#795548', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          📦 Add Inventory Item
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={handleSearchPatients} style={{ padding: '10px 15px', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🔍 Search Patients
        </button>
        
        <button onClick={handleCompleteAppointment} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          ✅ Complete Appointment
        </button>
        
        <button onClick={handleGetStats} style={{ padding: '10px 15px', backgroundColor: '#3F51B5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          📊 Get Statistics
        </button>
      </div>

      {/* Service Info */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>📚 Service Features</h2>
        <ul>
          <li><strong>Real-time listeners:</strong> All data updates automatically via Firestore onSnapshot</li>
          <li><strong>Offline support:</strong> Built-in Firestore offline persistence</li>
          <li><strong>Type safety:</strong> Full TypeScript interfaces for all entities</li>
          <li><strong>Error handling:</strong> Graceful error handling with fallbacks</li>
          <li><strong>Clinic isolation:</strong> All data scoped by clinicId</li>
          <li><strong>Soft deletes:</strong> Items marked as inactive instead of permanent deletion</li>
          <li><strong>Automatic timestamps:</strong> createdAt/updatedAt managed by Firestore</li>
          <li><strong>Search capabilities:</strong> Client-side filtering for complex searches</li>
          <li><strong>Batch operations:</strong> Efficient bulk data operations</li>
          <li><strong>Statistics:</strong> Built-in analytics and reporting functions</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceUsageExample; 