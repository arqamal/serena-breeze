// Service worker del dashboard de materiales.
// Solo guarda los archivos propios de la app (HTML, manifest, iconos) para
// que abra aunque no haya red. Los datos NUNCA se guardan aquí: las llamadas
// al Worker de Cloudflare y las librerías externas pasan directas a la red.
// Estrategia para los archivos propios: red primero y, si falla, la copia
// guardada — así una versión nueva subida a GitHub se ve en la siguiente
// apertura, sin tener que borrar nada en el móvil.

const CACHE = 'sb-materiales-v1';
const ARCHIVOS = ['./SB-dashboard-materiales.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
