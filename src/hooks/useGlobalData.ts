import { useMemo } from 'react';
import { useGlobalData } from '../contexts/GlobalDataContext';
import { Appointment, Patient, Payment, InventoryItem, Notification } from '../types/models';

// Base hook to access global data context
export { useGlobalData } from '../contexts/GlobalDataContext';

// Specialized hook for appointments with filtering and search
export function useAppointments(options?: {
  dateRange?: { start: Date; end: Date };
  status?: string[];
  doctorId?: string;
  patientId?: string;
  search?: string;
}) {
  const { appointments, loading, errors, stats, addAppointment, updateAppointment, deleteAppointment } = useGlobalData();

  const filteredAppointments = useMemo(() => {
    if (!options) return appointments;

    return appointments.filter((appointment) => {
      // Date range filter
      if (options.dateRange) {
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate < options.dateRange.start || appointmentDate > options.dateRange.end) {
          return false;
        }
      }

      // Status filter
      if (options.status && options.status.length > 0) {
        if (!options.status.includes(appointment.status)) {
          return false;
        }
      }

      // Doctor filter
      if (options.doctorId && appointment.doctorId !== options.doctorId) {
        return false;
      }

      // Patient filter
      if (options.patientId && appointment.patientId !== options.patientId) {
        return false;
      }

      // Search filter
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        const searchFields = [
          appointment.patientName,
          appointment.doctorName,
          appointment.notes,
          appointment.type,
        ].filter(Boolean);

        const matchesSearch = searchFields.some(field => 
          field?.toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [appointments, options]);

  const appointmentStats = useMemo(() => {
    const today = new Date().toDateString();
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    return {
      total: filteredAppointments.length,
      today: filteredAppointments.filter(apt => 
        new Date(apt.date).toDateString() === today
      ).length,
      thisWeek: filteredAppointments.filter(apt => 
        new Date(apt.date) >= thisWeek
      ).length,
      completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length,
      upcoming: filteredAppointments.filter(apt => 
        new Date(apt.date) > new Date() && apt.status === 'scheduled'
      ).length,
    };
  }, [filteredAppointments]);

  return {
    appointments: filteredAppointments,
    stats: appointmentStats,
    loading: loading.appointments,
    error: errors.appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
}

// Specialized hook for patients with search and filtering
export function usePatients(options?: {
  search?: string;
  ageRange?: { min: number; max: number };
  gender?: string;
  isActive?: boolean;
}) {
  const { patients, loading, errors, addPatient, updatePatient, deletePatient } = useGlobalData();

  const filteredPatients = useMemo(() => {
    if (!options) return patients;

    return patients.filter((patient) => {
      // Search filter
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        const searchFields = [
          patient.firstName,
          patient.lastName,
          patient.email,
          patient.phone,
          patient.nationalId,
        ].filter(Boolean);

        const matchesSearch = searchFields.some(field => 
          field?.toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      // Age range filter
      if (options.ageRange && patient.dateOfBirth) {
        const age = Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < options.ageRange.min || age > options.ageRange.max) {
          return false;
        }
      }

      // Gender filter
      if (options.gender && patient.gender !== options.gender) {
        return false;
      }

      // Active status filter
      if (options.isActive !== undefined && patient.isActive !== options.isActive) {
        return false;
      }

      return true;
    });
  }, [patients, options]);

  const patientStats = useMemo(() => {
    return {
      total: filteredPatients.length,
      active: filteredPatients.filter(p => p.isActive).length,
      male: filteredPatients.filter(p => p.gender === 'male').length,
      female: filteredPatients.filter(p => p.gender === 'female').length,
      newThisMonth: filteredPatients.filter(p => {
        const createdDate = new Date(p.createdAt);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        return createdDate >= thisMonth;
      }).length,
    };
  }, [filteredPatients]);

  return {
    patients: filteredPatients,
    stats: patientStats,
    loading: loading.patients,
    error: errors.patients,
    addPatient,
    updatePatient,
    deletePatient,
  };
}

// Specialized hook for payments with filtering and analytics
export function usePayments(options?: {
  dateRange?: { start: Date; end: Date };
  status?: string[];
  paymentMethod?: string[];
  patientId?: string;
  minAmount?: number;
  maxAmount?: number;
}) {
  const { payments, loading, errors, addPayment, updatePayment, deletePayment } = useGlobalData();

  const filteredPayments = useMemo(() => {
    if (!options) return payments;

    return payments.filter((payment) => {
      // Date range filter
      if (options.dateRange) {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate < options.dateRange.start || paymentDate > options.dateRange.end) {
          return false;
        }
      }

      // Status filter
      if (options.status && options.status.length > 0) {
        if (!options.status.includes(payment.status)) {
          return false;
        }
      }

      // Payment method filter
      if (options.paymentMethod && options.paymentMethod.length > 0) {
        if (!options.paymentMethod.includes(payment.paymentMethod)) {
          return false;
        }
      }

      // Patient filter
      if (options.patientId && payment.patientId !== options.patientId) {
        return false;
      }

      // Amount range filter
      if (options.minAmount && payment.amount < options.minAmount) {
        return false;
      }

      if (options.maxAmount && payment.amount > options.maxAmount) {
        return false;
      }

      return true;
    });
  }, [payments, options]);

  const paymentStats = useMemo(() => {
    const today = new Date().toDateString();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const todayPayments = filteredPayments.filter(p => 
      new Date(p.createdAt).toDateString() === today
    );
    
    const thisMonthPayments = filteredPayments.filter(p => 
      new Date(p.createdAt) >= thisMonth
    );

    return {
      total: filteredPayments.length,
      totalAmount: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      todayAmount: todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      thisMonthAmount: thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingAmount: filteredPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      completedAmount: filteredPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      averageAmount: filteredPayments.length > 0 
        ? filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / filteredPayments.length 
        : 0,
    };
  }, [filteredPayments]);

  return {
    payments: filteredPayments,
    stats: paymentStats,
    loading: loading.payments,
    error: errors.payments,
    addPayment,
    updatePayment,
    deletePayment,
  };
}

// Specialized hook for inventory with low stock alerts
export function useInventory(options?: {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
}) {
  const { inventory, loading, errors, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useGlobalData();

  const filteredInventory = useMemo(() => {
    if (!options) return inventory;

    return inventory.filter((item) => {
      // Search filter
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        const searchFields = [
          item.name,
          item.description,
          item.barcode,
          item.category,
        ].filter(Boolean);

        const matchesSearch = searchFields.some(field => 
          field?.toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      // Category filter
      if (options.category && item.category !== options.category) {
        return false;
      }

      // Low stock filter
      if (options.lowStockOnly) {
        const isLowStock = (item.currentStock || 0) <= (item.minStock || 0);
        if (!isLowStock) return false;
      }

      // Out of stock filter
      if (options.outOfStockOnly) {
        const isOutOfStock = (item.currentStock || 0) === 0;
        if (!isOutOfStock) return false;
      }

      return true;
    });
  }, [inventory, options]);

  const inventoryStats = useMemo(() => {
    return {
      total: filteredInventory.length,
      lowStock: filteredInventory.filter(item => 
        (item.currentStock || 0) <= (item.minStock || 0) && (item.currentStock || 0) > 0
      ).length,
      outOfStock: filteredInventory.filter(item => 
        (item.currentStock || 0) === 0
      ).length,
      totalValue: filteredInventory.reduce((sum, item) => 
        sum + ((item.currentStock || 0) * (item.unitPrice || 0)), 0
      ),
      categories: [...new Set(filteredInventory.map(item => item.category).filter(Boolean))],
    };
  }, [filteredInventory]);

  return {
    inventory: filteredInventory,
    stats: inventoryStats,
    loading: loading.inventory,
    error: errors.inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  };
}

// Specialized hook for notifications with filtering and management
export function useNotifications(options?: {
  unreadOnly?: boolean;
  type?: string[];
  priority?: string[];
  dateRange?: { start: Date; end: Date };
}) {
  const { 
    notifications, 
    loading, 
    errors, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
  } = useGlobalData();

  const filteredNotifications = useMemo(() => {
    if (!options) return notifications;

    return notifications.filter((notification) => {
      // Unread filter
      if (options.unreadOnly && notification.read) {
        return false;
      }

      // Type filter
      if (options.type && options.type.length > 0) {
        if (!options.type.includes(notification.type)) {
          return false;
        }
      }

      // Priority filter
      if (options.priority && options.priority.length > 0) {
        if (!options.priority.includes(notification.priority)) {
          return false;
        }
      }

      // Date range filter
      if (options.dateRange) {
        const notificationDate = new Date(notification.createdAt);
        if (notificationDate < options.dateRange.start || notificationDate > options.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, options]);

  const notificationStats = useMemo(() => {
    return {
      total: filteredNotifications.length,
      unread: filteredNotifications.filter(n => !n.read).length,
      high: filteredNotifications.filter(n => n.priority === 'high').length,
      medium: filteredNotifications.filter(n => n.priority === 'medium').length,
      low: filteredNotifications.filter(n => n.priority === 'low').length,
      types: [...new Set(filteredNotifications.map(n => n.type))],
    };
  }, [filteredNotifications]);

  return {
    notifications: filteredNotifications,
    stats: notificationStats,
    loading: loading.notifications,
    error: errors.notifications,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification,
  };
}

// Combined hook for dashboard statistics
export function useDashboardStats() {
  const { stats, connectionStatus, isOnline } = useGlobalData();
  
  const enhancedStats = useMemo(() => {
    return {
      ...stats,
      connectionStatus,
      isOnline,
      lastUpdated: new Date(),
    };
  }, [stats, connectionStatus, isOnline]);

  return enhancedStats;
}

// Hook for real-time data updates (for components that need to react to changes)
export function useRealtimeUpdates() {
  const { onDataUpdate, onError, onConnectionChange, forceRestartManager } = useGlobalData();

  return {
    onDataUpdate,
    onError,
    onConnectionChange,
    forceRestartManager,
  };
} 