import React from 'react';
import { useTranslation } from 'react-i18next';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();

  const invitedStaff = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', status: 'Pending' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', status: 'Joined' },
  ];

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6">{t('invite_staff')}</h2>
        <div className="p-8 mb-6 bg-white rounded-lg shadow-md">
          <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                {t('first_name')}
              </label>
              <input type="text" id="firstName" name="firstName" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                {t('last_name')}
              </label>
              <input type="text" id="lastName" name="lastName" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input type="email" id="email" name="email" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                {t('role')}
              </label>
              <select id="role" name="role" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                <option>{t('doctor')}</option>
                <option>{t('receptionist')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                {t('send_invite')}
              </button>
            </div>
          </form>
        </div>

        <h2 className="text-2xl font-bold text-primary mb-6">{t('invited_staff')}</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('name')}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('email')}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitedStaff.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{staff.firstName} {staff.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {t(staff.status.toLowerCase())}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 