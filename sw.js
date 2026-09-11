// Minimal service worker — makes the app installable as a PWA.
// Caches the app shell (HTML/CSS/JS/icons) for fast repeat loads; API calls
// always go to the network so prices/lots/etc. stay live, never stale.
const CACHE_NAME = 'ecoscrap-shell-v1';
const SHELL_FILES = [
  '/', '/index.html', '/css/style.css',
  '/js/api.js', '/js/i18n.js', '/js/app.js',
  '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls — data must always be live.
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
