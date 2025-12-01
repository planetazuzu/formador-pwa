'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Upload, X, Edit, Trash2, ExternalLink, Video, Image, File, Link as LinkIcon } from 'lucide-react';
import { db, Resource } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';

// Componentes simples inline
function Button({ children, size = 'md', variant = 'primary', className = '', ...props }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg'; variant?: 'primary' | 'outline'; className?: string; [key: string]: any }) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
  };
  return (
    <button className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
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

const RESOURCE_TYPES = [
  { value: 'pdf', label: 'PDF', icon: File, color: 'text-red-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'text-purple-500' },
  { value: 'image', label: 'Imagen', icon: Image, color: 'text-blue-500' },
  { value: 'link', label: 'Enlace', icon: LinkIcon, color: 'text-green-500' },
  { value: 'document', label: 'Documento', icon: FileText, color: 'text-gray-500' },
  { value: 'other', label: 'Otro', icon: File, color: 'text-gray-400' },
];

export default function AdminResources() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf',
    url: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoadingResources(true);
      const allResources = await Promise.race([
        db.resources.toArray(),
        new Promise<Resource[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(() => []);
      setResources(allResources);
    } catch (error) {
      console.error('Error cargando recursos:', error);
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resourceId = `resource-${Date.now()}`;
      const now = Date.now();

      const resourceData: Resource = {
        resourceId,
        title: formData.title,
        type: formData.type,
        url: formData.url,
        metadata: {
          description: formData.description || undefined,
        },
        createdAt: now,
        updatedAt: now,
      };

      if (editingResource && editingResource.id) {
        // Editar recurso existente
        await db.resources.update(editingResource.id, {
          ...resourceData,
          resourceId: editingResource.resourceId,
          updatedAt: now,
        });
        setResources(prev => prev.map(r => r.id === editingResource.id ? { ...resourceData, id: editingResource.id, resourceId: editingResource.resourceId } : r));
      } else {
        // Crear nuevo recurso
        await db.resources.add(resourceData);
        setResources(prev => [...prev, resourceData]);
      }

      setFormData({ title: '', type: 'pdf', url: '', description: '' });
      setEditingResource(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error guardando recurso:', error);
      alert('Error al guardar el recurso. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      type: resource.type,
      url: resource.url,
      description: resource.metadata?.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`¿Estás seguro de eliminar "${resource.title}"?`)) return;

    try {
      if (resource.id) {
        await db.resources.delete(resource.id);
        setResources(prev => prev.filter(r => r.id !== resource.id));
      }
    } catch (error) {
      console.error('Error eliminando recurso:', error);
      alert('Error al eliminar el recurso.');
    }
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = RESOURCE_TYPES.find(t => t.value === type) || RESOURCE_TYPES[RESOURCE_TYPES.length - 1];
    const Icon = typeInfo.icon;
    return <Icon className={`w-5 h-5 ${typeInfo.color}`} />;
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
            Recursos
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Gestiona tus recursos educativos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => alert('Función de importar próximamente')}
          >
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button 
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingResource(null);
              setFormData({ title: '', type: 'pdf', url: '', description: '' });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Nuevo recurso
          </Button>
        </div>
      </div>

      {/* Lista de recursos */}
      {loadingResources ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando recursos...</p>
            </div>
          </div>
        </Card>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {getTypeIcon(resource.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {RESOURCE_TYPES.find(t => t.value === resource.type)?.label || resource.type}
                    </p>
                  </div>
                </div>
              </div>
              
              {resource.metadata?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {resource.metadata.description}
                </p>
              )}

              {resource.url && (
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  {resource.url.length > 40 ? `${resource.url.substring(0, 40)}...` : resource.url}
                </a>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(resource.createdAt).toLocaleDateString('es-ES')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay recursos aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Comienza creando tu primer recurso educativo. Puedes subir documentos, videos, imágenes y más.
            </p>
            <Button 
              onClick={() => {
                setEditingResource(null);
                setFormData({ title: '', type: 'pdf', url: '', description: '' });
                setIsModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear primer recurso
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para crear/editar recurso */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingResource ? 'Editar Recurso' : 'Crear Nuevo Recurso'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingResource(null);
                  setFormData({ title: '', type: 'pdf', url: '', description: '' });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del recurso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Introducción a React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de recurso *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {RESOURCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL o ruta del recurso *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://ejemplo.com/recurso.pdf o /ruta/local"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Puede ser una URL externa o una ruta local al archivo
                </p>
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
                  placeholder="Descripción opcional del recurso..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingResource(null);
                    setFormData({ title: '', type: 'pdf', url: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : editingResource ? 'Guardar Cambios' : 'Crear Recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

