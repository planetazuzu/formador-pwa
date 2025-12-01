'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, FileText, Upload, X, Edit, Trash2, ExternalLink, Video, Image, File, Link as LinkIcon, Eye, Download } from 'lucide-react';
import { db, Resource } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';
import PdfViewer from '@/components/PdfViewer';
import VideoPlayer from '@/components/VideoPlayer';

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const fileType = file.type;
    let resourceType = 'other';
    
    if (fileType.includes('pdf')) resourceType = 'pdf';
    else if (fileType.startsWith('video/')) resourceType = 'video';
    else if (fileType.startsWith('image/')) resourceType = 'image';
    else if (fileType.includes('document') || fileType.includes('word') || fileType.includes('excel')) resourceType = 'document';

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo es 50MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          // Crear data URL para usar como URL
          const dataUrl = base64Data;

          // Actualizar formulario con los datos del archivo
          setFormData({
            title: file.name.replace(/\.[^/.]+$/, ''), // Nombre sin extensión
            type: resourceType,
            url: dataUrl,
            description: `Archivo subido: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
          });

          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
          }, 1000);
        } catch (error) {
          console.error('Error procesando archivo:', error);
          alert('Error al procesar el archivo.');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        alert('Error al leer el archivo.');
        setUploading(false);
        setUploadProgress(0);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePreview = (resource: Resource) => {
    setPreviewResource(resource);
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      const resourcesToImport = Array.isArray(data) ? data : [data];
      
      let imported = 0;
      let errors = 0;

      for (const resourceData of resourcesToImport) {
        try {
          const resourceId = `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = Date.now();

          const resource: Resource = {
            resourceId,
            title: resourceData.title || 'Recurso sin título',
            type: resourceData.type || 'other',
            url: resourceData.url || '',
            metadata: resourceData.metadata || {},
            createdAt: resourceData.createdAt || now,
            updatedAt: now,
          };

          await db.resources.add(resource);
          imported++;
        } catch (error) {
          console.error('Error importando recurso:', error);
          errors++;
        }
      }

      alert(`Importación completada: ${imported} recursos importados${errors > 0 ? `, ${errors} errores` : ''}`);
      setShowImportModal(false);
      setImportData('');
      loadResources();
    } catch (error) {
      alert('Error al importar. Verifica que el JSON sea válido.');
      console.error('Error importando:', error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(resources, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recursos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowImportModal(true)}
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
                    onClick={() => handlePreview(resource)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
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
                  URL o subir archivo *
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    required={!uploading && !formData.url.startsWith('data:')}
                    value={formData.url.startsWith('data:') ? 'Archivo subido ✓' : formData.url}
                    onChange={(e) => {
                      if (!e.target.value.startsWith('data:')) {
                        setFormData({ ...formData, url: e.target.value });
                      }
                    }}
                    disabled={formData.url.startsWith('data:')}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://ejemplo.com/recurso.pdf o sube un archivo"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.mp4,.webm,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Subiendo...' : 'Subir archivo'}
                    </button>
                    {formData.url.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, url: '' })}
                        className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {uploading && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Puede ser una URL externa o sube un archivo (máx. 50MB)
                  </p>
                </div>
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

      {/* Modal de vista previa */}
      {previewResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {previewResource.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {RESOURCE_TYPES.find(t => t.value === previewResource.type)?.label || previewResource.type}
                </p>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {previewResource.type === 'pdf' && (
                <div className="w-full" style={{ height: '70vh' }}>
                  <iframe
                    src={previewResource.url}
                    className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg"
                    title="PDF Viewer"
                  />
                </div>
              )}
              {previewResource.type === 'video' && (
                <VideoPlayer url={previewResource.url} title={previewResource.title} />
              )}
              {previewResource.type === 'image' && (
                <div className="flex justify-center">
                  <img
                    src={previewResource.url}
                    alt={previewResource.title}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              {(previewResource.type === 'link' || previewResource.type === 'document' || previewResource.type === 'other') && (
                <div className="text-center py-12">
                  <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Este tipo de recurso no tiene vista previa integrada
                  </p>
                  <a
                    href={previewResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir recurso
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de importar */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Importar Recursos
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  JSON de recursos
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                  placeholder='[{"title": "Recurso 1", "type": "pdf", "url": "https://..."}, ...]'
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Pega aquí el JSON con los recursos a importar. Debe ser un array de objetos con: title, type, url (opcional: metadata, description)
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

