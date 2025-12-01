// Service Worker básico para PWA
const CACHE_NAME = 'formador-pwa-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Instalación
self.addEventListener('install', (event) => {
  // Forzar actualización inmediata
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activación
self.addEventListener('activate', (event) => {
  // Tomar control inmediatamente
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim()
    ])
  );
});

// Fetch - Network First para desarrollo
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // No cachear archivos de desarrollo de Next.js
  if (url.pathname.includes('/_next/') || 
      url.pathname.includes('webpack') || 
      url.pathname.includes('layout.css') ||
      url.pathname.includes('page.js') ||
      url.pathname.includes('layout.js') ||
      url.pathname.includes('app-pages-internals.js') ||
      url.pathname.includes('main-app.js')) {
    // Network first para archivos de desarrollo
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Para otros recursos, usar cache como fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

