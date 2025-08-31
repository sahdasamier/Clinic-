import React from 'react';
import { AppointmentService } from '@/services/AppointmentService';
import { PatientService } from '@/services/PatientService';
import { PaymentService } from '@/services/PaymentService';

// ✅ EMERGENCY: Circuit breaker for infinite loops
let globalLoopDetection = {
  callCount: 0,
  lastReset: Date.now(),
  isCircuitOpen: false
};

function checkForInfiniteLoop(functionName: string): boolean {
  const now = Date.now();
  
  // Reset counter every 5 seconds
  if (now - globalLoopDetection.lastReset > 5000) {
    globalLoopDetection.callCount = 0;
    globalLoopDetection.lastReset = now;
    globalLoopDetection.isCircuitOpen = false;
  }
  
  globalLoopDetection.callCount++;
  
  // If more than 50 calls in 5 seconds, open circuit breaker
  if (globalLoopDetection.callCount > 50) {
    if (!globalLoopDetection.isCircuitOpen) {
      console.error(`🚨 INFINITE LOOP DETECTED in ${functionName}! Circuit breaker activated.`);
      globalLoopDetection.isCircuitOpen = true;
      
      // Force page reload after 2 seconds to break the loop
      setTimeout(() => {
        console.error('🔄 Force reloading page to break infinite loop...');
        window.location.reload();
      }, 2000);
    }
    return true; // Circuit is open
  }
  
  return false; // Circuit is closed, proceed normally
}

// ✅ ENHANCED AUTOMATIC REAL-TIME SYNC SYSTEM
// This system automatically synchronizes data across all pages without user intervention

interface SyncEventDetail {
  type: 'patient' | 'appointment' | 'payment' | 'laboratoryRadiology';
  action: 'create' | 'update' | 'delete';
  data: any;
  source: string;
  timestamp: number;
}

class GlobalDataSyncManager {
  private static instance: GlobalDataSyncManager;
  private listeners: Map<string, Set<Function>> = new Map();
  private isInitialized = false;
  private clinicId: string | null = null;
  private processingEvents = new Set<string>(); // ✅ PREVENT INFINITE LOOPS

  static getInstance(): GlobalDataSyncManager {
    if (!GlobalDataSyncManager.instance) {
      GlobalDataSyncManager.instance = new GlobalDataSyncManager();
    }
    return GlobalDataSyncManager.instance;
  }

  initialize(clinicId: string) {
    if (this.isInitialized && this.clinicId === clinicId) {
      console.log('✅ GlobalDataSync: Already initialized for clinic:', clinicId);
      return;
    }

    this.clinicId = clinicId;
    this.setupGlobalEventListeners();
    this.setupAutoSyncTriggers();
    this.isInitialized = true;
    
    console.log('🔄 GlobalDataSync: Initialized automatic synchronization for clinic:', clinicId);
  }

  // ✅ ENHANCED: Set up automatic sync triggers for all data changes
  private setupAutoSyncTriggers() {
    // Listen for appointment changes and auto-sync patients
    this.addEventListener('appointment', (detail: SyncEventDetail) => {
      console.log('🔄 Auto-sync: Appointment changed, updating related patient data');
      this.handleAppointmentSync(detail);
    });

    // Listen for patient changes and auto-sync appointments  
    this.addEventListener('patient', (detail: SyncEventDetail) => {
      console.log('🔄 Auto-sync: Patient changed, updating related appointment data');
      this.handlePatientSync(detail);
    });

    // Listen for payment changes and auto-sync appointments
    this.addEventListener('payment', (detail: SyncEventDetail) => {
      console.log('🔄 Auto-sync: Payment changed, updating related appointment data');
      this.handlePaymentSync(detail);
    });
  }

  // ✅ ENHANCED: Handle appointment changes with automatic patient sync (no broadcast loops)
  private async handleAppointmentSync(detail: SyncEventDetail) {
    try {
      const appointment = detail.data;
      
      // If appointment is completed, automatically create patient if doesn't exist
      if (detail.action === 'update' && appointment.status === 'completed') {
        await this.ensurePatientExists(appointment);
      }
      
      // ✅ REMOVED: Don't re-broadcast the same event to prevent loops
      // The event was already broadcast by the caller
      
      // Trigger patient data refresh on all pages (only if we made changes)
      if (detail.action === 'update' && appointment.status === 'completed') {
        this.triggerPatientRefresh();
      }
      
    } catch (error) {
      console.error('❌ Error in appointment auto-sync:', error);
    }
  }

  // ✅ ENHANCED: Handle patient changes with automatic appointment sync (no broadcast loops)
  private async handlePatientSync(detail: SyncEventDetail) {
    try {
      const patient = detail.data;
      
      // ✅ REMOVED: Don't re-broadcast the same event to prevent loops
      // The event was already broadcast by the caller
      
      // Trigger appointment data refresh on all pages (only for certain actions)
      if (detail.action === 'create' || detail.action === 'update') {
        this.triggerAppointmentRefresh();
      }
      
    } catch (error) {
      console.error('❌ Error in patient auto-sync:', error);
    }
  }

  // ✅ ENHANCED: Handle payment changes with automatic appointment sync (no broadcast loops)
  private async handlePaymentSync(detail: SyncEventDetail) {
    try {
      const payment = detail.data;
      
      // If payment is completed, automatically update appointment status
      if (detail.action === 'update' && payment.status === 'paid') {
        await this.syncPaymentToAppointment(payment);
      }
      
      // ✅ REMOVED: Don't re-broadcast the same event to prevent loops
      // The event was already broadcast by the caller
      
      // Trigger appointment data refresh on all pages (only when payment status changes)
      if (detail.action === 'update' && payment.status === 'paid') {
        this.triggerAppointmentRefresh();
      }
      
    } catch (error) {
      console.error('❌ Error in payment auto-sync:', error);
    }
  }

  // ✅ ENHANCED: Ensure patient exists for appointments without creating duplicates
  private async ensurePatientExists(appointment: any) {
    if (!this.clinicId) return;

    try {
      // ✅ ENHANCED: Pass existing patient ID to update instead of create
      const existingPatientId = appointment.patientId;
      
      console.log('🔄 Auto-sync: Ensuring patient exists for appointment', {
        appointmentId: appointment.id,
        patientName: appointment.patient || appointment.patientName,
        existingPatientId: existingPatientId,
        phone: appointment.phone,
        hasExistingPatientId: !!existingPatientId && existingPatientId !== 'legacy-patient'
      });
      
      // Only process if we have valid patient data
      if (!appointment.patient && !appointment.patientName) {
        console.warn('⚠️ Auto-sync: No patient name provided, skipping patient sync');
        return;
      }
      
      const patientId = await AppointmentService.ensurePatientExists(
        this.clinicId,
        appointment.patient || appointment.patientName,
        appointment.phone,
        existingPatientId // Pass existing ID to update instead of create new
      );
      
      console.log('✅ Auto-sync: Patient ensure result:', {
        originalPatientId: existingPatientId,
        resultPatientId: patientId,
        patientIdChanged: patientId !== existingPatientId,
        shouldUpdateAppointment: patientId && appointment.id && patientId !== existingPatientId
      });
      
      if (patientId && appointment.id && patientId !== existingPatientId) {
        // Only update appointment if patient ID actually changed
        await AppointmentService.updateAppointment(appointment.id, {
          patientId: patientId
        });
        console.log('✅ Auto-sync: Patient ensured and appointment updated with new patient ID');
      } else if (patientId) {
        console.log('✅ Auto-sync: Patient updated successfully, appointment patient ID unchanged');
      }
    } catch (error) {
      console.error('❌ Error ensuring patient exists in auto-sync:', error);
    }
  }

  // ✅ ENHANCED: Sync payment status to appointment
  private async syncPaymentToAppointment(payment: any) {
    if (!payment.appointmentId) return;

    try {
      await AppointmentService.updateAppointment(payment.appointmentId, {
        paymentStatus: 'paid'
      });
      console.log('✅ Auto-sync: Appointment payment status updated');
    } catch (error) {
      console.error('❌ Error syncing payment to appointment:', error);
    }
  }

  // ✅ ENHANCED: Global event broadcasting for real-time updates
  private setupGlobalEventListeners() {
    // Listen for Firebase real-time updates and broadcast to all pages
    if (typeof window !== 'undefined') {
      // Custom event for cross-page communication
      window.addEventListener('globalDataUpdate', (event: CustomEvent) => {
        const detail = event.detail as SyncEventDetail;
        this.processGlobalUpdate(detail);
      });

      // Storage event for cross-tab communication
      window.addEventListener('storage', (event) => {
        if (event.key === 'globalDataSync' && event.newValue) {
          const detail = JSON.parse(event.newValue) as SyncEventDetail;
          this.processGlobalUpdate(detail);
        }
      });
    }
  }

  // ✅ ENHANCED: Process global updates and trigger auto-sync with loop prevention
  private processGlobalUpdate(detail: SyncEventDetail) {
    // ✅ EMERGENCY: Check for infinite loops
    if (checkForInfiniteLoop('processGlobalUpdate')) {
      return; // Circuit breaker is open
    }
    
    // ✅ PREVENT INFINITE LOOPS: Create unique event ID
    const eventId = `${detail.type}-${detail.action}-${detail.timestamp}-${JSON.stringify(detail.data)?.substring(0, 50)}`;
    
    if (this.processingEvents.has(eventId)) {
      console.log(`🔄 LOOP PREVENTION: Skipping duplicate event ${eventId}`);
      return;
    }
    
    // Mark event as processing
    this.processingEvents.add(eventId);
    
    try {
      // Trigger appropriate sync handlers
      if (detail.type === 'appointment') {
        this.handleAppointmentSync(detail);
      } else if (detail.type === 'patient') {
        this.handlePatientSync(detail);
      } else if (detail.type === 'payment') {
        this.handlePaymentSync(detail);
      }
    } finally {
      // Clean up after processing (with delay to allow cross-page sync)
      setTimeout(() => {
        this.processingEvents.delete(eventId);
      }, 2000);
    }
  }

  // ✅ ENHANCED: Broadcast updates to all pages and tabs
  private broadcastUpdate(type: string, detail: SyncEventDetail) {
    // ✅ EMERGENCY: Check for infinite loops
    if (checkForInfiniteLoop('broadcastUpdate')) {
      return; // Circuit breaker is open
    }
    
    if (typeof window !== 'undefined') {
      // Cross-page event
      window.dispatchEvent(new CustomEvent('globalDataUpdate', { detail }));
      
      // Cross-tab event
      localStorage.setItem('globalDataSync', JSON.stringify(detail));
      setTimeout(() => {
        localStorage.removeItem('globalDataSync');
      }, 1000);
      
      // Trigger specific page updates
      window.dispatchEvent(new CustomEvent(`${type}Updated`, { detail }));
    }
  }

  // ✅ ENHANCED: Trigger automatic data refreshes
  private triggerPatientRefresh() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshPatientData', {
        detail: { automatic: true, timestamp: Date.now() }
      }));
    }
  }

  private triggerAppointmentRefresh() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshAppointmentData', {
        detail: { automatic: true, timestamp: Date.now() }
      }));
    }
  }

  // ✅ ENHANCED: Public methods for triggering automatic sync
  triggerPatientSync(patientData: any, action: 'create' | 'update' | 'delete' = 'update') {
    const detail: SyncEventDetail = {
      type: 'patient',
      action,
      data: patientData,
      source: 'manual',
      timestamp: Date.now()
    };
    
    this.processGlobalUpdate(detail);
    console.log('🔄 Auto-sync: Patient sync triggered automatically');
  }

  triggerAppointmentSync(appointmentData: any, action: 'create' | 'update' | 'delete' = 'update') {
    const detail: SyncEventDetail = {
      type: 'appointment',
      action,
      data: appointmentData,
      source: 'manual',
      timestamp: Date.now()
    };
    
    this.processGlobalUpdate(detail);
    console.log('🔄 Auto-sync: Appointment sync triggered automatically');
  }

  triggerPaymentSync(paymentData: any, action: 'create' | 'update' | 'delete' = 'update') {
    const detail: SyncEventDetail = {
      type: 'payment',
      action,
      data: paymentData,
      source: 'manual',
      timestamp: Date.now()
    };
    
    this.processGlobalUpdate(detail);
    console.log('🔄 Auto-sync: Payment sync triggered automatically');
  }

  // ✅ ENHANCED: Event listener management
  addEventListener(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  removeEventListener(type: string, callback: Function) {
    if (this.listeners.has(type)) {
      this.listeners.get(type)!.delete(callback);
    }
  }

  // ✅ ENHANCED: Force sync all data across pages
  async forceSyncAll() {
    if (!this.clinicId) {
      console.warn('⚠️ Cannot force sync: No clinic ID set');
      return;
    }

    console.log('🔄 Auto-sync: Forcing complete data synchronization...');
    
    try {
      // Trigger refresh events for all pages
      this.triggerPatientRefresh();
      this.triggerAppointmentRefresh();
      
      // Broadcast complete refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forceDataRefresh', {
          detail: { automatic: true, timestamp: Date.now() }
        }));
      }
      
      console.log('✅ Auto-sync: Complete data synchronization triggered');
    } catch (error) {
      console.error('❌ Error in force sync:', error);
    }
  }

  cleanup() {
    this.listeners.clear();
    this.isInitialized = false;
    this.clinicId = null;
    console.log('🧹 GlobalDataSync: Cleaned up');
  }
}

// ✅ ENHANCED: Export singleton instance
export const globalDataSync = GlobalDataSyncManager.getInstance();

// ✅ ENHANCED: Initialize and cleanup functions
export const initializeGlobalDataSync = (clinicId: string) => {
  globalDataSync.initialize(clinicId);
};

export const cleanupGlobalDataSync = () => {
  globalDataSync.cleanup();
};

// ✅ ENHANCED: Convenience methods for triggering automatic sync
export const triggerAutomaticSync = {
  patient: (data: any, action?: 'create' | 'update' | 'delete') => 
    globalDataSync.triggerPatientSync(data, action),
  appointment: (data: any, action?: 'create' | 'update' | 'delete') => 
    globalDataSync.triggerAppointmentSync(data, action),
  payment: (data: any, action?: 'create' | 'update' | 'delete') => 
    globalDataSync.triggerPaymentSync(data, action),
  all: () => globalDataSync.forceSyncAll()
};

console.log('🔄 Enhanced Global Data Sync system loaded - automatic synchronization enabled'); 