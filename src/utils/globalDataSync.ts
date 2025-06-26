import React from 'react';
import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
import { PaymentService } from '../services/PaymentService'; // Import PaymentService

// Global data sync events
export const GLOBAL_SYNC_EVENTS = {
  APPOINTMENT_CREATED: 'global:appointmentCreated',
  APPOINTMENT_UPDATED: 'global:appointmentUpdated',
  APPOINTMENT_DELETED: 'global:appointmentDeleted',
  PATIENT_CREATED: 'global:patientCreated',
  PATIENT_UPDATED: 'global:patientUpdated',
  PATIENT_DELETED: 'global:patientDeleted',
  PAYMENT_CREATED: 'global:paymentCreated',
  PAYMENT_UPDATED: 'global:paymentUpdated',
  PAYMENT_DELETED: 'global:paymentDeleted',
  DATA_SYNC_COMPLETE: 'global:dataSyncComplete', // Generic event for when any dataset is updated
  NOTIFICATION_UPDATE: 'global:notificationUpdate'
} as const;

// Data sync state
class GlobalDataSyncManager {
  private static instance: GlobalDataSyncManager;
  private listeners: Map<string, Set<Function>> = new Map();
  private unsubscribers: Map<string, Function> = new Map();
  private currentClinicId: string | null = null;

  static getInstance(): GlobalDataSyncManager {
    if (!GlobalDataSyncManager.instance) {
      GlobalDataSyncManager.instance = new GlobalDataSyncManager();
    }
    return GlobalDataSyncManager.instance;
  }

  // Initialize global listeners for a clinic
  initializeForClinic(clinicId: string) {
    if (this.currentClinicId === clinicId && this.unsubscribers.size > 0) { // Check if already initialized for this clinic
      console.log(`🔄 GlobalDataSync: Already initialized and listening for clinic ${clinicId}`);
      return;
    }

    // Clean up previous listeners if switching clinics or re-initializing
    this.cleanup();
    this.currentClinicId = clinicId;

    console.log(`🔄 GlobalDataSync: Initializing for clinic ${clinicId}`);

    // Set up global listeners for Appointments
    const appointmentUnsub = AppointmentService.listenAppointments(clinicId, (appointments) => {
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'appointments', // To identify the data type
        data: appointments,
        count: appointments.length
      });
    });
    this.unsubscribers.set('appointments', appointmentUnsub);

    // Set up global listeners for Patients
    const patientUnsub = PatientService.listenPatients(clinicId, (patients) => {
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'patients', // To identify the data type
        data: patients,
        count: patients.length
      });
    });
    this.unsubscribers.set('patients', patientUnsub);

    // Set up global listeners for Payments
    const paymentUnsub = PaymentService.listenPayments(clinicId, (payments) => {
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'payments', // To identify the data type
        data: payments,
        count: payments.length
      });
    });
    this.unsubscribers.set('payments', paymentUnsub);


    console.log(`✅ GlobalDataSync: Initialized listeners for appointments, patients, and payments for clinic ${clinicId}`);
  }

  // Subscribe to global events
  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
    console.log(`🎧 GlobalDataSync: New subscription to ${eventType}`);
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        console.log(`🔇 GlobalDataSync: Unsubscribed from ${eventType}`);
      }
    };
  }

  // Broadcast events to all subscribers
  private broadcastEvent(eventType: string, data: any) {
    const callbacks = this.listeners.get(eventType);
    console.log(`📢 GlobalDataSync: Broadcasting ${eventType} with data type ${data.type}, count ${data.count}`);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ GlobalDataSync: Error in callback for ${eventType}:`, error);
        }
      });
    }

    // Also dispatch browser event for legacy compatibility or other modules
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }

  // Manual sync triggers (can be used to signal specific updates if needed beyond DATA_SYNC_COMPLETE)
  triggerAppointmentSync(data: any) { // Typically, an appointment object or array
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.APPOINTMENT_UPDATED, data); // More specific event
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.NOTIFICATION_UPDATE, {
      type: 'appointment',
      action: 'updated', // Or 'created', 'deleted'
      data
    });
  }

  triggerPatientSync(data: any) { // Typically, a patient object or array
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.PATIENT_UPDATED, data); // More specific event
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.NOTIFICATION_UPDATE, {
      type: 'patient',
      action: 'updated',
      data
    });
  }

  triggerPaymentSync(data: any) { // Typically, a payment object or array
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.PAYMENT_UPDATED, data); // More specific event
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.NOTIFICATION_UPDATE, {
      type: 'payment',
      action: 'updated',
      data
    });
  }

  // Force refresh all data (could re-trigger initial fetches if services support it, or simply re-broadcast existing state)
  forceRefresh() {
    if (this.currentClinicId) {
      console.log(`🔄 GlobalDataSync: Force refreshing data for clinic ${this.currentClinicId}`);
      // This event could signal components to re-fetch if they have their own direct fetches,
      // or re-broadcast if globalDataSync holds copies of data (which it currently doesn't directly).
      // For now, it's a signal. The listeners should provide the latest data.
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'force_refresh_signal', // Indicate it's a manual refresh signal
        clinicId: this.currentClinicId
      });
       // Re-initialize to ensure listeners are active if they were somehow dropped
       this.initializeForClinic(this.currentClinicId);
    } else {
        console.warn("⚠️ GlobalDataSync: Cannot force refresh, no current clinicId.");
    }
  }

  // Cleanup
  cleanup() {
    console.log('🧹 GlobalDataSync: Cleaning up listeners...');
    this.unsubscribers.forEach((unsub, key) => {
      try {
        unsub();
        console.log(`  👍 Unsubscribed from ${key}`);
      } catch (error) {
        console.error(`  👎 Error unsubscribing from ${key}:`, error);
      }
    });
    this.unsubscribers.clear();
    this.listeners.clear(); // Also clear any direct subscribers to this manager
    this.currentClinicId = null;
    console.log('🧹 GlobalDataSync: Cleanup complete.');
  }

  // Get current state
  getCurrentClinicId() {
    return this.currentClinicId;
  }
}

// Export singleton instance
export const globalDataSync = GlobalDataSyncManager.getInstance();

// Convenience hooks for React components
export const useGlobalDataSync = (eventType: string, callback: (data: any) => void) => {
  React.useEffect(() => {
    const unsubscribe = globalDataSync.subscribe(eventType, callback);
    return () => {
      unsubscribe();
    };
  }, [eventType, callback]); // Ensure callback is stable or wrapped in useCallback
};

// Initialize global sync when app starts (e.g., when clinicId is known)
export const initializeGlobalDataSync = (clinicId: string) => {
  if(clinicId) {
    globalDataSync.initializeForClinic(clinicId);
  } else {
    console.warn("⚠️ GlobalDataSync: Initialization skipped, clinicId is null/undefined.");
  }
};

// Clean up when user logs out or clinic context changes significantly
export const cleanupGlobalDataSync = () => {
  globalDataSync.cleanup();
};