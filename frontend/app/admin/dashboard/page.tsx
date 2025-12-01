'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Users,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Clock,
  Award,
  BarChart3,
  Calendar,
  Eye
} from 'lucide-react';
import { db, Activity as ActivityType, Response, Session } from '@/lib/db';
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

function Badge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'success' | 'warning' }) {
  const variants = {
    primary: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${variants[variant]}`}>
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
    completedResponses: 0,
    gradedResponses: 0,
    avgScore: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const [popularActivities, setPopularActivities] = useState<Array<{ activity: ActivityType; responseCount: number }>>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [responseTrend, setResponseTrend] = useState<Array<{ date: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const checkPasswordChanged = () => {
      if (!auth.isPasswordChanged()) {
        setShowPasswordModal(true);
      }
    };
    setTimeout(checkPasswordChanged, 100);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas básicas
      const [resources, activities, sessions, responses] = await Promise.all([
        db.resources.count(),
        db.activities.count(),
        db.sessions.count(),
        db.responses.toArray(),
      ]);

      // Calcular métricas de respuestas
      const completedResponses = responses.filter(r => r.status === 'completed' || r.status === 'graded').length;
      const gradedResponses = responses.filter(r => r.status === 'graded').length;
      const scoredResponses = responses.filter(r => r.score !== undefined);
      const avgScore = scoredResponses.length > 0
        ? Math.round(scoredResponses.reduce((sum, r) => sum + (r.score || 0), 0) / scoredResponses.length)
        : 0;

      // Cargar actividades recientes (últimas 5)
      const allActivities = await db.activities.orderBy('createdAt').reverse().limit(5).toArray();
      
      // Calcular actividades más populares (por número de respuestas)
      const activityResponseCounts = new Map<string, number>();
      responses.forEach(r => {
        const count = activityResponseCounts.get(r.activityId) || 0;
        activityResponseCounts.set(r.activityId, count + 1);
      });

      const popularActivitiesData = await Promise.all(
        Array.from(activityResponseCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(async ([activityId, count]) => {
            const activity = await db.activities.where('activityId').equals(activityId).first();
            return activity ? { activity, responseCount: count } : null;
          })
      );

      const popularActivitiesFiltered = popularActivitiesData.filter(item => item !== null) as Array<{ activity: ActivityType; responseCount: number }>;

      // Cargar sesiones recientes
      const recentSessionsData = await db.sessions.orderBy('createdAt').reverse().limit(3).toArray();

      // Calcular tendencia de respuestas (últimos 7 días)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentResponses = responses.filter(r => r.createdAt >= sevenDaysAgo);
      const trendMap = new Map<string, number>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        trendMap.set(dateStr, 0);
      }

      recentResponses.forEach(r => {
        const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
        const count = trendMap.get(dateStr) || 0;
        trendMap.set(dateStr, count + 1);
      });

      const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
        count,
      }));

      setStats({
        resources,
        activities,
        responses: responses.length,
        sessions,
        completedResponses,
        gradedResponses,
        avgScore,
      });
      setRecentActivities(allActivities);
      setPopularActivities(popularActivitiesFiltered);
      setRecentSessions(recentSessionsData);
      setResponseTrend(trendData);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Recursos', value: stats.resources, icon: FileText, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30', link: '/admin/resources' },
    { label: 'Actividades', value: stats.activities, icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', link: '/admin/activities' },
    { label: 'Respuestas', value: stats.responses, icon: MessageSquare, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', link: '/admin/responses' },
    { label: 'Sesiones', value: stats.sessions, icon: Users, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30', link: '/admin/sessions' },
  ];

  const maxTrendValue = Math.max(...responseTrend.map(t => t.count), 1);

  return (
    <div>
      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <PasswordChangeModal 
          onClose={() => {
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
              <Link key={stat.label} href={stat.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
              </Link>
            );
          })}
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '...' : stats.completedResponses}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Award className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calificadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '...' : stats.gradedResponses}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '...' : `${stats.avgScore}/100`}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de tendencia */}
      {responseTrend.length > 0 && (
        <Card className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Respuestas (últimos 7 días)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tendencias de actividad de los estudiantes
            </p>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {responseTrend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '180px' }}>
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-300 hover:bg-indigo-600"
                    style={{ 
                      height: `${(day.count / maxTrendValue) * 100}%`,
                      minHeight: day.count > 0 ? '4px' : '0',
                    }}
                    title={`${day.count} respuestas`}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {day.date}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {day.count}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Actividades recientes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Actividades Recientes
            </h2>
            <Link href="/admin/activities" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Cargando...
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/admin/activities`}
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No hay actividades aún
            </div>
          )}
        </Card>

        {/* Actividades más populares */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Actividades Más Populares
            </h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Cargando...
            </div>
          ) : popularActivities.length > 0 ? (
            <div className="space-y-3">
              {popularActivities.map((item, index) => (
                <div
                  key={item.activity.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.activity.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.responseCount} respuesta{item.responseCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No hay datos suficientes
            </div>
          )}
        </Card>
      </div>

      {/* Sesiones recientes */}
      {recentSessions.length > 0 && (
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Sesiones Recientes
            </h2>
            <Link href="/admin/sessions" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentSessions.map((session) => (
              <Link
                key={session.id}
                href="/admin/sessions"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1">
                    {session.title}
                  </h3>
                  <Users className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {session.activities.length} actividad(es)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(session.createdAt).toLocaleDateString('es-ES')}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Acciones Rápidas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona tu contenido de forma eficiente
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/activities?new=true">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Nueva Actividad
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/resources?new=true">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Nuevo Recurso
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/sessions?new=true">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Nueva Sesión
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/responses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Ver Respuestas
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="success">Sistema activo</Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tu plataforma está funcionando correctamente
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Última actualización: {new Date().toLocaleTimeString('es-ES')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
