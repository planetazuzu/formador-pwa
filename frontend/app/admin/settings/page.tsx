'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Database, RefreshCw, Download, Upload, Trash2, AlertTriangle, X } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import GitHubSync from '@/components/GitHubSync';
import { SyncConfig } from '@/lib/sync/github';
import { getConfig, saveConfig, saveGitHubConfig, exportConfig, importConfig, resetConfig } from '@/lib/config';
import { downloadBackup, restoreFromFile } from '@/lib/backup';
import ValidationErrors from '@/components/ui/ValidationErrors';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Input({ label, placeholder, value, defaultValue, type = 'text', onChange }: { label: string; placeholder?: string; value?: string; defaultValue?: string; type?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function Textarea({ label, placeholder, value, defaultValue, onChange, rows = 3 }: { label: string; placeholder?: string; value?: string; defaultValue?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        rows={rows}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
    </div>
  );
}

function Button({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <button className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2 text-base gap-2 ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function AdminSettings() {
  const [githubConfig, setGithubConfig] = useState<SyncConfig>({
    token: '',
    owner: '',
    repo: '',
  });
  const [appConfig, setAppConfig] = useState({
    appName: 'Formador PWA',
    appDescription: 'Aplicación de formación progresiva',
  });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreData, setRestoreData] = useState('');
  const [restoreOptions, setRestoreOptions] = useState({ clearExisting: false, merge: true });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await getConfig();
      if (config) {
        setAppConfig({
          appName: config.appName || 'Formador PWA',
          appDescription: config.appDescription || 'Aplicación de formación progresiva',
        });
        if (config.github) {
          setGithubConfig({
            token: config.github.token || '',
            owner: config.github.owner || process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
            repo: config.github.repo || process.env.NEXT_PUBLIC_GITHUB_REPO || '',
          });
        } else {
          // Cargar desde variables de entorno o localStorage
          const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || '';
          const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || '';
          const savedToken = typeof window !== 'undefined' ? localStorage.getItem('github_token') || '' : '';
          setGithubConfig({ token: savedToken, owner, repo });
        }
      } else {
        // Valores por defecto
        const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || '';
        const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || '';
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('github_token') || '' : '';
        setGithubConfig({ token: savedToken, owner, repo });
      }
      setConfigLoaded(true);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setConfigLoaded(true);
    }
  };

  const handleSaveGeneralConfig = async () => {
    setSaving(true);
    try {
      await saveConfig({
        appName: appConfig.appName,
        appDescription: appConfig.appDescription,
      });
      alert('Configuración general guardada correctamente.');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGitHubConfig = async () => {
    setSaving(true);
    try {
      await saveGitHubConfig({
        owner: githubConfig.owner,
        repo: githubConfig.repo,
        token: githubConfig.token,
      });
      alert('Configuración de GitHub guardada correctamente.');
    } catch (error) {
      console.error('Error guardando configuración GitHub:', error);
      alert('Error al guardar la configuración de GitHub.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportConfig = async () => {
    try {
      const json = await exportConfig();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `formador-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar configuración.');
    }
  };

  const handleImportConfig = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importConfig(text);
        await loadConfig();
        alert('Configuración importada correctamente.');
      } catch (error) {
        alert('Error al importar configuración. Verifica que el archivo sea válido.');
      }
    };
    input.click();
  };

  const handleDownloadBackup = async () => {
    setLoadingBackup(true);
    try {
      await downloadBackup();
    } catch (error) {
      alert('Error al crear backup.');
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreData.trim()) {
      alert('Por favor, pega el contenido del backup JSON.');
      return;
    }

    if (!confirm(`¿Estás seguro de restaurar el backup? ${restoreOptions.clearExisting ? 'Se eliminarán todos los datos existentes.' : 'Se fusionarán con los datos existentes.'}`)) {
      return;
    }

    setLoadingBackup(true);
    try {
      const result = await restoreFromFile(restoreData, restoreOptions);
      alert(`Backup restaurado: ${result.imported} elementos importados${result.errors > 0 ? `, ${result.errors} errores` : ''}`);
      setShowRestoreModal(false);
      setRestoreData('');
      // Recargar página para ver cambios
      window.location.reload();
    } catch (error: any) {
      alert(`Error al restaurar backup: ${error.message}`);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleResetConfig = async () => {
    if (!confirm('¿Estás seguro de resetear la configuración a valores por defecto?')) {
      return;
    }

    try {
      await resetConfig();
      await loadConfig();
      alert('Configuración reseteada correctamente.');
    } catch (error) {
      alert('Error al resetear configuración.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <BackButton href="/admin/dashboard" className="mb-4" />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Configuración
        </h1>
        <p className="mt-1.5 text-gray-600 dark:text-gray-400">
          Gestiona la configuración de tu plataforma
        </p>
      </div>

      {/* General */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            General
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configuración general de la aplicación
          </p>
        </div>
        <Card>
          <div className="space-y-6">
            <Input
              label="Nombre de la plataforma"
              placeholder="Formador PWA"
              value={appConfig.appName}
              onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
            />
            <Textarea
              label="Descripción"
              placeholder="Aplicación de formación progresiva"
              value={appConfig.appDescription}
              onChange={(e) => setAppConfig({ ...appConfig, appDescription: e.target.value })}
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveGeneralConfig} disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* GitHub */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Integración GitHub
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configuración del backend autoalojado
          </p>
        </div>
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Repositorio GitHub
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configura la conexión con tu repositorio
                </p>
              </div>
            </div>
            <Input
              label="Owner"
              placeholder="tu-usuario"
              value={githubConfig.owner}
              onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value })}
            />
            <Input
              label="Repositorio"
              placeholder="formador-pwa"
              value={githubConfig.repo}
              onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
            />
            <Input
              label="Token de acceso"
              type="password"
              placeholder="ghp_..."
              value={githubConfig.token}
              onChange={(e) => setGithubConfig({ ...githubConfig, token: e.target.value })}
            />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Nota:</strong> El token se guarda localmente en tu navegador. Para mayor seguridad, 
                considera usar variables de entorno en producción.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveGitHubConfig} disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Sincronización GitHub */}
      {configLoaded && githubConfig.token && githubConfig.owner && githubConfig.repo && (
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Sincronización con GitHub
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sincroniza tus datos entre el almacenamiento local y GitHub
            </p>
          </div>
          <GitHubSync config={githubConfig} />
        </div>
      )}

      {/* Backup y Restore */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Backup y Restore
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Exporta e importa todos tus datos
          </p>
        </div>
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadBackup} disabled={loadingBackup}>
                <Download className="w-4 h-4" />
                {loadingBackup ? 'Creando...' : 'Descargar Backup'}
              </Button>
              <Button
                onClick={() => setShowRestoreModal(true)}
                disabled={loadingBackup}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Restaurar Backup
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El backup incluye todas las actividades, recursos, sesiones, respuestas, tokens y configuración.
            </p>
          </div>
        </Card>
      </div>

      {/* Exportar/Importar Configuración */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Exportar/Importar Configuración
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Exporta o importa solo la configuración de la aplicación
          </p>
        </div>
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportConfig}>
                <Download className="w-4 h-4" />
                Exportar Configuración
              </Button>
              <Button onClick={handleImportConfig} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                Importar Configuración
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Resetear Configuración */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Configuración Avanzada
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Opciones avanzadas de configuración
          </p>
        </div>
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Resetear Configuración
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restaura la configuración a valores por defecto
                </p>
              </div>
              <Button
                onClick={handleResetConfig}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Resetear
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Apariencia */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Apariencia
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personaliza la apariencia de la plataforma
          </p>
        </div>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Modo oscuro
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cambia entre tema claro y oscuro usando el toggle en el sidebar
              </p>
            </div>
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Modal de Restore */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Restaurar Backup
              </h2>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Advertencia
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Restaurar un backup reemplazará los datos existentes. Asegúrate de tener un backup reciente antes de continuar.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido del Backup (JSON)
                </label>
                <textarea
                  value={restoreData}
                  onChange={(e) => setRestoreData(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
                  placeholder="Pega aquí el contenido del archivo JSON del backup..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opciones de Restauración
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={restoreOptions.clearExisting}
                      onChange={(e) => setRestoreOptions({ ...restoreOptions, clearExisting: e.target.checked, merge: !e.target.checked })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Eliminar datos existentes antes de restaurar
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={restoreOptions.merge}
                      onChange={(e) => setRestoreOptions({ ...restoreOptions, merge: e.target.checked, clearExisting: !e.target.checked })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Fusionar con datos existentes (reemplaza duplicados)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRestoreBackup}
                  disabled={loadingBackup || !restoreData.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingBackup ? 'Restaurando...' : 'Restaurar Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

