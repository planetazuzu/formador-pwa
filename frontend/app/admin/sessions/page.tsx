'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, X, Edit, Trash2, Eye } from 'lucide-react';
import { db, Session, Activity } from '@/lib/db';
import BackButton from '@/components/ui/BackButton';
import SessionBuilder from '@/components/SessionBuilder';

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
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [previewSession, setPreviewSession] = useState<Session | null>(null);

  // Cargar sesiones y actividades
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingSessions(true);
      const [allSessions, allActivities] = await Promise.all([
        db.sessions.toArray(),
        db.activities.toArray(),
      ]);
      setSessions(allSessions);
      setActivities(allActivities);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setSessions([]);
      setActivities([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSaveSession = async (sessionData: { title: string; activities: string[] }) => {
    setLoading(true);

    try {
      const now = Date.now();

      if (editingSession) {
        // Editar sesión existente
        const updatedSession: Session = {
          ...editingSession,
          title: sessionData.title,
          activities: sessionData.activities,
          updatedAt: now,
        };

        await db.sessions.update(editingSession.id!, updatedSession);
        setSessions(prev => prev.map(s => s.id === editingSession.id ? updatedSession : s));
      } else {
        // Crear nueva sesión
        const sessionId = `session-${Date.now()}`;
        const newSession: Session = {
          sessionId,
          title: sessionData.title,
          activities: sessionData.activities,
          createdAt: now,
          updatedAt: now,
        };

        await db.sessions.add(newSession);
        setSessions(prev => [...prev, newSession]);
      }

      setIsModalOpen(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error guardando sesión:', error);
      alert('Error al guardar la sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (session: Session) => {
    if (!confirm(`¿Estás seguro de eliminar la sesión "${session.title}"?`)) {
      return;
    }

    try {
      await db.sessions.delete(session.id!);
      setSessions(prev => prev.filter(s => s.id !== session.id));
    } catch (error) {
      console.error('Error eliminando sesión:', error);
      alert('Error al eliminar la sesión.');
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const getActivityTitle = (activityId: string) => {
    const activity = activities.find(a => a.activityId === activityId);
    return activity?.title || activityId;
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
          onClick={() => {
            setEditingSession(null);
            setIsModalOpen(true);
          }}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {session.activities.length} actividad(es)
                  </p>
                  {session.activities.length > 0 && (
                    <div className="space-y-1">
                      {session.activities.slice(0, 3).map((activityId, index) => (
                        <p key={activityId} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {index + 1}. {getActivityTitle(activityId)}
                        </p>
                      ))}
                      {session.activities.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          +{session.activities.length - 3} más...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(session.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewSession(session)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditSession(session)}
                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

      {/* Modal para crear/editar sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingSession ? 'Editar Sesión' : 'Crear Nueva Sesión'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSession(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <SessionBuilder
                initialTitle={editingSession?.title || ''}
                initialActivities={editingSession?.activities || []}
                onSave={handleSaveSession}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingSession(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa */}
      {previewSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {previewSession.title}
              </h2>
              <button
                onClick={() => setPreviewSession(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de creación
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(previewSession.createdAt).toLocaleString('es-ES')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actividades ({previewSession.activities.length})
                </label>
                {previewSession.activities.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No hay actividades en esta sesión</p>
                ) : (
                  <div className="space-y-2">
                    {previewSession.activities.map((activityId, index) => (
                      <div
                        key={activityId}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                          {getActivityTitle(activityId)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

