// Service Worker name and cache version
const CACHE_NAME = 'kana-master-v1';

// List of files to cache
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  // You would need to create these placeholder icon files in an 'images' folder
  'images/icon-192.png', 
  'images/icon-512.png'
];

// Installation: Caches all essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and added all files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activates the new service worker immediately
  );
});

// Activation: Cleans up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensures the service worker takes control of the page immediately
  return self.clients.claim();
});

// Fetch: Serves content from cache first, then network (Cache-First strategy)
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If resource is in cache, return it
        if (response) {
          return response;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then(res => {
            // Optional: Cache new requests on the fly if they are not external tracking or logging
            if (!res || res.status !== 200 || res.type !== 'basic') {
              return res;
            }

            const responseToCache = res.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return res;
          })
          .catch(error => {
            console.error('Fetch failed for:', event.request.url, error);
            // Fallback for network failures (you can serve an offline page here)
            // For a simple app like this, it might just fail, which is acceptable.
          });
      })
  );
});