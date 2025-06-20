import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';

const ClinicListPage: React.FC = () => {
  const { t } = useTranslation();

  const clinics = [
    { id: 1, name: 'Al-Shifa Clinic', address: '15 شارع النيل، وسط البلد، القاهرة', phone: '+20 2 2345 6789' },
    { id: 2, name: 'Nour Clinic', address: '25 شارع الحرية، الزمالك، القاهرة', phone: '+20 2 3456 7890' },
    { id: 3, name: 'The Modern Clinic', address: '10 شارع الجيزة، المهندسين، الجيزة', phone: '+20 2 4567 8901' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('clinic_list')}</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('clinic_name')}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('address')}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('phone')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{clinic.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{clinic.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{clinic.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClinicListPage; 