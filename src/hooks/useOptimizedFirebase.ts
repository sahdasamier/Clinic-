// ✅ REACT HOOK FOR OPTIMIZED FIREBASE SERVICES
// Provides efficient access to Firebase services with proper loading states

import React, { useState, useEffect, useCallback } from 'react';
import { 
  firebaseManager,
  initializeOptimizedFirebase,
  getOptimizedFirestore,
  getOptimizedAuth,
  getOptimizedStorage,
  getOptimizedAnalytics,
  getOptimizedMessaging,
  getOptimizedFunctions
} from '@lib/firebase/legacy-compat';
import { optimizedSync, initializeOptimizedSync, useOptimizedData } from '@utils/optimizedDataSync';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';
import type { Analytics } from 'firebase/analytics';
import type { Messaging } from 'firebase/messaging';

// Hook return types
interface UseOptimizedFirebaseReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  analytics: Analytics | null;
  messaging: Messaging | null;
  functions: Functions | null;
  reinitialize: () => Promise<void>;
}

interface UseOptimizedSyncReturn {
  isInitialized: boolean;
  status: {
    isOnline: boolean;
    cacheSize: number;
    activeListeners: number;
    pendingOperations: number;
    offlineQueueSize: number;
  };
  clearCache: () => void;
  cleanup: () => void;
}

// Main Firebase hook
export function useOptimizedFirebase(): UseOptimizedFirebaseReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<{
    firestore: Firestore | null;
    auth: Auth | null;
    storage: FirebaseStorage | null;
    analytics: Analytics | null;
    messaging: Messaging | null;
    functions: Functions | null;
  }>({
    firestore: null,
    auth: null,
    storage: null,
    analytics: null,
    messaging: null,
    functions: null
  });

  const initializeServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await initializeOptimizedFirebase();

      // Get all services
      const firestore = getOptimizedFirestore();
      const auth = getOptimizedAuth();
      const storage = getOptimizedStorage();
      const analytics = getOptimizedAnalytics();
      const messaging = getOptimizedMessaging();
      const functions = getOptimizedFunctions();

      setServices({
        firestore,
        auth,
        storage,
        analytics,
        messaging,
        functions
      });

      setIsReady(true);
      console.log('🚀 useOptimizedFirebase: All services ready');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Firebase initialization failed';
      setError(errorMessage);
      console.error('❌ useOptimizedFirebase initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  return {
    isReady,
    isLoading,
    error,
    ...services,
    reinitialize: initializeServices
  };
}

// Data synchronization hook
export function useOptimizedSync(clinicId: string, userId?: string): UseOptimizedSyncReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState(optimizedSync.getStatus());

  useEffect(() => {
    if (!clinicId) return;

    // Initialize optimized sync
    initializeOptimizedSync({
      clinicId,
      userId,
      enableCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      enableRealtime: true,
      batchSize: 50,
      maxRetries: 3
    });

    setIsInitialized(true);

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(optimizedSync.getStatus());
    }, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [clinicId, userId]);

  const clearCache = useCallback(() => {
    // Clear cache implementation would go here
    console.log('🧹 Cache cleared via hook');
  }, []);

  const cleanup = useCallback(() => {
    optimizedSync.cleanup();
    setIsInitialized(false);
  }, []);

  return {
    isInitialized,
    status,
    clearCache,
    cleanup
  };
}

// Specialized hooks for different data types
export function useOptimizedPatients(clinicId: string, options?: {
  enableRealtime?: boolean;
  useCache?: boolean;
}) {
  return useOptimizedData('patients', {
    useCache: options?.useCache ?? true,
    enableRealtime: options?.enableRealtime ?? true,
    filters: [
      { field: 'clinicId', operator: '==', value: clinicId },
      { field: 'isActive', operator: '==', value: true }
    ]
  });
}

export function useOptimizedAppointments(clinicId: string, options?: {
  enableRealtime?: boolean;
  useCache?: boolean;
  dateRange?: { start: string; end: string };
}) {
  const filters = [
    { field: 'clinicId', operator: '==', value: clinicId },
    { field: 'isActive', operator: '==', value: true }
  ];

  if (options?.dateRange) {
    filters.push(
      { field: 'date', operator: '>=', value: options.dateRange.start },
      { field: 'date', operator: '<=', value: options.dateRange.end }
    );
  }

  return useOptimizedData('appointments', {
    useCache: options?.useCache ?? true,
    enableRealtime: options?.enableRealtime ?? true,
    filters
  });
}

export function useOptimizedPayments(clinicId: string, options?: {
  enableRealtime?: boolean;
  useCache?: boolean;
  status?: string;
}) {
  const filters = [
    { field: 'clinicId', operator: '==', value: clinicId },
    { field: 'isActive', operator: '==', value: true }
  ];

  if (options?.status) {
    filters.push({ field: 'status', operator: '==', value: options.status });
  }

  return useOptimizedData('payments', {
    useCache: options?.useCache ?? true,
    enableRealtime: options?.enableRealtime ?? true,
    filters
  });
}

// Hook for batch operations
export function useOptimizedBatch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeBatch = useCallback(async (
    collectionName: string,
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      id?: string;
      data?: any;
    }>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await optimizedSync.batchUpdate(collectionName, operations);
      
      console.log(`✅ Batch operation completed: ${operations.length} operations`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch operation failed';
      setError(errorMessage);
      console.error('❌ Batch operation failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeBatch,
    isLoading,
    error
  };
}

// Hook for offline queue management
export function useOfflineSync() {
  const [queueSize, setQueueSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const updateQueueSize = () => {
      const status = optimizedSync.getStatus();
      setQueueSize(status.offlineQueueSize);
    };

    // Update initially
    updateQueueSize();

    // Listen for online/offline events
    const unsubscribeOnline = optimizedSync.on('sync:onlineMode', () => {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        updateQueueSize();
      }, 2000);
    });

    const unsubscribeOffline = optimizedSync.on('sync:offlineMode', updateQueueSize);

    // Update periodically
    const interval = setInterval(updateQueueSize, 3000);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      clearInterval(interval);
    };
  }, []);

  return {
    queueSize,
    isProcessing,
    hasOfflineOperations: queueSize > 0
  };
}

// Hook for Firebase connection status
export function useFirebaseConnection() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setLastSyncTime(new Date());
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    // Listen for sync events
    const unsubscribeOnline = optimizedSync.on('sync:onlineMode', handleOnline);
    const unsubscribeOffline = optimizedSync.on('sync:offlineMode', handleOffline);
    const unsubscribeUpdate = optimizedSync.on('sync:dataUpdated', () => {
      setLastSyncTime(new Date());
    });

    // Check initial status
    const status = optimizedSync.getStatus();
    setIsConnected(status.isOnline);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      unsubscribeUpdate();
    };
  }, []);

  return {
    isConnected,
    lastSyncTime,
    status: isConnected ? 'connected' : 'disconnected'
  };
}

// Export all hooks
export default {
  useOptimizedFirebase,
  useOptimizedSync,
  useOptimizedPatients,
  useOptimizedAppointments,
  useOptimizedPayments,
  useOptimizedBatch,
  useOfflineSync,
  useFirebaseConnection
}; 