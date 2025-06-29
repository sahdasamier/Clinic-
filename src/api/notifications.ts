import { Notification, NotificationSettings } from '../types/models';
import {
  getDefaultNotificationAppointments,
  getDefaultNotificationPayments,
  getDefaultNotificationPatients,
  getDefaultInventory,
  STORAGE_KEYS_DATA,
  type NotificationAppointment,
  type NotificationPayment,
  type NotificationPatient,
  type InventoryItem,
} from '../data/mockData';

// Use imported storage keys
const STORAGE_KEYS = STORAGE_KEYS_DATA;

// Helper functions to load data - UPDATED: No localStorage, return defaults
const loadDataFromStorage = (key: string, defaultData: any[] = []): any[] => {
  console.warn(`⚠️ loadDataFromStorage: localStorage persistence disabled for ${key} - using defaults`);
  return defaultData;
};



// Notification generators
const generateAppointmentNotifications = (appointments: any[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  appointments.forEach(appointment => {
    // Check if this is a recent appointment action (within last 5 minutes for real-time feel)
    const appointmentDate = new Date(appointment.createdAt || appointment.date);
    const isRecentAction = appointment.updatedAt && 
      new Date(appointment.updatedAt).getTime() > now.getTime() - 5 * 60 * 1000;
    
    // Use current time for recently updated items, otherwise use actual creation time
    const notificationTime = isRecentAction ? now : appointmentDate;
    const timeAgo = getTimeAgo(notificationTime);

    // New appointments - show for recent appointments or very recent ones
    if (appointment.status === 'confirmed' && 
        (isRecentAction || appointmentDate.getTime() > now.getTime() - 60 * 60 * 1000)) { // 1 hour window
      notifications.push({
        id: `appointment-new-${appointment.id}`,
        type: 'appointment',
        title: 'new_appointment_scheduled',
        message: `${appointment.patient} has booked a ${appointment.type.toLowerCase()} for ${appointment.date} at ${appointment.time}`,
        time: timeAgo,
        read: false,
        color: '#3B82F6',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: notificationTime.toISOString(),
        updatedAt: notificationTime.toISOString()
      });
    }

    // Upcoming appointments (tomorrow)
    if (appointment.date === tomorrow && appointment.status === 'confirmed') {
      notifications.push({
        id: `appointment-upcoming-${appointment.id}`,
        type: 'appointment',
        title: 'appointment_reminder',
        message: `${appointment.patient} has an appointment tomorrow at ${appointment.time}`,
        time: 'Tomorrow',
        read: false,
        color: '#10B981',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: appointment.date,
        updatedAt: appointment.date
      });
    }

    // No-show appointments
    if (appointment.status === 'no-show') {
      notifications.push({
        id: `appointment-noshow-${appointment.id}`,
        type: 'appointment',
        title: 'patient_no_show',
        message: `${appointment.patient} did not show up for their ${appointment.type.toLowerCase()} appointment`,
        time: timeAgo,
        read: false,
        color: '#F59E0B',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: notificationTime.toISOString(),
        updatedAt: notificationTime.toISOString()
      });
    }

    // Cancelled appointments
    if (appointment.status === 'cancelled') {
      notifications.push({
        id: `appointment-cancelled-${appointment.id}`,
        type: 'appointment',
        title: 'appointment_cancelled',
        message: `${appointment.patient} cancelled their ${appointment.type.toLowerCase()} appointment${appointment.priority === 'high' ? ' (High Priority)' : ''}`,
        time: timeAgo,
        read: false,
        color: '#EF4444',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: notificationTime.toISOString(),
        updatedAt: notificationTime.toISOString()
      });
    }
  });

  return notifications;
};

const generatePaymentNotifications = (payments: any[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();

  payments.forEach(payment => {
    // Check if this is a recent payment action (within last 5 minutes for real-time feel)
    const paymentDate = new Date(payment.createdAt || payment.date);
    const isRecentAction = payment.updatedAt && 
      new Date(payment.updatedAt).getTime() > now.getTime() - 5 * 60 * 1000;
    
    // Use current time for recently updated items, otherwise use actual creation time
    const notificationTime = isRecentAction ? now : paymentDate;
    const timeAgo = getTimeAgo(notificationTime);

    // Payment received - show for recent payments or very recent ones
    if (payment.status === 'paid' && 
        (isRecentAction || paymentDate.getTime() > now.getTime() - 60 * 60 * 1000)) { // 1 hour window
      notifications.push({
        id: `payment-received-${payment.id}`,
        type: 'payment',
        title: 'payment_received',
        message: `Payment of ${payment.amount} EGP received from ${payment.patient} (${payment.invoiceId})`,
        time: timeAgo,
        read: false,
        color: '#10B981',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: notificationTime.toISOString(),
        updatedAt: notificationTime.toISOString()
      });
    }

    // Overdue payments
    if (payment.status === 'overdue') {
      const dueDate = payment.dueDate ? new Date(payment.dueDate) : new Date(payment.date);
      const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      notifications.push({
        id: `payment-overdue-${payment.id}`,
        type: 'payment',
        title: 'payment_overdue',
        message: `Payment from ${payment.patient} is ${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue (${payment.amount} EGP)`,
        time: `${daysPastDue} days overdue`,
        read: false,
        color: '#EF4444',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: payment.createdAt || payment.date,
        updatedAt: payment.createdAt || payment.date
      });
    }

    // Pending payments (due soon)
    if (payment.status === 'pending' && payment.dueDate) {
      const dueDate = new Date(payment.dueDate);
      const daysToDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToDue <= 3 && daysToDue >= 0) {
        notifications.push({
          id: `payment-due-${payment.id}`,
          type: 'payment',
          title: 'payment_due_soon',
          message: `Payment from ${payment.patient} is due ${daysToDue === 0 ? 'today' : `in ${daysToDue} day${daysToDue > 1 ? 's' : ''}`} (${payment.amount} EGP)`,
          time: daysToDue === 0 ? 'Due today' : `Due in ${daysToDue} day${daysToDue > 1 ? 's' : ''}`,
          read: false,
          color: '#F59E0B',
          clinicId: 'clinic-1',
          branchId: 'branch-1',
          createdAt: payment.createdAt || payment.date,
          updatedAt: payment.createdAt || payment.date
        });
      }
    }
  });

  return notifications;
};

const generatePatientNotifications = (patients: any[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();

  patients.forEach(patient => {
    // Check if this is a recent patient action (within last 5 minutes for real-time feel)
    const createdDate = new Date(patient.createdAt || now);
    const isRecentAction = patient.updatedAt && 
      new Date(patient.updatedAt).getTime() > now.getTime() - 5 * 60 * 1000;
    
    // Use current time for recently updated items, otherwise use actual creation time
    const notificationTime = isRecentAction ? now : createdDate;
    const timeAgo = getTimeAgo(notificationTime);

    // New patient registrations - show for recent registrations or very recent ones
    if (patient.status === 'new' && 
        (isRecentAction || createdDate.getTime() > now.getTime() - 60 * 60 * 1000)) { // 1 hour window
      notifications.push({
        id: `patient-new-${patient.id}`,
        type: 'system',
        title: 'new_patient_registration',
        message: `${patient.name} has registered as a new patient`,
        time: timeAgo,
        read: false,
        color: '#8B5CF6',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: notificationTime.toISOString(),
        updatedAt: notificationTime.toISOString()
      });
    }

    // Follow-up appointments due
    if (patient.nextAppointment && patient.status === 'follow-up') {
      const appointmentDate = new Date(patient.nextAppointment);
      const daysToAppointment = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToAppointment <= 2 && daysToAppointment >= 0) {
        notifications.push({
          id: `patient-followup-${patient.id}`,
          type: 'appointment',
          title: 'follow_up_due',
          message: `${patient.name} has a follow-up appointment ${daysToAppointment === 0 ? 'today' : daysToAppointment === 1 ? 'tomorrow' : `in ${daysToAppointment} days`}`,
          time: daysToAppointment === 0 ? 'Today' : daysToAppointment === 1 ? 'Tomorrow' : `In ${daysToAppointment} days`,
          read: false,
          color: '#3B82F6',
          clinicId: 'clinic-1',
          branchId: 'branch-1',
          createdAt: patient.nextAppointment,
          updatedAt: patient.nextAppointment
        });
      }
    }

    // Medication refill reminders (90+ days on medication)
    if (patient.medications && patient.medications.length > 0) {
      patient.medications.forEach((medication: any) => {
        if (medication.status === 'Active' && medication.dateStarted) {
          const startDate = new Date(medication.dateStarted);
          const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart >= 90 && daysSinceStart % 90 < 7) { // Remind every 90 days
            notifications.push({
              id: `medication-refill-${patient.id}-${medication.name}`,
              type: 'system',
              title: 'medication_refill_due',
              message: `${patient.name} may need a refill for ${medication.name} (${daysSinceStart} days since start)`,
              time: `${daysSinceStart} days on medication`,
              read: false,
              color: '#10B981',
              clinicId: 'clinic-1',
              branchId: 'branch-1',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString()
            });
          }
        }
      });
    }
  });

  return notifications;
};

const generateInventoryNotifications = (inventory: any[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();

  inventory.forEach(item => {
    const updatedDate = new Date(item.lastUpdated || now);
    const timeAgo = getTimeAgo(updatedDate);

    // Low stock alerts
    if (item.quantity <= item.minQuantity && item.quantity > 0) {
      notifications.push({
        id: `inventory-low-${item.id}`,
        type: 'inventory',
        title: 'low_stock_alert_title',
        message: `low_stock_message|||${item.name}|||${item.quantity}|||${item.minQuantity}`,
        time: timeAgo,
        read: false,
        color: '#F59E0B',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: item.lastUpdated || now.toISOString(),
        updatedAt: item.lastUpdated || now.toISOString()
      });
    }

    // Out of stock alerts
    if (item.quantity === 0) {
      notifications.push({
        id: `inventory-out-${item.id}`,
        type: 'inventory',
        title: 'out_of_stock_alert_title',
        message: `out_of_stock_message|||${item.name}|||${item.supplier}`,
        time: timeAgo,
        read: false,
        color: '#EF4444',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        createdAt: item.lastUpdated || now.toISOString(),
        updatedAt: item.lastUpdated || now.toISOString()
      });
    }
  });

  return notifications;
};

const generateSystemNotifications = (): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [];

  // System update notification (mock)
  const lastSystemUpdate = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
  notifications.push({
    id: 'system-update-latest',
    type: 'system',
    title: 'system_update',
    message: 'system_update_message',
    time: getTimeAgo(lastSystemUpdate),
    read: false,
    color: '#8B5CF6',
    clinicId: 'clinic-1',
    branchId: 'branch-1',
    createdAt: lastSystemUpdate.toISOString(),
    updatedAt: lastSystemUpdate.toISOString()
  });

  return notifications;
};

// Utility function to calculate time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
};

// Main notification aggregator
const aggregateAllNotifications = (): Notification[] => {
  // Load data from all modules
  const appointments = loadDataFromStorage(STORAGE_KEYS.APPOINTMENTS, getDefaultNotificationAppointments());
  const payments = loadDataFromStorage(STORAGE_KEYS.PAYMENTS, getDefaultNotificationPayments());
  const patients = loadDataFromStorage(STORAGE_KEYS.PATIENTS, getDefaultNotificationPatients());
  const inventory = loadDataFromStorage(STORAGE_KEYS.INVENTORY, getDefaultInventory());

  // Generate notifications from each module
  const appointmentNotifications = generateAppointmentNotifications(appointments);
  const paymentNotifications = generatePaymentNotifications(payments);
  const patientNotifications = generatePatientNotifications(patients);
  const inventoryNotifications = generateInventoryNotifications(inventory);
  const systemNotifications = generateSystemNotifications();

  // Combine all notifications
  const allNotifications = [
    ...appointmentNotifications,
    ...paymentNotifications,
    ...patientNotifications,
    ...inventoryNotifications,
    ...systemNotifications
  ];

  // Sort by creation date (newest first)
  return allNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Save notifications to storage - DEPRECATED: No localStorage persistence
const saveNotificationsToStorage = (notifications: Notification[]) => {
  console.warn('⚠️ saveNotificationsToStorage: localStorage persistence disabled');
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to mark an item as recently updated - UPDATED: No localStorage
export const markAsRecentlyUpdated = (storageKey: string, itemId: string | number) => {
  console.warn(`⚠️ markAsRecentlyUpdated: localStorage persistence disabled for ${storageKey}:${itemId}`);
  
  // Trigger a custom event to notify that data was updated (event system preserved)
  window.dispatchEvent(new CustomEvent('dataUpdated', { 
    detail: { storageKey, itemId, timestamp: new Date().toISOString() } 
  }));
};

// Helper function to add a new item - UPDATED: No localStorage persistence
export const addNewItemToStorage = (storageKey: string, newItem: any) => {
  console.warn(`⚠️ addNewItemToStorage: localStorage persistence disabled for ${storageKey}`);
  
  const itemWithTimestamp = {
    ...newItem,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Assign ID if not present (for component compatibility)
  if (!itemWithTimestamp.id) {
    itemWithTimestamp.id = Date.now(); // Simple ID generation
  }
  
  // Trigger a custom event to notify that data was updated (event system preserved)
  window.dispatchEvent(new CustomEvent('dataUpdated', { 
    detail: { storageKey, itemId: itemWithTimestamp.id, timestamp: new Date().toISOString(), action: 'add' } 
  }));
  
  return itemWithTimestamp;
};

// Notifications API
export const notificationsApi = {
  // Get all notifications (aggregated from all modules)
  getAll: async (clinicId: string, branchId?: string): Promise<Notification[]> => {
    await delay(300);
    const notifications = aggregateAllNotifications();
    
    // Filter by clinic/branch if needed
    let filtered = notifications.filter(n => n.clinicId === clinicId);
    if (branchId) {
      filtered = filtered.filter(n => n.branchId === branchId);
    }
    
    // Save to storage for persistence
    saveNotificationsToStorage(filtered);
    
    return filtered;
  },

  // Get notifications by type
  getByType: async (type: string, clinicId: string, branchId?: string): Promise<Notification[]> => {
    await delay(200);
    const all = await notificationsApi.getAll(clinicId, branchId);
    return all.filter(n => n.type === type);
  },

  // Get unread count
  getUnreadCount: async (clinicId: string, branchId?: string): Promise<number> => {
    await delay(100);
    const all = await notificationsApi.getAll(clinicId, branchId);
    return all.filter(n => !n.read).length;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const stored = loadDataFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = stored.map((n: Notification) => 
      n.id === id ? { ...n, read: true, updatedAt: new Date().toISOString() } : n
    );
    saveNotificationsToStorage(updated);
  },

  // Mark all notifications as read
  markAllAsRead: async (clinicId: string, branchId?: string): Promise<void> => {
    await delay(300);
    const stored = loadDataFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = stored.map((n: Notification) => {
      if (n.clinicId === clinicId && (!branchId || n.branchId === branchId)) {
        return { ...n, read: true, updatedAt: new Date().toISOString() };
      }
      return n;
    });
    saveNotificationsToStorage(updated);
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await delay(200);
    const stored = loadDataFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const filtered = stored.filter((n: Notification) => n.id !== id);
    saveNotificationsToStorage(filtered);
  },

  // Clear all notifications
  clearAll: async (clinicId: string, branchId?: string): Promise<void> => {
    await delay(300);
    const stored = loadDataFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const filtered = stored.filter((n: Notification) => {
      return !(n.clinicId === clinicId && (!branchId || n.branchId === branchId));
    });
    saveNotificationsToStorage(filtered);
  },

  // Refresh notifications (re-aggregate all data)
  refresh: async (clinicId: string, branchId?: string): Promise<Notification[]> => {
    await delay(500);
    return notificationsApi.getAll(clinicId, branchId);
  }
};

// Notification Settings API
const defaultSettings: NotificationSettings = {
  appointments: true,
  payments: true,
  inventory: true,
  system: true,
};

export const notificationSettingsApi = {
  // Get settings - UPDATED: No localStorage persistence
  get: async (userId: string): Promise<NotificationSettings> => {
    await delay(100);
    console.warn(`⚠️ notificationSettingsApi.get: localStorage persistence disabled for user ${userId}`);
    return { ...defaultSettings };
  },

  // Update settings - UPDATED: No localStorage persistence
  update: async (userId: string, settings: NotificationSettings): Promise<NotificationSettings> => {
    await delay(200);
    console.warn(`⚠️ notificationSettingsApi.update: localStorage persistence disabled for user ${userId}`);
    return { ...settings };
  },

  // Reset to defaults - UPDATED: No localStorage persistence
  reset: async (userId: string): Promise<NotificationSettings> => {
    await delay(100);
    console.warn(`⚠️ notificationSettingsApi.reset: localStorage persistence disabled for user ${userId}`);
    return { ...defaultSettings };
  },
}; 