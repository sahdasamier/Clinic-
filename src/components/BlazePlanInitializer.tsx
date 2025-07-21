import React, { useEffect } from 'react';
import { useBlazePlanFeatures } from '../hooks/useBlazePlanFeatures';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { AnalyticsService } from '../api/analytics';

interface BlazePlanInitializerProps {
  children: React.ReactNode;
}

const BlazePlanInitializer: React.FC<BlazePlanInitializerProps> = ({ children }) => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  const blazeFeatures = useBlazePlanFeatures();

  // Track initial app load
  useEffect(() => {
    if (blazeFeatures.analytics.initialized) {
      AnalyticsService.trackPageView('App Load');
      blazeFeatures.analytics.pageTimer.start('App Session');
    }
  }, [blazeFeatures.analytics.initialized]);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (blazeFeatures.analytics.initialized) {
        const pathname = window.location.pathname;
        AnalyticsService.trackPageView(pathname);
        blazeFeatures.analytics.pageTimer.stop();
        blazeFeatures.analytics.pageTimer.start(pathname);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      if (blazeFeatures.analytics.initialized) {
        blazeFeatures.analytics.pageTimer.stop();
      }
    };
  }, [blazeFeatures.analytics.initialized]);

  // Register service worker for messaging
  useEffect(() => {
    if ('serviceWorker' in navigator && blazeFeatures.messaging.initialized) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, [blazeFeatures.messaging.initialized]);

  // Initialize messaging token for current user
  useEffect(() => {
    const updateUserFCMToken = async () => {
      if (user && userProfile && blazeFeatures.messaging.token) {
        try {
          // Store FCM token locally for now (can be enhanced later)
          localStorage.setItem(`fcm_token_${user.uid}`, blazeFeatures.messaging.token);
          console.log('✅ FCM token stored locally for user');
        } catch (error) {
          console.error('Failed to store FCM token:', error);
        }
      }
    };

    updateUserFCMToken();
  }, [user, userProfile, blazeFeatures.messaging.token]);

  // Handle visibility change for analytics
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (blazeFeatures.analytics.initialized) {
        if (document.hidden) {
          // User switched away from the app
          AnalyticsService.trackCustomEvent('app_backgrounded', {
            timestamp: new Date().toISOString()
          });
          blazeFeatures.analytics.pageTimer.stop();
        } else {
          // User returned to the app
          AnalyticsService.trackCustomEvent('app_foregrounded', {
            timestamp: new Date().toISOString()
          });
          blazeFeatures.analytics.pageTimer.start(window.location.pathname);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [blazeFeatures.analytics.initialized]);

  // Log feature initialization status
  useEffect(() => {
    console.log('🔥 Blaze Plan Features Status:', {
      analytics: blazeFeatures.analytics.initialized,
      messaging: blazeFeatures.messaging.initialized,
      storage: blazeFeatures.storage.initialized,
      functions: blazeFeatures.functions.initialized
    });
  }, [
    blazeFeatures.analytics.initialized,
    blazeFeatures.messaging.initialized,
    blazeFeatures.storage.initialized,
    blazeFeatures.functions.initialized
  ]);

  return <>{children}</>;
};

export default BlazePlanInitializer; 