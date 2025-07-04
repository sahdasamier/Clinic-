// src/pages/Dashboard.tsx
import React from 'react';
import { useAppointments } from '../contexts/AppointmentContext';

const Dashboard: React.FC = () => {
  const { appointments, loading } = useAppointments();

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return <div>No appointments found.</div>;
  }

  return (
    <div>
      <h1>All Appointments</h1>
      <ul>
        {appointments.map(appt => (
          <li key={appt.id}>
            <strong>ID:</strong> {appt.id}
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(appt, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
