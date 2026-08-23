// Service Worker - Cache First for App Shell, Network First for API
// Version 5 - updated for 17-person khatmah

const CACHE_NAME    = 'sad2a-khatmah-v6';
const APP_SHELL     = [
  './',
  './index.html',
  './css/main.css',
  './css/quran.css',
  './css/components.css',
  './js/app.js',
  './js/quran-data.js',
  './js/khatmah-manager.js',
  './js/dua-data.js',
  './js/firebase-config.js',
  './js/pwa-installer.js',
  './manifest.json',
  // Photos
  './assets/pic alaa/5789776860777485901_119.jpg',
  './assets/pic alaa/5789776860777485902_119.jpg',
  './assets/pic alaa/5789776860777485903_119.jpg',
  './assets/pic alaa/5789776860777485900_120.jpg',
  './assets/pic alaa/5789776860777485899_120.jpg',
  './assets/pic alaa/5785424920740302709_121.jpg'
];

// API origins that should go Network-First
const API_ORIGINS = ['api.alquran.cloud', 'firebaseio.com', 'googleapis.com'];

// ── Install: cache app shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: strategy router ────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle http/https GET requests — skip chrome-extension, data, blob, etc.
  if (request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // API calls → Network First, cache on success
  if (API_ORIGINS.some(origin => url.hostname.includes(origin))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // App shell → Cache First, fallback to network
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.status < 400) {
      const url = new URL(request.url);
      // Only cache http/https responses
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    return caches.match('./index.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok && response.status < 400) {
      const url = new URL(request.url);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    return caches.match(request);
  }
}
