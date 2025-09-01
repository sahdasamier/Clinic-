/**
 * Firebase Analytics Service
 * Provides analytics tracking functionality
 */

// Re-export from API layer for compatibility
export { getFirebaseAnalytics, isAnalyticsSupported, trackEvent, setAnalyticsUserId, setAnalyticsUserProperties, isAnalyticsReady } from '@lib/api/analytics';