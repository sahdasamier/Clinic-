import React from 'react';
import { useTranslation } from 'react-i18next';

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
  </div>
);

const AppointmentStats: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { title: t('appointments_today'), value: 15 },
    { title: t('new_patients'), value: 6 },
    { title: t('completed_appointments'), value: 9 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard key={index} title={stat.title} value={stat.value} />
      ))}
    </div>
  );
};

export default AppointmentStats; 