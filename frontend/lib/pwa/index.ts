/**
 * Utilidades PWA avanzadas
 * Manejo de instalación, actualizaciones, sincronización offline
 */

export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Usar el tipo nativo de ServiceWorkerRegistration

/**
 * Verificar si la app está instalada
 */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verificar si está en modo standalone (instalada)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Verificar si está en modo standalone en iOS
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

/**
 * Verificar si el navegador soporta instalación
 */
export function canInstall(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Obtener el prompt de instalación
 */
export function getInstallPrompt(): PWAInstallPrompt | null {
  if (typeof window === 'undefined') return null;
  
  // Buscar el evento beforeinstallprompt
  const promptEvent = (window as any).deferredPrompt as PWAInstallPrompt | null;
  return promptEvent || null;
}

/**
 * Instalar la PWA
 */
export async function installPWA(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const prompt = getInstallPrompt();
  if (!prompt) {
    console.warn('Install prompt not available');
    return false;
  }
  
  try {
    await prompt.prompt();
    const choiceResult = await prompt.userChoice;
    
    // Limpiar el prompt
    (window as any).deferredPrompt = null;
    
    return choiceResult.outcome === 'accepted';
  } catch (error) {
    console.error('Error installing PWA:', error);
    return false;
  }
}

/**
 * Verificar si hay actualización disponible del Service Worker
 */
export async function checkForUpdate(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    await registration.update();
    return true;
  } catch (error) {
    console.error('Error checking for update:', error);
    return false;
  }
}

/**
 * Forzar actualización del Service Worker
 */
export async function forceUpdate(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    
    if (registration.waiting) {
      // Enviar mensaje al SW para que se active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recargar la página después de un momento
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      // Forzar actualización
      await registration.update();
    }
  } catch (error) {
    console.error('Error forcing update:', error);
  }
}

/**
 * Registrar Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });
    
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Sincronizar datos en background
 */
export async function syncInBackground(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Usar Background Sync API si está disponible
    if ('sync' in registration) {
      await (registration as any).sync.register('sync-data');
    } else {
      // Fallback: enviar mensaje al SW
      const sw = registration.active;
      if (sw) {
        sw.postMessage({ type: 'SYNC_NOW' });
      }
    }
  } catch (error) {
    console.error('Error syncing in background:', error);
  }
}

/**
 * Verificar estado de conexión
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Escuchar cambios de conexión
 */
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Retornar función para limpiar listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Escuchar mensajes del Service Worker
 */
export function onServiceWorkerMessage(
  callback: (event: MessageEvent) => void
): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }
  
  navigator.serviceWorker.addEventListener('message', callback);
  
  return () => {
    navigator.serviceWorker.removeEventListener('message', callback);
  };
}

/**
 * Cachear URLs específicas
 */
export async function cacheUrls(urls: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const sw = registration.active;
    
    if (sw) {
      sw.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
    }
  } catch (error) {
    console.error('Error caching URLs:', error);
  }
}

