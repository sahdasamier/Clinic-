import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { getOptimizedFirestore, firebaseManager } from '@lib/firebase/legacy-compat';
import PatientService from './PatientService';

const COLLECTION_NAME = 'medicalRequirementOrders';

// ✅ ADDED: localStorage persistence for medical requirements
const STORAGE_KEY = 'clinic_medical_requirements_data';

// Helper functions for localStorage persistence
const saveToLocalStorage = (clinicId: string, data: any[]): void => {
  try {
    const key = `${STORAGE_KEY}_${clinicId}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      lastUpdated: new Date().toISOString(),
      clinicId
    }));
    console.log(`✅ Medical requirements saved to localStorage for clinic ${clinicId}:`, data.length);
  } catch (error) {
    console.error('❌ Failed to save medical requirements to localStorage:', error);
  }
};

const loadFromLocalStorage = (clinicId: string): any[] => {
  try {
    const key = `${STORAGE_KEY}_${clinicId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.clinicId === clinicId && parsed.data) {
        console.log(`✅ Medical requirements loaded from localStorage for clinic ${clinicId}:`, parsed.data.length);
        return parsed.data;
      }
    }
  } catch (error) {
    console.error('❌ Failed to load medical requirements from localStorage:', error);
  }
  return [];
};

// ✅ ADDED: Data sanitization function to remove undefined values
const sanitizeOrderData = (data: any): any => {
  const sanitized: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Skip undefined values (Firebase doesn't allow them)
    if (value === undefined) {
      console.log(`⚠️ Skipping undefined field: ${key}`);
      return;
    }
    
    // Skip null values for optional fields
    if (value === null && ['patientAge', 'patientGender', 'patientPhone', 'patientEmail', 'patientBloodType', 'patientAllergies', 'patientCondition', 'patientInsurance'].includes(key)) {
      console.log(`⚠️ Skipping null field: ${key}`);
      return;
    }
    
    // Handle arrays - filter out undefined/null items
    if (Array.isArray(value)) {
      const filteredArray = value.filter(item => item !== undefined && item !== null);
      if (filteredArray.length > 0) {
        sanitized[key] = filteredArray;
      }
      return;
    }
    
    // Include the value
    sanitized[key] = value;
  });
  
  console.log('🧹 Sanitized order data:', sanitized);
  return sanitized;
};

const getMedicalRequirementsCollection = async (clinicId: string) => {
  // Try synchronous cached version first
  if (firebaseManager.isReadySync()) {
    try {
      const db = firebaseManager.getFirestoreSync();
      return collection(db, COLLECTION_NAME);
    } catch (error) {
      console.warn('⚠️ Sync access failed, falling back to async:', error);
    }
  }
  
  // Fallback to async version with proper retry logic
  let retries = 0;
  while (!firebaseManager.isReadySync() && retries < 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    retries++;
  }
  
  if (!firebaseManager.isReadySync()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  
  // Ensure instances are cached
  await firebaseManager.cacheInstances();
  
  const db = await getOptimizedFirestore();
  if (!db) throw new Error('Firestore not initialized');
  
  return collection(db, COLLECTION_NAME);
};

export interface MedicalRequirementOrder {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  
  // Enhanced patient information
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientBloodType?: string;
  patientAllergies?: string[];
  patientCondition?: string;
  patientInsurance?: string;
  
  // Requirement details
  requirementType: 'lab' | 'imaging' | 'consultation' | 'procedure' | 'other';
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Status and workflow
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  workflow_stage: 'ordered' | 'received' | 'processing' | 'completed' | 'delivered';
  
  // Dates
  dateOrdered: string;
  dueDate?: string;
  dateReceived?: string;
  dateStarted?: string;
  completedDate?: string;
  deliveredDate?: string;
  
  // Personnel
  orderedBy: string;
  orderedByRole: string;
  doctorId?: string;
  doctorName?: string;
  assignedTo?: string;
  assignedToRole?: string;
  processedBy?: string;
  
  // Documents and attachments
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    uploadDate: string;
    type: string;
    size: number;
    category: 'requirement_order' | 'completed_result' | 'supporting_doc';
    uploadedBy: string;
  }>;
  
  // Additional info
  notes?: string;
  processingNotes?: string;
  completionNotes?: string;
  estimatedTime?: string;
  actualTime?: string;
  preparations?: string[];
  
  // Billing and cost (optional)
  cost?: number;
  billable?: boolean;
  insuranceCovered?: boolean;
  
  // System fields
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  
  // Integration fields
  originalPatientRequirementId?: string; // Link back to patient's requirement
  labRequestId?: string; // External lab system ID
  resultsSentToPatient?: boolean;
  patientNotified?: boolean;
}

export const MedicalRequirementsService = {
  // Create a new medical requirement order
  async createOrder(
    clinicId: string, 
    orderData: Omit<MedicalRequirementOrder, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'isActive'>
  ): Promise<string> {
    try {
      // ✅ ADDED: Validate order data before processing
      const validation = this.validateOrderData(orderData);
      if (!validation.isValid) {
        const errorMessage = `Invalid order data: ${validation.errors.join(', ')}`;
        console.error('❌ Order validation failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      
      // ✅ ADDED: Sanitize data to remove undefined values
      const sanitizedOrderData = sanitizeOrderData(orderData);
      
      const newOrder = {
        ...sanitizedOrderData,
        clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('📋 Creating medical requirement order with sanitized data:', newOrder);

      const docRef = await addDoc(ordersCollection, newOrder);
      console.log('✅ Medical requirement order created:', docRef.id);
      
      // ✅ ADDED: Update patient's pending requirements count
      try {
        await PatientService.updateRequirementCounts(newOrder.patientId, true);
        console.log('✅ Updated patient requirement counts for:', newOrder.patientId);
      } catch (patientUpdateError) {
        console.warn('⚠️ Failed to update patient requirement counts:', patientUpdateError);
      }
      
      // ✅ ADDED: Save to localStorage as backup
      let existingOrders: MedicalRequirementOrder[] = [];
      try {
        existingOrders = loadFromLocalStorage(clinicId);
        const orderWithId = { ...newOrder, id: docRef.id };
        saveToLocalStorage(clinicId, [...existingOrders, orderWithId]);
      } catch (localStorageError) {
        console.warn('⚠️ Failed to save to localStorage backup:', localStorageError);
      }
      
      // ✅ ADDED: Dispatch events to update patient list counts
      if (typeof window !== 'undefined') {
        // Dispatch event for immediate count update
        window.dispatchEvent(new CustomEvent('medicalRequirementAdded', {
          detail: {
            patientId: newOrder.patientId,
            requirementId: docRef.id,
            status: newOrder.status,
            clinicId
          }
        }));
        
        // Also dispatch a count refresh event
        window.dispatchEvent(new CustomEvent('medicalRequirementCountRefreshed', {
          detail: {
            patientId: newOrder.patientId,
            count: (existingOrders.length + 1),
            clinicId
          }
        }));
        
        console.log('🔄 Dispatched events for medical requirement creation');
      }
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating medical requirement order:', error);
      throw error;
    }
  },

  // Get all orders for a clinic
  async getOrdersByClinic(clinicId: string): Promise<MedicalRequirementOrder[]> {
    try {
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      const q = query(
        ordersCollection,
        where('clinicId', '==', clinicId),
        where('isActive', '==', true),
        orderBy('dateOrdered', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const firebaseOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
      
      // ✅ ADDED: Save to localStorage after successful Firebase fetch
      saveToLocalStorage(clinicId, firebaseOrders);
      
      return firebaseOrders;
    } catch (error) {
      console.error('❌ Error fetching medical requirement orders from Firebase:', error);
      
      // ✅ ADDED: Fallback to localStorage when Firebase fails
      console.log('🔄 Falling back to localStorage for medical requirements...');
      const localStorageOrders = loadFromLocalStorage(clinicId);
      
      if (localStorageOrders.length > 0) {
        console.log(`✅ Loaded ${localStorageOrders.length} medical requirements from localStorage backup`);
        return localStorageOrders;
      }
      
      console.log('⚠️ No medical requirements found in localStorage backup');
      throw error;
    }
  },

  // Get orders for a specific patient
  async getOrdersByPatient(clinicId: string, patientId: string): Promise<MedicalRequirementOrder[]> {
    try {
      console.log(`🔍 Fetching medical requirements for patient ${patientId} in clinic ${clinicId}`);
      
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      const q = query(
        ordersCollection,
        where('clinicId', '==', clinicId),
        where('patientId', '==', patientId),
        where('isActive', '==', true),
        orderBy('dateOrdered', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
      
      console.log(`✅ Found ${results.length} medical requirements for patient ${patientId}`);
      return results;
    } catch (error) {
      console.error(`❌ Error fetching patient medical requirement orders for patient ${patientId}:`, error);
      
      // Try to get from localStorage as fallback
      try {
        console.log('🔄 Falling back to localStorage for patient requirements...');
        const localStorageOrders = loadFromLocalStorage(clinicId);
        const patientOrders = localStorageOrders.filter(order => 
          order.patientId === patientId && order.isActive === true
        );
        console.log(`✅ Found ${patientOrders.length} requirements in localStorage for patient ${patientId}`);
        return patientOrders;
      } catch (localStorageError) {
        console.error('❌ localStorage fallback also failed:', localStorageError);
        throw error;
      }
    }
  },

  // ✅ ADDED: Get only pending orders for a specific patient (more efficient)
  async getPendingOrdersByPatient(clinicId: string, patientId: string): Promise<MedicalRequirementOrder[]> {
    try {
      console.log(`🔍 Fetching pending medical requirements for patient ${patientId} in clinic ${clinicId}`);
      
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      const q = query(
        ordersCollection,
        where('clinicId', '==', clinicId),
        where('patientId', '==', patientId),
        where('status', '==', 'pending'),
        where('isActive', '==', true),
        orderBy('dateOrdered', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
      
      console.log(`✅ Found ${results.length} pending medical requirements for patient ${patientId}`);
      return results;
    } catch (error) {
      console.error(`❌ Error fetching pending patient medical requirement orders for patient ${patientId}:`, error);
      
      // Try to get from localStorage as fallback
      try {
        console.log('🔄 Falling back to localStorage for pending patient requirements...');
        const localStorageOrders = loadFromLocalStorage(clinicId);
        const pendingPatientOrders = localStorageOrders.filter(order => 
          order.patientId === patientId && order.isActive === true && order.status === 'pending'
        );
        console.log(`✅ Found ${pendingPatientOrders.length} pending requirements in localStorage for patient ${patientId}`);
        return pendingPatientOrders;
      } catch (localStorageError) {
        console.error('❌ localStorage fallback also failed:', localStorageError);
        throw error;
      }
    }
  },

  // Get orders by status
  async getOrdersByStatus(clinicId: string, status: string): Promise<MedicalRequirementOrder[]> {
    try {
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      const q = query(
        ordersCollection,
        where('clinicId', '==', clinicId),
        where('status', '==', status),
        where('isActive', '==', true),
        orderBy('dateOrdered', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
    } catch (error) {
      console.error('❌ Error fetching orders by status:', error);
      throw error;
    }
  },

  // Update order status and details
  async updateOrder(
    clinicId: string, 
    orderId: string, 
    updates: Partial<MedicalRequirementOrder>
  ): Promise<void> {
    try {
      // Use proper Firebase access pattern
      let db;
      if (firebaseManager.isReadySync()) {
        try {
          db = firebaseManager.getFirestoreSync();
        } catch (error) {
          console.warn('⚠️ Sync access failed, falling back to async:', error);
          if (!(await firebaseManager.isReady())) {
            throw new Error('Firebase not ready - please wait for initialization');
          }
          await firebaseManager.cacheInstances();
          db = await getOptimizedFirestore();
        }
      } else {
        if (!(await firebaseManager.isReady())) {
          throw new Error('Firebase not ready - please wait for initialization');
        }
        await firebaseManager.cacheInstances();
        db = await getOptimizedFirestore();
      }
      
      if (!db) throw new Error('Firestore not initialized');
      
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      
      // ✅ ADDED: Sanitize updates to remove undefined values
      const sanitizedUpdates = sanitizeOrderData(updates);
      
      const updateData = {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
      };
      
      console.log('📋 Updating order with sanitized data:', updateData);
      
      await updateDoc(orderRef, updateData);
      
      console.log('✅ Medical requirement order updated:', orderId);
      
      // ✅ ADDED: Update patient's requirement counts if status changed
      if (sanitizedUpdates.status) {
        try {
          // Get the current order to compare status
          const orderSnapshot = await getDoc(orderRef);
          if (orderSnapshot.exists()) {
            const currentOrder = orderSnapshot.data() as MedicalRequirementOrder;
            const oldStatus = currentOrder.status;
            const newStatus = sanitizedUpdates.status;
            
            // If status changed from pending to something else, decrement count
            if (oldStatus === 'pending' && newStatus !== 'pending') {
              await PatientService.updateRequirementCounts(currentOrder.patientId, false);
              console.log('✅ Decremented patient requirement count for status change:', currentOrder.patientId);
            }
            // If status changed to pending from something else, increment count
            else if (oldStatus !== 'pending' && newStatus === 'pending') {
              await PatientService.updateRequirementCounts(currentOrder.patientId, true);
              console.log('✅ Incremented patient requirement count for status change:', currentOrder.patientId);
            }
          }
        } catch (patientUpdateError) {
          console.warn('⚠️ Failed to update patient requirement counts:', patientUpdateError);
        }
      }
      
      // ✅ ADDED: Update localStorage backup
      let existingOrders: MedicalRequirementOrder[] = [];
      let updatedOrders: MedicalRequirementOrder[] = [];
      try {
        existingOrders = loadFromLocalStorage(clinicId);
        updatedOrders = existingOrders.map(order => 
          order.id === orderId 
            ? { ...order, ...sanitizedUpdates, updatedAt: new Date().toISOString() }
            : order
        );
        saveToLocalStorage(clinicId, updatedOrders);
      } catch (localStorageError) {
        console.warn('⚠️ Failed to update localStorage backup:', localStorageError);
      }
      
      // ✅ ADDED: Dispatch events to update patient list counts
      if (typeof window !== 'undefined') {
        // Get the updated order to find patientId
        const updatedOrder = updatedOrders.find(order => order.id === orderId);
        if (updatedOrder) {
          // Dispatch event for immediate count update
          window.dispatchEvent(new CustomEvent('medicalRequirementUpdated', {
            detail: {
              patientId: updatedOrder.patientId,
              requirementId: orderId,
              status: sanitizedUpdates.status || updatedOrder.status,
              clinicId
            }
          }));
          
          // Also dispatch a count refresh event
          const patientOrders = updatedOrders.filter(order => 
            order.patientId === updatedOrder.patientId && order.isActive
          );
          window.dispatchEvent(new CustomEvent('medicalRequirementCountRefreshed', {
            detail: {
              patientId: updatedOrder.patientId,
              count: patientOrders.length,
              clinicId
            }
          }));
          
          console.log('🔄 Dispatched events for medical requirement update');
        }
      }
    } catch (error) {
      console.error('❌ Error updating medical requirement order:', error);
      throw error;
    }
  },

  // Mark order as in progress
  async startProcessing(
    clinicId: string, 
    orderId: string, 
    assignedTo: string, 
    assignedToRole: string,
    notes?: string
  ): Promise<void> {
    try {
      await this.updateOrder(clinicId, orderId, {
        status: 'in_progress',
        workflow_stage: 'processing',
        assignedTo,
        assignedToRole,
        dateStarted: new Date().toISOString().split('T')[0],
        processingNotes: notes,
      });
    } catch (error) {
      console.error('❌ Error starting order processing:', error);
      throw error;
    }
  },

  // Delete a medical requirement order and update patient counts
  async deleteOrder(clinicId: string, orderId: string): Promise<void> {
    try {
      // Use proper Firebase access pattern
      let db;
      if (firebaseManager.isReadySync()) {
        try {
          db = firebaseManager.getFirestoreSync();
        } catch (error) {
          console.warn('⚠️ Sync access failed, falling back to async:', error);
          if (!(await firebaseManager.isReady())) {
            throw new Error('Firebase not ready - please wait for initialization');
          }
          await firebaseManager.cacheInstances();
          db = await getOptimizedFirestore();
        }
      } else {
        if (!(await firebaseManager.isReady())) {
          throw new Error('Firebase not ready - please wait for initialization');
        }
        await firebaseManager.cacheInstances();
        db = await getOptimizedFirestore();
      }
      
      if (!db) throw new Error('Firestore not initialized');
      
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      
      // Get the order before deleting to update patient counts
      const orderSnapshot = await getDoc(orderRef);
      if (orderSnapshot.exists()) {
        const orderToDelete = orderSnapshot.data() as MedicalRequirementOrder;
        
        // If the order was pending, decrement the patient's count
        if (orderToDelete.status === 'pending') {
          try {
            await PatientService.updateRequirementCounts(orderToDelete.patientId, false);
            console.log('✅ Decremented patient requirement count for deleted order:', orderToDelete.patientId);
          } catch (patientUpdateError) {
            console.warn('⚠️ Failed to update patient requirement counts for deleted order:', patientUpdateError);
          }
        }
      }
      
      // Delete the order
      await deleteDoc(orderRef);
      console.log('✅ Medical requirement order deleted:', orderId);
      
      // Update localStorage backup
      try {
        const existingOrders = loadFromLocalStorage(clinicId);
        const updatedOrders = existingOrders.filter(order => order.id !== orderId);
        saveToLocalStorage(clinicId, updatedOrders);
      } catch (localStorageError) {
        console.warn('⚠️ Failed to update localStorage backup:', localStorageError);
      }
      
    } catch (error) {
      console.error('❌ Error deleting medical requirement order:', error);
      throw error;
    }
  },

  // Recalculate requirement counts for all patients in a clinic
  async recalculateAllPatientRequirementCounts(clinicId: string): Promise<void> {
    try {
      console.log('🔄 Starting requirement count recalculation for clinic:', clinicId);
      
      // Get all active orders for the clinic
      const orders = await this.getOrdersByClinic(clinicId);
      
      // Group orders by patient
      const patientOrderCounts = new Map<string, number>();
      
      orders.forEach(order => {
        if (order.status === 'pending') {
          const currentCount = patientOrderCounts.get(order.patientId) || 0;
          patientOrderCounts.set(order.patientId, currentCount + 1);
        }
      });
      
      // Update each patient's counts
      const updatePromises = Array.from(patientOrderCounts.entries()).map(([patientId, count]) =>
        PatientService.setRequirementCount(patientId, count)
      );
      
      await Promise.all(updatePromises);
      console.log(`✅ Updated requirement counts for ${patientOrderCounts.size} patients in clinic:`, clinicId);
      
    } catch (error) {
      console.error('❌ Error recalculating all patient requirement counts:', error);
      throw error;
    }
  },

  // Complete order with documents
  async completeOrder(
    clinicId: string, 
    orderId: string, 
    completionData: {
      processedBy: string;
      completionNotes?: string;
      actualTime?: string;
      documents?: Array<{
        name: string;
        url: string;
        type: string;
        size: number;
        category: 'completed_result' | 'supporting_doc';
        uploadedBy: string;
      }>;
    }
  ): Promise<void> {
    try {
      const currentOrder = await this.getOrderById(clinicId, orderId);
      if (!currentOrder) throw new Error('Order not found');

      const newDocuments = completionData.documents?.map((doc, index) => ({
        id: `doc-${orderId}-${Date.now()}-${index}`,
        ...doc,
        uploadDate: new Date().toISOString().split('T')[0],
      })) || [];

      await this.updateOrder(clinicId, orderId, {
        status: 'completed',
        workflow_stage: 'completed',
        processedBy: completionData.processedBy,
        completedDate: new Date().toISOString().split('T')[0],
        completionNotes: completionData.completionNotes,
        actualTime: completionData.actualTime,
        documents: [
          ...(currentOrder.documents || []),
          ...newDocuments,
        ],
      });

      // In a real implementation, you would also:
      // 1. Update the original patient requirement
      // 2. Send notification to the doctor/patient
      // 3. Create billing entries if needed
      
      console.log('✅ Medical requirement order completed:', orderId);
    } catch (error) {
      console.error('❌ Error completing medical requirement order:', error);
      throw error;
    }
  },

  // Get single order by ID
  async getOrderById(clinicId: string, orderId: string): Promise<MedicalRequirementOrder | null> {
    try {
      // Use proper Firebase access pattern
      let db;
      if (firebaseManager.isReadySync()) {
        try {
          db = firebaseManager.getFirestoreSync();
        } catch (error) {
          console.warn('⚠️ Sync access failed, falling back to async:', error);
          if (!(await firebaseManager.isReady())) {
            throw new Error('Firebase not ready - please wait for initialization');
          }
          await firebaseManager.cacheInstances();
          db = await getOptimizedFirestore();
        }
      } else {
        if (!(await firebaseManager.isReady())) {
          throw new Error('Firebase not ready - please wait for initialization');
        }
        await firebaseManager.cacheInstances();
        db = await getOptimizedFirestore();
      }
      
      if (!db) throw new Error('Firestore not initialized');
      
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data()
        } as MedicalRequirementOrder;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching medical requirement order:', error);
      throw error;
    }
  },

  // Deactivate order (soft delete)
  async deactivateOrder(clinicId: string, orderId: string): Promise<void> {
    try {
      await this.updateOrder(clinicId, orderId, {
        isActive: false,
        status: 'cancelled',
      });
      
      console.log('✅ Medical requirement order deactivated:', orderId);
    } catch (error) {
      console.error('❌ Error deactivating medical requirement order:', error);
      throw error;
    }
  },

  // ✅ ADDED: Handle incorrectly completed orders - move back to pending
  async moveOrderBackToPending(
    clinicId: string, 
    orderId: string, 
    reason: string
  ): Promise<void> {
    try {
      console.log(`🔄 Moving order ${orderId} back to pending status. Reason: ${reason}`);
      
      await this.updateOrder(clinicId, orderId, {
        status: 'pending',
        workflow_stage: 'ordered',
        processingNotes: `Order moved back to pending: ${reason}`,
        completedDate: undefined,
        actualTime: undefined,
        processedBy: undefined,
        completionNotes: undefined,
      });
      
      console.log('✅ Order moved back to pending status:', orderId);
    } catch (error) {
      console.error('❌ Error moving order back to pending:', error);
      throw error;
    }
  },

  // ✅ ADDED: Get orders by status with localStorage fallback
  async getOrdersByStatusWithFallback(clinicId: string, status: string): Promise<MedicalRequirementOrder[]> {
    try {
      // Try Firebase first
      const orders = await this.getOrdersByStatus(clinicId, status);
      return orders;
    } catch (error) {
      console.log(`🔄 Firebase failed for status ${status}, falling back to localStorage...`);
      
      // Fallback to localStorage
      const allOrders = loadFromLocalStorage(clinicId);
      const filteredOrders = allOrders.filter(order => order.status === status);
      
      if (filteredOrders.length > 0) {
        console.log(`✅ Loaded ${filteredOrders.length} ${status} orders from localStorage`);
        return filteredOrders;
      }
      
      console.log(`⚠️ No ${status} orders found in localStorage`);
      return [];
    }
  },

  // ✅ ADDED: Get pending orders (for new requirements)
  async getPendingOrders(clinicId: string): Promise<MedicalRequirementOrder[]> {
    return this.getOrdersByStatusWithFallback(clinicId, 'pending');
  },

  // ✅ ADDED: Get completed orders (for completed documents)
  async getCompletedOrders(clinicId: string): Promise<MedicalRequirementOrder[]> {
    return this.getOrdersByStatusWithFallback(clinicId, 'completed');
  },

  // ✅ ADDED: Get in-progress orders
  async getInProgressOrders(clinicId: string): Promise<MedicalRequirementOrder[]> {
    return this.getOrdersByStatusWithFallback(clinicId, 'in_progress');
  },

  // ✅ ADDED: Validate order data before creation
  validateOrderData(orderData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!orderData.patientId) errors.push('Patient ID is required');
    if (!orderData.patientName) errors.push('Patient name is required');
    if (!orderData.title) errors.push('Title is required');
    if (!orderData.description) errors.push('Description is required');
    if (!orderData.requirementType) errors.push('Requirement type is required');
    if (!orderData.priority) errors.push('Priority is required');
    if (!orderData.orderedBy) errors.push('Ordered by is required');
    
    // Validate data types
    if (orderData.patientAge !== undefined && typeof orderData.patientAge !== 'number') {
      errors.push('Patient age must be a number');
    }
    
    if (orderData.patientAge !== undefined && (orderData.patientAge < 0 || orderData.patientAge > 150)) {
      errors.push('Patient age must be between 0 and 150');
    }
    
    // Validate arrays
    if (orderData.patientAllergies && !Array.isArray(orderData.patientAllergies)) {
      errors.push('Patient allergies must be an array');
    }
    
    if (orderData.preparations && !Array.isArray(orderData.preparations)) {
      errors.push('Preparations must be an array');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Create order from patient requirement
  async createOrderFromPatientRequirement(
    clinicId: string, 
    patientRequirement: {
      id: string;
      patientId: string;
      patientName: string;
      type: string;
      title: string;
      description: string;
      priority: string;
      dueDate?: string;
      orderedBy: string;
      estimatedTime?: string;
      preparations?: string[];
      // Enhanced patient data
      patientAge?: number;
      patientGender?: string;
      patientPhone?: string;
      patientEmail?: string;
      patientBloodType?: string;
      patientAllergies?: string[];
      patientCondition?: string;
      patientInsurance?: string;
      doctorId?: string;
      doctorName?: string;
      doctorRole?: string;
    }
  ): Promise<string> {
    try {
      console.log('🔄 Creating order from patient requirement:', patientRequirement);
      
      const orderData: Omit<MedicalRequirementOrder, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'isActive'> = {
        patientId: patientRequirement.patientId,
        patientName: patientRequirement.patientName,
        // Enhanced patient data - only include if they have values
        ...(patientRequirement.patientAge !== undefined && { patientAge: patientRequirement.patientAge }),
        ...(patientRequirement.patientGender && { patientGender: patientRequirement.patientGender }),
        ...(patientRequirement.patientPhone && { patientPhone: patientRequirement.patientPhone }),
        ...(patientRequirement.patientEmail && { patientEmail: patientRequirement.patientEmail }),
        ...(patientRequirement.patientBloodType && { patientBloodType: patientRequirement.patientBloodType }),
        ...(patientRequirement.patientAllergies && patientRequirement.patientAllergies.length > 0 && { patientAllergies: patientRequirement.patientAllergies }),
        ...(patientRequirement.patientCondition && { patientCondition: patientRequirement.patientCondition }),
        ...(patientRequirement.patientInsurance && { patientInsurance: patientRequirement.patientInsurance }),
        // Requirement details
        requirementType: patientRequirement.type as any,
        title: patientRequirement.title,
        description: patientRequirement.description,
        category: patientRequirement.type === 'lab' ? 'Laboratory Tests' : 
                 patientRequirement.type === 'imaging' ? 'Radiology' : 
                 'Other Tests',
        priority: patientRequirement.priority as any,
        status: 'pending',
        workflow_stage: 'ordered',
        dateOrdered: new Date().toISOString().split('T')[0],
        ...(patientRequirement.dueDate && { dueDate: patientRequirement.dueDate }),
        orderedBy: patientRequirement.orderedBy,
        orderedByRole: patientRequirement.doctorRole || 'Doctor',
        ...(patientRequirement.doctorId && { doctorId: patientRequirement.doctorId }),
        ...(patientRequirement.doctorName && { doctorName: patientRequirement.doctorName }),
        ...(patientRequirement.estimatedTime && { estimatedTime: patientRequirement.estimatedTime }),
        ...(patientRequirement.preparations && patientRequirement.preparations.length > 0 && { preparations: patientRequirement.preparations }),
        originalPatientRequirementId: patientRequirement.id,
        resultsSentToPatient: false,
        patientNotified: false,
      };

      console.log('📋 Processed order data before sanitization:', orderData);

      return await this.createOrder(clinicId, orderData);
    } catch (error) {
      console.error('❌ Error creating order from patient requirement:', error);
      throw error;
    }
  },

  // Send completed results back to patient
  async deliverResultsToPatient(
    clinicId: string, 
    orderId: string, 
    deliveryMethod: 'patient_portal' | 'email' | 'physical'
  ): Promise<void> {
    try {
      await this.updateOrder(clinicId, orderId, {
        workflow_stage: 'delivered',
        deliveredDate: new Date().toISOString().split('T')[0],
        resultsSentToPatient: true,
        patientNotified: true,
      });

      // In a real implementation, you would:
      // 1. Add documents to patient's medical record
      // 2. Send email/SMS notification
      // 3. Update patient requirement status to 'completed'
      
      console.log('✅ Results delivered to patient for order:', orderId);
    } catch (error) {
      console.error('❌ Error delivering results to patient:', error);
      throw error;
    }
  },

  // Get statistics for dashboard
  async getOrderStatistics(clinicId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    urgent: number;
    overdue: number;
  }> {
    try {
      const orders = await this.getOrdersByClinic(clinicId);
      const today = new Date().toISOString().split('T')[0];
      
      return {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        inProgress: orders.filter(order => order.status === 'in_progress').length,
        completed: orders.filter(order => order.status === 'completed').length,
        urgent: orders.filter(order => order.priority === 'urgent').length,
        overdue: orders.filter(order => 
          order.dueDate && order.dueDate < today && order.status !== 'completed'
        ).length,
      };
    } catch (error) {
      console.error('❌ Error fetching order statistics:', error);
      throw error;
    }
  },

  // ✅ ADDED: Sync localStorage with Firebase when connection is restored
  async syncLocalStorageWithFirebase(clinicId: string): Promise<void> {
    try {
      const localStorageOrders = loadFromLocalStorage(clinicId);
      if (localStorageOrders.length === 0) {
        console.log('ℹ️ No localStorage data to sync');
        return;
      }

      console.log(`🔄 Syncing ${localStorageOrders.length} medical requirements from localStorage to Firebase...`);
      
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      
      // Check which orders exist in Firebase
      const firebaseQuery = query(
        ordersCollection,
        where('clinicId', '==', clinicId),
        where('isActive', '==', true)
      );
      
      const firebaseSnapshot = await getDocs(firebaseQuery);
      const existingFirebaseIds = new Set(firebaseSnapshot.docs.map(doc => doc.id));
      
      // Find orders that exist in localStorage but not in Firebase
      const ordersToSync = localStorageOrders.filter(order => !existingFirebaseIds.has(order.id));
      
      if (ordersToSync.length === 0) {
        console.log('✅ All localStorage orders are already in Firebase');
        return;
      }
      
      // Sync missing orders to Firebase
      for (const order of ordersToSync) {
        try {
          const { id, ...orderData } = order;
          await addDoc(ordersCollection, {
            ...orderData,
            clinicId,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log(`✅ Synced order ${id} to Firebase`);
        } catch (syncError) {
          console.error(`❌ Failed to sync order ${order.id} to Firebase:`, syncError);
        }
      }
      
      console.log(`✅ Synced ${ordersToSync.length} orders from localStorage to Firebase`);
      
      // Refresh localStorage with current Firebase data
      const updatedFirebaseSnapshot = await getDocs(firebaseQuery);
      const updatedOrders = updatedFirebaseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
      
      saveToLocalStorage(clinicId, updatedOrders);
      console.log('✅ localStorage updated with current Firebase data');
      
    } catch (error) {
      console.error('❌ Error syncing localStorage with Firebase:', error);
    }
  },

  // ✅ ADDED: Refresh medical requirements count for a specific patient
  async refreshPatientRequirementsCount(clinicId: string, patientId: string): Promise<number> {
    try {
      // ✅ OPTIMIZED: Use dedicated method for pending requirements
      const requirements = await this.getPendingOrdersByPatient(clinicId, patientId);
      const count = requirements.length; // Already filtered for pending only
      
      // Dispatch event to update patient list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medicalRequirementCountRefreshed', {
          detail: {
            patientId,
            count,
            clinicId
          }
        }));
      }
      
      console.log(`✅ Refreshed requirements count for patient ${patientId}: ${count} pending`);
      return count;
    } catch (error) {
      console.error(`❌ Error refreshing requirements count for patient ${patientId}:`, error);
      return 0;
    }
  },

  // ✅ ADDED: Get all patient requirements counts for a clinic
  async getAllPatientRequirementsCounts(clinicId: string): Promise<Map<string, number>> {
    try {
      console.log(`🔍 Getting all patient requirements counts for clinic ${clinicId}`);
      
      const allOrders = await this.getOrdersByClinic(clinicId);
      const countsMap = new Map<string, number>();
      
      console.log(`📊 Processing ${allOrders.length} total orders`);
      
      // Group orders by patient ID - ONLY COUNT PENDING ORDERS
      allOrders.forEach(order => {
        if (order.isActive && order.patientId && order.status === 'pending') {
          const currentCount = countsMap.get(order.patientId) || 0;
          countsMap.set(order.patientId, currentCount + 1);
        }
      });
      
      console.log(`✅ Got requirements counts for ${countsMap.size} patients:`, Array.from(countsMap.entries()));
      return countsMap;
    } catch (error) {
      console.error('❌ Error getting all patient requirements counts:', error);
      
      // Try localStorage fallback
      try {
        console.log('🔄 Falling back to localStorage for counts...');
        const localStorageOrders = loadFromLocalStorage(clinicId);
        const countsMap = new Map<string, number>();
        
        localStorageOrders.forEach(order => {
          if (order.isActive && order.patientId && order.status === 'pending') {
            const currentCount = countsMap.get(order.patientId) || 0;
            countsMap.set(order.patientId, currentCount + 1);
          }
        });
        
        console.log(`✅ Got localStorage counts for ${countsMap.size} patients`);
        return countsMap;
      } catch (localStorageError) {
        console.error('❌ localStorage fallback also failed:', localStorageError);
        return new Map();
      }
    }
  },

  // ✅ ADDED: Force refresh of all patient requirements counts
  async forceRefreshAllCounts(clinicId: string): Promise<void> {
    try {
      console.log('🔄 Force refreshing all patient requirements counts...');
      
      const countsMap = await this.getAllPatientRequirementsCounts(clinicId);
      
      // Dispatch event to update all patient counts
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('allMedicalRequirementCountsRefreshed', {
          detail: {
            clinicId,
            counts: Object.fromEntries(countsMap)
          }
        }));
      }
      
      console.log('✅ All patient requirements counts refreshed');
    } catch (error) {
      console.error('❌ Error force refreshing all counts:', error);
    }
  },
};

export default MedicalRequirementsService; 