'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { isOnline, onConnectionChange, syncInBackground } from '@/lib/pwa';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setOnline(isOnline());

    const cleanup = onConnectionChange((isOnline) => {
      setOnline(isOnline);
      
      if (!isOnline) {
        setWasOffline(true);
      } else if (wasOffline) {
        // Cuando vuelve la conexión, sincronizar automáticamente
        syncInBackground();
        setWasOffline(false);
      }
    });

    return cleanup;
  }, [wasOffline]);

  if (online) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 z-50 flex items-center justify-center gap-2 animate-slide-down">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">
        Sin conexión - Modo offline activado
      </span>
    </div>
  );
}

