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
import { safeFirestore } from '../api/firebaseDirect';

const COLLECTION_NAME = 'medicalRequirementOrders';

const getMedicalRequirementsCollection = async (clinicId: string) => {
  const db = await safeFirestore.getDb();
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
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      
      const newOrder = {
        ...orderData,
        clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(ordersCollection, newOrder);
      console.log('✅ Medical requirement order created:', docRef.id);
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
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
    } catch (error) {
      console.error('❌ Error fetching medical requirement orders:', error);
      throw error;
    }
  },

  // Get orders for a specific patient
  async getOrdersByPatient(clinicId: string, patientId: string): Promise<MedicalRequirementOrder[]> {
    try {
      const ordersCollection = await getMedicalRequirementsCollection(clinicId);
      const q = query(
        ordersCollection,
        where('clinicId', '==', clinicId),
        where('patientId', '==', patientId),
        where('isActive', '==', true),
        orderBy('dateOrdered', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalRequirementOrder));
    } catch (error) {
      console.error('❌ Error fetching patient medical requirement orders:', error);
      throw error;
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
      const db = await safeFirestore.getDb();
      if (!db) throw new Error('Firestore not initialized');
      
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Medical requirement order updated:', orderId);
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
      const db = await safeFirestore.getDb();
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

  // Delete/deactivate order
  async deleteOrder(clinicId: string, orderId: string): Promise<void> {
    try {
      await this.updateOrder(clinicId, orderId, {
        isActive: false,
        status: 'cancelled',
      });
      
      console.log('✅ Medical requirement order deactivated:', orderId);
    } catch (error) {
      console.error('❌ Error deleting medical requirement order:', error);
      throw error;
    }
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
      const orderData: Omit<MedicalRequirementOrder, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'isActive'> = {
        patientId: patientRequirement.patientId,
        patientName: patientRequirement.patientName,
        // Enhanced patient data
        patientAge: patientRequirement.patientAge,
        patientGender: patientRequirement.patientGender,
        patientPhone: patientRequirement.patientPhone,
        patientEmail: patientRequirement.patientEmail,
        patientBloodType: patientRequirement.patientBloodType,
        patientAllergies: patientRequirement.patientAllergies,
        patientCondition: patientRequirement.patientCondition,
        patientInsurance: patientRequirement.patientInsurance,
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
        dueDate: patientRequirement.dueDate,
        orderedBy: patientRequirement.orderedBy,
        orderedByRole: patientRequirement.doctorRole || 'Doctor',
        doctorId: patientRequirement.doctorId,
        doctorName: patientRequirement.doctorName,
        estimatedTime: patientRequirement.estimatedTime,
        preparations: patientRequirement.preparations,
        originalPatientRequirementId: patientRequirement.id,
        resultsSentToPatient: false,
        patientNotified: false,
      };

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
};

export default MedicalRequirementsService; 