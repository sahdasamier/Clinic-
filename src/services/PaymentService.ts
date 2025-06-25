// Stub PaymentService to satisfy imports
// This can be expanded with actual payment functionality later

export interface Payment {
  id: string;
  patientId: string;
  patient?: string; // Legacy property for backward compatibility
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  date: string;
  method?: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export class PaymentService {
  // Stub method for listening to payment updates
  static listenPayments(clinicId: string, callback: (payments: Payment[]) => void): () => void {
    console.log('PaymentService.listenPayments called for clinic:', clinicId);
    
    // Return empty array for now
    callback([]);
    
    // Return unsubscribe function
    return () => {
      console.log('PaymentService listener unsubscribed');
    };
  }

  // Stub method for getting payments
  static async getPayments(clinicId: string): Promise<Payment[]> {
    console.log('PaymentService.getPayments called for clinic:', clinicId);
    return [];
  }

  // Stub method for getting payment statistics
  static async getPaymentStats(clinicId: string): Promise<PaymentStats> {
    console.log('PaymentService.getPaymentStats called for clinic:', clinicId);
    return {
      total: 0,
      paid: 0,
      pending: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };
  }

  // Updated createPayment method to match the calling pattern (clinicId, paymentData)
  static async createPayment(clinicId: string, paymentData: Omit<Payment, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('PaymentService.createPayment called for clinic:', clinicId);
    
    const paymentId = `payment_${Date.now()}`;
    
    // Return the payment ID as expected by the calling code
    return paymentId;
  }

  // Stub method for updating payment
  static async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    console.log('PaymentService.updatePayment called for:', paymentId);
    
    // Return a stub payment
    return {
      id: paymentId,
      patientId: '',
      patient: '',
      amount: 0,
      status: 'pending',
      date: new Date().toISOString(),
      clinicId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates,
    };
  }

  // Stub method for deleting payment
  static async deletePayment(paymentId: string): Promise<void> {
    console.log('PaymentService.deletePayment called for:', paymentId);
  }
} 