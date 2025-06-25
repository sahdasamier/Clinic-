import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  PatientService,
  AppointmentService,
  PaymentService,
  ServiceUtils,
  type Patient,
  type Appointment,
  type Payment
} from '../services';

interface RefactoredUIExampleProps {
  clinicId: string;
}

// ✅ Example: Refactored component using Firestore services instead of localStorage
const RefactoredUIExample: React.FC<RefactoredUIExampleProps> = ({ clinicId }) => {
  // ✅ NEW: Real-time state using Firestore listeners
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // UI state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, message: '', severity: 'success' 
  });

  // ✅ NEW: Set up real-time Firestore listeners instead of localStorage loading
  useEffect(() => {
    console.log('🔗 Setting up Firestore listeners for clinic:', clinicId);

    // Listen to patients
    const unsubscribePatients = PatientService.listenPatients(clinicId, (updatedPatients) => {
      console.log('👥 Patients updated:', updatedPatients.length);
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

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Firestore listeners...');
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribePayments();
    };
  }, [clinicId]);

  // ✅ NEW: Create patient using Firestore service instead of localStorage
  const handleCreatePatient = async () => {
    if (!newPatientName.trim()) return;

    setLoading(true);
    try {
      const patientData = {
        name: newPatientName,
        email: newPatientEmail,
        status: 'new' as const,
        avatar: ServiceUtils.generateAvatar(newPatientName),
        isActive: true,
      };

      // OLD WAY (localStorage):
      // const newPatient = { ...patientData, id: Date.now() };
      // const updatedPatients = [...patients, newPatient];
      // localStorage.setItem('patients', JSON.stringify(updatedPatients));
      // setPatients(updatedPatients);

      // ✅ NEW WAY (Firestore service):
      const patientId = await PatientService.createPatient(clinicId, patientData);
      console.log('✅ Patient created with ID:', patientId);
      
      // ✅ State updates automatically via real-time listener - no manual state update needed!
      
      setAddPatientOpen(false);
      setNewPatientName('');
      setNewPatientEmail('');
      setSnackbar({ open: true, message: 'Patient created successfully!', severity: 'success' });
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      setSnackbar({ open: true, message: 'Failed to create patient', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Update patient using Firestore service instead of localStorage
  const handleUpdatePatientStatus = async (patient: Patient, newStatus: Patient['status']) => {
    try {
      // OLD WAY (localStorage):
      // const updatedPatients = patients.map(p => 
      //   p.id === patient.id ? { ...p, status: newStatus } : p
      // );
      // localStorage.setItem('patients', JSON.stringify(updatedPatients));
      // setPatients(updatedPatients);

      // ✅ NEW WAY (Firestore service):
      await PatientService.updatePatient(patient.id, { status: newStatus });
      console.log('✅ Patient status updated');
      
      // ✅ State updates automatically via real-time listener!
      
      setSnackbar({ open: true, message: 'Patient status updated!', severity: 'success' });
    } catch (error) {
      console.error('❌ Error updating patient:', error);
      setSnackbar({ open: true, message: 'Failed to update patient', severity: 'error' });
    }
  };

  // ✅ NEW: Create appointment using Firestore service
  const handleCreateAppointment = async (patient: Patient) => {
    try {
      const appointmentData = {
        patientId: patient.id,
        patient: patient.name,
        doctor: 'Dr. Smith',
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

      // OLD WAY (localStorage):
      // const newAppointment = { ...appointmentData, id: Date.now() };
      // const updatedAppointments = [...appointments, newAppointment];
      // localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      // setAppointments(updatedAppointments);

      // ✅ NEW WAY (Firestore service):
      const appointmentId = await AppointmentService.createAppointment(clinicId, appointmentData);
      console.log('✅ Appointment created with ID:', appointmentId);
      
      setSnackbar({ open: true, message: 'Appointment scheduled!', severity: 'success' });
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      setSnackbar({ open: true, message: 'Failed to create appointment', severity: 'error' });
    }
  };

  // ✅ NEW: Create payment using Firestore service
  const handleCreatePayment = async (patient: Patient) => {
    try {
      const paymentData = {
        patientId: patient.id,
        patient: patient.name,
        amount: 150,
        date: ServiceUtils.getToday(),
        invoiceDate: ServiceUtils.getToday(),
        dueDate: ServiceUtils.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: 'pending' as const,
        method: 'cash' as const,
        category: 'consultation' as const,
        description: 'Medical consultation fee',
        currency: 'USD',
        isActive: true,
      };

      // OLD WAY (localStorage):
      // const newPayment = { ...paymentData, id: Date.now(), invoiceId: `INV-${Date.now()}` };
      // const updatedPayments = [...payments, newPayment];
      // localStorage.setItem('payments', JSON.stringify(updatedPayments));
      // setPayments(updatedPayments);

      // ✅ NEW WAY (Firestore service):
      const paymentId = await PaymentService.createPayment(clinicId, paymentData);
      console.log('✅ Payment created with ID:', paymentId);
      
      setSnackbar({ open: true, message: 'Invoice created!', severity: 'success' });
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      setSnackbar({ open: true, message: 'Failed to create invoice', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔥 Refactored UI with Firestore Services
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This component demonstrates the <strong>before</strong> and <strong>after</strong> of refactoring 
        from localStorage to Firestore services. All data updates happen in real-time!
      </Typography>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={() => setAddPatientOpen(true)}
          disabled={loading}
        >
          Add Patient
        </Button>
      </Box>

      {/* Data Display */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {/* Patients */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              👥 Patients ({patients.length})
            </Typography>
            <List dense>
              {patients.slice(0, 5).map((patient) => (
                <ListItem key={patient.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={patient.name}
                    secondary={`${patient.email || 'No email'} • ${patient.status}`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => handleUpdatePatientStatus(patient, 'follow-up')}
                      disabled={patient.status === 'follow-up'}
                    >
                      Follow-up
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleCreateAppointment(patient)}
                    >
                      Schedule
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleCreatePayment(patient)}
                    >
                      Invoice
                    </Button>
                  </Box>
                </ListItem>
              ))}
              {patients.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No patients yet. Create one to see real-time updates!
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📅 Appointments ({appointments.length})
            </Typography>
            <List dense>
              {appointments.slice(0, 5).map((appointment) => (
                <ListItem key={appointment.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={appointment.patient}
                    secondary={`${appointment.date} ${appointment.time} • ${appointment.status}`}
                  />
                </ListItem>
              ))}
              {appointments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No appointments yet.
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💰 Payments ({payments.length})
            </Typography>
            <List dense>
              {payments.slice(0, 5).map((payment) => (
                <ListItem key={payment.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={payment.patient}
                    secondary={`$${payment.amount} • ${payment.status}`}
                  />
                </ListItem>
              ))}
              {payments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No payments yet.
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Add Patient Dialog */}
      <Dialog open={addPatientOpen} onClose={() => setAddPatientOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Patient Name"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email (optional)"
            value={newPatientEmail}
            onChange={(e) => setNewPatientEmail(e.target.value)}
            margin="normal"
            type="email"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPatientOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreatePatient} 
            variant="contained"
            disabled={!newPatientName.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create Patient'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Code comparison */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📝 Code Comparison
        </Typography>
        
        <Typography variant="subtitle2" color="error" gutterBottom>
          ❌ OLD WAY (localStorage):
        </Typography>
        <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontSize: '0.8rem', overflow: 'auto' }}>
{`// Load data
const [patients, setPatients] = useState(() => {
  const saved = localStorage.getItem('patients');
  return saved ? JSON.parse(saved) : [];
});

// Create patient
const newPatient = { ...patientData, id: Date.now() };
const updatedPatients = [...patients, newPatient];
localStorage.setItem('patients', JSON.stringify(updatedPatients));
setPatients(updatedPatients); // Manual state update`}
        </Box>

        <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ mt: 2 }}>
          ✅ NEW WAY (Firestore services):
        </Typography>
        <Box component="pre" sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1, fontSize: '0.8rem', overflow: 'auto' }}>
{`// Real-time data
const [patients, setPatients] = useState([]);
useEffect(() => {
  const unsubscribe = PatientService.listenPatients(clinicId, setPatients);
  return unsubscribe; // Auto cleanup
}, [clinicId]);

// Create patient
const patientId = await PatientService.createPatient(clinicId, patientData);
// State updates automatically via listener! 🎉`}
        </Box>
      </Box>
    </Box>
  );
};

export default RefactoredUIExample; 