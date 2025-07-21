// ✅ OPTIMIZED DATA SYNC MANAGER
// Efficient cross-page data synchronization with minimal Firebase calls

import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
  type DocumentData,
  type QuerySnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import React from 'react';
import { getOptimizedFirestore } from '../api/firebaseOptimized';

// Data cache with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

// Optimized sync configuration
interface SyncConfig {
  clinicId: string;
  userId?: string;
  enableCache: boolean;
  cacheTTL: number; // milliseconds
  enableRealtime: boolean;
  batchSize: number;
  maxRetries: number;
}

// Event types for cross-page communication
export const SYNC_EVENTS = {
  DATA_UPDATED: 'sync:dataUpdated',
  CACHE_CLEARED: 'sync:cacheCleared',
  OFFLINE_MODE: 'sync:offlineMode',
  ONLINE_MODE: 'sync:onlineMode',
  SYNC_ERROR: 'sync:error',
  BATCH_COMPLETE: 'sync:batchComplete'
} as const;

// Data types
export interface SyncableData {
  id: string;
  clinicId: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Patient extends SyncableData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  insurance?: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface Appointment extends SyncableData {
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  duration: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: string;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  appointmentFee?: number;
}

export interface Payment extends SyncableData {
  patientId?: string;
  patientName: string;
  doctorName?: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue' | 'partial';
  date: string;
  dueDate?: string;
  method: string;
  description?: string;
  invoiceId?: string;
}

// Optimized Data Sync Manager
class OptimizedDataSyncManager {
  private static instance: OptimizedDataSyncManager;
  private config: SyncConfig | null = null;
  private cache = new Map<string, CacheEntry<any>>();
  private listeners = new Map<string, Unsubscribe>();
  private eventListeners = new Map<string, Set<Function>>();
  private pendingOperations = new Map<string, Promise<any>>();
  private isOnline = true;
  private offlineQueue: Array<() => Promise<any>> = [];
  private batchOperations = new Map<string, Array<any>>();
  private batchTimers = new Map<string, NodeJS.Timeout>();

  private constructor() {
    this.setupNetworkListeners();
  }

  static getInstance(): OptimizedDataSyncManager {
    if (!OptimizedDataSyncManager.instance) {
      OptimizedDataSyncManager.instance = new OptimizedDataSyncManager();
    }
    return OptimizedDataSyncManager.instance;
  }

  // Initialize with configuration
  initialize(config: SyncConfig): void {
    this.config = config;
    console.log('🚀 OptimizedDataSync initialized for clinic:', config.clinicId);
    
    // Setup cross-page communication
    this.setupCrossPageEvents();
    
    // Start real-time listeners if enabled
    if (config.enableRealtime) {
      this.startRealtimeListeners();
    }
  }

  // Setup network state monitoring
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processOfflineQueue();
        this.broadcastEvent(SYNC_EVENTS.ONLINE_MODE, { timestamp: Date.now() });
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.broadcastEvent(SYNC_EVENTS.OFFLINE_MODE, { timestamp: Date.now() });
      });
    }
  }

  // Setup cross-page event communication
  private setupCrossPageEvents(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith('clinic-sync:')) {
          const eventType = event.key.replace('clinic-sync:', '');
          const data = event.newValue ? JSON.parse(event.newValue) : null;
          this.handleCrossPageEvent(eventType, data);
        }
      });
    }
  }

  // Handle cross-page events
  private handleCrossPageEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  // Broadcast event to all tabs/pages
  private broadcastEvent(eventType: string, data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`clinic-sync:${eventType}`, JSON.stringify({
        ...data,
        timestamp: Date.now(),
        clinicId: this.config?.clinicId
      }));
      
      // Clear the item after broadcasting to allow re-triggering
      setTimeout(() => {
        localStorage.removeItem(`clinic-sync:${eventType}`);
      }, 100);
    }
  }

  // Cache management
  private setCache<T>(key: string, data: T, ttl?: number): void {
    if (!this.config?.enableCache) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL
    });
  }

  private getCache<T>(key: string): T | null {
    if (!this.config?.enableCache) return null;
    
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    this.broadcastEvent(SYNC_EVENTS.CACHE_CLEARED, { pattern });
  }

  // Optimized data fetching with caching
  async fetchData<T extends SyncableData>(
    collectionName: string, 
    options: {
      useCache?: boolean;
      forceFresh?: boolean;
      filters?: Array<{ field: string; operator: any; value: any }>;
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      limit?: number;
    } = {}
  ): Promise<T[]> {
    const cacheKey = this.generateCacheKey(collectionName, options);
    
    // Check cache first (unless force fresh is requested)
    if (!options.forceFresh && options.useCache !== false) {
      const cached = this.getCache<T[]>(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit for ${collectionName}`);
        return cached;
      }
    }

    // Check for pending operation to avoid duplicate requests
    if (this.pendingOperations.has(cacheKey)) {
      console.log(`⏳ Awaiting pending operation for ${collectionName}`);
      return this.pendingOperations.get(cacheKey);
    }

    // Create new fetch operation
    const operation = this.performFetch<T>(collectionName, options);
    this.pendingOperations.set(cacheKey, operation);

    try {
      const result = await operation;
      
      // Cache the result
      this.setCache(cacheKey, result);
      
      // Broadcast update event
      this.broadcastEvent(SYNC_EVENTS.DATA_UPDATED, {
        collection: collectionName,
        count: result.length,
        cacheKey
      });
      
      return result;
    } finally {
      this.pendingOperations.delete(cacheKey);
    }
  }

  // Perform actual Firebase fetch
  private async performFetch<T extends SyncableData>(
    collectionName: string,
    options: any
  ): Promise<T[]> {
    const db = getOptimizedFirestore();
    const collectionRef = collection(db, collectionName);
    
    let q = query(collectionRef, where('clinicId', '==', this.config!.clinicId));
    
    // Add additional filters
    if (options.filters) {
      options.filters.forEach((filter: any) => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Add ordering
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }
    
    const snapshot = await getDocs(q);
    const data: T[] = [];
    
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    
    console.log(`🔥 Fetched ${data.length} ${collectionName} from Firebase`);
    return data;
  }

  // Optimized batch operations
  async batchUpdate<T extends SyncableData>(
    collectionName: string,
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      id?: string;
      data?: Partial<T>;
    }>
  ): Promise<void> {
    if (!this.isOnline) {
      // Queue for offline processing
      this.offlineQueue.push(() => this.batchUpdate(collectionName, operations));
      return;
    }

    const db = getOptimizedFirestore();
    const batch = writeBatch(db);
    
    for (const operation of operations) {
      const docRef = operation.id 
        ? doc(db, collectionName, operation.id)
        : doc(collection(db, collectionName));
      
      switch (operation.type) {
        case 'create':
          batch.set(docRef, {
            ...operation.data,
            clinicId: this.config!.clinicId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true
          });
          break;
          
        case 'update':
          batch.update(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp()
          });
          break;
          
        case 'delete':
          batch.update(docRef, {
            isActive: false,
            updatedAt: serverTimestamp()
          });
          break;
      }
    }
    
    await batch.commit();
    
    // Clear related cache
    this.clearCache(collectionName);
    
    // Broadcast batch completion
    this.broadcastEvent(SYNC_EVENTS.BATCH_COMPLETE, {
      collection: collectionName,
      operations: operations.length
    });
    
    console.log(`✅ Batch operation completed: ${operations.length} ${collectionName} operations`);
  }

  // Real-time listeners with automatic cleanup
  startRealtimeListener<T extends SyncableData>(
    collectionName: string,
    callback: (data: T[]) => void,
    filters?: Array<{ field: string; operator: any; value: any }>
  ): () => void {
    const db = getOptimizedFirestore();
    const collectionRef = collection(db, collectionName);
    
    let q = query(
      collectionRef, 
      where('clinicId', '==', this.config!.clinicId),
      where('isActive', '==', true)
    );
    
    // Add additional filters
    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: T[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as T);
      });
      
      // Update cache
      const cacheKey = this.generateCacheKey(collectionName, { filters });
      this.setCache(cacheKey, data);
      
      // Call callback
      callback(data);
      
      // Broadcast update
      this.broadcastEvent(SYNC_EVENTS.DATA_UPDATED, {
        collection: collectionName,
        count: data.length,
        source: 'realtime'
      });
    }, (error) => {
      console.error(`❌ Realtime listener error for ${collectionName}:`, error);
      this.broadcastEvent(SYNC_EVENTS.SYNC_ERROR, {
        collection: collectionName,
        error: error.message
      });
    });
    
    // Store unsubscribe function
    const listenerKey = `${collectionName}_${Date.now()}`;
    this.listeners.set(listenerKey, unsubscribe);
    
    console.log(`🔥 Real-time listener started for ${collectionName}`);
    
    // Return cleanup function
    return () => {
      unsubscribe();
      this.listeners.delete(listenerKey);
      console.log(`🔥 Real-time listener stopped for ${collectionName}`);
    };
  }

  // Start common real-time listeners
  private startRealtimeListeners(): void {
    if (!this.config) return;
    
    // Patients listener
    this.startRealtimeListener<Patient>('patients', (patients) => {
      console.log(`📊 Real-time patients update: ${patients.length} patients`);
    });
    
    // Appointments listener
    this.startRealtimeListener<Appointment>('appointments', (appointments) => {
      console.log(`📊 Real-time appointments update: ${appointments.length} appointments`);
    });
    
    // Payments listener
    this.startRealtimeListener<Payment>('payments', (payments) => {
      console.log(`📊 Real-time payments update: ${payments.length} payments`);
    });
  }

  // Process offline queue when back online
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;
    
    console.log(`🔄 Processing ${this.offlineQueue.length} offline operations`);
    
    const operations = [...this.offlineQueue];
    this.offlineQueue = [];
    
    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.error('Failed to process offline operation:', error);
        // Re-queue failed operations
        this.offlineQueue.push(operation);
      }
    }
  }

  // Generate cache key
  private generateCacheKey(collectionName: string, options: any): string {
    return `${collectionName}_${this.config?.clinicId}_${JSON.stringify(options)}`;
  }

  // Event subscription
  on(eventType: string, callback: Function): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(callback);
    
    return () => {
      this.eventListeners.get(eventType)?.delete(callback);
    };
  }

  // Cleanup all listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    this.clearCache();
    this.eventListeners.clear();
    console.log('🧹 OptimizedDataSync cleaned up');
  }

  // Get sync status
  getStatus(): {
    isOnline: boolean;
    cacheSize: number;
    activeListeners: number;
    pendingOperations: number;
    offlineQueueSize: number;
  } {
    return {
      isOnline: this.isOnline,
      cacheSize: this.cache.size,
      activeListeners: this.listeners.size,
      pendingOperations: this.pendingOperations.size,
      offlineQueueSize: this.offlineQueue.length
    };
  }
}

// Export singleton instance
export const optimizedSync = OptimizedDataSyncManager.getInstance();

// Convenience functions
export function initializeOptimizedSync(config: SyncConfig): void {
  optimizedSync.initialize(config);
}

export function useOptimizedData<T extends SyncableData>(
  collectionName: string,
  options?: {
    useCache?: boolean;
    enableRealtime?: boolean;
    filters?: Array<{ field: string; operator: any; value: any }>;
  }
): {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await optimizedSync.fetchData<T>(collectionName, options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [collectionName, options]);

  React.useEffect(() => {
    fetchData();

    // Setup real-time listener if enabled
    if (options?.enableRealtime) {
      const unsubscribe = optimizedSync.startRealtimeListener<T>(
        collectionName,
        setData,
        options.filters
      );
      return unsubscribe;
    }
  }, [fetchData, options?.enableRealtime]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export default optimizedSync; 