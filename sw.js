const CACHE_NAME = "gfap-cache-v29"; // Increment version
const OFFLINE_URL = '/offline.html';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html', // Ensure offline page is cached
  '/manifest.json',
  '/icon.png',
  '/styles.css',
  '/app.js'
];

// Install Event - Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

// Activate Event - Delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of clients
  );
});

// Fetch Event - Different strategies for different requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // Skip non-GET requests

  const url = new URL(event.request.url);

  if (urlsToCache.includes(url.pathname)) {
    // Cache-first strategy for core files
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((networkResponse) => {
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, networkResponse.clone()));
            return networkResponse;
          });
        })
        .catch(() => caches.match(OFFLINE_URL)) // Fallback to offline page
    );
  } else {
    // Network-first strategy for dynamic content
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match(OFFLINE_URL);
        }))
    );
  }
});
