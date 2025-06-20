import React from 'react';
import Header from '../../components/navBar';
import Sidebar from '../../components/Sidebar';
import PatientProfilePage from './PatientProfilePage';

const PatientDetailPage: React.FC = () => {

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <PatientProfilePage />
        </main>
      </div>
    </div>
  );
};

export default PatientDetailPage; 