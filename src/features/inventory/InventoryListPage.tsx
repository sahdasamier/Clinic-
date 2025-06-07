import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const InventoryListPage: React.FC = () => {
  const { t } = useTranslation();

  const inventoryItems = [
    { id: 1, name: 'Surgical Masks', quantity: 500, supplier: 'MedSupplies Inc.', lastUpdated: '2024-07-15' },
    { id: 2, name: 'Gloves', quantity: 1000, supplier: 'Healthcare Essentials', lastUpdated: '2024-07-14' },
    { id: 3, name: 'Syringes', quantity: 250, supplier: 'MedSupplies Inc.', lastUpdated: '2024-07-15' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('inventory_list')}</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('item_name')}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('quantity')}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('supplier')}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('last_updated')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.lastUpdated}</td>
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

export default InventoryListPage; 