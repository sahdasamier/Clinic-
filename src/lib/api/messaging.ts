import { getMessaging, getToken, onMessage, MessagePayload, isSupported } from 'firebase/messaging';
import { firebaseManager } from './../firebase/legacy-compat';

// Lazy initialization of messaging
let messaging: any = null;
let isMessagingSupported = false;

const getMessagingInstance = async () => {
  // Check if messaging is supported
  if (!isMessagingSupported) {
    try {
      isMessagingSupported = await isSupported();
      if (!isMessagingSupported) {
        console.warn('Firebase Messaging not supported in this environment');
        return null;
      }
    } catch (error) {
      console.warn('Error checking messaging support:', error);
      return null;
    }
  }
  
  if (!messaging) {
    try {
      messaging = await firebaseManager.getMessaging();
    } catch (error) {
      console.warn('Messaging not available:', error);
      return null;
    }
  }
  return messaging;
};

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
}

export interface FCMToken {
  token: string;
  timestamp: number;
  userAgent: string;
}

export const MessagingService = {
  // Initialize push notifications and get FCM token
  initializeMessaging: async (): Promise<string | null> => {
    try {
      const messagingInstance = await getMessagingInstance();
      if (!messagingInstance) {
        console.warn('Messaging service not available');
        return null;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getToken(messagingInstance, {
        vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY
      });

      if (token) {
        console.log('FCM Token generated:', token);
        
        // Save token to localStorage for reference
        const tokenData: FCMToken = {
          token,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };
        localStorage.setItem('fcm_token', JSON.stringify(tokenData));
        
        return token;
      } else {
        console.warn('Failed to generate FCM token');
        return null;
      }
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      return null;
    }
  },

  // Get stored FCM token
  getStoredToken: (): FCMToken | null => {
    try {
      const stored = localStorage.getItem('fcm_token');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Listen for foreground messages
  onMessageListener: (): Promise<MessagePayload> => {
    return new Promise((resolve) => {
      getMessagingInstance().then((messagingInstance) => {
        if (!messagingInstance) {
          console.warn('Messaging service not available for message listener');
          return;
        }

        onMessage(messagingInstance, (payload) => {
          console.log('Foreground message received:', payload);
          
          // Show browser notification if the app is in focus
          if (payload.notification) {
            MessagingService.showBrowserNotification(payload.notification);
          }
          
          resolve(payload);
        });
      });
    });
  },

  // Show browser notification
  showBrowserNotification: (notification: any, data?: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const { title, body, icon, image } = notification;
      
      const notificationOptions: any = {
        body,
        icon: icon || '/favicon.png',
        badge: '/favicon.png',
        data,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/view.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/dismiss.png'
          }
        ]
      };

      const browserNotification = new Notification(title, notificationOptions);
      
      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Navigate to relevant page based on notification data
        if (data?.appointmentId) {
          window.location.href = `/appointments/${data.appointmentId}`;
        } else if (data?.patientId) {
          window.location.href = `/patients/${data.patientId}`;
        }
      };

      // Auto-close notification after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  },

  // Create notification templates for different types
  createAppointmentReminderNotification: (appointmentData: any): NotificationPayload => ({
    title: 'Appointment Reminder',
    body: `You have an appointment with Dr. ${appointmentData.doctor} at ${appointmentData.time}`,
    icon: '/icons/appointment.png',
    data: {
      type: 'appointment_reminder',
      appointmentId: appointmentData.id,
      action: 'view_appointment'
    }
  }),

  createAppointmentConfirmationNotification: (appointmentData: any): NotificationPayload => ({
    title: 'Appointment Confirmed',
    body: `Your appointment with Dr. ${appointmentData.doctor} on ${appointmentData.date} at ${appointmentData.time} has been confirmed`,
    icon: '/icons/confirmed.png',
    data: {
      type: 'appointment_confirmation',
      appointmentId: appointmentData.id,
      action: 'view_appointment'
    }
  }),

  createAppointmentCancelledNotification: (appointmentData: any): NotificationPayload => ({
    title: 'Appointment Cancelled',
    body: `Your appointment with Dr. ${appointmentData.doctor} on ${appointmentData.date} has been cancelled`,
    icon: '/icons/cancelled.png',
    data: {
      type: 'appointment_cancelled',
      appointmentId: appointmentData.id,
      action: 'reschedule'
    }
  }),

  createPaymentReminderNotification: (paymentData: any): NotificationPayload => ({
    title: 'Payment Reminder',
    body: `Payment of $${paymentData.amount} is due for your appointment`,
    icon: '/icons/payment.png',
    data: {
      type: 'payment_reminder',
      paymentId: paymentData.id,
      action: 'make_payment'
    }
  }),

  createInventoryLowStockNotification: (itemData: any): NotificationPayload => ({
    title: 'Low Stock Alert',
    body: `${itemData.name} is running low (${itemData.quantity} remaining)`,
    icon: '/icons/laboratoryRadiology.png',
    data: {
      type: 'laboratoryRadiology_low_stock',
      itemId: itemData.id,
      action: 'restock_item'
    }
  }),

  createNewPatientNotification: (patientData: any): NotificationPayload => ({
    title: 'New Patient Registered',
    body: `${patientData.name} has been registered as a new patient`,
    icon: '/icons/patient.png',
    data: {
      type: 'new_patient',
      patientId: patientData.id,
      action: 'view_patient'
    }
  }),

  // Register for specific notification types
  subscribeToTopic: async (topic: string): Promise<void> => {
    // Note: Topic subscription is typically handled on the server side
    // This is a placeholder for client-side topic management
    console.log(`Subscribed to topic: ${topic}`);
  },

  unsubscribeFromTopic: async (topic: string): Promise<void> => {
    // Note: Topic unsubscription is typically handled on the server side
    // This is a placeholder for client-side topic management
    console.log(`Unsubscribed from topic: ${topic}`);
  },

  // Clear stored token (useful for logout)
  clearToken: (): void => {
    localStorage.removeItem('fcm_token');
  },

  // Check if notifications are enabled
  areNotificationsEnabled: (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  // Request notification permission
  requestPermission: async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
};

// Export the functions that the legacy compatibility layer expects
export async function getFirebaseMessaging() {
  return await getMessagingInstance();
}

export { isSupported as isMessagingSupported } from 'firebase/messaging';

export async function getFcmToken(vapidKey: string) {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('Messaging not available');
      return null;
    }
    
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  getMessagingInstance().then((messaging) => {
    if (!messaging) {
      console.warn('Messaging not available for message listener');
      return;
    }
    
    onMessage(messaging, callback);
  }).catch((error) => {
    console.error('Failed to set up message listener:', error);
  });
}

export function isMessagingReady(): boolean {
  return messaging !== null;
}