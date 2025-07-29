import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
  enableNetwork,
  disableNetwork,
  type Unsubscribe,
  type DocumentData,
  type QueryConstraint,
  type FirestoreError,
  type Firestore,
} from 'firebase/firestore';
import { httpsCallable, type Functions } from 'firebase/functions';
import { type Auth } from 'firebase/auth';
import { getOptimizedFirestore, getOptimizedAuth, getOptimizedFunctions } from '../api/firebaseOptimized';

// Configuration interface
interface FirebaseRealtimeConfig {
  userId: string;
  userEmail: string;
  clinicId: string;
  onConnectionChange: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  onDataUpdate: (collection: string, data: any[]) => void;
  onError: (collection: string, error: string) => void;
}

// Collection configuration
interface CollectionConfig {
  name: string;
  filters: QueryConstraint[];
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  enableRealtime: boolean;
  cacheDuration: number; // milliseconds
  retryCount: number;
  maxRetries: number;
}

// Cache entry interface
interface CacheEntry {
  data: any[];
  timestamp: number;
  ttl: number;
}

export class FirebaseRealtimeManager {
  private _db: Firestore | null = null;
  private _auth: Auth | null = null;
  private _functions: Functions | null = null;
  private config: FirebaseRealtimeConfig;
  private listeners = new Map<string, Unsubscribe>();
  private cache = new Map<string, CacheEntry>();
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private isInitialized = false;
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  private readonly LISTENER_CLEANUP_DELAY = 1000; // 1 second

  // Lazy-loaded getters for Firebase services
  private get db(): Firestore {
    if (!this._db) {
      try {
        this._db = getOptimizedFirestore();
      } catch (error) {
        console.warn('⚠️ Firestore not yet initialized, retrying...', error);
        throw new Error('Firestore not initialized');
      }
    }
    return this._db;
  }

  private get auth(): Auth {
    if (!this._auth) {
      try {
        this._auth = getOptimizedAuth();
      } catch (error) {
        console.warn('⚠️ Auth not yet initialized, retrying...', error);
        throw new Error('Auth not initialized');
      }
    }
    return this._auth;
  }

  private get functions(): Functions {
    if (!this._functions) {
      try {
        this._functions = getOptimizedFunctions();
      } catch (error) {
        console.warn('⚠️ Functions not yet initialized, retrying...', error);
        throw new Error('Functions not initialized');
      }
    }
    return this._functions;
  }

  // Check if Firebase services are ready
  private checkFirebaseReadiness(): boolean {
    try {
      // Try to access all Firebase services
      const _ = this.db;
      const __ = this.auth;
      const ___ = this.functions;
      return true;
    } catch (error) {
      console.warn('⚠️ Firebase services not ready:', error);
      return false;
    }
  }

  // Simplified collection configurations to prevent assertion errors
  private collections: CollectionConfig[] = [
    {
      name: 'appointments',
      filters: [],
      orderBy: { field: 'date', direction: 'desc' },
      enableRealtime: true,
      cacheDuration: 300000, // 5 minutes
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    },
    {
      name: 'patients',
      filters: [],
      orderBy: { field: 'createdAt', direction: 'desc' },
      enableRealtime: true,
      cacheDuration: 600000, // 10 minutes
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    },
    {
      name: 'payments',
      filters: [],
      orderBy: { field: 'createdAt', direction: 'desc' },
      enableRealtime: true,
      cacheDuration: 300000, // 5 minutes
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    },
    // Temporarily disable other collections to prevent assertion failures
    {
      name: 'inventory',
      filters: [],
      orderBy: { field: 'name', direction: 'asc' },
      enableRealtime: false, // Disabled to prevent errors
      cacheDuration: 900000, // 15 minutes
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    },
    {
      name: 'notifications',
      filters: [],
      orderBy: { field: 'createdAt', direction: 'desc' },
      enableRealtime: false, // Disabled to prevent errors
      cacheDuration: 60000, // 1 minute
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    },
    {
      name: 'clinics',
      filters: [],
      // Temporarily removed orderBy to avoid index requirement
      // To re-enable: orderBy: { field: 'name', direction: 'asc' }
      // Make sure to create the required Firestore index first:
      // https://console.firebase.google.com/project/clinic-d9c0a/firestore/indexes
      orderBy: undefined,
      enableRealtime: false, // Less frequent updates
      cacheDuration: 1800000, // 30 minutes
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    },
  ];

  constructor(config: FirebaseRealtimeConfig) {
    this.config = config;
    
    // Check if Firebase is ready before initializing
    if (!this.checkFirebaseReadiness()) {
      console.warn('⚠️ Firebase not ready at manager creation, will retry during initialization');
    }
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing simplified Firebase Realtime Manager...');

      // Wait for Firebase to be ready with retry logic
      await this.waitForFirebaseReady();

      // Setup connection monitoring with better error handling
      this.setupConnectionMonitoring();

      // Initialize listeners with controlled startup
      await this.setupRealtimeListeners();

      this.isInitialized = true;
      this.connectionStatus = 'connected';
      this.config.onConnectionChange('connected');

      console.log('✅ Simplified Firebase Realtime Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Realtime Manager:', error);
      this.connectionStatus = 'disconnected';
      this.config.onConnectionChange('disconnected');
      this.config.onError('initialization', `Initialization failed: ${error}`);
    }
  }

  private async waitForFirebaseReady(maxRetries: number = 10, delayMs: number = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (this.checkFirebaseReadiness()) {
        console.log(`✅ Firebase ready after ${attempt} attempt(s)`);
        return;
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Firebase not ready (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5; // Exponential backoff
      } else {
        throw new Error(`Firebase services not ready after ${maxRetries} attempts`);
      }
    }
  }

  private setupConnectionMonitoring(): void {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Firebase connection state monitoring
    const auth = this.auth;
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('🔐 User authenticated, starting real-time sync');
        this.safeReconnect();
      } else {
        console.log('🔓 User signed out, stopping real-time sync');
        this.cleanup();
      }
    });
  }

  private handleOnline(): void {
    console.log('🌐 Network back online - enabling Firestore');
    this.safeReconnect();
  }

  private handleOffline(): void {
    console.log('📱 Network offline - Firestore will use cache');
    this.connectionStatus = 'disconnected';
    this.config.onConnectionChange('disconnected');
  }

  private async setupRealtimeListeners(): Promise<void> {
    if (!this.auth.currentUser) {
      console.warn('⚠️ No authenticated user, skipping listener setup');
      return;
    }

    console.log('🔄 Setting up realtime listeners with improved error handling...');

    // Initialize collections sequentially with delays to prevent conflicts
    for (const collectionConfig of this.collections) {
      try {
        if (collectionConfig.enableRealtime) {
          // Add small delay between listener creation to prevent conflicts
          await new Promise(resolve => setTimeout(resolve, 200));
          await this.createSafeRealtimeListener(collectionConfig);
        } else {
          // For non-realtime collections, do initial fetch
          await this.fetchCollectionData(collectionConfig);
        }
      } catch (error) {
        console.error(`❌ Failed to setup ${collectionConfig.name}:`, error);
        // Continue with other collections even if one fails
        this.config.onError(collectionConfig.name, `Setup failed: ${error}`);
      }
    }
  }

  private async createSafeRealtimeListener(collectionConfig: CollectionConfig): Promise<void> {
    try {
      // Prevent duplicate listeners with better checking
      const existingListener = this.listeners.get(collectionConfig.name);
      if (existingListener) {
        console.log(`⚠️ Safely cleaning up existing listener for ${collectionConfig.name}`);
        existingListener();
        this.listeners.delete(collectionConfig.name);
        
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, this.LISTENER_CLEANUP_DELAY));
      }

      // Clear any existing retry timeout
      const existingTimeout = this.retryTimeouts.get(collectionConfig.name);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.retryTimeouts.delete(collectionConfig.name);
      }

      const collectionRef = collection(this.db, collectionConfig.name);
      
      // Build query with simplified filters to prevent assertion errors
      let q = query(collectionRef);

      // Only add clinic filter - simplify to prevent state conflicts
      try {
        q = query(q, where('clinicId', '==', this.config.clinicId));
      } catch (error) {
        console.warn(`⚠️ Skipping clinic filter for ${collectionConfig.name}:`, error);
      }

      // Add ordering with error handling
      if (collectionConfig.orderBy) {
        try {
          q = query(q, orderBy(collectionConfig.orderBy.field, collectionConfig.orderBy.direction));
        } catch (error) {
          console.warn(`⚠️ Skipping ordering for ${collectionConfig.name}:`, error);
        }
      }

      // Create listener with enhanced error handling
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const data: any[] = [];
            snapshot.forEach((doc) => {
              data.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            // Reset retry count on successful update
            collectionConfig.retryCount = 0;

            // Update cache
            this.setCache(collectionConfig.name, data, collectionConfig.cacheDuration);

            // Notify context
            this.config.onDataUpdate(collectionConfig.name, data);

            console.log(`🔥 Real-time update: ${collectionConfig.name} (${data.length} items)`);
          } catch (dataError) {
            console.error(`❌ Error processing snapshot for ${collectionConfig.name}:`, dataError);
            this.config.onError(collectionConfig.name, `Data processing error: ${dataError}`);
          }
        },
        (error: FirestoreError) => {
          console.error(`❌ Real-time listener error for ${collectionConfig.name}:`, error);
          
          // Remove the failed listener immediately
          this.listeners.delete(collectionConfig.name);

          // Handle different error types
          if (this.shouldRetryError(error)) {
            this.scheduleRetry(collectionConfig, error);
          } else {
            console.warn(`⚠️ Not retrying ${collectionConfig.name} due to non-recoverable error:`, error.code);
            this.config.onError(collectionConfig.name, `Non-recoverable error: ${error.code} - ${error.message}`);
            
            // Fall back to cached data or initial fetch
            this.fallbackToCache(collectionConfig);
          }
        }
      );

      // Store unsubscribe function only after successful creation
      this.listeners.set(collectionConfig.name, unsubscribe);

      console.log(`✅ Safe real-time listener created for ${collectionConfig.name}`);
    } catch (error) {
      console.error(`❌ Failed to create safe listener for ${collectionConfig.name}:`, error);
      this.config.onError(collectionConfig.name, `Failed to create listener: ${error}`);
      
      // Fall back to initial fetch for this collection
      this.fallbackToCache(collectionConfig);
    }
  }

  private shouldRetryError(error: FirestoreError): boolean {
    // Only retry for connection-related errors
    const retryableErrors = ['unavailable', 'deadline-exceeded', 'cancelled', 'internal'];
    return retryableErrors.includes(error.code);
  }

  private scheduleRetry(collectionConfig: CollectionConfig, error: FirestoreError): void {
    if (collectionConfig.retryCount >= collectionConfig.maxRetries) {
      console.warn(`⚠️ Max retries exceeded for ${collectionConfig.name}, falling back to cache`);
      this.fallbackToCache(collectionConfig);
      return;
    }

    collectionConfig.retryCount++;
    const delay = this.RETRY_DELAY * Math.pow(2, collectionConfig.retryCount - 1); // Exponential backoff

    console.log(`🔄 Scheduling retry ${collectionConfig.retryCount}/${collectionConfig.maxRetries} for ${collectionConfig.name} in ${delay}ms`);

    const timeout = setTimeout(async () => {
      this.retryTimeouts.delete(collectionConfig.name);
      
      // Check if we still need this listener
      if (!this.listeners.has(collectionConfig.name) && this.isInitialized) {
        console.log(`🔄 Retrying listener for ${collectionConfig.name}...`);
        await this.createSafeRealtimeListener(collectionConfig);
      }
    }, delay);

    this.retryTimeouts.set(collectionConfig.name, timeout);
  }

  private async fallbackToCache(collectionConfig: CollectionConfig): Promise<void> {
    try {
      // Check cache first
      const cached = this.getCache(collectionConfig.name);
      if (cached) {
        console.log(`📋 Using cached data for ${collectionConfig.name}`);
        this.config.onDataUpdate(collectionConfig.name, cached);
        return;
      }

      // Try a simple fetch as fallback
      console.log(`🔄 Attempting fallback fetch for ${collectionConfig.name}`);
      await this.fetchCollectionData(collectionConfig);
    } catch (error) {
      console.error(`❌ Fallback failed for ${collectionConfig.name}:`, error);
      // Send empty array as last resort
      this.config.onDataUpdate(collectionConfig.name, []);
    }
  }

  /**
   * Static utility method to check what Firestore indexes might be needed
   * Call this in the browser console: FirebaseRealtimeManager.checkIndexRequirements()
   */
  static checkIndexRequirements(): void {
    console.log('🔍 Firestore Index Requirements Check:');
    console.log('');
    console.log('The following collection queries might require composite indexes:');
    console.log('');
    
    const configs = [
      {
        name: 'appointments',
        filters: ['clinicId'],
        orderBy: 'date',
        note: 'Index: (clinicId, date, __name__)'
      },
      {
        name: 'patients', 
        filters: ['clinicId'],
        orderBy: 'createdAt',
        note: 'Index: (clinicId, createdAt, __name__)'
      },
      {
        name: 'payments',
        filters: ['clinicId'],
        orderBy: 'createdAt', 
        note: 'Index: (clinicId, createdAt, __name__)'
      },
      {
        name: 'inventory',
        filters: ['clinicId'],
        orderBy: 'name',
        note: 'Index: (clinicId, name, __name__)'
      },
      {
        name: 'clinics',
        filters: ['clinicId'],
        orderBy: 'name (disabled)',
        note: 'Index: (clinicId, name, __name__) - Currently disabled'
      },
      {
        name: 'notifications',
        filters: ['clinicId'],
        orderBy: 'createdAt',
        note: 'Index: (clinicId, createdAt, __name__)'
      }
    ];

    configs.forEach(config => {
      console.log(`📋 ${config.name}:`);
      console.log(`   Filters: ${config.filters.join(', ')}`);
      console.log(`   OrderBy: ${config.orderBy}`);
      console.log(`   ${config.note}`);
      console.log('');
    });

    console.log('💡 To create indexes:');
    console.log('   1. Go to Firebase Console > Firestore > Indexes');
    console.log('   2. Click "Create Index" and add the fields listed above');
    console.log('   3. Or wait for Firestore errors that include direct links');
    console.log('');
    console.log('🔗 Firebase Console:');
    console.log('   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes');
  }

  // Utility function to handle index errors and provide helpful guidance
  private handleIndexError(error: any, collectionName: string): void {
    if (error?.code === 'failed-precondition' && error?.message?.includes('requires an index')) {
      console.warn(`🔗 Firestore Index Required for ${collectionName}:`);
      console.warn(`   The query on '${collectionName}' requires a composite index.`);
      console.warn(`   You can create it automatically by clicking the link in the error message.`);
      console.warn(`   Or temporarily disable ordering by removing 'orderBy' from the collection config.`);
    }
  }

  private async fetchCollectionData(collectionConfig: CollectionConfig): Promise<void> {
    try {
      // Check cache first
      const cached = this.getCache(collectionConfig.name);
      if (cached) {
        this.config.onDataUpdate(collectionConfig.name, cached);
        return;
      }

      const collectionRef = collection(this.db, collectionConfig.name);
      let q = query(collectionRef);

      // Add filters with error handling
      try {
        q = query(q, where('clinicId', '==', this.config.clinicId));
      } catch (error) {
        console.warn(`⚠️ Skipping clinic filter in fetch for ${collectionConfig.name}:`, error);
      }

      // Add isActive filter for collections that support it (most of our collections do)
      try {
        q = query(q, where('isActive', '==', true));
      } catch (error) {
        console.warn(`⚠️ Skipping isActive filter in fetch for ${collectionConfig.name}:`, error);
      }

      try {
        if (collectionConfig.orderBy) {
          q = query(q, orderBy(collectionConfig.orderBy.field, collectionConfig.orderBy.direction));
        }
      } catch (error) {
        console.warn(`⚠️ Skipping ordering in fetch for ${collectionConfig.name}:`, error);
      }

      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Update cache
      this.setCache(collectionConfig.name, data, collectionConfig.cacheDuration);

      // Notify context
      this.config.onDataUpdate(collectionConfig.name, data);

      console.log(`✅ Fetched ${collectionConfig.name} (${data.length} items)`);
    } catch (error) {
      console.error(`❌ Failed to fetch ${collectionConfig.name}:`, error);
      this.handleIndexError(error, collectionConfig.name);
      this.config.onError(collectionConfig.name, `Failed to fetch: ${error}`);
      
      // Send empty array to prevent undefined state
      this.config.onDataUpdate(collectionConfig.name, []);
    }
  }

  // Cache management
  private setCache(key: string, data: any[], ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getCache(key: string): any[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Public methods for data operations
  async addDocument(collectionName: string, data: any): Promise<string> {
    try {
      const collectionRef = collection(this.db, collectionName);
      const docData = {
        ...data,
        clinicId: this.config.clinicId,
        createdBy: this.config.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      const docRef = await addDoc(collectionRef, docData);
      console.log(`✅ Added document to ${collectionName}:`, docRef.id);
      
      // Cloud function calls removed to prevent complexity

      return docRef.id;
    } catch (error) {
      console.error(`❌ Failed to add document to ${collectionName}:`, error);
      throw error;
    }
  }

  async updateDocument(collectionName: string, docId: string, updates: any): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const updateData = {
        ...updates,
        updatedBy: this.config.userId,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);
      console.log(`✅ Updated document in ${collectionName}:`, docId);

      // Cloud function calls removed to prevent complexity
    } catch (error) {
      console.error(`❌ Failed to update document in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      
      // Soft delete by default
      await updateDoc(docRef, {
        isActive: false,
        deletedBy: this.config.userId,
        deletedAt: serverTimestamp(),
      });

      console.log(`✅ Soft deleted document in ${collectionName}:`, docId);

      // Cloud function calls removed to prevent complexity
    } catch (error) {
      console.error(`❌ Failed to delete document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Batch operations for efficiency
  async batchWrite(operations: Array<{
    type: 'add' | 'update' | 'delete';
    collection: string;
    docId?: string;
    data: any;
  }>): Promise<void> {
    try {
      const batch = writeBatch(this.db);

      for (const operation of operations) {
        switch (operation.type) {
          case 'add':
            const addDocRef = doc(collection(this.db, operation.collection));
            batch.set(addDocRef, {
              ...operation.data,
              clinicId: this.config.clinicId,
              createdBy: this.config.userId,
              createdAt: serverTimestamp(),
              isActive: true,
            });
            break;

          case 'update':
            if (!operation.docId) throw new Error('Document ID required for update');
            const updateDocRef = doc(this.db, operation.collection, operation.docId);
            batch.update(updateDocRef, {
              ...operation.data,
              updatedBy: this.config.userId,
              updatedAt: serverTimestamp(),
            });
            break;

          case 'delete':
            if (!operation.docId) throw new Error('Document ID required for delete');
            const deleteDocRef = doc(this.db, operation.collection, operation.docId);
            batch.update(deleteDocRef, {
              isActive: false,
              deletedBy: this.config.userId,
              deletedAt: serverTimestamp(),
            });
            break;
        }
      }

      await batch.commit();
      console.log(`✅ Batch operation completed (${operations.length} operations)`);
    } catch (error) {
      console.error('❌ Batch operation failed:', error);
      throw error;
    }
  }

  // Cloud Functions integration
  private async callCloudFunction(functionName: string, data: any): Promise<any> {
    try {
      if (!this.isCloudFunctionsEnabled()) return null;

      const cloudFunction = httpsCallable(this.functions, functionName);
      const result = await cloudFunction(data);
      
      console.log(`✅ Cloud function ${functionName} executed successfully`);
      return result.data;
    } catch (error) {
      console.warn(`⚠️ Cloud function ${functionName} failed:`, error);
      // Don't throw - cloud functions are enhancement, not requirement
      return null;
    }
  }

  private isCloudFunctionsEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_CLOUD_FUNCTIONS === 'true';
  }

  // Connection management
  private async safeReconnect(): Promise<void> {
    if (this.connectionStatus === 'reconnecting') return;

    this.connectionStatus = 'reconnecting';
    this.config.onConnectionChange('reconnecting');

    try {
      await enableNetwork(this.db);
      
      // Clean up existing listeners before restarting
      this.cleanupListeners();
      
      // Small delay before restart
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Restart listeners
      await this.setupRealtimeListeners();

      this.connectionStatus = 'connected';
      this.config.onConnectionChange('connected');
      console.log('✅ Firebase reconnected successfully');
    } catch (error) {
      this.connectionStatus = 'disconnected';
      this.config.onConnectionChange('disconnected');
      console.error('❌ Failed to reconnect:', error);
    }
  }

  // Refresh specific collections
  async refreshCollections(collectionNames?: string[]): Promise<void> {
    const collectionsToRefresh = collectionNames || this.collections.map(c => c.name);
    
    for (const collectionName of collectionsToRefresh) {
      const collectionConfig = this.collections.find(c => c.name === collectionName);
      if (collectionConfig) {
        // Clear cache
        this.cache.delete(collectionName);
        // Fetch fresh data
        await this.fetchCollectionData(collectionConfig);
      }
    }
  }

  // Force restart - cleans up everything and reinitializes
  async forceRestart(): Promise<void> {
    console.log('🔄 Force restarting Firebase Realtime Manager...');
    
    try {
      // Complete cleanup
      this.cleanup();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset retry counts
      this.collections.forEach(config => {
        config.retryCount = 0;
      });
      
      // Reinitialize
      await this.initialize();
      
      console.log('✅ Firebase Realtime Manager restarted successfully');
    } catch (error) {
      console.error('❌ Failed to restart Firebase Realtime Manager:', error);
      throw error;
    }
  }

  // Cleanup listeners only (without full cleanup)
  private cleanupListeners(): void {
    console.log('🔄 Cleaning up listeners...');
    
    // Unsubscribe from all listeners
    for (const [collectionName, unsubscribe] of this.listeners) {
      try {
        unsubscribe();
        console.log(`🔄 Unsubscribed from ${collectionName}`);
      } catch (error) {
        console.warn(`⚠️ Error unsubscribing from ${collectionName}:`, error);
      }
    }
    
    this.listeners.clear();
  }

  // Full cleanup
  cleanup(): void {
    console.log('🔄 Cleaning up Firebase Realtime Manager...');
    
    // Clean up listeners
    this.cleanupListeners();
    
    // Clear timeouts
    for (const [collectionName, timeout] of this.retryTimeouts) {
      clearTimeout(timeout);
      console.log(`🔄 Cleared retry timeout for ${collectionName}`);
    }
    this.retryTimeouts.clear();
    
    // Clear cache
    this.cache.clear();
    
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    this.isInitialized = false;
    
    console.log('✅ Firebase Realtime Manager cleanup completed');
  }

  // Utility methods
  isReady(): boolean {
    return this.isInitialized && this.connectionStatus === 'connected';
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getCacheStatus(): { [key: string]: { size: number; lastUpdated: Date | null } } {
    const status: { [key: string]: { size: number; lastUpdated: Date | null } } = {};
    
    for (const [key, entry] of this.cache) {
      status[key] = {
        size: entry.data.length,
        lastUpdated: new Date(entry.timestamp),
      };
    }
    
    return status;
  }
} 

// Make the index checker available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).checkFirebaseIndexes = FirebaseRealtimeManager.checkIndexRequirements;
  console.log('🔧 Debug utility available: checkFirebaseIndexes()');
} 