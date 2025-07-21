import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { app } from './firebase';

const analytics = getAnalytics(app);

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export const AnalyticsService = {
  // Initialize analytics for a user
  initializeUser: (userId: string, userProperties: Record<string, any>) => {
    setUserId(analytics, userId);
    setUserProperties(analytics, userProperties);
  },

  // Track page views
  trackPageView: (pageName: string, additionalParams?: Record<string, any>) => {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      ...additionalParams
    });
  },

  // Track appointment-related events
  trackAppointmentBooked: (appointmentType: string, doctorId: string, clinicId: string) => {
    logEvent(analytics, 'appointment_booked', {
      appointment_type: appointmentType,
      doctor_id: doctorId,
      clinic_id: clinicId,
      booking_method: 'web_app'
    });
  },

  trackAppointmentCompleted: (appointmentId: string, duration: number, appointmentType: string) => {
    logEvent(analytics, 'appointment_completed', {
      appointment_id: appointmentId,
      duration_minutes: duration,
      appointment_type: appointmentType
    });
  },

  trackAppointmentCancelled: (appointmentId: string, reason: string, cancelledBy: string) => {
    logEvent(analytics, 'appointment_cancelled', {
      appointment_id: appointmentId,
      cancellation_reason: reason,
      cancelled_by: cancelledBy
    });
  },

  // Track patient-related events
  trackPatientRegistered: (patientId: string, registrationMethod: string, clinicId: string) => {
    logEvent(analytics, 'patient_registered', {
      patient_id: patientId,
      registration_method: registrationMethod,
      clinic_id: clinicId
    });
  },

  trackPatientUpdated: (patientId: string, fieldsUpdated: string[], clinicId: string) => {
    logEvent(analytics, 'patient_updated', {
      patient_id: patientId,
      fields_updated: fieldsUpdated.join(','),
      clinic_id: clinicId
    });
  },

  // Track payment events
  trackPaymentProcessed: (paymentId: string, amount: number, method: string, appointmentId?: string) => {
    logEvent(analytics, 'payment_processed', {
      payment_id: paymentId,
      amount: amount,
      payment_method: method,
      appointment_id: appointmentId,
      currency: 'USD' // Adjust based on your clinic's currency
    });
  },

  trackPaymentFailed: (amount: number, method: string, errorReason: string) => {
    logEvent(analytics, 'payment_failed', {
      amount: amount,
      payment_method: method,
      error_reason: errorReason,
      currency: 'USD'
    });
  },

  // Track inventory events
  trackInventoryLowStock: (itemId: string, itemName: string, currentQuantity: number, minQuantity: number) => {
    logEvent(analytics, 'inventory_low_stock', {
      item_id: itemId,
      item_name: itemName,
      current_quantity: currentQuantity,
      min_quantity: minQuantity
    });
  },

  trackInventoryRestocked: (itemId: string, itemName: string, quantityAdded: number, newTotal: number) => {
    logEvent(analytics, 'inventory_restocked', {
      item_id: itemId,
      item_name: itemName,
      quantity_added: quantityAdded,
      new_total: newTotal
    });
  },

  // Track user actions
  trackUserLogin: (userId: string, role: string, clinicId: string) => {
    logEvent(analytics, 'login', {
      user_id: userId,
      user_role: role,
      clinic_id: clinicId,
      login_method: 'email_password'
    });
  },

  trackUserLogout: (userId: string, sessionDuration: number) => {
    logEvent(analytics, 'logout', {
      user_id: userId,
      session_duration_minutes: Math.round(sessionDuration / 60000) // Convert ms to minutes
    });
  },

  trackFeatureUsed: (featureName: string, context?: string) => {
    logEvent(analytics, 'feature_used', {
      feature_name: featureName,
      context: context || 'general'
    });
  },

  // Track search and filter usage
  trackSearch: (searchTerm: string, searchType: 'patients' | 'appointments' | 'inventory', resultsCount: number) => {
    logEvent(analytics, 'search', {
      search_term: searchTerm,
      search_type: searchType,
      results_count: resultsCount
    });
  },

  trackFilterUsed: (filterType: string, filterValue: string, context: string) => {
    logEvent(analytics, 'filter_used', {
      filter_type: filterType,
      filter_value: filterValue,
      context: context
    });
  },

  // Track errors and issues
  trackError: (errorType: string, errorMessage: string, context?: string) => {
    logEvent(analytics, 'app_error', {
      error_type: errorType,
      error_message: errorMessage,
      context: context || 'general',
      timestamp: new Date().toISOString()
    });
  },

  trackPerformanceIssue: (issueType: string, loadTime: number, pageName: string) => {
    logEvent(analytics, 'performance_issue', {
      issue_type: issueType,
      load_time_ms: loadTime,
      page_name: pageName
    });
  },

  // Track file uploads
  trackFileUpload: (fileType: string, fileSize: number, uploadContext: string, success: boolean) => {
    logEvent(analytics, 'file_upload', {
      file_type: fileType,
      file_size_mb: Math.round(fileSize / (1024 * 1024) * 100) / 100, // Convert to MB with 2 decimals
      upload_context: uploadContext,
      success: success
    });
  },

  // Track data synchronization
  trackDataSync: (syncType: string, recordCount: number, duration: number, success: boolean) => {
    logEvent(analytics, 'data_sync', {
      sync_type: syncType,
      record_count: recordCount,
      duration_ms: duration,
      success: success
    });
  },

  // Set user properties for better segmentation
  setUserProperties: (properties: {
    role?: 'doctor' | 'receptionist' | 'admin' | 'management';
    clinic_id?: string;
    clinic_size?: 'small' | 'medium' | 'large';
    subscription_plan?: string;
    signup_date?: string;
  }) => {
    setUserProperties(analytics, properties);
  },

  // Track custom events
  trackCustomEvent: (eventName: string, parameters?: Record<string, any>) => {
    logEvent(analytics, eventName, parameters);
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