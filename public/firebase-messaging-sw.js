// Firebase Messaging Service Worker
// Handles background push notifications when the tab is closed

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyADMGNUCzMk_OEMqhsxNTDg-NnA1Sh7ZUk",
  authDomain: "velnara-7.firebaseapp.com",
  projectId: "velnara-7",
  storageBucket: "velnara-7.firebasestorage.app",
  messagingSenderId: "545052033180",
  appId: "1:545052033180:web:7d289f83a681f481af2d59",
});

const messaging = firebase.messaging();

// Handle background messages (when tab is closed or not focused)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title || "New Medicine Request!";
  const options = {
    body: payload.notification?.body || "A customer is looking for medicine nearby.",
    icon: "/icons/notification.png",
    badge: "/icons/notification.png",
    tag: "medicine-request",
    renotify: true,
    data: {
      url: payload.data?.url || "/shop/requests",
    },
  };

  self.registration.showNotification(title, options);
});

// Handle notification click - open the requests page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/shop/requests";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes("/shop") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new tab
      return clients.openWindow(url);
    })
  );
});
