'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { onServiceWorkerMessage, forceUpdate } from '@/lib/pwa';

export default function UpdateAvailable() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Escuchar mensajes del Service Worker
    const cleanup = onServiceWorkerMessage((event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        setShowUpdate(true);
      }
    });

    // Escuchar evento personalizado de actualización
    const handleSWUpdated = () => {
      setShowUpdate(true);
    };

    window.addEventListener('sw-updated', handleSWUpdated);

    // Verificar si hay un Service Worker esperando
    const checkWaitingSW = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          setShowUpdate(true);
        }
      }
    };

    checkWaitingSW();

    return () => {
      cleanup();
      window.removeEventListener('sw-updated', handleSWUpdated);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await forceUpdate();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Guardar en sessionStorage para no mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // No mostrar si se descartó en esta sesión
  if (sessionStorage.getItem('pwa-update-dismissed') === 'true') {
    return null;
  }

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-down">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Actualización Disponible
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Hay una nueva versión disponible. Actualiza para obtener las últimas mejoras.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Ahora'
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

