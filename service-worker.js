const CACHE_NAME = 'flyer-clinico-prompt-builder-v7';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './docs/manual-usuario.html',
  './docs/MANUAL_USUARIO.md',
  './assets/css/styles.css',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/icons/icon.svg',
  './src/app.js',
  './src/data/defaultClinic.js',
  './src/data/designPresets.js',
  './src/data/specialties.js',
  './src/prompt/promptBuilder.js',
  './src/pwa.js',
  './src/state/defaultState.js',
  './src/state/legacyAdapter.js',
  './src/state/migrations.js',
  './src/state/schema.js',
  './src/state/storage.js',
  './src/ui/formRenderer.js',
  './src/ui/previewRenderer.js',
  './src/ui/validation.js'
];

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && new URL(request.url).origin === self.location.origin) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl = './index.html') {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok && new URL(request.url).origin === self.location.origin) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(fallbackUrl);
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isPage = event.request.mode === 'navigate' || event.request.destination === 'document';
  const isCodeOrStyle = ['script', 'style', 'worker'].includes(event.request.destination);

  if (isPage || isCodeOrStyle) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
