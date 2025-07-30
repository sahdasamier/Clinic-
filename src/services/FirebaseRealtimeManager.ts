import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  type Firestore,
  type Unsubscribe,
  type Transaction,
} from 'firebase/firestore';
import { type Auth } from 'firebase/auth';
import { type Functions } from 'firebase/functions';

// ✅ FIXED: Import from the optimized Firebase instead of the proxy
import { 
  getOptimizedFirestore, 
  getOptimizedAuth, 
  getOptimizedFunctions,
  firebaseManager 
} from '../api/firebaseOptimized';

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
  enableRealtime: boolean;
  cacheDuration: number;
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
  private cache = new Map<string, CacheEntry>();
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private isInitialized = false;
  private unsubscribes = new Map<string, Unsubscribe>();

  // ✅ EMERGENCY MODE DISABLED - Normal operations restored
  private readonly EMERGENCY_MODE = false;

  // Collections with realtime enabled
  private collections: CollectionConfig[] = [
    { name: 'appointments', enableRealtime: true, cacheDuration: 300000 },
    { name: 'patients', enableRealtime: true, cacheDuration: 600000 },
    { name: 'payments', enableRealtime: true, cacheDuration: 300000 },
    { name: 'inventory', enableRealtime: true, cacheDuration: 900000 },
    { name: 'notifications', enableRealtime: true, cacheDuration: 60000 },
  ];

  // ✅ FIXED: Getters now use the actual optimized Firebase services
  private get db(): Firestore {
    if (!this._db) {
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase Firestore not ready yet. Please wait for initialization.');
      }
      
      try {
        this._db = getOptimizedFirestore();
        console.log('✅ FirebaseRealtimeManager: Got Firestore instance');
      } catch (error) {
        console.error('❌ Failed to get Firestore instance:', error);
        throw new Error('Firebase Firestore failed to initialize');
      }
    }
    return this._db;
  }

  private get auth(): Auth {
    if (!this._auth) {
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase Auth not ready yet. Please wait for initialization.');
      }
      
      try {
        this._auth = getOptimizedAuth();
        console.log('✅ FirebaseRealtimeManager: Got Auth instance');
      } catch (error) {
        console.error('❌ Failed to get Auth instance:', error);
        throw new Error('Firebase Auth failed to initialize');
      }
    }
    return this._auth;
  }

  private get functions(): Functions {
    if (!this._functions) {
      if (!firebaseManager.isReady()) {
        throw new Error('Firebase Functions not ready yet. Please wait for initialization.');
      }
      
      try {
        this._functions = getOptimizedFunctions();
        console.log('✅ FirebaseRealtimeManager: Got Functions instance');
      } catch (error) {
        console.error('❌ Failed to get Functions instance:', error);
        throw new Error('Firebase Functions failed to initialize');
      }
    }
    return this._functions;
  }

  constructor(config: FirebaseRealtimeConfig) {
    this.config = config;
    
    if (this.EMERGENCY_MODE) {
      console.error('🚨🚨🚨 FIREBASE EMERGENCY MODE ACTIVATED 🚨🚨🚨');
      console.error('🛑 ALL REALTIME LISTENERS PERMANENTLY DISABLED');
      console.error('🛑 SYSTEM RUNNING IN FETCH-ONLY MODE');
    } else {
      console.log('🔥 Firebase Realtime Manager starting in normal mode');
    }
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Wait for Firebase services to be ready before proceeding
      console.log('⏳ Waiting for Firebase services to be ready...');
      await this.waitForFirebaseReady();
      
      if (this.EMERGENCY_MODE) {
        console.error('🚨 Initializing Firebase in EMERGENCY MODE (fetch-only)');
        this.connectionStatus = 'disconnected';
        this.config.onConnectionChange('disconnected');
        await this.fetchAllCollectionsOnce();
      } else {
        console.log('🔥 Initializing Firebase with realtime listeners');
        this.connectionStatus = 'reconnecting';
        this.config.onConnectionChange('reconnecting');
        await this.setupRealtimeListeners();
        this.connectionStatus = 'connected';
        this.config.onConnectionChange('connected');
      }
      
      this.isInitialized = true;
      console.log('✅ Firebase initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      this.config.onError('initialization', `Failed: ${error}`);
    }
  }

  private async waitForFirebaseReady(): Promise<void> {
    const maxRetries = 15; // ✅ INCREASED: More retries for better reliability
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // ✅ FIXED: Check if firebaseManager is ready first
        if (!firebaseManager.isReady()) {
          throw new Error('Firebase manager not ready yet');
        }
        
        // Try to access the Firebase services - this will throw if not ready
        const testDb = this.db;
        const testAuth = this.auth;
        
        // ✅ ADDITIONAL CHECK: Verify we got actual Firestore instance
        if (!testDb || typeof testDb !== 'object') {
          throw new Error('Invalid Firestore instance received');
        }
        
        console.log('✅ Firebase services confirmed ready and valid');
        return;
      } catch (error) {
        retries++;
        console.log(`⏳ Firebase not ready yet (attempt ${retries}/${maxRetries}): ${error}`);
        
        if (retries >= maxRetries) {
          throw new Error(`Firebase services failed to initialize after ${maxRetries} retries: ${error}`);
        }
        
        // ✅ IMPROVED: Wait with exponential backoff, but cap the wait time
        const waitTime = Math.min(500 * Math.pow(1.5, retries), 3000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  private async setupRealtimeListeners(): Promise<void> {
    console.log('📡 Setting up realtime listeners for collections');
    
    for (const collectionConfig of this.collections) {
      try {
        if (collectionConfig.enableRealtime) {
          await this.setupCollectionListener(collectionConfig);
        } else {
          // Fetch once for non-realtime collections
          await this.fetchCollectionOnce(collectionConfig.name);
        }
      } catch (error) {
        console.error(`❌ Error setting up ${collectionConfig.name}:`, error);
        this.config.onDataUpdate(collectionConfig.name, []);
      }
    }

    // Load clinics data
    try {
      await this.getClinicsData();
    } catch (error) {
      console.warn('⚠️ Failed to load clinics data:', error);
    }
  }

  private async setupCollectionListener(collectionConfig: CollectionConfig): Promise<void> {
    const { name } = collectionConfig;
    
    // Clean up existing listener
    if (this.unsubscribes.has(name)) {
      this.unsubscribes.get(name)!();
    }

    const collectionRef = collection(this.db, name);
    const q = query(
      collectionRef,
      where('clinicId', '==', this.config.clinicId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        this.setCache(name, data, collectionConfig.cacheDuration);
        this.config.onDataUpdate(name, data);
        console.log(`📦 Updated ${name}: ${data.length} items`);
      },
      (error) => {
        console.error(`❌ Realtime listener error for ${name}:`, error);
        this.config.onError(name, error.message);
      }
    );

    this.unsubscribes.set(name, unsubscribe);
  }

  private async fetchCollectionOnce(collectionName: string): Promise<any[]> {
    const collectionRef = collection(this.db, collectionName);
    const q = query(
      collectionRef,
      where('clinicId', '==', this.config.clinicId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    this.config.onDataUpdate(collectionName, data);
    return data;
  }

  private async fetchAllCollectionsOnce(): Promise<void> {
    console.error('📥 EMERGENCY: Fetching collections once (NO realtime listeners)');
    
    for (const collectionConfig of this.collections) {
      try {
        // Send empty data for all collections in emergency mode
        console.error(`🛑 EMERGENCY: Sending empty data for ${collectionConfig.name}`);
        this.config.onDataUpdate(collectionConfig.name, []);
        
      } catch (error) {
        console.error(`❌ Error with ${collectionConfig.name}:`, error);
        this.config.onDataUpdate(collectionConfig.name, []);
      }
    }

    // Provide mock clinics data
    try {
      await this.getClinicsData();
    } catch (error) {
      console.warn('⚠️ Failed to load mock clinics data:', error);
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

  // Load clinics data
  async getClinicsData(): Promise<any[]> {
    if (this.EMERGENCY_MODE) {
      console.log('🏥 Providing mock clinics data (emergency mode)');
      
      const mockClinicsData = [
        {
          id: 'demo-clinic',
          name: 'Demo Clinic',
          address: '123 Healthcare Ave, Medical City',
          phone: '+1-555-0123',
          email: 'contact@democlinic.com',
          isActive: true,
          createdAt: new Date(),
          clinicId: 'demo-clinic'
        }
      ];
      
      this.setCache('clinics', mockClinicsData, 3600000);
      this.config.onDataUpdate('clinics', mockClinicsData);
      return mockClinicsData;
    }

    try {
      const clinicsRef = collection(this.db, 'clinics');
      const snapshot = await getDocs(clinicsRef);
      const clinicsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      this.setCache('clinics', clinicsData, 3600000);
      this.config.onDataUpdate('clinics', clinicsData);
      console.log(`🏥 Loaded ${clinicsData.length} clinics`);
      
      return clinicsData;
    } catch (error) {
      console.error('❌ Failed to load clinics:', error);
      this.config.onError('clinics', `Failed to load clinics: ${error}`);
      return [];
    }
  }

  // Public methods - Restored normal operations
  async addDocument(collectionName: string, data: any): Promise<string> {
    if (this.EMERGENCY_MODE) {
      console.error('🚨 EMERGENCY: Write operations disabled');
      throw new Error('EMERGENCY MODE: All write operations disabled');
    }

    try {
      const docRef = doc(collection(this.db, collectionName));
      await runTransaction(this.db, async (transaction: Transaction) => {
        transaction.set(docRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          clinicId: this.config.clinicId
        });
      });
      
      console.log(`✅ Added document to ${collectionName}:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Failed to add document to ${collectionName}:`, error);
      throw error;
    }
  }

  async updateDocument(collectionName: string, docId: string, updates: any): Promise<void> {
    if (this.EMERGENCY_MODE) {
      console.error('🚨 EMERGENCY: Write operations disabled');
      throw new Error('EMERGENCY MODE: All write operations disabled');
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      await runTransaction(this.db, async (transaction: Transaction) => {
        transaction.update(docRef, {
          ...updates,
          updatedAt: new Date()
        });
      });
      
      console.log(`✅ Updated document in ${collectionName}:`, docId);
    } catch (error) {
      console.error(`❌ Failed to update document in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    if (this.EMERGENCY_MODE) {
      console.error('🚨 EMERGENCY: Write operations disabled');
      throw new Error('EMERGENCY MODE: All write operations disabled');
    }

    try {
      const docRef = doc(this.db, collectionName, docId);
      await runTransaction(this.db, async (transaction: Transaction) => {
        transaction.delete(docRef);
      });
      
      console.log(`✅ Deleted document from ${collectionName}:`, docId);
    } catch (error) {
      console.error(`❌ Failed to delete document from ${collectionName}:`, error);
      throw error;
    }
  }

  async batchWrite(operations: any[]): Promise<void> {
    if (this.EMERGENCY_MODE) {
      console.error('🚨 EMERGENCY: Batch operations disabled');
      throw new Error('EMERGENCY MODE: All batch operations disabled');
    }

    try {
      await runTransaction(this.db, async (transaction: Transaction) => {
        operations.forEach(op => {
          const docRef = doc(this.db, op.collection, op.id || doc(collection(this.db, op.collection)).id);
          
          if (op.type === 'set') {
            transaction.set(docRef, {
              ...op.data,
              createdAt: new Date(),
              updatedAt: new Date(),
              clinicId: this.config.clinicId
            });
          } else if (op.type === 'update') {
            transaction.update(docRef, {
              ...op.data,
              updatedAt: new Date()
            });
          } else if (op.type === 'delete') {
            transaction.delete(docRef);
          }
        });
      });
      
      console.log(`✅ Completed batch operation with ${operations.length} operations`);
    } catch (error) {
      console.error('❌ Failed to complete batch operation:', error);
      throw error;
    }
  }

  async refreshCollections(collectionNames?: string[]): Promise<void> {
    if (this.EMERGENCY_MODE) {
      console.error('🚨 EMERGENCY: Refresh operations disabled');
      return;
    }

    const collectionsToRefresh = collectionNames || this.collections.map(c => c.name);
    
    console.log('🔄 Refreshing collections:', collectionsToRefresh);
    
    for (const collectionName of collectionsToRefresh) {
      try {
        await this.fetchCollectionOnce(collectionName);
      } catch (error) {
        console.error(`❌ Failed to refresh ${collectionName}:`, error);
      }
    }
  }

  async forceRestart(): Promise<void> {
    if (this.EMERGENCY_MODE) {
      console.error('🚨 EMERGENCY: Restart operations disabled');
      return;
    }

    console.log('🔄 Force restarting Firebase Realtime Manager');
    
    // Clean up existing listeners
    this.cleanup();
    
    // Reinitialize
    await this.initialize();
    
    console.log('✅ Firebase Realtime Manager restarted');
  }

  cleanup(): void {
    console.log('🧹 Cleaning up Firebase Realtime Manager');
    
    // Unsubscribe from all listeners
    this.unsubscribes.forEach((unsubscribe, collection) => {
      try {
        unsubscribe();
        console.log(`✅ Unsubscribed from ${collection}`);
      } catch (error) {
        console.error(`❌ Failed to unsubscribe from ${collection}:`, error);
      }
    });
    
    this.unsubscribes.clear();
    this.cache.clear();
    this.isInitialized = false;
    this.connectionStatus = 'disconnected';
    
    console.log('✅ Cleanup completed');
  }

  // Utility methods
  isReady(): boolean {
    return this.isInitialized && !this.EMERGENCY_MODE;
  }

  getConnectionStatus(): string {
    if (this.EMERGENCY_MODE) {
      return 'emergency-mode';
    }
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

  getManagerStatus(): any {
    return {
      isInitialized: this.isInitialized,
      connectionStatus: this.connectionStatus,
      emergencyMode: this.EMERGENCY_MODE,
      collections: this.collections.map(c => ({
        name: c.name,
        enableRealtime: c.enableRealtime,
        hasListener: this.unsubscribes.has(c.name)
      })),
      cacheStatus: this.getCacheStatus()
    };
  }
} 

// Normal operation message
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Realtime Manager ready for normal operations');
} 