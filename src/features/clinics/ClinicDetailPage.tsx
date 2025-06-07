import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const ClinicDetailPage: React.FC = () => {
  const { t } = useTranslation();

  const clinic = {
    name: 'Al-Shifa Clinic',
    address: '123 Health St, Dubai, UAE',
    phone: '+971 4 123 4567',
    email: 'contact@alshifa.ae',
    operatingHours: 'Sun-Thu, 9:00 AM - 6:00 PM',
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('clinic_details')}</h2>
          <div className="p-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-4">{clinic.name}</h3>
            <p className="text-gray-600 mb-2">{clinic.address}</p>
            <p className="text-gray-600 mb-2">{t('phone')}: {clinic.phone}</p>
            <p className="text-gray-600 mb-2">{t('email')}: {clinic.email}</p>
            <p className="text-gray-600">{t('operating_hours')}: {clinic.operatingHours}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClinicDetailPage; 