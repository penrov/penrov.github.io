// Penrov service worker: shows the reading-time notification and opens the app when it is tapped.
// Everything is relative to the folder this file is served from, so it works at any web address.
const ICON = new URL('icons/icon-192.png', self.registration.scope).href;

// Public values (safe to include): the same address and public key the app itself uses.
const SB_URL = 'https://qvitgveyyuomqfccehth.supabase.co';
const SB_KEY = 'sb_publishable_Ue53QNrMveynqKG07ChoKQ_mSb-ctI9';

// Asks the database for a friendlier message that names the child. Any problem = use the plain message.
async function friendlyText() {
  try {
    const sub = await self.registration.pushManager.getSubscription();
    if (!sub) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(SB_URL + '/rest/v1/rpc/reminder_text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
      body: JSON.stringify({ endpoint_input: sub.endpoint }),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const j = await res.json();
    return j && j.body ? j : null;
  } catch (e) {
    return null;
  }
}

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let data = { title: 'PENROV', body: "It's reading time!" };
    try { data = event.data.json(); }
    catch (e) {
      const t = await friendlyText();
      if (t) data = t;
    }
    await self.registration.showNotification(data.title || 'PENROV', {
      body: data.body,
      icon: ICON,
      badge: ICON,
      tag: 'penrov-reading-time',
      renotify: true,
      silent: false,
      vibrate: [250, 120, 250, 120, 250]
    });
  })());
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

// Lets browsers treat PENROV as an installable app. It does not change how pages load.
self.addEventListener('fetch', () => {});
