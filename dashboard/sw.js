// Service worker mínimo — solo necesario para que Android/Chrome
// muestre el prompt de instalación. Cachea el propio HTML del dashboard
// para que abra algo aunque no haya red al lanzar la app; los datos
// reales (extras, roles) siguen viniendo siempre en vivo de Make/Sheets.

const CACHE_NAME = 'sb-dashboard-v1';
const CACHED_URLS = ['./SB-dashboard-extras.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first: prioriza siempre la versión más reciente si hay red;
  // solo cae al cache si falla la petición (sin conexión).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
