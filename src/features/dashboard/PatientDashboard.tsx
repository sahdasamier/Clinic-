import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('patient_dashboard')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Next Appointment */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">{t('next_appointment')}</h3>
                        <p className="mt-4">{t('date')}: 2024-07-20</p>
          <p>{t('time')}: 10:30 AM</p>
          <p>{t('doctor')}: Dr. Smith</p>
            </div>

            {/* Medical Records */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">{t('medical_records')}</h3>
              <p className="mt-4">{t('view_records')}</p>
              <Link to="/patient/records">
                <button className="w-full mt-4 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary">
                  {t('view_records')}
                </button>
              </Link>
            </div>

            {/* Billing Information */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">{t('billing_information')}</h3>
              <p className="mt-4">{t('view_billing')}</p>
              <Link to="/patient/billing">
                <button className="w-full mt-4 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary">
                  {t('view_billing')}
                </button>
              </Link>
            </div>

            {/* Loyalty Program */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900">{t('loyalty_program')}</h3>
              <p className="mt-4">{t('view_loyalty_status')}</p>
               <Link to="/patient/loyalty">
                <button className="w-full mt-4 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary">
                  {t('view_loyalty_status')}
                </button>
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard; 