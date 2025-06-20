import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';

const PaymentDetailPage: React.FC = () => {
  const { t } = useTranslation();

  const payment = {
    invoiceId: 'INV-001',
    patient: 'Ali Ahmed',
    amount: '$250.00',
    date: '2024-07-15',
    status: 'Paid',
    paymentMethod: 'Credit Card',
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('payment_details')}</h2>
          <div className="p-8 bg-white rounded-lg shadow-md">
            <p className="mb-2"><span className="font-bold">{t('invoice_id')}:</span> {payment.invoiceId}</p>
            <p className="mb-2"><span className="font-bold">{t('patient')}:</span> {payment.patient}</p>
            <p className="mb-2"><span className="font-bold">{t('amount')}:</span> {payment.amount}</p>
            <p className="mb-2"><span className="font-bold">{t('date')}:</span> {payment.date}</p>
            <p className="mb-2"><span className="font-bold">{t('status')}:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t(payment.status.toLowerCase())}</span></p>
            <p><span className="font-bold">{t('payment_method')}:</span> {payment.paymentMethod}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentDetailPage; 