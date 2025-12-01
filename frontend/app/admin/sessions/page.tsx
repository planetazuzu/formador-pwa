'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, X } from 'lucide-react';
import { db, Session } from '@/lib/db';
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

export default function AdminSessions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activities: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Cargar sesiones
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      // Usar timeout para evitar bloqueos
      const allSessions = await Promise.race([
        db.sessions.toArray(),
        new Promise<Session[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(() => []);
      setSessions(allSessions);
    } catch (error) {
      console.error('Error cargando sesiones:', error);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sessionId = `session-${Date.now()}`;
      const now = Date.now();

      const newSession: Session = {
        sessionId,
        title: formData.title,
        activities: formData.activities,
        createdAt: now,
        updatedAt: now,
      };

      await db.sessions.add(newSession);

      // Actualizar estado local inmediatamente sin esperar recarga
      setSessions(prev => [...prev, newSession]);

      // Limpiar formulario y cerrar modal
      setFormData({ title: '', description: '', activities: [] });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creando sesión:', error);
      alert('Error al crear la sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
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
            Sesiones
          </h1>
          <p className="mt-1.5 text-gray-600 dark:text-gray-400">
            Organiza y gestiona sesiones de formación
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-1.5 text-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva sesión
        </button>
      </div>

      {/* Lista de sesiones */}
      {loadingSessions ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando sesiones...</p>
            </div>
          </div>
        </Card>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {session.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.activities.length} actividad(es)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(session.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay sesiones programadas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Crea sesiones de formación para organizar actividades y recursos. Las sesiones te permiten agrupar contenido relacionado y gestionar el acceso de los estudiantes.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Crear sesión
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para crear sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Crear Nueva Sesión
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
                  Título de la sesión *
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
                  rows={4}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Describe el contenido y objetivos de esta sesión..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actividades (IDs separados por comas)
                </label>
                <input
                  type="text"
                  value={formData.activities.join(', ')}
                  onChange={(e) => {
                    const activities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                    setFormData({ ...formData, activities });
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: activity-1, activity-2"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Puedes añadir las actividades más tarde
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
                  {loading ? 'Creando...' : 'Crear Sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

