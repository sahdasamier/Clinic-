import { normalizePhone, isValidPhone } from './ordersStore';

// Build WhatsApp URL with non-sensitive message
export const buildWhatsAppUrl = (phone: string, patientName: string, orderId: string): string => {
  const normalizedPhone = normalizePhone(phone);
  
  // Build non-sensitive message (no PHI)
  const message = `Patient: ${patientName}. Order ID: ${orderId}. Please review in the clinic system.`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Build WhatsApp URL
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
};

// Check if phone is valid for WhatsApp
export const isWhatsAppAvailable = (phone: string): boolean => {
  return isValidPhone(phone);
};