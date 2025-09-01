import { Order, OrderDraft } from './types';

// Namespace for localStorage keys
const STORAGE_KEY = 'clinic_lab_orders';

// Orders store interface
export interface OrdersStore {
  upsertOrder: (order: Order) => void;
  updateOrder: (orderId: string, updater: (order: Order) => Order) => void;
  getOrder: (id: string) => Order | undefined;
  listOrders: () => Order[];
}

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Normalize phone number (strip non-digits, allow leading +)
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  // Keep leading + if present, then only digits
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.substring(1).replace(/\D/g, '');
  }
  return cleaned.replace(/\D/g, '');
};

// Validate phone number (at least 8 digits after cleaning)
export const isValidPhone = (phone: string): boolean => {
  const cleaned = normalizePhone(phone);
  // Allow leading +, then at least 8 digits
  return /^(\+\d{8,}|\d{8,})$/.test(cleaned);
};

// Normalize/Migrate OrderDraft to Order
export const normalizeOrderDraft = (draft: OrderDraft): Order => {
  return {
    id: generateId(),
    patient: {
      id: draft.patient.id || generateId(),
      name: draft.patient.name,
      age: draft.patient.age,
      phone: normalizePhone(draft.patient.phone)
    },
    items: draft.items.map((item: any) => ({
      id: generateId(),
      description: item.description,
      modality: item.modality,
      priority: item.priority,
      done: false
    })),
    status: 'sentToLab',
    createdAt: new Date().toISOString()
  };
};

// Orders store implementation
class OrdersStoreImpl implements OrdersStore {
  private orders: Record<string, Order> = {};

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
    } catch (error) {
      console.error('Failed to save orders to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.orders = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load orders from localStorage:', error);
      this.orders = {};
    }
  }

  upsertOrder(order: Order): void {
    this.orders[order.id] = order;
    this.saveToStorage();
  }

  updateOrder(orderId: string, updater: (order: Order) => Order): void {
    const order = this.getOrder(orderId);
    if (order) {
      this.orders[orderId] = updater(order);
      this.saveToStorage();
    }
  }

  getOrder(id: string): Order | undefined {
    return this.orders[id];
  }

  listOrders(): Order[] {
    return Object.values(this.orders);
  }
}

// Export singleton instance
export const ordersStore = new OrdersStoreImpl();