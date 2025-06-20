import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/navBar';
import Sidebar from '../../components/Sidebar';

const PatientDocs: React.FC = () => {
  const { t } = useTranslation();

  const documents = [
    { id: 1, name: 'Blood Test Results.pdf', uploadDate: '2024-07-10' },
    { id: 2, name: 'X-Ray Scan.jpg', uploadDate: '2024-06-25' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('patient_documents')}</h2>
            <button className="px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-secondary">
              {t('upload_document')}
            </button>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('document_name')}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{t('upload_date')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doc.uploadDate}</td>
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

export default PatientDocs; 