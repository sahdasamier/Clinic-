import React from 'react';
import { useTranslation } from 'react-i18next';

const LowStockAlert: React.FC = () => {
  const { t } = useTranslation();

  const lowStockItems = [
    { id: 1, name: 'Band-Aids', quantity: 20 },
    { id: 2, name: 'Antiseptic Wipes', quantity: 15 },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-accent mb-4">{t('low_stock_alerts')}</h3>
      <div className="space-y-4">
        {lowStockItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-red-50 rounded-md">
            <p className="text-red-700">{item.name}</p>
            <p className="font-bold text-red-700">{item.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert; 