import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  getDocs,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../api/firebase';

const COLLECTION_NAME = 'inventory';
const inventoryCollection = collection(db, COLLECTION_NAME);

export interface InventoryItem {
  id: string;
  clinicId: string;
  
  // Basic item info
  name: string;
  description?: string;
  category: 'medication' | 'equipment' | 'supplies' | 'consumables' | 'other';
  type: string; // More specific type within category
  
  // Inventory details
  quantity: number;
  unit: string; // 'pieces', 'boxes', 'bottles', 'ml', 'kg', etc.
  minQuantity: number; // Alert threshold
  maxQuantity?: number; // Maximum stock level
  
  // Supplier information
  supplier: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  
  // Pricing
  unitCost: number;
  totalCost: number;
  currency: string;
  
  // Dates and tracking
  purchaseDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD for medications
  lastRestocked?: string; // YYYY-MM-DD
  lastUpdated: string; // YYYY-MM-DD
  
  // Storage and location
  location?: string; // Storage location in clinic
  storage_requirements?: string; // e.g., "Refrigerate", "Dry place"
  
  // Medical/regulatory info
  batchNumber?: string;
  barcode?: string;
  manufacturerInfo?: {
    name: string;
    licenseNumber?: string;
    country?: string;
  };
  
  // Usage tracking
  monthlyUsage?: number; // Average monthly consumption
  lastUsed?: string; // YYYY-MM-DD
  
  // Alerts and status
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled';
  alerts: Array<{
    type: 'low_stock' | 'expiry_warning' | 'expired' | 'recalled';
    message: string;
    created: string;
    acknowledged?: boolean;
  }>;
  
  // Notes and tags
  notes?: string;
  tags?: string[];
  
  // System fields
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export const InventoryService = {
  // Create a new inventory item
  async createItem(clinicId: string, itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'alerts' | 'status'>): Promise<string> {
    const id = crypto.randomUUID();
    
    // Calculate status based on quantity
    let status: InventoryItem['status'] = 'in_stock';
    if (itemData.quantity <= 0) {
      status = 'out_of_stock';
    } else if (itemData.quantity <= itemData.minQuantity) {
      status = 'low_stock';
    }
    
    // Check for expiry
    if (itemData.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (itemData.expiryDate <= today) {
        status = 'expired';
      }
    }
    
    const item: InventoryItem = {
      ...itemData,
      id,
      clinicId,
      status,
      alerts: [],
      totalCost: itemData.quantity * itemData.unitCost,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(inventoryCollection, id), item);
    console.log('✅ Inventory item created:', id);
    return id;
  },

  // Update an inventory item
  async updateItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    const itemRef = doc(inventoryCollection, itemId);
    
    const updateData = { ...updates };
    
    // Recalculate total cost if quantity or unit cost changed
    if (updates.quantity !== undefined || updates.unitCost !== undefined) {
      const currentItem = await this.getItem(itemId);
      if (currentItem) {
        const newQuantity = updates.quantity ?? currentItem.quantity;
        const newUnitCost = updates.unitCost ?? currentItem.unitCost;
        updateData.totalCost = newQuantity * newUnitCost;
        
        // Update status based on new quantity
        if (newQuantity <= 0) {
          updateData.status = 'out_of_stock';
        } else if (newQuantity <= currentItem.minQuantity) {
          updateData.status = 'low_stock';
        } else {
          updateData.status = 'in_stock';
        }
      }
    }

    await setDoc(itemRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('✅ Inventory item updated:', itemId);
  },

  // Get a single inventory item
  async getItem(itemId: string): Promise<InventoryItem | null> {
    const q = query(inventoryCollection, where('__name__', '==', itemId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as InventoryItem;
  },

  // Delete an inventory item
  async deleteItem(itemId: string): Promise<void> {
    await this.updateItem(itemId, { isActive: false });
    console.log('✅ Inventory item soft deleted:', itemId);
  },

  // Listen to inventory for a specific clinic
  listenInventory(clinicId: string, callback: (items: InventoryItem[]) => void): () => void {
    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      
      console.log(`📦 Inventory updated: ${items.length} active items`);
      callback(items);
    }, (error) => {
      console.error('❌ Error listening to inventory:', error);
      callback([]);
    });
  },

  // Listen to low stock items
  listenLowStockItems(clinicId: string, callback: (items: InventoryItem[]) => void): () => void {
    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('status', 'in', ['low_stock', 'out_of_stock']),
      where('isActive', '==', true),
      orderBy('quantity', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      
      callback(items);
    });
  },

  // Listen to items by category
  listenItemsByCategory(clinicId: string, category: InventoryItem['category'], callback: (items: InventoryItem[]) => void): () => void {
    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      
      callback(items);
    });
  },

  // Update stock quantity (for usage tracking)
  async updateStock(itemId: string, quantityChange: number, reason?: string): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    const newQuantity = Math.max(0, item.quantity + quantityChange);
    const updates: Partial<InventoryItem> = {
      quantity: newQuantity,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (quantityChange < 0) {
      updates.lastUsed = new Date().toISOString().split('T')[0];
    }

    if (reason) {
      updates.notes = `${item.notes || ''}\n${new Date().toLocaleDateString()}: ${reason} (${quantityChange > 0 ? '+' : ''}${quantityChange})`.trim();
    }

    await this.updateItem(itemId, updates);
  },

  // Restock item
  async restockItem(itemId: string, quantityAdded: number, cost?: number, batchNumber?: string): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    const updates: Partial<InventoryItem> = {
      quantity: item.quantity + quantityAdded,
      lastRestocked: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (cost) {
      updates.unitCost = cost;
    }

    if (batchNumber) {
      updates.batchNumber = batchNumber;
    }

    await this.updateItem(itemId, updates);
  },

  // Add alert to item
  async addAlert(itemId: string, alert: Omit<InventoryItem['alerts'][0], 'created'>): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    const newAlert = {
      ...alert,
      created: new Date().toISOString()
    };

    const updatedAlerts = [...item.alerts, newAlert];

    await this.updateItem(itemId, { alerts: updatedAlerts });
  },

  // Acknowledge alert
  async acknowledgeAlert(itemId: string, alertIndex: number): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item || !item.alerts[alertIndex]) {
      throw new Error('Item or alert not found');
    }

    const updatedAlerts = [...item.alerts];
    updatedAlerts[alertIndex] = {
      ...updatedAlerts[alertIndex],
      acknowledged: true
    };

    await this.updateItem(itemId, { alerts: updatedAlerts });
  },

  // Get expiring items (within specified days)
  async getExpiringItems(clinicId: string, daysAhead: number = 30): Promise<InventoryItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('expiryDate', '<=', futureDateStr),
      where('isActive', '==', true),
      orderBy('expiryDate', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InventoryItem[];
  },

  // Search inventory items
  async searchItems(clinicId: string, searchTerm: string): Promise<InventoryItem[]> {
    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const allItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InventoryItem[];

    // Client-side filtering
    const searchTermLower = searchTerm.toLowerCase();
    return allItems.filter(item => 
      item.name?.toLowerCase().includes(searchTermLower) ||
      item.description?.toLowerCase().includes(searchTermLower) ||
      item.supplier?.toLowerCase().includes(searchTermLower) ||
      item.batchNumber?.toLowerCase().includes(searchTermLower) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
    );
  },

  // Get inventory statistics
  async getInventoryStats(clinicId: string): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItemsThisMonth: number;
    categoryBreakdown: Record<InventoryItem['category'], number>;
  }> {
    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => doc.data()) as InventoryItem[];

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0);
    const lowStockItems = items.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = items.filter(item => item.status === 'out_of_stock').length;
    const expiringItemsThisMonth = items.filter(item => 
      item.expiryDate && item.expiryDate <= nextMonthStr
    ).length;

    const categoryBreakdown: Record<InventoryItem['category'], number> = {
      medication: 0,
      equipment: 0,
      supplies: 0,
      consumables: 0,
      other: 0
    };

    items.forEach(item => {
      categoryBreakdown[item.category]++;
    });

    return {
      totalItems: items.length,
      totalValue,
      lowStockItems,
      outOfStockItems,
      expiringItemsThisMonth,
      categoryBreakdown,
    };
  },

  // Auto-update expired items
  async updateExpiredItems(clinicId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      inventoryCollection,
      where('clinicId', '==', clinicId),
      where('expiryDate', '<', today),
      where('status', '!=', 'expired'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        status: 'expired',
        updatedAt: serverTimestamp()
      });
    });

    if (snapshot.size > 0) {
      await batch.commit();
      console.log(`✅ Updated ${snapshot.size} expired items`);
    }

    return snapshot.size;
  }
};

export default InventoryService; 