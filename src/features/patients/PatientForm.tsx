import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';

const PatientForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('add_edit_patient')}</h2>
          <div className="p-8 bg-white rounded-lg shadow-md">
            <form className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('first_name')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('last_name')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                  {t('date_of_birth')}
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientForm; 