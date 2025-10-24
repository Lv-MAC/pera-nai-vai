// Service Worker for Pera nai Vai PWA
// Version: 1.0.0 - Change this when you update the app
const CACHE_VERSION = 'pera-nai-vai-v1.0.0';
const CACHE_NAME = `${CACHE_VERSION}`;

// Files to cache immediately on install
const CORE_CACHE_FILES = [
  '/',
  '/index.html',
  '/tools.css',
  '/theme.js',
  '/category-filter.js',
  '/donate.js',
  '/components.css',
  '/bkash_donate_pera_nai_vai.jpg'
];

// Tool pages - cached on first visit
const TOOL_PAGES = [
  '/jpeg-compressor.html',
  '/tweet-to-image.html',
  '/qr-generator.html',
  '/email-extractor.html',
  '/invoice-generator.html',
  '/photo-resizer.html',
  '/bangla-converter.html',
  '/financial-calculators.html',
  '/bd-tax-calculator.html',
  '/mfs-helper.html',
  '/land-converter.html',
  '/color-palette.html'
];

// Tool JavaScript files
const TOOL_SCRIPTS = [
  '/jpeg-compressor.js',
  '/qr-generator.js',
  '/email-extractor.js',
  '/invoice-generator.js',
  '/photo-resizer.js',
  '/bangla-converter.js',
  '/financial-calculators.js',
  '/bd-tax-calculator.js',
  '/mfs-helper.js',
  '/land-converter.js',
  '/color-palette.js',
  '/ToolBase.js'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Core files cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching core files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Found in cache, return it
          console.log('[SW] Serving from cache:', request.url);

          // Update cache in background (stale-while-revalidate strategy)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // Network fetch failed, but we already have cached version
            });

          return cachedResponse;
        }

        // Not in cache, fetch from network
        console.log('[SW] Fetching from network:', request.url);
        return fetch(request)
          .then((networkResponse) => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Cache the fetched response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);

            // Return offline page if available
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }

            throw error;
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Placeholder for future background sync functionality
  console.log('[SW] Syncing data...');
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Pera nai Vai', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
