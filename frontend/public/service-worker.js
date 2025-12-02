// Service Worker Avanzado para PWA
const CACHE_VERSION = 'v4';
const CACHE_NAME = `formador-pwa-${CACHE_VERSION}`;
const STATIC_CACHE = `formador-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `formador-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `formador-images-${CACHE_VERSION}`;

// URLs críticas para cachear en instalación
const CRITICAL_URLS = [
  '/',
  '/manifest.json',
  '/admin/dashboard',
  '/admin/activities',
  '/admin/resources',
  '/admin/responses',
  '/admin/sessions',
  '/admin/links',
  '/admin/settings',
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para recursos estáticos que raramente cambian
  CACHE_FIRST: 'cache-first',
  // Network First: Para datos dinámicos que deben estar actualizados
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Para recursos que pueden estar un poco desactualizados
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network Only: Para operaciones que siempre necesitan red
  NETWORK_ONLY: 'network-only',
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cachear recursos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_URLS.map(url => new Request(url, { cache: 'reload' })));
      }),
      // Tomar control inmediatamente
      self.skipWaiting(),
    ])
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas
      clients.claim(),
    ])
  );
});

// Determinar estrategia de cache según el tipo de recurso
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Archivos estáticos de Next.js (JS, CSS)
  if (url.pathname.includes('/_next/static/')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // Imágenes
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // Fuentes
  if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/i)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // API routes y Server Actions
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/actions/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Páginas HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Por defecto: Network First
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Cache First: Buscar en cache primero, luego red
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    throw error;
  }
}

// Network First: Intentar red primero, luego cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate: Devolver cache inmediatamente y actualizar en background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Actualizar en background
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Si falla la red, mantener cache
  });
  
  // Devolver cache inmediatamente si existe
  return cached || fetchPromise;
}

// Manejar peticiones fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests que no son GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requests a otros dominios (CORS)
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Ignorar requests de desarrollo de Next.js que no deben cachearse
  if (
    url.pathname.includes('/_next/') &&
    !url.pathname.includes('/_next/static/')
  ) {
    return;
  }
  
  const strategy = getCacheStrategy(request);
  let cacheName = DYNAMIC_CACHE;
  
  // Determinar cache según tipo de recurso
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    cacheName = IMAGE_CACHE;
  } else if (url.pathname.includes('/_next/static/')) {
    cacheName = STATIC_CACHE;
  }
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case CACHE_STRATEGIES.CACHE_FIRST:
            return await cacheFirst(request, cacheName);
          
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return await networkFirst(request, cacheName);
          
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return await staleWhileRevalidate(request, cacheName);
          
          default:
            return await fetch(request);
        }
      } catch (error) {
        console.error('[SW] Fetch failed:', error);
        
        // Fallback: Intentar devolver página offline
        if (request.headers.get('accept')?.includes('text/html')) {
          const offlinePage = await caches.match('/');
          if (offlinePage) {
            return offlinePage;
          }
        }
        
        // Fallback genérico
        return new Response('Offline - No se pudo cargar el recurso', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        });
      }
    })()
  );
});

// Background Sync: Sincronizar cuando vuelva conexión
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Función para sincronizar datos
async function syncData() {
  try {
    // Notificar a todas las páginas abiertas que se está sincronizando
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_START',
        message: 'Sincronizando datos...',
      });
    });
    
    // Aquí se podría implementar la lógica de sincronización
    // Por ejemplo, sincronizar respuestas pendientes con GitHub
    
    // Notificar que la sincronización terminó
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Datos sincronizados correctamente',
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_ERROR',
        message: 'Error al sincronizar datos',
      });
    });
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    syncData();
  }
});

// Push notifications (preparado para futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'formador-notification',
    requireInteraction: false,
  };
  
  event.waitUntil(
    self.registration.showNotification('Formador PWA', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
