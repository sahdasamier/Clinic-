import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { AnalyticsService, globalPageTimer } from '../api/analytics';
import { MessagingService } from '../api/messaging';
import { StorageService } from '../api/storage';

export interface BlazePlanFeatures {
  analytics: {
    initialized: boolean;
    trackEvent: typeof AnalyticsService.trackCustomEvent;
    trackPageView: typeof AnalyticsService.trackPageView;
    pageTimer: typeof globalPageTimer;
  };
  messaging: {
    initialized: boolean;
    token: string | null;
    requestPermission: () => Promise<boolean>;
    sendNotification: (type: string, data: any) => void;
  };
  storage: {
    initialized: boolean;
    uploadFile: (file: File, type: string, context: any) => Promise<any>;
    deleteFile: (path: string) => Promise<void>;
  };
  functions: {
    initialized: boolean;
    callFunction: (name: string, data: any) => Promise<any>;
  };
}

export const useBlazePlanFeatures = (): BlazePlanFeatures => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  const [initialized, setInitialized] = useState(false);
  const [messagingToken, setMessagingToken] = useState<string | null>(null);
  const [features, setFeatures] = useState<BlazePlanFeatures>({
    analytics: {
      initialized: false,
      trackEvent: AnalyticsService.trackCustomEvent,
      trackPageView: AnalyticsService.trackPageView,
      pageTimer: globalPageTimer
    },
    messaging: {
      initialized: false,
      token: null,
      requestPermission: async () => false,
      sendNotification: () => {}
    },
    storage: {
      initialized: false,
      uploadFile: async () => null,
      deleteFile: async () => {}
    },
    functions: {
      initialized: false,
      callFunction: async () => null
    }
  });

  // Initialize Analytics
  useEffect(() => {
    if (user && userProfile && !features.analytics.initialized) {
      try {
        AnalyticsService.initializeUser(user.uid, {
          role: userProfile.role,
          clinic_id: userProfile.clinicId,
          signup_date: new Date().toISOString()
        });

        // Track login
        AnalyticsService.trackUserLogin(user.uid, userProfile.role, userProfile.clinicId);

        setFeatures(prev => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            initialized: true
          }
        }));

        console.log('✅ Analytics initialized for user:', user.uid);
      } catch (error) {
        console.error('Failed to initialize Analytics:', error);
      }
    }
  }, [user, userProfile]);

  // Initialize Cloud Messaging
  useEffect(() => {
    if (user && !features.messaging.initialized) {
      const initializeMessaging = async () => {
        try {
          const token = await MessagingService.initializeMessaging();
          setMessagingToken(token);

          // Set up foreground message listener
          MessagingService.onMessageListener().then((payload) => {
            console.log('Foreground message received:', payload);
            // Handle notification display
            if (payload.notification) {
              // You can integrate with your notification system here
              showInAppNotification(payload.notification);
            }
          });

          setFeatures(prev => ({
            ...prev,
            messaging: {
              initialized: true,
              token,
              requestPermission: async () => {
                const permission = await MessagingService.requestPermission();
                return permission === 'granted';
              },
              sendNotification: (type: string, data: any) => {
                // Create notification based on type
                let notification;
                switch (type) {
                  case 'appointment_reminder':
                    notification = MessagingService.createAppointmentReminderNotification(data);
                    break;
                  case 'payment_reminder':
                    notification = MessagingService.createPaymentReminderNotification(data);
                    break;
                  default:
                    notification = { title: 'Notification', body: 'You have a new notification' };
                }
                MessagingService.showBrowserNotification(notification, data);
              }
            }
          }));

          console.log('✅ Cloud Messaging initialized, token:', token);
        } catch (error) {
          console.error('Failed to initialize Cloud Messaging:', error);
        }
      };

      initializeMessaging();
    }
  }, [user]);

  // Initialize Storage
  useEffect(() => {
    if (user && !features.storage.initialized) {
      setFeatures(prev => ({
        ...prev,
        storage: {
          initialized: true,
          uploadFile: async (file: File, type: string, context: any) => {
            try {
              let result;
              switch (type) {
                case 'patient_document':
                  result = await StorageService.uploadPatientDocument(
                    context.patientId, 
                    file, 
                    context.category || 'medical_records'
                  );
                  break;
                case 'patient_avatar':
                  result = await StorageService.uploadPatientAvatar(context.patientId, file);
                  break;
                case 'prescription':
                  result = await StorageService.uploadPrescription(context.appointmentId, file);
                  break;
                case 'clinic_logo':
                  result = await StorageService.uploadClinicLogo(context.clinicId, file);
                  break;
                default:
                  throw new Error(`Unsupported upload type: ${type}`);
              }

              // Track the upload
              AnalyticsService.trackFileUpload(
                file.type,
                file.size,
                type,
                true
              );

              return result;
            } catch (error) {
              AnalyticsService.trackFileUpload(
                file.type,
                file.size,
                type,
                false
              );
              throw error;
            }
          },
          deleteFile: async (path: string) => {
            return await StorageService.deleteFile(path);
          }
        }
      }));

      console.log('✅ Storage service initialized');
    }
  }, [user]);

  // Initialize Cloud Functions
  useEffect(() => {
    if (user && !features.functions.initialized) {
      setFeatures(prev => ({
        ...prev,
        functions: {
          initialized: true,
          callFunction: async (name: string, data: any) => {
            try {
              const { httpsCallable } = await import('firebase/functions');
              const { functions } = await import('../api/firebase');
              const callable = httpsCallable(functions, name);
              const result = await callable(data);
              return result.data;
            } catch (error) {
              console.error(`Failed to call function ${name}:`, error);
              throw error;
            }
          }
        }
      }));

      console.log('✅ Cloud Functions service initialized');
    }
  }, [user]);

  // Track page timer when component unmounts
  useEffect(() => {
    return () => {
      globalPageTimer.stop();
    };
  }, []);

  return features;
};

// Helper function to show in-app notifications
const showInAppNotification = (notification: any) => {
  // This would integrate with your existing notification system
  // For now, we'll just log it
  console.log('In-app notification:', notification);
  
  // You could dispatch to a global notification context here
  // or use a toast library like react-hot-toast
}; 