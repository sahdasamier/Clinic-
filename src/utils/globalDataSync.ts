import React from 'react';
import { AppointmentService } from '../services/AppointmentService';
import { PatientService } from '../services/PatientService';
import { PaymentService } from '../services/PaymentService';

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
  DATA_SYNC_COMPLETE: 'global:dataSyncComplete',
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
    if (this.currentClinicId === clinicId) {
      console.log(`🔄 GlobalDataSync: Already initialized for clinic ${clinicId}`);
      return;
    }

    // Clean up previous listeners
    this.cleanup();
    this.currentClinicId = clinicId;

    console.log(`🔄 GlobalDataSync: Initializing for clinic ${clinicId}`);

    // Set up global listeners
    const appointmentUnsub = AppointmentService.listenAppointments(clinicId, (appointments) => {
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'appointments',
        data: appointments,
        count: appointments.length
      });
    });

    const patientUnsub = PatientService.listenPatients(clinicId, (patients) => {
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'patients',
        data: patients,
        count: patients.length
      });
    });

    // Store unsubscribers
    this.unsubscribers.set('appointments', appointmentUnsub);
    this.unsubscribers.set('patients', patientUnsub);

    console.log(`✅ GlobalDataSync: Initialized for clinic ${clinicId}`);
  }

  // Subscribe to global events
  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Broadcast events to all subscribers
  private broadcastEvent(eventType: string, data: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ GlobalDataSync: Error in callback for ${eventType}:`, error);
        }
      });
    }

    // Also dispatch browser event for legacy compatibility
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }

  // Manual sync triggers
  triggerAppointmentSync(data: any) {
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.APPOINTMENT_UPDATED, data);
    // Trigger notification update
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.NOTIFICATION_UPDATE, {
      type: 'appointment',
      action: 'updated',
      data
    });
  }

  triggerPatientSync(data: any) {
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.PATIENT_UPDATED, data);
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.NOTIFICATION_UPDATE, {
      type: 'patient',
      action: 'updated',
      data
    });
  }

  triggerPaymentSync(data: any) {
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.PAYMENT_UPDATED, data);
    this.broadcastEvent(GLOBAL_SYNC_EVENTS.NOTIFICATION_UPDATE, {
      type: 'payment',
      action: 'updated',
      data
    });
  }

  // Force refresh all data
  forceRefresh() {
    if (this.currentClinicId) {
      console.log(`🔄 GlobalDataSync: Force refreshing data for clinic ${this.currentClinicId}`);
      this.broadcastEvent(GLOBAL_SYNC_EVENTS.DATA_SYNC_COMPLETE, {
        type: 'force_refresh',
        clinicId: this.currentClinicId
      });
    }
  }

  // Cleanup
  cleanup() {
    console.log('🧹 GlobalDataSync: Cleaning up listeners');
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers.clear();
    this.listeners.clear();
    this.currentClinicId = null;
  }

  // Get current state
  getCurrentClinicId() {
    return this.currentClinicId;
  }
}

// Export singleton instance
export const globalDataSync = GlobalDataSyncManager.getInstance();

// Convenience hooks for React components
export const useGlobalDataSync = (eventType: string, callback: Function) => {
  React.useEffect(() => {
    const unsubscribe = globalDataSync.subscribe(eventType, callback);
    return unsubscribe;
  }, [eventType, callback]);
};

// Initialize global sync when app starts
export const initializeGlobalDataSync = (clinicId: string) => {
  globalDataSync.initializeForClinic(clinicId);
};

// Clean up when user logs out
export const cleanupGlobalDataSync = () => {
  globalDataSync.cleanup();
}; 