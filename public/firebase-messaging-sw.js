// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyChkyg2JBvXkRkoFF5-aE_cY21EdZ-RNLM",
  authDomain: "calla-notifications.firebaseapp.com",
  projectId: "calla-notifications",
  storageBucket: "calla-notifications.firebasestorage.app",
  messagingSenderId: "537577069849",
  appId: "1:537577069849:web:994097c1c8bb677d0ab988"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Ensure you have a favicon or logo in your /public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});