import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'; // Assuming react-router-dom is used
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if your firebase.ts is elsewhere
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import { Patient } from './types'; // Assuming Patient type is defined here
// You might need a User type for the doctor, or use relevant fields from your AuthContext User type
// For now, we'll assume doctor has at least firstName and lastName
interface Doctor {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  // Add other relevant doctor fields
}

interface ProfileTabProps {
  patient: Patient | null;
  doctor: Doctor | null;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ patient, doctor }) => {
  const { t } = useTranslation();
  if (!patient) {
    return <div>{t('patient_not_found')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{t('personal_information')}</h3>
        <div className="mt-5 border-t border-gray-200 pt-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('full_name')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.name || `${patient.firstName} ${patient.lastName}`}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('age')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.age}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('gender')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('phone')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.phone}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('email')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('address')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.address}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{t('medical_information')}</h3>
        <div className="mt-5 border-t border-gray-200 pt-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('assigned_doctor')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {doctor ? `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || t('not_assigned') : t('not_assigned')}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('current_condition')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.condition}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('status')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.status}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">{t('blood_type')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.bloodType}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">{t('allergies')}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.allergies?.join(', ') || t('none_reported')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; // Added Firestore query imports
import { Appointment } from '../appointments/AppointmentForm'; // Assuming Appointment type can be imported

// Interface for categorized appointments
interface CategorizedAppointments {
  lastVisit: Appointment | null;
  todays: Appointment[];
  nextAppointment: Appointment | null;
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; // Added MUI imports for Dialog
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material'; // Icon for the button


// Assuming from types.ts or similar - this might need to be imported from a shared location
export interface AppointmentDataForProfile {
  date: string;
  time: string;
  type: string;
  duration: string;
  notes: string;
  priority: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
}

const defaultAppointmentDataForProfile: AppointmentDataForProfile = {
  date: '',
  time: '',
  type: 'Follow-up',
  duration: '30',
  notes: '',
  priority: 'Normal',
};


}

const VisitsTab: React.FC<{ appointments: CategorizedAppointments, patientName: string }> = ({ appointments, patientName }) => {
  const { t } = useTranslation();

  const formatDate = (date: any) => {
    if (!date) return t('not_available');
    let jsDate: Date;
    if (date instanceof Timestamp) {
      jsDate = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      jsDate = new Date(date);
    } else {
      return t('invalid_date');
    }
    return jsDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t('appointment_summary_for')} {patientName}
        </h3>
        <div className="mt-5 border-t border-gray-200 pt-5">
          <dl className="space-y-8">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('last_visit')}</dt>
              {appointments.lastVisit ? (
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(appointments.lastVisit.dateTime)} - {appointments.lastVisit.type} ({t('status')}: {appointments.lastVisit.status})
                  {appointments.lastVisit.doctorName && ` - ${t('with')} Dr. ${appointments.lastVisit.doctorName}`}
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-500">{t('no_completed_visits_found')}</dd>
              )}
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t('todays_appointments')}</dt>
              {appointments.todays.length > 0 ? (
                appointments.todays.map((appt, index) => (
                  <dd key={index} className="mt-1 text-sm text-gray-900">
                    {formatDate(appt.dateTime)} - {appt.type} ({t('status')}: {appt.status})
                    {appt.doctorName && ` - ${t('with')} Dr. ${appt.doctorName}`}
                  </dd>
                ))
              ) : (
                <dd className="mt-1 text-sm text-gray-500">{t('no_appointments_today')}</dd>
              )}
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t('next_appointment')}</dt>
              {appointments.nextAppointment ? (
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(appointments.nextAppointment.dateTime)} - {appointments.nextAppointment.type} ({t('status')}: {appointments.nextAppointment.status})
                  {appointments.nextAppointment.doctorName && ` - ${t('with')} Dr. ${appointments.nextAppointment.doctorName}`}
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-gray-500">{t('no_upcoming_appointments_scheduled')}</dd>
              )}
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};


const DoctorNotesTab: React.FC = () => {
  const { t } = useTranslation();
  // This should also be fetched data eventually
  const notes = [
    { id: 1, text: 'Patient reported feeling better.', date: '2024-07-15' },
    { id: 2, text: 'Prescribed medication for flu symptoms.', date: '2024-07-10' },
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{t('add_note')}</h3>
      <form>
        <textarea
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder={t('enter_note')}
        ></textarea>
        <button
          type="submit"
          className="mt-2 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary"
        >
          {t('save_note')}
        </button>
      </form>

      <h3 className="text-lg font-medium text-gray-900 my-6">{t('notes')}</h3>
      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className="p-4 bg-gray-100 rounded-md">
            <p>{note.text}</p>
            <p className="text-sm text-gray-500 mt-2">{note.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PatientProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { patientId } = useParams<{ patientId: string }>(); // Get patientId from URL
  const [activeTab, setActiveTab] = useState('profile');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [categorizedAppointments, setCategorizedAppointments] = useState<CategorizedAppointments>({
    lastVisit: null,
    todays: [],
    nextAppointment: null,
  });
  const [loadingPatient, setLoadingPatient] = useState<boolean>(true);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for scheduling appointment modal
  const [scheduleAppointmentOpen, setScheduleAppointmentOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentDataForProfile>(defaultAppointmentDataForProfile);
  // We use `patient` state for the patient being scheduled for.

  // Assuming availableDoctors list would be fetched or available from a context for the dropdown
  // For now, this is a placeholder. In a real app, this would come from UserContext or a dedicated doctors fetch.
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Placeholder: Fetch available doctors for the dropdown.
    // In a real app, this might be part of a UserContext or a separate fetch.
    // This is simplified for now.
    const fetchDoctors = async () => {
        try {
            // Example: Fetch users with role 'doctor' from the current clinic
            // This requires clinicId to be known, e.g., from patient.clinicId or a user context
            if (patient?.clinicId) {
                const q = query(collection(db, 'users'), where('clinicId', '==', patient.clinicId), where('role', '==', 'doctor'));
                const snapshot = await getDocs(q);
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
                setAvailableDoctors(docs);
            }
        } catch (err) {
            console.error("Failed to fetch doctors for dropdown:", err);
        }
    };
    if (patient?.clinicId) { // Fetch doctors once patient data (and thus clinicId) is available
        fetchDoctors();
    }
  }, [patient]);


  useEffect(() => {
    if (!patientId) {
      setError(t('no_patient_id_provided'));
      setLoadingPatient(false);
      setLoadingAppointments(false);
      return;
    }

    const fetchPatientAndAppointments = async () => {
      setLoadingPatient(true);
      setLoadingAppointments(true);
      setError(null);
      let currentPatient: Patient | null = null;

      try {
        // Fetch patient data
        const patientDocRef = doc(db, 'patients', patientId);
        const patientDocSnap = await getDoc(patientDocRef);

        if (patientDocSnap.exists()) {
          currentPatient = { id: patientDocSnap.id, ...patientDocSnap.data() } as Patient;
          setPatient(currentPatient);

          if (currentPatient.assignedDoctorId) {
            const doctorDocRef = doc(db, 'users', currentPatient.assignedDoctorId);
            const doctorDocSnap = await getDoc(doctorDocRef);
            if (doctorDocSnap.exists()) {
              setDoctor({ id: doctorDocSnap.id, ...doctorDocSnap.data() } as Doctor);
            } else {
              console.warn(`Doctor with ID ${currentPatient.assignedDoctorId} not found.`);
              setDoctor(null);
            }
          } else {
            setDoctor(null);
          }
        } else {
          setError(t('patient_not_found'));
          setPatient(null);
          setDoctor(null);
          setLoadingPatient(false);
          setLoadingAppointments(false);
          return;
        }
      } catch (e) {
        console.error("Error fetching patient data: ", e);
        setError(t('error_fetching_patient_data'));
        setPatient(null);
        setDoctor(null);
      } finally {
        setLoadingPatient(false);
      }

      // Fetch and process appointments if patient was found
      if (currentPatient && currentPatient.clinicId) {
        try {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

          const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('patientId', '==', patientId),
            where('clinicId', '==', currentPatient.clinicId), // Ensure clinicId is part of patient data or available from context
            orderBy('dateTime', 'asc') // Fetch sorted by date
          );

          const querySnapshot = await getDocs(appointmentsQuery);
          const allAppointments: Appointment[] = [];
          querySnapshot.forEach((doc) => {
            allAppointments.push({ id: doc.id, ...doc.data() } as Appointment);
          });

          let lastVisit: Appointment | null = null;
          const todays: Appointment[] = [];
          let nextAppointment: Appointment | null = null;

          // Sort descending for last visit
          const completedAppointments = allAppointments
            .filter(appt => appt.status === 'completed' && (appt.dateTime as Timestamp).toDate() < now)
            .sort((a, b) => (b.dateTime as Timestamp).toDate().getTime() - (a.dateTime as Timestamp).toDate().getTime());
          if (completedAppointments.length > 0) {
            lastVisit = completedAppointments[0];
          }

          for (const appt of allAppointments) {
            const apptDate = (appt.dateTime as Timestamp).toDate();
            // Today's appointments
            if (apptDate >= todayStart && apptDate < todayEnd) {
              todays.push(appt);
            }
            // Next appointment (earliest after now that is scheduled/confirmed)
            if (apptDate > now && (appt.status === 'scheduled' || appt.status === 'confirmed')) {
              if (!nextAppointment || apptDate < (nextAppointment.dateTime as Timestamp).toDate()) {
                nextAppointment = appt;
              }
            }
          }
          todays.sort((a,b) => (a.dateTime as Timestamp).toDate().getTime() - (b.dateTime as Timestamp).toDate().getTime());


          setCategorizedAppointments({ lastVisit, todays, nextAppointment });

        } catch (e) {
          console.error("Error fetching appointments: ", e);
          // Not setting main error, just logging, as patient profile might still be useful
        } finally {
          setLoadingAppointments(false);
        }
      } else {
        setLoadingAppointments(false); // No patient or clinicId to fetch appointments
      }
    };

    fetchPatientAndAppointments();
  }, [patientId, t]); // patient is removed from dependency array to avoid re-fetching doctors infinitely

  const handleScheduleNewAppointmentFromProfile = () => {
    if (!patient) return;

    setAppointmentData({
      ...defaultAppointmentDataForProfile,
      patientId: patient.id,
      patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor?.id || '', // Pre-fill with assigned doctor's ID
      doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}`.trim() : '', // Pre-fill with assigned doctor's name
    });
    setScheduleAppointmentOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!patient || !appointmentData.date || !appointmentData.time) {
      alert(t('please_fill_required_appointment_fields'));
      return;
    }
    // Basic validation
    if (!appointmentData.doctorId) {
        alert(t('please_select_doctor'));
        return;
    }

    try {
      const appointmentToSave = {
        ...appointmentData,
        clinicId: patient.clinicId, // Assuming patient object has clinicId
        dateTime: Timestamp.fromDate(new Date(`${appointmentData.date}T${appointmentData.time}`)),
        status: 'scheduled', // Default status
        // Remove temporary fields not part of Appointment model before saving
      };
      delete appointmentToSave.patientName; // Not part of Appointment model usually
      // doctorName is also often denormalized or fetched, not directly part of core appointment model to save

      // console.log("Saving appointment: ", appointmentToSave);
      // Replace with actual Firebase save logic using addDoc or setDoc
      // await addDoc(collection(db, 'appointments'), appointmentToSave);

      alert(t('appointment_scheduled_successfully')); // Replace with actual success handling
      setScheduleAppointmentOpen(false);
      // Optionally, re-fetch appointments for the visits tab or rely on real-time updates if implemented
    } catch (error) {
      console.error("Error scheduling appointment: ", error);
      alert(t('error_scheduling_appointment'));
    }
  };


  const tabs = [
    { id: 'profile', label: t('profile') },
    { id: 'visits', label: t('visits') }, // This will be for Last visit, today's, next
    { id: 'doctor_notes', label: t('doctor_notes') },
    // Consider adding more tabs like 'Medical History', 'Medications' if needed
  ];

  const renderContent = () => {
    if (loadingPatient) {
      return <div className="text-center p-10">{t('loading_patient_details')}</div>;
    }
    if (error) { // Main error, e.g., patient not found
      return <div className="text-center p-10 text-red-500">{error}</div>;
    }
    if (!patient) {
      return <div className="text-center p-10">{t('patient_data_unavailable')}</div>;
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileTab patient={patient} doctor={doctor} />;
      case 'visits':
        if (loadingAppointments) {
          return <div className="text-center p-10">{t('loading_appointments')}</div>;
        }
        return <VisitsTab appointments={categorizedAppointments} patientName={patient.name || `${patient.firstName} ${patient.lastName}`} />;
      case 'doctor_notes':
        return <DoctorNotesTab />; // This also needs to be dynamic
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar and Header are assumed to be part of the layout and not directly managed here for data fetching */}
      {/* <Sidebar /> */}
      {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
      {/* <Header /> */}
      {/* <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6"> */}

      {/* If Sidebar and Header are part of this component's render, they should remain. */}
      {/* For now, focusing on the main content area for patient profile */}

      {/* Simplified structure for now, assuming routing handles Sidebar/Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {patient ? `${patient.name || `${patient.firstName} ${patient.lastName}`}'s Profile` : t('patient_profile')}
        </h2>
        {patient && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalendarTodayIcon />}
            onClick={handleScheduleNewAppointmentFromProfile}
            sx={{ backgroundColor: 'var(--primary-color, #1976d2)'}}
          >
            {t('schedule_appointment')}
          </Button>
        )}
      </div>
      <div className="w-full">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-6">{renderContent()}</div>
      </div>

      {/* Schedule Appointment Dialog */}
      <Dialog open={scheduleAppointmentOpen} onClose={() => setScheduleAppointmentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('schedule_new_appointment_for')} {patient?.name || `${patient?.firstName} ${patient?.lastName}`}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('date')}
                type="date"
                fullWidth
                value={appointmentData.date}
                onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('time')}
                type="time"
                fullWidth
                value={appointmentData.time}
                onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="doctor-select-label">{t('doctor')}</InputLabel>
                <Select
                  labelId="doctor-select-label"
                  value={appointmentData.doctorId || ''}
                  label={t('doctor')}
                  onChange={(e) => {
                    const selectedDoctorId = e.target.value as string;
                    const selectedDoc = availableDoctors.find(d => d.id === selectedDoctorId);
                    setAppointmentData({
                        ...appointmentData,
                        doctorId: selectedDoctorId,
                        doctorName: selectedDoc ? `${selectedDoc.firstName} ${selectedDoc.lastName}`.trim() : ''
                    });
                  }}
                >
                  <MenuItem value=""><em>{t('select_doctor')}</em></MenuItem>
                  {availableDoctors.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      {`Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('appointment_type')}
                fullWidth
                value={appointmentData.type}
                onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('duration_minutes')}
                type="number"
                fullWidth
                value={appointmentData.duration}
                onChange={(e) => setAppointmentData({ ...appointmentData, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('notes_optional')}
                multiline
                rows={3}
                fullWidth
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleAppointmentOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleSaveAppointment} variant="contained" color="primary" sx={{ backgroundColor: 'var(--primary-color, #1976d2)'}}>
            {t('schedule')}
          </Button>
        </DialogActions>
      </Dialog>
      {/* </main> */}
      {/* </div> */}
    </div>
  );
};

export default PatientProfilePage; 