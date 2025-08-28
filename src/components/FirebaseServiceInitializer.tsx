import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { AnalyticsService } from '../api/analytics';
import { MessagingService } from '../api/messaging';

interface FirebaseServiceInitializerProps {
  children: React.ReactNode;
}

const FirebaseServiceInitializer: React.FC<FirebaseServiceInitializerProps> = ({ children }) => {
  const { user } = useAuth();
  const { userProfile } = useUser();

  // Track initial app load
  useEffect(() => {
    if (user && userProfile) {
      AnalyticsService.trackPageView('App Load');
    }
  }, [user, userProfile]);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (user) {
        const pathname = window.location.pathname;
        AnalyticsService.trackPageView(pathname);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user]);

  // Register service worker for messaging
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // Initialize messaging token for current user
  useEffect(() => {
    const updateUserFCMToken = async () => {
      if (user) {
        try {
          const token = await MessagingService.initializeMessaging();
          if (token) {
            localStorage.setItem(`fcm_token_${user.uid}`, token);
            console.log('✅ FCM token stored locally for user');
          }
        } catch (error) {
          console.error('Failed to initialize messaging token:', error);
        }
      }
    };

    updateUserFCMToken();
  }, [user]);

  // Handle visibility change for analytics
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (user) {
        if (document.hidden) {
          AnalyticsService.trackCustomEvent('app_backgrounded', {
            timestamp: new Date().toISOString()
          });
        } else {
          AnalyticsService.trackCustomEvent('app_foregrounded', {
            timestamp: new Date().toISOString()
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return <>{children}</>;
};

export default FirebaseServiceInitializer; 