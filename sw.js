// Service Worker for Stroke Triage Assistant PWA - FORCED UPDATE
const VERSION = "2.3.0-" + Date.now(); // Force cache busting with new version

console.log("[SW] Loading new service worker version:", VERSION);

// Immediately skip waiting and take control
self.addEventListener("install", (event) => {
  console.log("[SW] Force installing new service worker:", VERSION);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Force activating and clearing all caches");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        // Delete ALL old caches
        ...cacheNames.map((cacheName) => {
          console.log("[SW] Deleting cache:", cacheName);
          return caches.delete(cacheName);
        }),
        // Take control immediately
        self.clients.claim()
      ]);
    })
  );
});

// Completely disable fetch intercepting - let browser handle everything
self.addEventListener("fetch", (event) => {
  // Do nothing - let browser handle all requests normally
  return;
});

console.log("[SW] Service worker loaded - fetch interception disabled");