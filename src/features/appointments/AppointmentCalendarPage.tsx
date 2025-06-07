import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const AppointmentModal: React.FC<{ isOpen: boolean; onClose: () => void; isEdit?: boolean }> = ({ isOpen, onClose, isEdit = false }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-xl">
        <h2 className="mb-6 text-xl font-bold text-primary">{isEdit ? t('edit_appointment') : t('create_appointment')}</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="patientName" className="block mb-2 text-sm font-medium text-gray-700">{t('patient_name')}</label>
            <input type="text" id="patientName" name="patientName" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-4">
            <label htmlFor="appointmentDate" className="block mb-2 text-sm font-medium text-gray-700">{t('appointment_date')}</label>
            <input type="date" id="appointmentDate" name="appointmentDate" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-4">
            <label htmlFor="appointmentTime" className="block mb-2 text-sm font-medium text-gray-700">{t('appointment_time')}</label>
            <input type="time" id="appointmentTime" name="appointmentTime" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-2 font-medium text-gray-700 bg-gray-200 rounded-md">{t('close')}</button>
            <button type="submit" className="px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary">{t('save_appointment')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AppointmentCalendarPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('appointment_calendar')}</h2>
            <button onClick={() => setModalOpen(true)} className="px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary">
              {t('create_appointment')}
            </button>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <p>Full calendar component will be here...</p>
          </div>
        </main>
        <AppointmentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
};

export default AppointmentCalendarPage; 