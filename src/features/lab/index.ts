// Export pages
export { default as LabPage } from './pages/LabPage';
export { default as LabRadiologyPage } from './pages/LabRadiologyPage';
export { default as TasksPage } from './pages/TasksPage';

// Export stores and utilities
export { ordersStore } from './ordersStore';
export { tasksStore } from './tasksStore';
export { normalizeOrderDraft } from './ordersStore';
export { buildWhatsAppUrl, isWhatsAppAvailable } from './whatsappUtils';

// Export types
export type { Order, OrderDraft, OrderItem, OrderPatient, OrderDraftItem, OrderDraftPatient, TaskItem } from './types';