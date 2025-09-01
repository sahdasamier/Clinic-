import { ordersStore, normalizeOrderDraft } from './index';
import { OrderDraft } from './types';

/**
 * Integration function for Patient page to create and open a lab order
 * 
 * @param orderDraft - The order draft from the Patient page
 */
export const createAndOpenLabOrder = (orderDraft: OrderDraft): void => {
  try {
    // 1) Normalize/migrate incoming data to the internal Order shape
    const order = normalizeOrderDraft(orderDraft);
    
    // 2) Persist it to the Orders store
    ordersStore.upsertOrder(order);
    
    // 3) Navigate to `/lab/:orderId`
    // Note: In a real implementation, you would use the router's navigate function
    // For now, we'll simulate this with a console log and window location change
    console.log(`Navigating to lab order: ${order.id}`);
    window.location.hash = `#/lab/${order.id}`;
    
    // If using React Router, you would do:
    // navigate(`/lab/${order.id}`);
  } catch (error) {
    console.error('Error creating lab order:', error);
    // In a real app, you might want to show an error notification to the user
  }
};