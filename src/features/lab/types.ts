// OrderDraft (from Patient page)
export interface OrderDraftPatient {
  id?: string;
  name: string;
  age: number;
  phone: string;
}

export interface OrderDraftItem {
  description: string;
  modality: 'lab' | 'radiology';
  priority?: 'routine' | 'urgent';
}

export interface OrderDraft {
  patient: OrderDraftPatient;
  items: OrderDraftItem[];
}

// Order (internal)
export interface OrderPatient {
  id: string;
  name: string;
  age: number;
  phone: string;
}

export interface OrderItem {
  id: string;
  description: string;
  modality: 'lab' | 'radiology';
  priority?: 'routine' | 'urgent';
  done?: boolean;
}

export interface Order {
  id: string;
  patient: OrderPatient;
  items: OrderItem[];
  status: 'draft' | 'sentToLab' | 'inProgress' | 'completed';
  createdAt: string; // ISO
}

// Task item for the checklist
export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}