'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Database, RefreshCw } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import GitHubSync from '@/components/GitHubSync';
import { SyncConfig } from '@/lib/sync/github';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Input({ label, placeholder, defaultValue, type = 'text', onChange }: { label: string; placeholder?: string; defaultValue?: string; type?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Cargar configuración de GitHub desde variables de entorno o localStorage
    const loadConfig = () => {
      const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || '';
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || '';
      // El token no debe estar en variables públicas, se debe ingresar manualmente
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('github_token') || '' : '';
      
      setGithubConfig({
        token: savedToken,
        owner,
        repo,
      });
      setConfigLoaded(true);
    };

    loadConfig();
  }, []);

  const handleSaveConfig = () => {
    if (githubConfig.token && typeof window !== 'undefined') {
      localStorage.setItem('github_token', githubConfig.token);
    }
    alert('Configuración guardada. Ahora puedes usar la sincronización.');
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
              defaultValue="Formador PWA"
            />
            <Input
              label="Descripción"
              placeholder="Aplicación de formación progresiva"
              defaultValue="Aplicación de formación progresiva"
            />
            <div className="flex justify-end">
              <Button onClick={() => alert('Función de guardar próximamente')}>
                <Save className="w-4 h-4" />
                Guardar cambios
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
              defaultValue={githubConfig.owner}
              onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value })}
            />
            <Input
              label="Repositorio"
              placeholder="formador-pwa"
              defaultValue={githubConfig.repo}
              onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
            />
            <Input
              label="Token de acceso"
              type="password"
              placeholder="ghp_..."
              defaultValue={githubConfig.token}
              onChange={(e) => setGithubConfig({ ...githubConfig, token: e.target.value })}
            />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Nota:</strong> El token se guarda localmente en tu navegador. Para mayor seguridad, 
                considera usar variables de entorno en producción.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveConfig}>
                <Save className="w-4 h-4" />
                Guardar configuración
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
    </div>
  );
}

