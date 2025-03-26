const CACHE_NAME = 'pettracker-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache the app shell
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache first, fall back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Add to cache for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            return new Response(
              `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - PetTracker</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #333;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    text-align: center;
                  }
                  h1 {
                    color: #4CAF50;
                  }
                  .card {
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <h1>You're Offline</h1>
                <div class="card">
                  <p>PetTracker needs an internet connection for this action.</p>
                  <p>Please check your connection and try again.</p>
                </div>
              </body>
              </html>
              `,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
      })
  );
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'sync-pets') {
    event.waitUntil(
      // Try to sync data
      fetch('/sync', { 
        method: 'POST', 
        body: JSON.stringify({ data: 'pet data', timestamp: new Date().toISOString() }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Sync failed');
        }
        return response.json();
      })
      .then(data => {
        console.log('Background sync successful:', data);
        
        // Notify the user
        self.registration.showNotification('PetTracker Sync', {
          body: 'Your pet data has been successfully synced',
          icon: 'icon-192.png',
          badge: 'icon-192.png'
        });
      })
      .catch(err => {
        console.error('Background sync failed:', err);
        // Will automatically retry on next network connection
        throw err;
      })
    );
  }
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  let title = 'PetTracker Update';
  let options = {
    body: 'New information about your pet is available',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {action: 'explore', title: 'View Details'},
      {action: 'close', title: 'Close'}
    ]
  };
  
  // Use notification data if provided
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    options = {...options, ...data};
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click', event.notification.data);
  
  event.notification.close();
  
  // Handle notification click
  if (event.action === 'explore') {
    // Open a specific URL when clicking "View Details"
    event.waitUntil(
      clients.openWindow('/pet-details.html')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({type: 'window'})
        .then(clientList => {
          // If a window is already open, focus it
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          // Otherwise open a new window
          return clients.openWindow('/');
        })
    );
  }
});