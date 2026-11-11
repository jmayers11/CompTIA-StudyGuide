// Service worker for CyberSec Notes — enables full offline use after the first online load.
//
// MAINTENANCE NOTE: index.html is fetched network-first (see the fetch handler below), so page
// updates appear on the next load without any change here. Bump CACHE_VERSION only when sw.js
// itself or the list of cached library URLs changes, so old caches are cleared.
const CACHE_VERSION = 'v35';
const CACHE_NAME = `cybersec-notes-${CACHE_VERSION}`;

// Everything needed for the app to run fully offline: the app shell itself plus the
// two CDN libraries used only by the PDF-import feature.
const URLS_TO_CACHE = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache:'reload' bypasses the browser's HTTP cache, so a new service worker never
      // pre-caches a stale copy of index.html left over from the previous deploy.
      .then((cache) => cache.addAll(URLS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// The app page itself is fetched network-first, so an updated index.html shows up on the
// very next load instead of one load later; the cached copy is used only when offline.
// Everything else (the CDN libraries) stays cache-first with a background refresh.
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isAppPage = event.request.mode === 'navigate' ||
    (url.origin === self.location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')));

  if(isAppPage){
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then((networkResponse) => {
        if(networkResponse && networkResponse.status === 200){
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if(networkResponse && networkResponse.status === 200){
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
