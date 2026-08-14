const CACHE_NAME = 'pulse-music-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './README.md',
  './src/css/reset.css',
  './src/css/variables.css',
  './src/css/layout.css',
  './src/css/components.css',
  './src/css/pages.css',
  './src/css/player.css',
  './src/css/advanced.css',
  './src/css/responsive.css',
  './src/data/songs.json',
  './src/js/main.js',
  './src/js/data.js',
  './src/js/storage.js',
  './src/js/components/cards.js',
  './src/js/components/song-item.js',
  './src/js/components/skeleton.js',
  './src/js/pages/home.js',
  './src/js/pages/search.js',
  './src/js/pages/library.js',
  './src/js/pages/about.js',
  './src/js/pages/favorites.js',
  './src/js/pages/recently-played.js',
  './src/js/pages/continue-listening.js',
  './src/js/pages/playlists.js',
  './src/js/pages/history.js',
  './src/js/pages/not-found.js',
  './assets/images/cover-01.svg',
  './assets/images/cover-02.svg',
  './assets/images/cover-03.svg',
  './assets/images/cover-04.svg',
  './assets/images/cover-05.svg',
  './assets/images/cover-06.svg',
  './assets/images/cover-07.svg',
  './assets/images/cover-08.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Cache-first strategy for static assets
  if (request.url.includes('/src/') || request.url.includes('/assets/') || request.url.includes('.svg')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => {
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Network-first strategy for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Handle messages for skipWaiting
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});