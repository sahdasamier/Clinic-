// Firebase Cloud Messaging Service Worker
// 
// IMPORTANT: To enable notifications, replace the placeholder values below with your actual Firebase config:
// 1. Go to Firebase Console > Project Settings > General > Your apps
// 2. Find your web app configuration 
// 3. Replace the placeholder values with your actual Firebase config values
// 4. The config should match the values in your .env file (but without process.env references)
//
// Example:
// apiKey: "AIzaSyC...",
// authDomain: "your-project.firebaseapp.com",
// projectId: "your-project-id",
// etc.

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: These values should be replaced with actual Firebase config during build
// For development, you can temporarily hardcode your values here
// Use hostname to pick correct project at runtime (SW can't access Vite envs)
const host = self.location.hostname || '';
const prodHosts = new Set(['clinicy-health.firebaseapp.com', 'clinicy-health.web.app']);
let isProdHost = prodHosts.has(host);
try {
  // Respect a persisted override flag if present
  const override = self.localStorage?.getItem?.('firebaseProject');
  if (override === 'dev') isProdHost = false;
  if (override === 'prod') isProdHost = true;
} catch {}

const devConfig = {
  apiKey: "AIzaSyDotAr3OZOao6-2EGsg6xusem8ENdgRa-E",
  authDomain: "clinic-d9c0a.firebaseapp.com",
  projectId: "clinic-d9c0a",
  storageBucket: "clinic-d9c0a.firebasestorage.app",
  messagingSenderId: "430481926571",
  appId: "1:430481926571:web:4ac32749d6b0f674868aee"
};

const prodConfig = {
  apiKey: "AIzaSyBU9NyJYqpve2-Ac_hvKOhUtFlRtb2yJlc",
  authDomain: "clinicy-health.firebaseapp.com",
  projectId: "clinicy-health",
  storageBucket: "clinicy-health.firebasestorage.app",
  messagingSenderId: "61851414075",
  appId: "1:61851414075:web:5346d6a0d537557e0d361e"
};

firebase.initializeApp(isProdHost ? prodConfig : devConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Clinic Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  const clickAction = event.action;
  const notificationData = event.notification.data;
  
  if (clickAction === 'dismiss') {
    // User dismissed the notification
    return;
  }
  
  // Default action or 'view' action
  let urlToOpen = '/';
  
  // Determine the URL based on notification type
  if (notificationData) {
    switch (notificationData.type) {
      case 'appointment_reminder':
      case 'appointment_confirmation':
      case 'appointment_cancelled':
        urlToOpen = `/appointments/${notificationData.appointmentId}`;
        break;
      case 'new_patient':
        urlToOpen = `/patients/${notificationData.patientId}`;
        break;
      case 'payment_reminder':
        urlToOpen = `/payments/${notificationData.paymentId}`;
        break;
      case 'laboratoryRadiology_low_stock':
        urlToOpen = `/laboratoryRadiology/${notificationData.itemId}`;
        break;
      default:
        urlToOpen = '/dashboard';
    }
  }
  
  // Open the URL in a new window/tab or focus existing one
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed.', event.notification);
  
  // Optional: Track notification dismissal analytics
  const notificationData = event.notification.data;
  if (notificationData && notificationData.type) {
    // You could send analytics data here
    console.log('Notification dismissed:', notificationData.type);
  }
});

// Handle push events (for custom processing)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push received.', event);
  
  // This is handled by Firebase Messaging, but you can add custom logic here
  // if needed for specific notification types
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing.');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating.');
  // Take control of all open clients
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] Message received from main thread:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 