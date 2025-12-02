'use client';

import { useEffect } from 'react';
import InstallPrompt from './InstallPrompt';
import UpdateAvailable from './UpdateAvailable';
import OfflineIndicator from './OfflineIndicator';
import SyncStatus from './SyncStatus';
import { registerServiceWorker } from '@/lib/pwa';

export default function PWAProvider() {
  useEffect(() => {
    // Registrar Service Worker mejorado
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker().then((registration) => {
        if (registration) {
          console.log('[PWA] Service Worker registered successfully');
          
          // Escuchar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Hay una nueva versión disponible
                  window.dispatchEvent(new CustomEvent('sw-updated'));
                }
              });
            }
          });
          
          // Verificar si hay un worker esperando
          if (registration.waiting) {
            window.dispatchEvent(new CustomEvent('sw-updated'));
          }
        }
      });
    }
  }, []);

  return (
    <>
      <InstallPrompt />
      <UpdateAvailable />
      <OfflineIndicator />
      <SyncStatus />
    </>
  );
}

