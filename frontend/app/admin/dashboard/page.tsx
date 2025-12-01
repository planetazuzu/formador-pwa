'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import PasswordChangeModal from '@/components/PasswordChangeModal';

// Componentes simples inline
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
      variant === 'primary' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : ''
    }`}>
      {children}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    resources: 0,
    activities: 0,
    responses: 0,
    sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadStats();
    // Verificar si es la primera vez y la contraseña no ha sido cambiada
    const checkPasswordChanged = () => {
      if (!auth.isPasswordChanged()) {
        setShowPasswordModal(true);
      }
    };
    // Pequeño delay para asegurar que el componente está montado
    setTimeout(checkPasswordChanged, 100);
  }, []);

  const loadStats = async () => {
    try {
      const [resources, activities, sessions, responses] = await Promise.all([
        db.resources.count(),
        db.activities.count(),
        db.sessions.count(),
        db.responses.count(),
      ]);

      setStats({
        resources,
        activities,
        responses,
        sessions,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Recursos', value: stats.resources, icon: FileText, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Actividades', value: stats.activities, icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Respuestas', value: stats.responses, icon: MessageSquare, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Sesiones', value: stats.sessions, icon: Users, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  ];

  return (
    <div>
      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={() => {
            // No permitir cerrar si la contraseña no ha sido cambiada
            if (auth.isPasswordChanged()) {
              setShowPasswordModal(false);
            }
          }} 
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1.5 text-gray-600 dark:text-gray-400">
          Vista general de tu plataforma de formación
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Acciones rápidas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona tu contenido de forma eficiente
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Crear nueva actividad
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Diseña actividades interactivas para tus estudiantes
                </p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Ver estadísticas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analiza el rendimiento de tus actividades
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status */}
      <Card>
        <div className="flex items-center gap-3">
          <Badge variant="primary">Sistema activo</Badge>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tu plataforma está funcionando correctamente
          </p>
        </div>
      </Card>
    </div>
  );
}

