'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Upload, Download, CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { syncWithGitHub, pushToGitHub, pullFromGitHub, SyncConfig, SyncResult } from '@/lib/sync/github';
import { db, SyncHistory } from '@/lib/db';

interface GitHubSyncProps {
  config: SyncConfig;
}

export default function GitHubSync({ config }: GitHubSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncHistory | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<('activities' | 'resources' | 'sessions' | 'responses' | 'tokens')[]>([
    'activities',
    'resources',
    'sessions',
    'tokens',
  ]);

  useEffect(() => {
    loadSyncHistory();
  }, []);

  const loadSyncHistory = async () => {
    try {
      const history = await db.syncHistory.orderBy('timestamp').reverse().limit(10).toArray();
      setSyncHistory(history);
      if (history.length > 0) {
        setLastSync(history[0]);
      }
    } catch (error) {
      console.error('Error cargando historial de sincronización:', error);
    }
  };

  const saveSyncHistory = async (result: SyncResult, type: 'push' | 'pull' | 'sync') => {
    try {
      const syncId = `sync-${Date.now()}`;
      const status: 'success' | 'error' | 'partial' = 
        result.success ? 'success' : 
        result.errors.length > 0 && (result.pushed > 0 || result.pulled > 0) ? 'partial' : 
        'error';

      const history: SyncHistory = {
        syncId,
        type,
        status,
        pushed: result.pushed,
        pulled: result.pulled,
        conflicts: result.conflicts,
        errors: result.errors,
        timestamp: Date.now(),
      };

      await db.syncHistory.add(history);
      await loadSyncHistory();
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  };

  const handleSync = async (type: 'push' | 'pull' | 'sync') => {
    if (!config.token || !config.owner || !config.repo) {
      alert('Por favor, configura las credenciales de GitHub primero.');
      return;
    }

    setSyncing(true);
    try {
      let result: SyncResult;

      switch (type) {
        case 'push':
          result = await pushToGitHub(config, selectedTypes);
          break;
        case 'pull':
          result = await pullFromGitHub(config, selectedTypes);
          break;
        case 'sync':
          result = await syncWithGitHub(config, selectedTypes);
          break;
      }

      await saveSyncHistory(result, type);

      if (result.success) {
        alert(`Sincronización exitosa!\nEnviados: ${result.pushed}\nRecibidos: ${result.pulled}`);
      } else {
        const errorMsg = result.errors.length > 0 
          ? `Errores:\n${result.errors.slice(0, 3).join('\n')}${result.errors.length > 3 ? '\n...' : ''}`
          : 'Error desconocido';
        alert(`Sincronización completada con errores:\n${errorMsg}\n\nEnviados: ${result.pushed}\nRecibidos: ${result.pulled}`);
      }
    } catch (error: any) {
      alert(`Error durante la sincronización: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const toggleType = (type: 'activities' | 'resources' | 'sessions' | 'responses' | 'tokens') => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getStatusIcon = (status: 'success' | 'error' | 'partial') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: 'success' | 'error' | 'partial') => {
    switch (status) {
      case 'success':
        return 'Exitoso';
      case 'error':
        return 'Error';
      case 'partial':
        return 'Parcial';
    }
  };

  const typeLabels = {
    activities: 'Actividades',
    resources: 'Recursos',
    sessions: 'Sesiones',
    responses: 'Respuestas',
    tokens: 'Tokens',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sincronización con GitHub
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Sincroniza tus datos entre el almacenamiento local y GitHub
        </p>
      </div>

      {/* Configuración */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Configuración de sincronización
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipos de datos a sincronizar
            </label>
            <div className="flex flex-wrap gap-2">
              {(['activities', 'resources', 'sessions', 'responses', 'tokens'] as const).map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedTypes.includes(type)
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm">{typeLabels[type]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Acciones de sincronización
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSync('sync')}
            disabled={syncing || selectedTypes.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sincronizar (Push + Pull)
          </button>
          <button
            onClick={() => handleSync('push')}
            disabled={syncing || selectedTypes.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Enviar a GitHub (Push)
          </button>
          <button
            onClick={() => handleSync('pull')}
            disabled={syncing || selectedTypes.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Descargar de GitHub (Pull)
          </button>
        </div>
      </div>

      {/* Última sincronización */}
      {lastSync && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Última sincronización
          </h3>
          <div className="flex items-center gap-3">
            {getStatusIcon(lastSync.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {getStatusLabel(lastSync.status)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(lastSync.timestamp).toLocaleString('es-ES')}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {lastSync.type === 'push' && `Enviados: ${lastSync.pushed}`}
                {lastSync.type === 'pull' && `Recibidos: ${lastSync.pulled}`}
                {lastSync.type === 'sync' && `Enviados: ${lastSync.pushed} | Recibidos: ${lastSync.pulled}`}
                {lastSync.conflicts > 0 && ` | Conflictos: ${lastSync.conflicts}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {syncHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Historial de sincronización
          </h3>
          <div className="space-y-2">
            {syncHistory.slice(0, 5).map((sync) => (
              <div
                key={sync.syncId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(sync.status)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {sync.type === 'push' && 'Enviado a GitHub'}
                      {sync.type === 'pull' && 'Descargado de GitHub'}
                      {sync.type === 'sync' && 'Sincronización completa'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(sync.timestamp).toLocaleString('es-ES')}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {sync.pushed > 0 && `${sync.pushed} enviados`}
                  {sync.pushed > 0 && sync.pulled > 0 && ' | '}
                  {sync.pulled > 0 && `${sync.pulled} recibidos`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

