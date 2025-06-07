import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const AppointmentForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('book_edit_appointment')}</h2>
          <div className="p-8 bg-white rounded-lg shadow-md">
            <form className="space-y-6">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                  {t('patient_name')}
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                  {t('appointment_date')}
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
                  {t('appointment_time')}
                </label>
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {t('save_appointment')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentForm; 