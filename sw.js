// 1. Identificador de la versión (v1.0 para el despegue)
const CACHE_NAME = 'Gamer-Hub-v1.0';

// 2. Archivos Vitales (Usando logo-icono.png como pediste)
const INITIAL_ASSETS = [
  './',
  './index.html',
  './logo-icono.png' 
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🎮 [GamerHub]: Núcleo del sistema instalado.');
      return cache.addAll(INITIAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// --- FASE DE ACTIVACIÓN ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🎮 [GamerHub]: Limpiando caché antiguo:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('🎮 [GamerHub]: Sistema en línea y listo para jugar.');
      return self.clients.claim();
    })
  );
});

// --- ESTRATEGIA DE RED: NETWORK FIRST CON AUTO-RECUPERACIÓN ---
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
