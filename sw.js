// Penrov service worker: shows the reading-time notification and opens the app when it is tapped.
// Everything is relative to the folder this file is served from, so it works at any web address.
const ICON = new URL('icons/icon-192.png', self.registration.scope).href;

self.addEventListener('push', (event) => {
  let data = { title: 'PENROV', body: "It's reading time!" };
  try { data = event.data.json(); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: ICON,
      badge: ICON,
      tag: 'penrov-reading-time',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(self.registration.scope);
    })
  );
});
