import React from 'react';
import { useTranslation } from 'react-i18next';

const UpcomingAppointments: React.FC = () => {
  const { t } = useTranslation();

  const appointments = [
    { id: 1, patient: 'Ali Ahmed', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, patient: 'Fatima Al-Fassi', time: '11:30 AM', status: 'Pending' },
    { id: 3, patient: 'Youssef El-Masri', time: '02:00 PM', status: 'Confirmed' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{t('upcoming_appointments')}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('patient')}</th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('time')}</th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.patient}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {t(appointment.status.toLowerCase())}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingAppointments; 