import React from 'react';
import { useTranslation } from 'react-i18next';

const ClinicForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-primary">{t('clinic_onboarding')}</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="clinicName" className="text-sm font-medium text-gray-700">
              {t('clinic_name')}
            </label>
            <input
              id="clinicName"
              name="clinicName"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="clinicAddress" className="text-sm font-medium text-gray-700">
              {t('clinic_address')}
            </label>
            <input
              id="clinicAddress"
              name="clinicAddress"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="clinicPhone" className="text-sm font-medium text-gray-700">
              {t('clinic_phone')}
            </label>
            <input
              id="clinicPhone"
              name="clinicPhone"
              type="tel"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="clinicEmail" className="text-sm font-medium text-gray-700">
              {t('clinic_email')}
            </label>
            <input
              id="clinicEmail"
              name="clinicEmail"
              type="email"
              required
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
    </div>
  );
};

export default ClinicForm; 