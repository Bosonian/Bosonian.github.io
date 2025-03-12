// Service worker for GFAP Risk App
const CACHE_NAME = 'gfap-risk-app-v5.9';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate the new service worker immediately
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME) // Filter out the current cache
          .map(cacheName => caches.delete(cacheName)) // Delete old caches
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

// Fetch event - serve from cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if the response is valid and from the same origin
            const isSameOrigin = new URL(event.request.url).origin === self.location.origin;
            const isCacheable = response && response.status === 200 && isSameOrigin;

            // Cache the response if it's valid and from the same origin
            if (isCacheable) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }

            return response;
          })
          .catch(() => {
            // If both cache and network fail, return the offline fallback
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});
