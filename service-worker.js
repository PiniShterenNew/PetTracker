
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(() => new Response("Offline fallback")));
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-pets') {
    event.waitUntil(
      fetch('/sync', { method: 'POST', body: JSON.stringify({ data: 'pet data' }) })
        .then(() => console.log('Background sync success'))
        .catch(err => console.error('Background sync failed', err))
    );
  }
});
