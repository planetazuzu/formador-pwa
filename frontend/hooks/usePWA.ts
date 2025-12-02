'use client';

import { useState, useEffect } from 'react';
import {
  registerServiceWorker,
  onServiceWorkerMessage,
  checkForUpdate,
  isInstalled,
  canInstall,
  getInstallPrompt,
  installPWA,
  isOnline,
  onConnectionChange,
} from '@/lib/pwa';

export interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  swRegistered: boolean;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: true,
    hasUpdate: false,
    swRegistered: false,
  });

  useEffect(() => {
    // Inicializar estado
    setState({
      isInstalled: isInstalled(),
      canInstall: canInstall(),
      isOnline: isOnline(),
      hasUpdate: false,
      swRegistered: false,
    });

    // Registrar Service Worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        setState((prev) => ({ ...prev, swRegistered: true }));

        // Verificar si hay actualización disponible
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState((prev) => ({ ...prev, hasUpdate: true }));
              }
            });
          }
        });

        // Verificar si hay un worker esperando
        if (registration.waiting) {
          setState((prev) => ({ ...prev, hasUpdate: true }));
        }
      }
    });

    // Escuchar cambios de conexión
    const cleanupConnection = onConnectionChange((online) => {
      setState((prev) => ({ ...prev, isOnline: online }));
    });

    // Escuchar mensajes del Service Worker
    const cleanupSW = onServiceWorkerMessage((event) => {
      if (event.data?.type === 'SW_UPDATED') {
        setState((prev) => ({ ...prev, hasUpdate: true }));
      }
    });

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setState((prev) => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar actualizaciones periódicamente
    const updateInterval = setInterval(() => {
      checkForUpdate();
    }, 60000); // Cada minuto

    return () => {
      cleanupConnection();
      cleanupSW();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(updateInterval);
    };
  }, []);

  const install = async () => {
    const installed = await installPWA();
    if (installed) {
      setState((prev) => ({ ...prev, isInstalled: true, canInstall: false }));
    }
    return installed;
  };

  return {
    ...state,
    install,
  };
}

