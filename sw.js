const CACHE_NAME = 'kana-practice-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

// Fetch (simple network-first with cache fallback)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then(resp => {
      // put copy in cache (for same-origin)
      if(event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)){
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resp.clone()));
      }
      return resp;
    }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
  );
});
