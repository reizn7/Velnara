import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { app } from "./firebaseClient";

let messagingInstance = null;

/**
 * Get Firebase Messaging instance (lazy, browser-only).
 * Returns null if messaging is not supported (e.g. Safari on iOS, SSR).
 */
async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) {
    console.warn("FCM not supported in this browser");
    return null;
  }

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

/**
 * Request notification permission and get FCM token.
 * Registers the service worker on first call.
 * Returns the token string, or null if denied/unsupported.
 */
export async function requestNotificationPermission() {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    // Request browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await navigator.serviceWorker.ready;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error("VAPID key not configured. Set NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env");
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM token obtained");
      return token;
    } else {
      console.log("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

/**
 * Listen for messages when the app tab IS focused/open.
 * Returns an unsubscribe function.
 */
export async function onForegroundMessage(callback) {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      callback(payload);
    });
  } catch (error) {
    console.error("Error setting up foreground listener:", error);
    return () => {};
  }
}
