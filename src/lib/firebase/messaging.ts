/**
 * Firebase Messaging Service
 * Provides push notification functionality
 */

// Re-export from API layer for compatibility
export { getFirebaseMessaging, isMessagingSupported, getFcmToken, onForegroundMessage, isMessagingReady } from '@lib/api/messaging';