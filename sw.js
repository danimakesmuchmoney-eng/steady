// Steady service worker: makes the app open instantly and work offline.
const CACHE = 'steady-v3';
const ASSETS = [
  './', 'index.html', 'native.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png',
  'plus-jakarta-sans-latin-400-normal.woff2', 'plus-jakarta-sans-latin-500-normal.woff2',
  'plus-jakarta-sans-latin-600-normal.woff2', 'plus-jakarta-sans-latin-700-normal.woff2',
  'plus-jakarta-sans-latin-800-normal.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Pages: network first so updates arrive, cache as fallback offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // Everything else: cache first.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
