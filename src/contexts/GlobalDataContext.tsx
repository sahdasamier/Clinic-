import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { FirebaseRealtimeManager } from '../services/FirebaseRealtimeManager';
import { Appointment, Patient, Notification, Clinic } from '../types/models';
import { Payment } from '../services/PaymentService';
import { InventoryItem } from '../services/InventoryService';

// Global data state interface
interface GlobalDataState {
  appointments: Appointment[];
  patients: Patient[];
  payments: Payment[];
  inventory: InventoryItem[];
  notifications: Notification[];
  clinics: Clinic[];
  loading: {
    appointments: boolean;
    patients: boolean;
    payments: boolean;
    inventory: boolean;
    notifications: boolean;
    clinics: boolean;
  };
  errors: {
    appointments: string | null;
    patients: string | null;
    payments: string | null;
    inventory: string | null;
    notifications: string | null;
    clinics: string | null;
  };
  lastUpdated: {
    appointments: Date | null;
    patients: Date | null;
    payments: Date | null;
    inventory: Date | null;
    notifications: Date | null;
    clinics: Date | null;
  };
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  isOnline: boolean;
}

// Global data context type
interface GlobalDataContextType extends GlobalDataState {
  // Data operations
  refreshData: (collections?: string[]) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<string>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<string>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<string>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<string>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Statistics and analytics (computed in real-time)
  stats: {
    totalAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    totalRevenue: number;
    lowStockItems: number;
    unreadNotifications: number;
  };
  
  // Real-time event listeners
  onDataUpdate: (callback: (collection: string, data: any[]) => void) => () => void;
  onError: (callback: (collection: string, error: string) => void) => () => void;
  onConnectionChange: (callback: (status: 'connected' | 'disconnected' | 'reconnecting') => void) => () => void;
  
  // Emergency management
  forceRestartManager: () => Promise<void>;
}

const initialState: GlobalDataState = {
  appointments: [],
  patients: [],
  payments: [],
  inventory: [],
  notifications: [],
  clinics: [],
  loading: {
    appointments: true,
    patients: true,
    payments: true,
    inventory: true,
    notifications: true,
    clinics: true,
  },
  errors: {
    appointments: null,
    patients: null,
    payments: null,
    inventory: null,
    notifications: null,
    clinics: null,
  },
  lastUpdated: {
    appointments: null,
    patients: null,
    payments: null,
    inventory: null,
    notifications: null,
    clinics: null,
  },
  connectionStatus: 'disconnected',
  isOnline: navigator.onLine,
};

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

interface GlobalDataProviderProps {
  children: ReactNode;
}

export const GlobalDataProvider: React.FC<GlobalDataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<GlobalDataState>(initialState);
  const [realtimeManager, setRealtimeManager] = useState<FirebaseRealtimeManager | null>(null);
  
  // Event listeners for real-time updates
  const [dataUpdateListeners] = useState<Set<(collection: string, data: any[]) => void>>(new Set());
  const [errorListeners] = useState<Set<(collection: string, error: string) => void>>(new Set());
  const [connectionListeners] = useState<Set<(status: 'connected' | 'disconnected' | 'reconnecting') => void>>(new Set());

  // Initialize Firebase Realtime Manager
  useEffect(() => {
    if (!user || !isAuthenticated) {
      if (realtimeManager) {
        console.log('🔄 User signed out, cleaning up Firebase Realtime Manager');
        realtimeManager.cleanup();
      }
      setRealtimeManager(null);
      setState(initialState);
      return;
    }

    // Prevent duplicate manager creation
    if (realtimeManager) {
      console.log('⚠️ Firebase Realtime Manager already exists, skipping creation');
      return;
    }

    // Wait for Firebase to be ready before creating the manager
    const initializeManager = async () => {
      try {
        console.log('🚀 Initializing Firebase Realtime Manager for user:', user.email);
        
        // ✅ ENHANCED: Shorter timeout and better fallback for quick page loads
        const { initializeOptimizedFirebase, firebaseManager } = await import('../api/firebaseOptimized');
        
        let retries = 0;
        const maxRetries = 3; // Reduced retries for faster fallback
        
        while (!firebaseManager.isReady() && retries < maxRetries) {
          console.log(`⏳ Waiting for optimized Firebase to initialize... (attempt ${retries + 1}/${maxRetries})`);
          
          try {
            await initializeOptimizedFirebase();
          } catch (initError) {
            console.warn(`⚠️ Firebase initialization attempt ${retries + 1} failed:`, initError);
          }
          
          if (!firebaseManager.isReady()) {
            retries++;
            if (retries < maxRetries) {
              // Shorter wait times for better UX
              const waitTime = 1000 * retries; // 1s, 2s, 3s
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
        }
        
        if (!firebaseManager.isReady()) {
          console.warn(`⚠️ Firebase failed to initialize after ${maxRetries} attempts. Using offline mode.`);
          // ✅ ENHANCED: Don't throw error, set loading to false and let app work with empty data
          setState(prev => ({
            ...prev,
            loading: {
              appointments: false,
              patients: false,
              payments: false,
              inventory: false,
              notifications: false,
              clinics: false,
            },
            connectionStatus: 'disconnected',
            errors: {
              appointments: 'Firebase offline - using cached data',
              patients: 'Firebase offline - using cached data',
              payments: 'Firebase offline - using cached data',
              inventory: 'Firebase offline - using cached data',
              notifications: 'Firebase offline - using cached data',
              clinics: 'Firebase offline - using cached data',
            }
          }));
          return; // Don't throw, just continue with offline state
        }
        
        console.log('✅ Optimized Firebase confirmed ready, proceeding with manager creation');
        
        // ✅ ENHANCED: Quick verification without blocking
        try {
          const { getOptimizedFirestore } = await import('../api/firebaseOptimized');
          const testDb = getOptimizedFirestore();
          if (!testDb) {
            throw new Error('Firestore instance is null');
          }
          console.log('✅ Firestore access verified');
        } catch (testError) {
          console.warn('⚠️ Firestore verification failed, continuing with limited functionality:', testError);
          // Don't throw, continue with limited functionality
        }
        
        const manager = new FirebaseRealtimeManager({
          userId: user.uid,
          userEmail: user.email || '',
          clinicId: 'demo-clinic', // Use the demo clinic ID that matches your data
          onConnectionChange: (status) => {
            setState(prev => ({ ...prev, connectionStatus: status }));
            connectionListeners.forEach(callback => callback(status));
          },
          onDataUpdate: (collection, data) => {
            setState(prev => ({
              ...prev,
              [collection]: data,
              loading: { ...prev.loading, [collection]: false },
              errors: { ...prev.errors, [collection]: null },
              lastUpdated: { ...prev.lastUpdated, [collection]: new Date() }
            }));
            dataUpdateListeners.forEach(callback => callback(collection, data));
          },
          onError: (collection, error) => {
            console.warn(`⚠️ Collection ${collection} error:`, error);
            setState(prev => ({
              ...prev,
              loading: { ...prev.loading, [collection]: false },
              errors: { ...prev.errors, [collection]: error }
            }));
            errorListeners.forEach(callback => callback(collection, error));
          }
        });

        setRealtimeManager(manager);
        console.log('✅ Firebase Realtime Manager initialized successfully');
        
        // ✅ ENHANCED: Set initial loading state to false after a short delay to ensure pages load
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            loading: {
              appointments: false,
              patients: false,
              payments: false,
              inventory: false,
              notifications: false,
              clinics: false,
            },
            connectionStatus: 'connected'
          }));
        }, 2000); // Give Firebase 2 seconds to load data, then allow pages to show
        
        // Expose debugging functions to window
        if (typeof window !== 'undefined') {
          (window as any).restartFirebaseManager = async () => {
            console.log('🔄 Manual restart triggered via debug console...');
            await manager.forceRestart();
          };
          (window as any).getFirebaseManagerStatus = () => {
            console.log('📊 Firebase Manager Status:');
            const status = manager.getManagerStatus();
            console.table(status);
            return status;
          };
          console.log('🔧 Debug functions available:');
          console.log('   - window.restartFirebaseManager() - Force restart manager');
          console.log('   - window.getFirebaseManagerStatus() - Get detailed status');
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize Firebase Realtime Manager:', error);
        
        // ✅ ENHANCED: Don't show errors as blocking, set loading to false so pages can load
        const errorMessage = error instanceof Error ? error.message : 'Unknown Firebase initialization error';
        
        setState(prev => ({
          ...prev,
          errors: {
            appointments: `Firebase offline: ${errorMessage}`,
            patients: `Firebase offline: ${errorMessage}`,
            payments: `Firebase offline: ${errorMessage}`,
            inventory: `Firebase offline: ${errorMessage}`,
            notifications: `Firebase offline: ${errorMessage}`,
            clinics: `Firebase offline: ${errorMessage}`,
          },
          loading: {
            appointments: false,
            patients: false,
            payments: false,
            inventory: false,
            notifications: false,
            clinics: false,
          },
          connectionStatus: 'disconnected'
        }));
        
        // ✅ NEW: Dispatch a global error event for debugging
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('firebaseInitializationError', {
            detail: { error: errorMessage, timestamp: new Date() }
          }));
        }
      }
    };

    // Call the async initialization function
    initializeManager();

    return () => {
      if (realtimeManager) {
        console.log('🔄 Cleaning up Firebase Realtime Manager');
        (realtimeManager as any).cleanup?.();
      }
    };
  }, [user, isAuthenticated, realtimeManager]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      console.log('🌐 App back online - resuming real-time sync');
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      console.log('📱 App offline - using cached data');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Computed statistics
  const stats = React.useMemo(() => {
    const today = new Date().toDateString();
    
    return {
      totalAppointments: state.appointments.length,
      todayAppointments: state.appointments.filter(apt => 
        new Date(apt.date).toDateString() === today
      ).length,
      totalPatients: state.patients.length,
      totalRevenue: state.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
      lowStockItems: state.inventory.filter(item => 
        (item.quantity || 0) <= (item.minQuantity || 0)
      ).length,
      unreadNotifications: state.notifications.filter(notif => !notif.read).length,
    };
  }, [state.appointments, state.patients, state.payments, state.inventory, state.notifications]);

  // Data operations
  const refreshData = useCallback(async (collections?: string[]) => {
    if (!realtimeManager) return;
    
    try {
      await realtimeManager.refreshCollections(collections);
      console.log('✅ Data refresh completed for collections:', collections || 'all');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  }, [realtimeManager]);

  const addAppointment = useCallback(async (appointment: Omit<Appointment, 'id'>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    return await realtimeManager.addDocument('appointments', appointment);
  }, [realtimeManager]);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.updateDocument('appointments', id, updates);
  }, [realtimeManager]);

  const deleteAppointment = useCallback(async (id: string) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.deleteDocument('appointments', id);
  }, [realtimeManager]);

  const addPatient = useCallback(async (patient: Omit<Patient, 'id'>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    return await realtimeManager.addDocument('patients', patient);
  }, [realtimeManager]);

  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.updateDocument('patients', id, updates);
  }, [realtimeManager]);

  const deletePatient = useCallback(async (id: string) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.deleteDocument('patients', id);
  }, [realtimeManager]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id'>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    return await realtimeManager.addDocument('payments', payment);
  }, [realtimeManager]);

  const updatePayment = useCallback(async (id: string, updates: Partial<Payment>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.updateDocument('payments', id, updates);
  }, [realtimeManager]);

  const deletePayment = useCallback(async (id: string) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.deleteDocument('payments', id);
  }, [realtimeManager]);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    return await realtimeManager.addDocument('inventory', item);
  }, [realtimeManager]);

  const updateInventoryItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.updateDocument('inventory', id, updates);
  }, [realtimeManager]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.deleteDocument('inventory', id);
  }, [realtimeManager]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.updateDocument('notifications', id, { read: true, readAt: new Date() });
  }, [realtimeManager]);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    const unreadNotifications = state.notifications.filter(notif => !notif.read);
    const promises = unreadNotifications.map(notif => 
      realtimeManager.updateDocument('notifications', notif.id, { read: true, readAt: new Date() })
    );
    await Promise.all(promises);
  }, [realtimeManager, state.notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!realtimeManager) throw new Error('Realtime manager not initialized');
    await realtimeManager.deleteDocument('notifications', id);
  }, [realtimeManager]);

  // Event listener registration
  const onDataUpdate = useCallback((callback: (collection: string, data: any[]) => void) => {
    dataUpdateListeners.add(callback);
    return () => dataUpdateListeners.delete(callback);
  }, [dataUpdateListeners]);

  const onError = useCallback((callback: (collection: string, error: string) => void) => {
    errorListeners.add(callback);
    return () => errorListeners.delete(callback);
  }, [errorListeners]);

  const onConnectionChange = useCallback((callback: (status: 'connected' | 'disconnected' | 'reconnecting') => void) => {
    connectionListeners.add(callback);
    return () => connectionListeners.delete(callback);
  }, [connectionListeners]);

  const value: GlobalDataContextType = {
    ...state,
    stats,
    refreshData,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addPatient,
    updatePatient,
    deletePatient,
    addPayment,
    updatePayment,
    deletePayment,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    onDataUpdate,
    onError,
    onConnectionChange,
    
    // Emergency restart function for Firebase issues
    forceRestartManager: async () => {
      try {
        if (realtimeManager) {
          console.log('🔄 Force restarting Firebase manager...');
          await realtimeManager.forceRestart();
        }
      } catch (error) {
        console.error('❌ Failed to restart manager:', error);
      }
    }
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};

// Custom hook to use the global data context
export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}



export default GlobalDataContext; 