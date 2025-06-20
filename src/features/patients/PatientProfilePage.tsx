import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/navBar';
import Sidebar from '../../components/Sidebar';

const ProfileTab: React.FC = () => <div>Profile details will be here.</div>;
const VisitsTab: React.FC = () => <div>Visits history will be here.</div>;

const DoctorNotesTab: React.FC = () => {
  const { t } = useTranslation();
  const notes = [
    { id: 1, text: 'Patient reported feeling better.', date: '2024-07-15' },
    { id: 2, text: 'Prescribed medication for flu symptoms.', date: '2024-07-10' },
  ];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{t('add_note')}</h3>
      <form>
        <textarea
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder={t('enter_note')}
        ></textarea>
        <button
          type="submit"
          className="mt-2 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary"
        >
          {t('save_note')}
        </button>
      </form>

      <h3 className="text-lg font-medium text-gray-900 my-6">{t('notes')}</h3>
      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className="p-4 bg-gray-100 rounded-md">
            <p>{note.text}</p>
            <p className="text-sm text-gray-500 mt-2">{note.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PatientProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: t('profile') },
    { id: 'visits', label: t('visits') },
    { id: 'doctor_notes', label: t('doctor_notes') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'visits':
        return <VisitsTab />;
      case 'doctor_notes':
        return <DoctorNotesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('patient_profile')}</h2>
          <div className="w-full">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-6">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientProfilePage; 