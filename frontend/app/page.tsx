'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Link as LinkIcon, 
  Users, 
  Settings,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { auth } from '@/lib/auth';

// Componentes simples inline para evitar problemas de importación
function Card({ children, className = '', hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
}

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

function DarkModeToggle() {
  return (
    <button 
      onClick={() => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark') ? 'true' : 'false');
      }}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  );
}

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAdmin(auth.isAdmin());
    setIsLoading(false);
  }, []);

  const quickLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { href: '/admin/resources', label: 'Recursos', icon: FileText, color: 'text-green-500' },
    { href: '/admin/activities', label: 'Actividades', icon: BookOpen, color: 'text-purple-500' },
    { href: '/admin/responses', label: 'Respuestas', icon: MessageSquare, color: 'text-yellow-500' },
    { href: '/admin/links', label: 'Enlaces', icon: LinkIcon, color: 'text-indigo-500' },
    { href: '/admin/sessions', label: 'Sesiones', icon: Users, color: 'text-pink-500' },
    { href: '/admin/settings', label: 'Configuración', icon: Settings, color: 'text-gray-500' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Formador PWA
            </span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Aplicación de formación progresiva</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Formador PWA
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Crea, gestiona y distribuye actividades de formación de manera profesional
          </p>
          <Link href="/admin/dashboard">
            <Button size="lg" className="gap-2">
              Acceder al Panel de Administración
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Quick Links Grid - Solo visible para administradores */}
        {!isLoading && isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group">
                  <Card hover className="h-full">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-200 ${link.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {link.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Gestiona {link.label.toLowerCase()} de forma eficiente
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mensaje para no administradores */}
        {!isLoading && !isAdmin && (
          <Card className="mb-12 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Acceso de Administrador Requerido
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Las funcionalidades de administración están disponibles solo para usuarios autorizados. 
                  Accede al panel de administración para gestionar recursos, actividades y sesiones.
                </p>
                <Link href="/admin/dashboard">
                  <Button className="gap-2">
                    Acceder como Administrador
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Explora las diferentes secciones del panel de administración para gestionar recursos, actividades y sesiones de formación.
              </p>
            </div>
            <Link href="/admin/dashboard">
              <button className="px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
                Comenzar
              </button>
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
