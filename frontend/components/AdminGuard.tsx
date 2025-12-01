'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Lock } from 'lucide-react';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <button className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2 text-base ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = auth.isAdmin();
      setIsAuthenticated(isAdmin);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (auth.login(password)) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Acceso de Administrador
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ingresa la contraseña para acceder al panel de administración
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingresa la contraseña"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Volver al inicio
            </button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              <strong>Contraseña por defecto:</strong> <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded font-mono">admin123</code>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 text-center mt-2">
              ⚠️ Deberás cambiar esta contraseña al acceder por primera vez
            </p>
          </div>

        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

