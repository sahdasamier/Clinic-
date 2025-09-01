import { getAnalytics, logEvent, setUserProperties, setUserId, isSupported } from 'firebase/analytics';
import { firebaseManager } from './../firebase/legacy-compat';

// Lazy initialization of analytics
let analytics: any = null;
let isAnalyticsSupported = false;

const getAnalyticsInstance = async () => {
  // Check if analytics is supported
  if (!isAnalyticsSupported) {
    try {
      isAnalyticsSupported = await isSupported();
      if (!isAnalyticsSupported) {
        console.warn('Firebase Analytics not supported in this environment');
        return null;
      }
    } catch (error) {
      console.warn('Error checking analytics support:', error);
      return null;
    }
  }
  
  if (!analytics) {
    try {
      analytics = await firebaseManager.getAnalytics();
    } catch (error) {
      console.warn('Analytics not available:', error);
      return null;
    }
  }
  return analytics;
};

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export const AnalyticsService = {
  // Initialize analytics for a user
  initializeUser: async (userId: string, userProperties: Record<string, any>) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      setUserId(analyticsInstance, userId);
      setUserProperties(analyticsInstance, userProperties);
    }
  },

  // Track page views
  trackPageView: async (pageName: string, additionalParams?: Record<string, any>) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        ...additionalParams
      });
    }
  },

  // Track appointment-related events
  trackAppointmentBooked: async (appointmentType: string, doctorId: string, clinicId: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'appointment_booked', {
        appointment_type: appointmentType,
        doctor_id: doctorId,
        clinic_id: clinicId,
        booking_method: 'web_app'
      });
    }
  },

  trackAppointmentCompleted: async (appointmentId: string, duration: number, appointmentType: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'appointment_completed', {
        appointment_id: appointmentId,
        duration_minutes: duration,
        appointment_type: appointmentType
      });
    }
  },

  trackAppointmentCancelled: async (appointmentId: string, reason: string, cancelledBy: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'appointment_cancelled', {
        appointment_id: appointmentId,
        cancellation_reason: reason,
        cancelled_by: cancelledBy
      });
    }
  },

  // Track patient-related events
  trackPatientRegistered: async (patientId: string, registrationMethod: string, clinicId: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'patient_registered', {
        patient_id: patientId,
        registration_method: registrationMethod,
        clinic_id: clinicId
      });
    }
  },

  trackPatientUpdated: async (patientId: string, fieldsUpdated: string[], clinicId: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'patient_updated', {
        patient_id: patientId,
        fields_updated: fieldsUpdated.join(','),
        clinic_id: clinicId
      });
    }
  },

  // Track payment events
  trackPaymentProcessed: async (paymentId: string, amount: number, method: string, appointmentId?: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'payment_processed', {
        payment_id: paymentId,
        amount: amount,
        payment_method: method,
        appointment_id: appointmentId,
        currency: 'USD' // Adjust based on your clinic's currency
      });
    }
  },

  trackPaymentFailed: async (amount: number, method: string, errorReason: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'payment_failed', {
        amount: amount,
        payment_method: method,
        error_reason: errorReason,
        currency: 'USD'
      });
    }
  },

  // Track laboratoryRadiology events
  trackInventoryLowStock: async (itemId: string, itemName: string, currentQuantity: number, minQuantity: number) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'laboratoryRadiology_low_stock', {
        item_id: itemId,
        item_name: itemName,
        current_quantity: currentQuantity,
        min_quantity: minQuantity
      });
    }
  },

  trackInventoryRestocked: async (itemId: string, itemName: string, quantityAdded: number, newTotal: number) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'laboratoryRadiology_restocked', {
        item_id: itemId,
        item_name: itemName,
        quantity_added: quantityAdded,
        new_total: newTotal
      });
    }
  },

  // Track user actions
  trackUserLogin: async (userId: string, role: string, clinicId: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'login', {
        user_id: userId,
        user_role: role,
        clinic_id: clinicId,
        login_method: 'email_password'
      });
    }
  },

  trackUserLogout: async (userId: string, sessionDuration: number) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'logout', {
        user_id: userId,
        session_duration_minutes: Math.round(sessionDuration / 60000) // Convert ms to minutes
      });
    }
  },

  trackFeatureUsed: async (featureName: string, context?: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'feature_used', {
        feature_name: featureName,
        context: context || 'general'
      });
    }
  },

  // Track search and filter usage
  trackSearch: async (searchTerm: string, searchType: 'patients' | 'appointments' | 'laboratoryRadiology', resultsCount: number) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'search', {
        search_term: searchTerm,
        search_type: searchType,
        results_count: resultsCount
      });
    }
  },

  trackFilterUsed: async (filterType: string, filterValue: string, context: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'filter_used', {
        filter_type: filterType,
        filter_value: filterValue,
        context: context
      });
    }
  },

  // Track errors and issues
  trackError: async (errorType: string, errorMessage: string, context?: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'app_error', {
        error_type: errorType,
        error_message: errorMessage,
        context: context || 'general',
        timestamp: new Date().toISOString()
      });
    }
  },

  trackPerformanceIssue: async (issueType: string, loadTime: number, pageName: string) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'performance_issue', {
        issue_type: issueType,
        load_time_ms: loadTime,
        page_name: pageName
      });
    }
  },

  // Track file uploads
  trackFileUpload: async (fileType: string, fileSize: number, uploadContext: string, success: boolean) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'file_upload', {
        file_type: fileType,
        file_size_mb: Math.round(fileSize / (1024 * 1024) * 100) / 100, // Convert to MB with 2 decimals
        upload_context: uploadContext,
        success: success
      });
    }
  },

  // Track data synchronization
  trackDataSync: async (syncType: string, recordCount: number, duration: number, success: boolean) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, 'data_sync', {
        sync_type: syncType,
        record_count: recordCount,
        duration_ms: duration,
        success: success
      });
    }
  },

  // Set user properties for better segmentation
  setUserProperties: async (properties: {
    role?: 'doctor' | 'receptionist' | 'admin' | 'management';
    clinic_id?: string;
    clinic_size?: 'small' | 'medium' | 'large';
    subscription_plan?: string;
    signup_date?: string;
  }) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      setUserProperties(analyticsInstance, properties);
    }
  },

  // Track custom events
  trackCustomEvent: async (eventName: string, parameters?: Record<string, any>) => {
    const analyticsInstance = await getAnalyticsInstance();
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, parameters);
    }
  }
};

// Helper function to track time spent on pages
export class PageTimer {
  private startTime: number = 0;
  private pageName: string = '';

  start(pageName: string) {
    this.startTime = Date.now();
    this.pageName = pageName;
  }

  stop() {
    if (this.startTime > 0) {
      const timeSpent = Date.now() - this.startTime;
      AnalyticsService.trackCustomEvent('time_on_page', {
        page_name: this.pageName,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.round(timeSpent / 1000)
      });
      this.startTime = 0;
    }
  }
}

// Export a global page timer instance
export const globalPageTimer = new PageTimer();

// Export the functions that the legacy compatibility layer expects
export async function getFirebaseAnalytics() {
  return await getAnalyticsInstance();
}

export { isSupported as isAnalyticsSupported } from 'firebase/analytics';

export async function trackEvent(eventName: string, eventParams?: { [key: string]: any }) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) {
    console.warn('Analytics not available');
    return;
  }
  
  logEvent(analytics, eventName, eventParams);
}

export async function setAnalyticsUserId(userId: string) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) {
    console.warn('Analytics not available');
    return;
  }
  
  setUserId(analytics, userId);
}

export async function setAnalyticsUserProperties(properties: { [key: string]: any }) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) {
    console.warn('Analytics not available');
    return;
  }
  
  setUserProperties(analytics, properties);
}

export function isAnalyticsReady(): boolean {
  return analytics !== null;
}