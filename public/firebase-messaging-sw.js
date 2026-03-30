importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyChkyg2JBvXkRkoFF5-aE_cY21EdZ-RNLM",
  authDomain: "calla-notifications.firebaseapp.com",
  projectId: "calla-notifications",
  storageBucket: "calla-notifications.firebasestorage.app",
  messagingSenderId: "537577069849",
  appId: "1:537577069849:web:994097c1c8bb677d0ab988"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message received:', payload);
  const title = payload.notification && payload.notification.title || 'Calla';
  const body  = payload.notification && payload.notification.body  || '';
  self.registration.showNotification(title, {
    body: body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'calla-notification'
  });
});
