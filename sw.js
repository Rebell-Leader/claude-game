// Awawa Quest service worker — cache-first so the game runs fully offline.
// Bump CACHE_VERSION on every release to invalidate old assets.
const CACHE_VERSION = 'awawa-quest-v1.0.1';
const CORE_ASSETS = [
  '.',
  'index.html',
  'css/style.css',
  'js/data.js',
  'js/sprites.js',
  'js/audio.js',
  'js/game.js',
  'js/battle.js',
  'js/ui.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp.ok && new URL(event.request.url).origin === self.location.origin) {
          const clone = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return resp;
      });
    })
  );
});
