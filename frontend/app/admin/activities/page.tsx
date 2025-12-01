'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Sparkles, X, Edit, Trash2, Eye, Play } from 'lucide-react';
import { db, Activity } from '@/lib/db';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import MarkdownEditor from '@/components/MarkdownEditor';

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

export default function AdminActivities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);
      const allActivities = await Promise.race([
        db.activities.toArray(),
        new Promise<Activity[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(() => []);
      setActivities(allActivities);
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activityId = `activity-${Date.now()}`;
      const now = Date.now();

      // Estructura básica de contenido de actividad
      const activityContent = {
        description: formData.description || undefined,
        sections: formData.content ? [
          {
            type: 'text',
            content: formData.content,
          }
        ] : [],
      };

      const activityData: Activity = {
        activityId,
        title: formData.title,
        content: activityContent,
        createdAt: now,
        updatedAt: now,
      };

      if (editingActivity && editingActivity.id) {
        // Editar actividad existente
        await db.activities.update(editingActivity.id, {
          ...activityData,
          activityId: editingActivity.activityId,
          updatedAt: now,
        });
        setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...activityData, id: editingActivity.id, activityId: editingActivity.activityId } : a));
      } else {
        // Crear nueva actividad
        await db.activities.add(activityData);
        setActivities(prev => [...prev, activityData]);
      }

      setFormData({ title: '', description: '', content: '' });
      setEditingActivity(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error guardando actividad:', error);
      alert('Error al guardar la actividad. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    const content = activity.content as any;
    setFormData({
      title: activity.title,
      description: content?.description || '',
      content: content?.sections?.[0]?.content || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (activity: Activity) => {
    if (!confirm(`¿Estás seguro de eliminar "${activity.title}"?`)) return;

    try {
      if (activity.id) {
        await db.activities.delete(activity.id);
        setActivities(prev => prev.filter(a => a.id !== activity.id));
      }
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      alert('Error al eliminar la actividad.');
    }
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
            Actividades
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Crea y gestiona actividades de formación
          </p>
        </div>
        <Button 
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditingActivity(null);
            setFormData({ title: '', description: '', content: '' });
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Nueva actividad
        </Button>
      </div>

      {/* Lista de actividades */}
      {loadingActivities ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando actividades...</p>
            </div>
          </div>
        </Card>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const content = activity.content as any;
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {activity.title}
                      </h3>
                      {content?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {content.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/a/${activity.activityId}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Ver actividad pública"
                    >
                      <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <button
                      onClick={() => handleEdit(activity)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(activity)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Crea tu primera actividad
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Diseña actividades interactivas y atractivas para tus estudiantes. Combina diferentes tipos de contenido para crear experiencias de aprendizaje únicas.
            </p>
            <Button 
              onClick={() => {
                setEditingActivity(null);
                setFormData({ title: '', description: '', content: '' });
                setIsModalOpen(true);
              }}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Crear actividad
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para crear/editar actividad */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingActivity ? 'Editar Actividad' : 'Crear Nueva Actividad'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingActivity(null);
                  setFormData({ title: '', description: '', content: '' });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título de la actividad *
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
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Descripción de la actividad..."
                />
              </div>

              <div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Escribe el contenido de la actividad aquí usando Markdown. Ejemplos: **negrita**, *cursiva*, `código`, # Título, - Lista"
                    label="Contenido de la actividad"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingActivity(null);
                    setFormData({ title: '', description: '', content: '' });
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
                  {loading ? 'Guardando...' : editingActivity ? 'Guardar Cambios' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

