'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { db, Activity } from '@/lib/db';
import Link from 'next/link';
import ActivityPlayer from '@/components/ActivityPlayer';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'primary', className = '' }: { children: React.ReactNode; variant?: 'primary'; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
      variant === 'primary' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : ''
    } ${className}`}>
      {children}
    </span>
  );
}

interface ActivityPageProps {
  params: {
    activityId: string;
  };
}

export default function ActivityPage({ params }: ActivityPageProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.activityId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const found = await db.activities.where('activityId').equals(params.activityId).first();
      setActivity(found || null);
    } catch (error) {
      console.error('Error cargando actividad:', error);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando actividad...</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Actividad no encontrada
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                La actividad que buscas no existe o ha sido eliminada.
              </p>
              <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <ActivityPlayer
          activityId={params.activityId}
          onComplete={(response) => {
            // Redirigir o mostrar mensaje de éxito
            console.log('Respuesta completada:', response);
          }}
        />
      </div>
    </main>
  );
}

