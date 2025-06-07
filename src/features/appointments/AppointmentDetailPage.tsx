import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const AppointmentDetailPage: React.FC = () => {
  const { t } = useTranslation();

  const appointment = {
    patient: 'Ali Ahmed',
    date: '2024-07-20',
    time: '10:30 AM',
    doctor: 'Dr. Smith',
    status: 'Confirmed',
    notes: 'Patient is coming for a regular check-up.',
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('appointment_details')}</h2>
          <div className="p-8 bg-white rounded-lg shadow-md">
            <p className="mb-2"><span className="font-bold">{t('patient')}:</span> {appointment.patient}</p>
            <p className="mb-2"><span className="font-bold">{t('date')}:</span> {appointment.date}</p>
            <p className="mb-2"><span className="font-bold">{t('time')}:</span> {appointment.time}</p>
            <p className="mb-2"><span className="font-bold">{t('doctor')}:</span> {appointment.doctor}</p>
            <p className="mb-2"><span className="font-bold">{t('status')}:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t(appointment.status.toLowerCase())}</span></p>
            <p><span className="font-bold">{t('notes')}:</span> {appointment.notes}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentDetailPage; 