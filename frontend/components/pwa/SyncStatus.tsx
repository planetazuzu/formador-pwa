'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { onServiceWorkerMessage, syncInBackground } from '@/lib/pwa';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export default function SyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cleanup = onServiceWorkerMessage((event) => {
      if (event.data) {
        switch (event.data.type) {
          case 'SYNC_START':
            setStatus('syncing');
            setMessage(event.data.message || 'Sincronizando...');
            break;
          case 'SYNC_COMPLETE':
            setStatus('success');
            setMessage(event.data.message || 'Sincronización completada');
            setTimeout(() => {
              setStatus('idle');
              setMessage('');
            }, 3000);
            break;
          case 'SYNC_ERROR':
            setStatus('error');
            setMessage(event.data.message || 'Error al sincronizar');
            setTimeout(() => {
              setStatus('idle');
              setMessage('');
            }, 5000);
            break;
        }
      }
    });

    return cleanup;
  }, []);

  const handleSync = () => {
    syncInBackground();
  };

  if (status === 'idle' && !message) {
    return null;
  }

  const statusConfig: Record<Exclude<SyncStatus, 'idle'>, {
    icon: typeof RefreshCw;
    className: string;
    bgClassName: string;
  }> = {
    syncing: {
      icon: RefreshCw,
      className: 'text-blue-600 dark:text-blue-400',
      bgClassName: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
    success: {
      icon: CheckCircle2,
      className: 'text-green-600 dark:text-green-400',
      bgClassName: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    },
    error: {
      icon: AlertCircle,
      className: 'text-red-600 dark:text-red-400',
      bgClassName: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
  };

  const config = statusConfig[status as Exclude<SyncStatus, 'idle'>];
  const Icon = config.icon;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${config.bgClassName} border rounded-xl shadow-lg p-3 flex items-center gap-2 min-w-[200px] animate-slide-up`}>
      <Icon className={`w-4 h-4 ${config.className} ${status === 'syncing' ? 'animate-spin' : ''}`} />
      <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">
        {message}
      </span>
      {status === 'error' && (
        <button
          onClick={handleSync}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

