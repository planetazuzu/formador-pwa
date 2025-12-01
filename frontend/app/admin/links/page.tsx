'use client';

import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, ExternalLink, X, Copy, Calendar } from 'lucide-react';
import { db, Link } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';

// Componentes simples inline
function Button({ children, size = 'md', className = '', ...props }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg'; className?: string; [key: string]: any }) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function AdminLinks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoadingLinks(true);
      const allLinks = await Promise.race([
        db.links.toArray(),
        new Promise<Link[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(() => []);
      setLinks(allLinks);
    } catch (error) {
      console.error('Error cargando enlaces:', error);
      setLinks([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const linkId = `link-${Date.now()}`;
      const now = Date.now();
      const expiresAt = formData.expiresAt ? new Date(formData.expiresAt).getTime() : undefined;

      const newLink: Link = {
        linkId,
        title: formData.title,
        url: formData.url,
        description: formData.description || undefined,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      await db.links.add(newLink);
      setLinks(prev => [...prev, newLink]);
      setFormData({ title: '', url: '', description: '', expiresAt: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creando enlace:', error);
      alert('Error al crear el enlace. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Enlace copiado al portapapeles');
  };

  const isExpired = (expiresAt?: number) => {
    if (!expiresAt) return false;
    return Date.now() > expiresAt;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <BackButton href="/admin/dashboard" className="mb-4" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Enlaces
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Gestiona enlaces compartidos y accesos rápidos
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-1.5 text-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo enlace
        </button>
      </div>

      {/* Lista de enlaces */}
      {loadingLinks ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando enlaces...</p>
            </div>
          </div>
        </Card>
      ) : links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <Card key={link.id} className={`hover:shadow-md transition-shadow ${isExpired(link.expiresAt) ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {link.description}
                    </p>
                  )}
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {link.url.length > 40 ? `${link.url.substring(0, 40)}...` : link.url}
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(link.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(link.url)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copiar enlace"
                >
                  <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              {isExpired(link.expiresAt) && (
                <div className="mt-2 text-xs text-red-500">
                  ⚠️ Enlace expirado
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay enlaces creados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Crea enlaces compartidos para actividades, recursos o sesiones. Los enlaces pueden tener configuraciones de acceso y expiración.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Crear enlace
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para crear enlace */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Crear Nuevo Enlace
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del enlace *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Actividad de React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://ejemplo.com/actividad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Descripción opcional del enlace..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de expiración (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  El enlace dejará de funcionar después de esta fecha
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

