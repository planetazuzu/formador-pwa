'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { getInstallPrompt, installPWA, canInstall, isInstalled } from '@/lib/pwa';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalledApp, setIsInstalledApp] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    setIsInstalledApp(isInstalled());
    
    // Verificar si hay prompt disponible
    const checkPrompt = () => {
      if (isInstalled()) {
        setShowPrompt(false);
        return;
      }
      
      const prompt = getInstallPrompt();
      if (prompt) {
        setShowPrompt(true);
      }
    };

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      if (!isInstalled()) {
        setShowPrompt(true);
      }
    };

    // Escuchar evento personalizado
    const handleInstallAvailable = () => {
      if (!isInstalled()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    
    // Verificar al cargar
    checkPrompt();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowPrompt(false);
      setIsInstalledApp(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage para no mostrar de nuevo por un tiempo
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalada o no puede instalarse
  if (isInstalledApp || !canInstall() || !showPrompt) {
    return null;
  }

  // Verificar si se descartó recientemente (24 horas)
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
    if (hoursSinceDismissed < 24) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Instalar Formador PWA
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Instala la aplicación para acceso rápido y funcionamiento offline.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Instalar
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

