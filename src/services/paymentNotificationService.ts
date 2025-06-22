// Simple notification service focused on payment completion
export class PaymentNotificationService {
  private static instance: PaymentNotificationService;

  private constructor() {}

  public static getInstance(): PaymentNotificationService {
    if (!PaymentNotificationService.instance) {
      PaymentNotificationService.instance = new PaymentNotificationService();
    }
    return PaymentNotificationService.instance;
  }

  // Send payment completion notification
  public async notifyPaymentCompleted(paymentData: {
    patientName: string;
    amount: number;
    paymentId: string;
    method?: string;
  }): Promise<void> {
    const { patientName, amount, paymentId, method } = paymentData;
    
    console.log(`💰 PAYMENT COMPLETED: ${paymentId}`);
    console.log(`Patient: ${patientName}`);
    console.log(`Amount: ${amount} EGP`);
    console.log(`Method: ${method || 'Not specified'}`);
    
    // Send browser notification if supported
    await this.sendBrowserNotification({
      title: '💰 Payment Received!',
      message: `${patientName} paid ${amount} EGP (${paymentId})`,
      paymentData
    });

    // Send email notification (simulated)
    await this.sendEmailNotification(paymentData);

    // Log to console for immediate feedback
    this.logPaymentNotification(paymentData);
  }

  private async sendBrowserNotification(data: {
    title: string;
    message: string;
    paymentData: any;
  }): Promise<void> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('🔔 Browser notifications not supported');
        return;
      }

      // Request permission if needed
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const notification = new Notification(data.title, {
          body: data.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `payment-${data.paymentData.paymentId}`,
          requireInteraction: true, // Keeps notification visible until user interacts
        });

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        notification.onclick = () => {
          console.log('🔔 Payment notification clicked');
          notification.close();
        };

        console.log('✅ Browser notification sent successfully');
      } else {
        console.log('❌ Browser notification permission denied');
      }
    } catch (error) {
      console.error('❌ Failed to send browser notification:', error);
    }
  }

  private async sendEmailNotification(paymentData: {
    patientName: string;
    amount: number;
    paymentId: string;
    method?: string;
  }): Promise<void> {
    try {
      // Simulate email sending
      const emailContent = `
🏥 PAYMENT NOTIFICATION

A payment has been received:

Patient: ${paymentData.patientName}
Amount: ${paymentData.amount} EGP
Invoice ID: ${paymentData.paymentId}
Payment Method: ${paymentData.method || 'Not specified'}
Date: ${new Date().toLocaleString()}

This is an automated notification from your clinic management system.
      `;

      // In a real app, you would integrate with an email service here
      console.log('📧 Email notification (simulated):');
      console.log(emailContent);

      // Store in localStorage for demo purposes
      const emailLog = JSON.parse(localStorage.getItem('clinic_payment_email_log') || '[]');
      emailLog.unshift({
        timestamp: new Date().toISOString(),
        subject: `Payment Received - ${paymentData.paymentId}`,
        content: emailContent,
        paymentData,
        status: 'sent'
      });

      // Keep only last 10 emails
      if (emailLog.length > 10) {
        emailLog.splice(10);
      }

      localStorage.setItem('clinic_payment_email_log', JSON.stringify(emailLog));
      console.log('✅ Email notification logged');
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
    }
  }

  private logPaymentNotification(paymentData: {
    patientName: string;
    amount: number;
    paymentId: string;
    method?: string;
  }): void {
    // Store notification in localStorage for tracking
    const notificationLog = JSON.parse(localStorage.getItem('clinic_payment_notifications') || '[]');
    
    const notification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'payment_completed',
      title: 'Payment Received',
      message: `Payment of ${paymentData.amount} EGP received from ${paymentData.patientName}`,
      paymentData,
      read: false
    };

    notificationLog.unshift(notification);

    // Keep only last 50 notifications
    if (notificationLog.length > 50) {
      notificationLog.splice(50);
    }

    localStorage.setItem('clinic_payment_notifications', JSON.stringify(notificationLog));
    
    // Also show an alert for immediate feedback
    this.showPaymentAlert(paymentData);
  }

  private showPaymentAlert(paymentData: {
    patientName: string;
    amount: number;
    paymentId: string;
  }): void {
    // Show a temporary alert for immediate feedback
    const alertMessage = `💰 PAYMENT RECEIVED!\n\nPatient: ${paymentData.patientName}\nAmount: ${paymentData.amount} EGP\nInvoice: ${paymentData.paymentId}`;
    
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 24px; margin-right: 10px;">💰</span>
        <strong style="font-size: 16px;">Payment Received!</strong>
      </div>
      <div style="font-size: 14px; opacity: 0.9;">
        <div><strong>Patient:</strong> ${paymentData.patientName}</div>
        <div><strong>Amount:</strong> ${paymentData.amount} EGP</div>
        <div><strong>Invoice:</strong> ${paymentData.paymentId}</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    
    if (!document.querySelector('#payment-notification-styles')) {
      style.id = 'payment-notification-styles';
      document.head.appendChild(style);
    }
  }

  // Get notification history
  public getNotificationHistory(): any[] {
    return JSON.parse(localStorage.getItem('clinic_payment_notifications') || '[]');
  }

  // Get email log
  public getEmailLog(): any[] {
    return JSON.parse(localStorage.getItem('clinic_payment_email_log') || '[]');
  }

  // Test the notification system
  public async testPaymentNotification(): Promise<void> {
    await this.notifyPaymentCompleted({
      patientName: 'Test Patient',
      amount: 250,
      paymentId: `TEST-${Date.now()}`,
      method: 'Credit Card'
    });
  }
} 