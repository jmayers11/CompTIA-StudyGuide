// Service worker for CyberSec Notes — enables full offline use after the first online load.
//
// IMPORTANT MAINTENANCE NOTE: bump CACHE_VERSION every time index.html changes and is
// re-deployed. This forces the service worker to fetch and cache the new version instead
// of silently continuing to serve a stale cached copy. Without bumping this, offline users
// would keep seeing old content indefinitely even after re-uploading a newer index.html.
const CACHE_VERSION = 'v2';
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
      .then((cache) => cache.addAll(URLS_TO_CACHE))
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

// Cache-first with background network update ("stale-while-revalidate"):
// serves instantly from cache (works offline), while quietly refreshing the
// cache in the background whenever a connection is available.
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if(networkResponse && networkResponse.status === 200){
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse); // offline: fall back to cache if the network fetch fails

      return cachedResponse || networkFetch;
    })
  );
});
